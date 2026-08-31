import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SobreMiPage from './pages/SobreMiPage';
import ArticulosImpresosPage from './pages/ArticulosImpresosPage';
import ArticulosDigitalesPage from './pages/ArticulosDigitalesPage';
import PostsInstagramPage from './pages/PostsInstagramPage';
import ReportajePage from './pages/ReportajePage';
import { usePerfil } from './hooks/usePerfil';
import { sincronizarDesdeUrl } from './lib/perfilStore';
import styles from './App.module.css';

/**
 * Mantiene `?perfil=` presente en cada navegación interna de React Router.
 * Si un enlace llega sin el parámetro, lo repone con `replaceState`
 * (sin crear una entrada extra en el historial).
 */
function PerfilSync() {
  const { key } = useLocation();
  useEffect(() => {
    sincronizarDesdeUrl();
  }, [key]);
  return null;
}

/**
 * Aísla las secciones entre versiones de la HV: cada perfil declara sus
 * `secciones` y cualquier ruta fuera de esa lista redirige a la portada.
 * Así, entrar por la URL de community manager no da acceso al material
 * periodístico ni escribiendo la ruta a mano.
 */
function GuardiaSecciones({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { perfil, search } = usePerfil();

  // Normaliza `/reportaje/` → `/reportaje` antes de comparar.
  const ruta = pathname !== '/' && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

  if (!perfil.secciones.includes(ruta)) {
    return <Navigate to={{ pathname: '/', search }} replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter basename="/Portfolio_Personal">
      <PerfilSync />
      <div className={styles.layout}>
        <Navbar />
        <main className={styles.main}>
          <GuardiaSecciones>
            <Routes>
              <Route path="/" element={<SobreMiPage />} />
              <Route path="/articulos-impresos" element={<ArticulosImpresosPage />} />
              <Route path="/articulos-digitales" element={<ArticulosDigitalesPage />} />
              <Route path="/posts-instagram" element={<PostsInstagramPage />} />
              <Route path="/reportaje" element={<ReportajePage />} />
            </Routes>
          </GuardiaSecciones>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
