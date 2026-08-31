import { COMUN, SITIO } from './datos.mjs';

/** URL pública de esta versión de la HV, con su parámetro de perfil. */
export function urlPerfil(perfil) {
  return `${SITIO}?perfil=${perfil}`;
}

/** La misma URL sin el `https://`, para mostrarla en el documento. */
function urlVisible(perfil) {
  return urlPerfil(perfil).replace(/^https:\/\//, '');
}

const enlace = (perfil, clase = '') =>
  `<a class="${clase}" href="${urlPerfil(perfil)}">${urlVisible(perfil)}</a>`;

/* En la columna estrecha la URL se parte en sus tres tramos naturales
   en vez de cortarse a mitad de palabra. */
const enlaceSidebar = (perfil) =>
  `<a href="${urlPerfil(perfil)}">kevin961312.github.io<br>/Portfolio_Personal/<br>?perfil=${perfil}</a>`;

const bloqueSidebar = (titulo, contenido) =>
  `<section class="sb-bloque"><h2 class="sb-titulo">${titulo}</h2>${contenido}</section>`;

const chips = (items) =>
  `<div class="chips">${items.map((i) => `<span class="chip">${i}</span>`).join('')}</div>`;

const barras = (items) =>
  items
    .map(
      (c) => `<div class="skill">
        <div class="skill-fila"><span>${c.nombre}</span><span class="skill-pct">${c.nivel}%</span></div>
        <div class="skill-track"><div class="skill-fill" style="width:${c.nivel}%"></div></div>
      </div>`,
    )
    .join('');

const referencias = () =>
  COMUN.referencias
    .map(
      (r) => `<div class="ref">
        <p class="ref-nombre">${r.nombre}</p>
        <p class="ref-cargo">${r.cargo}</p>
        <p class="ref-contacto">${r.telefono}${r.correo ? ` ·<br><a href="mailto:${r.correo}">${r.correo}</a>` : ''}</p>
      </div>`,
    )
    .join('');

export function construirHtml(hoja) {
  const educacion = COMUN.educacion
    .map(
      (e) => `<div class="edu">
        <p class="edu-periodo">${e.periodo}</p>
        <p class="edu-titulo">${e.titulo}</p>
        <p class="edu-institucion">${e.institucion}</p>
      </div>`,
    )
    .join('');

  const experiencia = hoja.experiencia
    .map(
      (x) => `<div class="exp">
        <div class="exp-cabecera">
          <h3 class="exp-empresa">${x.empresa}</h3>
          <span class="exp-periodo">${x.periodo}</span>
        </div>
        <p class="exp-cargo">${x.cargo}</p>
        <ul class="exp-items">${x.items.map((i) => `<li>${i}</li>`).join('')}</ul>
      </div>`,
    )
    .join('');

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>${hoja.tituloDoc}</title>
<style>
  @page { size: A4; margin: 0; }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --morado-profundo: #2D1B69;
    --morado: #6B21A8;
    --morado-vivo: #9333EA;
    --morado-claro: #A855F7;
    --lila-borde: #DDD6FE;
    --lila-fondo: #F3EEFB;
    --sidebar-fondo: #F7F4FC;
    --texto: #2A2A35;
    --texto-suave: #6B7280;
  }

  /* El fondo va en <html> para que se propague al lienzo y la banda del
     sidebar se pinte hasta el pie de TODAS las páginas, no solo hasta
     donde llega su contenido. */
  html {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    background: linear-gradient(
      to right,
      #F7F4FC 0 157.5pt,
      #DDD6FE 157.5pt 158.5pt,
      #fff 158.5pt
    );
  }

  body {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 8.6pt;
    line-height: 1.5;
    color: var(--texto);
    background: transparent;
  }

  a { color: var(--morado-vivo); text-decoration: none; }

  /* ── Cabecera ─────────────────────────────────────────── */
  .header {
    background: linear-gradient(110deg, #241456 0%, var(--morado-profundo) 32%, #7524B8 72%, var(--morado-vivo) 100%);
    color: #fff;
    padding: 30pt 34pt 22pt;
  }

  .h-nombre {
    font-size: 27pt;
    font-weight: 300;
    letter-spacing: 0.5pt;
    line-height: 1.1;
  }

  .h-nombre strong { font-weight: 700; }

  .h-rol {
    font-size: 9.2pt;
    font-weight: 700;
    letter-spacing: 2.6pt;
    text-transform: uppercase;
    margin-top: 6pt;
    color: rgba(255, 255, 255, 0.94);
  }

  .h-resumen {
    font-size: 8.6pt;
    line-height: 1.65;
    margin-top: 13pt;
    max-width: 400pt;
    color: rgba(255, 255, 255, 0.88);
  }

  .h-contacto {
    display: flex;
    flex-wrap: wrap;
    column-gap: 16pt;
    row-gap: 5pt;
    margin-top: 15pt;
    font-size: 8pt;
    color: rgba(255, 255, 255, 0.92);
  }

  .h-contacto strong { font-weight: 700; }
  .h-contacto a { color: rgba(255, 255, 255, 0.92); }

  /* ── Cuerpo a dos columnas ────────────────────────────── */
  .cuerpo { display: flex; align-items: stretch; }

  .sidebar {
    width: 158pt;
    flex: 0 0 158pt;
    padding: 22pt 16pt 30pt;
  }

  .main { flex: 1; padding: 22pt 26pt 30pt; min-width: 0; }

  /* ── Títulos de sección ───────────────────────────────── */
  .sb-bloque { margin-bottom: 20pt; }

  .sb-titulo, .m-titulo {
    page-break-after: avoid;
    break-after: avoid;
    font-size: 8.2pt;
    font-weight: 700;
    letter-spacing: 2.2pt;
    text-transform: uppercase;
    color: var(--morado-vivo);
    padding-bottom: 6pt;
    border-bottom: 1px solid var(--lila-borde);
    margin-bottom: 11pt;
  }

  .m-seccion { margin-bottom: 20pt; }

  /* ── Contacto ─────────────────────────────────────────── */
  .dato { margin-bottom: 9pt; }

  .dato-label {
    font-size: 6.6pt;
    letter-spacing: 1.3pt;
    text-transform: uppercase;
    color: var(--texto-suave);
    margin-bottom: 1pt;
  }

  .dato-valor { font-size: 8pt; word-break: break-word; }
  .dato-valor.url { line-height: 1.45; word-break: normal; }

  /* ── Barras de competencias ───────────────────────────── */
  .skill { margin-bottom: 9pt; }

  .skill-fila {
    display: flex;
    justify-content: space-between;
    font-size: 7.8pt;
    margin-bottom: 3pt;
  }

  .skill-pct { color: var(--morado-vivo); font-weight: 700; }
  .skill-track { height: 2.6pt; background: var(--lila-borde); border-radius: 99pt; }
  .skill-fill {
    height: 100%;
    border-radius: 99pt;
    background: linear-gradient(90deg, var(--morado), var(--morado-claro));
  }

  /* ── Chips ────────────────────────────────────────────── */
  .chips { display: flex; flex-wrap: wrap; gap: 4.5pt; }

  .chip {
    font-size: 7.4pt;
    font-weight: 600;
    color: var(--morado);
    background: #fff;
    border: 1px solid var(--lila-borde);
    border-radius: 99pt;
    padding: 3pt 8pt;
  }

  /* ── Educación ────────────────────────────────────────── */
  .edu { margin-bottom: 11pt; }
  .edu-periodo { font-size: 7pt; font-weight: 700; color: var(--morado-vivo); letter-spacing: 0.4pt; }
  .edu-titulo { font-size: 8pt; font-weight: 700; line-height: 1.35; margin-top: 1.5pt; }
  .edu-institucion { font-size: 7.4pt; color: var(--texto-suave); margin-top: 1pt; }

  /* ── Referencias ──────────────────────────────────────── */
  .ref {
    border-left: 2.5pt solid var(--morado-claro);
    background: #fff;
    padding: 8pt 9pt;
    margin-bottom: 8pt;
    page-break-inside: avoid;
  }

  .ref-nombre { font-size: 8.2pt; font-weight: 700; }
  .ref-cargo { font-size: 7.3pt; color: var(--texto-suave); line-height: 1.4; margin-top: 2pt; }
  .ref-contacto { font-size: 7.3pt; color: var(--morado-vivo); line-height: 1.45; margin-top: 4pt; }

  /* ── Perfil profesional ───────────────────────────────── */
  .perfil { text-align: justify; line-height: 1.62; }
  .perfil strong, .bullets strong, .cierre strong { font-weight: 700; color: var(--morado-profundo); }

  /* ── Métricas ─────────────────────────────────────────── */
  .metricas { display: flex; gap: 7pt; margin-bottom: 12pt; }

  .metrica {
    flex: 1;
    background: var(--lila-fondo);
    border: 1px solid var(--lila-borde);
    border-radius: 5pt;
    padding: 9pt 5pt;
    text-align: center;
  }

  .metrica-valor { font-size: 15pt; font-weight: 700; color: var(--morado); line-height: 1.1; }

  .metrica-etiqueta {
    font-size: 6.2pt;
    letter-spacing: 0.7pt;
    text-transform: uppercase;
    color: var(--texto-suave);
    margin-top: 3pt;
    line-height: 1.3;
  }

  /* ── Bullets ──────────────────────────────────────────── */
  .bullets { list-style: none; }

  .bullets li {
    position: relative;
    padding-left: 11pt;
    margin-bottom: 6pt;
    line-height: 1.55;
  }

  .bullets li::before {
    content: '▪';
    position: absolute;
    left: 0;
    color: var(--morado-claro);
  }

  .nota {
    font-size: 7.6pt;
    font-style: italic;
    color: var(--texto-suave);
    margin-top: 9pt;
  }

  /* ── Experiencia ──────────────────────────────────────── */
  .exp {
    position: relative;
    padding-left: 16pt;
    margin-bottom: 15pt;
    border-left: 1px solid var(--lila-borde);
    page-break-inside: avoid;
  }

  .exp::before {
    content: '';
    position: absolute;
    left: -3.5pt;
    top: 3pt;
    width: 6pt;
    height: 6pt;
    border-radius: 50%;
    background: var(--morado-claro);
  }

  .exp-cabecera { display: flex; justify-content: space-between; align-items: baseline; gap: 10pt; }
  .exp-empresa { font-size: 10pt; font-weight: 700; color: var(--morado-profundo); }

  .exp-periodo {
    flex-shrink: 0;
    font-size: 7pt;
    font-weight: 700;
    color: var(--morado);
    background: #EDE9FE;
    border-radius: 3pt;
    padding: 2.5pt 6pt;
  }

  .exp-cargo {
    font-size: 8.4pt;
    font-weight: 700;
    font-style: italic;
    color: var(--morado-vivo);
    margin-top: 2pt;
  }

  .exp-items { list-style: none; margin-top: 5pt; }

  .exp-items li {
    position: relative;
    padding-left: 10pt;
    margin-bottom: 3.5pt;
    line-height: 1.5;
  }

  .exp-items li::before {
    content: '▸';
    position: absolute;
    left: 0;
    color: var(--morado-claro);
  }

  .cierre { text-align: justify; line-height: 1.62; }
</style>
</head>
<body>
  <header class="header">
    <h1 class="h-nombre">${COMUN.nombreLigero} <strong>${COMUN.nombreFuerte}</strong></h1>
    <p class="h-rol">${hoja.rol}</p>
    <p class="h-resumen">${hoja.resumen}</p>
    <div class="h-contacto">
      <span><strong>${COMUN.telefono}</strong></span>
      <a href="mailto:${COMUN.correo}">${COMUN.correo}</a>
      <span>${COMUN.ubicacion}</span>
      <span><strong>Portafolio:</strong> ${enlace(hoja.perfil)}</span>
    </div>
  </header>

  <div class="cuerpo">
    <aside class="sidebar">
      ${bloqueSidebar('Contacto', `
        <div class="dato"><p class="dato-label">Teléfono</p><p class="dato-valor">${COMUN.telefono}</p></div>
        <div class="dato"><p class="dato-label">Correo</p><p class="dato-valor">${COMUN.correo}</p></div>
        <div class="dato"><p class="dato-label">Ubicación</p><p class="dato-valor">${COMUN.ubicacion}</p></div>
        <div class="dato"><p class="dato-label">Portafolio</p><p class="dato-valor url">${enlaceSidebar(hoja.perfil)}</p></div>
      `)}
      ${bloqueSidebar(hoja.competenciasTitulo, barras(hoja.competencias))}
      ${hoja.lista ? bloqueSidebar(hoja.listaTitulo, chips(hoja.lista)) : ''}
      ${bloqueSidebar(hoja.herramientasTitulo, chips(hoja.herramientas))}
      ${bloqueSidebar('Educación', educacion)}
      ${bloqueSidebar('Referencias', referencias())}
    </aside>

    <main class="main">
      <section class="m-seccion">
        <h2 class="m-titulo">Perfil profesional</h2>
        <p class="perfil">${hoja.perfilProfesional}</p>
      </section>

      <section class="m-seccion">
        <h2 class="m-titulo">${hoja.metricasTitulo}</h2>
        <div class="metricas">
          ${hoja.metricas
            .map(
              (m) => `<div class="metrica">
                <p class="metrica-valor">${m.valor}</p>
                <p class="metrica-etiqueta">${m.etiqueta}</p>
              </div>`,
            )
            .join('')}
        </div>
        <ul class="bullets">${hoja.bullets.map((b) => `<li>${b}</li>`).join('')}</ul>
        <p class="nota">${hoja.notaPortafolio} ${enlace(hoja.perfil)}</p>
      </section>

      <section class="m-seccion">
        <h2 class="m-titulo">Experiencia profesional</h2>
        ${experiencia}
      </section>

      ${
        hoja.cierreTitulo
          ? `<section class="m-seccion">
               <h2 class="m-titulo">${hoja.cierreTitulo}</h2>
               <p class="cierre">${hoja.cierreTexto}</p>
             </section>`
          : ''
      }
    </main>
  </div>
</body>
</html>`;
}
