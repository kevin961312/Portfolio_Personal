/** Formateo numérico en español de Colombia (miles con `.`, decimales con `,`). */
const nfEntero = new Intl.NumberFormat('es-CO');
const nfDecimal = new Intl.NumberFormat('es-CO', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

/**
 * Formatea el valor de una métrica.
 *
 * `compacto = false` → 287335 → «287.335»
 * `compacto = true`  → 287335 → «287K» · 8707 → «8,7K» · 33 → «33»
 */
export function formatearMetrica(valor: number, compacto = false): string {
  if (!compacto || valor < 1000) return nfEntero.format(Math.round(valor));

  const miles = valor / 1000;
  // A partir de 10.000 el decimal deja de aportar información útil.
  return miles >= 10
    ? `${nfEntero.format(Math.round(miles))}K`
    : `${nfDecimal.format(miles)}K`;
}
