import type { PostInstagram } from '../../types';
import PortadaPost from './PortadaPost';
import PostVivo from './PostVivo';
import { IconSparkle } from '../icons';
import { UMBRAL_TOP } from '../../lib/posts';
import { useCerca } from '../../hooks/useCerca';
import styles from './TarjetaPost.module.css';

interface Props {
  post: PostInstagram;
  /** `key` del PostVivo: cambiarla lo desmonta y corta el video (ver useReinicios). */
  claveVivo: string;
  onTocado: () => void;
}

/**
 * Post en vivo para muros y miniaturas: un toque lo reproduce ahí mismo.
 * El iframe solo se monta cerca de la pantalla y se desmonta al alejarse,
 * así una página con decenas de posts no los carga todos a la vez.
 */
export default function TarjetaPost({ post, claveVivo, onTocado }: Props) {
  const { ref, cerca } = useCerca<HTMLDivElement>();
  return (
    <div ref={ref} className={styles.tarjeta} data-cuenta={post.cuenta}>
      <PortadaPost post={post} />
      {cerca && <PostVivo key={claveVivo} post={post} interactivo onTocado={onTocado} />}
      {(post.likes ?? 0) >= UMBRAL_TOP && (
        <span className={styles.sello}>
          <IconSparkle size={12} /> Top
        </span>
      )}
    </div>
  );
}
