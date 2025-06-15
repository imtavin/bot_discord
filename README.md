# Bot de Música para Discord
Um bot de Discord com suporte a músicas do YouTube, Spotify e SoundCloud, desenvolvido com Discord.js v14 e DisTube.

# ✨ Recursos
Reprodução de links e buscas do YouTube
Suporte a músicas e playlists do Spotify
Suporte a SoundCloud
Fila de músicas
Comandos como play, skip, stop, pause, resume, queue, loop e leave

# 🪧 Requisitos
Node.js v16+ (preferîncialmente LTS)
Conta no Discord
Um bot criado no Discord Developer Portal

# ⚖️ Instalação
Clone o repositório
https://github.com/seu-usuario/seu-repositorio.git
cd seu-repositorio

Instale as dependências
npm install

Crie um arquivo .env e insira seu token:
TOKEN=seu_token_aqui

# 🔧 Execução
node index.js

# ⚙️ Comandos Disponíveis

!play <link ou nome>    Toca uma música do YouTube, Spotify ou SoundCloud
!skip                  Pula a música atual
!stop                  Para e limpa a fila
!pause                 Pausa a música
!resume                Retoma a reprodução
!queue                 Mostra a fila de músicas
!loop [0|1|2]          Define o modo de loop: 0 = off, 1 = música, 2 = fila
!leave                 Sai do canal de voz

# 🎓 Tecnologias Utilizadas

discord.js
DisTube
yt-dlp (via plugin do DisTube)
Spotify Plugin
