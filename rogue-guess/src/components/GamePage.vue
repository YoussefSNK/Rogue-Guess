<template>
    <div id="background" ref="background"></div>
    <div class="container">
        <div class="theme" id="theme"></div>
        <div class="turn-info" id="turn-info"></div>
        <div class="timer" id="timer"></div>
        <div class="center">
            <label for="game-input" class="sr-only">Entrer un texte :</label>
            <input
                type="text"
                id="game-input"
                placeholder="..."
                v-model="inputText"
                @input="handleInput"
                @keydown="handleKeyDown"
                :disabled="inputDisabled"
            >
        </div>
        <div class="player-list" id="player-list">
            <div>
                <h2>Joueurs en vie</h2>
                <ul>
                    <li v-for="player in alivePlayers" :key="player.name">
                        <img :src="player.avatar" alt="Avatar" /> {{ player.name }}
                    </li>
                </ul>
            </div>
            <div>
                <h2>Joueurs morts</h2>
                <ul>
                    <li v-for="player in deadPlayers" :key="player.name">
                        <img :src="player.avatar" alt="Avatar" /> {{ player.name }}
                    </li>
                </ul>
            </div>
        </div>
        <div class="player-list" id="player-list"></div>
    </div>
    <div class="victory-message" id="victory-message">
        <div id="victory-username"></div>
        <div id="winners-container" class="winners-container"></div>
    </div>
    <div class="losers-container" id="losers-container"></div>
</template>

<script>
export default {
  data() {
    return {
      alivePlayers: [], // Liste des joueurs en vie
      deadPlayers: [], // Liste des joueurs morts
      inputText: '',
      inputDisabled: true
    };
  },
  mounted() {
    this.$socket.addEventListener('message', this.handleSocketMessage);
    this.$socket.send(JSON.stringify({ type: 'player_arrived', message: 'Player has arrived' }));
  },
  methods: {
    handleSocketMessage(event) {
      const data = JSON.parse(event.data);
      console.log(data);

      switch (data.type) {
        case 'request_game_users':
          this.alivePlayers = data.alivePlayers;
          break;

        case 'text_update':
          console.log(data.message);
          this.inputText = data.message;
          break;

        case 'your_turn':
          console.log('your_turn');
          this.handleYourTurn();
          break;
        case 'not_your_turn':
          console.log('not_your_turn');
          this.handleNotYourTurn();
          break;
        case 'good_answer':
          this.addBackgroundImage(data.entity);
          break;
        default:
          console.warn(`Unknown message type: ${data.type}`);
          break;
      }
    },
    handleInput(event) {
      if (this.currentPlayer === this.username) {
        this.$socket.send(JSON.stringify({
          type: 'text_update',
          text: event.target.value,
        }));
      }
    },
    handleKeyDown(event) {
      if (event.key === 'Enter') {
        this.$socket.send(JSON.stringify({
          type: 'send_answer',
          text: event.target.value,
        }));
      }
    },
    handleYourTurn() {
      this.inputDisabled = false;
    },
    handleNotYourTurn() {
      this.inputDisabled = true;
    },
    /* eslint-disable */
    addBackgroundImage(text) {  
      const img = document.createElement('img');
      img.src = require(`@/assets/images/entity/${text}.png`);  // Utilisation de Webpack pour gérer les assets
      img.classList.add('background-image');
      this.$refs.background.appendChild(img);
    }

  },
  beforeUnmount() {
    this.$socket.removeEventListener('message', this.handleSocketMessage);
    this.$socket.off('request_game_users');
  }
};
</script>

<style>
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
}

#background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1; /* Derrière tout le reste */
    display: grid;
    grid-template-columns: repeat(auto-fill, 100px); /* Ajustez la taille de la colonne si nécessaire */
    grid-auto-rows: 100px; /* Ajustez la hauteur de la ligne si nécessaire */
}

.background-image {
    width: 100%;
    height: 100%;
    opacity: 0.5; /* Transparence pour voir les autres images */
    transition: opacity 0.5s ease-in-out;
}

.background-image:hover {
    opacity: 1; /* Pleine opacité au survol */
}

</style>
