import { useEffect, useRef } from 'react';
import type { TouchEvent } from 'react';
import type { PostInstagram } from '../../types';
import PortadaPost from './PortadaPost';
import PostVivo from './PostVivo';
import { IconChevronLeft, IconChevronRight, IconClose, IconExternalLink, IconHeart } from '../icons';
import { formatearMetrica } from '../../lib/formato';
import { NOMBRE_CUENTA, tituloPost } from '../../lib/posts';
import styles from './VisorPost.module.css';

interface Props {
  posts: PostInstagram[];
  /** Posición en `posts` del post abierto; `null` cierra el visor. */
  indice: number | null;
  onCambiar: (indice: number) => void;
  onCerrar: () => void;
}

const fechaLarga = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
// A mediodía para que la zona horaria no lo corra al día anterior.
const formatearFecha = (iso: string) => fechaLarga.format(new Date(`${iso}T12:00:00`));

/**
 * Un post del muro en grande y en vivo: el reel se reproduce y el carrusel
 * se pasa con sus propias flechas. Las flechas del visor (o el teclado, o
 * deslizar fuera del post) van al post anterior o siguiente de la lista.
 * Usa `<dialog>` nativo: Esc cierra y el fondo queda inerte.
 */
export default function VisorPost({ posts, indice, onCambiar, onCerrar }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const toque = useRef<{ x: number; y: number } | null>(null);
  const post = indice == null ? null : posts[indice];
  const abierto = post != null;

  useEffect(() => {
    const dialogo = ref.current;
    if (!dialogo) return;
    if (abierto && !dialogo.open) dialogo.showModal();
    if (!abierto && dialogo.open) dialogo.close();
  }, [abierto]);

  // Mientras está abierto, la página de atrás no se desplaza.
  useEffect(() => {
    if (!abierto) return;
    const raiz = document.documentElement;
    const previo = raiz.style.overflow;
    raiz.style.overflow = 'hidden';
    return () => {
      raiz.style.overflow = previo;
    };
  }, [abierto]);

  const hayAnterior = indice != null && indice > 0;
  const haySiguiente = indice != null && indice < posts.length - 1;
  const ir = (paso: number) => {
    if (indice == null) return;
    const destino = indice + paso;
    if (destino >= 0 && destino < posts.length) onCambiar(destino);
  };

  // Flechas del teclado (cuando el foco no está dentro del post).
  useEffect(() => {
    if (indice == null) return;
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      const destino = indice + (e.key === 'ArrowRight' ? 1 : -1);
      if (destino >= 0 && destino < posts.length) onCambiar(destino);
    };
    window.addEventListener('keydown', alPulsar);
    return () => window.removeEventListener('keydown', alPulsar);
  }, [indice, posts.length, onCambiar]);

  // Deslizar a los lados fuera del post (sobre el post, el toque es del iframe).
  const alEmpezarToque = (e: TouchEvent) => {
    const t = e.touches[0];
    toque.current = { x: t.clientX, y: t.clientY };
  };
  const alTerminarToque = (e: TouchEvent) => {
    const inicio = toque.current;
    toque.current = null;
    if (!inicio) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - inicio.x;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(t.clientY - inicio.y)) ir(dx < 0 ? 1 : -1);
  };

  const esReel = post?.tipo === 'video';

  return (
    <dialog
      ref={ref}
      className={styles.visor}
      onClose={onCerrar}
      onClick={(e) => e.target === e.currentTarget && onCerrar()}
      aria-label={post ? tituloPost(post) : undefined}
    >
      {post && indice != null && (
        <div
          className={styles.contenido}
          data-cuenta={post.cuenta}
          onClick={(e) => e.target === e.currentTarget && onCerrar()}
          onTouchStart={alEmpezarToque}
          onTouchEnd={alTerminarToque}
        >
          <button type="button" className={styles.cerrar} onClick={onCerrar} aria-label="Cerrar">
            <IconClose size={20} />
          </button>

          <button
            type="button"
            className={`${styles.flecha} ${styles.flechaAnterior}`}
            onClick={() => ir(-1)}
            disabled={!hayAnterior}
            aria-label="Post anterior"
          >
            <IconChevronLeft size={26} />
          </button>

          <div className={styles.escenario}>
            {/* La key nueva desmonta el post anterior: si sonaba, se corta. */}
            <div className={styles.marco} key={post.url}>
              <PortadaPost post={post} />
              <PostVivo post={post} interactivo />
            </div>
          </div>

          <aside className={styles.panel}>
            <p className={styles.medio}>
              {post.cuenta ? `${NOMBRE_CUENTA[post.cuenta] ?? post.cuenta} · @${post.cuenta}` : 'Instagram'}
            </p>
            <h2 className={styles.titulo}>{tituloPost(post)}</h2>
            <div className={styles.datos}>
              <span className={styles.likes}>
                <IconHeart size={14} /> {formatearMetrica(post.likes ?? 0)} interacciones
              </span>
              <span>
                {esReel ? 'Reel' : 'Carrusel'} · {formatearFecha(post.fecha)}
              </span>
            </div>
            <p className={styles.ayuda}>
              {esReel ? 'Toca el video para reproducirlo.' : 'Pasa las imágenes con las flechas del post.'}
            </p>
            <a href={post.url} target="_blank" rel="noopener noreferrer" className={styles.instagram}>
              Ver en Instagram <IconExternalLink size={14} />
            </a>

            <div className={styles.navegacion}>
              <button type="button" onClick={() => ir(-1)} disabled={!hayAnterior} aria-label="Post anterior">
                <IconChevronLeft size={20} />
              </button>
              <span aria-live="polite">
                {indice + 1} de {posts.length}
              </span>
              <button type="button" onClick={() => ir(1)} disabled={!haySiguiente} aria-label="Post siguiente">
                <IconChevronRight size={20} />
              </button>
            </div>
          </aside>

          <button
            type="button"
            className={`${styles.flecha} ${styles.flechaSiguiente}`}
            onClick={() => ir(1)}
            disabled={!haySiguiente}
            aria-label="Post siguiente"
          >
            <IconChevronRight size={26} />
          </button>
        </div>
      )}
    </dialog>
  );
}
