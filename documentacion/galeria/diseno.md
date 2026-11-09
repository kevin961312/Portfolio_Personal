# Especificación de diseño — Tags de posts + página Galería

Rol: diseño frontend (UI/UX y motion). Documento para quien implemente.
Basado en el lenguaje visual que ya existe: `src/index.css`, `TopPage.*`,
`PostsInstagramPage.module.css`, `ArticulosDigitalesPage.module.css`,
`VisorPost.module.css`, `TarjetaPost.module.css`, `EncabezadoPagina.*`.

Reglas que gobiernan todo:

- **Solo morados y lilas** (tokens de `index.css`, `--c1`/`--c2` por cuenta).
  El único "no morado" permitido es el blanco del texto y el casi negro
  violáceo de la sala de proyección.
- **Iframes**: nunca se mueven en el DOM ni se desmontan sin necesidad. Todo
  el movimiento es `transform`/`opacity` sobre contenedores; los álbumes que
  ya cargaron se quedan montados (patrón `useYaCargados` del Top).
- Breakpoints del proyecto: **celular ≤600 px**, **tablet 601–900 px**,
  **escritorio >900 px** (el visor de posts usa 899 px; aquí se respeta igual).
- Easing de la casa: `cubic-bezier(0.2, 0.8, 0.2, 1)` (en adelante
  **`--ease-cine`**). Duraciones de referencia: micro 150 ms, entrada de
  texto 600–700 ms, cambio de pieza 700 ms, colores de fondo 900 ms.

---

## 0. Tokens nuevos

No se tocan los tokens globales. Lo nuevo se declara en el contenedor de cada
pieza (CSS Modules), salvo los tres tonos de tema, que conviene poner en
`:root` porque los usan Posts y (en el futuro) otras páginas.

```css
/* index.css — tonos de tema (todos dentro de la escala morada) */
:root {
  --tema-cultura: #d8b4fe;      /* lila claro: lo más luminoso */
  --tema-politica: #a78bfa;     /* violeta (el --c2 de cuestionp) */
  --tema-cubrimiento: #9333ea;  /* morado intenso (--color-purple-soft) */
}

/* GaleriaPage.module.css / Proyeccion.module.css */
.page, .sala {
  --ease-cine: cubic-bezier(0.2, 0.8, 0.2, 1);
  --ease-hoja: cubic-bezier(0.645, 0.045, 0.355, 1); /* giro de hoja del libro */
  --sala-bg: #07030d;                               /* negro violáceo de la sala */
  --haz: rgba(216, 180, 254, 0.11);                 /* luz del proyector */
  --pantalla-borde: rgba(255, 255, 255, 0.14);
  --texto-suave: rgba(255, 255, 255, 0.72);         /* igual que en el Top */
}
```

Iconos nuevos en `src/components/icons/index.tsx` (mismo trazo 2 px, 24×24,
`currentColor`, como los existentes): `IconDownload`, `IconZoomIn`,
`IconZoomOut`, `IconShrink` (salir de pantalla completa), `IconBook`,
`IconCalendar` (opcional, para la fecha). Se reutilizan `IconPlay`,
`IconPause`, `IconChevronLeft/Right`, `IconExpand`, `IconClose`,
`IconCarousel`, `IconLocation`, `IconInstagram`, `IconExternalLink`,
`IconImage`.

---

## 1. Tema en Posts de Instagram (Cultura / Política / Cubrimiento)

### 1.1 Chips de filtro

Ubicación: en la `.barra` sticky que ya existe, como **tercer grupo**, entre
"Formato" y el control segmentado de orden:

```
[Reels] [Carruseles]  │  [● Cultura] [● Política] [● Cubrimiento]      (Más vistos | Recientes)
```

- Grupo con `role="group"` y `aria-label="Tema"`.
- **Mismo comportamiento que Formato** (no se añade un chip "Todos"): sin
  ninguno marcado se ven todos; tocar el marcado lo desmarca. Así la barra de
  esta página sigue una sola lógica. Se combina con Formato y con el orden
  (intersección), y reinicia el muro a la primera tanda de 8 igual que hoy
  (`reiniciarMuro`).
- Mismo `.chip` (38 px de alto mínimo, radio 999 px, 0.84rem/600). Lo único
  nuevo: un **punto de color** de 8×8 px antes del texto, con el tono del
  tema (`--tema-*`), `margin-right: 0.45rem`, `border-radius: 50%`,
  `box-shadow: 0 0 0 3px color-mix(in srgb, var(--tema) 22%, transparent)`.
- Marcado (`aria-pressed="true"`): el degradado de siempre
  `linear-gradient(135deg, #7e22ce, #9d5cf0)` y el punto pasa a `#fff`.
- Separador entre grupos: `1px × 22px`, `background: var(--color-lilac-border)`,
  `align-self: center`, `aria-hidden`. En celular se mantiene (la barra hace
  scroll horizontal sin cortes, `flex-wrap: nowrap`, como ahora).
- Transición: `background, color, border-color 150ms` (la existente).

Texto del conteo (`.conteo`, `aria-live="polite"`):

- Sin tema: `24 publicaciones`
- Con tema: `9 publicaciones · Cultura`
- Vacío: `No hay publicaciones de Cubrimiento con estos filtros.`

### 1.2 Etiqueta del tema en cada tarjeta

No va sobre la foto: arriba a la izquierda ya está el sello de formato
(Reel / Carrusel) y abajo el embed tiene sus puntos y la pista "Ver en
grande". Va en el **pie**, encima del título, como el `.medio` de Artículos
digitales:

```
● CULTURA
Título del post en dos líneas como máximo…
♥ 68,9K  Carrusel · @eltiempo                     ↗
```

- `.tema`: `display: inline-flex; gap: 0.35rem; align-items: center;`
  `font-size: 0.68rem; font-weight: 800; letter-spacing: 0.08em;`
  `text-transform: uppercase; color: var(--tema);` punto de 6×6 px del mismo
  color. En celular 0.62rem.
- En el **visor** (`VisorPost`), la línea `.medio` del panel pasa a
  `Cultura · EL TIEMPO` (el tema primero, en su tono).
- Contraste: los tres tonos sobre `#12081f` superan 4.5:1 en texto de
  0.68rem/800 (#9333ea es el más justo, ~4.6:1; si se ve débil, usar
  `#a855f7` para el texto y dejar `#9333ea` solo en el punto).

---

## 2. Página Galería — estructura

Ruta `/galeria`. Menú: **"Galería"** (después de "Posts de Instagram").
`document.title`: `Galería · {perfil.tituloDocumento}`.

```
┌ EncabezadoPagina ───────────────────────────────────────────┐
│ FOTOGRAFÍA                                                   │
│ Galería de fotos            (fotos en degradado lila)        │
│ lead                                                         │
│ [8 álbumes] [N fotos] [10 páginas del libro]                 │
│ [▶ Ver en pantalla gigante]  [📖 Abrir el libro]             │
└──────────────────────────────────────────────────────────────┘
┌ Sub-navegación sticky (top: 64px) ──────────────────────────┐
│ ( Álbumes · 8 | Libro de fotos )                             │
└──────────────────────────────────────────────────────────────┘
§ Álbumes  → línea de tiempo (sección 3)
§ Libro    → visor "40 años de I.R.A." (sección 5)
Footer
```

### 2.1 Encabezado (reutiliza `EncabezadoPagina`)

- `eyebrow`: **Fotografía**
- `titulo`: **Galería de** · `resaltado`: **fotos**
- `lead`: **Álbumes de reportería en la calle, en conciertos y en la
  coyuntura, ordenados en el tiempo. Ábrelos en pantalla gigante y pasa las
  fotos como en una presentación.**
- `datos`: `8` **álbumes** · `N` **fotos** (suma de `fotos` de los álbumes) ·
  `10` **páginas del libro**.
- `children` (acciones):
  - Principal: **▶ Ver en pantalla gigante** → abre la proyección en el
    álbum más antiguo con el avance automático encendido. Estilo `.empezar`
    del Top: 52 px de alto, degradado `#7e22ce → #9d5cf0`, sombra
    `0 18px 44px -14px #c084fc`, animación `pulso` 2.4 s.
  - Secundario: **Abrir el libro** (`IconBook`) → hace scroll a la sección
    del libro. Estilo `.botonSecundario` (borde blanco 30 %).

### 2.2 Sub-navegación entre las dos partes

- Control segmentado igual a `.orden` de Posts (pastilla con 3 px de
  padding, botones de 32 px, activo `rgba(192,132,252,0.22)`), dentro de una
  barra sticky idéntica a `.barra` (`top: 64px`, blur 14 px, borde inferior).
- Botones: **Álbumes** con contador pequeño `8` (pastilla 0.7rem) y
  **Libro de fotos**.
- Son botones (no `href="#…"`, para no pelear con el router): hacen
  `scrollIntoView({ behavior: 'smooth', block: 'start' })` con
  `scroll-margin-top: 130px` en las secciones. El activo lo decide un
  `IntersectionObserver` (sección con más área visible) → `aria-current="true"`.
- A la derecha de la barra (solo escritorio), atajo contextual: en Álbumes
  **▶ Pantalla gigante**; en Libro **Descargar PDF**. En celular se ocultan.
- Cada sección abre con un título h2 propio: eyebrow (0.78rem/700,
  `letter-spacing: 0.14em`, `--color-acento-texto`) + h2
  `clamp(1.6rem, 3.6vw, 2.4rem)`/800, `letter-spacing: -0.03em`.
  - Álbumes: eyebrow **Línea de tiempo** · h2 **Álbumes de fotos** · línea
    de apoyo: **Del más antiguo al más reciente. Toca uno para proyectarlo.**
  - Libro: eyebrow **Fotolibro** · h2 **40 años de I.R.A.**

---

## 3. Línea de tiempo de álbumes

Concepto: **rollo de película**. Un eje luminoso con perforaciones de
película a lo largo, las fechas como fotogramas marcados y los álbumes
encima, en un carrusel con profundidad que se "enfoca" en el centro.

### 3.1 Datos que muestra cada álbum

`titulo`, `fecha` (ISO; se muestra "14 mar 2026"), `lugar` (p. ej.
"Bogotá"), `cuenta` (`@eltiempo`), `fotos` (número de imágenes del
carrusel), `url`, y opcional `tema` (Cultura / Política / Cubrimiento, con el
mismo estilo de 1.2). Orden: **fecha ascendente** (izquierda = más antiguo).

### 3.2 Escritorio (>900 px): scroll horizontal con snap

```
     ┌────────┐   ┌────────┐   ┏━━━━━━━━━━┓   ┌────────┐   ┌────────┐
     │  4:5   │   │  4:5   │   ┃   4:5    ┃   │  4:5   │   │  4:5   │
     │ (embed)│   │        │   ┃ (centro) ┃   │        │   │        │
     └────────┘   └────────┘   ┗━━━━━━━━━━┛   └────────┘   └────────┘
      Título       Título        Título         Título       Título
 ▫ ▫ ▫ ▫ ▫ ▫ ▫ ▫ ▫ ▫ ▫ ▫ ▫ ▫ ▫ ▫ ▫ ▫ ▫ ▫ ▫ ▫ ▫ ▫ ▫ ▫ ▫ ▫ ▫ ▫ ▫ ▫ ▫  (perforaciones)
 ━━━━━━━●━━━━━━━━━━━━●━━━━━━━━━━━━━◉━━━━━━━━━━━━●━━━━━━━━━━━━●━━━━━━━  (eje)
       OCT 2025     ENE 2026      MAR 2026      ABR 2026     JUN 2026
 [‹]                                                                [›]
```

- **Contenedor** `.riel`: ancho completo de la ventana (sale del
  `max-width: 1150px` con `margin-inline: calc(50% - 50vw)`), `overflow-x:
  auto`, `scroll-snap-type: x mandatory`, `scrollbar-width: none`,
  `padding-inline: calc(50vw - var(--ancho-tarjeta) / 2)` para que la
  primera y la última puedan quedar centradas. `overscroll-behavior-x:
  contain`. Máscara de bordes: `mask-image: linear-gradient(90deg,
  transparent, #000 8%, #000 92%, transparent)`.
- **Tarjeta**: `--ancho-tarjeta: clamp(260px, 24vw, 340px)`; `aspect-ratio:
  4/5`; radio 18 px; gap entre tarjetas `clamp(1.5rem, 3vw, 2.75rem)`;
  `scroll-snap-align: center`. Contiene `PortadaPost` (mientras carga) +
  `PostVivo` no interactivo (el embed recortado; con <328 px PostVivo ya se
  encarga de escalarlo).
- **Profundidad ligada al scroll** (solo con `@supports (animation-timeline:
  view())`, igual criterio que `.revelar`): cada `.album` lleva
  `animation: enfocar linear both; animation-timeline: view(inline);`
  - en los bordes: `scale: 0.86; rotate: y ±18deg; filter: brightness(0.55)`;
  - al centro: `scale: 1; rotate: none; filter: none`.
  - Sin soporte: todas iguales, sin giro (se ve bien igual).
  - La tarjeta centrada recibe además (por JS, `IntersectionObserver` con
    `rootMargin: 0px -45%`) `data-centro`: sombra
    `0 40px 100px -30px var(--c1), 0 0 0 1px rgba(255,255,255,0.12)` y su
    nodo del eje se enciende. Ese mismo índice cambia `--c1/--c2` del fondo
    de la sección (transición 900 ms), como en el Top.
- **Fondo de la sección**: dos manchas difusas (`.mancha` del Top: 60vmax,
  `blur(90px)`, opacidad 0.35, animación `flotar` 16 s) con `--c1`/`--c2`
  del álbum centrado. Radio de la sección 28 px en escritorio, `overflow:
  hidden`, `isolation: isolate`.
- **Eje** (debajo de las tarjetas, separado 1.75rem):
  - Línea de 2 px: `linear-gradient(90deg, transparent, rgba(216,180,254,0.45) 6%, rgba(216,180,254,0.45) 94%, transparent)`.
  - **Progreso del recorrido**: una segunda línea encima, `linear-gradient(90deg, #7e22ce, #c084fc)`, `transform-origin: left`, `scaleX` ligado a `animation-timeline: scroll(inline)` del riel (con fallback por JS o sin progreso).
  - **Perforaciones**: franja de 10 px encima del eje,
    `background: repeating-linear-gradient(90deg, rgba(216,180,254,0.16) 0 10px, transparent 10px 22px)`
    con `mask` de bordes redondeados (`radial-gradient` no necesario; basta
    `border-radius: 2px` simulado con altura 6 px). Se desplaza con el
    riel (está dentro del mismo scroll) → sensación de película corriendo.
  - **Nodo** por álbum, centrado bajo su tarjeta: círculo 12 px,
    `background: var(--color-bg)`, `border: 2px solid var(--color-lilac-mid)`.
    Centrado: 16 px, relleno `#fff`, halo
    `0 0 0 6px rgba(192,132,252,0.18), 0 0 24px 4px var(--c2)`; transición
    300 ms `--ease-cine`.
  - **Fecha** bajo el nodo: mes abreviado + año en mayúsculas,
    `0.72rem/800`, `letter-spacing: 0.12em`, `--texto-suave`; el día encima
    del nodo no (mantenerlo limpio). Si dos álbumes caen en el mismo mes,
    se muestra `14 MAR` / `28 MAR` y el año solo en el primero.
  - **Marca de año**: cuando cambia el año entre dos nodos, un rótulo
    `2026` grande de fondo (`font-size: 7rem; -webkit-text-stroke: 1.5px
    rgba(255,255,255,0.08); color: transparent`) detrás de las tarjetas,
    eco del número gigante del Top.
- **Ficha bajo cada tarjeta** (entre tarjeta y eje), centrada, máx. el ancho
  de la tarjeta:
  - línea 1 (meta): tema (si hay) · `IconCarousel` **12 fotos** —
    `0.72rem/700`, `--color-acento-texto`.
  - línea 2: título `1rem/800`, `line-height 1.25`, máx. 2 líneas
    (`-webkit-line-clamp: 2`), `text-wrap: balance`, `#fff`.
  - línea 3: `IconLocation` **Bogotá** · **@eltiempo** — `0.78rem`,
    `--color-text-muted`.
- **Flechas ‹ ›** (46 px, estilo `.control` del Top) a los extremos,
  verticalmente centradas sobre las tarjetas; desplazan una tarjeta
  (`scrollBy` del ancho + gap, `smooth`). Deshabilitadas (opacidad 0.3) en
  el inicio/final.
- **Arrastre con el mouse** (opcional, recomendado): arrastrar el riel lo
  desplaza; si el puntero se movió >6 px, el clic no abre la proyección.

### 3.3 Cómo invita a abrir la proyección

- Toda la tarjeta es el botón (capa `.abrir` como en `TarjetaPost`,
  `aria-label="Proyectar el álbum: {título}, {fotos} fotos"`), cursor
  `zoom-in`.
- Hover / foco en la tarjeta:
  - sube `translateY(-6px)` 250 ms `--ease-cine`;
  - velo inferior `linear-gradient(to top, rgba(18,8,31,0.7), transparent 50%)`;
  - aparece la pastilla **▶ Proyectar** (abajo al centro, 0.8rem/700, fondo
    `rgba(18,8,31,0.85)`, borde `--color-lilac-border`), entra con
    `opacity 0→1` y `translate 0 8px → 0` en 200 ms;
  - un **destello de proyector**: un brillo radial lila que barre de
    izquierda a derecha sobre la tarjeta (pseudo-elemento
    `linear-gradient(105deg, transparent 40%, rgba(216,180,254,0.22) 50%, transparent 60%)`,
    `translate -100% → 100%`, 700 ms `--ease-cine`, una vez por hover).
- La tarjeta **centrada** muestra la pastilla siempre (sin hover), para que
  en tablet/táctil también se entienda.
- Sello arriba a la izquierda (el `.sello` de `TarjetaPost`):
  `IconCarousel` **12** (número de fotos).
- Debajo del riel, centrado: texto pista `0.8rem`, `--texto-suave`:
  **Desliza para recorrer la línea de tiempo · toca un álbum para verlo en
  pantalla gigante**.

### 3.4 Tablet (601–900 px)

Mismo riel horizontal con snap, `--ancho-tarjeta: clamp(240px, 38vw,
300px)`, sin flechas laterales (gesto táctil), sin giro 3D (solo
`scale 0.9 → 1` y `brightness 0.7 → 1`). La pastilla **▶ Proyectar** visible
en la tarjeta centrada.

### 3.5 Celular (≤600 px): línea de tiempo vertical

```
 │
 ●  MAR 2026 ─────────────
 │  ┌──────────────────┐
 │  │       4:5        │
 │  │    (embed)       │
 │  └──────────────────┘
 │  ● CULTURA · 12 fotos
 │  Título del álbum
 │  📍 Bogotá · @eltiempo
 │
 ●  ABR 2026 ─────────────
```

- Eje vertical a la izquierda: línea 2 px a `left: 11px`, con las
  perforaciones en vertical (mismo gradiente a 180deg) a su lado.
- Cada álbum: `padding-left: 36px`; nodo 12 px a la altura de la fecha;
  fecha `0.72rem/800` + línea fina hacia la derecha (1 px, lila 25 %).
- Tarjeta a todo el ancho disponible (`calc(100vw - 2rem - 36px)`, ≈ 318 px
  en un iPhone de 390 px), 4:5, radio 16 px.
- Recorrido: scroll normal de la página (sin snap obligatorio; como mucho
  `scroll-snap-type: y proximity` en el `html` de esta página, no recomendado
  por chocar con el libro). Cada álbum aparece con la clase global
  `.revelar`.
- Progreso del eje: el tramo ya recorrido se pinta con el degradado morado
  (`animation-timeline: view()` sobre la sección), el nodo del álbum que
  cruza el 50 % de la pantalla se enciende.
- La pastilla **▶ Proyectar** siempre visible en la tarjeta (no hay hover).

### 3.6 Carga de los embeds en la línea de tiempo

- Montar `PostVivo` solo cuando la tarjeta está cerca (`useCerca`, margen
  1 pantalla en el eje del scroll) y no desmontarlo después.
- Mientras carga: `PortadaPost` del álbum (degradado `--c1/--c2` de la
  cuenta, rayas, número y título) + el loader de `PostVivo` (aro lila).
- En el riel horizontal, el `IntersectionObserver` de `useCerca` debe usar
  el riel como `root` (no la ventana).

---

## 4. Modo proyección "pantalla gigante"

Componente a pantalla completa (un `<dialog>` modal como `VisorPost`, para
heredar el foco atrapado, Escape y `html:has(dialog[open])`).

### 4.1 Composición (escritorio)

```
┌──────────────────────────────────────────────────────────────────────┐
│ ▬▬▬▬▬ ▬▬▬▬▬ ▬▬▬▬▬ ▬▬▬▬▬ ▬▬▬▬▬ ▬▬▬▬▬ ▬▬▬▬▬ ▬▬▬▬▬   (segmentos: 1 x álbum)│
│ 03 / 08  Título del álbum · 14 mar 2026       [⏸] [⛶] [✕]           │
│▒▒                                                                 ▒▒│
│▒▒ cortina      ╱┏━━━━━━━━━━━━━━━━━━━━┓╲          (pantalla lateral)▒▒│
│▒▒   ┌──┐      ╱ ┃                    ┃ ╲        ┌──┐              ▒▒│
│▒▒   │  │ ‹   ╱  ┃   ÁLBUM EN VIVO    ┃  ╲    ›  │  │              ▒▒│
│▒▒   └──┘    ╱   ┃   4:5, escalado    ┃   ╲      └──┘              ▒▒│
│▒▒          ╱    ┗━━━━━━━━━━━━━━━━━━━━┛    ╲                         ▒▒│
│▒▒         ╱     ░░░ reflejo en el piso ░░░  ╲                       ▒▒│
│▒▒        ╱  CULTURA · 12 fotos · Bogotá · @eltiempo ╲                ▒▒│
│        ◢ haz del proyector (nace abajo al centro) ◣                   │
│ [▪][▪][▣][▪][▪][▪][▪][▪]   ← tira de álbumes (portada + fecha)        │
└──────────────────────────────────────────────────────────────────────┘
```

Grilla: `grid-template-rows: auto auto minmax(0, 1fr) auto auto` →
segmentos · barra superior · escenario · ficha · tira. Padding
`0.75rem max(1.5rem, 4vw) 1rem`.

### 4.2 La sala

- Fondo `--sala-bg` (#07030d). `::backdrop`: `rgba(7,3,13,0.96)`.
- **Halo del álbum**: elipse detrás de la pantalla,
  `radial-gradient(ellipse 50% 55% at 50% 45%, color-mix(in srgb, var(--c1) 55%, transparent), transparent 70%)`,
  transición de `--c1`/`--c2` 900 ms al cambiar de álbum (colores por cuenta).
- **Haz del proyector**: pseudo-elemento que nace en un punto abajo al
  centro (bajo la tira) y se abre hasta los bordes de la pantalla:
  `clip-path: polygon(48% 100%, 52% 100%, 88% 8%, 12% 8%)`,
  `background: linear-gradient(to top, rgba(216,180,254,0.18), var(--haz) 40%, transparent 95%)`,
  `mix-blend-mode: screen`, `filter: blur(18px)`, `pointer-events: none`,
  detrás de la pantalla (`z-index: -1`). Parpadeo sutil del proyector:
  `animation: parpadeo 5s steps(1) infinite` alternando opacidad 0.9 / 1 /
  0.94 en 3 o 4 pasos irregulares.
- **Polvo en el haz** (opcional): 2 capas de `radial-gradient` de puntos de
  1 px `rgba(255,255,255,0.35)` con `background-size` 140/220 px, deriva
  lenta `translate 0 → -40px` en 18 s, opacidad 0.25, recortadas con el
  mismo `clip-path`.
- **Cortinas** (solo escritorio ≥1200 px): franjas de `6vw` a izquierda y
  derecha, `repeating-linear-gradient(90deg, #1b0d2f 0 18px, #2d1b69 18px 30px, #1b0d2f 30px 44px)`
  con un `linear-gradient` encima que las funde al negro hacia el centro y
  hacia abajo. Opacidad 0.6. Puramente decorativas (`aria-hidden`).
- **Reflejo en el piso**: elipse bajo la pantalla, `width: 80%` de la
  pantalla, `height: 60px`,
  `radial-gradient(ellipse at center, color-mix(in srgb, var(--c2) 35%, transparent), transparent 70%)`,
  `filter: blur(20px)`. No se clona el iframe.

### 4.3 La pantalla (el álbum lo más grande posible)

- Marco de referencia: el embed recortado mide **538 × 672.5 px** (4:5,
  como el `.marco` de `VisorPost`). Se coloca `PostVivo` dentro de una caja
  de ese tamaño exacto y esa caja se **escala con `transform: scale(S)`**
  desde el centro:
  `S = min(altoLibre / 672.5, anchoLibre / 538, 1.8)` (y mínimo el que
  quepa en celular). `altoLibre` = alto del escenario (fila `1fr` de la
  grilla, medido con `ResizeObserver`). Tope 1.8: las fotos del embed
  vienen a ~1080 px de ancho, así que hasta ~970 px de ancho en pantalla se
  ven nítidas. En un monitor de 1080 px de alto en pantalla completa,
  S ≈ 1.15–1.25; en 1440 px de alto, ≈ 1.6.
- Bordes: radio 10 px (pantalla de cine, menos redondeada que las
  tarjetas), `box-shadow: 0 0 0 1px var(--pantalla-borde), 0 0 0 10px rgba(255,255,255,0.02), 0 50px 140px -30px var(--c1), 0 0 90px 0 color-mix(in srgb, var(--c2) 25%, transparent)`.
- El álbum central es **interactivo** (`interactivo` de `PostVivo`): sus
  flechas propias pasan las fotos.
- **Pantallas laterales** (escritorio >900 px): el álbum anterior y el
  siguiente, como en el carrusel del Top:
  `translateX(±(ancho × 0.78)) translateZ(-260px) rotateY(∓32deg)`,
  `filter: brightness(0.35)`, `opacity: 0.7`, `perspective: 1600px` en el
  escenario. Encima una capa-botón (`.capaIr`) que lleva a ese álbum,
  `aria-label="Ir al álbum anterior: {título}"`. Distancia ≥2: `opacity: 0`.
  Todos los álbumes viven en el mismo riel y se mueven solo con
  `--offset`/`--distancia` (los iframes no cambian de lugar en el DOM);
  precarga con `useYaCargados(actual, 1)`.
- Cambio de álbum: `transform 700ms --ease-cine`, `opacity 700ms`,
  `filter 700ms`. La ficha de abajo re-entra con `subir` (600 ms, el
  segundo hijo +80 ms).
- **Encendido al abrir** (una sola vez por apertura):
  1. sala: opacidad 0 → 1 en 300 ms `ease-out`;
  2. haz: `scale: 1 0 → 1 1` desde abajo (`transform-origin: 50% 100%`),
     450 ms `--ease-cine`, retraso 100 ms;
  3. pantalla: `opacity 0 → 1`, `scale 0.94 → 1` y un parpadeo de
     `filter: brightness(0) → 1.35 → 0.9 → 1` en 650 ms
     (`steps` no: keyframes 0/40/70/100 %), retraso 250 ms;
  4. controles y tira: `subir` 600 ms, retraso 400 ms.
- **Fin de la proyección**: tras el último álbum con avance automático, la
  pantalla se atenúa y aparece una placa centrada: título
  **Fin de la proyección** (`clamp(2.4rem, 6vw, 4.5rem)`/800,
  `letter-spacing: -0.05em`) y acciones **Volver a empezar** (principal,
  blanca) · **Ver el libro de fotos** (secundaria; cierra y hace scroll al
  libro) · **Cerrar**.

### 4.4 Barra superior y controles

- Izquierda: contador **03 / 08** (`0.95rem/800`, `tabular-nums`) + título
  del álbum (`1rem/700`, 1 línea con elipsis) + `· 14 mar 2026` en
  `--texto-suave`.
- Derecha, botones de 46 px (estilo `.control` del Top: borde blanco 25 %,
  fondo blanco 8 %, blur 8 px):
  - **Pausa / Reproducir** (`IconPause` / `IconPlay`),
    `aria-label="Pausar el avance automático"` / `"Reanudar el avance automático"`.
  - **Pantalla completa** (`IconExpand` / `IconShrink`),
    `aria-label="Pantalla completa"` / `"Salir de pantalla completa"`. Se
    oculta si `document.fullscreenEnabled` es falso (iPhone).
  - **Cerrar** (`IconClose`), `aria-label="Cerrar la proyección"`.
- Flechas de álbum **‹ ›** de 54 px, fijas a los lados a media altura del
  escenario (como `.flecha` de `VisorPost`), `aria-label="Álbum anterior"` /
  `"Álbum siguiente"`. Quedan **fuera** de la pantalla para no confundirse
  con las flechas del embed (que pasan fotos).
- Auto-ocultar (escritorio): sin movimiento del puntero 3 s → barra
  superior, flechas y tira bajan a `opacity: 0.12` en 400 ms; cualquier
  movimiento/tecla/foco los vuelve a 1 en 150 ms. Nunca se ocultan con foco
  de teclado dentro de ellos.

### 4.5 Avance automático y barra de progreso

- **Segmentos** arriba, uno por álbum, idénticos a `.segmentos` del Top
  (carril 4 px, `rgba(255,255,255,0.22)`, relleno `#fff`, `scaleX` lineal).
  Clic en un segmento → ese álbum.
- Duración por álbum: **16 s** (da tiempo a mirar 3–4 fotos si se pasan a
  mano; si se quiere, `max(12s, fotos × 2.5s)` con tope 30 s).
- Arranca encendido al abrir desde **Ver en pantalla gigante**; al abrir un
  álbum concreto desde la línea de tiempo también arranca, pero con 2 s
  de cortesía antes de empezar a llenar.
- **Pausas**:
  - puntero sobre la pantalla (escritorio): pausa temporal,
    `animation-play-state: paused`, se reanuda al salir;
  - tocar/clic dentro del álbum (foco entra al iframe, `onTocado`): pausa
    fija; el botón pasa a **▶** y aparece un aviso breve
    **Avance automático en pausa** (pastilla 0.8rem, 2 s);
  - pestaña oculta (`visibilitychange`): pausa temporal.
- Al terminar un segmento: siguiente álbum (transición de 4.3). Tras el
  último: placa "Fin de la proyección" (no da la vuelta sola).

### 4.6 Tira de álbumes (abajo)

- Fila horizontal centrada, scroll horizontal si no cabe, `gap: 0.5rem`.
- Cada botón: miniatura 4:5 de **56 × 70 px** con `PortadaPost` (no
  iframes: livianos) + fecha corta debajo `0.66rem/700` (`MAR 26`).
- Activo (`aria-current="true"`): borde 2 px `#fff`, `scale 1.08`, halo
  `0 0 0 4px color-mix(in srgb, var(--c2) 35%, transparent)` y un mini
  carril de progreso de 2 px bajo la miniatura que se llena en sincronía
  con el segmento de arriba.
- Hover: `translateY(-3px)`, brillo 1.1; tooltip nativo `title` con el
  título.
- El activo se mantiene visible (`scrollIntoView({ inline: 'center',
  block: 'nearest' })`).

### 4.7 Pista: las fotos se pasan dentro del álbum

- Texto fijo en la ficha bajo la pantalla:
  `IconCarousel` **12 fotos · pásalas con las flechas del álbum** (en
  celular: **desliza dentro del álbum para ver sus 12 fotos**).
- **Pulso guía** la primera vez por sesión (`sessionStorage`, con
  try/catch): 900 ms después de que el embed está listo, un anillo lila de
  40 px (`border: 2px solid #d8b4fe`) aparece sobre la flecha derecha del
  embed (≈ 12·S px del borde derecho, a media altura de la pantalla),
  `pointer-events: none`, late 2 veces (`scale 0.8 → 1.4`, `opacity 1 → 0`,
  900 ms cada uno) y una pastilla al lado dice **Pasa las fotos aquí →**,
  que se desvanece a los 3.5 s (400 ms).

### 4.8 Teclado y gestos

| Entrada | Acción |
|---|---|
| ← / → | Álbum anterior / siguiente |
| Inicio / Fin | Primer / último álbum |
| Espacio, K | Pausar / reanudar |
| F | Pantalla completa |
| Esc | Salir de pantalla completa; si no está, cerrar |
| Swipe horizontal fuera de la pantalla (escritorio táctil, tablet) | Álbum anterior / siguiente (umbral 50 px, que domine el eje X) |
| Swipe horizontal **dentro** del álbum | Lo maneja el embed: pasa fotos |
| Swipe hacia abajo en la barra superior (celular) | Cerrar (umbral 90 px) |
| Toque en la tira | Ese álbum |

Cuando el foco está dentro del iframe, las teclas las recibe Instagram; la
ayuda lo dice en `sr-only`: "Para volver a los controles, presiona Tab o
haz clic fuera del álbum".

### 4.9 Tablet y celular

- **Tablet (601–900)**: sin pantallas laterales ni cortinas; la pantalla
  ocupa el alto libre (`S` según 4.3); flechas ‹ › pasan a la fila del
  contador bajo la pantalla (como `.navegacion` de `VisorPost`), para no
  tapar las del embed.
- **Celular (≤600)**, vertical:
  ```
  ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬           [⏸] [✕]
  ┌──────────────────────────┐
  │   ÁLBUM 4:5 (ancho total │
  │   − 1rem), interactivo   │
  └──────────────────────────┘
  ● CULTURA · 14 mar 2026
  Título del álbum (2 líneas)
  📍 Bogotá · @eltiempo · 12 fotos
  [‹]        03 / 08        [›]
  [▪][▪][▣][▪][▪] → tira con scroll
  ```
  Ancho de pantalla `min(100vw - 1rem, (100dvh - 15rem) × 0.8)`; el haz se
  conserva más suave (opacidad 0.6) y sin polvo. Sin botón de pantalla
  completa en iOS.
- **Celular horizontal** (`max-height: 500px and orientation: landscape`):
  pantalla a la izquierda a todo el alto, ficha y controles a la derecha
  (columna de 260 px), tira oculta (el contador basta).

---

## 5. Visor del libro "40 años de I.R.A."

Concepto: **fotolibro abierto sobre una mesa de luz**. Las 10 páginas son
16:9 (pliegos dobles de Canva): se muestran como un libro abierto con lomo
al centro, y al pasar, la hoja gira sobre el lomo.

### 5.1 Encabezado de la sección

- eyebrow **Fotolibro · Fotorreportaje** · h2 **40 años de I.R.A.**
- Lead (de la página 1 del libro): **La legendaria banda de punk inició el
  16 de agosto la celebración de sus 40 años de formación en la Media Torta
  de Bogotá, acompañada por Lupus, Rattus Rattus, Ginger y los Tóxicos, en
  un llamado a un "Punk al Parke".**
- Datos en línea (no tarjetas; 0.82rem, `--texto-suave`, separados por ·):
  `IconBook` **10 páginas** · `IconLocation` **Media Torta, Bogotá** ·
  **Fotografía: Laura Hernández**.
- Acciones: **▶ Presentación** (secundario) · **Descargar PDF · 9,2 MB**
  (`IconDownload`, secundario; `<a href={BASE_URL + 'documentos/40-anos-de-ira.pdf'} download>`).

### 5.2 Escenario y página

```
┌──────────────────────────────────────────────────────────────┐
│                                                [−][+][⛶]     │
│  ‹  ┌──────────────────────────┬──────────────────────────┐ ›│
│     │                          ┊                          │  │
│     │      página 16:9         ┊  (lomo)                  │  │
│     │                          ┊                          │  │
│     └──────────────────────────┴──────────────────────────┘  │
│        Rattus Rattus puso a poguear a los asistentes…         │
│                       Página 3 de 10                          │
│  [▭][▭][▣][▭][▭][▭][▭][▭][▭][▭]   ← miniaturas               │
└──────────────────────────────────────────────────────────────┘
```

- **Mesa de luz**: contenedor con radio 28 px, fondo
  `radial-gradient(ellipse 70% 60% at 50% 40%, rgba(126,34,206,0.28), transparent 70%), var(--color-bg-elevado)`,
  borde `--color-lilac-border`, padding `clamp(1rem, 3vw, 2.5rem)`.
- **Página**: `aspect-ratio: 16/9`, ancho
  `min(100%, (100dvh - 64px - 15rem) × 16 / 9)` (que quepa entera con
  miniaturas en una pantalla de portátil), centrada. Radio 6 px (papel),
  sombra de libro sobre la mesa:
  `0 2px 0 rgba(255,255,255,0.04), 0 30px 60px -20px rgba(0,0,0,0.9), 0 60px 120px -40px #7e22ce`.
- **Lomo**: sobre la imagen, un `::after` en el centro de 6 % de ancho:
  `linear-gradient(90deg, transparent, rgba(0,0,0,0.18) 45%, rgba(0,0,0,0.28) 50%, rgba(0,0,0,0.18) 55%, transparent)`
  y un brillo muy suave a cada lado (`rgba(255,255,255,0.04)`). Se quita en
  zoom. Si la portada (pág. 1) no es un pliego doble, sin lomo en la 1.
- **Imágenes**: WebP pre-renderizadas, `srcset` 640w / 1280w / 1920w,
  `sizes="(max-width: 600px) 100vw, 1100px"`; la 1920w (o 2560w) solo se
  pide al hacer zoom. Precargar la siguiente y la anterior.
- **Pie de foto** bajo la página (`0.92rem/600`, `#fff` 90 %, centrado,
  máx. 720 px, `text-wrap: balance`) + `alt` de la imagen (mismo texto).
  Textos (del libro, en tipo oración):
  1. **40 años de I.R.A. — Fotorreportaje de Laura Hernández en la Media Torta de Bogotá.**
  2. **La escena punk bogotana llenó la Media Torta, aprovechando para mostrar posturas políticas.**
  3. **Rattus Rattus puso a poguear a los asistentes y ofreció un poderoso performance a cargo de su cantante.**
  4. **Un asistente desmayado durante el pogo cobró la consciencia al ser sacado.** *(en el libro dice "cobró"; confirmar con la autora si se prefiere "recobró")*
  5. **Mónica, baterista y líder de I.R.A., le hizo un reconocimiento a mujeres de bandas de punk.**
  6. **La camaradería fue la constante en medio de la emoción.**
  7. **David Viola, guitarrista de I.R.A., saluda al público.**
  8. **Una mirada a hace 40 años, cuando I.R.A. publicó su primer álbum, "Lo imposible".**
  9. **Mónica finaliza su presentación agradeciendo al público.**
  10. **I.R.A. se despide de Bogotá para seguir celebrando en otras ciudades.**
- **Contador**: **Página 3 de 10** (`0.8rem/700`, `tabular-nums`,
  `--texto-suave`), con `aria-live="polite"` junto con el pie de foto.

### 5.3 Pasar página: transición

- **Escritorio y tablet — giro de hoja sobre el lomo** (CSS, sin librerías):
  la página se arma con dos mitades (`background-image` de la misma WebP,
  `background-size: 200% 100%`, posiciones `0 0` y `100% 0`). Al avanzar:
  - debajo ya está la página siguiente completa;
  - la mitad derecha de la página actual es una hoja con dos caras
    (`transform-style: preserve-3d`, `backface-visibility: hidden`): frente
    = mitad derecha actual, dorso = mitad izquierda de la siguiente;
  - la hoja gira `rotateY(0 → -180deg)` con `transform-origin: left center`,
    **800 ms `--ease-hoja`**, con `perspective: 2200px` en la página;
  - sombra de giro: sobre la hoja, `linear-gradient(90deg, rgba(0,0,0,0.35), transparent 40%)`
    cuya opacidad sube 0 → 1 → 0 durante el giro; y una sombra proyectada
    sobre la página de abajo que se estrecha con la hoja;
  - un brillo lila cruza la hoja en la mitad del giro
    (`rgba(216,180,254,0.12)`), guiño a la paleta.
  - Retroceder: la mitad izquierda gira `0 → 180deg` sobre su borde derecho.
  - Saltos de más de una página (miniaturas): un solo giro, directo a la
    página destino.
  - Clics durante un giro: se encolan como máximo 1 (no se apilan).
- **Celular — deslizar**: la página sigue al dedo (`translateX` = arrastre,
  con resistencia ×0.35 en los extremos); al soltar con >25 % del ancho o
  velocidad >0.4 px/ms pasa: salida `translateX(-100%)` + entrada desde
  `100%` en 320 ms `--ease-cine`; si no, vuelve a 0 en 220 ms.
- **Reduced motion**: fundido cruzado 180 ms, sin giro ni deslizamiento.

### 5.4 Navegación

- Flechas **‹ ›** de 48 px a los lados del escenario (estilo `.control` del
  Top), `aria-label="Página anterior"` / `"Página siguiente"`, deshabilitadas
  en la 1 y la 10. En celular, bajo la página junto al contador.
- Zonas de clic: clic en el tercio izquierdo/derecho de la página (sin zoom)
  pasa página; cursor `w-resize`/`e-resize` en esas zonas, `zoom-in` en el
  centro.
- **Teclado** (con el visor enfocado o en pantalla completa): ← / →, Re Pág /
  Av Pág, Inicio / Fin, `+` / `-` / `0` (zoom), F (pantalla completa),
  Espacio (presentación), Esc (sale de zoom → de pantalla completa).
  El escenario es `tabindex="0"`, `role="region"`,
  `aria-roledescription="visor de libro"`,
  `aria-label="40 años de I.R.A., libro de fotos"`.

### 5.5 Miniaturas

- Fila bajo el contador, `gap: 0.5rem`, scroll horizontal con
  `scroll-snap-type: x proximity` si no caben (en escritorio caben las 10).
- Tamaño: **112 × 63 px** escritorio, **96 × 54** tablet, **80 × 45**
  celular. Radio 6 px, `opacity 0.55`, `filter: saturate(0.8)`.
- Número de página en una pastilla abajo a la izquierda (0.62rem/800).
- Activa (`aria-current="page"`): opacidad 1, borde 2 px `#fff`,
  `box-shadow: 0 0 0 4px rgba(192,132,252,0.35)`, `translateY(-3px)`;
  transición 200 ms. Hover: opacidad 0.9.
- `aria-label="Ir a la página 4: {pie de foto corto}"`.
- La activa se mantiene centrada en la fila.

### 5.6 Zoom

- Botones **−** / **+** (`IconZoomOut` / `IconZoomIn`, 40 px) arriba a la
  derecha del escenario, con el nivel en medio (`100 %`, `200 %`…), y
  **⛶** pantalla completa.
- Niveles: 1 → 1.5 → 2 → 3 → 4 (botones); **doble clic / doble toque**
  alterna 1 ↔ 2.5 **centrado en el punto tocado**; **pinch** continuo entre
  1 y 4; rueda del mouse con Ctrl/⌘ (o trackpad pinch) también.
- Animación de zoom por botón/doble clic: `transform 280ms --ease-cine`;
  pinch y arrastre sin transición (sigue al dedo).
- Con zoom >1: la imagen 1920w reemplaza a la 1280w al terminar de
  cargar (sin parpadeo: se pinta encima con fundido 150 ms), arrastrar
  desplaza (cursor `grab`/`grabbing`), los límites no dejan ver bordes
  vacíos, el lomo y las zonas de pasar página se desactivan, el swipe pasa
  a desplazar y no cambia de página. Una minipastilla
  **Doble clic para salir del zoom** aparece 2 s.
- Cambiar de página reinicia el zoom a 1.

### 5.7 Pantalla completa

- `requestFullscreen()` sobre el contenedor del visor (en iPhone, si no hay
  Fullscreen API, el botón abre el mismo visor en un `<dialog>` a pantalla
  completa).
- En pantalla completa: fondo `--sala-bg` con el halo morado de la mesa,
  página `contain` al máximo (`min(100vw - 8rem, (100dvh - 9rem) × 16/9)`),
  pie de foto y miniaturas abajo; controles y miniaturas se auto-ocultan
  tras 2.5 s sin movimiento (igual que 4.4).

### 5.8 Modo presentación automático (opcional, apagado por defecto)

- Botón **▶ Presentación** (en el encabezado de la sección y en la barra
  del visor); al activarlo, si no está en pantalla completa, la pide.
- Avanza cada **6 s** con el giro de hoja. Arriba, **10 segmentos** como los
  del Top (carril 3 px) muestran el progreso.
- Se pausa con cualquier interacción (flecha, miniatura, zoom, arrastre) y
  al ocultar la pestaña; el botón pasa a **▶ Reanudar**. Al llegar a la 10
  se detiene y el botón dice **↺ Ver de nuevo**.
- Reduced motion: el modo existe pero sin barras animadas (contador
  "Página 4 de 10 · siguiente en 6 s" en texto, actualizado cada segundo).

---

## 6. Estados

### 6.1 Carga

- **Embeds** (línea de tiempo y proyección): `PortadaPost` con el degradado
  de la cuenta + aro lila de `PostVivo` (aparece a los 150 ms, para no
  parpadear si carga rápido). El embed entra con `opacity 0 → 1` 500 ms.
- **Riel de la línea de tiempo** antes de medir: tarjetas con portada; sin
  saltos de layout (tamaños fijos por CSS).
- **Libro**: la página muestra un esqueleto 16:9 con
  `linear-gradient(110deg, rgba(255,255,255,0.04) 30%, rgba(216,180,254,0.1) 50%, rgba(255,255,255,0.04) 70%)`
  animado (`background-position` 1.4 s lineal infinito) hasta el `load`;
  luego fundido 250 ms. Las miniaturas, igual, en pequeño.
- **Botón de descarga**: no cambia de estado (descarga nativa).

### 6.2 Error / Instagram bloqueado

- Tope de espera de `PostVivo` (15 s): el loader se va y queda la
  **portada** del álbum. Sobre ella, en la proyección y en la tarjeta
  centrada, aparece una pastilla-enlace
  **Ver el álbum en Instagram ↗** (`IconInstagram`, abre en pestaña nueva)
  y, solo en la proyección, la línea `0.8rem` **No pudimos mostrar el álbum
  aquí. Puede que tu navegador esté bloqueando Instagram.**
- En la proyección el avance automático sigue funcionando sobre las
  portadas (la presentación no se rompe).
- **Libro**: si una WebP falla, se muestra un recuadro 16:9 con
  `IconImage` y **No se pudo cargar esta página.** + enlace
  **Descargar el PDF completo**. Las miniaturas fallidas muestran solo su
  número.
- **Pantalla completa no disponible / rechazada**: el botón no se muestra
  o no hace nada visible (sin errores al usuario).

### 6.3 Movimiento reducido (`prefers-reduced-motion: reduce`)

- Sin: profundidad/giro del riel ligado al scroll, perforaciones en
  movimiento, manchas flotantes, parpadeo y polvo del proyector, encendido
  escalonado (la sala aparece con fundido 150 ms), pulso guía, giro de
  hoja (fundido 180 ms), `pulso` del botón principal.
- **Sin avance automático** en la proyección (como en el Top: sin
  animación de barra no hay avance); el botón de pausa no se muestra y los
  segmentos solo marcan el álbum actual.
- Cambios de álbum: sin `transform` animado; corte directo con fundido de
  150 ms.
- `scroll-behavior: auto` en los `scrollIntoView`/`scrollBy`.
- Los spinners giran a 2.4 s (criterio existente).

---

## 7. Accesibilidad (resumen)

- Todo control es `<button>` o `<a>` con `aria-label` en español; foco
  visible global (`outline 2px --color-lilac-mid`, offset 3 px). En la sala
  oscura, el outline es `#fff` para que se vea.
- Proyección: `<dialog>` con `aria-label="Proyección de álbumes"`, foco
  inicial en el botón Cerrar, al cerrar vuelve a la tarjeta que la abrió.
- Regiones vivas: contador de Posts, "Álbum 3 de 8: {título}" en la
  proyección (`aria-live="polite"`, `sr-only`), pie + contador del libro.
- Objetivos táctiles ≥44 px (los chips de 38 px ya existen y se mantienen
  por consistencia; en celular subir a 40 px).
- Los textos sobre la sala usan blanco o `--texto-suave` (≥ 7:1 sobre
  #07030d).

## 8. Copy (todo en español)

| Lugar | Texto |
|---|---|
| Menú | Galería |
| Eyebrow / título | Fotografía · Galería de **fotos** |
| Datos | álbumes · fotos · páginas del libro |
| CTA principal | Ver en pantalla gigante |
| CTA secundario | Abrir el libro |
| Sub-navegación | Álbumes · Libro de fotos |
| Álbumes h2 | Línea de tiempo · Álbumes de fotos |
| Apoyo | Del más antiguo al más reciente. Toca uno para proyectarlo. |
| Pastilla tarjeta | Proyectar |
| Pista riel | Desliza para recorrer la línea de tiempo · toca un álbum para verlo en pantalla gigante |
| Pista fotos | {n} fotos · pásalas con las flechas del álbum / Desliza dentro del álbum para ver sus {n} fotos |
| Pulso guía | Pasa las fotos aquí → |
| Pausa | Avance automático en pausa |
| Fin | Fin de la proyección · Volver a empezar · Ver el libro de fotos · Cerrar |
| Error embed | Ver el álbum en Instagram · No pudimos mostrar el álbum aquí. Puede que tu navegador esté bloqueando Instagram. |
| Libro h2 | Fotolibro · Fotorreportaje · 40 años de I.R.A. |
| Libro acciones | Presentación · Reanudar · Ver de nuevo · Descargar PDF · 9,2 MB |
| Contador libro | Página {n} de 10 |
| Zoom | Acercar · Alejar · Doble clic para salir del zoom |
| Error libro | No se pudo cargar esta página. · Descargar el PDF completo |
| Posts conteo | {n} publicaciones · {Tema} / No hay publicaciones de {Tema} con estos filtros. |
