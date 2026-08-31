import { useEffect, useRef, useState } from 'react';

const DURACION_MS = 1100;

/* Si pasado este margen desde el montaje el contador sigue sin arrancar,
   se fija el valor final sin animar. Cubre los contextos donde el
   IntersectionObserver o requestAnimationFrame no llegan a ejecutarse
   —generadores de vista previa de enlaces (WhatsApp, Slack, LinkedIn),
   webviews restringidos, capturas headless—, donde la cifra se quedaría
   en 0 para siempre. En pantalla el bloque está sobre la línea de flote,
   así que en la práctica el observer siempre gana la carrera. */
const RESPALDO_MS = DURACION_MS + 1500;

/** Curva easeOutExpo: arranque rápido y frenado suave al llegar al valor final. */
function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function prefiereMenosMovimiento(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Anima un contador de 0 al `valorFinal` cuando el elemento entra en pantalla.
 *
 * - Vuelve a animar si `valorFinal` cambia (p. ej. al cambiar de perfil).
 * - Respeta `prefers-reduced-motion`: en ese caso muestra el valor final directo.
 * - Garantiza el valor final aunque no haya observer ni frames disponibles.
 */
export function useContadorAnimado<T extends HTMLElement>(valorFinal: number) {
  const ref = useRef<T>(null);
  const [valor, setValor] = useState(0);
  const yaVisible = useRef(false);

  useEffect(() => {
    const nodo = ref.current;
    if (!nodo) return;

    let frameId = 0;
    let inicio = 0;

    const respaldoId = setTimeout(() => setValor(valorFinal), RESPALDO_MS);

    const limpiar = () => {
      cancelAnimationFrame(frameId);
      clearTimeout(respaldoId);
    };

    const animar = () => {
      if (prefiereMenosMovimiento()) {
        setValor(valorFinal);
        return;
      }
      const paso = (ahora: number) => {
        if (!inicio) inicio = ahora;
        const progreso = Math.min((ahora - inicio) / DURACION_MS, 1);
        setValor(valorFinal * easeOutExpo(progreso));
        if (progreso < 1) frameId = requestAnimationFrame(paso);
        else setValor(valorFinal);
      };
      frameId = requestAnimationFrame(paso);
    };

    // Si ya se animó una vez (cambio de perfil), no esperamos al observer.
    if (yaVisible.current || typeof IntersectionObserver === 'undefined') {
      yaVisible.current = true;
      animar();
      return limpiar;
    }

    const observer = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return;
        yaVisible.current = true;
        observer.disconnect();
        animar();
      },
      { threshold: 0.35 },
    );
    observer.observe(nodo);

    return () => {
      observer.disconnect();
      limpiar();
    };
  }, [valorFinal]);

  return { ref, valor };
}
