/** Primer segmento de la URL de eltiempo.com → nombre de la sección. */
const SECCIONES: Record<string, string> = {
  justicia: 'Justicia',
  politica: 'Política',
  bogota: 'Bogotá',
  cultura: 'Cultura',
};

export function seccionDesdeUrl(url: string): string {
  const [primero, segundo] = new URL(url).pathname.split('/').filter(Boolean);
  // eltiempo.com/justicia/investigacion/… se publica en Investigación.
  if (segundo === 'investigacion') return 'Investigación';
  return SECCIONES[primero] ?? 'EL TIEMPO';
}
