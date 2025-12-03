import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  base: './', 
  plugins: [vue()],
  build: {
    outDir: 'dist',
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  server:{
    host:'0.0.0.0',
    port:8080
  }
})