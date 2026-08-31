import type { PerfilContenido, PerfilId } from '../types';
import { PERFILES, PERFIL_POR_DEFECTO, esPerfilValido } from '../data/perfiles';

/* ──────────────────────────────────────────────────────────────
   Store del perfil activo.

   Fuente de verdad en este orden:
     1. Query param de la URL  →  ?perfil=periodista
     2. sessionStorage         →  sobrevive a F5 y a limpiezas de la URL
     3. PERFIL_POR_DEFECTO     →  comunicadora

   Es un store externo puro (sin React): la capa de UI se suscribe
   con `useSyncExternalStore`. Así la lógica de ruteo se puede
   probar y reutilizar sin montar un componente.
   ────────────────────────────────────────────────────────────── */

/** Nombre del parámetro en la query string. */
export const PARAM_PERFIL = 'perfil';

/** Clave de `sessionStorage` donde se persiste el perfil elegido. */
const CLAVE_SESSION = 'portafolio:perfil-activo';

/** Evento interno que notifica a los suscriptores. */
const EVENTO_CAMBIO = 'portafolio:perfil-cambio';

const enNavegador = typeof window !== 'undefined';

/* ── Lecturas ───────────────────────────────────────────────── */

/** Lee `?perfil=` de una query string. Devuelve `null` si falta o es inválido. */
export function leerPerfilDeUrl(search: string = enNavegador ? window.location.search : ''): PerfilId | null {
  const params = new URLSearchParams(search);
  const valor = params.get(PARAM_PERFIL);
  return esPerfilValido(valor) ? valor : null;
}

/** Lee el perfil persistido en `sessionStorage`. Tolera almacenamiento bloqueado. */
export function leerPerfilDeSession(): PerfilId | null {
  if (!enNavegador) return null;
  try {
    const valor = window.sessionStorage.getItem(CLAVE_SESSION);
    return esPerfilValido(valor) ? valor : null;
  } catch {
    // Modo privado o cookies bloqueadas: seguimos sin persistencia.
    return null;
  }
}

function guardarEnSession(id: PerfilId): void {
  if (!enNavegador) return;
  try {
    window.sessionStorage.setItem(CLAVE_SESSION, id);
  } catch {
    /* sin persistencia disponible: no es un error fatal */
  }
}

/** Resuelve el perfil inicial aplicando la cascada URL → sessionStorage → defecto. */
export function resolverPerfilInicial(): PerfilId {
  return leerPerfilDeUrl() ?? leerPerfilDeSession() ?? PERFIL_POR_DEFECTO;
}

/* ── Estado ─────────────────────────────────────────────────── */

let perfilActual: PerfilId = resolverPerfilInicial();

export function getPerfilActivo(): PerfilId {
  return perfilActual;
}

export function getContenidoActivo(): PerfilContenido {
  return PERFILES[perfilActual];
}

/* ── Construcción de URLs ───────────────────────────────────── */

/** Devuelve la query string canónica del perfil: `?perfil=periodista`. */
export function construirSearch(id: PerfilId = perfilActual): string {
  return `?${PARAM_PERFIL}=${id}`;
}

/**
 * Reescribe una URL conservando su path y su hash, y fijando `?perfil=`.
 * Mantiene cualquier otro parámetro que ya viniera en la query.
 */
export function construirUrlConPerfil(id: PerfilId, url: string = enNavegador ? window.location.href : '/'): string {
  const destino = new URL(url, enNavegador ? window.location.origin : 'http://localhost');
  destino.searchParams.set(PARAM_PERFIL, id);
  return `${destino.pathname}${destino.search}${destino.hash}`;
}

/* ── Suscripción ────────────────────────────────────────────── */

type Desuscribir = () => void;

export function suscribir(callback: () => void): Desuscribir {
  if (!enNavegador) return () => {};
  window.addEventListener(EVENTO_CAMBIO, callback);
  return () => window.removeEventListener(EVENTO_CAMBIO, callback);
}

function notificar(): void {
  if (!enNavegador) return;
  window.dispatchEvent(new Event(EVENTO_CAMBIO));
}

/* ── Escritura ──────────────────────────────────────────────── */

interface OpcionesCambio {
  /**
   * `push`    → nueva entrada en el historial (el botón Atrás vuelve al perfil anterior).
   * `replace` → reescribe la entrada actual (usado en la sincronización inicial).
   */
  modo?: 'push' | 'replace';
}

/**
 * Cambia el perfil activo: actualiza el estado, la URL (sin recargar) y
 * `sessionStorage`, y avisa a los suscriptores.
 */
export function setPerfilActivo(id: PerfilId, { modo = 'push' }: OpcionesCambio = {}): void {
  if (!esPerfilValido(id)) return;

  const cambioDeValor = perfilActual !== id;
  perfilActual = id;
  guardarEnSession(id);

  if (enNavegador) {
    const nuevaUrl = construirUrlConPerfil(id);
    if (nuevaUrl !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      if (modo === 'push') {
        window.history.pushState({ [PARAM_PERFIL]: id }, '', nuevaUrl);
      } else {
        window.history.replaceState({ [PARAM_PERFIL]: id }, '', nuevaUrl);
      }
    }
  }

  if (cambioDeValor) notificar();
}

/**
 * Sincroniza el estado con lo que dice la URL. Se llama al montar y ante
 * `popstate` (botones Atrás/Adelante del navegador).
 */
export function sincronizarDesdeUrl(): void {
  const deUrl = leerPerfilDeUrl();
  if (deUrl) {
    if (deUrl !== perfilActual) {
      perfilActual = deUrl;
      guardarEnSession(deUrl);
      notificar();
    }
    return;
  }
  // La URL perdió el parámetro (navegación interna, recarga limpia…):
  // lo reponemos desde el estado actual sin ensuciar el historial.
  setPerfilActivo(perfilActual, { modo: 'replace' });
}

/**
 * Arranque: fija `?perfil=` en la URL actual usando `replaceState` para que
 * la primera entrada del historial ya sea compartible, y engancha `popstate`.
 * Idempotente: llamarla dos veces (StrictMode) no duplica listeners.
 */
let inicializado = false;
export function inicializarPerfil(): void {
  if (!enNavegador || inicializado) return;
  inicializado = true;
  window.addEventListener('popstate', sincronizarDesdeUrl);
  setPerfilActivo(resolverPerfilInicial(), { modo: 'replace' });
}
