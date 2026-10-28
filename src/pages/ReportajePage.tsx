import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { reportaje } from '../data/reportaje';
import { IconExternalLink, IconPlay } from '../components/icons';
import { usePerfil } from '../hooks/usePerfil';
import styles from './ReportajePage.module.css';

// maxresdefault es 16:9 y sin bandas negras (hqdefault viene en 4:3).
const MINIATURA = `https://i.ytimg.com/vi/${reportaje.youtubeId}/maxresdefault.jpg`;
const URL_YOUTUBE = `https://www.youtube.com/watch?v=${reportaje.youtubeId}`;

export default function ReportajePage() {
  const { perfil, search } = usePerfil();
  // El iframe de YouTube se carga recién al tocar: la página abre rápido y
  // ese mismo toque ya lo reproduce (autoplay).
  const [reproduciendo, setReproduciendo] = useState(false);

  useEffect(() => {
    document.title = `Reportaje · ${perfil.tituloDocumento}`;
  }, [perfil.tituloDocumento]);

  return (
    <div className={styles.page}>
      <header className={styles.encabezado}>
        <p className={styles.eyebrow}>
          Televisión · {reportaje.medio} · {reportaje.fecha.slice(0, 4)}
        </p>
        <h1 className={styles.titulo}>{reportaje.titulo}</h1>
        <p className={styles.lead}>Nota periodística para televisión, emitida en {reportaje.medio}.</p>
      </header>

      <div className={styles.sala}>
        {/* Luz ambiente: la misma miniatura, desenfocada detrás del video. */}
        <div className={styles.ambiente} style={{ backgroundImage: `url(${MINIATURA})` }} aria-hidden="true" />
        <div className={styles.pantalla}>
          {reproduciendo ? (
            <iframe
              src={`https://www.youtube.com/embed/${reportaje.youtubeId}?autoplay=1&rel=0`}
              title={reportaje.titulo}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <button
              type="button"
              className={styles.poster}
              onClick={() => setReproduciendo(true)}
              aria-label={`Reproducir: ${reportaje.titulo}`}
            >
              <img src={MINIATURA} alt="" />
              <span className={styles.play}>
                <IconPlay size={34} />
              </span>
            </button>
          )}
        </div>
      </div>

      <div className={styles.acciones}>
        <a href={URL_YOUTUBE} target="_blank" rel="noopener noreferrer" className={styles.botonSecundario}>
          Ver en YouTube <IconExternalLink size={13} />
        </a>
        <Link to={{ pathname: '/top-20', search }} className={styles.botonSecundario}>
          Mi Top 20 en redes
        </Link>
        <Link to={{ pathname: '/articulos-digitales', search }} className={styles.botonSecundario}>
          Mis artículos
        </Link>
      </div>
    </div>
  );
}
