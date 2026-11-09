import type { PostInstagram } from '../../types';
import PortadaPost from './PortadaPost';
import PostVivo from './PostVivo';
import { IconExpand, IconSparkle } from '../icons';
import { UMBRAL_TOP, tituloPost } from '../../lib/posts';
import { useCerca } from '../../hooks/useCerca';
import styles from './TarjetaPost.module.css';

interface Props {
  post: PostInstagram;
  /** `key` del PostVivo: cambiarla lo desmonta y corta el video (ver useReinicios). */
  claveVivo?: string;
  onTocado?: () => void;
  /** Si viene, la tarjeta es solo vista previa y un toque la abre en grande (VisorPost). */
  onAbrir?: () => void;
  /** Tarjeta ancha (video horizontal): el contenedor define su alto. */
  ancha?: boolean;
}

/**
 * Post en vivo para muros y miniaturas: un toque lo reproduce ahí mismo o,
 * con `onAbrir`, lo abre en grande. El iframe se monta al acercarse a la
 * pantalla (así una página con decenas de posts no los carga todos a la
 * vez) y, una vez cargado, se queda: al volver a él no carga de nuevo.
 */
export default function TarjetaPost({ post, claveVivo, onTocado, onAbrir, ancha = false }: Props) {
  const { ref, cerca } = useCerca<HTMLDivElement>('600px', true);
  return (
    <div ref={ref} className={styles.tarjeta} data-cuenta={post.cuenta} data-ancha={ancha || undefined}>
      <PortadaPost post={post} />
      {cerca && <PostVivo key={claveVivo} post={post} interactivo={!onAbrir} onTocado={onTocado} />}
      {(post.likes ?? 0) >= UMBRAL_TOP && (
        <span className={styles.sello}>
          <IconSparkle size={12} /> Top
        </span>
      )}
      {onAbrir && (
        <button type="button" className={styles.abrir} onClick={onAbrir} aria-label={`Ver en grande: ${tituloPost(post)}`}>
          <span className={styles.abrirPista}>
            <IconExpand size={14} /> Ver en grande
          </span>
        </button>
      )}
    </div>
  );
}
