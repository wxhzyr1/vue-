import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import 'leaflet/dist/leaflet.css';
import Tdesign from 'tdesign-vue-next';
import 'tdesign-vue-next/es/style/index.css';
const app = createApp(App)
app.use(Tdesign).mount('#app')
