import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { inicializarPerfil } from './lib/perfilStore'

// Fija `?perf=` en la URL inicial (con replaceState, sin ensuciar el
// historial) y engancha los botones Atrás/Adelante del navegador.
// El perfil se resuelve como: query param → comunicadora.
inicializarPerfil();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
