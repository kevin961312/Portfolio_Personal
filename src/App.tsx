import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SobreMiPage from './pages/SobreMiPage';
import ArticulosImpresosPage from './pages/ArticulosImpresosPage';
import ArticulosDigitalesPage from './pages/ArticulosDigitalesPage';
import PostsInstagramPage from './pages/PostsInstagramPage';
import ReportajePage from './pages/ReportajePage';
import styles from './App.module.css';

export default function App() {
  return (
    <BrowserRouter basename="/Portfolio_personal">
      <div className={styles.layout}>
        <Navbar />
        <main className={styles.main}>
          <Routes>
            <Route path="/" element={<SobreMiPage />} />
            <Route path="/articulos-impresos" element={<ArticulosImpresosPage />} />
            <Route path="/articulos-digitales" element={<ArticulosDigitalesPage />} />
            <Route path="/posts-instagram" element={<PostsInstagramPage />} />
            <Route path="/reportaje" element={<ReportajePage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
