import { useEffect, useMemo, useRef, useState } from 'react';
import { postsInstagram } from '../data/posts-instagram';
import EncabezadoPagina from '../components/EncabezadoPagina';
import TarjetaPost from '../components/post/TarjetaPost';
import VisorPost from '../components/post/VisorPost';
import { IconExternalLink, IconHeart } from '../components/icons';
import { formatearMetrica } from '../lib/formato';
import { porFecha, porLikes, tituloPost } from '../lib/posts';
import type { PostInstagram, TemaPost } from '../types';
import { usePerfil } from '../hooks/usePerfil';
import styles from './PostsInstagramPage.module.css';

type Tipo = 'video' | 'carrusel';
type Orden = 'likes' | 'recientes';

/** Posts que se suman en cada tanda al bajar: 2 filas de 4 en escritorio. */
const POR_TANDA = 8;

/** Pausa breve con el loader visible antes de mostrar la siguiente tanda. */
const PAUSA_TANDA_MS = 450;

/** Menú + barra de filtros (sticky) más un respiro, para no tapar el muro. */
const ALTO_BARRAS = 150;

/* Sin ninguno marcado se ven todos; tocar el marcado lo desmarca. */
const TIPOS: { id: Tipo; etiqueta: string }[] = [
  { id: 'video', etiqueta: 'Reels' },
  { id: 'carrusel', etiqueta: 'Carruseles' },
];

/* Género no es un tema más sino una etiqueta que se suma al tema del post
   (`genero: true` en los datos); en el filtro se ofrece junto a los temas. */
type FiltroTema = TemaPost | 'genero';

/* En este orden se muestran los chips y las etiquetas de cada tarjeta. */
const TEMAS: { id: FiltroTema; etiqueta: string }[] = [
  { id: 'politica', etiqueta: 'Política' },
  { id: 'genero', etiqueta: 'Género' },
  { id: 'cultura', etiqueta: 'Cultura' },
  { id: 'cubrimiento', etiqueta: 'Cubrimiento' },
];
const ETIQUETA_TEMA: Record<FiltroTema, string> = {
  cultura: 'Cultura',
  politica: 'Política',
  cubrimiento: 'Cubrimiento',
  genero: 'Género',
};

const cumpleTema = (p: PostInstagram, filtro: FiltroTema | null) =>
  !filtro || (filtro === 'genero' ? !!p.genero : p.tema === filtro);

export default function PostsInstagramPage() {
  const { perfil } = usePerfil();
  const [tipo, setTipo] = useState<Tipo | null>(null);
  const [tema, setTema] = useState<FiltroTema | null>(null);
  const [orden, setOrden] = useState<Orden>('likes');
  // Cuántos posts de `lista` se muestran; crece de a una tanda al bajar.
  const [mostrados, setMostrados] = useState(POR_TANDA);
  // Posición en `lista` del post abierto en grande.
  const [abierto, setAbierto] = useState<number | null>(null);
  const centinelaRef = useRef<HTMLDivElement>(null);
  const muroRef = useRef<HTMLUListElement>(null);

  /* Cambiar filtro u orden vuelve a la primera tanda y, si ya se había
     bajado, sube al inicio del muro (si no, el loader del final seguiría
     a la vista y cargaría todas las tandas de golpe). */
  const reiniciarMuro = () => {
    setMostrados(POR_TANDA);
    const muro = muroRef.current;
    const tope = muro ? muro.getBoundingClientRect().top + window.scrollY - ALTO_BARRAS : 0;
    if (window.scrollY > tope) window.scrollTo({ top: tope });
  };
  const cambiarTipo = (t: Tipo) => {
    setTipo((actual) => (actual === t ? null : t));
    reiniciarMuro();
  };
  const cambiarTema = (t: FiltroTema) => {
    setTema((actual) => (actual === t ? null : t));
    reiniciarMuro();
  };
  const cambiarOrden = (o: Orden) => {
    setOrden(o);
    reiniciarMuro();
  };

  // Al pasar de post en el visor, el muro ya muestra hasta ese post.
  const cambiarAbierto = (i: number) => {
    setAbierto(i);
    setMostrados((n) => Math.max(n, Math.ceil((i + 1) / POR_TANDA) * POR_TANDA));
  };

  useEffect(() => {
    document.title = `Posts de Instagram · ${perfil.tituloDocumento}`;
  }, [perfil.tituloDocumento]);

  const lista = useMemo(
    () =>
      postsInstagram
        .filter((p) => (!tipo || p.tipo === tipo) && cumpleTema(p, tema))
        .sort(orden === 'likes' ? porLikes : porFecha),
    [tipo, tema, orden],
  );
  // Conteo de cada tema dentro del formato elegido.
  const porTema = useMemo(() => {
    const cuenta: Record<FiltroTema, number> = { cultura: 0, politica: 0, cubrimiento: 0, genero: 0 };
    for (const p of postsInstagram) {
      if (tipo && p.tipo !== tipo) continue;
      if (p.tema) cuenta[p.tema] += 1;
      if (p.genero) cuenta.genero += 1;
    }
    return cuenta;
  }, [tipo]);
  // Posición de cada post en `lista` (los que el filtro saca no están).
  const posicion = useMemo(() => new Map(lista.map((p, i) => [p.url, i])), [lista]);
  const hayMas = mostrados < lista.length;

  /* Scroll infinito: cuando el loader del final se acerca a la pantalla,
     se suma otra tanda tras una pausa breve. Se vuelve a observar en cada
     tanda: si el loader sigue a la vista (pantalla alta), carga otra. */
  useEffect(() => {
    const nodo = centinelaRef.current;
    if (!nodo || !hayMas || typeof IntersectionObserver === 'undefined') return;
    let espera = 0;
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting || espera) return;
        espera = window.setTimeout(() => {
          espera = 0;
          setMostrados((n) => n + POR_TANDA);
        }, PAUSA_TANDA_MS);
      },
      { rootMargin: '200px 0px' },
    );
    observador.observe(nodo);
    return () => {
      observador.disconnect();
      clearTimeout(espera);
    };
  }, [hayMas, mostrados]);

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
              onClick={() => cambiarTipo(t.id)}
            >
              {t.etiqueta}
            </button>
          ))}
        </div>
        <span className={styles.separador} aria-hidden="true" />
        <div className={styles.grupo} role="group" aria-label="Tema">
          {TEMAS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={styles.chip}
              data-tema={t.id}
              aria-pressed={tema === t.id}
              disabled={porTema[t.id] === 0 && tema !== t.id}
              onClick={() => cambiarTema(t.id)}
            >
              <span className={styles.punto} aria-hidden="true" />
              {t.etiqueta} · {porTema[t.id]}
            </button>
          ))}
        </div>
        <div className={styles.orden} role="group" aria-label="Ordenar">
          <button type="button" aria-pressed={orden === 'likes'} onClick={() => cambiarOrden('likes')}>
            Más vistos
          </button>
          <button type="button" aria-pressed={orden === 'recientes'} onClick={() => cambiarOrden('recientes')}>
            Recientes
          </button>
        </div>
      </div>

      <p className={styles.conteo} aria-live="polite">
        {lista.length} {lista.length === 1 ? 'publicación' : 'publicaciones'}
        {tema && ` · ${ETIQUETA_TEMA[tema]}`}
      </p>

      {lista.length === 0 && <p className={styles.vacio}>No hay publicaciones con estos filtros.</p>}

      {/* Las tarjetas nunca cambian de lugar en el DOM ni se desmontan:
          mover o quitar un iframe hace que el navegador lo recargue. El
          orden se aplica con `order` del grid; el filtro y las tandas aún
          no mostradas solo las ocultan, así los posts ya cargados siguen
          listos al cambiar de vista. */}
      <ul ref={muroRef} className={styles.muro} hidden={lista.length === 0}>
        {postsInstagram.map((p) => {
          const i = posicion.get(p.url);
          const visible = i !== undefined && i < mostrados;
          const horizontal = p.orientacion === 'horizontal';
          return (
            <li
              key={p.url}
              className={`${styles.item} revelar`}
              hidden={!visible}
              data-horizontal={horizontal || undefined}
              style={i === undefined ? undefined : { order: i }}
            >
              <TarjetaPost post={p} ancha={horizontal} onAbrir={() => i !== undefined && setAbierto(i)} />
              <div className={styles.pie}>
                <span className={styles.temas}>
                  {TEMAS.filter((t) => t.id === p.tema || (t.id === 'genero' && p.genero)).map((t) => (
                    <span key={t.id} className={styles.tema} data-tema={t.id}>
                      <span className={styles.punto} aria-hidden="true" />
                      {t.etiqueta}
                    </span>
                  ))}
                </span>
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
          );
        })}
      </ul>

      {/* Al llegar aquí se suma otra tanda; mientras tanto, el loader. */}
      {hayMas && (
        <div ref={centinelaRef} className={styles.masPosts} role="status">
          <span className={styles.giro} aria-hidden="true" />
          Cargando más publicaciones
        </div>
      )}

      <VisorPost posts={lista} indice={abierto} onCambiar={cambiarAbierto} onCerrar={() => setAbierto(null)} />
    </div>
  );
}
