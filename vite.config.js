import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { ngrok } from 'vite-plugin-ngrok'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    ngrok({
      addr: 5173, // 你的端口
      authtoken: '2y21wzppRIiT4pkUXnjJ2vm9vQL_44sbEhLxXjZHJNR2mtZCi', // 可选，注册ngrok官网获取免费token
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        javascriptEnabled: true,
      },
    },
  },
})
