<template>
    <div class="roomPage">
        <div class="container">
            <div class="red" id="image-container">
              <ImageCard
                v-for="(image, index) in images"
                :key="index"
                :title="image.Title"
                :imageSrc="getImageSrc(image.Image)"
                @image-clicked="handleImageClick"
              />
            </div>
            <div class="green">Logs</div>
            <div class="blue">
                <div class="chat-container">
                    <div class="messages" id="messages"></div>
                    <form id="message-form" @submit.prevent="sendMessage">
                        <label for="message-input"></label>
                        <input type="text" id="message-input" v-model="currentMessage" placeholder="Entrez votre message...">
                        <button type="submit">Envoyer</button>
                    </form>
                </div>
            </div>
            <div class="yellow">
                <div id="firstPlayer"></div>
                <div id="otherPlayers" class="playerList"></div>
            </div>
        </div>
    </div>
</template>

<script>
import ImageCard from '@/components/RoomPageImageCard.vue';

export default {
  name: 'RoomPage',
  components: {
    ImageCard
  },
  props: {
    gameCode: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      images: [],
      messages: [],
      players: [], // Mise à jour pour stocker la liste des joueurs
      currentMessage: ''
    };
  },
  mounted() {
    this.$socket.addEventListener('message', this.handleSocketMessage);
    this.$socket.send(JSON.stringify({ type: 'ask_players', gameCode: this.gameCode }));
    this.loadListImages();
  },
  methods: {
    handleSocketMessage(event) {
      const data = JSON.parse(event.data);
      if (data.type === 'chat_message') {
        this.addMessageToUI(data.message);
      } else if (data.type === 'asked_players') {
        this.players = data.players;
        this.displayPlayers();
      } else if (data.type === 'game_start') {
        const gameCode = encodeURIComponent(data.gameCode);
        this.$router.push({ name: 'Game', params: { gameCode } });
      }
    },
    addMessageToUI(msg) {
      const messages = document.getElementById('messages');
      const messageElement = document.createElement('div');
      messageElement.classList.add('message');
      messageElement.innerHTML = `
        <img src="${msg.avatar}" alt="Avatar" class="avatar"> 
        <span>${msg.username}: ${msg.message}</span>`;
      messages.appendChild(messageElement);
      messages.scrollTop = messages.scrollHeight;
    },
    sendMessage() {
      if (this.currentMessage.trim() !== '') {
        const messageData = {
          type: 'chat_message',
          message: {
            message: this.currentMessage
          }
        };
        this.$socket.send(JSON.stringify(messageData));
        this.currentMessage = '';
      }
    },
    displayPlayers() {
      const firstPlayerDiv = document.getElementById('firstPlayer');
      const otherPlayersDiv = document.getElementById('otherPlayers');

      firstPlayerDiv.innerHTML = '';
      otherPlayersDiv.innerHTML = '';

      if (this.players && this.players.length > 0) {
        const firstUser = this.players[0];
        const firstPlayerElement = document.createElement('div');
        firstPlayerElement.classList.add('player');
        firstPlayerElement.innerHTML = `
          <img src="${firstUser.avatar}" alt="Avatar">
          <div>${firstUser.username}</div>`;
        firstPlayerDiv.appendChild(firstPlayerElement);

        const otherUsers = this.players.slice(1);
        otherUsers.forEach(user => {
          const playerElement = document.createElement('div');
          playerElement.classList.add('player');
          playerElement.innerHTML = `
            <img src="${user.avatar}" alt="Avatar">
            <div>${user.username}</div>`;
          otherPlayersDiv.appendChild(playerElement);
        });
      }
    },
    loadListImages() {
      fetch('http://localhost:3000/api/requests')
        .then(response => response.json())
        .then(images => {
          this.images = images; // Mettre à jour les images reçues de l'API
        })
        .catch(error => console.error('Erreur lors du chargement des images:', error));
    },
    getImageSrc(imageFileName) {
      /* eslint-disable import/no-dynamic-require */
      /* eslint-disable global-require */
      return require(`@/assets/images/list_icons/${imageFileName}`);
      /* eslint-enable import/no-dynamic-require */
      /* eslint-enable global-require */
    },
    handleImageClick(title) {
      this.$socket.send(JSON.stringify({
        type: 'start_game',
        title
      }));
      console.log(`Image clicked: ${title}`);
    }
  },
  beforeUnmount() {
    this.$socket.removeEventListener('message', this.handleSocketMessage);
  }
};
</script>

<style scoped>
.roomPage {
    margin: 0;
    padding: 0;
    font-family: 'Roboto', sans-serif;
    background-color: #2c3e50;
    color: #ecf0f1;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    animation: fadeInUp 0.5s ease-out;
    overflow: hidden
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(150px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.chat-container {
    display: flex;
    flex-direction: column;
    flex: 1;
    background-color: #34495e;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.messages {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
}

#message-form {
    display: flex;
    padding: 10px;
    background-color: #2c3e50;
    border-top: 1px solid #34495e;
}

#message-input {
    flex: 1;
    padding: 10px;
    border: none;
    border-radius: 20px;
    margin-right: 10px;
    font-size: 14px;
}

#message-input:focus {
    outline: none;
}

#message-form button {
    padding: 10px 20px;
    border: none;
    border-radius: 20px;
    background-color: #1abc9c;
    color: #ffffff;
    font-size: 14px;
    cursor: pointer;
}

#message-form button:hover {
    background-color: #16a085;
}

:deep(.message) {
    display: flex;
    align-items: flex-start;
    margin-bottom: 20px;
}

:deep(.message:last-child) {
    margin-bottom: 0;
}

:deep(.message .avatar) {
    width: 40px;
    height: 40px;
    border-radius: 10%;
    margin-right: 15px;
}

:deep(.message .message-content) {
    background-color: #1abc9c;
    color: #ffffff;
    padding: 10px 15px;
    border-radius: 20px;
    max-width: 70%;
    word-wrap: break-word;
    font-size: 14px;
}

/* Personnalisation de la barre de défilement */
.messages::-webkit-scrollbar {
    width: 8px;
}

.messages::-webkit-scrollbar-thumb {
    background-color: #1abc9c;
    border-radius: 4px;
}

.messages::-webkit-scrollbar-track {
    background-color: #34495e;
}

.roomPage {
    margin: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #000000;
}

:deep(.container) {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr;
    gap: 10px;
    width: 90%;
    height: 90%;
}

:deep(.red) {
    overflow: hidden;
    grid-column: 1 / 4;
    grid-row: 1 / 3;
    background-color: #34495e;
    padding: 20px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); /* Utilise auto-fill pour remplir l'espace */
    gap: 20px; /* Espacement entre les éléments */
    justify-items: center; /* Centre les éléments horizontalement */
    align-items: flex-start; /* Aligne les éléments en haut */
    border-radius: 15px; /* Arrondit les coins de la grille */
}

:deep(.red .image-card) {
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 10px;
    background-color: #979797;
    border-radius: 10px; /* Arrondit les coins de chaque carte */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    width: 100%; /* Force la carte à remplir l'espace disponible */
}

:deep(.red .image-card img) {
    max-width: 100px;
    max-height: 100px;
    border-radius: 8px;
    transition: transform 0.2s ease-in-out;
}

:deep(.red .image-container img:hover) {transform: scale(1.1);}

:deep(.red .image-container h3) {
    font-size: 14px;
    margin-top: 10px;
    text-align: center;
    width: 100%; /* Limite la largeur du titre */
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap; /* Empêche le débordement de texte */
}

.green {
    grid-column: 1 / 1;
    grid-row: 3 / 3;
    background-color: green;
}

.blue {
    grid-column: 2 / 4;
    grid-row: 3 / 3;
    display: flex;
    width: 100%;
    height: 100%;
    padding: 5px;
    box-sizing: border-box;
    max-width: 100%; /* Fixe la largeur maximale */
    max-height: 100%; /* Fixe la hauteur maximale */
    min-width: 0; /* Permet de ne pas dépasser la largeur de son conteneur */
    min-height: 0; /* Permet de ne pas dépasser la hauteur de son conteneur */
    flex-shrink: 0; /* Empêche de réduire la taille de la div */
}

:deep(.yellow) {
    grid-column: 4 / 4;
    grid-row: 1 / 4;
    /* background-color: #f1c40f; */
    background-color: #2c3e50;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow-y: auto;
    padding: 20px;
    box-sizing: border-box;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.playerList {
    width: 100%;
}

:deep(.player) {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 10px;
    transition: transform 0.3s, box-shadow 0.3s;
    border-radius: 15%;
}

:deep(.player img) {
    border-radius: 15%;
    margin-bottom: 5px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

:deep(.player div) {
    text-align: center;
    color: #f1c40f;
    font-weight: bold;
    border-radius: 15%;
}

:deep(.player:hover) {
    transform: translateY(-5px);
    background-color: #3E5771;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

:deep(#firstPlayer) {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    margin-bottom: 20px;
    width: 100%;
}

:deep(#firstPlayer img) {
    width: 90%;
    height: auto;
    border-radius: 15%;
    margin-bottom: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

:deep(#otherPlayers) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    width: 100%;
}

:deep(#otherPlayers .player img) {
    width: 100%;
    height: auto;
}

</style>
