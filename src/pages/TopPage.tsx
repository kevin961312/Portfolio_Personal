import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, TouchEvent } from 'react';
import { Link } from 'react-router-dom';
import type { PostInstagram } from '../types';
import { postsInstagram } from '../data/posts-instagram';
import {
  IconCarousel,
  IconChevronLeft,
  IconChevronRight,
  IconClose,
  IconExternalLink,
  IconHeart,
  IconPause,
  IconPlay,
} from '../components/icons';
import { formatearMetrica } from '../lib/formato';
import { limpiarUrlInstagram, procesarEmbedsInstagram } from '../lib/instagram';
import { rutaPublica } from '../lib/rutas';
import { useContadorAnimado } from '../hooks/useContadorAnimado';
import { usePerfil } from '../hooks/usePerfil';
import styles from './TopPage.module.css';

const CANTIDAD = 20;

/** Segundos que se muestra cada portada antes de pasar a la siguiente. */
const SEGUNDOS_POR_PIEZA = 7;

/** Tarjetas a cada lado de la central que ya cargan el post real, para que
    su portada esté lista cuando lleguen al centro. */
const DISTANCIA_PRECARGA = 2;

/* Las publicaciones con más interacciones, de la primera a la vigésima.
   Se recalcula sola al editar `src/data/posts-instagram.ts`. */
const top = [...postsInstagram]
  .filter((p) => p.likes != null)
  .sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0))
  .slice(0, CANTIDAD);

const INICIO = -1;
const FIN = top.length;

const TOTAL_TOP = top.reduce((suma, p) => suma + (p.likes ?? 0), 0);
const MAXIMO = top[0]?.likes ?? 0;
const CUENTAS = [...new Set(top.map((p) => p.cuenta).filter(Boolean))].map((c) => `@${c}`);

const INICIALES: Record<string, string> = {
  eltiempo: 'ET',
  cuestionp: 'CP',
  lamartineris: 'LM',
};

const tituloDe = (p: PostInstagram) =>
  p.titulo || (p.tipo === 'video' ? 'Reel para Instagram' : 'Carrusel para Instagram');

/** Portada estilo post de Instagram: la imagen real si existe, o una
    diseñada con el título. El tamaño del texto escala con la tarjeta. */
function Portada({ post, puesto }: { post: PostInstagram; puesto: number }) {
  const esReel = post.tipo === 'video';
  return (
    <div className={styles.portada} data-cuenta={post.cuenta} data-imagen={post.portada ? '' : undefined}>
      {post.portada && <img src={rutaPublica(post.portada)} alt="" className={styles.portadaImagen} />}
      <span className={styles.portadaNumero} aria-hidden="true">
        {puesto}
      </span>

      <div className={styles.portadaCabecera}>
        <span className={styles.avatar}>{INICIALES[post.cuenta ?? ''] ?? 'IG'}</span>
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
          <span>{tituloDe(post)}</span>
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
  );
}

const ESTILO_BLOCKQUOTE = {
  margin: '0',
  width: '100%',
  minWidth: '0',
  maxWidth: '540px',
  border: '0',
  padding: '0',
};

/** El mismo blockquote que pinta React, para rearmar el post a mano. */
function crearBlockquote(url: string): HTMLQuoteElement {
  const blockquote = document.createElement('blockquote');
  blockquote.className = 'instagram-media';
  blockquote.setAttribute('data-instgrm-permalink', limpiarUrlInstagram(url));
  blockquote.setAttribute('data-instgrm-version', '14');
  Object.assign(blockquote.style, ESTILO_BLOCKQUOTE);
  return blockquote;
}

/**
 * El post real de Instagram dentro de una tarjeta, recortado a la imagen
 * (sin el marco blanco). Cerrado hace de portada; abierto se puede tocar:
 * reproducir el reel o pasar el carrusel. Es el mismo iframe en los dos
 * estados, así abrir no recarga.
 * Mientras no carga (o si el navegador bloquea Instagram) queda visible
 * la portada diseñada que hay debajo.
 */
function PostVivo({ post, abierta }: { post: PostInstagram; abierta: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const vivoRef = useRef<HTMLDivElement>(null);
  const estabaAbierta = useRef(false);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    const nodo = ref.current;
    if (!nodo) return;
    let espera = 0;
    // El contenido del iframe se pinta un instante después del `load`.
    const alCargar = () => {
      espera = window.setTimeout(() => setListo(true), 200);
    };
    const engancharIframe = () => {
      const iframe = nodo.querySelector('iframe');
      if (!iframe) return false;
      iframe.addEventListener('load', alCargar, { once: true });
      return true;
    };
    // Se observa antes de procesar: si embed.js ya está cargado, cambia
    // el blockquote por el iframe en la misma llamada.
    const observador = new MutationObserver(() => {
      if (engancharIframe()) observador.disconnect();
    });
    observador.observe(nodo, { childList: true, subtree: true });
    procesarEmbedsInstagram();
    return () => {
      observador.disconnect();
      clearTimeout(espera);
    };
  }, []);

  /* Al cerrarse (con la X, Esc o al pasar a otra pieza) el iframe sale del
     DOM: destruirlo es lo único que corta seguro un reel que estaba
     sonando (reasignar su `src` no siempre lo detiene). En su lugar se
     arma un blockquote nuevo para la portada. El contenido de `.embed` ya
     lo maneja embed.js, así que reemplazarlo no choca con React; mientras
     carga, `data-recargando` deja ver la portada diseñada. */
  useEffect(() => {
    const vivo = vivoRef.current;
    const embed = ref.current;
    const seCerro = estabaAbierta.current && !abierta;
    estabaAbierta.current = abierta;
    if (!seCerro || !vivo || !embed) return;

    vivo.setAttribute('data-recargando', '');
    embed.replaceChildren(crearBlockquote(post.url));
    let espera = 0;
    const observador = new MutationObserver(() => {
      const iframe = embed.querySelector('iframe');
      if (!iframe) return;
      observador.disconnect();
      iframe.addEventListener(
        'load',
        () => {
          espera = window.setTimeout(() => vivo.removeAttribute('data-recargando'), 200);
        },
        { once: true },
      );
    });
    observador.observe(embed, { childList: true, subtree: true });
    procesarEmbedsInstagram();
    return () => {
      observador.disconnect();
      clearTimeout(espera);
    };
  }, [abierta, post.url]);

  return (
    <div
      ref={vivoRef}
      className={styles.vivo}
      data-listo={listo || undefined}
      data-abierta={abierta || undefined}
    >
      <div className={styles.vivoScroll}>
        {abierta && !listo && <p className={styles.cargando}>Cargando publicación…</p>}
        {/* embed.js reemplaza el blockquote por un iframe; React solo
            monta y desmonta el div que lo envuelve. */}
        <div ref={ref} className={styles.embed}>
          <blockquote
            className="instagram-media"
            data-instgrm-permalink={limpiarUrlInstagram(post.url)}
            data-instgrm-version="14"
            style={ESTILO_BLOCKQUOTE}
          />
        </div>
      </div>
    </div>
  );
}

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

function Info({ post, puesto, onAbrir }: { post: PostInstagram; puesto: number; onAbrir: () => void }) {
  const { ref, valor } = useContadorAnimado<HTMLParagraphElement>(post.likes ?? 0);
  const esReel = post.tipo === 'video';

  return (
    <div className={styles.info}>
      <div className={styles.infoTexto}>
        <p className={styles.etiquetas}>
          <span className={styles.puesto}>#{puesto}</span>
          <span className={styles.chip}>{esReel ? 'Reel' : 'Carrusel'}</span>
          {post.cuenta && <span className={styles.cuenta}>@{post.cuenta}</span>}
          <span>{post.fecha.slice(0, 4)}</span>
        </p>
        <h2 className={styles.titulo}>{tituloDe(post)}</h2>
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
        <div className={styles.acciones}>
          <button type="button" className={styles.botonPrincipal} onClick={onAbrir}>
            {esReel ? <IconPlay size={15} /> : <IconCarousel size={15} />}
            Abrir {esReel ? 'reel' : 'carrusel'}
          </button>
          <a href={post.url} target="_blank" rel="noopener noreferrer" className={styles.botonSecundario}>
            Instagram <IconExternalLink size={13} />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function TopPage() {
  const { perfil, search } = usePerfil();
  const [indice, setIndice] = useState(INICIO);
  const [abierta, setAbierta] = useState(false);
  const [pausado, setPausado] = useState(false);
  const toque = useRef<{ x: number; y: number } | null>(null);
  const tiraRef = useRef<HTMLOListElement>(null);

  const enPieza = indice >= 0 && indice < FIN;
  const actual = enPieza ? top[indice] : null;
  // En el inicio el carrusel (como podio) se ordena como si estuviera en el #1.
  const base = enPieza ? indice : 0;

  useEffect(() => {
    document.title = `Top 20 · ${perfil.tituloDocumento}`;
  }, [perfil.tituloDocumento]);

  const ir = (destino: number) => {
    setIndice(Math.min(Math.max(destino, INICIO), FIN));
    setAbierta(false);
    setPausado(false);
  };

  // Flechas del teclado y Esc (cierra la publicación abierta).
  useEffect(() => {
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const paso = e.key === 'ArrowRight' ? 1 : -1;
        setIndice((i) => Math.min(Math.max(i + paso, INICIO), FIN));
        setAbierta(false);
        setPausado(false);
      } else if (e.key === 'Escape') {
        setAbierta(false);
      }
    };
    window.addEventListener('keydown', alPulsar);
    return () => window.removeEventListener('keydown', alPulsar);
  }, []);

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

  // Deslizar a los lados sobre las portadas avanza o retrocede.
  const alEmpezarToque = (e: TouchEvent) => {
    const t = e.touches[0];
    toque.current = { x: t.clientX, y: t.clientY };
  };
  const alTerminarToque = (e: TouchEvent) => {
    const inicio = toque.current;
    toque.current = null;
    if (!inicio || abierta) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - inicio.x;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(t.clientY - inicio.y)) {
      ir(indice + (dx < 0 ? 1 : -1));
    }
  };

  const detenido = pausado || abierta;
  const anuncio = actual
    ? `Puesto ${indice + 1} de ${FIN}: ${tituloDe(actual)}, ${formatearMetrica(actual.likes ?? 0)} interacciones`
    : '';

  return (
    <section
      className={styles.escena}
      data-modo={enPieza ? 'pieza' : indice === INICIO ? 'inicio' : 'fin'}
      data-cuenta={actual?.cuenta}
      data-abierta={abierta || undefined}
      aria-roledescription="carrusel"
      aria-label="Top 20 de publicaciones con más interacciones"
    >
      <div className={styles.fondo} aria-hidden="true">
        <span className={styles.mancha} />
        <span className={styles.mancha} />
        {actual && (
          <span key={indice} className={styles.fondoNumero}>
            {String(indice + 1).padStart(2, '0')}
          </span>
        )}
      </div>

      {/* Barras estilo historias: la activa se llena y, al terminar su
          animación, pasa a la siguiente. Pausar es pausar la animación. */}
      <div className={styles.segmentos} data-oculto={!enPieza || undefined}>
        {top.map((p, i) => (
          <button
            key={p.url}
            type="button"
            className={styles.segmento}
            data-estado={i < indice ? 'visto' : i === indice ? 'activo' : 'pendiente'}
            onClick={() => ir(i)}
            aria-label={`Ir al puesto ${i + 1}`}
            tabIndex={enPieza ? 0 : -1}
          >
            <span className={styles.pista}>
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
                onAnimationEnd={i === indice ? () => ir(indice + 1) : undefined}
              />
            </span>
          </button>
        ))}
      </div>

      {indice === INICIO && (
        <div className={styles.inicioTexto}>
          <p className={styles.eyebrow}>Redes sociales · {CUENTAS.join(' · ')}</p>
          <h1 className={styles.inicioTitulo}>
            Top <span>20</span>
          </h1>
          <p className={styles.inicioLead}>
            Las publicaciones que más conectaron con la audiencia, empezando por la que más
            interacciones tiene. En cada una, toca la portada para abrir el post.
          </p>
          <div className={styles.datos}>
            <Contador valor={TOTAL_TOP} etiqueta="interacciones en el Top 20" compacto />
            <Contador valor={MAXIMO} etiqueta="en la publicación #1" compacto />
          </div>
          <button type="button" className={styles.empezar} onClick={() => ir(0)}>
            <IconPlay size={18} /> Empezar por el #1
          </button>
        </div>
      )}

      {/* En el inicio, el mismo carrusel hace de podio con el #1, #2 y #3:
          sus posts cargan mientras se lee la portada y, al empezar, las
          tarjetas se despliegan en el carrusel sin recargar. */}
      {(enPieza || indice === INICIO) && (
        <div
          className={styles.carrusel}
          data-abierta={abierta || undefined}
          data-podio={!enPieza || undefined}
          aria-hidden={!enPieza || undefined}
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
                <Portada post={p} puesto={i + 1} />
                {distancia <= DISTANCIA_PRECARGA && <PostVivo post={p} abierta={centro && abierta} />}
                {centro && abierta ? (
                  <button
                    type="button"
                    className={styles.cerrar}
                    onClick={() => setAbierta(false)}
                    aria-label="Volver a la portada"
                  >
                    <IconClose size={18} />
                  </button>
                ) : (
                  // Capa encima del iframe: el clic abre la publicación (o
                  // lleva a esa tarjeta) en vez de salir a Instagram.
                  <button
                    type="button"
                    className={styles.capaAbrir}
                    tabIndex={centro ? 0 : -1}
                    onClick={() => (centro ? setAbierta(true) : ir(i))}
                    aria-label={centro ? `Abrir publicación: ${tituloDe(p)}` : undefined}
                  >
                    {centro && (
                      <>
                        <span className={styles.capaPuesto}>#{i + 1}</span>
                        <span className={styles.pistaAbrir}>Toca para abrir</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {actual && <Info key={indice} post={actual} puesto={indice + 1} onAbrir={() => setAbierta(true)} />}

      {indice === FIN && (
        <div className={styles.portadaFin}>
          <h2 className={styles.finTitulo}>Eso fue el Top 20</h2>
          <p className={styles.inicioLead}>
            {formatearMetrica(TOTAL_TOP)} interacciones entre 20 publicaciones en {CUENTAS.join(', ')}.
          </p>
          <div className={styles.finAcciones}>
            <button type="button" className={styles.empezar} onClick={() => ir(0)}>
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
      )}

      <div className={styles.controles}>
        <button
          type="button"
          className={styles.control}
          onClick={() => ir(indice - 1)}
          disabled={indice === INICIO}
          aria-label="Anterior"
        >
          <IconChevronLeft size={22} />
        </button>
        <span className={styles.contador}>
          {enPieza ? `${indice + 1} / ${FIN}` : indice === INICIO ? 'Inicio' : 'Fin'}
        </span>
        <button
          type="button"
          className={styles.control}
          onClick={() => setPausado((v) => !v)}
          disabled={!enPieza || abierta}
          aria-label={pausado ? 'Reanudar' : 'Pausar'}
        >
          {pausado ? <IconPlay size={18} /> : <IconPause size={18} />}
        </button>
        <button
          type="button"
          className={styles.control}
          onClick={() => ir(indice + 1)}
          disabled={indice === FIN}
          aria-label="Siguiente"
        >
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
        {anuncio}
      </p>
    </section>
  );
}
