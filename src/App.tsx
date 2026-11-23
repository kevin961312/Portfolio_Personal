import { Suspense, lazy, useEffect } from 'react';
import type { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import SobreMiPage from './pages/SobreMiPage';
import { usePerfil } from './hooks/usePerfil';
import { sincronizarDesdeUrl } from './lib/perfilStore';
import styles from './App.module.css';

/* La portada va en el paquete inicial; el resto de páginas se descarga
   recién al visitarlas (cada una en su propio archivo JS). */
const TopPage = lazy(() => import('./pages/TopPage'));
const ArticulosImpresosPage = lazy(() => import('./pages/ArticulosImpresosPage'));
const ArticulosDigitalesPage = lazy(() => import('./pages/ArticulosDigitalesPage'));
const PostsInstagramPage = lazy(() => import('./pages/PostsInstagramPage'));
const ReportajePage = lazy(() => import('./pages/ReportajePage'));
const GaleriaPage = lazy(() => import('./pages/GaleriaPage'));
const LibroFotosPage = lazy(() => import('./pages/LibroFotosPage'));

/**
 * Mantiene `?perf=` presente en cada navegación interna de React Router.
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
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <PerfilSync />
      <div className={styles.layout}>
        <Navbar />
        <main className={styles.main}>
          <GuardiaSecciones>
            <Suspense fallback={<div className={styles.cargando} aria-busy="true" />}>
              <Routes>
                <Route path="/" element={<SobreMiPage />} />
                <Route path="/top-20" element={<TopPage />} />
                <Route path="/articulos-impresos" element={<ArticulosImpresosPage />} />
                <Route path="/articulos-digitales" element={<ArticulosDigitalesPage />} />
                <Route path="/posts-instagram" element={<PostsInstagramPage />} />
                <Route path="/reportaje" element={<ReportajePage />} />
                <Route path="/galeria" element={<GaleriaPage />} />
                <Route path="/libro-de-fotos" element={<LibroFotosPage />} />
              </Routes>
            </Suspense>
          </GuardiaSecciones>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
