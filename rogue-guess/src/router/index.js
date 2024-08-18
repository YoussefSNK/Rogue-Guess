import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../components/HomePage.vue';
import RoomPage from '../components/RoomPage.vue';
import GamePage from '../components/GamePage.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
    meta: { title: 'Bienvenue😎' }
  },
  {
    path: '/room/:gameCode',
    name: 'Room',
    component: RoomPage,
    meta: { title: 'Lobby de con' },
    props: true,
  },
  {
    path: '/game/:gameCode',
    name: 'Game',
    component: GamePage,
    meta: { title: 'Game de con' },
    props: true,
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'AAAAAAAAAA';
  next();
});

export default router;
