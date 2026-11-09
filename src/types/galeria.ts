import type { PostInstagram } from './index';

/** Un álbum (carrusel de Instagram) tal como se escribe en `src/data/galeria.ts`. */
export interface Album {
  /** URL del carrusel tal cual se copia de Instagram (con o sin `?img_index`). */
  url: string;
  titulo: string;
  /** Cuenta sin `@` (p. ej. `lamartineris`). */
  cuenta: string;
  /** AAAA-MM-DD. Si falta, se deduce del código de la URL. */
  fecha?: string;
  lugar?: string;
  descripcion?: string;
  /** Número de fotos del carrusel (texto «12 fotos»). */
  fotos?: number;
  /** Interacciones al momento de cargar el álbum (se ven en la portada). */
  likes?: number;
  /** `'horizontal'` si las fotos del carrusel son apaisadas (sin el campo,
      verticales 4:5), igual que en `PostInstagram`. Se pasa al `post` para
      que PostVivo recorte el 16:9; la tarjeta de la línea de tiempo y la
      pantalla de la proyección también van en 16:9. */
  orientacion?: 'horizontal';
}

/** Álbum listo para pintar (derivado en `src/lib/galeria.ts`). */
export interface AlbumListo extends Album {
  /** Código del post (el segmento después de `/p/`). */
  codigo: string;
  fecha: string;
  /** El mismo álbum como post, para `PostVivo` y `PortadaPost`. */
  post: PostInstagram;
}

export interface PaginaLibro {
  numero: number;
  /** 1920 px de ancho (vista normal). */
  imagen: string;
  /** 2880 px de ancho (zoom y pantalla completa). */
  imagenGrande: string;
  /** 360 px de ancho (tira de miniaturas). */
  miniatura: string;
  /** Medidas de `imagen`. */
  ancho: number;
  alto: number;
  /** Pie de foto de la página (sacado del PDF); también es el `alt`. */
  texto: string;
}

export interface LibroFotos {
  titulo: string;
  autora: string;
  /** AAAA-MM-DD del concierto. */
  fecha: string;
  lugar: string;
  descripcion: string;
  /** Ruta en `public/` (se pasa por `rutaPublica`). */
  pdf: string;
  /** Peso legible para el botón de descarga, p. ej. «9,2 MB». */
  pesoPdf: string;
  paginas: PaginaLibro[];
}
