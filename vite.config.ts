import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Para GitHub Pages: reemplaza 'nombre-del-repositorio' con el nombre exacto de tu repo
// Ejemplo: si tu repo es github.com/laura-hernandez/portafolio → base: '/portafolio/'
// Si usas un dominio personalizado o github.com/laura-hernandez/laura-hernandez.github.io → base: '/'
export default defineConfig({
  plugins: [react()],
  base: '/Portfolio_Personal/',
  build: {
    outDir: 'docs',
  },
})
