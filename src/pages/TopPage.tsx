import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode, TouchEvent } from 'react';
import { Link } from 'react-router-dom';
import type { PostInstagram } from '../types';
import { postsInstagram } from '../data/posts-instagram';
import PortadaPost from '../components/post/PortadaPost';
import PostVivo from '../components/post/PostVivo';
import {
  IconChevronLeft,
  IconChevronRight,
  IconExternalLink,
  IconHeart,
  IconPause,
  IconPlay,
} from '../components/icons';
import { formatearMetrica } from '../lib/formato';
import { porLikes, tituloPost } from '../lib/posts';
import { useContadorAnimado } from '../hooks/useContadorAnimado';
import { useReinicios } from '../hooks/useReinicios';
import { CONSULTA_MOVIL, useMediaQuery } from '../hooks/useMediaQuery';
import { usePerfil } from '../hooks/usePerfil';
import styles from './TopPage.module.css';

const CANTIDAD = 20;

/** Segundos que se muestra cada pieza antes de pasar a la siguiente. */
const SEGUNDOS_POR_PIEZA = 7;

/** Piezas a cada lado de la actual que ya cargan el post real, para que
    su portada esté lista cuando lleguen. */
const DISTANCIA_PRECARGA = 2;

/* Las publicaciones con más interacciones, de la primera a la vigésima.
   Se recalcula sola al editar `src/data/posts-instagram.ts`. */
const top = postsInstagram.filter((p) => p.likes != null).sort(porLikes).slice(0, CANTIDAD);

const INICIO = -1;
const FIN = top.length;

const TOTAL_TOP = top.reduce((suma, p) => suma + (p.likes ?? 0), 0);
const MAXIMO = top[0]?.likes ?? 0;
const CUENTAS = [...new Set(top.map((p) => p.cuenta).filter(Boolean))].map((c) => `@${c}`);

const limitar = (i: number) => Math.min(Math.max(i, INICIO), FIN);

function Contador({ valor, etiqueta, compacto }: { valor: number; etiqueta: string; compacto?: boolean }) {
  const { ref, valor: animado } = useContadorAnimado<HTMLDivElement>(valor);
  return (
    <div ref={ref} className={styles.dato}>
      <span className={styles.datoValor} aria-hidden="true">
        {formatearMetrica(animado, compacto)}
      </span>
      <span className={styles.datoEtiqueta}>
        <span className={styles.srOnly}>{formatearMetrica(valor, compacto)} </span>
        {etiqueta}
      </span>
    </div>
  );
}

function Info({ post, puesto }: { post: PostInstagram; puesto: number }) {
  const { ref, valor } = useContadorAnimado<HTMLParagraphElement>(post.likes ?? 0);

  return (
    <div className={styles.info}>
      <div className={styles.infoTexto}>
        <p className={styles.etiquetas}>
          <span className={styles.puesto}>#{puesto}</span>
          <span className={styles.chip}>{post.tipo === 'video' ? 'Reel' : 'Carrusel'}</span>
          {post.cuenta && <span className={styles.cuenta}>@{post.cuenta}</span>}
          <span>{post.fecha.slice(0, 4)}</span>
        </p>
        <h2 className={styles.titulo}>{tituloPost(post)}</h2>
      </div>

      <div className={styles.infoLikes}>
        <p ref={ref} className={styles.likes}>
          <IconHeart size={28} />
          <span aria-hidden="true">{formatearMetrica(valor)}</span>
          <span className={styles.srOnly}>{formatearMetrica(post.likes ?? 0)}</span>
          <span className={styles.likesEtiqueta}>interacciones</span>
        </p>
        <div className={styles.comparacion} aria-hidden="true">
          <span className={styles.comparacionBarra}>
            <span style={{ width: `${((post.likes ?? 0) / MAXIMO) * 100}%` }} />
          </span>
          {puesto === 1 ? 'la más vista' : `${Math.round(((post.likes ?? 0) / MAXIMO) * 100)} % del #1`}
        </div>
        <a href={post.url} target="_blank" rel="noopener noreferrer" className={styles.botonSecundario}>
          Instagram <IconExternalLink size={13} />
        </a>
      </div>
    </div>
  );
}

function TextoInicio({ onEmpezar, pista }: { onEmpezar: () => void; pista?: string }) {
  return (
    <div className={styles.inicioTexto}>
      <p className={styles.eyebrow}>Redes sociales · {CUENTAS.join(' · ')}</p>
      <h1 className={styles.inicioTitulo}>
        Top <span>20</span>
      </h1>
      <p className={styles.inicioLead}>
        Las publicaciones que más conectaron con la audiencia, empezando por la que más
        interacciones tiene. Toca cualquiera para reproducirla aquí mismo.
      </p>
      <div className={styles.datos}>
        <Contador valor={TOTAL_TOP} etiqueta="interacciones en el Top 20" compacto />
        <Contador valor={MAXIMO} etiqueta="en la publicación #1" compacto />
      </div>
      <button type="button" className={styles.empezar} onClick={onEmpezar}>
        <IconPlay size={18} /> Empezar por el #1
      </button>
      {pista && <p className={styles.pista}>{pista}</p>}
    </div>
  );
}

function ContenidoFin({ onRepetir }: { onRepetir: () => void }) {
  const { search } = usePerfil();
  return (
    <div className={styles.portadaFin}>
      <h2 className={styles.finTitulo}>Eso fue el Top 20</h2>
      <p className={styles.inicioLead}>
        {formatearMetrica(TOTAL_TOP)} interacciones entre 20 publicaciones en {CUENTAS.join(', ')}.
      </p>
      <div className={styles.finAcciones}>
        <button type="button" className={styles.empezar} onClick={onRepetir}>
          <IconPlay size={18} /> Ver de nuevo desde el #1
        </button>
        <Link to={{ pathname: '/posts-instagram', search }} className={styles.botonSecundario}>
          Todos los posts
        </Link>
        <Link to={{ pathname: '/articulos-digitales', search }} className={styles.botonSecundario}>
          Mis artículos
        </Link>
      </div>
    </div>
  );
}

/** Barras estilo historias: la activa se llena y, al terminar su
    animación, pasa a la siguiente. Pausar es pausar la animación. */
function Segmentos({
  indice,
  detenido,
  onIr,
  onTerminar,
}: {
  indice: number;
  detenido: boolean;
  onIr: (i: number) => void;
  onTerminar: () => void;
}) {
  const enPieza = indice >= 0 && indice < FIN;
  return (
    <div className={styles.segmentos} data-oculto={!enPieza || undefined}>
      {top.map((p, i) => (
        <button
          key={p.url}
          type="button"
          className={styles.segmento}
          data-estado={i < indice ? 'visto' : i === indice ? 'activo' : 'pendiente'}
          onClick={() => onIr(i)}
          aria-label={`Ir al puesto ${i + 1}`}
          tabIndex={enPieza ? 0 : -1}
        >
          <span className={styles.carril}>
            <span
              className={styles.relleno}
              style={
                i === indice
                  ? {
                      animationDuration: `${SEGUNDOS_POR_PIEZA}s`,
                      animationPlayState: detenido ? 'paused' : 'running',
                    }
                  : undefined
              }
              onAnimationEnd={i === indice ? onTerminar : undefined}
            />
          </span>
        </button>
      ))}
    </div>
  );
}

function Fondo({ indice }: { indice: number }) {
  return (
    <div className={styles.fondo} aria-hidden="true">
      <span className={styles.mancha} />
      <span className={styles.mancha} />
      {indice >= 0 && indice < FIN && (
        <span key={indice} className={styles.fondoNumero}>
          {String(indice + 1).padStart(2, '0')}
        </span>
      )}
    </div>
  );
}

function anuncioDe(indice: number) {
  const p = top[indice];
  return p ? `Puesto ${indice + 1} de ${FIN}: ${tituloPost(p)}, ${formatearMetrica(p.likes ?? 0)} interacciones` : '';
}

/* ── Escritorio: carrusel 3D con el post del centro en vivo ───── */
function TopEscritorio() {
  const [indice, setIndice] = useState(INICIO);
  const [pausado, setPausado] = useState(false);
  const toque = useRef<{ x: number; y: number } | null>(null);
  const tiraRef = useRef<HTMLOListElement>(null);
  const { marcar, soltar, clave } = useReinicios();

  const enPieza = indice >= 0 && indice < FIN;
  const actual = enPieza ? top[indice] : null;
  // En el inicio el carrusel (como podio) se ordena como si estuviera en el #1.
  const base = enPieza ? indice : 0;

  const ir = useCallback(
    (destino: number) => {
      const nuevo = limitar(destino);
      setIndice(nuevo);
      setPausado(false);
      soltar(top[nuevo]?.url);
    },
    [soltar],
  );

  // Flechas del teclado (cuando el foco no está dentro de un post).
  useEffect(() => {
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      ir(indice + (e.key === 'ArrowRight' ? 1 : -1));
    };
    window.addEventListener('keydown', alPulsar);
    return () => window.removeEventListener('keydown', alPulsar);
  }, [indice, ir]);

  // La tira de abajo sigue a la pieza activa sin mover el scroll de la página.
  useEffect(() => {
    const tira = tiraRef.current;
    const activo = tira?.querySelector<HTMLElement>('[aria-current="true"]');
    if (!tira || !activo) return;
    tira.scrollTo({
      left: activo.offsetLeft - tira.clientWidth / 2 + activo.clientWidth / 2,
      behavior: 'smooth',
    });
  }, [indice]);

  // Deslizar a los lados (fuera del post) avanza o retrocede.
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
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(t.clientY - inicio.y)) ir(indice + (dx < 0 ? 1 : -1));
  };

  return (
    <section
      className={styles.escena}
      data-modo={enPieza ? 'pieza' : indice === INICIO ? 'inicio' : 'fin'}
      data-cuenta={actual?.cuenta}
      aria-roledescription="carrusel"
      aria-label="Top 20 de publicaciones con más interacciones"
    >
      <Fondo indice={indice} />
      <Segmentos indice={indice} detenido={pausado} onIr={ir} onTerminar={() => ir(indice + 1)} />

      {indice === INICIO && <TextoInicio onEmpezar={() => ir(0)} />}

      {/* En el inicio, el mismo carrusel hace de podio con el #1, #2 y #3:
          sus posts cargan mientras se lee la portada y, al empezar, las
          tarjetas se despliegan en el carrusel sin recargar. */}
      {(enPieza || indice === INICIO) && (
        <div
          className={styles.carrusel}
          data-podio={!enPieza || undefined}
          onTouchStart={alEmpezarToque}
          onTouchEnd={alTerminarToque}
        >
          {top.map((p, i) => {
            const offset = i - base;
            const distancia = Math.abs(offset);
            if (distancia > 3) return null;
            const centro = enPieza && offset === 0;
            // Misma estructura en todas las posiciones: así el PostVivo de
            // una tarjeta lateral sigue montado (y cargado) al llegar al centro.
            return (
              <div
                key={p.url}
                className={styles.tarjeta}
                data-centro={centro || undefined}
                data-oculta={distancia === 3 || undefined}
                data-lugar={!enPieza && i < 3 ? i + 1 : undefined}
                style={{ '--offset': offset, '--distancia': distancia } as CSSProperties}
                aria-hidden={!centro || undefined}
              >
                <PortadaPost post={p} puesto={i + 1} />
                {distancia <= DISTANCIA_PRECARGA && (
                  <PostVivo
                    key={clave(p.url)}
                    post={p}
                    interactivo={centro}
                    onTocado={() => {
                      marcar(p.url);
                      setPausado(true);
                    }}
                  />
                )}
                {centro ? (
                  <span className={styles.capaPuesto}>#{i + 1}</span>
                ) : (
                  // Las tarjetas de los lados (y el podio) llevan a esa pieza.
                  <button
                    type="button"
                    className={styles.capaIr}
                    tabIndex={-1}
                    onClick={() => ir(i)}
                    aria-label={`Ir al puesto ${i + 1}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {actual && <Info key={indice} post={actual} puesto={indice + 1} />}

      {indice === FIN && <ContenidoFin onRepetir={() => ir(0)} />}

      <div className={styles.controles}>
        <button type="button" className={styles.control} onClick={() => ir(indice - 1)} disabled={indice === INICIO} aria-label="Anterior">
          <IconChevronLeft size={22} />
        </button>
        <span className={styles.contador}>
          {enPieza ? `${indice + 1} / ${FIN}` : indice === INICIO ? 'Inicio' : 'Fin'}
        </span>
        <button
          type="button"
          className={styles.control}
          onClick={() => setPausado((v) => !v)}
          disabled={!enPieza}
          aria-label={pausado ? 'Reanudar' : 'Pausar'}
        >
          {pausado ? <IconPlay size={18} /> : <IconPause size={18} />}
        </button>
        <button type="button" className={styles.control} onClick={() => ir(indice + 1)} disabled={indice === FIN} aria-label="Siguiente">
          <IconChevronRight size={22} />
        </button>

        <ol ref={tiraRef} className={styles.tira} aria-label="Ir a un puesto">
          {top.map((p, i) => (
            <li key={p.url}>
              <button
                type="button"
                className={styles.tiraBoton}
                data-cuenta={p.cuenta}
                aria-current={i === indice}
                onClick={() => ir(i)}
              >
                <span className={styles.tiraPuesto}>#{i + 1}</span>
                <span className={styles.tiraLikes}>{formatearMetrica(p.likes ?? 0, true)}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      <p className={styles.srOnly} aria-live="polite">
        {anuncioDe(indice)}
      </p>
    </section>
  );
}

/* ── Celular: feed vertical, como los Reels ───────────────────── */
/* Cada pieza ocupa la pantalla y el scroll engancha una por una. Deslizar
   hacia arriba encima del post también funciona: el iframe no tiene
   scroll propio, así que el gesto pasa al feed. Un toque en el post lo
   reproduce directo, sin abrir nada. */
function TopMovil() {
  const feedRef = useRef<HTMLDivElement>(null);
  const [actual, setActual] = useState(INICIO);
  const [pausado, setPausado] = useState(false);
  const { marcar, soltar, clave } = useReinicios();

  const enPieza = actual >= 0 && actual < FIN;

  // La pieza que ocupa la pantalla es la actual.
  useEffect(() => {
    const feed = feedRef.current;
    if (!feed) return;
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (!entrada.isIntersecting) continue;
          const i = Number((entrada.target as HTMLElement).dataset.indice);
          setActual(i);
          setPausado(false);
          soltar(top[i]?.url);
        }
      },
      { root: feed, threshold: 0.6 },
    );
    feed.querySelectorAll('[data-indice]').forEach((pantalla) => observador.observe(pantalla));
    return () => observador.disconnect();
  }, [soltar]);

  const irA = (i: number) => {
    const feed = feedRef.current;
    const pantalla = feed?.querySelector<HTMLElement>(`[data-indice="${limitar(i)}"]`);
    if (feed && pantalla) feed.scrollTo({ top: pantalla.offsetTop, behavior: 'smooth' });
  };

  const pantalla = (indice: number, contenido: ReactNode, cuenta?: string) => (
    <section key={indice} className={styles.pantalla} data-indice={indice} data-cuenta={cuenta}>
      {contenido}
    </section>
  );

  return (
    <section
      className={styles.escena}
      data-modo="movil"
      data-cuenta={enPieza ? top[actual].cuenta : undefined}
      aria-label="Top 20 de publicaciones con más interacciones"
    >
      <Fondo indice={actual} />
      <Segmentos indice={actual} detenido={pausado} onIr={irA} onTerminar={() => irA(actual + 1)} />
      {enPieza && (
        <button
          type="button"
          className={styles.pausaMovil}
          onClick={() => setPausado((v) => !v)}
          aria-label={pausado ? 'Reanudar' : 'Pausar'}
        >
          {pausado ? <IconPlay size={16} /> : <IconPause size={16} />}
        </button>
      )}

      <div ref={feedRef} className={styles.feed}>
        {pantalla(
          INICIO,
          <>
            <div className={styles.podioMovil} aria-hidden="true">
              {[1, 0, 2].map((i) =>
                top[i] ? (
                  <div key={top[i].url} className={styles.podioCarta} data-lugar={i + 1}>
                    <PortadaPost post={top[i]} puesto={i + 1} />
                    <PostVivo post={top[i]} />
                  </div>
                ) : null,
              )}
            </div>
            <TextoInicio onEmpezar={() => irA(0)} pista="Desliza hacia arriba para pasar de una a otra" />
          </>,
        )}

        {top.map((p, i) =>
          pantalla(
            i,
            <>
              <div className={styles.marcoMovil}>
                <div className={styles.tarjetaMovil}>
                  <PortadaPost post={p} puesto={i + 1} />
                  {Math.abs(i - actual) <= DISTANCIA_PRECARGA && (
                    <PostVivo
                      key={clave(p.url)}
                      post={p}
                      interactivo={i === actual}
                      onTocado={() => {
                        marcar(p.url);
                        setPausado(true);
                      }}
                    />
                  )}
                  <span className={styles.capaPuesto}>#{i + 1}</span>
                </div>
              </div>
              <Info post={p} puesto={i + 1} />
            </>,
            p.cuenta,
          ),
        )}

        {pantalla(FIN, <ContenidoFin onRepetir={() => irA(0)} />)}
      </div>

      <p className={styles.srOnly} aria-live="polite">
        {anuncioDe(actual)}
      </p>
    </section>
  );
}

export default function TopPage() {
  const { perfil } = usePerfil();
  const esMovil = useMediaQuery(CONSULTA_MOVIL);

  useEffect(() => {
    document.title = `Top 20 · ${perfil.tituloDocumento}`;
  }, [perfil.tituloDocumento]);

  return esMovil ? <TopMovil /> : <TopEscritorio />;
}
