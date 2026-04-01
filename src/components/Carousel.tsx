import { useState } from 'react';
import styles from './Carousel.module.css';

interface CarouselImage {
  src: string;
  alt: string;
}

interface Props {
  images: CarouselImage[];
}

export default function Carousel({ images }: Props) {
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const prev = () => setCurrent((c) => (c - 1 + images.length) % images.length);
  const next = () => setCurrent((c) => (c + 1) % images.length);

  if (images.length === 0) return null;

  return (
    <>
      <div className={styles.carousel}>
        <button className={`${styles.arrow} ${styles.arrowLeft}`} onClick={prev} aria-label="Anterior">
          ‹
        </button>

        <div className={styles.imageWrapper} onClick={() => setLightbox(true)}>
          <img
            src={images[current].src}
            alt={images[current].alt}
            className={styles.image}
          />
          <div className={styles.overlay}>
            <span>Ver imagen</span>
          </div>
        </div>

        <button className={`${styles.arrow} ${styles.arrowRight}`} onClick={next} aria-label="Siguiente">
          ›
        </button>

        <div className={styles.dots}>
          {images.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
              onClick={() => setCurrent(i)}
              aria-label={`Imagen ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {lightbox && (
        <div className={styles.lightbox} onClick={() => setLightbox(false)}>
          <button className={styles.closeBtn} onClick={() => setLightbox(false)} aria-label="Cerrar">
            ✕
          </button>
          <button className={`${styles.lbArrow} ${styles.lbArrowLeft}`} onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Anterior">
            ‹
          </button>
          <img
            src={images[current].src}
            alt={images[current].alt}
            onClick={(e) => e.stopPropagation()}
          />
          <button className={`${styles.lbArrow} ${styles.lbArrowRight}`} onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Siguiente">
            ›
          </button>
        </div>
      )}
    </>
  );
}
