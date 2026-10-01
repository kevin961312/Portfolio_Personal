/* ──────────────────────────────────────────────────────────────
   Métricas de la Hoja de Vida leídas desde las MISMAS fuentes que
   alimentan la web (`src/data/*.ts`), para que el PDF y el sitio
   nunca muestren cifras distintas.

   `src/data/perfiles.ts` hace este mismo cálculo en TypeScript; aquí
   se replica leyendo los literales del archivo, sin compilar TS.
   ────────────────────────────────────────────────────────────── */

import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const leer = (ruta) => readFileSync(join(RAIZ, ruta), 'utf8');

/** Extrae el arreglo literal que sigue a `export const <nombre>` y lo evalúa. */
function arregloLiteral(fuente, nombre) {
  const inicio = fuente.indexOf(`export const ${nombre}`);
  if (inicio === -1) throw new Error(`No se encontró «${nombre}» en la fuente`);

  // El `[` del tipo (`: PostInstagram[]`) va antes del `=`; hay que saltarlo.
  const igual = fuente.indexOf('=', inicio);
  const abre = fuente.indexOf('[', igual);
  let profundidad = 0;
  let cierra = abre;

  for (let i = abre; i < fuente.length; i++) {
    if (fuente[i] === '[') profundidad++;
    else if (fuente[i] === ']' && --profundidad === 0) {
      cierra = i;
      break;
    }
  }

  // Los literales son datos puros (sin llamadas ni identificadores libres),
  // así que basta con evaluarlos como expresión.
  return new Function(`return ${fuente.slice(abre, cierra + 1)};`)();
}

const posts = arregloLiteral(leer('src/data/posts-instagram.ts'), 'postsInstagram');
const digitales = arregloLiteral(leer('src/data/articulos-digitales.ts'), 'articulosDigitales');

const likes = posts.map((p) => p.likes ?? 0);
const ordenados = [...likes].sort((a, b) => a - b);
const mitad = Math.floor(ordenados.length / 2);

/* La web etiqueta como «promedio por pieza» la MEDIANA de interacciones
   (`src/data/perfiles.ts`); se replica el mismo criterio. */
const mediana =
  ordenados.length === 0
    ? 0
    : ordenados.length % 2 !== 0
      ? ordenados[mitad]
      : Math.round((ordenados[mitad - 1] + ordenados[mitad]) / 2);

/* `src/data/articulos-impresos.ts` sigue vacío: estos dos valores se
   declaran a mano igual que en la web. */
const IMPRESOS = 5;
const REPORTAJES_TV = 1;

const reels = posts.filter((p) => p.tipo === 'video').map((p) => p.likes ?? 0);
const carruseles = posts.filter((p) => p.tipo === 'carrusel').map((p) => p.likes ?? 0);
const media = (lista) =>
  lista.length === 0 ? 0 : Math.round(lista.reduce((suma, n) => suma + n, 0) / lista.length);

/** Meses cumplidos entre la primera y la última publicación. */
const fechas = posts.map((p) => p.fecha).filter(Boolean).sort();
const meses =
  fechas.length < 2
    ? 0
    : Math.round(
        (new Date(fechas[fechas.length - 1]) - new Date(fechas[0])) / (1000 * 60 * 60 * 24 * 30.44),
      );

export const M = {
  piezasIg: posts.length,
  interacciones: likes.reduce((suma, n) => suma + n, 0),
  mediana,
  pico: Math.max(...likes),
  reels: reels.length,
  carruseles: carruseles.length,
  mediaReels: media(reels),
  mediaCarruseles: media(carruseles),
  picoCarrusel: Math.max(...carruseles),
  sobre10k: likes.filter((n) => n >= 10000).length,
  sobre5k: likes.filter((n) => n >= 5000).length,
  meses,
  digitales: digitales.length,
  impresos: IMPRESOS,
  reportajesTv: REPORTAJES_TV,
  prensa: digitales.length + IMPRESOS,
  piezasPeriodisticas: digitales.length + IMPRESOS + REPORTAJES_TV,
  coberturasGenero: 8,
  plataformas: 4, // impreso · digital · televisión · redes sociales
};

/** 287335 → «287K», 4320 → «4.3K» (mismo formato compacto de la web). */
export function compacto(n) {
  if (n < 1000) return String(n);
  const miles = n / 1000;
  return `${miles >= 100 ? Math.round(miles) : miles.toFixed(1).replace('.0', '')}K`;
}

/** 287335 → «287.335» (separador de miles en español). */
export const miles = (n) => n.toLocaleString('es-CO');
