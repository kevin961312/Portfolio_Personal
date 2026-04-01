import { useRef } from 'react';
import { articulosImpresos } from '../data/articulos-impresos';
import type { ArticuloImpreso } from '../types';
import ImageCard from '../components/ImageCard';
import { IconNewspaper } from '../components/icons';
import styles from './ArticulosImpresosPage.module.css';

export default function ArticulosImpresosPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // NOTE: En producción, los artículos se gestionan editando el archivo
  // src/data/articulos-impresos.ts y agregando las imágenes a public/articulos/
  const articulos: ArticuloImpreso[] = articulosImpresos;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerIcon}>
          <IconNewspaper size={28} color="var(--color-purple-mid)" />
        </div>
        <div>
          <h1 className={styles.title}>Artículos impresos</h1>
          <p className={styles.subtitle}>
            Publicaciones en medios impresos y físicos
          </p>
        </div>
      </header>

      {articulos.length === 0 ? (
        <div className={styles.empty}>
          <IconNewspaper size={48} color="var(--color-lilac-mid)" />
          <h2>Próximamente</h2>
          <p>
            Agrega tus artículos impresos editando el archivo{' '}
            <code>src/data/articulos-impresos.ts</code> e incluyendo las imágenes en{' '}
            <code>public/articulos/</code>
          </p>
          <div className={styles.addHint}>
            <p>Ejemplo de entrada:</p>
            <pre>{`{
  id: '1',
  titulo: 'Título del artículo',
  publicacion: 'Nombre del periódico',
  fecha: '2025-03-01',
  imagen: '/articulos/articulo1.jpg',
  descripcion: 'Descripción breve',
}`}</pre>
          </div>
        </div>
      ) : (
        <div className={styles.grid}>
          {articulos.map((art) => (
            <ImageCard key={art.id} articulo={art} />
          ))}
        </div>
      )}

      {/* Hidden input kept for future use */}
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} />
    </div>
  );
}
