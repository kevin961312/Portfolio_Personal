import { useCallback, useSyncExternalStore } from 'react';

/** `true` mientras la media query se cumple; se actualiza al redimensionar. */
export function useMediaQuery(consulta: string): boolean {
  const suscribir = useCallback(
    (avisar: () => void) => {
      const lista = window.matchMedia(consulta);
      lista.addEventListener('change', avisar);
      return () => lista.removeEventListener('change', avisar);
    },
    [consulta],
  );
  return useSyncExternalStore(
    suscribir,
    () => window.matchMedia(consulta).matches,
    () => false,
  );
}

/** Mismo corte que el CSS del sitio: por debajo de 900 px es celular o tablet. */
export const CONSULTA_MOVIL = '(max-width: 899px)';
