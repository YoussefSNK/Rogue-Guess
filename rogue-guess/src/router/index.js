import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../components/HomePage.vue';
import RoomPage from '../components/RoomPage.vue';

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
    component: RoomPage
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
