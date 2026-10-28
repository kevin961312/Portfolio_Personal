# Portafolio · Laura Hernández

Sitio del portafolio (React + Vite), las hojas de vida en PDF y la búsqueda
diaria de ofertas de empleo.

## Carpetas

| Carpeta | Qué hay |
|---|---|
| `src/` | Código del sitio. Los datos (artículos, posts, perfiles) están en `src/data/`. |
| `public/` | Imágenes y archivos que se sirven tal cual. |
| `docs/` | Sitio compilado que publica GitHub Pages. Lo genera `npm run build`: no se edita a mano. |
| `hv/` | Generador de las hojas de vida. Los textos se editan en `hv/datos.py`. |
| `CV/` | Hojas de vida en PDF, una carpeta por versión: `V0` (la original), `V1`, `V2`… |
| `ofertas/` | Búsqueda de empleo: una carpeta por día (`ofertas/AAAA-MM-DD/`), más el historial, los contactos y las fuentes. |
| `copys/` | Copys para Cuestión Pública y el prompt con que se redactan. |
| `documentacion/` | Guía de despliegue de los perfiles e informe de auditoría. |

## Comandos

```bash
npm run dev       # sitio en local: http://localhost:5173/Portfolio_Personal/
npm run build     # compila el sitio en docs/ (lo que se publica)
npm run preview   # revisa el build como en producción
```

### Hojas de vida

```bash
./hv/generar.sh            # crea la versión siguiente en CV/ si la HV cambió
./hv/generar.sh --forzar   # la crea aunque no haya cambios
```

Cada versión (`CV/V<n>/`) trae los tres PDF (`CV_Laura_Hernandez_<perfil>_V<n>.pdf`),
`contenido.txt` con el texto de las tres HV y `cambios.txt` con lo que cambió
respecto a la versión anterior. Las versiones anteriores no se tocan.

### Ofertas de empleo

En Claude Code, `/buscar-ofertas` ejecuta la búsqueda del día y deja el informe
y el Excel en `ofertas/<fecha>/`.

Más detalle del sitio y de los perfiles en `documentacion/DESPLIEGUE_PERFILES.md`.
