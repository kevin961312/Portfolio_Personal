import type { Album, LibroFotos, PaginaLibro } from '../types/galeria';

/* ──────────────────────────────────────────────────────────────
   Álbumes de fotos de la Galería (carruseles de Instagram).
   Para sumar uno: pegar la URL y poner título y cuenta. La fecha sale
   sola del código del post (ver `fechaDesdeCodigo` en lib/galeria.ts) y
   la línea de tiempo los ordena del más reciente al más antiguo. Si las
   fotos son apaisadas, agregar `orientacion: 'horizontal'`.
   `fotos` y `likes` se leyeron de cada post al cargarlo.
   ────────────────────────────────────────────────────────────── */
export const albumes: Album[] = [
  {
    url: 'https://www.instagram.com/p/DfCjUeFER4F/?img_index=1',
    titulo: 'Marcha frente al Museo Nacional contra el borrado de las luchas sociales',
    cuenta: 'lamartineris',
    lugar: 'Museo Nacional, Bogotá',
    descripcion:
      'Música, carteles y arengas de feministas, comunidad LGBTIQ+ y antifascistas que rechazan el borrado de la memoria en los museos.',
    fotos: 14,
    likes: 1276,
  },
  {
    url: 'https://www.instagram.com/p/DeqJPAekYql/?img_index=1',
    titulo: 'Plantón en el Museo Nacional termina con tanqueta y aturdidoras del ESMAD',
    cuenta: 'lamartineris',
    lugar: 'Museo Nacional, Bogotá',
    descripcion:
      'Segundo plantón por la eliminación de obras sobre luchas sociales: una tanqueta lanzó chorros de agua y el ESMAD disolvió la manifestación en la calle 7.',
    fotos: 10,
    likes: 271,
    orientacion: 'horizontal',
  },
  {
    url: 'https://www.instagram.com/p/Dc95tRSFJdY/?img_index=1',
    titulo: 'Las niñas resisten: marcha contra su invisibilización en el ICBF',
    cuenta: 'lamartineris',
    lugar: 'Bogotá',
    descripcion:
      'Protesta por la ausencia de las niñas en el lenguaje institucional del Instituto Colombiano de Bienestar Familiar.',
    fotos: 17,
    likes: 9152,
  },
  {
    url: 'https://www.instagram.com/p/DbCHNfOiWbx/?img_index=1',
    titulo: '20 de julio en Ciudad Bolívar: último desfile de Petro como presidente',
    cuenta: 'cuestionp',
    lugar: 'Ciudad Bolívar, Bogotá',
    descripcion:
      'Primer desfile militar del 20 de julio en Ciudad Bolívar, con discurso de Petro y Francia Márquez ante una multitud que desbordó las vallas.',
    fotos: 17,
    likes: 416,
  },
  {
    url: 'https://www.instagram.com/p/DYlVQx8FQt3/?img_index=1',
    titulo: 'Mi barrio en las noticias: la búsqueda de Yulixa',
    cuenta: 'lamartineris',
    lugar: 'Sur de Bogotá',
    descripcion:
      'Relato personal sobre la tragedia en su barrio y la unión de vecinas y amigas para que Yulixa no fuera una cifra más.',
    fotos: 8,
    likes: 2209,
  },
  {
    url: 'https://www.instagram.com/p/DaJpdnWCRNV/?img_index=1',
    titulo: 'Pride en Bogotá: colores, espuma y defensa de derechos',
    cuenta: 'cuestionp',
    lugar: 'Parque Nacional y Centro de Memoria, Bogotá',
    descripcion:
      'Marcha LGBTIQ+ del Parque Nacional al Centro de Memoria de cara al gobierno entrante; carteles que dicen que existen y resisten.',
    fotos: 20,
    likes: 3055,
  },
  {
    url: 'https://www.instagram.com/p/DPHcJnkkfNC/?img_index=1',
    titulo: 'Con cámara en la Bienal de Arte de Bogotá',
    cuenta: 'lamartineris',
    lugar: 'Bienal de Arte, Bogotá',
    descripcion:
      'Primera cobertura fotográfica con cámara de un evento, la Bienal de Arte de Bogotá, con resultado impreso gracias a El Tiempo Escuela.',
    fotos: 8,
    likes: 31,
  },
];

/* ──────────────────────────────────────────────────────────────
   Libro de fotos «40 años de I.R.A.». Las imágenes salen del PDF con
   `bash scripts/renderizar-libro.sh`; los pies de foto, del texto de
   cada página (pasados a tipo oración).
   ────────────────────────────────────────────────────────────── */
const pagina = (numero: number, texto: string): PaginaLibro => {
  const nn = String(numero).padStart(2, '0');
  return {
    numero,
    imagen: `/images/libro-ira/pagina-${nn}.webp`,
    imagenGrande: `/images/libro-ira/pagina-${nn}-grande.webp`,
    miniatura: `/images/libro-ira/miniatura-${nn}.webp`,
    ancho: 1920,
    alto: 1080,
    texto,
  };
};

export const libroIra: LibroFotos = {
  titulo: '40 años de I.R.A.',
  autora: 'Laura Hernández',
  fecha: '2025-08-16',
  lugar: 'Media Torta, Bogotá',
  descripcion:
    'La legendaria banda de punk inició el 16 de agosto la celebración de sus 40 años de formación en la Media Torta de Bogotá, acompañada por Lupus, Rattus Rattus, Ginger y los Tóxicos, en un llamado a un «Punk al Parke».',
  pdf: '/documentos/40-anos-de-ira.pdf',
  pesoPdf: '9,2 MB',
  paginas: [
    pagina(1, '40 años de I.R.A.: fotorreportaje de Laura Hernández en la Media Torta de Bogotá.'),
    pagina(2, 'La escena punk bogotana llenó la Media Torta, aprovechando para mostrar posturas políticas.'),
    pagina(3, 'Rattus Rattus puso a poguear a los asistentes y ofreció un poderoso performance a cargo de su cantante.'),
    // En el libro dice «cobró»: pendiente confirmar con la autora si prefiere «recobró».
    pagina(4, 'Un asistente desmayado durante el pogo cobró la consciencia al ser sacado.'),
    pagina(5, 'Mónica, baterista y líder de I.R.A., le hizo un reconocimiento a mujeres de bandas de punk.'),
    pagina(6, 'La camaradería fue la constante en medio de la emoción.'),
    pagina(7, 'David Viola, guitarrista de I.R.A., saluda al público.'),
    pagina(8, 'Una mirada a hace 40 años, cuando I.R.A. publicó su primer álbum, «Lo imposible».'),
    pagina(9, 'Mónica finaliza su presentación agradeciendo al público.'),
    pagina(10, 'I.R.A. se despide de Bogotá para seguir celebrando en otras ciudades.'),
  ],
};
