/** Antepone `BASE_URL` (`/Portfolio_Personal/` en GitHub Pages) a un archivo de `public/`. */
export function rutaPublica(ruta: string): string {
  return `${import.meta.env.BASE_URL}${ruta.replace(/^\//, '')}`;
}
