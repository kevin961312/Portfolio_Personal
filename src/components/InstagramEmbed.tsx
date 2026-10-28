import { useEffect } from 'react';
import type { PostInstagram } from '../types';
import { IconInstagram, IconPlay, IconCarousel, IconImage, IconExternalLink } from './icons';
import { limpiarUrlInstagram, procesarEmbedsInstagram } from '../lib/instagram';
import styles from './InstagramEmbed.module.css';

interface Props {
  post: PostInstagram;
}

const tipoIcono = (tipo: PostInstagram['tipo']) => {
  switch (tipo) {
    case 'video': return <IconPlay size={14} />;
    case 'carrusel': return <IconCarousel size={14} />;
    default: return <IconImage size={14} />;
  }
};

const tipoLabel = (tipo: PostInstagram['tipo']) => {
  switch (tipo) {
    case 'video': return 'Video';
    case 'carrusel': return 'Carrusel';
    default: return 'Imagen';
  }
};

export default function InstagramEmbed({ post }: Props) {
  const cleanUrl = limpiarUrlInstagram(post.url);

  useEffect(() => {
    procesarEmbedsInstagram();
  }, []);

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <div className={styles.meta}>
          <IconInstagram size={15} />
          <span className={styles.tipo}>
            {tipoIcono(post.tipo)} {tipoLabel(post.tipo)}
          </span>
          <span className={styles.fecha}>{post.fecha}</span>
        </div>
        <h3 className={styles.title}>{post.titulo}</h3>
        {post.descripcion && <p className={styles.desc}>{post.descripcion}</p>}
      </div>

      <div className={styles.embedWrapper}>
        <blockquote
          className="instagram-media"
          data-instgrm-permalink={cleanUrl}
          data-instgrm-version="14"
          style={{ margin: '0 auto', width: '100%', maxWidth: 540 }}
        />
      </div>

      <div className={styles.footer}>
        <a
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.btnExternal}
        >
          <IconExternalLink size={14} />
          Ver en Instagram
        </a>
      </div>
    </article>
  );
}
