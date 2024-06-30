<template>
  <div class="home">
    <div class="background-ball" :style="{ backgroundColor: currentAvatar.firstColor }"></div>
    <div class="container">
      <h1 ref="bienvenue">Bienvenue</h1>
      <form @submit.prevent="handleSubmit">
        <!-- <label for="name">Nom :</label> -->
        <input v-model="name" type="text" id="name" name="name" required placeholder="Choisissez un nom" ref="nameInput">
        <div class="avatar-container" ref="avatarContainer">
          <div class="arrow" @click="changeAvatar('prev')" :style="{ color: currentAvatar.secondColor }">&#10094;</div>
          <img :src="currentAvatar.src" alt="Avatar" class="avatar" :class="{'visible': isVisible, 'hidden': !isVisible}">
          <div class="arrow" @click="changeAvatar('next')" :style="{ color: currentAvatar.secondColor }">&#10095;</div>
        </div>
        <label for="game-code">Code de la partie :</label>
        <input v-model="gameCode" type="text" id="game-code" name="game-code" placeholder="Laissez vide pour créer une partie">
        <button type="submit" class="button">Jouer</button>
      </form>
      <a href="/formulaire" class="btn">Une suggestion ?</a>
    </div>
  </div>
</template>

<script>
// import '@/assets/css/indexejs.css';

import avatar1 from '@/assets/images/avatar/avatar1.png';
import avatar2 from '@/assets/images/avatar/avatar2.png';
import avatar3 from '@/assets/images/avatar/avatar3.png';
import avatar4 from '@/assets/images/avatar/avatar4.png';
import avatar5 from '@/assets/images/avatar/avatar5.png';
import avatar6 from '@/assets/images/avatar/avatar6.png';
import avatar7 from '@/assets/images/avatar/avatar7.png';
import avatar8 from '@/assets/images/avatar/avatar8.png';
import avatar9 from '@/assets/images/avatar/avatar9.png';

export default {
  name: 'HomePage',
  data() {
    return {
      name: '',
      gameCode: '',
      currentIndex: 0,
      avatars: [
        { src: avatar1, firstColor: '#f0f0f0' }, // secondColor: '#0f0f0f', thirdColor: '#a44ca4' },
        { src: avatar2, firstColor: '#00a2e8' },
        { src: avatar3, firstColor: '#4f4f4f' },
        { src: avatar4, firstColor: '#daadda' },
        { src: avatar5, firstColor: '#4f060a' },
        { src: avatar6, firstColor: '#b4e61d' },
        { src: avatar7, firstColor: '#fff200' },
        { src: avatar8, firstColor: '#7092be' },
        { src: avatar9, firstColor: '#ff7f27', secondColor: '#6c2c6c', thirdColor: '#a44ca4' }
      ],
      isVisible: true,
    };
  },
  computed: {
    currentAvatar() {
      return {
        src: this.avatars[this.currentIndex].src,
        firstColor: this.avatars[this.currentIndex].firstColor,
        secondColor: this.avatars[this.currentIndex].secondColor,
        thirdColor: this.avatars[this.currentIndex].thirdColor
      };
    },
  },
  methods: {
    handleSubmit() {
      if (this.gameCode) {
        this.joinGame();
      } else {
        this.createGame();
      }
    },
    createGame() {
      const userInfo = { username: this.name, avatar: this.currentAvatar.src, uuid: this.uuidv4(), state: 'alive' };
      this.$socket.send(JSON.stringify({ type: 'create_game', userInfo }));
    },
    changeAvatar(direction) {
      this.isVisible = false;
      setTimeout(() => {
        if (direction === 'next') {
          this.currentIndex = (this.currentIndex + 1) % this.avatars.length;
        } else {
          this.currentIndex = (this.currentIndex - 1 + this.avatars.length) % this.avatars.length;
        }
        this.isVisible = true;
      }, 100);
    },
    uuidv4() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
    },
    addFloatAnimation(element) {
      element.addEventListener('mouseenter', function () {
        this.style.animation = 'float 3s ease-in-out infinite';
      });
      element.addEventListener('mouseleave', function () {
        this.style.animation = 'none';
      });
    }
  },
  mounted() {
    this.isAvatarVisible = true;
    this.addFloatAnimation(this.$refs.avatarContainer);
    this.addFloatAnimation(this.$refs.nameInput);
    this.addFloatAnimation(this.$refs.bienvenue);
    this.$socket.addEventListener('message', event => {
      const data = JSON.parse(event.data);
      if (data.type === 'game_created' || data.type === 'game_joined') {
        const gameCode = encodeURIComponent(data.gameCode);
        this.$router.push({ name: 'Room', params: { gameCode } });
      }
    });
    // this.$socket.addEventListener('open', event => {console.log('Connecté au serveur depuis index.ejs');});
    // this.$socket.addEventListener('close', event => {console.log('Déconnecté d\'index.ejs');});
    // this.$socket.addEventListener('error', function(event) {console.error('Error occurred:', event);});
  }
};
</script>

<style scoped>
.home {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #000;
  color: #fff;
}

.container {
  text-align: center;
  animation: float 10s ease-in-out infinite;
}

h1 {
  margin-bottom: 20px;
  color: #fff; /* Changer la couleur du texte en blanc */
}

label {
  display: block;
  margin-bottom: 10px;
  color: #fff; /* Changer la couleur du texte en blanc */
}

input[type="text"] {
  padding: 8px;
  font-size: 16px;
  width: 250px;
  margin-bottom: 20px;
  background-color: #333; /* Fond des champs de texte en gris foncé */
  color: #fff; /* Texte des champs de texte en blanc */
  border: 1px solid #555; /* Bordure des champs de texte en gris foncé */
  border-radius: 5px;
}

.avatar-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
}

.avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: 2px solid transparent;
  transition: border-color 0.3s ease, opacity 0.5s ease, transform 0.5s ease;
  opacity: 0;
  transform: scale(0.8);
}

.avatar.visible {
  opacity: 1;
  transform: scale(1);
}

.avatar.hidden {
  opacity: 0;
  transform: scale(0.8);
}

.arrow {
  font-size: 2rem;
  cursor: pointer;
  user-select: none;
  padding: 0 10px;
  transition: color 0.3s ease;
  color: #fff; /* Changer la couleur des flèches en blanc */
}

.arrow:hover {
  color: #007BFF; /* Changer la couleur au survol */
}

.button {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.button:hover {
  background-color: #0056b3;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.floating-element {
  animation: float 3s ease-in-out infinite;
}

.background-ball {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 500px; /* Taille initiale de la balle */
  height: 500px; /* Taille initiale de la balle */
  border-radius: 50%;
  animation: color-change 60s linear infinite, size-change 5s ease-in-out infinite;
  transform: translate(-50%, -50%);
  /* z-index: -1; */
  filter: blur(50px); /* Ajout du flou */
}

@keyframes size-change {
  0% {
    width: 650px;
    height: 650px;
  }
  90% {
    width: 5px;
    height: 5px;
  }
  100%{
    width: 650px;
    height: 650px;
  }
}
</style>
