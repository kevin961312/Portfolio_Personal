export const meta = {
  name: 'buscar-ofertas',
  description: 'Búsqueda diaria de ofertas de trabajo para la HV de Laura Hernández (redes, portales, medios, ONG) con informe y Excel',
  whenToUse: 'Ejecutar una vez al día desde /buscar-ofertas. args: {fecha: "AAAA-MM-DD", desde: "AAAA-MM-DD"}',
  phases: [
    { title: 'Buscar', detail: 'navegador en serie (LinkedIn → Instagram → Facebook/X) + web en paralelo (portales, medios, ONG)' },
    { title: 'Verificar', detail: 'confirmar vigencia y fecha de las ofertas con afinidad 4–5', model: 'sonnet' },
    { title: 'Consolidar', detail: 'duplicados, ajustes, prioridades y resumen', model: 'opus' },
    { title: 'Archivos', detail: 'final.json → informe.md, CSV y Excel', model: 'haiku' },
  ],
}

const ROOT = (args && args.root) || '/Users/KEPINEDA/Downloads/Portfolio_Personal'
const BASE = `${ROOT}/ofertas`
const F = args && args.fecha
const D = (args && args.desde) || F
if (!F) throw new Error('Falta args.fecha (AAAA-MM-DD)')
const L30 = new Date(new Date(`${F}T12:00:00Z`).getTime() - 30 * 86400000).toISOString().slice(0, 10)
const LUNES = new Date(`${F}T12:00:00Z`).getUTCDay() === 1
const DIA = `${BASE}/${F}`

// Modelo y esfuerzo por agente, según lo que exige cada tarea.
const AGENTES = {
  linkedin:     { nombre: 'LinkedIn (empleos + publicaciones)', model: 'sonnet', effort: 'medium',
                  porque: 'Navegador con sesión: muchas búsquedas repetitivas y lectura de fichas; criterio moderado.' },
  instagram:    { nombre: 'Instagram (hashtags)', model: 'sonnet', effort: 'medium',
                  porque: 'Navegador con límite estricto de llamadas; hay que distinguir Colombia de otros países.' },
  facebook_x:   { nombre: 'Facebook + X', model: 'sonnet', effort: 'medium',
                  porque: 'Navegador; fechas ofuscadas y correos dentro de imágenes (requiere leer capturas).' },
  portales:     { nombre: 'Portales de empleo', model: 'sonnet', effort: 'medium',
                  porque: 'Decenas de fichas, fechas relativas y detección de ventas disfrazadas o estafas.' },
  medios_web:   { nombre: 'Webs oficiales de medios', model: 'haiku', effort: 'medium',
                  porque: 'Lista fija de ~25 plataformas (prensa, TV y radio); mecánica, pero hay que abrir fichas de Magneto para ver la fecha y separar empleos de convocatorias de contratación.' },
  ong:          { nombre: 'ONG y organismos', model: 'haiku', effort: 'medium',
                  porque: 'URLs conocidas, pero hay que juzgar idioma, modalidad remota y fecha de cierre.' },
  verificador:  { nombre: 'Verificador', model: 'sonnet', effort: 'high',
                  porque: 'Confirma vigencia y fecha de las mejores ofertas; un error aquí llega directo al informe.' },
  consolidador: { nombre: 'Consolidador', model: 'opus', effort: 'high',
                  porque: 'Duplicados entre fuentes, afinidad final y prioridades: el paso de más criterio.' },
  archivos:     { nombre: 'Archivos', model: 'haiku', effort: 'low',
                  porque: 'Escribir un JSON y ejecutar un script.' },
}
const opts = (k, extra) => ({ label: AGENTES[k].nombre, model: AGENTES[k].model, effort: AGENTES[k].effort, ...extra })

const str = { type: 'string' }
const OFERTA = {
  type: 'object',
  properties: {
    categoria: { type: 'string', enum: ['bogota', 'fecha_no_verificada', 'remota_internacional', 'fuera_bogota', 'practicas'] },
    fecha_pub: str, fecha_aprox: { type: 'boolean' }, cargo: str, empresa: str, ciudad_modalidad: str,
    donde: str, enlace: str,
    hv: { type: 'string', enum: ['Periodista Multimedia', 'Comunicadora Social', 'Community Manager'] },
    afinidad: { type: 'integer', minimum: 1, maximum: 5 }, razon: str, como_aplicar: str, correo: str,
    cierre: str, salario: str, alertas: str,
  },
  required: ['categoria', 'fecha_pub', 'cargo', 'empresa', 'enlace', 'hv', 'afinidad', 'razon'],
}
const CONTACTO = {
  type: 'object',
  properties: { organizacion: str, persona: str, cargo: str, correo: str, url: str, hv: str },
  required: ['organizacion', 'correo', 'url'],
}
const COBERTURA = { type: 'object', properties: { fuente: str, estado: str, nota: str }, required: ['fuente', 'estado'] }
const DESCARTADA = { type: 'object', properties: { cargo: str, empresa: str, motivo: str }, required: ['cargo', 'motivo'] }
const ESFUERZO = {
  type: 'object',
  properties: {
    fuentes_revisadas: { type: 'integer' }, consultas_aprox: { type: 'integer' },
    bloqueos: { type: 'array', items: str },
    dificultad: { type: 'string', enum: ['baja', 'media', 'alta'] },
    recomendacion: str,
  },
  required: ['fuentes_revisadas', 'dificultad', 'recomendacion'],
}
const BUSQUEDA = {
  type: 'object',
  properties: {
    ofertas: { type: 'array', items: OFERTA },
    contactos: { type: 'array', items: CONTACTO },
    cobertura: { type: 'array', items: COBERTURA },
    descartadas: { type: 'array', items: DESCARTADA },
    fuentes_nuevas: { type: 'array', items: str },
    esfuerzo: ESFUERZO,
  },
  required: ['ofertas', 'cobertura', 'esfuerzo'],
}

const COMUN = `Eres un agente de la búsqueda diaria de ofertas de trabajo para Laura Hernández (periodista multimedia, comunicadora social y community manager; vive en Bogotá).
Fecha de hoy: ${F}. Busca sobre todo lo publicado desde ${D}. Reporta solo ofertas publicadas desde ${L30} (máximo 30 días) y que sigan abiertas.

Antes de empezar lee:
- ${BASE}/Prompt_Busqueda_Empleo.txt, secciones 2 (perfil y qué HV usar) y 3 (filtros). La experiencia NO importa: no descartes ni bajes la afinidad por los años que pida la oferta.
- ${BASE}/historial.csv: ofertas ya reportadas en días anteriores. Si una oferta ya está ahí (misma URL, o misma empresa y cargo), NO la vuelvas a abrir ni la reportes.
- ${BASE}/fuentes.md: URLs y términos de búsqueda.

Reglas:
- Solo lectura: no postules, no llenes formularios, no envíes correos ni mensajes, no inicies sesión, no crees cuentas, no resuelvas captchas.
- No inventes datos. Si un campo no aparece, déjalo vacío. Correos solo si están publicados, y anota la URL donde aparecen.
- fecha_pub en formato AAAA-MM-DD. fecha_aprox=true si la calculaste a partir de "hace X días" o similar.
- categoria: "bogota" (Bogotá o remoto desde Colombia), "remota_internacional" (remoto para un empleador fuera de Colombia), "fuera_bogota" (presencial en otra ciudad), "practicas" (prácticas, pasantías, contrato de aprendizaje o becas), "fecha_no_verificada" (no pudiste confirmar la fecha).
- Incluye ofertas anónimas o confidenciales si el cargo encaja.
- Descarta ventas disfrazadas, multinivel, estudios webcam y estafas; anótalas en descartadas con el motivo.
- En cobertura pon una fila por fuente revisada, con estado "revisado", "requiere sesión", "bloqueado" o "no revisado".
- esfuerzo: al terminar, evalúa con honestidad cuánto trabajo te costó tu parte (fuentes revisadas, consultas, bloqueos, dificultad baja/media/alta) y recomienda si mañana convendría un modelo o un esfuerzo más bajo o más alto, y por qué.`

const NAVEGADOR = `Usa el navegador (Claude in Chrome). Lee completa ${BASE}/guia_navegador.md antes de abrir cualquier página y sigue sus límites. Eres el único agente usando el navegador en este momento: crea tu propia pestaña y ciérrala al terminar.`
const SOLO_WEB = 'Usa solo WebSearch y WebFetch. NO uses herramientas de navegador (mcp__claude-in-chrome__* ni browser-use): otro agente está usando el Chrome del usuario.'

const encargo = (titulo, texto) => `${COMUN}\n\n## Tu parte: ${titulo}\n${texto}`

const TAREAS = {
  linkedin: encargo(AGENTES.linkedin.nombre, `${NAVEGADOR}
1. LinkedIn Empleos: busca los 12 términos de fuentes.md con f_TPR=r604800 (última semana), en Colombia y en Bogotá cuando el término sea genérico (p. ej. comunicaciones, editor de video). Recoge las tarjetas en sessionStorage como indica la guía.
2. Filtra por título las relevantes (periodismo, redacción, comunicación, redes, contenido, audiovisual) y abre el detalle de las que no estén en el historial para confirmar fecha, modalidad, requisitos y salario.
3. LinkedIn publicaciones: las 6 búsquedas de fuentes.md con datePosted past-week, más "RCN Televisión vacante" y "Noticias Caracol vacante". Ahí aparecen vacantes con correo para enviar la HV (medios, agencias, reclutadores).
4. LinkedIn por empresa (TV y radio): las búsquedas de la sección "LinkedIn por empresa" de la guía, una empresa por búsqueda. Si LinkedIn dice "No se han encontrado empleos", no reportes el relleno de "Empleos que podrían interesarte".`),
  instagram: encargo(AGENTES.instagram.nombre, `${NAVEGADOR}
Busca las 5 consultas de Instagram de fuentes.md. Calcula la fecha de cada post a partir de su código (sin llamadas a la API) y pide el texto solo de los posts publicados desde ${D}. Máximo 40 llamadas a la API en total, con 2 s entre llamadas; si recibes un 429, detén Instagram de inmediato y anótalo en bloqueos. Quédate solo con vacantes de Colombia.`),
  facebook_x: encargo(AGENTES.facebook_x.nombre, `${NAVEGADOR}
1. Facebook: las 5 búsquedas de publicaciones de fuentes.md. Confirma la fecha de las ofertas relevantes con captura y zoom (muchas son reposts viejos) y lee los correos que estén dentro de las imágenes.
2. X: la consulta general, la consulta Colombia y las tres tandas de cuentas de medios de la guía, todas con since:${D}.
3. Páginas de empleo que solo cargan con navegador: https://www.teleantioquia.co/convocatorias (solo cuentan cargos o prestación de servicios personales, no contratación de productoras o seguros).
4. Correos ocultos: para cada oferta o publicación de hoy cuyo correo salga como "[email protected]" (sobre todo notas de Las2orillas "¿Quiere trabajar en…?"), ábrela con el navegador y decodifícalo con el método de la guía. Reporta solo correos de talento humano, selección o redacción, en contactos y en el campo correo de la oferta.`),
  portales: encargo(AGENTES.portales.nombre, `${SOLO_WEB}
Revisa los portales de fuentes.md: elempleo (abre cada ficha para ver la fecha), Magneto, Jooble (incluye lo que viene de Computrabajo), Talent.com (cuidado con los reposts de "Ofertasynegocios") e Indeed (listados con fromage=7). Términos: periodista, redactor, reportero, comunicador social, community manager, creador de contenido, social media, editor de video, productor audiovisual, copywriter, comunicaciones. Prioriza Bogotá.`),
  medios_web: encargo(AGENTES.medios_web.nombre, `${SOLO_WEB}
Abre cada URL de las tablas "Televisión y radio" y "Webs oficiales de medios" de fuentes.md (en la de TV y radio, cada fila es obligatoria; varias comparten la plataforma de su grupo, ábrela una vez). Reporta solo vacantes de periodismo, redacción, presentación, producción de contenido, comunicación, redes o audiovisual que no estén en el historial.
- Magneto: el listado de empresa no muestra la fecha; abre cada ficha relevante para verla.
- Canales públicos y regionales: muchas "convocatorias" son para contratar productoras, seguros o servicios; solo cuentan cargos o prestación de servicios personales.
- Claro: solo cargos de noticias, contenido o comunicación (Red+ Noticias); ignora los comerciales.
- Teleantioquia no carga sin navegador: márcala "requiere navegador" (la revisa el agente de Facebook + X).
- Si una página muestra un correo como "[email protected]" (oculto), anota la URL en fuentes_nuevas con la nota "correo oculto" para que el agente de navegador lo lea.
En cobertura pon una fila por cada medio de la tabla de TV y radio. Si encuentras un correo nuevo de editores o talento humano publicado para recibir hojas de vida, agrégalo a contactos. No busques más allá de esas tablas.`),
  ong: encargo(AGENTES.ong.nombre, `${SOLO_WEB}
Revisa las URLs de la tabla "ONG y organismos" de fuentes.md${LUNES ? ', incluida la última fila (hoy es lunes)' : ', sin la última fila (esa se revisa solo los lunes)'}. Busca cargos de comunicaciones, contenidos, prensa o periodismo: en Colombia o remotos. Marca en alertas si exigen inglés. Becas y convocatorias no laborales van con categoria "practicas".`),
}

phase('Buscar')
log(`Búsqueda del ${F}: desde ${D}, ventana máxima desde ${L30}`)
const navegador = async () => {
  const out = {}
  for (const k of ['linkedin', 'instagram', 'facebook_x']) {
    out[k] = await agent(TAREAS[k], opts(k, { phase: 'Buscar', schema: BUSQUEDA }))
  }
  return out
}
const [nav, portales, medios_web, ong] = await parallel([
  navegador,
  () => agent(TAREAS.portales, opts('portales', { phase: 'Buscar', schema: BUSQUEDA })),
  () => agent(TAREAS.medios_web, opts('medios_web', { phase: 'Buscar', schema: BUSQUEDA })),
  () => agent(TAREAS.ong, opts('ong', { phase: 'Buscar', schema: BUSQUEDA })),
])
const res = { ...(nav || {}), portales, medios_web, ong }

const ofertas = [], contactos = [], cobertura = [], descartadas = [], fuentesNuevas = [], esfuerzo = []
for (const [k, r] of Object.entries(res)) {
  const a = AGENTES[k]
  if (!r) {
    cobertura.push({ fuente: a.nombre, estado: 'falló', nota: 'El agente no devolvió resultado' })
    esfuerzo.push({ agente: a.nombre, modelo: a.model, esfuerzo_asignado: a.effort, fuentes_revisadas: 0, bloqueos: 'sin resultado', dificultad: '', recomendacion: 'Revisar el registro del workflow' })
    continue
  }
  r.ofertas.forEach(o => ofertas.push({ ...o, agente: k }))
  ;(r.contactos || []).forEach(c => contactos.push(c))
  r.cobertura.forEach(c => cobertura.push({ ...c, fuente: `${a.nombre}: ${c.fuente}` }))
  ;(r.descartadas || []).forEach(d => descartadas.push(d))
  ;(r.fuentes_nuevas || []).forEach(u => fuentesNuevas.push(u))
  esfuerzo.push({
    agente: a.nombre, modelo: a.model, esfuerzo_asignado: a.effort,
    fuentes_revisadas: r.esfuerzo.fuentes_revisadas, bloqueos: (r.esfuerzo.bloqueos || []).join('; '),
    dificultad: r.esfuerzo.dificultad, recomendacion: r.esfuerzo.recomendacion,
  })
}
ofertas.forEach((o, i) => { o.id = i + 1 })
log(`${ofertas.length} ofertas y ${contactos.length} contactos reportados por ${Object.keys(res).length} agentes`)

phase('Verificar')
const candidatas = ofertas.filter(o => o.afinidad >= 4 && o.categoria !== 'practicas')
let verif = null
if (candidatas.length) {
  log(`${candidatas.length} ofertas con afinidad 4–5 pasan a verificación; las de afinidad 1–3 no se verifican`)
  verif = await agent(`${COMUN}

## Tu parte: ${AGENTES.verificador.nombre}
Confirma cada oferta de esta lista. Para cada una abre el enlace y decide: "vigente", "cerrada" (vencida, cupo cerrado o retirada) o "no_verificable". Corrige la fecha de publicación y el cierre si los encuentras.
- LinkedIn: navegador (lee ${BASE}/guia_navegador.md; crea tu propia pestaña y ciérrala al terminar).
- Instagram: no la reabras; la fecha sale exacta del código del post. Márcala vigente salvo que el texto diga otra cosa.
- Facebook: solo si el texto sugiere que ya cerró.
- Portales y webs: WebFetch.

Ofertas (JSON):
${JSON.stringify(candidatas.map(o => ({ id: o.id, cargo: o.cargo, empresa: o.empresa, enlace: o.enlace, fecha_pub: o.fecha_pub, cierre: o.cierre, donde: o.donde })), null, 1)}`,
  opts('verificador', {
    phase: 'Verificar',
    schema: {
      type: 'object',
      properties: {
        verificadas: { type: 'array', items: { type: 'object', properties: {
          id: { type: 'integer' }, estado: { type: 'string', enum: ['vigente', 'cerrada', 'no_verificable'] },
          fecha_pub: str, cierre: str, nota: str }, required: ['id', 'estado'] } },
        esfuerzo: ESFUERZO,
      },
      required: ['verificadas', 'esfuerzo'],
    },
  }))
}
if (verif) {
  for (const v of verif.verificadas) {
    const o = ofertas.find(x => x.id === v.id)
    if (!o) continue
    if (v.fecha_pub) o.fecha_pub = v.fecha_pub
    if (v.cierre) o.cierre = v.cierre
    o.verificacion = `${v.estado}${v.nota ? ': ' + v.nota : ''}`
    if (v.estado === 'cerrada') o.cerrada = true
  }
  const a = AGENTES.verificador
  esfuerzo.push({ agente: a.nombre, modelo: a.model, esfuerzo_asignado: a.effort, fuentes_revisadas: verif.esfuerzo.fuentes_revisadas,
    bloqueos: (verif.esfuerzo.bloqueos || []).join('; '), dificultad: verif.esfuerzo.dificultad, recomendacion: verif.esfuerzo.recomendacion })
}
for (const o of ofertas.filter(x => x.cerrada)) descartadas.push({ cargo: o.cargo, empresa: o.empresa, motivo: `Cerrada al verificar: ${o.verificacion}` })
const abiertas = ofertas.filter(o => !o.cerrada)

phase('Consolidar')
const dec = await agent(`Eres el consolidador de la búsqueda diaria de ofertas para Laura Hernández (periodista multimedia, comunicadora social y community manager; Bogotá). Hoy es ${F}.
Lee ${BASE}/Prompt_Busqueda_Empleo.txt (secciones 2 y 3; la experiencia NO importa) y ${BASE}/historial.csv (ofertas de días anteriores).

Recibes las ofertas de hoy de varios agentes, ya verificadas las de afinidad 4–5. No reescribas las ofertas: devuelve solo tus decisiones.
1. duplicados: grupos de ids que son la misma vacante publicada en varios canales (el primer id del grupo es el que se conserva).
2. ajustes: corrige afinidad, categoria o hv solo cuando estén mal, con una nota breve.
3. descartar: ids que no deberían estar (fuera de la ventana desde ${L30}, ventas disfrazadas, cargos que no son de comunicación), con el motivo.
4. prioridades: 5 a 7 frases, en orden, con las ofertas que Laura debería atender primero (prefiere las nuevas que no están en el historial, las de mayor afinidad y las que cierran pronto). Incluye empresa, cargo y cómo aplicar.
5. resumen: 3 a 5 frases sobre el día (cuántas nuevas, qué tipo de cargos, bloqueos importantes).
6. recomendaciones_esfuerzo: para cada agente, compara el modelo y esfuerzo asignados con lo que reportó (dificultad, bloqueos, resultados) y recomienda mantener, bajar o subir el modelo o el esfuerzo para mañana, con el porqué.

Ofertas (JSON):
${JSON.stringify(abiertas.map(o => ({ id: o.id, agente: o.agente, categoria: o.categoria, fecha_pub: o.fecha_pub, cargo: o.cargo, empresa: o.empresa, ciudad_modalidad: o.ciudad_modalidad, donde: o.donde, enlace: o.enlace, hv: o.hv, afinidad: o.afinidad, razon: o.razon, cierre: o.cierre, verificacion: o.verificacion })), null, 1)}

Esfuerzo por agente (asignado y reportado):
${JSON.stringify(esfuerzo, null, 1)}

Cobertura:
${JSON.stringify(cobertura, null, 1)}`,
opts('consolidador', {
  phase: 'Consolidar',
  schema: {
    type: 'object',
    properties: {
      duplicados: { type: 'array', items: { type: 'array', items: { type: 'integer' } } },
      ajustes: { type: 'array', items: { type: 'object', properties: {
        id: { type: 'integer' }, afinidad: { type: 'integer', minimum: 1, maximum: 5 },
        categoria: { type: 'string', enum: ['bogota', 'fecha_no_verificada', 'remota_internacional', 'fuera_bogota', 'practicas'] },
        hv: { type: 'string', enum: ['Periodista Multimedia', 'Comunicadora Social', 'Community Manager'] }, nota: str }, required: ['id'] } },
      descartar: { type: 'array', items: { type: 'object', properties: { id: { type: 'integer' }, motivo: str }, required: ['id', 'motivo'] } },
      prioridades: { type: 'array', items: str },
      resumen: str,
      recomendaciones_esfuerzo: { type: 'array', items: { type: 'object', properties: { agente: str, recomendacion: str }, required: ['agente', 'recomendacion'] } },
    },
    required: ['duplicados', 'ajustes', 'descartar', 'prioridades', 'resumen', 'recomendaciones_esfuerzo'],
  },
}))

let finales = abiertas
let prioridades = [], resumen = 'El consolidador no devolvió resultado; las ofertas van sin deduplicar ni priorizar.'
const ce = AGENTES.consolidador
if (dec) {
  const quitar = new Set()
  for (const g of dec.duplicados) {
    const [keep, ...rest] = g
    const k = finales.find(o => o.id === keep)
    for (const id of rest) {
      const d = finales.find(o => o.id === id)
      if (k && d && id !== keep) {
        if (d.donde && !(k.donde || '').includes(d.donde)) k.donde = [k.donde, d.donde].filter(Boolean).join(' + ')
        if (!k.correo && d.correo) k.correo = d.correo
        quitar.add(id)
      }
    }
  }
  for (const aj of dec.ajustes) {
    const o = finales.find(x => x.id === aj.id)
    if (!o) continue
    if (aj.afinidad) o.afinidad = aj.afinidad
    if (aj.categoria) o.categoria = aj.categoria
    if (aj.hv) o.hv = aj.hv
    if (aj.nota) o.alertas = [o.alertas, `Ajuste: ${aj.nota}`].filter(Boolean).join('; ')
  }
  for (const d of dec.descartar) {
    const o = finales.find(x => x.id === d.id)
    if (o) { descartadas.push({ cargo: o.cargo, empresa: o.empresa, motivo: d.motivo }); quitar.add(d.id) }
  }
  finales = finales.filter(o => !quitar.has(o.id))
  prioridades = dec.prioridades
  resumen = dec.resumen
  for (const r of dec.recomendaciones_esfuerzo) {
    const e = esfuerzo.find(x => x.agente === r.agente)
    if (e) e.recomendacion = `${e.recomendacion} | Consolidador: ${r.recomendacion}`
  }
}
esfuerzo.push({ agente: ce.nombre, modelo: ce.model, esfuerzo_asignado: ce.effort, fuentes_revisadas: finales.length,
  bloqueos: dec ? '' : 'sin resultado', dificultad: '', recomendacion: ce.porque })
const ar = AGENTES.archivos
esfuerzo.push({ agente: ar.nombre, modelo: ar.model, esfuerzo_asignado: ar.effort, fuentes_revisadas: 0, bloqueos: '', dificultad: '', recomendacion: ar.porque })
esfuerzo.forEach(e => { const a = Object.values(AGENTES).find(x => x.nombre === e.agente); if (a) e.porque_asignado = a.porque })

const final = {
  fecha: F, desde: D, ofertas: finales.map(({ id, agente, cerrada, ...o }) => o), contactos, descartadas,
  cobertura, esfuerzo, prioridades, resumen, fuentes_nuevas: fuentesNuevas,
}

phase('Archivos')
const salida = await agent(`Tarea mecánica, sin análisis:
1. Crea la carpeta ${DIA} si no existe.
2. Escribe EXACTAMENTE este JSON (sin cambiar nada) en ${DIA}/final.json.
3. Ejecuta: python3 -I ${BASE}/generar_reporte.py ${DIA}
4. Si el script falla porque el JSON no es válido, corrige solo el error de sintaxis y vuelve a ejecutarlo.
5. Devuelve la última línea que imprime el script.

JSON:
${JSON.stringify(final)}`, opts('archivos', { phase: 'Archivos' }))

return {
  fecha: F, desde: D,
  conteos: { ofertas: finales.length, contactos: contactos.length, descartadas: descartadas.length },
  prioridades, resumen, esfuerzo, fuentes_nuevas: fuentesNuevas, salida_script: salida,
  carpeta: DIA,
}
