import './assets/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';
import { i18n } from './i18n';
import { usePreferencesStore } from './stores/preferences.store';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(i18n);

const preferencesStore = usePreferencesStore(pinia);
preferencesStore.initialize();

app.mount('#app');
