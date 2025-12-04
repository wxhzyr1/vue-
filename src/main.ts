import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import 'leaflet/dist/leaflet.css';
import Tdesign from 'tdesign-vue-next';
import router from './router'
import 'tdesign-vue-next/es/style/index.css';
const app = createApp(App)
app.use(Tdesign).use(router).mount('#app')
