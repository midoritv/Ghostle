import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],

  // GitHub Pages serwuje aplikację z /REPO_NAME/
  // Zmienna VITE_BASE_PATH jest ustawiana w GitHub Actions workflow
  // Lokalnie brak zmiennej = '/' (root)
  base: process.env.VITE_BASE_PATH ?? '/',

  server: {
    proxy: {
      // Proxy Deezer API lokalnie żeby obejść CORS
      '/deezer': {
        target: 'https://api.deezer.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/deezer/, ''),
        secure: true,
      },
    },
  },
})
