import { useCallback, useState } from 'react';

/**
 * Para carruseles y feeds: dice si la pieza `i` debe tener su post en vivo.
 * Carga las que están a `distancia` o menos del `centro` y, una vez
 * cargada, la pieza se queda montada aunque luego quede lejos, así no
 * vuelve a cargar al regresar a ella.
 */
export function useYaCargados(centro: number, distancia: number) {
  const [cargados, setCargados] = useState<ReadonlySet<number>>(() => new Set());

  const faltan: number[] = [];
  for (let i = centro - distancia; i <= centro + distancia; i++) {
    if (i >= 0 && !cargados.has(i)) faltan.push(i);
  }
  // Ajuste durante el render (patrón de React para estado derivado de props).
  if (faltan.length > 0) setCargados((previos) => new Set([...previos, ...faltan]));

  return useCallback(
    (i: number) => Math.abs(i - centro) <= distancia || cargados.has(i),
    [centro, distancia, cargados],
  );
}
