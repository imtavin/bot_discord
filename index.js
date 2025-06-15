require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { DisTube } = require('distube');
const { SpotifyPlugin } = require('@distube/spotify');
const { SoundCloudPlugin } = require('@distube/soundcloud');
const { YtDlpPlugin } = require('@distube/yt-dlp');
const { getVoiceConnection } = require('@discordjs/voice');
const chalk = require('chalk');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

const distube = new DisTube(client, {
  emitNewSongOnly: true,
  plugins: [
    new SpotifyPlugin(),
    new SoundCloudPlugin(),
    new YtDlpPlugin()
  ]
});

client.once('ready', () => {
  console.log(chalk.greenBright(`✅ Bot conectado como ${client.user.tag}`));
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;

  const [cmd, ...args] = message.content.trim().split(/\s+/);
  const urlOrSearch = args.join(' ');

  try {
    switch (cmd.toLowerCase()) {
      case '!play':
        if (!urlOrSearch) return message.reply('Use `!play <nome ou link da música/playlist>`');
        const channel = message.member.voice.channel;
        if (!channel) return message.reply('Você precisa estar em um canal de voz!');
        console.log(chalk.blue(`[LOG] Tocando: ${urlOrSearch}`));
        distube.play(channel, urlOrSearch, {
          textChannel: message.channel,
          member: message.member,
        });
        break;

      case '!skip':
        const queueSkip = distube.getQueue(message);
        if (!queueSkip || queueSkip.songs.length <= 1) {
          return message.reply('⚠️ Não há próxima música para pular.');
        }
        await distube.skip(message);
        message.reply('⏭️ Pulando para a próxima música.');
        break;

      case '!stop':
        distube.stop(message);
        message.reply('⏹️ Música parada.');
        break;

      case '!pause':
        distube.pause(message);
        message.reply('⏸️ Música pausada.');
        break;

      case '!resume':
        distube.resume(message);
        message.reply('▶️ Música retomada.');
        break;

      case '!queue':
        const queue = distube.getQueue(message);
        if (!queue || !queue.songs.length) {
          return message.reply('📭 A fila está vazia.');
        }

        const current = queue.songs[0];
        const upcoming = queue.songs.slice(1).map((s, i) => `**${i + 1}.** ${s.name} \`[${s.formattedDuration}]\``).join('\n') || '*Nenhuma música na sequência*';

        message.reply({
          content:
            `🎵 **Tocando agora:**\n` +
            `> 🎶 ${current.name} \`[${current.formattedDuration}]\`\n\n` +
            `📃 **Próximas músicas:**\n${upcoming}`
        });
        break;

      case '!loop':
        const mode = distube.setRepeatMode(message, parseInt(args[0]) || 0);
        message.reply(`🔁 Modo repetição: ${mode === 0 ? 'Desligado' : mode === 1 ? 'Uma música' : 'Fila completa'}`);
        break;

      case '!leave':
        const connection = getVoiceConnection(message.guild.id);
        if (connection) {
          connection.destroy();
          message.reply('🚪 Saí do canal de voz.');
          console.log(chalk.yellow('[LOG] Saiu do canal de voz.'));
        } else {
          message.reply('⚠️ Não estou conectado a um canal de voz.');
        }
        break;

      case '!help':
        message.reply({
          content:
            `🤖 **Comandos do bot de música:**\n\n` +
            `🎶 \`!play <nome/link>\` - Toca uma música do YouTube, Spotify ou SoundCloud\n` +
            `⏭️ \`!skip\` - Pula para a próxima música\n` +
            `⏹️ \`!stop\` - Para e limpa a fila\n` +
            `⏸️ \`!pause\` - Pausa a música\n` +
            `▶️ \`!resume\` - Retoma a música\n` +
            `📃 \`!queue\` - Mostra a fila atual\n` +
            `🔁 \`!loop <0/1/2>\` - Define o loop: 0 = desliga, 1 = uma música, 2 = fila\n` +
            `🚪 \`!leave\` - Sai do canal de voz\n` +
            `🆘 \`!help\` - Mostra esta ajuda`
        });
        break;
    }
  } catch (error) {
    console.error(chalk.red('[ERRO]'), error);
    message.reply('❌ Ocorreu um erro ao executar o comando.');
  }
});

// Eventos para log e feedback
distube
  .on('playSong', (queue, song) => {
    console.log(chalk.green(`[🎵 Tocando] ${song.name}`));
    queue.textChannel.send(`🎶 Tocando agora: **${song.name}** \`[${song.formattedDuration}]\``);
  })
  .on('addSong', (queue, song) => {
    console.log(chalk.cyan(`[+ Música] ${song.name}`));
    queue.textChannel.send(`✅ Adicionado à fila: **${song.name}** \`[${song.formattedDuration}]\``);
  })
  .on('addList', (queue, playlist) => {
    console.log(chalk.magenta(`[+ Playlist] ${playlist.name} (${playlist.songs.length} músicas)`));
    queue.textChannel.send(`📜 Playlist adicionada: **${playlist.name}** (${playlist.songs.length} músicas)`);
  })
  .on('error', (channel, error) => {
    console.error(chalk.red('[DisTube ERRO]'), error);
    if (channel) channel.send(`❌ Ocorreu um erro: ${error.message}`);
  })
  .on('finish', (queue) => {
    const connection = getVoiceConnection(queue.guild.id);
    if (connection) connection.destroy();
    console.log(chalk.yellow('[LOG] Fila finalizada e desconectado.'));
    queue.textChannel.send('✅ Fila finalizada.');
  });

client.login(process.env.TOKEN);
