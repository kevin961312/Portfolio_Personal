/* ──────────────────────────────────────────────────────────────
   Experiencia, proyectos, educación y referencias de «Sobre mí».
   Son comunes a las tres versiones de la HV; lo único que cambia por
   perfil es el cargo, que se resuelve con `perfil.cargos[empresa]` en
   `src/data/perfiles.ts` (la clave debe ser igual a `empresa`).
   ────────────────────────────────────────────────────────────── */

export interface Trabajo {
  periodo: string;
  empresa: string;
  items: string[];
  /** Cuenta de Instagram donde se publicó su trabajo en redes. */
  cuenta?: string;
  /** Publicó notas en EL TIEMPO (digital e impreso). */
  prensa?: boolean;
  /** Produjo la nota de televisión de la sección Reportaje. */
  tv?: boolean;
}

export interface Estudio {
  periodo: string;
  institucion: string;
  titulo: string;
}

export interface Referencia {
  nombre: string;
  cargo: string;
  telefono: string;
  correo?: string;
}

export const experiencias: Trabajo[] = [
  {
    periodo: '2026 – 2026',
    empresa: 'Cuestión Pública',
    items: [
      'Análisis y selección de temas para creación de parrillas de contenido.',
      'Pre producción, producción, edición y publicación de carruseles, reels e historias para Instagram.',
      'Seguimiento de resultados y creación de estrategia.',
    ],
    cuenta: 'cuestionp',
  },
  {
    periodo: '2025 – 2026',
    empresa: 'No Es Hora de Callar · Casa Editorial El Tiempo',
    items: [
      'Investigación y redacción de notas periodísticas para el periódico digital e impreso.',
      'Creación de parrillas de contenido, carruseles, reels e historias para Instagram.',
      'Producción, pietaje y pasos en cámara para programa televisivo.',
    ],
    cuenta: 'eltiempo',
    prensa: true,
  },
  {
    periodo: '2025 – 2026',
    empresa: 'Escuela de Periodismo Multimedia El Tiempo',
    items: [
      'Investigación y redacción de notas periodísticas para el periódico digital e impreso.',
      'Cobertura fotográfica y en video de conciertos y eventos.',
      'Producción de nota periodística para televisión.',
    ],
    prensa: true,
    tv: true,
  },
];

export const proyectos: Trabajo[] = [
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
];

export const educacion: Estudio[] = [
  {
    periodo: '2025 – 2026',
    institucion: 'El Tiempo',
    titulo: 'Programa de la Escuela de Periodismo Multimedia EL TIEMPO',
  },
  {
    periodo: '2024',
    institucion: 'Universidad Cooperativa de Colombia',
    titulo: 'Diplomado en Reportería y presentación de noticias con énfasis en periodismo judicial y político',
  },
  {
    periodo: '2021 – 2026',
    institucion: 'Universidad Cooperativa de Colombia',
    titulo: 'Comunicación Social',
  },
];

export const referencias: Referencia[] = [
  {
    nombre: 'Carlos Solano',
    cargo: 'Director de Escuela de Periodismo Multimedia EL TIEMPO y Editor de Podcasts',
    telefono: '320 865 1735',
    correo: 'carsol@eltiempo.com',
  },
  {
    nombre: 'Rafael Quintero',
    cargo: 'Periodista y Jefe editorial de Cuestión Pública',
    telefono: '320 839 5534',
  },
];
