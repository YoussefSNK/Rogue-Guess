<template>
    <div id="background" ref="background"></div>
    <div ref="confettiContainer" class="confetti-container"></div>
    <div class="theme" id="theme">{{ theme }}</div>
    <div class="timer" id="timer"></div>
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
          <img
            v-for="player in playersList"
            :key="player.id"
            v-show="player.state !== 'dead'"
            :src="player.avatar"
            class="circle-avatar"
            :style="getAvatarStyle(player)"
            alt="ca">
        </div>
    </div>

    <Transition name="slide-fade">
        <div v-if="gameEnded" class="end-screen">
            <h1>Fin de partie !</h1>
            <p>Écran pourri à changer</p>
            <div class="winner-list">
                <img v-for="winner in winners" :key="winner.id" :src="winner.avatar" class="winner-avatar" alt="Winner Avatar">
            </div>
        </div>
    </Transition>
</template>

<script>
export default {
  data() { /* eslint-disable */
    return {
      remainingTime: 0,      
      countdownInterval: null,
      theme: "",
      inputText: '',
      inputDisabled: true,
      angleOffset: 0, // Décalage angulaire pour l'animation de rotation
      gameEnded: false, // État pour savoir si le jeu est terminé
      winners: [] // Liste des gagnants
    };
  },
  mounted() {
    if (this.$socket.readyState !== WebSocket.OPEN) {
      // Si la connexion WebSocket n'est pas ouverte, redirige vers la page d'accueil
      console.warn("WebSocket n'est pas ouvert, redirection vers la page d'accueil");
      this.$router.push('/'); // Redirige vers la page d'accueil
      return;
    }
    this.$socket.addEventListener('message', this.handleSocketMessage);
    try {
    this.$socket.send(JSON.stringify({ type: 'player_arrived', message: 'Player has arrived' }));
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message via WebSocket:', error);
      this.$router.push('/');
    }
  },
  methods: {
    handleSocketMessage(event) {
      const data = JSON.parse(event.data);
      console.log(data);

      switch (data.type) {
        case 'request_game_users':
          this.playersList = data.alivePlayers;
          this.theme = data.theme;
          this.playersList.forEach((player, i) => {
            player.angleOffset = (((i - data.auTourDe + this.playersList.length) % this.playersList.length) * 2 * Math.PI/ this.playersList.length)
            console.log(`${player.name}, est placé à ${player.angleOffset* 180/Math.PI}`)
          })
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
          this.animateRotation(Math.PI * 2 / this.playersList.filter(player => player.state === "alive").length,      this.playersList          );
          break;
        case 'end_of_list':
          this.addBackgroundImage(data.entity);
          this.handleGameEnd(this.playersList.filter(player => player.state === "alive"));
          this.createConfetti();
          break;
        case 'solo_win':
          this.handleGameEnd(this.playersList.filter(player => player.state === "alive"));
          break;
        case 'timer':
          this.startCountdown(data.timer);
          break;
        case 'kill':
          this.playersList[data.indexKilledPlayer].state = 'dead';
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
    animateRotation(rotationAngle, playerList) {-
      playerList.forEach((player) => {
        player.startAngle = player.angleOffset
        player.targetAngle = player.angleOffset - rotationAngle;

        console.log(`player.name = ${player.name} startAngle = ${player.startAngle*180/Math.PI} -> targetAngle = ${player.targetAngle*180/Math.PI}`)
        // console.log(`startAngle = ${player.startAngle*180/Math.PI}`)
        // console.log(`targetAngle = ${player.targetAngle*180/Math.PI}`)
      
      })
      const duration = 250;
      const startTime = performance.now();
      const stepAnimation = (timestamp) => {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        playerList.forEach((player) => {
          player.angleOffset = player.startAngle + progress * (player.targetAngle - player.startAngle);
        })
        this.$forceUpdate();
        if (progress < 1) {requestAnimationFrame(stepAnimation);}
      };
      requestAnimationFrame(stepAnimation);
    },

    animateDecrease(playerList, alivePlayersList, auTourDe) {
      const aliveCount = playerList.filter(player => player.state === "alive").length;
      const theta = Math.PI * 2/ (aliveCount + 1);
      const thetaPrime = Math.PI * 2 / aliveCount;
      alivePlayersList.forEach((playerIndex, i) => {

        const player = playerList[playerIndex];
        const targetIndex = 2 + ((i - alivePlayersList.indexOf(auTourDe) + aliveCount) % aliveCount);
        const targetAngle = player.angleOffset - Math.abs( (targetIndex-2)*thetaPrime - (targetIndex-1)*theta )
        player.startAngle = player.angleOffset;
        player.targetAngle = targetAngle;

      });

      const duration = 250;
      const startTime = performance.now();

      const stepAnimation = (timestamp) => {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        playerList.forEach((player) => {
          if (player.state === 'alive') {
            player.angleOffset = player.startAngle + progress * (player.targetAngle - player.startAngle);
          }
        });

        this.$forceUpdate();

        if (progress < 1) {
          requestAnimationFrame(stepAnimation);
        }
      };

      requestAnimationFrame(stepAnimation);
    },
    getAvatarStyle(player) { // se fait chaque fois qu'un truc de playerList change (à chaque rotation du coup)
      const container = this.$refs.avatarContainer;
      const center = { x: container.clientWidth / 2, y: container.clientHeight / 2 };
      const radius = 250;
      const angleStep = 2 * Math.PI / this.alivePlayers.length;
      const startAngle = -Math.PI / 2; // Commence à partir du haut au lieu du bas
      const angle = startAngle + player.angleOffset;
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
    },
    handleGameEnd(winners) {
      this.inputDisabled = true;
      this.winners = winners;
      this.gameEnded = true;
    },    
    createConfetti() {
      const confettiContainer = this.$refs.confettiContainer;
      for (let i = 0; i < 200; i++) { // Nombre de confettis
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');

        // Paramètres aléatoires pour chaque confetti
        const size = Math.random() * 10 + 10 + 'px'; // Taille aléatoire entre 10px et 20px
        const left = Math.random() * 100 + 'vw';
        const duration = Math.random() * 3 + 3 + 's'; // Durée aléatoire entre 3s et 6s
        const delay = Math.random() * 3 + 's'; // Délai aléatoire jusqu'à 3s
        const animationName = `drift-${Math.random().toString(36).substring(2, 15)}`;

        // Ajouter des styles CSS au confetti
        confetti.style.width = size;
        confetti.style.height = size;
        confetti.style.backgroundColor = this.getRandomColor();
        confetti.style.opaciy = this.getOpacity();
        confetti.style.left = left;
        confetti.style.animationDuration = duration;
        confetti.style.animationDelay = delay;

        // Définir l'animation unique pour ce confetti
        const keyframes = `
          @keyframes ${animationName} {
            0% {
              transform: translateX(${Math.random() * 100 - 50}vw);
            }
            100% {
              transform: translateX(${Math.random() * 100 - 50}vw);
            }
          }
        `;
        
        // Ajouter les keyframes au style global
        const styleSheet = document.styleSheets[0];
        styleSheet.insertRule(keyframes, styleSheet.cssRules.length);

        // Appliquer l'animation au confetti
        confetti.style.animation = `fall ${duration} linear infinite, ${animationName} ${duration} ease-in-out infinite`;

        confettiContainer.appendChild(confetti);
      }
    },
    getRandomColor() {
      // const randomColor = `#${Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0')}`;
      // return randomColor;
      const colors = [
      '#FF4C4C', // Rouge vif
      '#FFA500', // Orange
      '#FFFF66', // Jaune
      '#32CD32', // Vert lime
      '#00BFFF', // Bleu ciel
      '#4169E1', // Bleu roi
      '#FF69B4', // Rose vif
      '#8A2BE2', // Violet
      '#40E0D0', // Turquoise
      '#FF00FF'  // Magenta
    ];
    
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
    },
    getOpacity() {
      const opacity = Math.random() * 0.9 + 0.1; // Génère un nombre entre 0.1 et 1
      return opacity;
    },
    startCountdown(milliseconds) {
      if (this.countdownInterval) {
        clearInterval(this.countdownInterval);
      }

      this.remainingTime = milliseconds;
      this.updateTimerDisplay();

      this.countdownInterval = setInterval(() => {
        this.remainingTime -= 10;  // Décrémente par 10 ms à chaque intervalle
        this.updateTimerDisplay();

        if (this.remainingTime <= 0) {
          clearInterval(this.countdownInterval);
          this.remainingTime = 0;
          this.updateTimerDisplay(); // Met à jour l'affichage final à 0.00
        }
      }, 10);  // Intervalle de 10 ms pour mettre à jour le compteur
    },
    updateTimerDisplay() {
      const seconds = Math.floor(this.remainingTime / 1000);
      const tenths = Math.floor((this.remainingTime % 1000) / 100);
      const hundredths = Math.floor((this.remainingTime % 100) / 10);

      document.getElementById('timer').innerText = `${seconds}:${tenths}${hundredths}`;
    },
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




.theme, .turn-info, .timer {
    text-align: center;
    font-size: 24px;
    color: #ecf0f1;
    font-weight: bold;
    margin: 10px 0;
}




/* .slide-fade-enter-active {
  transition: all 3s ease-out;
}

.slide-fade-leave-active {
  transition: all 3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
} */

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: opacity 2s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
}




.end-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.9);
    color: white;
    text-align: center;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 10;
    /* Supprimer opacity ici */
}


.winner-list {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 20px;
}

.winner-avatar {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    position: relative;
    border: 5px solid transparent; /* Bordure transparente pour appliquer border-image */
    border-image: conic-gradient(
        red, orange, yellow, lime, cyan, blue, magenta, red
    ) 1;
    animation: spin-border 3s linear infinite;
    box-sizing: border-box; /* Inclure la bordure dans la taille */
}

@keyframes spin-border {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}






.confetti-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* Empêche l'interaction avec les confettis */
  overflow: hidden;
  z-index: 20;
}

.confetti {
  position: absolute;
  /* opacity: 0.9; */
  transform: rotate(45deg);
  animation: fall 3s linear infinite; /* Animation de la chute uniquement */
}

/* Animation pour faire tomber les confettis */
@keyframes fall {
  0% {
    top: -10px;
  }
  100% {
    top: 100%;
  }
}


</style>
