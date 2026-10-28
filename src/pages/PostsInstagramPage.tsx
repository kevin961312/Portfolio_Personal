import { useEffect, useMemo, useState } from 'react';
import { postsInstagram } from '../data/posts-instagram';
import EncabezadoPagina from '../components/EncabezadoPagina';
import TarjetaPost from '../components/post/TarjetaPost';
import VisorPost from '../components/post/VisorPost';
import { IconExternalLink, IconHeart } from '../components/icons';
import { formatearMetrica } from '../lib/formato';
import { porFecha, porLikes, tituloPost } from '../lib/posts';
import { usePerfil } from '../hooks/usePerfil';
import styles from './PostsInstagramPage.module.css';

type Tipo = 'video' | 'carrusel';
type Orden = 'likes' | 'recientes';

/* Sin ninguno marcado se ven todos; tocar el marcado lo desmarca. */
const TIPOS: { id: Tipo; etiqueta: string }[] = [
  { id: 'video', etiqueta: 'Reels' },
  { id: 'carrusel', etiqueta: 'Carruseles' },
];

export default function PostsInstagramPage() {
  const { perfil } = usePerfil();
  const [tipo, setTipo] = useState<Tipo | null>(null);
  const [orden, setOrden] = useState<Orden>('likes');
  // Posición en `lista` del post abierto en grande.
  const [abierto, setAbierto] = useState<number | null>(null);

  useEffect(() => {
    document.title = `Posts de Instagram · ${perfil.tituloDocumento}`;
  }, [perfil.tituloDocumento]);

  const lista = useMemo(
    () =>
      postsInstagram
        .filter((p) => !tipo || p.tipo === tipo)
        .sort(orden === 'likes' ? porLikes : porFecha),
    [tipo, orden],
  );

  return (
    <div className={styles.page}>
      <EncabezadoPagina
        eyebrow="Redes sociales"
        titulo="Posts de"
        resaltado="Instagram"
        lead="Reels y carruseles producidos para EL TIEMPO y Cuestión Pública. Toca cualquiera para verlo en grande: ahí se reproduce el reel o se pasa el carrusel."
      />

      <div className={styles.barra}>
        <div className={styles.grupo} role="group" aria-label="Formato">
          {TIPOS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={styles.chip}
              aria-pressed={tipo === t.id}
              onClick={() => setTipo((actual) => (actual === t.id ? null : t.id))}
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
          {lista.map((p, i) => (
            <li key={p.url} className={`${styles.item} revelar`}>
              <TarjetaPost post={p} onAbrir={() => setAbierto(i)} />
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

      <VisorPost posts={lista} indice={abierto} onCambiar={setAbierto} onCerrar={() => setAbierto(null)} />
    </div>
  );
}
