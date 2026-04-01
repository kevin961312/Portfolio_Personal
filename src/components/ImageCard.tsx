import { useState } from 'react';
import type { ArticuloImpreso } from '../types';
import styles from './ImageCard.module.css';

interface Props {
  articulo: ArticuloImpreso;
}

export default function ImageCard({ articulo }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <article className={styles.card} onClick={() => setExpanded(true)}>
        <div className={styles.imgWrapper}>
          <img src={articulo.imagen} alt={articulo.titulo} loading="lazy" />
          <div className={styles.overlay}>
            <span>Ver imagen</span>
          </div>
        </div>
        <div className={styles.info}>
          <p className={styles.pub}>{articulo.publicacion} · {articulo.fecha}</p>
          <h3 className={styles.title}>{articulo.titulo}</h3>
          {articulo.descripcion && <p className={styles.desc}>{articulo.descripcion}</p>}
        </div>
      </article>

      {expanded && (
        <div className={styles.lightbox} onClick={() => setExpanded(false)}>
          <button className={styles.closeBtn} onClick={() => setExpanded(false)} aria-label="Cerrar">
            ✕
          </button>
          <img
            src={articulo.imagen}
            alt={articulo.titulo}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
