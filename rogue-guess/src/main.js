import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import VueNativeSock from 'vue-native-websocket-vue3';

const app = createApp(App);

app.use(router);
app.use(store);
app.use(VueNativeSock, 'ws://localhost:3000', {
  format: 'json',
  reconnection: true, // (Boolean) Reconnect automatically (default true)
  reconnectionAttempts: 5, // (Number) Number of reconnection attempts before giving up (default Infinity),
  reconnectionDelay: 3000, // (Number) How long to initially wait before attempting a new (1000)
});

app.mount('#app');
