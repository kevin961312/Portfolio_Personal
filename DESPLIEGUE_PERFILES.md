# Perfiles dinámicos de la Hoja de Vida — guía técnica y de despliegue

Sistema que sirve **tres versiones de la HV de Laura Viviana Hernández Martin**
desde una sola página. **No hay selector visible**: cada versión se abre por su
propia URL, y desde dentro no se puede llegar a las otras. Cada HV en PDF lleva
su enlace y quien la recibe solo ve el material de ese perfil.

| Perfil | URL |
|---|---|
| Comunicadora Social *(por defecto)* | `https://kevin961312.github.io/Portfolio_Personal/?perfil=comunicadora` |
| Periodista Multimedia | `https://kevin961312.github.io/Portfolio_Personal/?perfil=periodista` |
| Community Manager | `https://kevin961312.github.io/Portfolio_Personal/?perfil=community-manager` |

Un valor desconocido (`?perfil=xyz`) se ignora y cae al perfil por defecto.

### Aislamiento entre versiones

Cada perfil declara qué secciones expone. Las demás desaparecen del menú **y**
redirigen a la portada si se escriben a mano en la barra de direcciones.

| Perfil | Secciones visibles | Secciones bloqueadas |
|---|---|---|
| `community-manager` | Sobre mí · Posts de Instagram | Artículos impresos · Artículos digitales · Reportaje |
| `periodista` | Sobre mí · Artículos impresos · Artículos digitales · Reportaje | Posts de Instagram |
| `comunicadora` | Todas (perfil transmedia) | — |

Por coherencia, la HV de periodista tampoco cita cifras de Instagram en sus
métricas: su sección de evidencia está oculta.

> **Nota sobre la privacidad real.** El parámetro es legible y adivinable: alguien
> que conozca el esquema puede probar `?perfil=periodista`. Esto oculta las
> versiones del recorrido normal, no las protege criptográficamente. Si hiciera
> falta más opacidad, se pueden cambiar los slugs por tokens no adivinables
> (`?v=k7m2x`) en `PerfilId` sin tocar el resto del sistema.

---

## 1. Archivos del sistema

```
src/
├── types/index.ts                      PerfilId, Metrica, PerfilContenido
├── data/perfiles.ts                    ← contenido de los 3 perfiles (editar aquí)
├── lib/
│   ├── perfilStore.ts                  ruteo: URLSearchParams + sessionStorage + pushState
│   └── formato.ts                      287335 → «287K» / «287.335»
├── hooks/
│   ├── usePerfil.ts                    puente React ↔ store (useSyncExternalStore)
│   └── useContadorAnimado.ts           animación 0 → valor al entrar en pantalla
├── components/
│   ├── MetricasImpacto.tsx + .module.css     grid de contadores
│   └── MetricaCard.tsx                       tarjeta individual
└── pages/SobreMiPage.tsx               consume el perfil activo

hv/                                     generador de las tres HV en PDF (ver §5)
```

Archivos existentes modificados: `main.tsx`, `App.tsx`, `components/Navbar.tsx`,
`components/icons/index.tsx`, `pages/SobreMiPage.module.css`, `index.html`.

---

## 2. Cómo funciona el ruteo

`src/lib/perfilStore.ts` es un **store externo sin React**, lo que permite que la
lógica de ruteo se pruebe y se reutilice sin montar componentes. Resuelve el
perfil en cascada:

```
1. ?perfil= de la URL      →  el enlace compartido siempre manda
2. sessionStorage          →  sobrevive a F5 y a URLs sin parámetro
3. PERFIL_POR_DEFECTO      →  'comunicadora'
```

* **Cambio de perfil** → `history.pushState`: la URL se actualiza sin recargar y
  el botón Atrás devuelve al perfil anterior.
* **Arranque y reposición** → `history.replaceState`: no ensucia el historial.
* **Atrás / Adelante** → un listener de `popstate` hace que el estado siga a la URL.
* **Navegación interna** → los `NavLink` del `Navbar` arrastran `?perfil=`, y
  `<PerfilSync />` (en `App.tsx`) repone el parámetro si algún enlace lo pierde.
* **Acceso a secciones** → `<GuardiaSecciones />` (en `App.tsx`) compara la ruta
  actual contra `perfil.secciones` y redirige a la portada con `replace` si no
  está permitida. El `Navbar` filtra el menú con la misma lista, así que la
  restricción se define en un solo sitio: `src/data/perfiles.ts`.

La UI se suscribe con `useSyncExternalStore`, así que **no hace falta un Context
Provider**: todos los componentes leen el mismo valor en el mismo render.

---

## 3. Editar el contenido

Todo el contenido por perfil vive en **`src/data/perfiles.ts`**. Cada perfil tiene:

| Campo | Qué controla |
|---|---|
| `rol`, `titular` | Encabezado del hero |
| `sobreMi[]` | Párrafos del bloque «Sobre mí» |
| `metricas[]` | Tarjetas de contadores |
| `habilidades[]` | Barras de progreso del aside |
| `destacados[]` | Bullets de «Trabajo destacado» |
| `cargos{}` | Cargo por empresa en Experiencia y Proyectos |
| `secciones[]` | Rutas visibles; el resto se ocultan y redirigen |
| `tituloDocumento` | `document.title` de la pestaña |

### Métricas

Los números **se derivan del contenido real del portafolio**, no se escriben a mano:

```ts
const TOTAL_PIEZAS_IG       = postsInstagram.length;                    // 33
const TOTAL_INTERACCIONES   = postsInstagram.reduce(…, 0);              // 287.335
const PROMEDIO_INTERACCIONES= Math.round(TOTAL_INTERACCIONES / …);      // 8.707
const PICO_INTERACCIONES    = Math.max(…);                              // 69.000
const TOTAL_DIGITALES       = articulosDigitales.length;                // 13
```

Al añadir un post en `src/data/posts-instagram.ts` o un artículo en
`src/data/articulos-digitales.ts`, **los contadores se recalculan solos**.

> ⚠️ `src/data/articulos-impresos.ts` está vacío, así que `TOTAL_IMPRESOS = 5` y
> `TOTAL_REPORTAJES_TV = 1` están declarados como constantes tomadas de la HV en
> PDF. Cuando se carguen las piezas impresas al archivo de datos, reemplazar por
> `articulosImpresos.length`.

Cada métrica declara una `categoria` que define su ícono y color de acento:

| Categoría | Ícono | Significado |
|---|---|---|
| `alcance` | ojo | Visualizaciones totales / alcance |
| `publicaciones` | periódico | Reportajes y piezas publicadas |
| `interacciones` | corazón | Likes e interacciones |
| `destacado` | destello | Hito puntual (pico, reportaje en TV…) |

### Añadir un cuarto perfil

1. Agregar el id a `PerfilId` en `src/types/index.ts`.
2. Agregar la entrada en `PERFILES` y en `ORDEN_PERFILES` en `src/data/perfiles.ts`,
   incluyendo su lista de `secciones`.

No hay que tocar nada más: el menú, el guardia de rutas y las métricas se adaptan solos.

---

## 4. Despliegue en GitHub Pages

Este repo **no usa GitHub Actions**: Vite compila a `docs/` y GitHub Pages sirve
esa carpeta directamente desde `main`. El flujo completo es:

```bash
# 1 · Verificar en local
npm run dev                 # http://localhost:5173/Portfolio_Personal/?perfil=periodista

# 2 · Compilar a docs/ (lo hace `tsc -b && vite build`)
npm run build

# 3 · Revisar el build servido como en producción
npm run preview

# 4 · Publicar
git add src index.html docs DESPLIEGUE_PERFILES.md
git commit -m "Perfiles dinámicos de HV con métricas de impacto"
git push origin main
```

GitHub Pages republica en 1–2 minutos. Confirmar la configuración en
**Settings → Pages → Build and deployment**:

* **Source:** `Deploy from a branch`
* **Branch:** `main` · **Folder:** `/docs`

### Puntos críticos de la configuración

1. **`vite.config.ts` → `base: '/Portfolio_Personal/'`.** Debe coincidir con el
   nombre del repo. Si el sitio pasa a dominio propio, cambiar a `base: '/'` y
   ajustar el `basename` del `BrowserRouter` en `App.tsx`.

2. **Hay que commitear `docs/`.** No está en `.gitignore` a propósito: es lo que
   GitHub Pages sirve. Un `git push` sin `npm run build` previo publica el sitio
   viejo.

3. **`public/404.html` + decoder en `index.html`.** GitHub Pages no sabe de rutas
   SPA: `/Portfolio_Personal/reportaje` devolvería 404. El truco estándar de
   *spa-github-pages* es que `404.html` redirija codificando la ruta en la query
   (`/?/reportaje&perfil=periodista`) y que `index.html` la decodifique de vuelta.
   **El `404.html` ya existía pero faltaba el decoder en `index.html`** — se
   añadió en este trabajo. Va en `<head>` como script clásico, antes del
   `<script type="module">` (que es diferido), para que la URL ya esté corregida
   cuando arranca React.

---

## 5. Las tres HV en PDF

Los PDF se generan desde este repositorio, con el mismo motor que produjo los
originales (Chrome headless imprimiendo un HTML):

```bash
node hv/generar.mjs
```

Sobrescribe los tres `CV_Laura_Hernandez_*.pdf` de la raíz. No necesita
dependencias: usa el Chrome instalado en el sistema (o el que indique la
variable de entorno `CHROME_BIN`).

```
hv/
├── datos.mjs       ← contenido de las tres HV (editar aquí)
├── plantilla.mjs   HTML + CSS de impresión (A4, dos columnas)
└── generar.mjs     imprime cada HTML a PDF con Chrome headless
```

El HTML original con el que se hicieron los PDF ya no existía, así que
`hv/` lo reconstruye a partir del contenido extraído de los propios PDF.
A partir de ahora los cambios de la HV se hacen en `hv/datos.mjs` y se
regeneran, en vez de editarse a mano.

### Cada HV apunta a su propia versión del portafolio

El enlace del PDF —encabezado, barra lateral y nota al pie de las métricas—
lleva el parámetro de su perfil, y es un hipervínculo real, no solo texto:

| Archivo PDF | Enlace |
|---|---|
| `CV_Laura_Hernandez_Community_Manager.pdf` | `…/Portfolio_Personal/?perfil=community-manager` |
| `CV_Laura_Hernandez_Periodista_Multimedia.pdf` | `…/Portfolio_Personal/?perfil=periodista` |
| `CV_Laura_Hernandez_Comunicadora_Social.pdf` | `…/Portfolio_Personal/?perfil=comunicadora` |

Así, quien recibe la HV de community manager aterriza en la versión de redes y
no ve las secciones de periodismo.

### Referencias

Las dos referencias son comunes a las tres HV y están en `COMUN.referencias`
(`hv/datos.mjs`). En la web viven en el array `referencias` de
`src/pages/SobreMiPage.tsx` — **son dos listas separadas: al cambiar una hay que
cambiar la otra.**

| Nombre | Cargo | Contacto |
|---|---|---|
| Carlos Solano | Director de la Escuela de Periodismo Multimedia EL TIEMPO y Editor de Podcasts | 320 865 1735 · carsol@eltiempo.com |
| Abrahán Gutiérrez Navarro | Periodista | 350 480 0639 |

---

## 6. Verificación

Lógica de ruteo comprobada con un arnés en Node sobre un stub de `window`
(10/10 casos): lectura desde la URL, `pushState` al cambiar, `replaceState` al
arrancar, recuperación desde `sessionStorage`, caída al perfil por defecto,
manejo de `popstate`, valores inválidos ignorados y conservación de otros query
params y del hash.

Aislamiento comprobado sobre la misma lógica del guardia: cada perfil accede a
sus secciones, es rechazado en las ajenas, la portada siempre es accesible, las
rutas inexistentes redirigen y una barra final (`/reportaje/`) no evade el filtro.

Checklist manual en el navegador:

- [ ] `?perfil=periodista` carga el perfil de periodista al entrar en frío.
- [ ] Con `?perfil=community-manager` el menú solo muestra «Sobre mí» y «Posts de Instagram».
- [ ] Con `?perfil=community-manager`, escribir `/reportaje` a mano redirige a la portada.
- [ ] Con `?perfil=periodista`, escribir `/posts-instagram` a mano redirige a la portada.
- [ ] F5 conserva el perfil (por URL y, si se limpia la query, por `sessionStorage`).
- [ ] Navegar entre secciones permitidas mantiene el perfil en la URL.
- [ ] Los contadores animan al entrar en pantalla.
- [ ] En móvil (<420 px) las métricas van a 2 columnas.

---

## 7. Accesibilidad

* Los contadores animados están marcados `aria-hidden`; el valor final se expone
  una sola vez a lectores de pantalla, para no leer cada frame de la animación.
* `prefers-reduced-motion: reduce` desactiva la animación de conteo, la de
  aparición y los desplazamientos en hover.
