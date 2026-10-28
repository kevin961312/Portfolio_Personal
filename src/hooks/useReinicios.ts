import { useCallback, useRef, useState } from 'react';

/**
 * Posts que alguien tocó (puede que estén sonando). `soltar` les cambia la
 * `key` a su PostVivo: React lo desmonta, el iframe se destruye y el video
 * se corta. Los que nadie tocó siguen cargados.
 *
 *   <PostVivo key={clave(url)} onTocado={() => marcar(url)} … />
 *   soltar(urlQueSeQueda)   // al pasar a otra pieza o tocar otro post
 */
export function useReinicios() {
  const [reinicios, setReinicios] = useState<Record<string, number>>({});
  const tocados = useRef(new Set<string>());

  const marcar = useCallback((url: string) => {
    tocados.current.add(url);
  }, []);

  const soltar = useCallback((seQueda?: string) => {
    const salen = [...tocados.current].filter((url) => url !== seQueda);
    if (salen.length === 0) return;
    salen.forEach((url) => tocados.current.delete(url));
    setReinicios((previos) => {
      const siguientes = { ...previos };
      for (const url of salen) siguientes[url] = (siguientes[url] ?? 0) + 1;
      return siguientes;
    });
  }, []);

  const clave = (url: string) => `${url}:${reinicios[url] ?? 0}`;
  return { marcar, soltar, clave };
}
