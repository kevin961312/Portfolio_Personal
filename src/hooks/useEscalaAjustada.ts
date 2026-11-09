import { useEffect, useState } from 'react';
import type { RefObject } from 'react';

/**
 * Escala con la que una caja de `ancho × alto` px cabe entera dentro del
 * elemento `ref` (se recalcula al redimensionar). Sirve para agrandar un
 * embed desde afuera con `transform: scale()` sin tocar su contenido.
 * `maxima` pone un tope (más allá, las fotos del embed se ven blandas).
 */
export function useEscalaAjustada(
  ref: RefObject<HTMLElement | null>,
  ancho: number,
  alto: number,
  maxima = Infinity,
  activo = true,
) {
  const [escala, setEscala] = useState(1);

  useEffect(() => {
    const nodo = ref.current;
    if (!nodo || !activo || typeof ResizeObserver === 'undefined') return;
    const medir = () => {
      const libreAncho = nodo.clientWidth;
      const libreAlto = nodo.clientHeight;
      if (libreAncho === 0 || libreAlto === 0) return;
      setEscala(Math.min(libreAncho / ancho, libreAlto / alto, maxima));
    };
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(nodo);
    return () => observador.disconnect();
  }, [ref, ancho, alto, maxima, activo]);

  return escala;
}
