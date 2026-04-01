import { articulosDigitales } from '../data/articulos-digitales';
import IframeCard from '../components/IframeCard';
import { IconGlobe } from '../components/icons';
import styles from './ArticulosDigitalesPage.module.css';

export default function ArticulosDigitalesPage() {
  const articulos = articulosDigitales;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerIcon}>
          <IconGlobe size={28} color="var(--color-purple-mid)" />
        </div>
        <div>
          <h1 className={styles.title}>Artículos digitales</h1>
          <p className={styles.subtitle}>
            Publicaciones en medios digitales y portales de noticias
          </p>
        </div>
      </header>

      {articulos.length === 0 ? (
        <div className={styles.empty}>
          <IconGlobe size={48} color="var(--color-lilac-mid)" />
          <h2>Próximamente</h2>
          <p>
            Agrega artículos digitales editando el archivo{' '}
            <code>src/data/articulos-digitales.ts</code>
          </p>
        </div>
      ) : (
        <div className={styles.list}>
          {articulos.map((art) => (
            <IframeCard key={art.id} articulo={art} />
          ))}
        </div>
      )}
    </div>
  );
}
