/* ──────────────────────────────────────────────────────────────
   Contenido de las tres versiones de la Hoja de Vida.

   Los PDF originales se generaron con Chrome headless desde un HTML
   que ya no existe; este archivo reconstruye esa fuente para poder
   regenerarlos de forma reproducible.  `node hv/generar.mjs`
   ────────────────────────────────────────────────────────────── */

export const SITIO = 'https://kevin961312.github.io/Portfolio_Personal/';

/** Datos comunes a las tres versiones. */
export const COMUN = {
  nombreLigero: 'LAURA VIVIANA',
  nombreFuerte: 'HERNÁNDEZ MARTIN',
  telefono: '322 244 8811',
  correo: 'laurahernandezfcb@hotmail.com',
  ubicacion: 'Bogotá, Colombia',
  educacion: [
    {
      periodo: '2025 – 2026',
      titulo: 'Programa de la Escuela de Periodismo Multimedia EL TIEMPO',
      institucion: 'Casa Editorial EL TIEMPO',
    },
    {
      periodo: '2024',
      titulo: 'Diplomado en Reportería y presentación de noticias, con énfasis en periodismo judicial y político',
      institucion: 'Universidad Cooperativa de Colombia',
    },
    {
      periodo: '2021 – 2026',
      titulo: 'Comunicación Social',
      institucion: 'Universidad Cooperativa de Colombia',
    },
  ],
  referencias: [
    {
      nombre: 'Carlos Solano',
      cargo: 'Director de la Escuela de Periodismo Multimedia EL TIEMPO y Editor de Podcasts',
      telefono: '320 865 1735',
      correo: 'carsol@eltiempo.com',
    },
    {
      nombre: 'Abrahán Gutiérrez Navarro',
      cargo: 'Periodista',
      telefono: '350 480 0639',
    },
  ],
};

export const HOJAS = [
  /* ═════════════════ Community Manager ═════════════════ */
  {
    perfil: 'community-manager',
    archivo: 'CV_Laura_Hernandez_Community_Manager.pdf',
    tituloDoc: 'CV Laura Hernández — Community Manager',
    rol: 'Community Manager &amp; Digital Content Strategist',
    resumen:
      'Creadora de contenido digital con 287.000+ interacciones acumuladas en Instagram. Especialista en parrillas de contenido, Reels, carruseles y estrategia basada en métricas para medios periodísticos.',
    perfilProfesional:
      '<strong>Community Manager y creadora de contenido digital</strong> con formación en Comunicación Social y experiencia en el manejo de redes sociales de medios periodísticos de alto impacto (<strong>Cuestión Pública</strong> y <strong>Casa Editorial EL TIEMPO</strong>). Diseño <strong>parrillas de contenido</strong> a partir del análisis y selección de temas, y ejecuto el ciclo completo de producción: preproducción, grabación, edición en CapCut, diseño en Canva, redacción de <strong>copys</strong> y publicación de <strong>Reels, carruseles e historias</strong>. Mi portafolio documenta <strong>33 piezas publicadas que suman más de 287.000 interacciones</strong>, con un promedio de 8.700 por pieza y picos de 69.000. Trabajo con enfoque en datos: hago seguimiento de resultados en Instagram Insights y ajusto la estrategia de contenidos según el rendimiento real de cada formato.',
    metricasTitulo: 'Resultados verificables en el portafolio',
    metricas: [
      { valor: '287K+', etiqueta: 'Interacciones acumuladas' },
      { valor: '33', etiqueta: 'Piezas publicadas' },
      { valor: '8.7K', etiqueta: 'Promedio por pieza' },
      { valor: '69K', etiqueta: 'Pico de una pieza' },
    ],
    bullets: [
      '<strong>23 Reels</strong> producidos y editados en CapCut — promedio de <strong>6.367 interacciones</strong>, con un máximo de <strong>50.700</strong> en una sola pieza.',
      '<strong>10 carruseles</strong> diseñados en Canva — promedio de <strong>14.090 interacciones</strong>, el formato de mayor rendimiento de la parrilla, con un pico de <strong>69.000</strong>.',
      '<strong>8 piezas superaron las 10.000 interacciones</strong> y 14 superaron las 5.000, sobre <strong>10 meses de publicación sostenida</strong> (octubre 2025 – agosto 2026).',
      'Adaptación de <strong>investigación periodística densa</strong> (leyes, casos judiciales, datos de género) a formatos nativos de Instagram sin perder rigor informativo.',
    ],
    notaPortafolio: 'Métricas y piezas consultables en el portafolio digital:',
    competenciasTitulo: 'Competencias digitales',
    competencias: [
      { nombre: 'Edición de video (Reels)', nivel: 96 },
      { nombre: 'Copywriting y ganchos', nivel: 92 },
      { nombre: 'Parrillas de contenido', nivel: 90 },
      { nombre: 'Diseño de carruseles', nivel: 88 },
      { nombre: 'Analítica y métricas', nivel: 85 },
      { nombre: 'Storytelling / guion', nivel: 85 },
      { nombre: 'Community management', nivel: 82 },
    ],
    herramientasTitulo: 'Herramientas',
    herramientas: [
      'CapCut', 'Canva', 'Instagram Reels', 'Meta Business Suite', 'Instagram Insights',
      'Stories &amp; Encuestas', 'Adobe Premiere (básico)', 'Google Workspace',
      'Notion / Calendarios editoriales',
    ],
    experiencia: [
      {
        empresa: 'Cuestión Pública',
        periodo: '2026 – Actualidad',
        cargo: 'Community Manager · Creadora de contenido digital',
        items: [
          '<strong>Diseño y gestión de la parrilla de contenidos</strong> de Instagram: análisis y selección de temas de la agenda investigativa del medio y traducción a un calendario editorial semanal.',
          '<strong>Ciclo completo de producción de piezas</strong>: preproducción, producción, edición y publicación de carruseles, Reels e historias, con guion, copy y llamado a la acción propios.',
          '<strong>Seguimiento de métricas y ajuste de estrategia</strong>: monitoreo del rendimiento por formato y reorientación de la parrilla hacia los tipos de pieza con mayor alcance e interacción.',
          'Adaptación de investigaciones periodísticas de largo aliento a formatos cortos y virales, manteniendo la precisión de los datos y el tono editorial del medio.',
        ],
      },
      {
        empresa: 'No Es Hora De Callar · Casa Editorial EL TIEMPO',
        periodo: '2025 – 2026',
        cargo: 'Creadora de contenido digital · Producción audiovisual',
        items: [
          '<strong>Creación de parrillas de contenido</strong> y producción de carruseles, Reels e historias para la comunidad digital del proyecto, con foco en violencia de género y derechos de las mujeres.',
          '<strong>Producción audiovisual para el programa de televisión</strong>: pietaje, selección de material y pasos en cámara, ampliando la estrategia de contenidos a un formato multiplataforma.',
          'Investigación y redacción de notas periodísticas para el digital e impreso, usadas como insumo directo de las piezas sociales — <strong>coherencia editorial entre la nota y su versión para redes</strong>.',
          'Construcción de <strong>copys sensibles</strong> para temas de alto impacto emocional, cuidando el enfoque de género y el tratamiento responsable de víctimas.',
        ],
      },
      {
        empresa: 'Escuela de Periodismo Multimedia EL TIEMPO',
        periodo: '2025 – 2026',
        cargo: 'Reportera multimedia · Contenido para plataformas digitales',
        items: [
          '<strong>Cobertura fotográfica y en video de conciertos y eventos</strong> en Bogotá, generando material propio para publicación inmediata en las plataformas digitales del medio.',
          'Producción de notas periodísticas para televisión y para el periódico digital e impreso.',
          'Cobertura de eventos culturales masivos (festival Loserville, Bienal de Arte BOG25) con piezas publicadas en eltiempo.com.',
        ],
      },
      {
        empresa: 'Ventana U',
        periodo: '2024 – 2025',
        cargo: 'Periodista · Producción y presentación',
        items: [
          'Realización de notas en video y escritas para el periódico universitario.',
          'Producción, edición y presentación de eventos institucionales.',
        ],
      },
      {
        empresa: 'Capital Enigma',
        periodo: '2024',
        cargo: 'Investigadora periodística para redes sociales',
        items: [
          'Investigación de <strong>casos judiciales mediáticos</strong> como base para la creación de contenido en redes sociales — primera experiencia en la traducción de investigación a formato social.',
        ],
      },
    ],
    cierreTitulo: 'Perfil complementario',
    cierreTexto:
      'Destaco por creatividad, curiosidad y aprendizaje continuo, con habilidades de liderazgo para coordinar equipos de producción. Formación periodística sólida que me permite <strong>verificar antes de publicar</strong>: una ventaja diferencial para marcas y medios que necesitan crecer en redes sin comprometer su credibilidad.',
  },

  /* ═════════════════ Periodista Multimedia ═════════════════ */
  {
    perfil: 'periodista',
    archivo: 'CV_Laura_Hernandez_Periodista_Multimedia.pdf',
    tituloDoc: 'CV Laura Hernández — Periodista Multimedia',
    rol: 'Periodista Multimedia &amp; Investigadora',
    resumen:
      'Reportera judicial, política y con enfoque de género. Publicaciones en eltiempo.com y en la edición impresa de EL TIEMPO; reportaje audiovisual emitido en Canal CityTV.',
    perfilProfesional:
      'Periodista multimedia e investigadora, formada en Comunicación Social y en la <strong>Escuela de Periodismo Multimedia de EL TIEMPO</strong>, con diplomado en reportería y presentación de noticias con énfasis en periodismo judicial y político. Mi trabajo está publicado en <strong>eltiempo.com</strong> y en la <strong>edición impresa de EL TIEMPO</strong>, con un portafolio de <strong>13 artículos digitales, 5 piezas impresas y un reportaje audiovisual emitido en Canal CityTV</strong>. Reporteo casos de justicia, desaparición forzada, trámite legislativo y violencia de género, con manejo de fuentes oficiales, víctimas y organizaciones de derechos humanos. Cubro además cultura y ciudad, y produzco para prensa escrita, digital y televisión.',
    metricasTitulo: 'Trabajo publicado',
    metricas: [
      { valor: '13', etiqueta: 'Artículos en eltiempo.com' },
      { valor: '5', etiqueta: 'Piezas en edición impresa' },
      { valor: '1', etiqueta: 'Reportaje en Canal CityTV' },
      { valor: '8', etiqueta: 'Con enfoque de género y DD.HH.' },
    ],
    bullets: [
      '<strong>Investigación judicial:</strong> «Los misterios de la muerte de Baby Demoni» — publicado en la sección de Investigación de EL TIEMPO y replicado en la edición impresa.',
      '<strong>Desaparición forzada:</strong> entrevista a Margarita Restrepo — «La Fiscalía me dijo ‘cuando sepamos de su hija la llamamos’» — 23 años de un caso sin respuesta institucional.',
      '<strong>Cubrimiento legislativo:</strong> aprobación en segundo debate de la Ley Jineth Bedoya Lima y de la ley contra la violencia digital — seguimiento del trámite en el Congreso.',
      '<strong>Género y derechos humanos:</strong> brecha del trabajo de cuidado no pago, manual de ONU Mujeres sobre defensoras de DD.HH., movilización de mujeres iraníes, robo de información a la Casa de la Mujer y el nuevo Sistema Nacional para la población LGBTIQ+.',
      '<strong>Ciudad y cultura:</strong> polémica por perros deambulantes en el Politécnico Grancolombiano, regreso de Limp Bizkit al festival Loserville e inauguración de la Bienal de Arte BOG25.',
    ],
    notaPortafolio: 'Enlaces a todas las publicaciones en:',
    competenciasTitulo: 'Competencias periodísticas',
    competencias: [
      { nombre: 'Redacción y ortografía', nivel: 96 },
      { nombre: 'Edición de video / CapCut', nivel: 96 },
      { nombre: 'Investigación y verificación', nivel: 90 },
      { nombre: 'Reportería en terreno', nivel: 88 },
      { nombre: 'Periodismo judicial y político', nivel: 86 },
      { nombre: 'Enfoque de género y DD.HH.', nivel: 86 },
      { nombre: 'Producción para televisión', nivel: 84 },
    ],
    listaTitulo: 'Áreas de cobertura',
    lista: [
      'Justicia', 'Congreso y política', 'Violencia de género', 'Derechos humanos',
      'Diversidades LGBTIQ+', 'Bogotá / ciudad', 'Cultura y música', 'Casos judiciales mediáticos',
    ],
    herramientasTitulo: 'Herramientas',
    herramientas: [
      'CapCut', 'Canva', 'Fotografía y video', 'Entrevista en profundidad',
      'Fuentes oficiales y judiciales', 'Paso en cámara',
    ],
    experiencia: [
      {
        empresa: 'Escuela de Periodismo Multimedia EL TIEMPO',
        periodo: '2025 – 2026',
        cargo: 'Reportera multimedia',
        items: [
          '<strong>Investigación y redacción de notas periodísticas</strong> para el periódico digital e impreso de EL TIEMPO, con publicaciones en las secciones de Justicia, Política, Bogotá y Cultura.',
          'Cobertura fotográfica y en video de conciertos y eventos, generando material propio de crónica cultural para el medio.',
          '<strong>Producción de nota periodística para televisión</strong>: estructuración del guion, selección de material y montaje final.',
          'Reportaje audiovisual publicado en <strong>Canal CityTV</strong>.',
        ],
      },
      {
        empresa: 'No Es Hora De Callar · Casa Editorial EL TIEMPO',
        periodo: '2025 – 2026',
        cargo: 'Periodista con enfoque de género',
        items: [
          'Investigación y redacción de notas periodísticas sobre <strong>violencia de género, derechos de las mujeres y avances legislativos</strong>, para el digital y el impreso.',
          'Producción, pietaje y pasos en cámara para el programa televisivo del proyecto.',
          '<strong>Manejo de fuentes sensibles</strong>: víctimas, organizaciones de mujeres y entidades del Estado, con tratamiento responsable y enfoque de derechos.',
          'Traslado de las investigaciones a formatos digitales (carruseles, Reels, historias) para ampliar el alcance de los temas de género.',
        ],
      },
      {
        empresa: 'Cuestión Pública',
        periodo: '2026 – Actualidad',
        cargo: 'Periodista digital · Contenidos de investigación',
        items: [
          'Análisis y selección de temas de la agenda investigativa del medio para su publicación digital.',
          'Adaptación de investigaciones de largo aliento a formatos narrativos cortos, preservando la precisión de los datos y las fuentes.',
          'Producción y publicación de piezas digitales con seguimiento de resultados y ajuste de la estrategia editorial.',
        ],
      },
      {
        empresa: 'Ventana U',
        periodo: '2024 – 2025',
        cargo: 'Periodista',
        items: [
          'Realización de notas en video y escritas para el periódico universitario.',
          'Producción, edición y presentación de eventos.',
        ],
      },
      {
        empresa: 'Capital Enigma',
        periodo: '2024',
        cargo: 'Investigadora periodística',
        items: [
          'Investigación de <strong>casos judiciales mediáticos</strong> y construcción de líneas de tiempo y contexto para su divulgación.',
        ],
      },
    ],
  },

  /* ═════════════════ Comunicadora Social ═════════════════ */
  {
    perfil: 'comunicadora',
    archivo: 'CV_Laura_Hernandez_Comunicadora_Social.pdf',
    tituloDoc: 'CV Laura Hernández — Comunicadora Social',
    rol: 'Comunicadora Social &amp; Estratega Transmedia',
    resumen:
      'Visión integral de la comunicación: prensa impresa, digital, televisión y redes sociales. Producción audiovisual, oratoria y estrategia de contenidos con enfoque de derechos.',
    perfilProfesional:
      'Comunicadora Social con una <strong>visión integral del ecosistema de medios</strong>: concibo el mensaje una sola vez y lo despliego en todas las plataformas donde vive la audiencia. He trabajado el mismo tema como nota de prensa impresa, artículo digital, pieza para redes sociales y contenido para televisión en <strong>Cuestión Pública</strong> y la <strong>Casa Editorial EL TIEMPO</strong>. Mi portafolio acredita un ejercicio transmedia real: <strong>13 artículos publicados en eltiempo.com, 5 piezas en edición impresa, un reportaje audiovisual en Canal CityTV y 33 publicaciones digitales que suman más de 287.000 interacciones</strong>. Aporto <strong>pensamiento estratégico, oratoria y paso en cámara</strong>, y una comunicación con enfoque de derechos orientada a construir relación y confianza con las audiencias.',
    metricasTitulo: 'Alcance transmedia acreditado',
    metricas: [
      { valor: '4', etiqueta: 'Plataformas gestionadas' },
      { valor: '287K+', etiqueta: 'Interacciones digitales' },
      { valor: '18', etiqueta: 'Publicaciones en prensa' },
      { valor: '1', etiqueta: 'Reportaje en TV' },
    ],
    bullets: [
      '<strong>Prensa impresa:</strong> piezas publicadas en la edición física de EL TIEMPO — el mismo material investigativo llevado del papel a la web.',
      '<strong>Digital:</strong> 13 artículos en eltiempo.com en Justicia, Política, Bogotá y Cultura, con enlaces verificables en el portafolio.',
      '<strong>Televisión:</strong> producción, pietaje y pasos en cámara para programa televisivo, y un reportaje audiovisual publicado en Canal CityTV.',
      '<strong>Redes sociales:</strong> 23 Reels y 10 carruseles con una media de 8.700 interacciones por pieza y picos de 69.000, sostenidos durante 10 meses de publicación continua.',
      '<strong>Comunicación con propósito:</strong> línea de trabajo consolidada en género, derechos humanos y diversidades — desde el trámite legislativo de la Ley Jineth Bedoya hasta el manual de ONU Mujeres para narrar a las defensoras de DD.HH.',
    ],
    notaPortafolio: 'Portafolio completo:',
    competenciasTitulo: 'Competencias estratégicas',
    competencias: [
      { nombre: 'Redacción y ortografía', nivel: 96 },
      { nombre: 'Producción audiovisual', nivel: 96 },
      { nombre: 'Narrativas transmedia', nivel: 90 },
      { nombre: 'Estrategia de contenidos', nivel: 88 },
      { nombre: 'Investigación', nivel: 85 },
      { nombre: 'Relación con audiencias', nivel: 85 },
      { nombre: 'Oratoria y presentación', nivel: 80 },
    ],
    listaTitulo: 'Ejes de trabajo',
    lista: [
      'Comunicación estratégica', 'Narrativa transmedia', 'Producción de podcast',
      'Comunicación con enfoque de derechos', 'Gestión de proyectos editoriales',
      'Vocería y presentación', 'Comunicación social y comunitaria',
    ],
    herramientasTitulo: 'Herramientas',
    herramientas: [
      'CapCut', 'Canva', 'Instagram Insights', 'Producción de TV',
      'Fotografía y video', 'Calendarios editoriales',
    ],
    experiencia: [
      {
        empresa: 'Cuestión Pública',
        periodo: '2026 – Actualidad',
        cargo: 'Estratega de contenidos digitales',
        items: [
          '<strong>Definición de la estrategia de contenidos</strong> a partir del análisis y selección de temas de la agenda del medio, materializada en parrillas editoriales.',
          'Gestión integral del ciclo de producción: preproducción, producción, edición y publicación de piezas multiformato para audiencias digitales.',
          '<strong>Lectura de resultados y reformulación de la estrategia</strong>: uso de métricas de audiencia para decidir qué narrativas y formatos escalar.',
          'Traducción de investigación periodística compleja a lenguajes accesibles sin perder rigor — eje central de la relación de confianza con la audiencia.',
        ],
      },
      {
        empresa: 'No Es Hora De Callar · Casa Editorial EL TIEMPO',
        periodo: '2025 – 2026',
        cargo: 'Comunicadora social · Producción transmedia',
        items: [
          '<strong>Despliegue transmedia de un mismo tema</strong>: investigación y redacción para prensa digital e impresa, adaptación a carruseles, Reels e historias, y producción para el programa de televisión.',
          'Producción, pietaje y pasos en cámara para el formato televisivo, ejerciendo también como <strong>presentadora frente a cámara</strong>.',
          'Comunicación con enfoque de género y de derechos: construcción de narrativas responsables sobre violencia contra las mujeres, en articulación con organizaciones sociales y entidades públicas.',
          'Gestión del calendario editorial del proyecto y coordinación de la coherencia del mensaje entre plataformas.',
        ],
      },
      {
        empresa: 'Escuela de Periodismo Multimedia EL TIEMPO',
        periodo: '2025 – 2026',
        cargo: 'Comunicadora multimedia',
        items: [
          'Formación y ejercicio profesional en el <strong>ecosistema multiplataforma</strong> de la Casa Editorial: prensa escrita, digital, fotografía, video y televisión.',
          'Cobertura fotográfica y en video de conciertos y eventos, incluyendo producción de nota periodística para televisión.',
          'Trabajo directo con el Director de la Escuela y Editor de Podcasts, en un entorno de producción sonora y audiovisual.',
        ],
      },
      {
        empresa: 'Ventana U',
        periodo: '2024 – 2025',
        cargo: 'Periodista · Producción y presentación de eventos',
        items: [
          'Producción, edición y presentación de eventos institucionales — ejercicio directo de <strong>oratoria y vocería ante público</strong>.',
          'Realización de notas en video y escritas para el periódico universitario, gestionando el proyecto editorial de principio a fin.',
        ],
      },
      {
        empresa: 'Capital Enigma',
        periodo: '2024',
        cargo: 'Investigadora periodística',
        items: [
          'Investigación de casos judiciales mediáticos orientada a la creación de contenido para redes sociales, conectando investigación y divulgación.',
        ],
      },
    ],
    cierreTitulo: 'Sello personal',
    cierreTexto:
      'Creatividad, curiosidad y aprendizaje continuo, con habilidades de liderazgo para coordinar equipos y proyectos editoriales. Capacidad para entrar en <strong>cualquier eslabón de la cadena comunicativa</strong> —investigar, escribir, grabar, editar, presentar y medir— y para sostener un mensaje coherente a través de todos ellos.',
  },
];
