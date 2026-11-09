# Arquitectura — Tags de posts + pestaña Galería

Plan del arquitecto frontend. Complementa el prompt maestro
`documentacion/prompts/galeria-y-tags.md` (objetivo, decisiones y reglas).
Nada de esto está implementado todavía. Trabajan dos agentes en paralelo,
sin archivos en común (ver §8).

Hechos comprobados al estudiar el código y los recursos:

- `PostVivo` recibe un `PostInstagram` y se recorta a la caja de su padre
  (padre `position: relative` con el tamaño de la tarjeta). En vertical solo
  **encoge** (`--escala = min(1, (ancho + 2) / 328)`); nunca agranda: con un
  padre de más de 540 px el blockquote se queda en 540 px (`maxWidth: 540`).
  Para proyectar en grande hay que escalar **desde afuera**.
- `TarjetaPost` ya hace lo que necesita un álbum en la línea de tiempo:
  `useCerca('600px', true)`, `PortadaPost` de respaldo, `claveVivo`/`onTocado`
  para cortar audio con `useReinicios`. Se reutiliza sin modificarla.
- La fecha de un post se puede **deducir del código** de la URL (los 41 bits
  altos del id son milisegundos desde 1314220021721). Comprobado con tres
  posts del archivo de datos (coinciden exacto). Así agregar un álbum es
  pegar la URL y poner título y cuenta.
- El PDF ya está copiado en `public/documentos/40-anos-de-ira.pdf`
  (9.165.480 bytes, 10 páginas de 1440×810 pt, autora Laura Hernández,
  concierto del 16 de agosto de 2025 en la Media Torta). Cada página trae
  texto real (pies de foto) extraíble con `pdftotext`. La carpeta
  `public/images/libro-ira/` existe y está vacía.
- `public/404.html` es genérico: la ruta `/galeria` no necesita cambios ahí.
- Fechas de los álbumes (hora de Colombia, deducidas del código):

  | Código | Fecha |
  |---|---|
  | DPHcJnkkfNC | 2025-09-27 |
  | DYlVQx8FQt3 | 2026-05-20 |
  | DaJpdnWCRNV | 2026-06-28 |
  | DbCHNfOiWbx | 2026-07-20 |
  | Dc95tRSFJdY | 2026-09-06 |
  | DejlzvolcGr | 2026-10-16 |
  | DeqJPAekYql | 2026-10-18 |
  | DfCjUeFER4F | 2026-10-28 |

  El libro (2025-08-16) queda como primer hito de la línea de tiempo.

---

## 1. Tags temáticos en Posts de Instagram (BLOQUE TAGS)

### 1.1 Tipo y datos

`src/types/index.ts`:

```ts
/** Tema editorial de un post. */
export type TemaPost = 'cultura' | 'politica' | 'cubrimiento';

export interface PostInstagram {
  // …campos actuales…
  /** Tema para el filtro de Posts de Instagram. */
  tema?: TemaPost;
}

/** Post del muro: aquí el tema es obligatorio (tsc avisa si falta uno). */
export type PostConTema = PostInstagram & { tema: TemaPost };
```

`tema` es **opcional en `PostInstagram`** a propósito: la Galería construye
objetos `PostInstagram` para sus álbumes (para reutilizar `PostVivo` y
`TarjetaPost`) y no debe depender del tema ni romperse si un agente termina
antes que el otro. La obligatoriedad se impone en los datos:

`src/data/posts-instagram.ts`: `export const postsInstagram: PostConTema[] = [...]`
y cada uno de los 53 posts lleva `tema: '…'` (valor en minúsculas, sin tilde).

Criterio (en este orden; gana la primera regla que aplique):

1. **Cubrimiento**: hecho noticioso de terreno u orden público: coberturas en
   vivo, marchas, plantones, protestas, emergencias (terremoto, escombros),
   capturas, agresiones, masacres, denuncias de víctimas, cifras de violencia.
2. **Política**: el eje es una decisión o un actor institucional: Gobierno,
   Congreso, Concejo, candidatos, ministros, leyes, decretos, fallos de
   cortes, sanciones, tutelas, entrevistas a congresistas.
3. **Cultura**: música, conciertos, festivales, carnaval, arte, ciencia y
   divulgación, perfiles de personajes, colectivos culturales.

Propuesta inicial (el agente de tags la revisa leyendo cada post):

- Cultura: 7, 10, 12, 14, 16, 17, 19, 33.
- Política: 1, 2, 4, 8, 11, 15, 18, 20, 21, 22, 23, 25, 28, 32, 34, 36, 37,
  38, 39, 40, 41, 42, 45, 47, 49, 50, 51, 52.
- Cubrimiento: 3, 5, 6, 9, 13, 24, 26, 27, 29, 30, 31, 35, 43, 44, 46, 48, 53.
- Dudosos a confirmar: 6 (MeToo), 14 (Nadia Murad en foro), 17 (VPH),
  33 y 52 (Resistencia Chiquita).

### 1.2 Filtro en `src/pages/PostsInstagramPage.tsx`

- Constante local (no en `lib/posts.ts`, que es del otro bloque):

  ```ts
  const TEMAS: { id: TemaPost; etiqueta: string }[] = [
    { id: 'cultura', etiqueta: 'Cultura' },
    { id: 'politica', etiqueta: 'Política' },
    { id: 'cubrimiento', etiqueta: 'Cubrimiento' },
  ];
  ```
- Estado `const [tema, setTema] = useState<TemaPost | null>(null)`, mismo
  patrón que `tipo`: sin chip marcado se ven todos y tocar el marcado lo
  desmarca. `cambiarTema(t)` = `setTema(actual => actual === t ? null : t)`
  + `reiniciarMuro()`.
- `lista` añade el filtro en el mismo `useMemo` y su dependencia:
  `.filter(p => (!tipo || p.tipo === tipo) && (!tema || p.tema === tema))`,
  deps `[tipo, tema, orden]`.
- Sin cambios en el mecanismo del muro: se sigue pintando
  `postsInstagram.map(...)` completo, con `order: i` y `hidden` según
  `posicion`/`mostrados`. Así ningún iframe se mueve ni se desmonta al
  filtrar por tema. El scroll infinito de a 8 y `VisorPost posts={lista}`
  funcionan igual (el visor recorre solo los del tema filtrado).
- Barra: un tercer grupo `<div className={styles.grupo} role="group"
  aria-label="Tema">` con un chip por tema, `aria-pressed`, y el conteo del
  tema dentro de la vista de formato actual (`Cultura · 8`). Un chip con 0
  resultados va `disabled`. Entre el grupo de formato y el de tema, un
  separador visual (`.separador`, línea de 1 px lila) que se oculta en ≤600 px.
- `conteo`: `12 publicaciones · Política` cuando hay tema elegido.
- Riesgo: con un grupo más, la barra sticky crece en celular y
  `ALTO_BARRAS = 150` puede quedarse corto. Medir en vez de fijar: `barraRef`
  y `tope = muro.top + scrollY - (barra.bottom + 16)`. Revisar a 375 px.

### 1.3 Cómo se muestra la etiqueta

Igual que la sección de **Artículos digitales** (`.seccion`: píldora sobre
la imagen, mayúsculas, 0.7rem, peso 800) pero **sin tocar `TarjetaPost`**:

- `.item` pasa a `position: relative` y, como hijo del `<li>` después de
  `TarjetaPost`, va `<span className={styles.tema} data-tema={p.tema}>
  {etiqueta}</span>`, absoluto arriba a la derecha de la tarjeta
  (`top: 10px; right: 10px; z-index: 4; pointer-events: none`). El sello
  «Top» de `TarjetaPost` está arriba a la izquierda, así no chocan.
- Sigue el `translateY(-4px)` del hover: `.item:hover .tema { translate: 0 -4px }`
  con la misma transición (sin ella si `prefers-reduced-motion`).
- Colores solo en la paleta morada, distintos por tema:
  - `cultura`: degradado `var(--color-lilac-mid)` → `#e9d5ff`, texto `#3b0764`.
  - `politica`: degradado `#7e22ce` → `#9d5cf0`, texto blanco (el de Artículos).
  - `cubrimiento`: fondo `#3b0764` con borde `1px solid rgba(216,180,254,.5)`,
    texto `var(--color-acento-texto)`.
- La etiqueta también aparece en el pie: `Reel · Política · @cuenta` en
  `.cuenta`, para lectores de pantalla y para quien no ve la píldora.
- `VisorPost` y `TopPage` no se tocan (no es imprescindible).

---

## 2. Galería — datos y tipos (BLOQUE GALERÍA)

### 2.1 `src/types/galeria.ts` (archivo propio)

```ts
import type { PostInstagram } from './index';

/** Lo que se escribe a mano en `src/data/galeria.ts`. */
export interface Album {
  /** URL del carrusel tal cual se copia de Instagram (con o sin `?img_index`). */
  url: string;
  titulo: string;
  /** Cuenta sin `@`. */
  cuenta: string;
  /** AAAA-MM-DD. Si falta, se deduce del código de la URL. */
  fecha?: string;
  lugar?: string;
  descripcion?: string;
  /** Número de fotos del carrusel (texto «12 fotos»). */
  fotos?: number;
  /** Proporción de las fotos. Por defecto `'4:5'`. */
  proporcion?: '4:5' | '1:1';
}

/** Álbum listo para pintar (derivado en `lib/galeria.ts`). */
export interface AlbumListo extends Album {
  codigo: string;
  fecha: string;
  /** El mismo álbum como post, para `PostVivo`/`TarjetaPost`/`PortadaPost`. */
  post: PostInstagram;
}

export interface PaginaLibro {
  /** 1280 px de ancho (vista normal). */
  imagen: string;
  /** 2400 px de ancho (pantalla completa y zoom). */
  imagenGrande: string;
  /** 320 px de ancho (tira de miniaturas). */
  miniatura: string;
  ancho: number; // de `imagenGrande`
  alto: number;
  /** Pie de foto de la página (sacado del PDF); también es el `alt`. */
  texto: string;
}

export interface LibroFotos {
  titulo: string;
  autora: string;
  fecha: string;
  lugar: string;
  descripcion: string;
  /** Ruta en `public/`. */
  pdf: string;
  /** Peso legible para el botón de descarga, p. ej. «8,7 MB». */
  pesoPdf: string;
  paginas: PaginaLibro[];
}
```

### 2.2 `src/data/galeria.ts`

```ts
import type { Album, LibroFotos } from '../types/galeria';

/* Para sumar un álbum: pegar la URL y poner título y cuenta. La fecha sale
   sola del código del post; la línea de tiempo los ordena por fecha. */
export const albumes: Album[] = [
  { url: 'https://www.instagram.com/p/DfCjUeFER4F/?img_index=1', titulo: '…', cuenta: '…', lugar: '…', descripcion: '…', fotos: 0 },
  // … los 8, en el orden del prompt maestro
];

const pagina = (n: number, texto: string) => {
  const nn = String(n).padStart(2, '0');
  return {
    imagen: `/images/libro-ira/pagina-${nn}.webp`,
    imagenGrande: `/images/libro-ira/pagina-${nn}-2400.webp`,
    miniatura: `/images/libro-ira/pagina-${nn}-mini.webp`,
    ancho: 2400,
    alto: 1350,
    texto,
  };
};

export const libroIra: LibroFotos = {
  titulo: '40 años de I.R.A.',
  autora: 'Laura Hernández',
  fecha: '2025-08-16',
  lugar: 'Media Torta, Bogotá',
  descripcion: 'La legendaria banda de punk inició la celebración de sus 40 años…',
  pdf: '/documentos/40-anos-de-ira.pdf',
  pesoPdf: '8,7 MB',
  paginas: [pagina(1, '…'), /* … */ pagina(10, '…')],
};
```

Título, cuenta, lugar, descripción y número de fotos de cada álbum: el
agente los toma abriendo cada post (Chrome) — el HTML del embed no los
expone por `curl`. Si no se pueden leer, se deja un título provisional
claro y se avisa en el resumen. Los textos del libro salen de
`pdftotext -f N -l N -layout public/documentos/40-anos-de-ira.pdf -`
(página 1: portada con el texto de presentación; resto: pies en mayúsculas,
pasarlos a tipo oración).

### 2.3 `src/lib/galeria.ts`

- `codigoDesdeUrl(url)`: segmento después de `/p/` (o `/reel/`), usando
  `limpiarUrlInstagram` de `lib/instagram.ts`.
- `fechaDesdeCodigo(codigo)`:

  ```ts
  const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  const EPOCA_INSTAGRAM = 1314220021721n;
  export function fechaDesdeCodigo(codigo: string): string {
    let id = 0n;
    for (const c of codigo) id = id * 64n + BigInt(ALFABETO.indexOf(c));
    const ms = Number((id >> 23n) + EPOCA_INSTAGRAM);
    // en-CA da AAAA-MM-DD; hora de Colombia para no correr el día.
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(ms);
  }
  ```
  (`target` ES2023: los literales `BigInt` compilan.)
- `prepararAlbumes(albumes): AlbumListo[]` — deriva `codigo`, `fecha`
  (`a.fecha ?? fechaDesdeCodigo(codigo)`) y `post: { id: codigo, url:
  limpiarUrlInstagram(a.url), titulo, cuenta, fecha, tipo: 'carrusel' }`,
  y ordena por fecha **ascendente** (la línea de tiempo se lee del pasado al
  presente; la proyección sigue ese mismo orden).
- `formatearFechaLarga`, `formatearMes` (`es-CO`, a mediodía como hace
  `VisorPost` para no correr el día).
- `ALBUMES = prepararAlbumes(albumes)` se exporta ya calculado (módulo, no
  `useMemo`, igual que `top` en `TopPage`).

Si la cuenta de los álbumes no es `eltiempo`, `cuestionp` ni `lamartineris`,
agregarla en `NOMBRE_CUENTA`/`INICIALES_CUENTA` de `src/lib/posts.ts` y en
los bloques `[data-cuenta=…]` de `src/index.css` (solo `--c1`/`--c2` morados).

---

## 3. Ruta, menú y perfiles (BLOQUE GALERÍA)

- `src/App.tsx`: `import GaleriaPage from './pages/GaleriaPage'` y
  `<Route path="/galeria" element={<GaleriaPage />} />` dentro de
  `GuardiaSecciones`.
- `src/components/Navbar.tsx`: `{ path: '/galeria', label: 'Galería' }`
  después de «Reportaje». Con 7 enlaces el menú puede partirse entre 900 y
  1150 px: revisar a 901, 1024 y 1150 px; si no cabe, bajar el padding de
  `.navLink` o subir el corte del menú hamburguesa en `Navbar.module.css`.
  De paso, `aria-label="Toggle menu"` → `"Abrir menú"`/`"Cerrar menú"`
  con `aria-expanded`.
- `src/data/perfiles.ts`: `const RUTAS_GALERIA = ['/galeria'];` y
  `...RUTAS_GALERIA` en `secciones` de los tres perfiles. El generador de HV
  (`hv/`) no se toca.

---

## 4. Componentes de la Galería

Árbol:

```
GaleriaPage                         src/pages/GaleriaPage.tsx (+ .module.css)
├─ EncabezadoPagina (eyebrow, título, datos, botones)
├─ LineaTiempo                      src/components/galeria/LineaTiempo.tsx
│  ├─ HitoLibro  (nodo del libro, 2025-08-16 → ancla #libro)
│  └─ HitoAlbum × 8 (TarjetaPost + info + «Proyectar»)
├─ VisorLibro  (id="libro")         src/components/galeria/VisorLibro.tsx
└─ ProyeccionAlbumes (<dialog>)     src/components/galeria/ProyeccionAlbumes.tsx
   └─ PantallaEscalada × 8          (lienzo 540 px + PostVivo, escala con transform)
```

### 4.1 `GaleriaPage`

- `document.title = \`Galería · ${perfil.tituloDocumento}\`` (`usePerfil`).
- `EncabezadoPagina` con `eyebrow="Fotografía · Coberturas"`,
  `titulo="Galería de"`, `resaltado="fotos"`, `datos` = álbumes, fotos
  (suma de `fotos` si están) y páginas del libro, y `children`: botón
  primario «Iniciar proyección» (`IconPlay`, abre en el álbum 0) y enlace
  «Ver el libro» (`#libro`).
- Estado: `proyectando: number | null` (álbum abierto en la proyección).
  `const reinicios = useReinicios()` para los iframes de la línea de tiempo;
  al abrir la proyección se llama `reinicios.soltar()` (corta cualquier
  video que estuviera sonando en la página).

### 4.2 `LineaTiempo` (eje vertical, inmersivo)

- Lista `<ol>` sobre un eje vertical: línea central de 2 px con degradado
  `var(--c1)`→`var(--c2)` y brillo (`box-shadow` lila). Un relleno del eje
  avanza con el scroll usando `animation-timeline: view()` dentro de
  `@supports`, igual que `.revelar` en `index.css`. Sin soporte, el eje se
  ve completo.
- Marcadores de año (`2025`, `2026`) gigantes, translúcidos y `sticky`
  (estilo `fondoNumero` del Top), solo decorativos (`aria-hidden`).
- Cada hito: punto en el eje con el mes y el día, y una tarjeta que alterna
  izquierda/derecha en escritorio (≥900 px). En tablet y celular, eje a la
  izquierda (24 px) y tarjetas a la derecha en una sola columna.
- `HitoAlbum` (`<li>` con `data-cuenta` para los `--c1/--c2` de la cuenta):
  - `TarjetaPost post={a.post} claveVivo={clave(a.post.url)}
    onTocado={() => marcar(a.post.url)}` **sin** `onAbrir`: el carrusel es
    interactivo ahí mismo (se pasan las fotos con sus flechas) y monta el
    iframe solo al acercarse (`useCerca('600px', true)` interno). Ancho
    máximo 360 px (embed ≥ 328 px, se ve nítido). Para `proporcion: '1:1'`,
    el contenedor de la tarjeta cambia `aspect-ratio` vía clase local.
  - Info: fecha larga, `<h3>` título, lugar, `@cuenta`, descripción,
    «N fotos», botón «Proyectar» (`IconExpand`, `aria-label="Proyectar el
    álbum: {título}"`) → `onProyectar(i)`, enlace «Ver en Instagram».
  - Al tocar el iframe de otro hito, `soltar(urlDelNuevo)`: solo suena uno.
- `HitoLibro`: tarjeta 16:9 con `miniatura` de la página 1 (`<img>`
  `loading="lazy"`), «Libro de fotos · 10 páginas», botón «Abrir el libro»
  que hace `scrollIntoView` a `#libro` y le pasa el foco al visor.
- Animación de entrada con la clase global `revelar`.

### 4.3 `ProyeccionAlbumes` (modo proyección)

Props: `albumes: AlbumListo[]`, `indice: number | null`,
`onCambiar(i)`, `onCerrar()`, `onVerLibro()`.

**Contenedor**: `<dialog>` nativo con `showModal()` (patrón de `VisorPost`:
efecto que abre/cierra según `indice`, bloqueo del scroll de `<html>`,
`onClose`). Ocupa `100dvw × 100dvh`, fondo `#0b0416`, `::backdrop` negro.

**Escena «sala de cine»** (todo en CSS, solo morados):
- Haz del proyector: cono `conic-gradient`/`radial-gradient` lila desde el
  borde superior hacia la pantalla, con `mix-blend-mode: screen` y un
  parpadeo leve (se quita con `prefers-reduced-motion`).
- La pantalla: marco con borde fino lila y halo `0 0 120px var(--c1)` que
  cambia con `data-cuenta` del álbum actual.
- Manchas de fondo y número del álbum gigante (`01`…`08`) como en el Top.
- Cartela del álbum (fecha, título, lugar, «N fotos»): a la derecha de la
  pantalla en escritorio, abajo en celular. Al cambiar de álbum entra con
  un fundido corto.

**Escala del embed (sin tocar `PostVivo`)**:

```
.pantalla (mide el espacio libre; ResizeObserver)
 └─ .diapositiva × N  (absolutas, superpuestas; data-estado antes|actual|despues)
     └─ .lienzo  width: 540px; height: 675px (4:5) o 540px (1:1)
                 transform: scale(var(--escala)); transform-origin: center
         ├─ PortadaPost post={a.post}
         └─ PostVivo key={clave(url)} post={a.post} interactivo={esActual}
                     onTocado={() => { marcar(url); setPausadoPorToque(true) }}
```

- Con el lienzo fijo a 540 px, `PostVivo` calcula `--escala = 1` y el embed
  ocupa exacto su ancho máximo; el recorte de cabecera y pie sigue igual.
- Hook nuevo `useEscalaAjustada(ref, 540, 675)` →
  `escala = min(anchoLibre / 540, altoLibre / 675)` con `ResizeObserver`;
  lo pone como `--escala` en `.pantalla`. Tope `ESCALA_MAXIMA = 1.8`: el
  embed carga imágenes para 540 px CSS, más allá se ven blandas.
- Los clics dentro del iframe escalado funcionan (el navegador mapea el
  transform).

**Montaje y rendimiento**:
- `useYaCargados(indice, 1)`: monta el álbum actual y sus vecinos; una vez
  montado se queda (no recarga al volver). Los demás solo tienen la
  `PortadaPost`.
- Las diapositivas nunca cambian de lugar en el DOM: la transición es solo
  CSS sobre `data-estado` (la que sale se va hacia atrás con `scale(.92)` y
  fundido, la que entra viene desde el costado con un `rotateY` leve, como
  diapositiva proyectada). Las no actuales llevan `aria-hidden` e `inert`.
- Al cerrar el diálogo los iframes quedan montados (el `<dialog>` cerrado es
  `display: none`), así reabrir es instantáneo; pero se llama `soltar()`
  para destruir el que pudo quedar sonando.

**Avance automático**:
- `SEGUNDOS_POR_ALBUM = 14`. Barra de progreso por álbum, estilo historias,
  igual que `Segmentos` del Top: la del actual se llena con una animación
  CSS (`animationDuration`, `animationPlayState`) y su `onAnimationEnd`
  pasa al siguiente. Pausar = pausar la animación (sin `setInterval`).
- `detenido = pausadoPorUsuario || pausadoPorToque || encima || oculto || !listo`:
  - `pausadoPorUsuario`: botón Pausa/Reproducir y la tecla Espacio. Se
    mantiene al cambiar de álbum.
  - `pausadoPorToque`: el iframe recibió el foco (`onTocado` de `PostVivo`,
    que detecta `blur` de la ventana + `document.activeElement` iframe).
    Se limpia en `ir()`, como en el Top.
  - `encima`: puntero sobre la pantalla (`pointerenter/leave`, solo
    `(hover: hover)`), para que no cambie mientras se mira.
  - `oculto`: `document.visibilityState === 'hidden'`.
  - `!listo`: hasta que el embed actual carga no corre el tiempo. Desde
    afuera, sin tocar `PostVivo`: un `MutationObserver` (atributos,
    subárbol) sobre la diapositiva actual detecta el `data-listo` que
    `PostVivo` pone en su `.vivo`. Respaldo: arrancar igual a los 6 s
    (Instagram bloqueado).
  - `prefers-reduced-motion: reduce`: arranca con `pausadoPorUsuario = true`.
- Al terminar el último: diapositiva final «Fin de la proyección» con
  «Ver de nuevo» (vuelve al 0) y «Abrir el libro 40 años de I.R.A.»
  (`onVerLibro`: cierra, baja a `#libro`).
- Indicador visible de pausa por toque: «En pausa mientras miras el álbum»
  con botón «Seguir».

**Cortar audio**: `const { marcar, soltar, clave } = useReinicios()` propio de
la proyección. En `ir(destino)`: `setIndice`, `soltar(albumes[destino].post.url)`.
La `key={clave(url)}` nueva desmonta el iframe que sonaba.

**Controles** (barra inferior, botones reales con `aria-label`):
anterior, pausa/reproducir, siguiente, «3 / 8», pantalla completa, «Ver en
Instagram», cerrar. Flechas grandes a los lados de la pantalla en
escritorio. Una «cinta de fotogramas» con los 8 álbumes como botones de
texto (fecha + título, sin iframes) para saltar a cualquiera; sigue al
actual con `scrollTo` horizontal (como la tira del Top).

**Pantalla completa**: hook nuevo `usePantallaCompleta(ref)` →
`{ activa, alternar, soportada }` sobre `requestFullscreen` /
`document.exitFullscreen` y el evento `fullscreenchange`. Se aplica al
`<dialog>`. Si `!document.fullscreenEnabled` (iPhone), el botón no se
muestra: el diálogo ya ocupa toda la pantalla.

**Gestos**: deslizar a los lados fuera del iframe (patrón `alEmpezarToque` /
`alTerminarToque` de `VisorPost`, umbral 50 px).

### 4.4 `VisorLibro` (sección `#libro`, en la página, no modal)

- Encabezado de sección: «Libro de fotos», título, autora, fecha y lugar,
  descripción; botones «Descargar PDF (8,7 MB)» (`<a href={rutaPublica(pdf)}
  download="40-anos-de-ira.pdf">`, `IconDownload`) y «Abrir PDF» (pestaña
  nueva).
- Escenario 16:9 grande (ancho del contenedor, máx. 1150 px):
  `<img srcSet="… 1280w, … 2400w" sizes="(max-width: 900px) 100vw, 1150px"
  alt={pagina.texto} width={ancho} height={alto}>`. Pie de foto visible
  debajo (`pagina.texto`) y «Página 3 de 10».
- Pasar página: flechas laterales, teclado, deslizar y clic en la mitad
  izquierda/derecha de la página (solo con zoom 1). Transición de «hoja»:
  la nueva entra con `rotateY(-14deg) → 0` y la saliente se va con fundido
  (dos capas `data-estado`, como la proyección). Sin animación con
  `prefers-reduced-motion`.
- Precarga: al cambiar de página, `new Image()` + `decode()` de la
  siguiente y la anterior (y de `imagenGrande` cuando está en pantalla
  completa). La página 1 sin `loading="lazy"`; el resto entran por precarga.
- Miniaturas: tira horizontal con `scroll-snap`, cada una botón con la
  `miniatura` (`loading="lazy"`), `aria-label="Ir a la página N"`,
  `aria-current` en la activa; la tira sigue a la activa con `scrollTo`
  (sin mover el scroll de la página).
- Zoom (mismo modelo que `VisorImagen`, sin modificarlo): niveles
  `[1, 1.8, 2.6]`; clic/toque en la página alterna centrando donde se tocó,
  botones `+`/`−`, teclas `+`, `-`, `0`. Con zoom > 1 la página está en un
  lienzo con `overflow: auto` que se arrastra (pointer events) y carga
  `imagenGrande`; las flechas del teclado desplazan en vez de pasar página.
  Al cambiar de página el zoom vuelve a 1.
- Pantalla completa: `usePantallaCompleta` sobre el contenedor del visor;
  fondo negro, página a `100dvh` con miniaturas ocultables. Si la API no
  está (iPhone), modo alternativo CSS (`data-ampliado`: `position: fixed;
  inset: 0; z-index: 100`) con bloqueo del scroll y Escape para salir.
- Teclado: el visor es `role="region"` `aria-roledescription="visor de
  libro"` `aria-label="40 años de I.R.A."` con `tabIndex={0}`; el
  `keydown` se escucha en el contenedor (no en `window`) para no robarle
  las flechas al scroll de la página. Teclas: ←/→, Inicio/Fin, F, +/−/0.

---

## 5. Estado y rendimiento (resumen)

| Pieza | Montaje de iframes | Corte de audio |
|---|---|---|
| Línea de tiempo | `TarjetaPost` → `useCerca('600px', true)`: monta al acercarse y se queda | `useReinicios` de la página; `soltar()` al abrir la proyección y al tocar otro |
| Proyección | `useYaCargados(indice, 1)`; diapositivas fijas en el DOM, solo CSS | `useReinicios` propio; `soltar(destino)` en cada `ir()` y `soltar()` al cerrar |
| Libro | sin iframes; imágenes WebP + precarga ±1 | — |

- Embed: un solo `embed.js` compartido (`procesarEmbedsInstagram`).
- Peso del libro en el repo: ~10 × (2400 px ≈ 300 KB + 1280 px ≈ 110 KB +
  mini ≈ 15 KB) ≈ 4–5 MB. Solo se descarga la versión 1280 + miniaturas
  hasta que se pide zoom o pantalla completa.
- Ningún iframe se carga al abrir la página más allá de los que están cerca
  de la pantalla.

### 5.1 Pre-render del libro

Script `scripts/renderizar-libro.sh` (bash, reproducible; las herramientas
están en `/opt/homebrew/bin`):

```sh
PDF=public/documentos/40-anos-de-ira.pdf
SAL=public/images/libro-ira
TMP=$(mktemp -d)
pdftoppm -png -scale-to-x 2400 -scale-to-y -1 "$PDF" "$TMP/p"
for f in "$TMP"/p-*.png; do
  n=$(basename "$f" .png | sed 's/^p-0*//'); nn=$(printf %02d "$n")
  cwebp -quiet -q 82 "$f" -o "$SAL/pagina-$nn-2400.webp"
  cwebp -quiet -q 80 -resize 1280 0 "$f" -o "$SAL/pagina-$nn.webp"
  cwebp -quiet -q 70 -resize 320 0 "$f" -o "$SAL/pagina-$nn-mini.webp"
done
rm -rf "$TMP"
```

Comprobar el tamaño real de la primera imagen (`ancho`/`alto` en los
datos deben coincidir; 1440×810 pt → 2400×1350 px).

---

## 6. Accesibilidad

- Proyección: `<dialog>` modal (fondo inerte, Escape cierra de forma
  nativa, el foco vuelve al botón que la abrió al cerrar). Foco inicial en
  el botón Pausa/Reproducir. `aria-roledescription="presentación"` en la
  escena y `aria-roledescription="diapositiva"` + `aria-label="Álbum 3 de
  8: título"` en cada diapositiva.
- `aria-live`: un `<p className="srOnly">` anuncia «Álbum 3 de 8: título,
  fecha». Es `polite` cuando el cambio es manual y `off` durante el avance
  automático (anunciar cada 14 s es ruido). El visor del libro anuncia
  «Página 4 de 10» del mismo modo.
- Botones reales con `aria-label` en español; `aria-pressed` en
  Pausa/Reproducir y en Pantalla completa; foco visible (anillo lila
  `outline: 2px solid var(--color-lilac-mid)`).
- Teclado documentado en una ayuda visible y corta («← → cambiar · Espacio
  pausa · F pantalla completa · Esc salir»). Aviso: con el foco dentro del
  iframe de Instagram las teclas las recibe Instagram; la ayuda dice «Toca
  fuera de la foto para volver a usar el teclado».
- `prefers-reduced-motion`: sin haz parpadeante, sin `rotateY`, sin avance
  automático al abrir, sin relleno animado del eje.
- Imágenes del libro con `alt` = pie de la página; decorativas con `alt=""`
  o `aria-hidden`.

## 7. Responsive

- **Escritorio (>900 px)**: línea de tiempo alternada; proyección con
  pantalla al centro, cartela a la derecha, flechas laterales y cinta de
  fotogramas abajo; libro a 1150 px con miniaturas debajo.
- **Tablet (≤900 px)**: línea de tiempo a una columna con eje a la
  izquierda; proyección con cartela debajo de la pantalla (la escala se
  recalcula sola con `useEscalaAjustada`); libro a todo el ancho.
- **Celular (≤600 px)**: tarjetas de álbum a todo el ancho (TarjetaPost
  encoge el embed por debajo de 328 px como ya hace); en la proyección se
  ocultan las flechas laterales (quedan los gestos y la barra inferior) y
  la cartela se reduce a fecha + título; libro en 16:9 a todo el ancho con
  miniaturas de 96 px y botón de pantalla completa destacado (se sugiere
  girar el teléfono). Probar a 375 × 667 y 390 × 844.
- Sin scroll horizontal de página en ningún tamaño.

---

## 8. Lista de archivos (dos bloques sin archivos en común)

### BLOQUE TAGS (agente de tags)

Modificar:
- `src/types/index.ts` — `TemaPost`, `tema?: TemaPost` en `PostInstagram`,
  `PostConTema`. **No** hacer `tema` obligatorio en `PostInstagram`.
- `src/data/posts-instagram.ts` — tipo `PostConTema[]` y `tema` en los 53.
- `src/pages/PostsInstagramPage.tsx` — `TEMAS`, estado `tema`, chips,
  filtro, conteo, píldora en la tarjeta y texto en el pie.
- `src/pages/PostsInstagramPage.module.css` — `.tema` y variantes
  `data-tema`, `.separador`, `.item { position: relative }`.
- `src/components/post/*` — no se tocan.

### BLOQUE GALERÍA (agente de galería; no toca ningún archivo del bloque tags)

Crear:
- `src/types/galeria.ts`
- `src/data/galeria.ts`
- `src/lib/galeria.ts`
- `src/hooks/useEscalaAjustada.ts`
- `src/hooks/usePantallaCompleta.ts`
- `src/pages/GaleriaPage.tsx`, `src/pages/GaleriaPage.module.css`
- `src/components/galeria/LineaTiempo.tsx`, `LineaTiempo.module.css`
- `src/components/galeria/ProyeccionAlbumes.tsx`, `ProyeccionAlbumes.module.css`
- `src/components/galeria/VisorLibro.tsx`, `VisorLibro.module.css`
- `scripts/renderizar-libro.sh`
- `public/images/libro-ira/pagina-NN.webp`, `pagina-NN-2400.webp`,
  `pagina-NN-mini.webp` (NN = 01…10)
- `public/documentos/40-anos-de-ira.pdf` — ya copiado; solo verificar que
  pese 9.165.480 bytes.

Modificar:
- `src/App.tsx` — ruta `/galeria`.
- `src/components/Navbar.tsx` — ítem «Galería» (y `aria-label`/`aria-expanded`
  del botón de menú).
- `src/components/Navbar.module.css` — solo si el menú no cabe con 7 ítems.
- `src/data/perfiles.ts` — `RUTAS_GALERIA` en los tres perfiles.
- `src/components/icons/index.tsx` — `IconDownload`, `IconFullscreen`,
  `IconFullscreenExit`, `IconZoomIn`, `IconZoomOut`, `IconBook` (mismo
  formato `IconProps`, trazo `currentColor`).
- `src/lib/posts.ts` y `src/index.css` — solo si los álbumes usan una cuenta
  nueva (nombre, iniciales y `--c1/--c2` morados).

Solo se importan (sin modificar): `PostVivo`, `PortadaPost`, `TarjetaPost`,
`EncabezadoPagina`, `useCerca`, `useReinicios`, `useYaCargados`,
`useMediaQuery`, `usePerfil`, `lib/instagram.ts`, `lib/rutas.ts`.

### Verificación (ambos bloques, al final y sin commit)

`npx tsc -b`, `npx eslint src`, `npm run build`. Probar en `npm run dev`:
filtros combinados (formato × tema × orden) sin recargas de iframes;
`/galeria?perfil=periodista|community-manager|comunicadora`; proyección con
teclado, gestos, pausa al tocar, fin; libro con zoom, pantalla completa,
descarga; anchos 375, 768, 1024 y 1440 px.
