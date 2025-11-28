import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import TDesign from 'tdesign-vue-next';
import 'leaflet/dist/leaflet.css';
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// 引入组件库的少量全局样式变量
import 'tdesign-vue-next/es/style/index.css';
createApp(App).use(TDesign).use(ElementPlus).mount('#app')
