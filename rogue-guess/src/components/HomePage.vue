<template>
  <div class="container">
    <h1 ref="bienvenue">Bienvenue</h1>
    <form @submit.prevent="handleSubmit">
      <label for="name">Nom :</label>
      <input v-model="name" type="text" id="name" name="name" required placeholder="Choisissez un nom" ref="nameInput">
      <div class="avatar-container" ref="avatarContainer">
        <div class="arrow" @click="changeAvatar('prev')">&#10094;</div>
        <img :src="currentAvatar" alt="Avatar" class="avatar" :class="{'visible': isVisible, 'hidden': !isVisible}">
        <div class="arrow" @click="changeAvatar('next')">&#10095;</div>
      </div>
      <label for="game-code">Code de la partie :</label>
      <input v-model="gameCode" type="text" id="game-code" name="game-code" placeholder="Laissez vide pour créer une partie">
      <button type="submit" class="button">Jouer</button>
    </form>
    <a href="/formulaire" class="btn">Une suggestion ?</a>
  </div>
</template>

<script>
import '@/assets/css/indexejs.css';

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
        avatar1,
        avatar2,
        avatar3,
        avatar4,
        avatar5,
        avatar6,
        avatar7,
        avatar8,
        avatar9,
      ],
      isVisible: true,
    };
  },
  computed: {
    currentAvatar() {
      return this.avatars[this.currentIndex];
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
      const userInfo = { username: this.name, avatar: this.currentAvatar, uuid: this.uuidv4(), state: 'alive' };
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
    // Ajouter l'écouteur pour les messages WebSocket
    this.$socket.addEventListener('message', event => {
      const data = JSON.parse(event.data);
      if (data.type === 'game_created' || data.type === 'game_joined') {
        // Rediriger vers la vue Chat avec le code de partie
        const gameCode = encodeURIComponent(data.gameCode);
        this.$router.push({ name: 'Room', params: { gameCode } });
      } else if (data.type === 'error') {
        // Afficher une alerte en cas d'erreur
        alert(data.message);
      }
    });
  }
};
</script>
