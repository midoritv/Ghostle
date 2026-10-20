import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // All /deezer/* requests get proxied to api.deezer.com
      // This bypasses CORS because the request comes from the server, not the browser
      '/deezer': {
        target: 'https://api.deezer.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/deezer/, ''),
        secure: true,
      },
    },
  },
})
