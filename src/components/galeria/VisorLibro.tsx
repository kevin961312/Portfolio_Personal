import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  AnimationEvent as AnimationEventReact,
  CSSProperties,
  KeyboardEvent as KeyboardEventReact,
  PointerEvent as PointerEventReact,
  RefObject,
} from 'react';
import type { LibroFotos } from '../../types/galeria';
import {
  IconBook,
  IconChevronLeft,
  IconChevronRight,
  IconDownload,
  IconExpand,
  IconExternalLink,
  IconImage,
  IconLocation,
  IconPause,
  IconPlay,
  IconShrink,
  IconZoomIn,
  IconZoomOut,
} from '../icons';
import { formatearFechaLarga } from '../../lib/galeria';
import { rutaPublica } from '../../lib/rutas';
import { useFocoRetenido } from '../../hooks/useFocoRetenido';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { usePantallaCompleta } from '../../hooks/usePantallaCompleta';
import styles from './VisorLibro.module.css';

interface Props {
  libro: LibroFotos;
  /** Referencia al contenedor del visor (para llevarle el foco desde afuera). */
  visorRef?: RefObject<HTMLDivElement | null>;
  /** `false` cuando la página ya pone el título (h1): se omiten el
      antetítulo, el h2 y el texto, y quedan los datos y las acciones. */
  titulado?: boolean;
}

/** Niveles de los botones de zoom. */
const NIVELES_ZOOM = [1, 1.5, 2, 3, 4];
const ZOOM_MAXIMO = 4;
/** Doble clic / doble toque alterna entre 1 y este nivel. */
const ZOOM_DOBLE = 2.5;
/** Segundos por página en el modo presentación. */
const SEGUNDOS_POR_PAGINA = 6;
/** Ventana para contar dos toques como doble toque. */
const DOBLE_TOQUE_MS = 300;

interface Zoom {
  z: number;
  x: number;
  y: number;
}

interface Giro {
  desde: number;
  hacia: number;
  /** 1 = adelante (gira la mitad derecha), -1 = atrás (gira la izquierda). */
  dir: 1 | -1;
}

type ModoPresentacion = 'apagada' | 'corriendo' | 'pausada';

const ZOOM_INICIAL: Zoom = { z: 1, x: 0, y: 0 };

/** Mantiene la página cubriendo su marco: sin bordes vacíos al desplazar. */
function limitarZoom(z: number, x: number, y: number, ancho: number, alto: number): Zoom {
  const nz = Math.min(Math.max(z, 1), ZOOM_MAXIMO);
  return {
    z: nz,
    x: Math.min(0, Math.max(ancho - ancho * nz, x)),
    y: Math.min(0, Math.max(alto - alto * nz, y)),
  };
}

/** Precarga una imagen y la decodifica (para que el cambio sea instantáneo). */
function precargar(src: string) {
  const img = new Image();
  img.src = src;
  img.decode?.().catch(() => {});
}

/**
 * Visor del libro de fotos: un fotolibro abierto sobre una mesa de luz. En
 * escritorio y en celular la hoja gira sobre el lomo (con las flechas o
 * deslizando el dedo). Miniaturas, zoom (botones, doble clic, pellizco, rueda con
 * Ctrl), pantalla completa, presentación automática y descarga del PDF.
 * Las páginas son WebP pre-renderizadas del PDF (scripts/renderizar-libro.sh).
 */
export default function VisorLibro({ libro, visorRef: visorRefExterno, titulado = true }: Props) {
  const total = libro.paginas.length;
  const ultima = total - 1;

  const visorRefPropio = useRef<HTMLDivElement>(null);
  const visorRef = visorRefExterno ?? visorRefPropio;
  const marcoRef = useRef<HTMLDivElement>(null);
  const miniaturasRef = useRef<HTMLOListElement>(null);
  // Alejar en 100 % o «Página siguiente» en la última dejan el botón
  // deshabilitado: el foco vuelve al visor para que el teclado siga vivo.
  useFocoRetenido(visorRef);
  const punteros = useRef(new Map<number, { x: number; y: number }>());
  const gesto = useRef<{
    tipo: 'tap' | 'pan' | 'swipe' | 'pinch';
    x0: number;
    y0: number;
    t0: number;
    zoom0: Zoom;
    distancia0?: number;
  } | null>(null);
  const ultimoToque = useRef<{ t: number; x: number; y: number } | null>(null);
  const pendiente = useRef<number | null>(null);

  const movil = useMediaQuery('(max-width: 600px)');
  const reducido = useMediaQuery('(prefers-reduced-motion: reduce)');
  const pantalla = usePantallaCompleta(visorRef);

  const [pagina, setPagina] = useState(0);
  const [giro, setGiro] = useState<Giro | null>(null);
  const [entrada, setEntrada] = useState<{ lado: 'izquierda' | 'derecha' | 'fundido'; id: number } | null>(null);
  const [zoom, setZoom] = useState<Zoom>(ZOOM_INICIAL);
  const [conTransicion, setConTransicion] = useState(true);
  const [deslizamiento, setDeslizamiento] = useState(0);
  const [ampliado, setAmpliado] = useState(false);
  const [modo, setModo] = useState<ModoPresentacion>('apagada');
  const [oculto, setOculto] = useState(false);
  const [cargadas, setCargadas] = useState<ReadonlySet<string>>(() => new Set());
  const [errores, setErrores] = useState<ReadonlySet<number>>(() => new Set());
  const [pistaZoom, setPistaZoom] = useState(false);

  const actual = libro.paginas[pagina];
  const enZoom = zoom.z > 1;
  const completa = pantalla.activa || ampliado;
  const usarGrande = enZoom || completa;
  const corriendo = modo === 'corriendo' && pagina < ultima;
  const presentacionTerminada = modo !== 'apagada' && pagina === ultima;
  /** La barra de la página actual se dibuja (llenándose o en pausa). */
  const conBarra = modo !== 'apagada' && pagina < ultima && !reducido;

  /* ── Navegación ── */
  const reiniciarZoom = useCallback(() => {
    setConTransicion(true);
    setZoom(ZOOM_INICIAL);
  }, []);

  /** Pasa de `desde` a `nuevo`: la hoja gira sobre el lomo (también en
      celular) o, con movimiento reducido, un fundido. */
  const cambiarPagina = useCallback(
    (desde: number, nuevo: number) => {
      reiniciarZoom();
      setDeslizamiento(0);
      if (reducido) {
        setEntrada({ lado: 'fundido', id: Date.now() });
      } else {
        setGiro({ desde, hacia: nuevo, dir: nuevo > desde ? 1 : -1 });
      }
      setPagina(nuevo);
    },
    [reducido, reiniciarZoom],
  );

  const irA = useCallback(
    (destino: number) => {
      const nuevo = Math.min(Math.max(destino, 0), ultima);
      if (nuevo === pagina) return;
      if (giro) {
        // Un clic durante el giro se encola (como mucho uno).
        pendiente.current = nuevo;
        return;
      }
      cambiarPagina(pagina, nuevo);
    },
    [cambiarPagina, giro, pagina, ultima],
  );

  /** Navegación del usuario: además pausa la presentación. */
  const irManual = (destino: number) => {
    if (modo === 'corriendo') setModo('pausada');
    irA(destino);
  };

  const alTerminarGiro = (e: AnimationEventReact<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    const siguiente = pendiente.current;
    pendiente.current = null;
    if (siguiente != null && siguiente !== pagina) cambiarPagina(pagina, siguiente);
    else setGiro(null);
  };

  /* ── Zoom ── */
  const medidas = () => {
    const marco = marcoRef.current;
    return { ancho: marco?.clientWidth ?? 0, alto: marco?.clientHeight ?? 0 };
  };

  const zoomEn = useCallback((nz: number, px?: number, py?: number, animar = true) => {
    const marco = marcoRef.current;
    if (!marco) return;
    const ancho = marco.clientWidth;
    const alto = marco.clientHeight;
    const cx = px ?? ancho / 2;
    const cy = py ?? alto / 2;
    setConTransicion(animar);
    setZoom((previo) => {
      // El punto bajo el cursor (o el centro) queda quieto al acercar o alejar.
      const contenidoX = (cx - previo.x) / previo.z;
      const contenidoY = (cy - previo.y) / previo.z;
      const z = Math.min(Math.max(nz, 1), ZOOM_MAXIMO);
      if (z === 1) return ZOOM_INICIAL;
      return limitarZoom(z, cx - contenidoX * z, cy - contenidoY * z, ancho, alto);
    });
  }, []);

  const mostrarPistaZoom = () => {
    setPistaZoom(true);
    window.setTimeout(() => setPistaZoom(false), 2000);
  };

  const acercar = () => {
    const siguiente = NIVELES_ZOOM.find((n) => n > zoom.z + 0.01) ?? ZOOM_MAXIMO;
    if (modo === 'corriendo') setModo('pausada');
    zoomEn(siguiente);
    if (zoom.z === 1) mostrarPistaZoom();
  };

  const alejar = () => {
    const anterior = [...NIVELES_ZOOM].reverse().find((n) => n < zoom.z - 0.01) ?? 1;
    zoomEn(anterior);
  };

  // Rueda con Ctrl/⌘ (o el pellizco del trackpad) acerca y aleja. Va con un
  // listener nativo no pasivo para poder evitar el zoom de la página.
  useEffect(() => {
    const marco = marcoRef.current;
    if (!marco) return;
    const alRodar = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const caja = marco.getBoundingClientRect();
      setZoom((previo) => {
        const z = Math.min(Math.max(previo.z * Math.exp(-e.deltaY * 0.01), 1), ZOOM_MAXIMO);
        if (z === 1) return ZOOM_INICIAL;
        const px = e.clientX - caja.left;
        const py = e.clientY - caja.top;
        const contenidoX = (px - previo.x) / previo.z;
        const contenidoY = (py - previo.y) / previo.z;
        return limitarZoom(z, px - contenidoX * z, py - contenidoY * z, caja.width, caja.height);
      });
      setConTransicion(false);
    };
    marco.addEventListener('wheel', alRodar, { passive: false });
    return () => marco.removeEventListener('wheel', alRodar);
  }, []);

  /* ── Gestos con puntero: toque, doble toque, arrastre, deslizar y pellizco ── */
  const alPresionar = (e: PointerEventReact<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    punteros.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const caja = e.currentTarget.getBoundingClientRect();
    if (punteros.current.size === 2) {
      const [a, b] = [...punteros.current.values()];
      gesto.current = {
        tipo: 'pinch',
        x0: (a.x + b.x) / 2 - caja.left,
        y0: (a.y + b.y) / 2 - caja.top,
        t0: Date.now(),
        zoom0: zoom,
        distancia0: Math.hypot(a.x - b.x, a.y - b.y),
      };
      setDeslizamiento(0);
      return;
    }
    gesto.current = { tipo: 'tap', x0: e.clientX, y0: e.clientY, t0: Date.now(), zoom0: zoom };
  };

  const alMover = (e: PointerEventReact<HTMLDivElement>) => {
    if (!punteros.current.has(e.pointerId)) {
      // Sin botón presionado: el cursor anuncia qué hace un clic en cada zona.
      if (e.pointerType === 'mouse' && zoom.z === 1) {
        const caja = e.currentTarget.getBoundingClientRect();
        const px = e.clientX - caja.left;
        e.currentTarget.style.cursor =
          px < caja.width / 3 ? (pagina > 0 ? 'w-resize' : 'default') : px > (caja.width * 2) / 3 ? (pagina < ultima ? 'e-resize' : 'default') : 'zoom-in';
      } else {
        e.currentTarget.style.cursor = '';
      }
      return;
    }
    punteros.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesto.current;
    if (!g) return;
    const { ancho, alto } = medidas();

    if (g.tipo === 'pinch' && punteros.current.size >= 2 && g.distancia0) {
      const [a, b] = [...punteros.current.values()];
      const factor = Math.hypot(a.x - b.x, a.y - b.y) / g.distancia0;
      const z = Math.min(Math.max(g.zoom0.z * factor, 1), ZOOM_MAXIMO);
      const contenidoX = (g.x0 - g.zoom0.x) / g.zoom0.z;
      const contenidoY = (g.y0 - g.zoom0.y) / g.zoom0.z;
      setConTransicion(false);
      setZoom(z === 1 ? ZOOM_INICIAL : limitarZoom(z, g.x0 - contenidoX * z, g.y0 - contenidoY * z, ancho, alto));
      return;
    }

    const dx = e.clientX - g.x0;
    const dy = e.clientY - g.y0;
    if (g.tipo === 'tap' && Math.hypot(dx, dy) > 6) {
      if (g.zoom0.z > 1) g.tipo = 'pan';
      else if (movil && Math.abs(dx) > Math.abs(dy)) g.tipo = 'swipe';
      else return;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    if (g.tipo === 'pan') {
      setConTransicion(false);
      setZoom(limitarZoom(g.zoom0.z, g.zoom0.x + dx, g.zoom0.y + dy, ancho, alto));
    } else if (g.tipo === 'swipe') {
      // El dedo solo insinúa el movimiento: al soltar, la hoja gira entera.
      // Más resistencia en la primera y la última página.
      const enBorde = (dx > 0 && pagina === 0) || (dx < 0 && pagina === ultima);
      setDeslizamiento(dx * (enBorde ? 0.1 : 0.18));
    }
  };

  const alSoltar = (e: PointerEventReact<HTMLDivElement>) => {
    punteros.current.delete(e.pointerId);
    const g = gesto.current;
    if (!g) return;
    if (g.tipo === 'pinch') {
      if (punteros.current.size === 0) gesto.current = null;
      return;
    }
    gesto.current = null;
    const { ancho } = medidas();
    const dx = e.clientX - g.x0;

    if (g.tipo === 'swipe') {
      const velocidad = Math.abs(dx) / Math.max(1, Date.now() - g.t0);
      if ((Math.abs(dx) > ancho * 0.18 || velocidad > 0.35) && !((dx > 0 && pagina === 0) || (dx < 0 && pagina === ultima))) {
        irManual(pagina + (dx < 0 ? 1 : -1));
      } else {
        setDeslizamiento(0);
      }
      return;
    }
    if (g.tipo !== 'tap' || e.type === 'pointercancel') return;

    // Toque: doble toque alterna el zoom; uno solo en los tercios laterales pasa página.
    const caja = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - caja.left;
    const py = e.clientY - caja.top;
    const ahora = Date.now();
    const previo = ultimoToque.current;
    const tercio = px < caja.width / 3 ? -1 : px > (caja.width * 2) / 3 ? 1 : 0;
    if (previo && ahora - previo.t < DOBLE_TOQUE_MS && Math.hypot(px - previo.x, py - previo.y) < 30) {
      ultimoToque.current = null;
      if (zoom.z > 1) {
        reiniciarZoom();
      } else if (tercio === 0) {
        if (modo === 'corriendo') setModo('pausada');
        zoomEn(ZOOM_DOBLE, px, py);
        mostrarPistaZoom();
      }
      return;
    }
    ultimoToque.current = { t: ahora, x: px, y: py };
    if (zoom.z === 1 && tercio !== 0) irManual(pagina + tercio);
  };

  /* ── Pantalla completa (con alternativa por CSS donde no hay API) ── */
  const alternarPantalla = () => {
    if (pantalla.soportada) pantalla.alternar();
    else setAmpliado((v) => !v);
  };

  useEffect(() => {
    if (!ampliado) return;
    const raiz = document.documentElement;
    const previo = raiz.style.overflow;
    raiz.style.overflow = 'hidden';
    return () => {
      raiz.style.overflow = previo;
    };
  }, [ampliado]);

  /* ── Presentación automática ── */
  const alternarPresentacion = () => {
    if (presentacionTerminada) {
      setModo('corriendo');
      irA(0);
      return;
    }
    if (modo === 'corriendo') {
      setModo('pausada');
      return;
    }
    setModo('corriendo');
    reiniciarZoom();
    if (!completa && modo === 'apagada') {
      if (pantalla.soportada) pantalla.entrar();
    }
  };

  useEffect(() => {
    const alCambiar = () => setOculto(document.visibilityState === 'hidden');
    document.addEventListener('visibilitychange', alCambiar);
    return () => document.removeEventListener('visibilitychange', alCambiar);
  }, []);

  // Con movimiento reducido no hay barra animada: un temporizador simple.
  useEffect(() => {
    if (!reducido || !corriendo || oculto) return;
    const espera = window.setTimeout(() => irA(pagina + 1), SEGUNDOS_POR_PAGINA * 1000);
    return () => clearTimeout(espera);
  }, [reducido, corriendo, oculto, pagina, irA]);

  /* ── Precarga y miniaturas ── */
  useEffect(() => {
    for (const i of [pagina - 1, pagina + 1]) {
      const p = libro.paginas[i];
      if (!p) continue;
      precargar(rutaPublica(p.imagen));
      if (usarGrande) precargar(rutaPublica(p.imagenGrande));
    }
  }, [libro.paginas, pagina, usarGrande]);

  useEffect(() => {
    const tira = miniaturasRef.current;
    const activa = tira?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!tira || !activa) return;
    tira.scrollTo({
      left: activa.offsetLeft - tira.clientWidth / 2 + activa.clientWidth / 2,
      behavior: reducido ? 'auto' : 'smooth',
    });
  }, [pagina, reducido]);

  /* ── Teclado (sobre el visor, no en window: no le roba las flechas a la página) ── */
  const alPulsar = (e: KeyboardEventReact<HTMLDivElement>) => {
    const enControl = (e.target as HTMLElement).closest('button, a') != null;
    const paso = 80;
    const { ancho, alto } = medidas();
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowLeft': {
        e.preventDefault();
        const signo = e.key === 'ArrowRight' ? 1 : -1;
        if (enZoom) {
          setConTransicion(true);
          setZoom((z) => limitarZoom(z.z, z.x - signo * paso, z.y, ancho, alto));
        } else irManual(pagina + signo);
        break;
      }
      case 'ArrowUp':
      case 'ArrowDown':
        if (!enZoom) return;
        e.preventDefault();
        setConTransicion(true);
        setZoom((z) => limitarZoom(z.z, z.x, z.y - (e.key === 'ArrowDown' ? 1 : -1) * paso, ancho, alto));
        break;
      case 'PageDown':
        e.preventDefault();
        irManual(pagina + 1);
        break;
      case 'PageUp':
        e.preventDefault();
        irManual(pagina - 1);
        break;
      case 'Home':
        e.preventDefault();
        irManual(0);
        break;
      case 'End':
        e.preventDefault();
        irManual(ultima);
        break;
      case '+':
      case '=':
        e.preventDefault();
        acercar();
        break;
      case '-':
      case '_':
        e.preventDefault();
        alejar();
        break;
      case '0':
        e.preventDefault();
        reiniciarZoom();
        break;
      case 'f':
      case 'F':
        e.preventDefault();
        alternarPantalla();
        break;
      case ' ':
        if (enControl) return;
        e.preventDefault();
        alternarPresentacion();
        break;
      case 'Escape':
        if (enZoom) {
          e.preventDefault();
          reiniciarZoom();
        } else if (ampliado) {
          e.preventDefault();
          setAmpliado(false);
        }
        break;
    }
  };

  /* ── Render ── */
  const fondoMitad = (i: number, lado: 'izquierda' | 'derecha'): CSSProperties => ({
    backgroundImage: `url("${rutaPublica(libro.paginas[i].imagen)}")`,
    backgroundPosition: lado === 'izquierda' ? '0 0' : '100% 0',
  });

  const etiquetaPresentacion = presentacionTerminada
    ? 'Ver de nuevo'
    : modo === 'corriendo'
      ? 'Pausar'
      : modo === 'pausada'
        ? 'Reanudar'
        : 'Presentación';

  const cargada = cargadas.has(actual.imagen);
  const fallo = errores.has(pagina);
  const nivelZoom = `${Math.round(zoom.z * 100)} %`;

  return (
    <section
      id="libro"
      className={styles.seccion}
      aria-labelledby={titulado ? 'libro-titulo' : undefined}
      aria-label={titulado ? undefined : `Visor del libro ${libro.titulo}`}
    >
      <header className={styles.encabezado}>
        {titulado && (
          <>
            <p className={styles.eyebrow}>Fotolibro · Fotorreportaje</p>
            <h2 id="libro-titulo" className={styles.titulo}>
              {libro.titulo}
            </h2>
            <p className={styles.lead}>{libro.descripcion}</p>
          </>
        )}
        <p className={styles.datos}>
          <span>
            <IconBook size={14} /> {total} páginas
          </span>
          <span>
            <IconLocation size={14} /> {libro.lugar}
          </span>
          <span>{formatearFechaLarga(libro.fecha)}</span>
          <span>Fotografía: {libro.autora}</span>
        </p>
        <div className={styles.acciones}>
          <button type="button" className={styles.boton} onClick={alternarPresentacion}>
            {modo === 'corriendo' && !presentacionTerminada ? <IconPause size={16} /> : <IconPlay size={16} />}
            {etiquetaPresentacion}
          </button>
          <a href={rutaPublica(libro.pdf)} download="40-anos-de-ira.pdf" className={styles.boton}>
            <IconDownload size={16} /> Descargar PDF · {libro.pesoPdf}
          </a>
          <a href={rutaPublica(libro.pdf)} target="_blank" rel="noopener noreferrer" className={styles.botonTexto}>
            Abrir PDF <IconExternalLink size={13} />
          </a>
        </div>
      </header>

      <div
        ref={visorRef}
        className={styles.visor}
        data-completa={completa || undefined}
        data-ampliado={ampliado || undefined}
        role="region"
        aria-roledescription="visor de libro"
        aria-label={`${libro.titulo}, libro de fotos`}
        tabIndex={0}
        onKeyDown={alPulsar}
      >
        {modo !== 'apagada' && (
          <div className={styles.segmentos} aria-hidden="true">
            {libro.paginas.map((p, i) => (
              <span
                key={p.numero}
                className={styles.segmento}
                data-estado={i < pagina || (presentacionTerminada && i === pagina) ? 'visto' : 'pendiente'}
              >
                <span
                  className={styles.relleno}
                  style={
                    i === pagina && conBarra
                      ? {
                          animationDuration: `${SEGUNDOS_POR_PAGINA}s`,
                          animationPlayState: corriendo && !oculto && !giro ? 'running' : 'paused',
                        }
                      : undefined
                  }
                  data-corriendo={(i === pagina && conBarra) || undefined}
                  onAnimationEnd={i === pagina && corriendo ? () => irA(pagina + 1) : undefined}
                />
              </span>
            ))}
          </div>
        )}

        <div className={styles.herramientas}>
          <p className={styles.contadorArriba}>
            Página {pagina + 1} de {total}
            {modo === 'corriendo' && reducido && !presentacionTerminada && ` · siguiente en ${SEGUNDOS_POR_PAGINA} s`}
          </p>
          <div className={styles.grupoBotones}>
            <button type="button" className={styles.herramienta} onClick={alejar} disabled={!enZoom} aria-label="Alejar">
              <IconZoomOut size={18} />
            </button>
            <span className={styles.nivel} aria-live="polite">
              {nivelZoom}
            </span>
            <button type="button" className={styles.herramienta} onClick={acercar} disabled={zoom.z >= ZOOM_MAXIMO} aria-label="Acercar">
              <IconZoomIn size={18} />
            </button>
            <button
              type="button"
              className={styles.herramienta}
              onClick={alternarPresentacion}
              aria-label={etiquetaPresentacion === 'Presentación' ? 'Iniciar presentación' : etiquetaPresentacion}
            >
              {modo === 'corriendo' && !presentacionTerminada ? <IconPause size={18} /> : <IconPlay size={18} />}
            </button>
            <button
              type="button"
              className={styles.herramienta}
              onClick={alternarPantalla}
              aria-pressed={completa}
              aria-label={completa ? 'Salir de pantalla completa' : 'Pantalla completa'}
            >
              {completa ? <IconShrink size={18} /> : <IconExpand size={18} />}
            </button>
          </div>
        </div>

        <div className={styles.escenario}>
          <button
            type="button"
            className={styles.flecha}
            onClick={() => irManual(pagina - 1)}
            disabled={pagina === 0}
            aria-label="Página anterior"
          >
            <IconChevronLeft size={24} />
          </button>

          <div
            ref={marcoRef}
            className={styles.pagina}
            data-zoom={enZoom || undefined}
            data-lomo={pagina > 0 || undefined}
            data-arrastrando={!conTransicion || undefined}
            onPointerDown={alPresionar}
            onPointerMove={alMover}
            onPointerUp={alSoltar}
            onPointerCancel={alSoltar}
          >
            <div
              className={styles.deslizador}
              data-soltando={deslizamiento === 0 || undefined}
              style={{ transform: deslizamiento ? `translateX(${deslizamiento}px)` : undefined }}
            >
              <div
                key={entrada?.id ?? 'inicial'}
                className={styles.lamina}
                data-entrada={entrada?.lado}
                data-transicion={conTransicion || undefined}
                style={{ transform: `translate(${zoom.x}px, ${zoom.y}px) scale(${zoom.z})` }}
              >
                {!cargada && !fallo && <span className={styles.esqueleto} aria-hidden="true" />}
                {fallo ? (
                  <div className={styles.error}>
                    <IconImage size={28} />
                    <p>No se pudo cargar esta página.</p>
                    <a href={rutaPublica(libro.pdf)} download="40-anos-de-ira.pdf">
                      Descargar el PDF completo
                    </a>
                  </div>
                ) : (
                  <img
                    src={rutaPublica(actual.imagen)}
                    alt={actual.texto}
                    width={actual.ancho}
                    height={actual.alto}
                    className={styles.imagen}
                    data-cargada={cargada || undefined}
                    draggable={false}
                    onLoad={() => setCargadas((previas) => new Set(previas).add(actual.imagen))}
                    onError={() => setErrores((previos) => new Set(previos).add(pagina))}
                  />
                )}
                {usarGrande && !fallo && (
                  <img
                    src={rutaPublica(actual.imagenGrande)}
                    alt=""
                    aria-hidden="true"
                    className={styles.imagenGrande}
                    data-cargada={cargadas.has(actual.imagenGrande) || undefined}
                    draggable={false}
                    onLoad={() => setCargadas((previas) => new Set(previas).add(actual.imagenGrande))}
                  />
                )}
              </div>
            </div>

            {/* Giro de hoja: debajo, las mitades que no se mueven; encima, la
                hoja con frente (página que se va) y dorso (la que llega). */}
            {giro && (
              <div key={`${giro.desde}-${giro.hacia}`} className={styles.giro} aria-hidden="true">
                <span
                  className={styles.mitad}
                  data-lado="izquierda"
                  style={fondoMitad(giro.dir === 1 ? giro.desde : giro.hacia, 'izquierda')}
                />
                <span
                  className={styles.mitad}
                  data-lado="derecha"
                  style={fondoMitad(giro.dir === 1 ? giro.hacia : giro.desde, 'derecha')}
                />
                <span className={styles.sombraBase} data-dir={giro.dir} />
                <div className={styles.hoja} data-dir={giro.dir} onAnimationEnd={alTerminarGiro}>
                  <span
                    className={styles.cara}
                    data-cara="frente"
                    style={fondoMitad(giro.desde, giro.dir === 1 ? 'derecha' : 'izquierda')}
                  />
                  <span
                    className={styles.cara}
                    data-cara="dorso"
                    style={fondoMitad(giro.hacia, giro.dir === 1 ? 'izquierda' : 'derecha')}
                  />
                </div>
              </div>
            )}

            {pistaZoom && <span className={styles.pistaZoom}>Doble clic para salir del zoom</span>}
          </div>

          <button
            type="button"
            className={styles.flecha}
            onClick={() => irManual(pagina + 1)}
            disabled={pagina === ultima}
            aria-label="Página siguiente"
          >
            <IconChevronRight size={24} />
          </button>
        </div>

        <div className={styles.pie} aria-live="polite">
          <p className={styles.pieTexto}>{actual.texto}</p>
          <div className={styles.navegacionMovil}>
            <button type="button" onClick={() => irManual(pagina - 1)} disabled={pagina === 0} aria-label="Página anterior">
              <IconChevronLeft size={20} />
            </button>
            <p className={styles.contador}>
              Página {pagina + 1} de {total}
            </p>
            <button type="button" onClick={() => irManual(pagina + 1)} disabled={pagina === ultima} aria-label="Página siguiente">
              <IconChevronRight size={20} />
            </button>
          </div>
        </div>

        <ol ref={miniaturasRef} className={styles.miniaturas} aria-label="Páginas del libro">
          {libro.paginas.map((p, i) => (
            <li key={p.numero}>
              <button
                type="button"
                className={styles.miniatura}
                aria-current={i === pagina ? 'page' : undefined}
                aria-label={`Ir a la página ${p.numero}: ${p.texto}`}
                onClick={() => irManual(i)}
              >
                <img
                  src={rutaPublica(p.miniatura)}
                  alt=""
                  loading="lazy"
                  draggable={false}
                  onError={(e) => {
                    e.currentTarget.style.visibility = 'hidden';
                  }}
                />
                <span className={styles.miniaturaNumero}>{p.numero}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
