import type { PostInstagram } from '../../types';
import { IconCarousel, IconHeart, IconPlay } from '../icons';
import { formatearMetrica } from '../../lib/formato';
import { rutaPublica } from '../../lib/rutas';
import { INICIALES_CUENTA, tituloPost } from '../../lib/posts';
import styles from './PortadaPost.module.css';

interface Props {
  post: PostInstagram;
  /** Puesto en un ranking: se dibuja como número gigante de fondo. */
  puesto?: number;
}

/**
 * Portada estilo post de Instagram: la imagen real si el post trae
 * `portada`, o una diseñada con el título. Hace de respaldo debajo de
 * PostVivo mientras carga el post real (o si Instagram está bloqueado).
 */
export default function PortadaPost({ post, puesto }: Props) {
  const esReel = post.tipo === 'video';
  return (
    <div className={styles.marco}>
      <div className={styles.portada} data-cuenta={post.cuenta} data-imagen={post.portada ? '' : undefined}>
        {post.portada && <img src={rutaPublica(post.portada)} alt="" className={styles.portadaImagen} />}
        {puesto != null && (
          <span className={styles.portadaNumero} aria-hidden="true">
            {puesto}
          </span>
        )}

        <div className={styles.portadaCabecera}>
          <span className={styles.avatar}>{INICIALES_CUENTA[post.cuenta ?? ''] ?? 'IG'}</span>
          <span className={styles.portadaCuenta}>{post.cuenta ? `@${post.cuenta}` : 'Instagram'}</span>
          <span className={styles.portadaTipo}>{esReel ? <IconPlay size={16} /> : <IconCarousel size={16} />}</span>
        </div>

        {esReel && (
          <span className={styles.portadaPlay}>
            <IconPlay size={28} />
          </span>
        )}

        {!post.portada && (
          <p className={styles.portadaTitulo}>
            <span>{tituloPost(post)}</span>
          </p>
        )}

        <div className={styles.portadaPie}>
          <span className={styles.portadaLikes}>
            <IconHeart size={14} /> {formatearMetrica(post.likes ?? 0, true)}
          </span>
          {!esReel && (
            <span className={styles.puntos} aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
