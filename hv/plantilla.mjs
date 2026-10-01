/* ──────────────────────────────────────────────────────────────
   Plantilla HTML de la Hoja de Vida.

   Reproduce el diseño de la HV original hecha en Canva («CV (2).pdf»):
   barra lateral lila con la foto circular de borde punteado, títulos
   morados subrayados, barras de habilidades, y en la columna derecha
   el nombre alineado a la derecha con las secciones en «píldoras».

   Paleta y medidas tomadas del PDF original:
     lila de fondo   #DDCDEF      morado de textos  #4C1E80
     fondo derecho   #F6F6F6      morado de reglas  #853DD6
     anillo punteado #8C52FF      riel de barras    #A9AAAE
     barra lateral   232 pt       foto              157.5 pt
   ────────────────────────────────────────────────────────────── */

import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { COMUN, SITIO } from './datos.mjs';

const AQUI = dirname(fileURLToPath(import.meta.url));

/* La foto —con su anillo punteado— se recortó del PDF original a 600 ppp.
   Se incrusta en base64 para que el HTML temporal sea autosuficiente; el
   fondo lila viene horneado en el JPEG y `border-radius` recorta el resto. */
const FOTO = readFileSync(resolve(AQUI, 'assets/foto-laura-circulo.jpg')).toString('base64');

/** URL pública de esta versión de la HV, con su parámetro de perfil. */
export function urlPerfil(perfil) {
  return `${SITIO}?perfil=${perfil}`;
}

/** La misma URL sin el `https://`, para mostrarla impresa. */
const urlVisible = (perfil) => urlPerfil(perfil).replace(/^https:\/\//, '');

/* ── Iconos (mismos trazos que `src/components/icons`) ───────── */
const icono = (contenido) =>
  `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="#4C1E80" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round">${contenido}</svg>`;

const ICONOS = {
  telefono: icono('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"/>'),
  correo: icono('<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/>'),
  ubicacion: icono('<path d="M12 2C8.7 2 6 4.7 6 8c0 5 6 14 6 14s6-9 6-14c0-3.3-2.7-6-6-6z"/><circle cx="12" cy="8" r="2"/>'),
  portafolio: icono('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 7h10M7 11h10M7 15h6"/>'),
};

/* ── Piezas reutilizables ────────────────────────────────────── */
const bloqueSidebar = (titulo, contenido) =>
  `<section class="sb-bloque"><h2 class="sb-titulo">${titulo}</h2>${contenido}</section>`;

const seccion = (titulo, contenido) =>
  `<section class="m-seccion"><h2 class="pildora">${titulo}</h2>${contenido}</section>`;

const filaContacto = (ico, contenido) =>
  `<div class="contacto-fila">${ico}<div class="contacto-texto">${contenido}</div></div>`;

const barras = (habilidades) =>
  habilidades
    .map(
      (h) => `<div class="skill">
        <p class="skill-nombre">${h.nombre}</p>
        <div class="skill-riel"><div class="skill-relleno" style="width:${h.nivel}%"></div></div>
      </div>`,
    )
    .join('');

const chips = (items) =>
  `<div class="chips">${items.map((i) => `<span class="chip">${i}</span>`).join('')}</div>`;

const educacion = () =>
  COMUN.educacion
    .map(
      (e) => `<div class="edu">
        <p class="edu-periodo">${e.periodo}</p>
        <p class="edu-titulo">${e.titulo}</p>
        <p class="edu-institucion">${e.institucion}</p>
      </div>`,
    )
    .join('');

/** Bloque de experiencia o de proyecto, con el cargo propio del perfil. */
const trabajos = (lista, cargos) =>
  lista
    .map(
      (t) => `<div class="exp">
        <div class="exp-cabecera">
          <p class="exp-periodo">${t.periodo}</p>
          <h3 class="exp-empresa">${t.empresa}</h3>
          ${cargos[t.empresa] ? `<p class="exp-cargo">${cargos[t.empresa]}</p>` : ''}
        </div>
        <ul class="exp-items">${t.items.map((i) => `<li>${i}</li>`).join('')}</ul>
      </div>`,
    )
    .join('');

const referencias = () =>
  COMUN.referencias
    .map(
      (r) => `<div class="ref">
        <p class="ref-nombre">${r.nombre}</p>
        <p class="ref-cargo">${r.cargo}</p>
        <p class="ref-contacto">${ICONOS.telefono}<span>${r.telefono}</span></p>
        ${r.correo ? `<p class="ref-contacto">${ICONOS.correo}<a href="mailto:${r.correo}">${r.correo}</a></p>` : ''}
      </div>`,
    )
    .join('');

export function construirHtml(hoja) {
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>${hoja.tituloDoc}</title>
<style>
  @page { size: A4; margin: 0; }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --lila: #DDCDEF;
    --morado: #4C1E80;
    --morado-regla: #853DD6;
    --anillo: #8C52FF;
    --papel: #F6F6F6;
    --riel: #A9AAAE;
    --texto: #1B1B1F;
    --texto-suave: #55555F;
    --sidebar: 232pt;
  }

  /* El papel va en <html>, que se propaga al lienzo y cubre las dos
     páginas de canto a canto. */
  html {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    background: #F6F6F6;
  }

  /* La banda lila es un rectángulo de color liso en posición fija: Chrome
     lo repinta idéntico en cada página impresa. Como degradado del fondo
     acababa siendo un patrón de imagen —uno distinto por página— y en la
     segunda el corte de la derecha salía medio píxel difuminado. */
  /* Sangra 6 pt por arriba y por abajo: a ras de página, Chrome dejaba
     medio punto de papel al pie de cada hoja. */
  .banda {
    position: fixed;
    top: -6pt;
    bottom: -6pt;
    left: 0;
    width: 232pt;
    background: #DDCDEF;
    z-index: -1;
  }

  body {
    font-family: 'Montserrat', 'Avenir Next', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 8.5pt;
    line-height: 1.45;
    color: var(--texto);
    background: transparent;
  }

  a { color: inherit; text-decoration: none; }

  .cuerpo { display: flex; align-items: stretch; }

  .sidebar {
    width: var(--sidebar);
    flex: 0 0 var(--sidebar);
    padding: 24pt 17pt;
  }

  .main { flex: 1; padding: 0 21pt; min-width: 0; }

  /* El contenido de la derecha va dentro de una tabla con thead y tfoot
     vacíos: al imprimir, Chrome los repite en cada página y hacen de margen
     superior e inferior. Con margen de @page en 0 —necesario para que el
     fondo llegue a sangre— no hay otra forma de pedir ese aire. */
  .hoja { width: 100%; border-collapse: collapse; }
  .aire { height: 24pt; }

  /* ── Foto y nombre ────────────────────────────────────────── */
  .foto { display: block; width: 157.5pt; height: 157.5pt; margin: 0 auto; border-radius: 50%; }

  .nombre-completo {
    font-size: 10.6pt;
    font-style: italic;
    font-weight: 500;
    text-align: center;
    color: #5B3E86;
    margin: 5pt 0 15pt;
  }

  /* ── Títulos de la barra lateral ──────────────────────────── */
  .sb-bloque { margin-bottom: 12pt; }

  .sb-titulo {
    page-break-after: avoid;
    break-after: avoid;
    font-size: 9.6pt;
    font-weight: 800;
    letter-spacing: 0.3pt;
    text-transform: uppercase;
    color: var(--morado);
    padding-bottom: 2.5pt;
    border-bottom: 1.9pt solid var(--morado-regla);
    margin-bottom: 8pt;
  }

  /* ── Contacto ─────────────────────────────────────────────── */
  .contacto-fila { display: flex; align-items: flex-start; gap: 6pt; margin-bottom: 6pt; }
  .ico { width: 10.5pt; height: 10.5pt; flex: 0 0 10.5pt; margin-top: 0.8pt; }
  .contacto-texto { font-size: 8.6pt; line-height: 1.35; word-break: break-word; }

  .portafolio-nombre {
    font-weight: 800;
    color: var(--morado);
    text-decoration: underline;
    text-underline-offset: 1.5pt;
  }

  .portafolio-url {
    display: block;
    font-size: 6.9pt;
    line-height: 1.3;
    color: var(--texto-suave);
    margin-top: 1pt;
  }

  /* ── Estudios ─────────────────────────────────────────────── */
  .edu { margin-bottom: 7pt; }
  .edu-periodo { font-size: 8.4pt; font-weight: 700; color: var(--morado); }
  .edu-titulo { font-size: 8.2pt; font-weight: 700; color: var(--morado); line-height: 1.3; margin-top: 0.5pt; }
  .edu-institucion { font-size: 8.2pt; line-height: 1.3; margin-top: 0.5pt; }

  /* ── Habilidades ──────────────────────────────────────────── */
  .skill { margin-bottom: 5.8pt; }

  .skill-nombre {
    position: relative;
    padding-left: 10pt;
    font-size: 8.4pt;
    line-height: 1.3;
  }

  .skill-nombre::before {
    content: '';
    position: absolute;
    left: 2pt;
    top: 3.6pt;
    width: 3pt;
    height: 3pt;
    border-radius: 50%;
    background: var(--texto);
  }

  .skill-riel {
    height: 6.6pt;
    width: 150pt;
    margin: 2.5pt 0 0 10pt;
    background: var(--riel);
    border-radius: 99pt;
  }

  .skill-relleno { height: 100%; border-radius: 99pt; background: var(--morado); }

  /* ── Chips (herramientas) ─────────────────────────────────── */
  .chips { display: flex; flex-wrap: wrap; gap: 4pt; break-inside: avoid; }

  .chip {
    font-size: 7.6pt;
    font-weight: 600;
    color: var(--morado);
    background: #EFE7F8;
    border: 0.8pt solid #C3ABE0;
    border-radius: 99pt;
    padding: 2.5pt 7pt;
  }

  /* ── Cabecera de la columna derecha ───────────────────────── */
  .h-nombre {
    font-size: 25.5pt;
    font-weight: 800;
    letter-spacing: -0.3pt;
    line-height: 1.05;
    text-align: right;
    color: var(--morado);
  }

  .h-rol {
    font-size: 11.5pt;
    font-weight: 800;
    letter-spacing: 0.4pt;
    text-transform: uppercase;
    text-align: right;
    color: var(--morado);
    margin-top: 2pt;
  }

  .h-subrol {
    font-size: 8.6pt;
    font-weight: 600;
    letter-spacing: 1.6pt;
    text-transform: uppercase;
    text-align: right;
    color: #7A4FB0;
    margin-top: 1.5pt;
  }

  .h-regla { border-top: 1.4pt solid var(--morado); margin: 7pt 0 10pt; }

  .perfil p { text-align: justify; margin-bottom: 7pt; }
  .perfil p:last-child { margin-bottom: 0; }

  /* ── Píldoras de sección ──────────────────────────────────── */
  .m-seccion { margin-top: 16pt; }

  .pildora {
    page-break-after: avoid;
    break-after: avoid;
    width: fit-content;
    margin: 0 auto 10pt;
    background: var(--lila);
    color: var(--morado);
    font-size: 11pt;
    font-weight: 800;
    letter-spacing: 0.5pt;
    text-transform: uppercase;
    padding: 5.5pt 20pt;
    border-radius: 6pt;
  }

  /* ── Métricas ─────────────────────────────────────────────── */
  .metricas { display: flex; gap: 6pt; }

  .metrica {
    flex: 1;
    background: #EFE7F8;
    border: 0.8pt solid #C3ABE0;
    border-radius: 5pt;
    padding: 8.5pt 4pt;
    text-align: center;
  }

  .metrica-valor { font-size: 15pt; font-weight: 800; color: var(--morado); line-height: 1.1; }

  .metrica-etiqueta {
    font-size: 6.4pt;
    font-weight: 600;
    letter-spacing: 0.3pt;
    text-transform: uppercase;
    color: var(--texto-suave);
    margin-top: 2.5pt;
    line-height: 1.25;
  }

  /* ── Listas de la columna derecha ─────────────────────────── */
  .destacados { list-style: disc; padding-left: 12pt; }
  .destacados li { margin-bottom: 5pt; }

  .nota {
    margin-top: 7pt;
    font-size: 7.8pt;
    text-align: center;
    color: var(--texto-suave);
  }

  .nota a { font-weight: 700; color: var(--morado); }

  /* ── Experiencia y proyectos ──────────────────────────────── */
  .exp { margin-bottom: 9pt; }
  .exp:last-child { margin-bottom: 0; }

  /* El periodo, la empresa y el cargo nunca se separan entre sí ni de la
     primera viñeta; el resto de la lista sí puede pasar a la página
     siguiente, para no dejar un hueco al pie de la página. */
  .exp-cabecera { break-inside: avoid; break-after: avoid; }

  .exp-periodo { font-size: 8.8pt; font-weight: 700; color: var(--morado); }

  .exp-empresa {
    font-size: 9.4pt;
    font-weight: 800;
    letter-spacing: 0.1pt;
    text-transform: uppercase;
    color: var(--morado);
    line-height: 1.25;
    margin-top: 0.5pt;
  }

  .exp-cargo { font-size: 8.2pt; font-style: italic; color: #7A4FB0; margin-top: 1pt; }

  .exp-items { list-style: disc; padding-left: 12pt; margin-top: 3.5pt; }
  .exp-items li { margin-bottom: 2.5pt; break-inside: avoid; }

  /* ── Referencias ──────────────────────────────────────────── */
  .ref { margin-bottom: 9pt; page-break-inside: avoid; }
  .ref:last-child { margin-bottom: 0; }

  .ref-nombre {
    font-size: 9pt;
    font-weight: 800;
    text-transform: uppercase;
    color: var(--morado);
    text-decoration: underline;
    text-underline-offset: 1.5pt;
  }

  .ref-cargo { line-height: 1.35; margin-top: 1.5pt; }
  .ref-contacto { display: flex; align-items: center; gap: 5pt; margin-top: 2.5pt; }
</style>
</head>
<body>
  <div class="banda"></div>

  <div class="cuerpo">
    <aside class="sidebar">
      <img class="foto" src="data:image/jpeg;base64,${FOTO}" alt="Laura Hernández">
      <p class="nombre-completo">${COMUN.nombreCompleto}</p>

      ${bloqueSidebar(
        'Contacto',
        filaContacto(ICONOS.telefono, `<a href="tel:${COMUN.telefono}">${COMUN.telefono}</a>`) +
          filaContacto(ICONOS.correo, `<a href="mailto:${COMUN.correo}">${COMUN.correo}</a>`) +
          filaContacto(ICONOS.ubicacion, COMUN.ubicacion) +
          filaContacto(
            ICONOS.portafolio,
            `<a href="${urlPerfil(hoja.perfil)}">
               <span class="portafolio-nombre">Portafolio</span>
               <span class="portafolio-url">kevin961312.github.io<br>/Portfolio_Personal/<br>?perfil=${hoja.perfil}</span>
             </a>`,
          ),
      )}

      ${bloqueSidebar('Estudios', educacion())}
      ${bloqueSidebar('Habilidades', barras(hoja.habilidades))}
      ${bloqueSidebar('Herramientas', chips(hoja.herramientas))}
    </aside>

    <main class="main">
      <table class="hoja">
        <thead><tr><td class="aire"></td></tr></thead>
        <tfoot><tr><td class="aire"></td></tr></tfoot>
        <tbody><tr><td>

      <h1 class="h-nombre">${COMUN.nombre}</h1>
      <p class="h-rol">${hoja.rol}</p>
      ${hoja.subrol ? `<p class="h-subrol">${hoja.subrol}</p>` : ''}
      <div class="h-regla"></div>

      <div class="perfil">
        ${hoja.perfilTexto.map((p) => `<p>${p}</p>`).join('')}
        <p>${COMUN.cierre}</p>
      </div>

      ${
        /* El bloque de cifras es opcional: una hoja sin `metricas` —como la
           de Community Manager— no lo imprime. */
        hoja.metricas
          ? seccion(
              hoja.metricasTitulo,
              `<div class="metricas">${hoja.metricas
                .map(
                  (m) => `<div class="metrica">
                    <p class="metrica-valor">${m.valor}</p>
                    <p class="metrica-etiqueta">${m.etiqueta}</p>
                  </div>`,
                )
                .join('')}</div>
               <p class="nota">Cifras verificables en el portafolio<br>
                 <a href="${urlPerfil(hoja.perfil)}">${urlVisible(hoja.perfil)}</a>
               </p>`,
            )
          : ''
      }

      ${seccion(
        'Trabajo destacado',
        `<ul class="destacados">${hoja.destacados.map((d) => `<li>${d}</li>`).join('')}</ul>`,
      )}

      ${seccion('Experiencia', trabajos(COMUN.experiencia, hoja.cargos))}
      ${seccion('Proyectos', trabajos(COMUN.proyectos, hoja.cargos))}
      ${seccion('Referencias', referencias())}

        </td></tr></tbody>
      </table>
    </main>
  </div>
</body>
</html>`;
}
