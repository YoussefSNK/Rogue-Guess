<template>
    <div id="background" ref="background"></div>
    <div class="game-container">
        <div class="theme" id="theme"></div>
        <div class="turn-info" id="turn-info"></div>
        <div class="timer" id="timer"></div>
        <div class="center">
            <label for="game-input" class="sr-only"></label>
            <input
                type="text"
                id="game-input"
                placeholder="..."
                v-model="inputText"
                @input="handleInput"
                @keydown="handleKeyDown"
                :disabled="inputDisabled"
            >
            <div class="player-list" id="player-list"></div>
        </div>
        <div class="game-avatar-container" ref="avatarContainer">
            <img v-for="player in alivePlayers" :key="player.id" :src="player.avatar" class="circle-avatar" :style="getAvatarStyle(player)" alt="ca">
        </div>
    </div>
    <div class="losers-container" id="losers-container"></div>
</template>

<script>
export default {
  data() { /* eslint-disable */
    return {
      alivePlayers: [], // Liste des joueurs en vie
      deadPlayers: [], // Liste des joueurs morts
      inputText: '',
      inputDisabled: true,
      angleOffset: 0 // Décalage angulaire pour l'animation de rotation
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
          this.animateRotation(Math.PI * 2 / this.alivePlayers.length);
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
    animateRotation(rotationAngle) {
      const startAngle = this.angleOffset;
      const targetAngle = this.angleOffset - rotationAngle; //changer le - en + pour inverser le sens
      const duration = 250;
      const startTime = performance.now();

      const stepAnimation = (timestamp) => {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1); // Calculer le progrès de l'animation de 0 à 1
        this.angleOffset = startAngle + progress * (targetAngle - startAngle); // Interpolation linéaire
        this.$forceUpdate(); // Forcer la mise à jour pour appliquer la nouvelle rotation

        if (progress < 1) {
          requestAnimationFrame(stepAnimation); // Continuer l'animation tant que ce n'est pas terminé
        }
      };

      requestAnimationFrame(stepAnimation); // Démarrer l'animation
    },
    getAvatarStyle(player) {
      const container = this.$refs.avatarContainer;
      const center = { x: container.clientWidth / 2, y: container.clientHeight / 2 };
      const radius = 250;
      const angleStep = 2 * Math.PI / this.alivePlayers.length;
      const startAngle = -Math.PI / 2; // Commence à partir du haut au lieu du bas
      const index = this.alivePlayers.indexOf(player);

      const angle = startAngle - index * angleStep + this.angleOffset;
      const x = center.x + radius * Math.cos(angle);
      const y = center.y + radius * Math.sin(angle);

      return {
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        transform: `translate(-50%, -50%)`
      };
    },
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

.game-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100vw;
    position: relative;
    flex-direction: column;
    z-index: 1; /* Devant le fond */
}

.center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
}

.center input {
    display: block;
    margin: 0 auto;
}

#game-input {
    text-align: center;
    font-size: 24px;
    width: 100%;
    max-width: 500px;
}

.game-avatar-container {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 100%;
    transform: translate(-50%, -50%);
    pointer-events: none; /* Empêche les avatars d'interférer avec l'input */
}

.circle-avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    position: absolute;
    transition: transform 1s ease; /* Pour une rotation douce */
    pointer-events: auto; /* Permet l'interaction avec les avatars si nécessaire */
}

</style>
