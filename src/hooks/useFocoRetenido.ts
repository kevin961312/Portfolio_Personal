import { useEffect, useRef, type RefObject } from 'react';

const esVisible = (el: HTMLElement) => el.getClientRects().length > 0;

/**
 * Mantiene el foco dentro de un contenedor que maneja el teclado con su
 * propio `onKeyDown` (visor, sala de proyección).
 *
 * Si el control enfocado se deshabilita (p. ej. «Siguiente» al llegar al
 * final) o se desmonta (una ficha que re-entra con otra `key`), el navegador
 * manda el foco a `<body>` y las teclas del contenedor dejan de responder.
 * Tras cada render se revisa ese caso y el foco vuelve a un botón
 * equivalente habilitado (misma `aria-label`) o, si no hay, al contenedor.
 *
 * El contenedor debe poder recibir foco (`tabIndex`).
 */
export function useFocoRetenido(ref: RefObject<HTMLElement | null>, activo = true) {
  const ultimo = useRef<HTMLElement | null>(null);

  // Recuerda el último elemento enfocado dentro del contenedor.
  useEffect(() => {
    const contenedor = ref.current;
    if (!contenedor) return;
    const alEntrar = (e: FocusEvent) => {
      ultimo.current = e.target instanceof HTMLElement ? e.target : null;
    };
    const alSalir = (e: FocusEvent) => {
      const destino = e.relatedTarget;
      // Sin destino (`null`) puede ser justo el foco perdido: se conserva.
      if (destino instanceof Node && !contenedor.contains(destino)) ultimo.current = null;
    };
    contenedor.addEventListener('focusin', alEntrar);
    contenedor.addEventListener('focusout', alSalir);
    return () => {
      contenedor.removeEventListener('focusin', alEntrar);
      contenedor.removeEventListener('focusout', alSalir);
    };
  }, [ref]);

  // Tras cada render: ¿el control enfocado quedó deshabilitado o fuera del DOM?
  useEffect(() => {
    const contenedor = ref.current;
    const previo = ultimo.current;
    if (!activo || !contenedor || !previo || previo === contenedor) return;
    const deshabilitado = 'disabled' in previo && previo.disabled === true;
    if (previo.isConnected && !deshabilitado) return;
    const enfocado = document.activeElement;
    if (enfocado && enfocado !== document.body && enfocado !== previo) return;

    const etiqueta = previo.getAttribute('aria-label');
    const gemelo = etiqueta
      ? Array.from(contenedor.querySelectorAll<HTMLButtonElement>('button')).find(
          (b) => b !== previo && !b.disabled && b.getAttribute('aria-label') === etiqueta && esVisible(b),
        )
      : undefined;
    const destino = gemelo ?? contenedor;
    ultimo.current = destino;
    destino.focus({ preventScroll: true });
  });
}
