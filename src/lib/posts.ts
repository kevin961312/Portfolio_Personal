import type { PostInstagram } from '../types';
import { CUENTAS } from '../data/sitio';

/** Iniciales para el avatar de las portadas diseñadas (se editan en `src/data/sitio.ts`). */
export const INICIALES_CUENTA: Record<string, string> = Object.fromEntries(
  Object.entries(CUENTAS).map(([cuenta, c]) => [cuenta, c.iniciales]),
);

/** Nombre visible de cada cuenta. */
export const NOMBRE_CUENTA: Record<string, string> = Object.fromEntries(
  Object.entries(CUENTAS).map(([cuenta, c]) => [cuenta, c.nombre]),
);

export const tituloPost = (p: PostInstagram) =>
  p.titulo || (p.tipo === 'video' ? 'Reel para Instagram' : 'Carrusel para Instagram');

export const porLikes = (a: PostInstagram, b: PostInstagram) => (b.likes ?? 0) - (a.likes ?? 0);

/* `fecha` es ISO (AAAA-MM-DD), así que compararla como texto ya ordena bien. */
export const porFecha = (a: PostInstagram, b: PostInstagram) => b.fecha.localeCompare(a.fecha);

/** Piezas con al menos este número de interacciones llevan el sello «Top». */
export const UMBRAL_TOP = 10000;
