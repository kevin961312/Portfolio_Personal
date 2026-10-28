import { useEffect, useRef, useState } from 'react';
import type { PostInstagram } from '../../types';
import { limpiarUrlInstagram, procesarEmbedsInstagram } from '../../lib/instagram';
import styles from './PostVivo.module.css';

/** El embed de Instagram no baja de este ancho (326 px + 2 de borde). */
const ANCHO_MINIMO_EMBED = 328;

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
  const tocadoRef = useRef(onTocado);

  useEffect(() => {
    tocadoRef.current = onTocado;
  }, [onTocado]);

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

  /* En tarjetas más angostas que el embed, en vez de cortarle los lados
     se encoge entero: --escala = ancho de la tarjeta / ancho del embed. */
  useEffect(() => {
    const vivo = vivoRef.current;
    if (!vivo || typeof ResizeObserver === 'undefined') return;
    const medir = () => {
      const escala = Math.min(1, (vivo.clientWidth + 2) / ANCHO_MINIMO_EMBED);
      vivo.style.setProperty('--escala', String(escala));
    };
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(vivo);
    return () => observador.disconnect();
  }, []);

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
    <div
      ref={vivoRef}
      className={styles.vivo}
      data-listo={listo || undefined}
      data-interactivo={interactivo || undefined}
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
  );
}
