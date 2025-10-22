// frontend/vite.config.ts
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// Para GitHub Pages em "project page", use o nome exato do repositório:
export default defineConfig({
  base: '/fluxo_lab_automatizacao/',
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET ?? 'http://localhost:3002',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target:
          process.env.VITE_SOCKET_PROXY_TARGET ??
          process.env.VITE_API_PROXY_TARGET ??
          'http://localhost:3002',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
})
