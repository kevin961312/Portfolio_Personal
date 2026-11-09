import { useEffect, useRef, useState } from 'react';
import type { PostInstagram } from '../../types';
import { limpiarUrlInstagram, procesarEmbedsInstagram } from '../../lib/instagram';
import styles from './PostVivo.module.css';

/** El embed de Instagram no baja de este ancho (326 px + 2 de borde). */
const ANCHO_MINIMO_EMBED = 328;

/** Ni sube de este (540 px del blockquote). */
const ANCHO_MAXIMO_EMBED = 540;

/** Alto / ancho del video en un post horizontal (16:9). */
const PROPORCION_HORIZONTAL = 9 / 16;

/** Tiempo máximo con el loader visible antes de dejar solo la portada. */
const ESPERA_MAXIMA_MS = 15000;

interface Props {
  post: PostInstagram;
  /** Si recibe toques: reproducir el reel o pasar el carrusel. */
  interactivo?: boolean;
  /** Se llama la primera vez que alguien toca el post (el foco entra al iframe). */
  onTocado?: () => void;
}

/**
 * El post real de Instagram recortado a su imagen, sin el marco blanco:
 * el iframe sube lo que mide su cabecera y el contenedor (4:5, igual que
 * el post) esconde el pie. Lo de adentro del iframe no se puede tocar (es
 * otro dominio), solo recortarlo y escalarlo desde afuera.
 *
 * Va encima de una PortadaPost, que se ve mientras carga. El contenedor
 * tiene que ser `position: relative` y tener el tamaño de la tarjeta.
 *
 * Para cortar un reel que está sonando, el padre lo desmonta (o le cambia
 * la `key`): destruir el iframe es lo único que lo detiene seguro.
 */
export default function PostVivo({ post, interactivo = false, onTocado }: Props) {
  const vivoRef = useRef<HTMLDivElement>(null);
  const embedRef = useRef<HTMLDivElement>(null);
  const [listo, setListo] = useState(false);
  const [agotado, setAgotado] = useState(false);
  const tocadoRef = useRef(onTocado);
  const horizontal = post.orientacion === 'horizontal';

  useEffect(() => {
    tocadoRef.current = onTocado;
  }, [onTocado]);

  // Si en este tiempo no cargó, se quita el loader (Instagram bloqueado o caído).
  useEffect(() => {
    const espera = window.setTimeout(() => setAgotado(true), ESPERA_MAXIMA_MS);
    return () => clearTimeout(espera);
  }, []);

  // Carga el embed y marca la portada lista un instante después del `load`.
  useEffect(() => {
    const nodo = embedRef.current;
    if (!nodo) return;
    let espera = 0;
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

  /* Vertical: en tarjetas más angostas que el embed, en vez de cortarle
     los lados se encoge entero (--escala = ancho tarjeta / ancho embed).
     Horizontal: el video 16:9 se escala para cubrir el marco (sea 16:9,
     ancho o 4:5) y se centra; el sobrante queda fuera, como `cover`. */
  useEffect(() => {
    const vivo = vivoRef.current;
    if (!vivo || typeof ResizeObserver === 'undefined') return;
    const medir = () => {
      const ancho = vivo.clientWidth;
      if (!horizontal) {
        vivo.style.setProperty('--escala', String(Math.min(1, (ancho + 2) / ANCHO_MINIMO_EMBED)));
        return;
      }
      const alto = vivo.clientHeight;
      const anchoEmbed = Math.min(ANCHO_MAXIMO_EMBED, Math.max(ANCHO_MINIMO_EMBED, ancho));
      const altoVideo = anchoEmbed * PROPORCION_HORIZONTAL;
      const escala = Math.max(ancho / anchoEmbed, alto / altoVideo);
      vivo.style.setProperty('--ancho-embed', `${anchoEmbed}px`);
      vivo.style.setProperty('--escala', String(escala));
      vivo.style.setProperty('--dx', `${(ancho - anchoEmbed * escala) / 2}px`);
      vivo.style.setProperty('--dy', `${(alto - altoVideo * escala) / 2}px`);
    };
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(vivo);
    return () => observador.disconnect();
  }, [horizontal]);

  /* Tocar un iframe de otro dominio no avisa a la página, pero el foco
     entra en él: así se sabe que lo usaron. La ventana suele perder el
     foco en ese momento (`blur`), pero no siempre (si no lo tenía antes),
     así que además se revisa cada poco mientras el post esté en vivo. */
  useEffect(() => {
    if (!interactivo) return;
    let avisado = false;
    const revisar = () => {
      const activo = document.activeElement;
      if (!avisado && activo instanceof HTMLIFrameElement && vivoRef.current?.contains(activo)) {
        avisado = true;
        tocadoRef.current?.();
      }
    };
    const alPerderFoco = () => window.setTimeout(revisar, 0);
    window.addEventListener('blur', alPerderFoco);
    const intervalo = window.setInterval(revisar, 300);
    return () => {
      window.removeEventListener('blur', alPerderFoco);
      clearInterval(intervalo);
    };
  }, [interactivo]);

  return (
    <>
      {/* Loader sobre la portada mientras llega el post real. Va fuera de
          `.vivo`, que es invisible hasta estar listo. Si Instagram no
          responde (bloqueado), se quita y queda solo la portada. */}
      {!listo && !agotado && (
        <span className={styles.cargando} role="status" aria-label="Cargando publicación">
          <span className={styles.giro} />
        </span>
      )}
      <div
        ref={vivoRef}
        className={styles.vivo}
        data-listo={listo || undefined}
        data-interactivo={interactivo || undefined}
        data-horizontal={horizontal || undefined}
      >
        {/* embed.js reemplaza el blockquote por un iframe; React solo monta
            y desmonta el div que lo envuelve. */}
        <div ref={embedRef} className={styles.embed}>
          <blockquote
            className="instagram-media"
            data-instgrm-permalink={limpiarUrlInstagram(post.url)}
            data-instgrm-version="14"
            style={{ margin: 0, width: '100%', minWidth: 0, maxWidth: 540, border: 0, padding: 0 }}
          />
        </div>
      </div>
    </>
  );
}
