/* ──────────────────────────────────────────────────────────────
   Datos generales del sitio: identidad, contacto y cuentas.
   El nombre, la marca del menú, el pie de página y los textos que
   mencionan el medio salen de aquí.
   ────────────────────────────────────────────────────────────── */

export const sitio = {
  /** Nombre corto: menú, pie de página y título de la pestaña. */
  nombre: 'Laura Hernández',
  /** Nombre en la portada: `nombre` en blanco y `apellido` resaltado. */
  portada: { nombre: 'Laura Viviana', apellido: 'Hernández Martin' },
  /** Profesión que acompaña al nombre en el pie de página. */
  profesion: 'Comunicadora Social y Periodista',

  contacto: {
    telefono: '3222448811',
    correo: 'laurahernandezfcb@hotmail.com',
    ciudad: 'Bogotá',
  },

  /** Medio principal donde se publicaron los artículos (prensa digital e impresa). */
  medio: {
    nombre: 'EL TIEMPO',
    dominio: 'eltiempo.com',
  },

  /** Medio de televisión de la sección Reportaje. */
  medioTv: 'Canal CityTV',
};

/**
 * Cuentas de Instagram que aparecen en posts y álbumes (clave = usuario sin `@`).
 * - `nombre`: texto visible junto al usuario.
 * - `iniciales`: avatar de las portadas diseñadas.
 * Los colores de cada cuenta están en `src/index.css` (`[data-cuenta='…']`).
 */
export const CUENTAS: Record<string, { nombre: string; iniciales: string }> = {
  eltiempo: { nombre: 'EL TIEMPO · No Es Hora de Callar', iniciales: 'ET' },
  cuestionp: { nombre: 'Cuestión Pública', iniciales: 'CP' },
  lamartineris: { nombre: 'Laura Martín', iniciales: 'LM' },
};

/** Cuenta personal: color por defecto de la Galería. */
export const CUENTA_PERSONAL = 'lamartineris';
