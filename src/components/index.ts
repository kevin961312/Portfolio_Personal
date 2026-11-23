/* ──────────────────────────────────────────────────────────────
   Índice de componentes reutilizables. En un sitio nuevo basta con:
     import { TarjetaPost, VisorPost, EncabezadoPagina } from './components';
   Cada carpeta trae su `.module.css` al lado: copiar la carpeta entera.
   Catálogo con props y ejemplos en el README («Componentes»).
   ────────────────────────────────────────────────────────────── */

/* Estructura de página */
export { default as Navbar } from './layout/Navbar';
export { default as Footer } from './layout/Footer';
export { default as EncabezadoPagina, Contador } from './layout/EncabezadoPagina';
export type { DatoEncabezado } from './layout/EncabezadoPagina';

/* Métricas con contador animado */
export { default as MetricasImpacto } from './metricas/MetricasImpacto';
export { default as MetricaCard } from './metricas/MetricaCard';

/* Posts de Instagram (cajas, embeds y visor) */
export { default as TarjetaPost } from './post/TarjetaPost';
export { default as PortadaPost } from './post/PortadaPost';
export { default as PostVivo } from './post/PostVivo';
export { default as VisorPost } from './post/VisorPost';

/* Galería de fotos */
export { default as LineaTiempo } from './galeria/LineaTiempo';
export { default as ProyeccionAlbumes } from './galeria/ProyeccionAlbumes';
export { default as VisorLibro } from './galeria/VisorLibro';

/* Visores */
export { default as VisorImagen } from './visores/VisorImagen';
export type { ImagenVisor } from './visores/VisorImagen';

/* Íconos SVG */
export * from './icons';
