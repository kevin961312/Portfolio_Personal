import type { PerfilContenido, PerfilId } from '../types';
import { PERFILES, PERFIL_POR_DEFECTO, esPerfilValido } from '../data/perfiles';

/* ──────────────────────────────────────────────────────────────
   Store del perfil activo.

   Fuente de verdad en este orden:
     1. Query param de la URL  →  ?perf=per  (corto: comu, per, manager;
                                  también se aceptan los enlaces viejos
                                  ?perfil=periodista y se reescriben)
     2. PERFIL_POR_DEFECTO     →  comunicadora (dominio sin parámetro)
   Dentro de la visita, el perfil activo se conserva en memoria al
   navegar aunque un enlace llegue sin el parámetro.

   Es un store externo puro (sin React): la capa de UI se suscribe
   con `useSyncExternalStore`. Así la lógica de ruteo se puede
   probar y reutilizar sin montar un componente.
   ────────────────────────────────────────────────────────────── */

/** Nombre del parámetro en la query string: `?perf=per`. */
export const PARAM_PERFIL = 'perf';

/** Parámetro de los enlaces anteriores (`?perfil=periodista`), aún aceptado. */
const PARAM_PERFIL_ANTIGUO = 'perfil';

/** Valor corto que va en la URL para cada perfil. */
export const CODIGO_PERFIL: Record<PerfilId, string> = {
  comunicadora: 'comu',
  periodista: 'per',
  'community-manager': 'manager',
};

function perfilDesdeCodigo(codigo: string | null): PerfilId | null {
  const encontrado = (Object.keys(CODIGO_PERFIL) as PerfilId[]).find((id) => CODIGO_PERFIL[id] === codigo);
  return encontrado ?? null;
}

/** Clave de `sessionStorage` donde se persiste el perfil elegido. */
const CLAVE_SESSION = 'portafolio:perfil-activo';

/** Evento interno que notifica a los suscriptores. */
const EVENTO_CAMBIO = 'portafolio:perfil-cambio';

const enNavegador = typeof window !== 'undefined';

/* ── Lecturas ───────────────────────────────────────────────── */

/**
 * Lee el perfil de una query string: `?perf=per` o, en enlaces viejos,
 * `?perfil=periodista`. Devuelve `null` si falta o es inválido.
 */
export function leerPerfilDeUrl(search: string = enNavegador ? window.location.search : ''): PerfilId | null {
  const params = new URLSearchParams(search);
  const corto = perfilDesdeCodigo(params.get(PARAM_PERFIL));
  if (corto) return corto;
  const antiguo = params.get(PARAM_PERFIL_ANTIGUO);
  return esPerfilValido(antiguo) ? antiguo : null;
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

/**
 * Resuelve el perfil al abrir el sitio: el de la URL o, si no viene
 * (`https://lamartineris.site` a secas), siempre comunicadora. No se usa
 * sessionStorage aquí para que escribir el dominio sin parámetro nunca
 * abra el último perfil visto en esa pestaña.
 */
export function resolverPerfilInicial(): PerfilId {
  return leerPerfilDeUrl() ?? PERFIL_POR_DEFECTO;
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

/** Devuelve la query string canónica del perfil: `?perf=per`. */
export function construirSearch(id: PerfilId = perfilActual): string {
  return `?${PARAM_PERFIL}=${CODIGO_PERFIL[id]}`;
}

/**
 * Reescribe una URL conservando su path y su hash, y fijando `?perf=`.
 * Quita el parámetro viejo `perfil` y mantiene cualquier otro.
 */
export function construirUrlConPerfil(id: PerfilId, url: string = enNavegador ? window.location.href : '/'): string {
  const destino = new URL(url, enNavegador ? window.location.origin : 'http://localhost');
  destino.searchParams.delete(PARAM_PERFIL_ANTIGUO);
  destino.searchParams.set(PARAM_PERFIL, CODIGO_PERFIL[id]);
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
  // Si la URL perdió el parámetro (navegación interna) se repone desde el
  // estado actual; si trae la forma vieja (`?perfil=…`) se pasa a la corta.
  // Todo con replaceState, sin ensuciar el historial.
  setPerfilActivo(leerPerfilDeUrl() ?? perfilActual, { modo: 'replace' });
}

/**
 * Arranque: fija `?perf=` en la URL actual usando `replaceState` para que
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
