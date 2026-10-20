import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig(({ command }) => ({
  plugins: [react()],

  // Lokalnie (dev): '/'
  // Na GitHub Pages (build): '/Ghostle/'
  base: command === 'build' ? '/Ghostle/' : '/',

  server: {
    proxy: {
      '/deezer': {
        target: 'https://api.deezer.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/deezer/, ''),
        secure: true,
      },
    },
  },
}))
