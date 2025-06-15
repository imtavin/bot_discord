require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { DisTube } = require('distube');
const { SpotifyPlugin } = require('@distube/spotify');
const { YtDlpPlugin } = require('@distube/yt-dlp');
const { SoundCloudPlugin } = require('@distube/soundcloud');
const { getVoiceConnection } = require('@discordjs/voice');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const distube = new DisTube(client, {
  emitNewSongOnly: true,
  plugins: [
    new SpotifyPlugin(),
    new YtDlpPlugin(),
    new SoundCloudPlugin()
  ]
});

client.once('ready', () => {
  console.log(`Bot pronto como ${client.user.tag}`);
});

// Comandos simples via mensagem:
client.on('messageCreate', async message => {
  if (message.author.bot || !message.guild) return;
  const [cmd, ...args] = message.content.trim().split(/\s+/);
  const urlOrSearch = args.join(' ');

  switch (cmd.toLowerCase()) {
    case '!play':
      if (!urlOrSearch) return message.reply('Use `!play <YouTube/Spotify URL ou busca>`');
      let channel = message.member.voice.channel;
      if (!channel) return message.reply('Você precisa estar em um canal de voz!');
      distube.play(channel, urlOrSearch, { textChannel: message.channel, member: message.member });
      break;

    case '!skip':
      distube.skip(message);
      break;
    case '!stop':
      distube.stop(message);
      break;
    case '!pause':
      distube.pause(message);
      break;
    case '!resume':
      distube.resume(message);
      break;
    case '!queue':
      distube.getQueue(message) ?
        message.reply('Fila atual:\n' + distube.getQueue(message).songs.map((s,i)=> `${i+1}. ${s.name}`).join('\n')) :
        message.reply('Não há fila no momento.');
      break;
    case '!loop':
      let mode = distube.setRepeatMode(message, parseInt(args[0]));
      message.reply(`Loop definido para: ${mode === 0 ? 'Desligado' : mode === 1 ? 'Essa música' : 'Toda fila'}`);
          break;
    case '!leave':
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.reply('Você precisa estar em um canal de voz!');
        const connection = getVoiceConnection(message.guild.id);
        if (connection) {
            connection.destroy();
            message.reply('Saí do canal de voz!');
        } else {
            message.reply('Não estou conectado em nenhum canal de voz.');
        }
        break;
  }
});

// Eventos para informar no chat:
distube
  .on('playSong', (queue, song) =>
    queue.textChannel.send(`🎶 Tocando: **${song.name}** — \`${song.formattedDuration}\``)
  )
  .on('addSong', (queue, song) =>
    queue.textChannel.send(`✅ Adicionado: **${song.name}** • agora são ${queue.songs.length} músicas na fila.`)
  )
  .on('addList', (queue, playlist) =>
    queue.textChannel.send(`✅ Playlist adicionada: **${playlist.name}** — ${playlist.songs.length} músicas.`)
  )
  .on('error', (channel, error) =>
      channel.send(`❌ Ocorreu um erro: ${error.message}`)
)
.on('finish', queue => {
    const connection = getVoiceConnection(queue.guild.id);
    if (connection) connection.destroy();
});

client.login(process.env.TOKEN);
