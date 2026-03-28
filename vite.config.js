import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/weather': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/geo': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/hi': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
