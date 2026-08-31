import type { PerfilContenido, PerfilId } from '../types';
import { postsInstagram } from './posts-instagram';
import { articulosDigitales } from './articulos-digitales';

/* ──────────────────────────────────────────────────────────────
   Métricas derivadas del contenido real del portafolio.
   Al agregar un post o un artículo a `src/data/*`, los contadores
   se recalculan solos: no hay números escritos a mano dos veces.
   ────────────────────────────────────────────────────────────── */

const TOTAL_PIEZAS_IG = postsInstagram.length;
const TOTAL_INTERACCIONES = postsInstagram.reduce((suma, p) => suma + (p.likes ?? 0), 0);
const PROMEDIO_INTERACCIONES = Math.round(TOTAL_INTERACCIONES / TOTAL_PIEZAS_IG);
const PICO_INTERACCIONES = Math.max(...postsInstagram.map((p) => p.likes ?? 0));
const TOTAL_REELS = postsInstagram.filter((p) => p.tipo === 'video').length;
const TOTAL_CARRUSELES = postsInstagram.filter((p) => p.tipo === 'carrusel').length;
const TOTAL_DIGITALES = articulosDigitales.length;

/* `src/data/articulos-impresos.ts` todavía está vacío, así que estos dos
   valores vienen declarados desde la HV en PDF. Cuando se carguen las piezas
   impresas, reemplazar por `articulosImpresos.length`. */
const TOTAL_IMPRESOS = 5;
const TOTAL_REPORTAJES_TV = 1;
const TOTAL_PRENSA = TOTAL_DIGITALES + TOTAL_IMPRESOS;
const TOTAL_PIEZAS_PERIODISTICAS = TOTAL_PRENSA + TOTAL_REPORTAJES_TV;
const COBERTURAS_GENERO = 8;
const PLATAFORMAS = 4; // impreso · digital · televisión · redes sociales

/* Rutas del portafolio. Cada perfil declara cuáles expone; el resto quedan
   fuera del menú y redirigen a la portada. */
const RUTA_SOBRE_MI = '/';
const RUTAS_PERIODISMO = ['/articulos-impresos', '/articulos-digitales', '/reportaje'];
const RUTAS_REDES = ['/posts-instagram'];

/** Perfil que se carga cuando la URL no trae `?perfil=`. */
export const PERFIL_POR_DEFECTO: PerfilId = 'comunicadora';

export const PERFILES: Record<PerfilId, PerfilContenido> = {
  /* ─────────────── Community Manager ─────────────── */
  'community-manager': {
    id: 'community-manager',
    nombreCorto: 'Community Manager',
    rol: 'Community Manager & Digital Content Strategist',
    titular:
      'Estrategia digital, parrillas de contenido y analítica de redes para medios periodísticos.',
    sobreMi: [
      'Community Manager y creadora de contenido digital con formación en Comunicación Social y experiencia en el manejo de redes sociales de medios periodísticos de alto impacto: Cuestión Pública y Casa Editorial EL TIEMPO.',
      'Diseño parrillas de contenido a partir del análisis y selección de temas, y ejecuto el ciclo completo de producción: preproducción, grabación, edición en CapCut, diseño en Canva, redacción de copys y publicación de Reels, carruseles e historias.',
      'Trabajo con enfoque en datos: hago seguimiento de resultados en Instagram Insights y ajusto la estrategia de contenidos según el rendimiento real de cada formato.',
    ],
    metricas: [
      {
        id: 'cm-alcance',
        valor: TOTAL_INTERACCIONES,
        categoria: 'alcance',
        etiqueta: 'Alcance acumulado',
        detalle: 'Interacciones totales en Instagram',
        sufijo: '+',
        compacto: true,
      },
      {
        id: 'cm-piezas',
        valor: TOTAL_PIEZAS_IG,
        categoria: 'publicaciones',
        etiqueta: 'Piezas publicadas',
        detalle: `${TOTAL_REELS} Reels · ${TOTAL_CARRUSELES} carruseles`,
      },
      {
        id: 'cm-interacciones',
        valor: PROMEDIO_INTERACCIONES,
        categoria: 'interacciones',
        etiqueta: 'Promedio por pieza',
        detalle: 'Likes e interacciones por publicación',
        compacto: true,
      },
      {
        id: 'cm-pico',
        valor: PICO_INTERACCIONES,
        categoria: 'destacado',
        etiqueta: 'Pico de una pieza',
        detalle: 'Carrusel de mayor rendimiento',
        compacto: true,
      },
    ],
    habilidades: [
      { nombre: 'Edición de video (Reels)', nivel: 96 },
      { nombre: 'Copywriting y ganchos', nivel: 92 },
      { nombre: 'Parrillas de contenido', nivel: 90 },
      { nombre: 'Diseño de carruseles', nivel: 88 },
      { nombre: 'Analítica y métricas', nivel: 85 },
      { nombre: 'Storytelling / guion', nivel: 85 },
      { nombre: 'Community management', nivel: 82 },
    ],
    destacados: [
      `${TOTAL_REELS} Reels producidos y editados en CapCut, con un máximo de 50.700 interacciones en una sola pieza.`,
      `${TOTAL_CARRUSELES} carruseles diseñados en Canva: el formato de mayor rendimiento de la parrilla, con un pico de 69.000 interacciones.`,
      '8 piezas superaron las 10.000 interacciones y 14 superaron las 5.000, sobre 10 meses de publicación sostenida.',
      'Adaptación de investigación periodística densa (leyes, casos judiciales, datos de género) a formatos nativos de Instagram sin perder rigor informativo.',
    ],
    // Solo la evidencia de redes: las secciones de periodismo quedan ocultas.
    secciones: [RUTA_SOBRE_MI, ...RUTAS_REDES],
    cargos: {
      'Cuestión Pública': 'Community Manager · Creadora de contenido digital',
      'No Es Hora de Callar · Casa Editorial El Tiempo':
        'Creadora de contenido digital · Producción audiovisual',
      'Escuela de Periodismo Multimedia El Tiempo':
        'Reportera multimedia · Contenido para plataformas digitales',
      'Ventana U': 'Periodista · Producción y presentación',
      'Capital Enigma': 'Investigadora periodística para redes sociales',
    },
    tituloDocumento: 'Laura Hernández · Community Manager',
  },

  /* ─────────────── Periodista Multimedia ─────────────── */
  periodista: {
    id: 'periodista',
    nombreCorto: 'Periodista',
    rol: 'Periodista Multimedia & Investigadora',
    titular:
      'Reportería judicial, política y con enfoque de género para prensa digital, impresa y televisión.',
    sobreMi: [
      'Periodista multimedia e investigadora, formada en Comunicación Social y en la Escuela de Periodismo Multimedia de EL TIEMPO, con diplomado en reportería y presentación de noticias con énfasis en periodismo judicial y político.',
      'Mi trabajo está publicado en eltiempo.com y en la edición impresa de EL TIEMPO, además de un reportaje audiovisual emitido en Canal CityTV. Reporteo casos de justicia, desaparición forzada, trámite legislativo y violencia de género, con manejo de fuentes oficiales, víctimas y organizaciones de derechos humanos.',
      'Cubro además cultura y ciudad, y produzco para prensa escrita, digital y televisión.',
    ],
    metricas: [
      {
        id: 'per-publicaciones',
        valor: TOTAL_PIEZAS_PERIODISTICAS,
        categoria: 'publicaciones',
        etiqueta: 'Piezas periodísticas',
        detalle: `${TOTAL_DIGITALES} digitales · ${TOTAL_IMPRESOS} impresas · ${TOTAL_REPORTAJES_TV} en TV`,
      },
      {
        id: 'per-digitales',
        valor: TOTAL_DIGITALES,
        categoria: 'alcance',
        etiqueta: 'Artículos en eltiempo.com',
        detalle: 'Justicia, Política, Bogotá y Cultura',
      },
      {
        id: 'per-genero',
        valor: COBERTURAS_GENERO,
        categoria: 'interacciones',
        etiqueta: 'Coberturas de género y DD.HH.',
        detalle: 'Línea de trabajo sostenida',
      },
      {
        id: 'per-tv',
        valor: TOTAL_REPORTAJES_TV,
        categoria: 'destacado',
        etiqueta: 'Reportaje emitido en TV',
        detalle: 'Canal CityTV',
      },
    ],
    habilidades: [
      { nombre: 'Redacción y ortografía', nivel: 96 },
      { nombre: 'Edición de video / CapCut', nivel: 96 },
      { nombre: 'Investigación y verificación', nivel: 90 },
      { nombre: 'Reportería en terreno', nivel: 88 },
      { nombre: 'Periodismo judicial y político', nivel: 86 },
      { nombre: 'Enfoque de género y DD.HH.', nivel: 86 },
      { nombre: 'Producción para televisión', nivel: 84 },
    ],
    destacados: [
      'Investigación judicial: «Los misterios de la muerte de Baby Demoni», publicado en la sección de Investigación de EL TIEMPO y replicado en la edición impresa.',
      'Desaparición forzada: entrevista a Margarita Restrepo sobre 23 años de un caso sin respuesta institucional.',
      'Cubrimiento legislativo: aprobación en segundo debate de la Ley Jineth Bedoya Lima y de la ley contra la violencia digital.',
      'Ciudad y cultura: perros deambulantes en el Politécnico Grancolombiano, regreso de Limp Bizkit al festival Loserville e inauguración de la Bienal de Arte BOG25.',
    ],
    // Solo la evidencia periodística: la parrilla de Instagram queda oculta.
    secciones: [RUTA_SOBRE_MI, ...RUTAS_PERIODISMO],
    cargos: {
      'Cuestión Pública': 'Periodista · Contenido investigativo para audiencias digitales',
      'No Es Hora de Callar · Casa Editorial El Tiempo': 'Periodista con enfoque de género',
      'Escuela de Periodismo Multimedia El Tiempo': 'Reportera multimedia',
      'Ventana U': 'Periodista',
      'Capital Enigma': 'Investigadora periodística',
    },
    tituloDocumento: 'Laura Hernández · Periodista Multimedia',
  },

  /* ─────────────── Comunicadora Social ─────────────── */
  comunicadora: {
    id: 'comunicadora',
    nombreCorto: 'Comunicadora Social',
    rol: 'Comunicadora Social & Estratega Transmedia',
    titular:
      'Narrativas transmedia, producción audiovisual, oratoria y comunicación estratégica con enfoque de derechos.',
    sobreMi: [
      'Comunicadora Social con una visión integral del ecosistema de medios: concibo el mensaje una sola vez y lo despliego en todas las plataformas donde vive la audiencia.',
      'He trabajado el mismo tema como nota de prensa impresa, artículo digital, pieza para redes sociales y contenido para televisión en Cuestión Pública y la Casa Editorial EL TIEMPO. Mi portafolio acredita un ejercicio transmedia real, con piezas verificables en cada formato.',
      'Aporto pensamiento estratégico, oratoria y paso en cámara, y una comunicación con enfoque de derechos orientada a construir relación y confianza con las audiencias.',
    ],
    metricas: [
      {
        id: 'com-plataformas',
        valor: PLATAFORMAS,
        categoria: 'destacado',
        etiqueta: 'Plataformas gestionadas',
        detalle: 'Impreso · digital · TV · redes',
      },
      {
        id: 'com-alcance',
        valor: TOTAL_INTERACCIONES,
        categoria: 'alcance',
        etiqueta: 'Interacciones digitales',
        detalle: 'Alcance acumulado en redes sociales',
        sufijo: '+',
        compacto: true,
      },
      {
        id: 'com-prensa',
        valor: TOTAL_PRENSA,
        categoria: 'publicaciones',
        etiqueta: 'Publicaciones en prensa',
        detalle: `${TOTAL_DIGITALES} digitales · ${TOTAL_IMPRESOS} impresas`,
      },
      {
        id: 'com-interacciones',
        valor: PROMEDIO_INTERACCIONES,
        categoria: 'interacciones',
        etiqueta: 'Promedio por pieza',
        detalle: `Sobre ${TOTAL_PIEZAS_IG} publicaciones digitales`,
        compacto: true,
      },
    ],
    habilidades: [
      { nombre: 'Redacción y ortografía', nivel: 96 },
      { nombre: 'Producción audiovisual', nivel: 96 },
      { nombre: 'Narrativas transmedia', nivel: 90 },
      { nombre: 'Estrategia de contenidos', nivel: 88 },
      { nombre: 'Investigación', nivel: 85 },
      { nombre: 'Relación con audiencias', nivel: 85 },
      { nombre: 'Oratoria y presentación', nivel: 80 },
    ],
    destacados: [
      'Prensa impresa: piezas publicadas en la edición física de EL TIEMPO, el mismo material investigativo llevado del papel a la web.',
      `Digital: ${TOTAL_DIGITALES} artículos en eltiempo.com en Justicia, Política, Bogotá y Cultura, con enlaces verificables en el portafolio.`,
      'Televisión: producción, pietaje y pasos en cámara para programa televisivo, y un reportaje audiovisual publicado en Canal CityTV.',
      `Redes sociales: ${TOTAL_REELS} Reels y ${TOTAL_CARRUSELES} carruseles sostenidos durante 10 meses de publicación continua.`,
    ],
    // Perfil transmedia: es el único que muestra el portafolio completo.
    secciones: [RUTA_SOBRE_MI, ...RUTAS_PERIODISMO, ...RUTAS_REDES],
    cargos: {
      'Cuestión Pública': 'Estratega de contenidos digitales',
      'No Es Hora de Callar · Casa Editorial El Tiempo':
        'Comunicadora social · Producción transmedia',
      'Escuela de Periodismo Multimedia El Tiempo': 'Comunicadora multimedia',
      'Ventana U': 'Periodista · Producción y presentación de eventos',
      'Capital Enigma': 'Investigadora periodística',
    },
    tituloDocumento: 'Laura Hernández · Comunicadora Social',
  },
};

/** Orden en que se pintan las pestañas del selector de perfil. */
export const ORDEN_PERFILES: PerfilId[] = [
  'comunicadora',
  'periodista',
  'community-manager',
];

/** Type guard: ¿este string es un `PerfilId` válido? */
export function esPerfilValido(valor: string | null | undefined): valor is PerfilId {
  return valor != null && Object.prototype.hasOwnProperty.call(PERFILES, valor);
}
