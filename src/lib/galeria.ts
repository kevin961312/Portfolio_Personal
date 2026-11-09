import type { Album, AlbumListo } from '../types/galeria';
import { albumes } from '../data/galeria';
import { limpiarUrlInstagram } from './instagram';

/** Alfabeto con el que Instagram escribe el id de un post en su URL. */
const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

/** Milisegundos (época Unix) desde los que Instagram cuenta en sus ids. */
const EPOCA_INSTAGRAM = 1314220021721n;

/** Código del post: el segmento después de `/p/` (o `/reel/`). */
export function codigoDesdeUrl(url: string): string {
  const partes = limpiarUrlInstagram(url).split('/').filter(Boolean);
  const i = partes.findIndex((p) => p === 'p' || p === 'reel' || p === 'tv');
  return i >= 0 ? (partes[i + 1] ?? '') : (partes[partes.length - 1] ?? '');
}

/**
 * Fecha de publicación (AAAA-MM-DD, hora de Colombia) deducida del código
 * del post: los 41 bits altos del id son milisegundos desde la época de
 * Instagram. Así, agregar un álbum es solo pegar su URL.
 */
export function fechaDesdeCodigo(codigo: string): string {
  let id = 0n;
  for (const c of codigo) {
    const valor = ALFABETO.indexOf(c);
    if (valor < 0) return '';
    id = id * 64n + BigInt(valor);
  }
  const ms = Number((id >> 23n) + EPOCA_INSTAGRAM);
  // `en-CA` da AAAA-MM-DD; con la zona de Bogotá no se corre el día.
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(ms);
}

/** Deriva código, fecha y post de cada álbum y los ordena del más reciente al más antiguo. */
export function prepararAlbumes(lista: Album[]): AlbumListo[] {
  return lista
    .map((a) => {
      const codigo = codigoDesdeUrl(a.url);
      const fecha = a.fecha ?? fechaDesdeCodigo(codigo);
      return {
        ...a,
        codigo,
        fecha,
        post: {
          id: codigo,
          url: limpiarUrlInstagram(a.url),
          titulo: a.titulo,
          cuenta: a.cuenta,
          fecha,
          likes: a.likes,
          tipo: 'carrusel' as const,
          orientacion: a.orientacion,
        },
      };
    })
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
}

/* A mediodía para que la zona horaria no corra la fecha al día anterior. */
const aFecha = (iso: string) => new Date(`${iso}T12:00:00`);

const largo = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
const corto = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
const mes = new Intl.DateTimeFormat('es-CO', { month: 'short' });

/** «16 de agosto de 2025». */
export const formatearFechaLarga = (iso: string) => largo.format(aFecha(iso));

/** «16 ago 2025». */
export const formatearFechaCorta = (iso: string) => corto.format(aFecha(iso)).replace(/\./g, '').replace(/ de /g, ' ');

/** «AGO» (mes abreviado sin punto, en mayúsculas). */
export const formatearMes = (iso: string) => mes.format(aFecha(iso)).replace('.', '').toUpperCase();

/** Álbumes de la Galería, ya preparados y en orden de la línea de tiempo. */
export const ALBUMES: AlbumListo[] = prepararAlbumes(albumes);

/** Total de fotos sumando los álbumes que traen el dato. */
export const TOTAL_FOTOS = ALBUMES.reduce((suma, a) => suma + (a.fotos ?? 0), 0);
