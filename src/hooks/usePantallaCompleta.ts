import { useCallback, useEffect, useState } from 'react';
import type { RefObject } from 'react';

/**
 * Pantalla completa (Fullscreen API) sobre el elemento `ref`.
 * `soportada` es `false` donde la API no existe (iPhone): ahí quien lo use
 * decide la alternativa (ocultar el botón o un modo por CSS).
 */
export function usePantallaCompleta(ref: RefObject<HTMLElement | null>) {
  const [activa, setActiva] = useState(false);
  const soportada = typeof document !== 'undefined' && document.fullscreenEnabled === true;

  useEffect(() => {
    if (!soportada) return;
    const alCambiar = () => setActiva(document.fullscreenElement != null && document.fullscreenElement === ref.current);
    document.addEventListener('fullscreenchange', alCambiar);
    return () => document.removeEventListener('fullscreenchange', alCambiar);
  }, [ref, soportada]);

  const entrar = useCallback(() => {
    const nodo = ref.current;
    if (!soportada || !nodo || document.fullscreenElement === nodo) return;
    nodo.requestFullscreen?.().catch(() => {
      /* Rechazada (sin gesto del usuario o política del navegador): se sigue igual. */
    });
  }, [ref, soportada]);

  const salir = useCallback(() => {
    if (document.fullscreenElement && document.fullscreenElement === ref.current) {
      document.exitFullscreen().catch(() => {});
    }
  }, [ref]);

  const alternar = useCallback(() => {
    if (document.fullscreenElement === ref.current) salir();
    else entrar();
  }, [ref, entrar, salir]);

  return { activa, soportada, entrar, salir, alternar };
}
