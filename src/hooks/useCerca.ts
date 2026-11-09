import { useEffect, useRef, useState } from 'react';

/**
 * `true` cuando el elemento está en pantalla o cerca (`margen` por encima
 * y por debajo). Sirve para montar los posts en vivo solo cuando se van a
 * ver, sin cargar decenas de iframes al abrir la página.
 *
 * Con `mantener`, una vez que se acerca se queda en `true`: el post ya
 * cargado no se desmonta al alejarse y no vuelve a cargar al regresar.
 */
export function useCerca<T extends HTMLElement>(margen = '600px', mantener = false) {
  const ref = useRef<T>(null);
  const [cerca, setCerca] = useState(false);

  useEffect(() => {
    const nodo = ref.current;
    if (!nodo || typeof IntersectionObserver === 'undefined') return;
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (mantener && entrada.isIntersecting) {
          setCerca(true);
          observador.disconnect();
          return;
        }
        setCerca(entrada.isIntersecting);
      },
      { rootMargin: `${margen} 0px` },
    );
    observador.observe(nodo);
    return () => observador.disconnect();
  }, [margen, mantener]);

  return { ref, cerca };
}
