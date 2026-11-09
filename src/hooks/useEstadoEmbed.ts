import { useEffect, useState } from 'react';
import type { RefObject } from 'react';

export type EstadoEmbed = 'cargando' | 'listo' | 'fallo';

/** Lo mismo que espera PostVivo antes de quitar su loader. */
const ESPERA_MAXIMA_MS = 15000;

/**
 * Estado del PostVivo que vive dentro de `ref`, leído desde afuera (sin
 * tocar PostVivo): `listo` cuando pone `data-listo` en su capa y `fallo`
 * si en 15 s no llegó (Instagram bloqueado o caído). `clave` es la `key`
 * del PostVivo: si cambia (se recargó), vuelve a `cargando`.
 */
export function useEstadoEmbed(ref: RefObject<HTMLElement | null>, montado: boolean, clave = '') {
  const [estado, setEstado] = useState<{ clave: string | null; valor: EstadoEmbed }>({
    clave: null,
    valor: 'cargando',
  });

  useEffect(() => {
    const nodo = ref.current;
    if (!nodo || !montado) return;
    const revisar = () => {
      if (!nodo.querySelector('[data-listo]')) return;
      setEstado({ clave, valor: 'listo' });
      observador.disconnect();
    };
    const observador = new MutationObserver(revisar);
    observador.observe(nodo, { attributes: true, subtree: true, attributeFilter: ['data-listo'] });
    // Puede que ya estuviera listo (el mismo nodo cargó antes).
    const inicial = window.setTimeout(revisar, 0);
    const espera = window.setTimeout(() => {
      setEstado((previo) => (previo.clave === clave && previo.valor === 'listo' ? previo : { clave, valor: 'fallo' }));
    }, ESPERA_MAXIMA_MS);
    return () => {
      observador.disconnect();
      clearTimeout(inicial);
      clearTimeout(espera);
    };
  }, [ref, montado, clave]);

  return estado.clave === clave ? estado.valor : 'cargando';
}
