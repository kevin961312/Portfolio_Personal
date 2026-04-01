import { useRef, useState, useEffect } from 'react';
import type { ArticuloDigital } from '../types';
import { IconExternalLink, IconGlobe } from './icons';
import styles from './IframeCard.module.css';

interface Props {
  articulo: ArticuloDigital;
}

export default function IframeCard({ articulo }: Props) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);

  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    setIsClamped(el.scrollHeight > el.clientHeight + 2);
  }, [articulo.titulo]);

  return (
    <div className={styles.cardWrapper}>
      <a
        className={styles.card}
        href={articulo.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={articulo.titulo}
      >
        <div className={styles.imageWrapper}>
          {articulo.imagen ? (
            <img
              src={`${import.meta.env.BASE_URL}${articulo.imagen.replace(/^\//, '')}`}
              alt={articulo.titulo}
              className={styles.image}
            />
          ) : (
            <div className={styles.imagePlaceholder}>
              <IconGlobe size={40} color="var(--color-lilac-mid)" />
            </div>
          )}
        </div>

        <div className={styles.body}>
          <div className={styles.pubRow}>
            <IconGlobe size={14} color="var(--color-purple-mid)" />
            <span className={styles.pubName}>{articulo.publicacion}</span>
          </div>

          <div className={styles.titleWrapper}>
            <h3
              ref={titleRef}
              className={`${styles.title} ${expanded ? styles.titleExpanded : ''}`}
            >
              {articulo.titulo}
            </h3>

            {isClamped && (
              <button
                className={styles.verMas}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setExpanded((v) => !v);
                }}
              >
                {expanded ? 'Ver menos' : 'Ver más'}
              </button>
            )}
          </div>

          <span className={styles.link}>
            <IconExternalLink size={14} />
            Leer artículo
          </span>

          <span className={styles.tag}>{articulo.publicacion}</span>
        </div>
      </a>
    </div>
  );
}
