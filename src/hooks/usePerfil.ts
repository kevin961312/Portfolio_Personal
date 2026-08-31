import { useCallback, useSyncExternalStore } from 'react';
import type { PerfilContenido, PerfilId } from '../types';
import { PERFILES } from '../data/perfiles';
import {
  construirSearch,
  getPerfilActivo,
  setPerfilActivo,
  suscribir,
} from '../lib/perfilStore';

interface UsePerfil {
  /** Id del perfil activo. */
  perfilId: PerfilId;
  /** Contenido completo del perfil activo (textos, métricas, habilidades…). */
  perfil: PerfilContenido;
  /** Cambia el perfil: actualiza estado, URL y sessionStorage sin recargar. */
  cambiarPerfil: (id: PerfilId) => void;
  /** Query string a añadir a los enlaces internos para conservar el perfil. */
  search: string;
}

/**
 * Conecta React al store del perfil. `useSyncExternalStore` garantiza que
 * todos los componentes suscritos vean el mismo valor en el mismo render,
 * sin necesidad de un Context Provider envolviendo el árbol.
 */
export function usePerfil(): UsePerfil {
  const perfilId = useSyncExternalStore(suscribir, getPerfilActivo, getPerfilActivo);

  const cambiarPerfil = useCallback((id: PerfilId) => {
    setPerfilActivo(id, { modo: 'push' });
  }, []);

  return {
    perfilId,
    perfil: PERFILES[perfilId],
    cambiarPerfil,
    search: construirSearch(perfilId),
  };
}
