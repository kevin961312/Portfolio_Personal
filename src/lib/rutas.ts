/** Antepone `BASE_URL` (`/` con el dominio lamartineris.site) a un archivo de `public/`. */
export function rutaPublica(ruta: string): string {
  return `${import.meta.env.BASE_URL}${ruta.replace(/^\//, '')}`;
}
