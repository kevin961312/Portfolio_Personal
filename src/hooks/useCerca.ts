import { useEffect, useRef, useState } from 'react';

/**
 * `true` mientras el elemento está en pantalla o cerca (`margen` por
 * encima y por debajo). Sirve para montar los posts en vivo solo cuando
 * se van a ver y desmontarlos al alejarse, sin cargar decenas de iframes.
 */
export function useCerca<T extends HTMLElement>(margen = '600px') {
  const ref = useRef<T>(null);
  const [cerca, setCerca] = useState(false);

  useEffect(() => {
    const nodo = ref.current;
    if (!nodo || typeof IntersectionObserver === 'undefined') return;
    const observador = new IntersectionObserver(([entrada]) => setCerca(entrada.isIntersecting), {
      rootMargin: `${margen} 0px`,
    });
    observador.observe(nodo);
    return () => observador.disconnect();
  }, [margen]);

  return { ref, cerca };
}
