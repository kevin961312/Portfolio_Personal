/* ──────────────────────────────────────────────────────────────
   Contenido de las tres versiones de la Hoja de Vida.

   Fuente de verdad: la web (`src/pages/SobreMiPage.tsx` para la
   experiencia, la educación y las referencias; `src/data/perfiles.ts`
   para el rol, el «sobre mí», las métricas, los destacados y las
   habilidades). Este archivo es el reflejo en papel de esos mismos
   datos: si cambia la web, cambia aquí.

   Las cifras no se escriben a mano: salen de `hv/metricas.mjs`, que
   las calcula desde `src/data/*.ts` igual que el sitio.

       node hv/generar.mjs
   ────────────────────────────────────────────────────────────── */

import { M, compacto, miles } from './metricas.mjs';

export const SITIO = 'https://kevin961312.github.io/Portfolio_Personal/';

/** Datos comunes a las tres versiones. */
export const COMUN = {
  nombre: 'LAURA HERNÁNDEZ',
  nombreCompleto: 'Laura Viviana Hernández Martin',

  /* Los mismos contactos que muestra la web en «Sobre mí». */
  telefono: '3222448811',
  correo: 'laurahernandezfcb@hotmail.com',
  ubicacion: 'Bogotá',

  educacion: [
    {
      periodo: '2025 – 2026',
      titulo: 'Programa de la Escuela de Periodismo Multimedia EL TIEMPO',
      institucion: 'El Tiempo',
    },
    {
      periodo: '2024',
      titulo: 'Diplomado en Reportería y presentación de noticias con énfasis en periodismo judicial y político',
      institucion: 'Universidad Cooperativa de Colombia',
    },
    {
      periodo: '2021 – 2026',
      titulo: 'Comunicación Social',
      institucion: 'Universidad Cooperativa de Colombia',
    },
  ],

  /* Experiencia y proyectos son comunes a los tres perfiles; lo único
     que cambia es el cargo, que cada perfil resuelve en `cargos`. */
  experiencia: [
    {
      periodo: '2026 – Actualmente',
      empresa: 'Cuestión Pública',
      items: [
        'Análisis y selección de temas para creación de parrillas de contenido.',
        'Pre producción, producción, edición y publicación de carruseles, reels e historias para Instagram.',
        'Seguimiento de resultados y creación de estrategia.',
      ],
    },
    {
      periodo: '2025 – 2026',
      empresa: 'No Es Hora de Callar · Casa Editorial El Tiempo',
      items: [
        'Investigación y redacción de notas periodísticas para el periódico digital e impreso.',
        'Creación de parrillas de contenido, carruseles, reels e historias para Instagram.',
        'Producción, pietaje y pasos en cámara para programa televisivo.',
      ],
    },
    {
      periodo: '2025 – 2026',
      empresa: 'Escuela de Periodismo Multimedia El Tiempo',
      items: [
        'Investigación y redacción de notas periodísticas para el periódico digital e impreso.',
        'Cobertura fotográfica y en video de conciertos y eventos.',
        'Producción de nota periodística para televisión.',
      ],
    },
  ],

  proyectos: [
    {
      periodo: '2024 – 2025',
      empresa: 'Ventana U',
      items: [
        'Realización de notas en video y escritas para este periódico universitario.',
        'Trabajo de producción, edición y presentación de eventos.',
      ],
    },
    {
      periodo: '2024',
      empresa: 'Capital Enigma',
      items: [
        'Investigación periodística para creación de contenido en redes sociales sobre casos judiciales mediáticos.',
      ],
    },
  ],

  referencias: [
    {
      nombre: 'Carlos Solano',
      cargo: 'Director de Escuela de Periodismo Multimedia EL TIEMPO y Editor de Podcasts',
      telefono: '320 865 1735',
      correo: 'carsol@eltiempo.com',
    },
    {
      nombre: 'Abrahán Gutiérrez Navarro',
      cargo: 'Periodista y Publicista',
      telefono: '316 981 2674',
    },
  ],

  /* Cierre de la carta de presentación: viene de la HV original. */
  cierre:
    'Destaco por mi creatividad, curiosidad, aprendizaje continuo y habilidades de liderazgo.',
};

export const HOJAS = [
  /* ═════════════════ Comunicadora Social ═════════════════ */
  {
    perfil: 'comunicadora',
    archivo: 'CV_Laura_Hernandez_Comunicadora_Social.pdf',
    tituloDoc: 'CV Laura Hernández — Comunicadora Social',
    rol: 'Comunicadora Social',
    subrol: 'Estratega Transmedia',
    perfilTexto: [
      'Comunicadora Social con una visión integral del ecosistema de medios: desarrollo una idea central y la adapto estratégicamente a cada plataforma, formato y audiencia.',
      'He trabajado el mismo tema como nota de prensa impresa, artículo digital, pieza para redes sociales y contenido para televisión en Cuestión Pública y la Casa Editorial EL TIEMPO. Mi portafolio acredita un ejercicio transmedia real, con piezas verificables en cada formato.',
      'Aporto pensamiento estratégico, oratoria y paso en cámara, y una comunicación con enfoque de derechos orientada a construir relación y confianza con las audiencias.',
    ],
    metricasTitulo: 'Alcance',
    metricas: [
      { valor: String(M.plataformas), etiqueta: 'Plataformas gestionadas' },
      { valor: `${compacto(M.interacciones)}+`, etiqueta: 'Interacciones digitales' },
      { valor: String(M.prensa), etiqueta: 'Publicaciones en prensa' },
      { valor: compacto(M.mediana), etiqueta: 'Promedio por pieza' },
    ],
    destacados: [
      'Prensa impresa: piezas publicadas en la edición física de EL TIEMPO, el mismo material investigativo llevado del papel a la web.',
      `Digital: ${M.digitales} artículos en eltiempo.com en Justicia, Política, Bogotá y Cultura, con enlaces verificables en el portafolio.`,
      'Televisión: producción, pietaje y pasos en cámara para programa televisivo, y un reportaje audiovisual publicado en Canal CityTV.',
      `Redes sociales: ${M.reels} Reels y ${M.carruseles} carruseles sostenidos durante ${M.meses} meses de publicación continua.`,
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
    herramientas: ['CapCut', 'Canva', 'Instagram Insights', 'Producción de TV', 'Fotografía y video'],
    cargos: {
      'Cuestión Pública': 'Estratega de contenidos digitales',
      'No Es Hora de Callar · Casa Editorial El Tiempo': 'Comunicadora social · Producción transmedia',
      'Escuela de Periodismo Multimedia El Tiempo': 'Comunicadora multimedia',
      'Ventana U': 'Periodista · Producción y presentación de eventos',
      'Capital Enigma': 'Investigadora periodística',
    },
  },

  /* ═════════════════ Periodista Multimedia ═════════════════ */
  {
    perfil: 'periodista',
    archivo: 'CV_Laura_Hernandez_Periodista_Multimedia.pdf',
    tituloDoc: 'CV Laura Hernández — Periodista Multimedia',
    rol: 'Periodista Multimedia',
    subrol: 'Investigadora',
    perfilTexto: [
      'Periodista multimedia e investigadora, formada en Comunicación Social y en la Escuela de Periodismo Multimedia de EL TIEMPO, con diplomado en reportería y presentación de noticias, con énfasis en periodismo judicial y político.',
      'Mi trabajo ha sido publicado en eltiempo.com y en la edición impresa de EL TIEMPO, además de contar con un reportaje audiovisual emitido por Canal CityTV. Tengo experiencia en reportería, investigación periodística y cobertura de temas de interés público, con manejo de fuentes oficiales, testimoniales, institucionales y expertas.',
      'También cubro temas de cultura y ciudad, y desarrollo contenidos para prensa escrita, plataformas digitales y televisión, adaptando la información a distintos formatos y audiencias.',
    ],
    metricasTitulo: 'Trabajo publicado',
    metricas: [
      { valor: String(M.piezasPeriodisticas), etiqueta: 'Piezas periodísticas' },
      { valor: String(M.digitales), etiqueta: 'Artículos en eltiempo.com' },
      { valor: String(M.coberturasGenero), etiqueta: 'Coberturas de género y DD.HH.' },
      { valor: String(M.reportajesTv), etiqueta: 'Reportaje emitido en TV' },
    ],
    destacados: [
      'Los misterios de la muerte de Baby Demoni, publicado en la sección de Investigación de EL TIEMPO y replicado en la edición impresa.',
      'Entrevista a Margarita Restrepo sobre 23 años de un caso sin respuesta institucional.',
      'Aprobación en segundo debate de la Ley Jineth Bedoya Lima y de la ley contra la violencia digital.',
      'Perros deambulantes en el Politécnico Grancolombiano, regreso de Limp Bizkit al festival Loserville e inauguración de la Bienal de Arte BOG25.',
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
    herramientas: ['CapCut', 'Canva', 'Fotografía y video', 'Entrevista en profundidad', 'Paso en cámara'],
    cargos: {
      'Cuestión Pública': 'Periodista · Contenido investigativo para audiencias digitales',
      'No Es Hora de Callar · Casa Editorial El Tiempo': 'Periodista con enfoque de género',
      'Escuela de Periodismo Multimedia El Tiempo': 'Reportera multimedia',
      'Ventana U': 'Periodista',
      'Capital Enigma': 'Investigadora periodística',
    },
  },

  /* ═════════════════ Community Manager ═════════════════ */
  {
    perfil: 'community-manager',
    archivo: 'CV_Laura_Hernandez_Community_Manager.pdf',
    tituloDoc: 'CV Laura Hernández — Community Manager',
    rol: 'Community Manager',
    subrol: 'Digital Content Strategist',
    perfilTexto: [
      'Community Manager y creadora de contenido digital con formación en Comunicación Social y experiencia en el manejo de redes sociales de medios periodísticos de alto impacto: Cuestión Pública y Casa Editorial EL TIEMPO.',
      'Diseño parrillas de contenido a partir del análisis y selección de temas, y ejecuto el ciclo completo de producción: preproducción, grabación, edición en CapCut, diseño en Canva, redacción de copys y publicación de Reels, carruseles e historias.',
      'Trabajo con enfoque en datos: hago seguimiento de resultados en Instagram Insights y ajusto la estrategia de contenidos según el rendimiento real de cada formato.',
    ],
    /* Sin bloque de cifras: esta hoja no lleva el recuadro de métricas
       (las cifras siguen en «Trabajo destacado» y en el portafolio). */
    destacados: [
      `${M.reels} Reels producidos y editados en CapCut, con una media de ${miles(M.mediaReels)} interacciones por pieza.`,
      `${M.carruseles} carruseles diseñados en Canva: el formato de mayor rendimiento de la parrilla, con un pico de ${miles(M.picoCarrusel)} interacciones.`,
      `${M.sobre10k} piezas superaron las 10.000 interacciones y ${M.sobre5k} superaron las 5.000, sobre ${M.meses} meses de publicación sostenida.`,
      'Adaptación de investigación periodística densa (leyes, casos judiciales, datos de género) a formatos nativos de Instagram sin perder rigor informativo.',
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
    herramientas: ['CapCut', 'Canva', 'Instagram Reels', 'Meta Business Suite', 'Instagram Insights'],
    cargos: {
      'Cuestión Pública': 'Community Manager · Creadora de contenido digital',
      'No Es Hora de Callar · Casa Editorial El Tiempo': 'Creadora de contenido digital · Producción audiovisual',
      'Escuela de Periodismo Multimedia El Tiempo': 'Reportera multimedia · Contenido para plataformas digitales',
      'Ventana U': 'Periodista · Producción y presentación',
      'Capital Enigma': 'Investigadora periodística para redes sociales',
    },
  },
];
