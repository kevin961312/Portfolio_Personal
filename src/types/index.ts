export interface ArticuloImpreso {
  id: string;
  titulo: string;
  publicacion: string;
  fecha: string;
  imagen: string;
  descripcion?: string;
}

export interface ArticuloDigital {
  id: string;
  titulo: string;
  publicacion: string;
  url: string;
  imagen?: string;
}

export interface PostInstagram {
  id: string;
  titulo: string;
  url: string;
  tipo: 'carrusel' | 'video' | 'imagen';
  fecha: string;
  descripcion?: string;
  likes?: number;
}

/* ──────────────────────────────────────────────────────────────
   Perfiles dinámicos de la Hoja de Vida
   Cada versión de la HV (Community Manager / Periodista /
   Comunicadora Social) se modela como un `PerfilContenido`.
   ────────────────────────────────────────────────────────────── */

/** Identificador de perfil. Coincide con el valor del query param `?perfil=`. */
export type PerfilId = 'community-manager' | 'periodista' | 'comunicadora';

/** Categoría de la métrica; define el ícono y el acento de color de la tarjeta. */
export type CategoriaMetrica =
  | 'alcance'        // Visualizaciones totales / alcance
  | 'publicaciones'  // Reportajes y piezas publicadas
  | 'interacciones'  // Likes e interacciones acumuladas
  | 'destacado';     // Hito puntual (pico, reportaje en TV, etc.)

export interface Metrica {
  id: string;
  /** Valor numérico crudo: el contador anima desde 0 hasta aquí. */
  valor: number;
  categoria: CategoriaMetrica;
  /** Título de la tarjeta. */
  etiqueta: string;
  /** Línea de apoyo que explica de dónde sale el número. */
  detalle: string;
  /** Sufijo opcional pegado al número ya formateado (p. ej. `+`). */
  sufijo?: string;
  /** `true` → 287335 se muestra como «287K». `false` → «287.335». */
  compacto?: boolean;
}

export interface Habilidad {
  nombre: string;
  nivel: number;
}

export interface PerfilContenido {
  id: PerfilId;
  /** Etiqueta corta usada en el selector de perfil. */
  nombreCorto: string;
  /** Rol mostrado sobre el nombre en el hero. */
  rol: string;
  /** Frase gancho de una línea. */
  titular: string;
  /** Párrafos del bloque «Sobre mí». */
  sobreMi: string[];
  metricas: Metrica[];
  habilidades: Habilidad[];
  /** Bullets de resultados verificables. */
  destacados: string[];
  /**
   * Rutas visibles para este perfil. Filtra el menú y bloquea el acceso
   * directo: quien entra con la HV de community manager no ve las secciones
   * de periodismo, y viceversa.
   */
  secciones: string[];
  /** Cargo por empresa: `{ [empresa]: cargo }`. */
  cargos: Record<string, string>;
  /** `document.title` de la pestaña para este perfil. */
  tituloDocumento: string;
}
