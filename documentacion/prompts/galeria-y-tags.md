# Prompt maestro — Tags de posts + pestaña Galería

Portafolio web de Laura Hernández (React 19 + Vite + TypeScript + CSS Modules,
React Router con `basename="/Portfolio_Personal"`, build en `docs/` para
GitHub Pages). Todo el texto visible va en **español**.

## Objetivo 1 — Tags temáticos en los posts de Instagram

- Cada post de `src/data/posts-instagram.ts` lleva un tema: **Cultura**,
  **Política** o **Cubrimiento** (reportería en terreno, coberturas en vivo,
  emergencias, protestas, hechos de orden público).
- Igual que las secciones de **Artículos digitales**
  (`src/pages/ArticulosDigitalesPage.tsx`): chips para filtrar por tema y la
  etiqueta visible en cada tarjeta.
- Se combina con los filtros que ya existen (Reels / Carruseles y Más vistos /
  Recientes) y con el scroll infinito de a 8.

## Objetivo 2 — Nueva pestaña "Galería"

Ruta nueva `/galeria`, en el menú y en las tres versiones del sitio
(`perfiles.ts` → `secciones` de los tres perfiles). **No** se toca el
generador de HV en PDF (`hv/`): esto es solo para la página web.

### 2a. Álbumes de fotos (carruseles de Instagram) en línea de tiempo

Álbumes (en este orden de entrada; la línea de tiempo los ordena por fecha):

1. https://www.instagram.com/p/DfCjUeFER4F/
2. https://www.instagram.com/p/DeqJPAekYql/
3. ~~https://www.instagram.com/p/DejlzvolcGr/~~ (quitado a pedido de la usuaria)
4. https://www.instagram.com/p/Dc95tRSFJdY/
5. https://www.instagram.com/p/DbCHNfOiWbx/
6. https://www.instagram.com/p/DYlVQx8FQt3/
7. https://www.instagram.com/p/DaJpdnWCRNV/
8. https://www.instagram.com/p/DPHcJnkkfNC/

- **Solo iframe (embed de Instagram). No se descargan fotos** (decisión de la
  usuaria: no cargar el repo con imágenes y que agregar un álbum sea pegar la
  URL en el archivo de datos).
- Hecho comprobado: el embed **ignora `img_index`**; siempre abre en la
  primera foto. Dentro de un álbum las fotos se pasan con las flechas propias
  del embed (no se controlan desde afuera). Lo que sí se controla: el paso
  entre álbumes, el tamaño/escala del iframe y todo lo que lo rodea.
- **Línea de tiempo**: los álbumes ordenados por fecha sobre un eje, con
  fecha, título y cuenta; llamativa e inmersiva, no una grilla plana.
- **Modo proyección** ("pantalla gigante, como una presentación"): al abrir
  un álbum se proyecta enorme en una sala oscura; se puede pasar al álbum
  anterior/siguiente (flechas, teclado, gestos), con avance automático entre
  álbumes que se pausa al interactuar, y pantalla completa.

### 2b. Libro de fotos "40 años de I.R.A."

- Original: `/Users/KEPINEDA/Downloads/40 años de I.R.A..pdf` (10 páginas,
  16:9 de 1440×810 pt, exportado de Canva, 9,2 MB). Copiarlo al proyecto en
  `public/documentos/40-anos-de-ira.pdf`.
- Visor "de la mejor forma": páginas grandes, pasar página con transición,
  miniaturas, pantalla completa, zoom, descarga del PDF. Las páginas se
  pre-renderizan a imágenes livianas (WebP) con `pdftoppm` + `cwebp`
  (instalados en /opt/homebrew/bin) para que el visor sea instantáneo, y el
  PDF queda para descargar.

## Cambios pedidos después (mandan sobre lo anterior y sobre los planes)

1. **Línea de tiempo vertical** (no horizontal), del **más reciente al más
   antiguo**.
2. **Al entrar a Galería se abre de inmediato la pantalla gigante**
   (modo proyección) con el álbum más reciente. Al cerrarla queda la línea
   de tiempo vertical; desde ella se vuelve a proyectar cualquier álbum.
3. **El libro de fotos va en una pestaña aparte del menú**: ruta propia
   `/libro-de-fotos` ("Libro de fotos"), en las tres versiones del sitio.
   La página Galería queda solo con los álbumes.
4. **Álbumes horizontales**: campo `orientacion?: 'horizontal'` en `Album`
   (igual que en `PostInstagram`), pasado al `post` que arma
   `src/lib/galeria.ts`, para que `PostVivo` recorte el 16:9. El álbum
   `https://www.instagram.com/p/DeqJPAekYql/` es horizontal. Sus tarjetas en
   la línea de tiempo y su pantalla en la proyección van en 16:9.
7. El libro de fotos **no va en el menú**: la ruta `/libro-de-fotos` sigue
   existiendo, pero solo se entra desde la Galería (anula el punto 3 en
   lo del menú).
6. **Ya no** se abre la pantalla gigante al entrar a Galería (anula el
   punto 2): se ve la línea de tiempo y la proyección se abre solo con el
   botón o tocando un álbum.
5. Se quitó el álbum DejlzvolcGr (quedan 7). Tags en este orden: Política,
   Género, Cultura, Cubrimiento. Género es una etiqueta adicional
   (`genero: true`), no reemplaza el tema.

## Reglas del proyecto (obligatorias)

- Paleta **solo morados y lilas**, estilo inmersivo del Top 20
  (`src/pages/TopPage.*`). Tokens en `src/index.css` (`--color-*`, `--c1`,
  `--c2`). Nada de otros colores de acento.
- Reutilizar lo que ya existe: `PostVivo` (embed recortado, loader, tope de
  espera, soporte `orientacion: 'horizontal'`), `procesarEmbedsInstagram`,
  `useCerca`, `useReinicios`, `useYaCargados`, `EncabezadoPagina`, iconos de
  `src/components/icons`, `useMediaQuery`, `usePerfil` (título del documento).
- **Iframes**: nunca mover un iframe en el DOM ni desmontarlo sin necesidad
  (el navegador lo recarga). Para cortar un video que suena, cambiar la `key`
  (ver `useReinicios`).
- Accesibilidad: botones reales, `aria-label`, foco visible, teclado (flechas,
  Escape), `prefers-reduced-motion`.
- Responsive: celular (≤600 px), tablet (≤900 px) y escritorio.
- Verificar con `npx tsc -b`, `npx eslint src` y `npm run build`.
- No hacer commit.
