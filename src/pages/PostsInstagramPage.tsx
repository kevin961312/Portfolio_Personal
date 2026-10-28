import { useEffect, useMemo, useState } from 'react';
import { postsInstagram } from '../data/posts-instagram';
import EncabezadoPagina from '../components/EncabezadoPagina';
import TarjetaPost from '../components/post/TarjetaPost';
import { IconExternalLink, IconHeart } from '../components/icons';
import { formatearMetrica } from '../lib/formato';
import { porFecha, porLikes, tituloPost } from '../lib/posts';
import { useReinicios } from '../hooks/useReinicios';
import { usePerfil } from '../hooks/usePerfil';
import styles from './PostsInstagramPage.module.css';

type Tipo = 'todos' | 'video' | 'carrusel';
type Orden = 'likes' | 'recientes';

const TIPOS: { id: Tipo; etiqueta: string }[] = [
  { id: 'todos', etiqueta: 'Todo' },
  { id: 'video', etiqueta: 'Reels' },
  { id: 'carrusel', etiqueta: 'Carruseles' },
];


export default function PostsInstagramPage() {
  const { perfil } = usePerfil();
  const [tipo, setTipo] = useState<Tipo>('todos');
  const [orden, setOrden] = useState<Orden>('likes');
  const { marcar, soltar, clave } = useReinicios();

  useEffect(() => {
    document.title = `Posts de Instagram · ${perfil.tituloDocumento}`;
  }, [perfil.tituloDocumento]);

  const lista = useMemo(
    () =>
      postsInstagram
        .filter((p) => tipo === 'todos' || p.tipo === tipo)
        .sort(orden === 'likes' ? porLikes : porFecha),
    [tipo, orden],
  );

  return (
    <div className={styles.page}>
      <EncabezadoPagina
        eyebrow="Redes sociales"
        titulo="Posts de"
        resaltado="Instagram"
        lead="Reels y carruseles producidos para EL TIEMPO y Cuestión Pública. Toca cualquiera para reproducirlo aquí mismo."
      />

      <div className={styles.barra}>
        <div className={styles.grupo} role="group" aria-label="Formato">
          {TIPOS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={styles.chip}
              aria-pressed={tipo === t.id}
              onClick={() => setTipo(t.id)}
            >
              {t.etiqueta}
            </button>
          ))}
        </div>
        <div className={styles.orden} role="group" aria-label="Ordenar">
          <button type="button" aria-pressed={orden === 'likes'} onClick={() => setOrden('likes')}>
            Más vistos
          </button>
          <button type="button" aria-pressed={orden === 'recientes'} onClick={() => setOrden('recientes')}>
            Recientes
          </button>
        </div>
      </div>

      <p className={styles.conteo} aria-live="polite">
        {lista.length} {lista.length === 1 ? 'publicación' : 'publicaciones'}
      </p>

      {lista.length === 0 ? (
        <p className={styles.vacio}>No hay publicaciones con estos filtros.</p>
      ) : (
        <ul className={styles.muro}>
          {lista.map((p) => (
            <li key={p.url} className={`${styles.item} revelar`}>
              <TarjetaPost
                post={p}
                claveVivo={clave(p.url)}
                // Solo suena uno a la vez: tocar este corta los demás.
                onTocado={() => {
                  marcar(p.url);
                  soltar(p.url);
                }}
              />
              <div className={styles.pie}>
                <p className={styles.titulo}>{tituloPost(p)}</p>
                <div className={styles.meta}>
                  <span className={styles.likes}>
                    <IconHeart size={13} /> {formatearMetrica(p.likes ?? 0, true)}
                  </span>
                  <span className={styles.cuenta}>{p.tipo === 'video' ? 'Reel' : 'Carrusel'} · @{p.cuenta ?? 'instagram'}</span>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.externo}
                    aria-label={`Abrir en Instagram: ${tituloPost(p)}`}
                  >
                    <IconExternalLink size={14} />
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
