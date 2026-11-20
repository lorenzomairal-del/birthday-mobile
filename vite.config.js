import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// En desarrollo, las rutas de login y /api van al servidor Express (npm run dev:server).
const backend = 'http://localhost:3000'

export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    proxy: {
      '/api': backend,
      '/login': backend,
      '/logout': backend,
    },
  },
})
