import { useEffect, useRef, useState } from 'react';
import type { MouseEvent, PointerEvent } from 'react';
import { IconClose, IconExternalLink } from './icons';
import styles from './VisorImagen.module.css';

export interface ImagenVisor {
  src: string;
  titulo: string;
  /** Enlace a la versión digital del mismo artículo. */
  enlace?: string;
}

interface Props {
  imagen: ImagenVisor | null;
  onCerrar: () => void;
}

const ZOOMS = [1, 1.8, 2.6];

/**
 * Página impresa a pantalla completa para poder leerla. Tocar la imagen (o
 * los botones) cambia el zoom; ampliada, se mueve arrastrando o con scroll.
 * Usa `<dialog>` nativo: Esc cierra y el fondo queda inerte.
 */
export default function VisorImagen({ imagen, onCerrar }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const lienzoRef = useRef<HTMLDivElement>(null);
  const arrastre = useRef<{ x: number; y: number; izq: number; arr: number; movio: boolean } | null>(null);
  const [nivel, setNivel] = useState(0);

  useEffect(() => {
    const dialogo = ref.current;
    if (!dialogo) return;
    if (imagen && !dialogo.open) dialogo.showModal();
    if (!imagen && dialogo.open) dialogo.close();
  }, [imagen]);

  const cerrar = () => {
    setNivel(0);
    onCerrar();
  };

  // Al ampliar con un toque, centra el zoom donde se tocó.
  const alternarZoom = (e: MouseEvent<HTMLImageElement>) => {
    if (arrastre.current?.movio) return;
    const lienzo = lienzoRef.current;
    const caja = e.currentTarget.getBoundingClientRect();
    const fx = (e.clientX - caja.left) / caja.width;
    const fy = (e.clientY - caja.top) / caja.height;
    const siguiente = (nivel + 1) % ZOOMS.length;
    setNivel(siguiente);
    requestAnimationFrame(() => {
      if (!lienzo) return;
      lienzo.scrollTo({
        left: lienzo.scrollWidth * fx - lienzo.clientWidth / 2,
        top: lienzo.scrollHeight * fy - lienzo.clientHeight / 2,
      });
    });
  };

  // Arrastrar con el mouse para recorrer la página ampliada (en táctil, el scroll ya lo hace).
  const alBajar = (e: PointerEvent<HTMLDivElement>) => {
    const lienzo = lienzoRef.current;
    if (!lienzo || e.pointerType !== 'mouse') return;
    arrastre.current = { x: e.clientX, y: e.clientY, izq: lienzo.scrollLeft, arr: lienzo.scrollTop, movio: false };
  };
  const alMover = (e: PointerEvent<HTMLDivElement>) => {
    const lienzo = lienzoRef.current;
    const a = arrastre.current;
    if (!lienzo || !a) return;
    const dx = e.clientX - a.x;
    const dy = e.clientY - a.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) a.movio = true;
    lienzo.scrollLeft = a.izq - dx;
    lienzo.scrollTop = a.arr - dy;
  };
  const alSoltar = () => {
    // El clic que cierra un arrastre no debe cambiar el zoom.
    window.setTimeout(() => (arrastre.current = null), 0);
  };

  return (
    <dialog
      ref={ref}
      className={styles.visor}
      onClose={cerrar}
      onClick={(e) => e.target === e.currentTarget && cerrar()}
      aria-label={imagen ? `Página impresa: ${imagen.titulo}` : undefined}
    >
      {imagen && (
        <>
          <header className={styles.cabecera}>
            <div className={styles.cabeceraTexto}>
              <p className={styles.medio}>Edición impresa · EL TIEMPO</p>
              <h2 className={styles.titulo}>{imagen.titulo}</h2>
            </div>
            <div className={styles.herramientas}>
              <button
                type="button"
                className={styles.boton}
                onClick={() => setNivel((n) => Math.max(0, n - 1))}
                disabled={nivel === 0}
                aria-label="Alejar"
              >
                −
              </button>
              <button
                type="button"
                className={styles.boton}
                onClick={() => setNivel((n) => Math.min(ZOOMS.length - 1, n + 1))}
                disabled={nivel === ZOOMS.length - 1}
                aria-label="Acercar"
              >
                +
              </button>
              <button type="button" className={styles.boton} onClick={cerrar} aria-label="Cerrar">
                <IconClose size={18} />
              </button>
            </div>
          </header>

          <div
            ref={lienzoRef}
            className={styles.lienzo}
            data-zoom={nivel > 0 || undefined}
            onPointerDown={alBajar}
            onPointerMove={alMover}
            onPointerUp={alSoltar}
            onPointerLeave={alSoltar}
          >
            <img
              src={imagen.src}
              alt={`Página impresa: ${imagen.titulo}`}
              className={styles.imagen}
              style={{ width: nivel > 0 ? `${ZOOMS[nivel] * 100}%` : undefined }}
              onClick={alternarZoom}
              draggable={false}
            />
          </div>

          {imagen.enlace && (
            <footer className={styles.pie}>
              <span className={styles.ayuda}>Toca la página para acercar</span>
              <a href={imagen.enlace} target="_blank" rel="noopener noreferrer" className={styles.enlace}>
                Leer la versión digital <IconExternalLink size={14} />
              </a>
            </footer>
          )}
        </>
      )}
    </dialog>
  );
}
