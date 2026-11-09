import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent as KeyboardEventReact, TouchEvent } from 'react';
import type { AlbumListo } from '../../types/galeria';
import PortadaPost from '../post/PortadaPost';
import PostVivo from '../post/PostVivo';
import {
  IconBook,
  IconCarousel,
  IconChevronLeft,
  IconChevronRight,
  IconClose,
  IconExpand,
  IconExternalLink,
  IconInstagram,
  IconLocation,
  IconPause,
  IconPlay,
  IconShrink,
} from '../icons';
import { formatearFechaCorta, formatearFechaLarga, formatearMes } from '../../lib/galeria';
import { NOMBRE_CUENTA } from '../../lib/posts';
import { useEscalaAjustada } from '../../hooks/useEscalaAjustada';
import { useEstadoEmbed } from '../../hooks/useEstadoEmbed';
import { useFocoRetenido } from '../../hooks/useFocoRetenido';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { usePantallaCompleta } from '../../hooks/usePantallaCompleta';
import { useReinicios } from '../../hooks/useReinicios';
import { useYaCargados } from '../../hooks/useYaCargados';
import styles from './ProyeccionAlbumes.module.css';

interface Props {
  albumes: AlbumListo[];
  /** Álbum proyectado; `albumes.length` es la placa de fin y `null` cierra la sala. */
  indice: number | null;
  /** Abierta desde una tarjeta: espera 2 s antes de empezar a contar. */
  cortesia?: boolean;
  onCambiar: (indice: number) => void;
  onCerrar: () => void;
  /** Lleva a la página del libro de fotos (sin ella, la placa final no lo ofrece). */
  onVerLibro?: () => void;
}

/** Segundos que se proyecta cada álbum antes de pasar al siguiente. */
const SEGUNDOS_POR_ALBUM = 16;

/** El embed recortado mide esto (4:5); se agranda desde afuera con `scale`. */
const ANCHO_PANTALLA = 538;
const ALTO_PANTALLA = 672.5;

/** Álbum de fotos apaisadas: el embed a 540 px con la foto en 16:9. */
const ANCHO_PANORAMICA = 540;
const ALTO_PANORAMICA = 540 * (9 / 16);

/** Más allá, las fotos del embed (pensadas para 540 px) se ven blandas. */
const ESCALA_MAXIMA = 1.8;

/** Si el álbum no avisa que cargó, el tiempo empieza a correr igual. */
const ESPERA_RESPALDO_MS = 6000;

/** Segundos sin mover el puntero antes de atenuar los controles. */
const INACTIVIDAD_MS = 3000;

const CLAVE_GUIA = 'galeria-guia-vista';

function yaVioLaGuia() {
  try {
    return sessionStorage.getItem(CLAVE_GUIA) === '1';
  } catch {
    return true;
  }
}

function marcarGuiaVista() {
  try {
    sessionStorage.setItem(CLAVE_GUIA, '1');
  } catch {
    /* Sin almacenamiento (modo privado): la guía puede repetirse. */
  }
}

const dosDigitos = (n: number) => String(n).padStart(2, '0');

/**
 * Modo proyección «pantalla gigante»: una sala de cine oscura donde el
 * álbum (el carrusel real de Instagram) se proyecta lo más grande posible.
 * Las fotos se pasan con las flechas propias del álbum; la sala pasa de un
 * álbum a otro sola (barras arriba), con flechas, teclado, gestos o la tira
 * de abajo. Los álbumes viven todos en el mismo lugar del DOM y solo se
 * mueven con CSS: ningún iframe se recarga al ir y volver.
 */
export default function ProyeccionAlbumes({ albumes, indice, cortesia = false, onCambiar, onCerrar, onVerLibro }: Props) {
  const total = albumes.length;
  const abierto = indice != null;
  const enFin = indice === total;
  const posicion = indice == null ? 0 : Math.min(indice, total - 1);
  const album = albumes[posicion];

  const dialogoRef = useRef<HTMLDialogElement>(null);
  const escenarioRef = useRef<HTMLDivElement>(null);
  const actualRef = useRef<HTMLDivElement>(null);
  const cerrarRef = useRef<HTMLButtonElement>(null);
  const tiraRef = useRef<HTMLOListElement>(null);
  const toque = useRef<{ x: number; y: number; enBarra: boolean } | null>(null);
  const temporizadorInactivo = useRef(0);

  const reducido = useMediaQuery('(prefers-reduced-motion: reduce)');
  const escritorio = useMediaQuery('(min-width: 901px)');
  const conPuntero = useMediaQuery('(hover: hover)');
  const pantalla = usePantallaCompleta(dialogoRef);
  const { marcar, soltar, clave } = useReinicios();
  // Un botón que el clic deja deshabilitado (o la ficha que re-entra) no
  // debe dejar el foco en <body>: las flechas del teclado seguirían muertas.
  useFocoRetenido(dialogoRef, abierto);

  const [pausadoPorUsuario, setPausadoPorUsuario] = useState(false);
  const [pausadoPorToque, setPausadoPorToque] = useState(false);
  const [encima, setEncima] = useState(false);
  const [oculto, setOculto] = useState(false);
  const [esperandoCortesia, setEsperandoCortesia] = useState(false);
  const [esperaVencida, setEsperaVencida] = useState<number | null>(null);
  const [manual, setManual] = useState(true);
  const [inactivo, setInactivo] = useState(false);
  const [guia, setGuia] = useState(false);
  const [abiertoAntes, setAbiertoAntes] = useState(false);
  // Una vez abierta, la sala queda montada (el <dialog> cerrado no se ve):
  // los álbumes ya cargados no se recargan al volver a abrir.
  const [usada, setUsada] = useState(false);

  // Cada apertura empieza limpia (patrón de React: ajuste durante el render).
  if (abierto !== abiertoAntes) {
    setAbiertoAntes(abierto);
    if (abierto) {
      setUsada(true);
      setPausadoPorUsuario(false);
      setPausadoPorToque(false);
      setEncima(false);
      setEsperandoCortesia(cortesia);
      setManual(true);
      setInactivo(false);
    }
  }

  // En escritorio la pantalla deja lugar a las laterales; se mide el escenario.
  const escalaVertical = useEscalaAjustada(
    escenarioRef,
    escritorio ? ANCHO_PANTALLA * 1.7 : ANCHO_PANTALLA,
    ALTO_PANTALLA,
    ESCALA_MAXIMA,
    abierto,
  );
  const escalaPanoramica = useEscalaAjustada(
    escenarioRef,
    escritorio ? ANCHO_PANORAMICA * 1.35 : ANCHO_PANORAMICA,
    ALTO_PANORAMICA,
    ESCALA_MAXIMA,
    abierto,
  );

  /** Medidas de la pantalla de un álbum (vertical o panorámica). */
  const medidasDe = (a: AlbumListo): CSSProperties => {
    const panoramica = a.orientacion === 'horizontal';
    const escala = panoramica ? escalaPanoramica : escalaVertical;
    const ancho = panoramica ? ANCHO_PANORAMICA : ANCHO_PANTALLA;
    const alto = panoramica ? ALTO_PANORAMICA : ALTO_PANTALLA;
    return {
      '--escala': escala,
      '--base-ancho': `${ancho}px`,
      '--base-alto': `${alto}px`,
      '--ancho': `${ancho * escala}px`,
      '--alto': `${alto * escala}px`,
    } as CSSProperties;
  };

  const yaCargado = useYaCargados(abierto ? posicion : -10, 1);
  const claveActual = album ? clave(album.post.url) : '';
  const estadoActual = useEstadoEmbed(actualRef, abierto && yaCargado(posicion), claveActual);
  const listo = estadoActual !== 'cargando' || esperaVencida === posicion;

  const pausadoFijo = pausadoPorUsuario || pausadoPorToque || reducido;
  const detenido = !abierto || enFin || pausadoFijo || encima || oculto || !listo || esperandoCortesia;

  // Abre y cierra el <dialog> nativo según `indice`.
  useEffect(() => {
    const dialogo = dialogoRef.current;
    if (!dialogo) return;
    if (abierto && !dialogo.open) {
      dialogo.showModal();
      cerrarRef.current?.focus();
    }
    if (!abierto && dialogo.open) dialogo.close();
  }, [abierto]);

  // Mientras está abierta, la página de atrás no se desplaza.
  useEffect(() => {
    if (!abierto) return;
    const raiz = document.documentElement;
    const previo = raiz.style.overflow;
    raiz.style.overflow = 'hidden';
    return () => {
      raiz.style.overflow = previo;
    };
  }, [abierto]);

  // Pestaña oculta: pausa temporal.
  useEffect(() => {
    if (!abierto) return;
    const alCambiar = () => setOculto(document.visibilityState === 'hidden');
    document.addEventListener('visibilitychange', alCambiar);
    return () => document.removeEventListener('visibilitychange', alCambiar);
  }, [abierto]);

  // Cortesía al abrir desde una tarjeta: 2 s antes de empezar a contar.
  useEffect(() => {
    if (!abierto || !esperandoCortesia) return;
    const espera = window.setTimeout(() => setEsperandoCortesia(false), 2000);
    return () => clearTimeout(espera);
  }, [abierto, esperandoCortesia]);

  // Respaldo: si el álbum no avisa que cargó, el tiempo corre igual.
  useEffect(() => {
    if (!abierto || enFin) return;
    const espera = window.setTimeout(() => setEsperaVencida(posicion), ESPERA_RESPALDO_MS);
    return () => clearTimeout(espera);
  }, [abierto, enFin, posicion]);

  // La tira de abajo sigue al álbum actual.
  useEffect(() => {
    const tira = tiraRef.current;
    const activo = tira?.querySelector<HTMLElement>('[aria-current="true"]');
    if (!abierto || !tira || !activo) return;
    tira.scrollTo({
      left: activo.offsetLeft - tira.clientWidth / 2 + activo.clientWidth / 2,
      behavior: reducido ? 'auto' : 'smooth',
    });
  }, [abierto, posicion, reducido]);

  // Pulso guía (una vez por sesión): señala las flechas del álbum.
  const listoDeVerdad = estadoActual === 'listo';
  useEffect(() => {
    if (!abierto || !listoDeVerdad || reducido || yaVioLaGuia()) return;
    const mostrar = window.setTimeout(() => {
      marcarGuiaVista();
      setGuia(true);
    }, 900);
    const ocultar = window.setTimeout(() => setGuia(false), 900 + 3500);
    return () => {
      clearTimeout(mostrar);
      clearTimeout(ocultar);
    };
  }, [abierto, listoDeVerdad, reducido]);

  // Atenúa los controles tras unos segundos sin mover el puntero (escritorio).
  const despertar = useCallback(() => {
    setInactivo(false);
    clearTimeout(temporizadorInactivo.current);
    if (!conPuntero) return;
    temporizadorInactivo.current = window.setTimeout(() => setInactivo(true), INACTIVIDAD_MS);
  }, [conPuntero]);

  useEffect(() => () => clearTimeout(temporizadorInactivo.current), []);

  const ir = useCallback(
    (destino: number, porUsuario = true) => {
      const nuevo = Math.min(Math.max(destino, 0), total);
      setPausadoPorToque(false);
      setManual(porUsuario);
      // El álbum que pudo quedar sonando se destruye (cambia su `key`).
      soltar(albumes[nuevo]?.post.url);
      onCambiar(nuevo);
    },
    [albumes, onCambiar, soltar, total],
  );

  const cerrar = () => {
    soltar();
    pantalla.salir();
    onCerrar();
  };

  const alternarPausa = () => {
    if (pausadoFijo) {
      setPausadoPorUsuario(false);
      setPausadoPorToque(false);
    } else {
      setPausadoPorUsuario(true);
    }
  };

  const alPulsar = (e: KeyboardEventReact<HTMLDialogElement>) => {
    despertar();
    if (indice == null) return;
    const objetivo = e.target as HTMLElement;
    const enControl = objetivo.closest('button, a') != null;
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        ir(indice + 1);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        ir(indice - 1);
        break;
      case 'Home':
        e.preventDefault();
        ir(0);
        break;
      case 'End':
        e.preventDefault();
        ir(total - 1);
        break;
      case ' ':
      case 'k':
      case 'K':
        if (enControl && e.key === ' ') return;
        e.preventDefault();
        if (!reducido) alternarPausa();
        break;
      case 'f':
      case 'F':
        if (pantalla.soportada) {
          e.preventDefault();
          pantalla.alternar();
        }
        break;
    }
  };

  // Deslizar a los lados fuera del álbum cambia de álbum; hacia abajo en la
  // barra superior (celular) cierra la sala.
  const alEmpezarToque = (e: TouchEvent) => {
    const t = e.touches[0];
    const enBarra = (e.target as HTMLElement).closest('[data-barra]') != null;
    toque.current = { x: t.clientX, y: t.clientY, enBarra };
  };
  const alTerminarToque = (e: TouchEvent) => {
    const inicio = toque.current;
    toque.current = null;
    if (!inicio || indice == null) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - inicio.x;
    const dy = t.clientY - inicio.y;
    if (inicio.enBarra && dy > 90 && dy > Math.abs(dx)) {
      cerrar();
      return;
    }
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) ir(indice + (dx < 0 ? 1 : -1));
  };

  const fotos = album?.fotos;
  const anuncio = enFin
    ? 'Fin de la proyección'
    : album
      ? `Álbum ${posicion + 1} de ${total}: ${album.titulo}, ${formatearFechaLarga(album.fecha)}`
      : '';

  return (
    <dialog
      ref={dialogoRef}
      className={styles.dialogo}
      aria-label="Proyección de álbumes"
      tabIndex={-1}
      onClose={cerrar}
      onKeyDown={alPulsar}
      onPointerMove={despertar}
      onFocus={despertar}
    >
      {usada && album && (
        <div
          className={styles.sala}
          data-cuenta={album.cuenta}
          data-inactivo={inactivo || undefined}
          data-fin={enFin || undefined}
          data-reducido={reducido || undefined}
          aria-roledescription="presentación"
          onTouchStart={alEmpezarToque}
          onTouchEnd={alTerminarToque}
        >
          <div className={styles.decorado} aria-hidden="true">
            <span className={styles.cortina} data-lado="izquierda" />
            <span className={styles.cortina} data-lado="derecha" />
            <span className={styles.haz} />
            <span className={styles.polvo} />
            <span key={posicion} className={styles.numero}>
              {dosDigitos(posicion + 1)}
            </span>
          </div>

          {/* Barras de avance, una por álbum (como las historias del Top). */}
          <div className={styles.segmentos}>
            {albumes.map((a, i) => (
              <button
                key={a.codigo}
                type="button"
                className={styles.segmento}
                data-estado={enFin || i < posicion ? 'visto' : i === posicion ? 'activo' : 'pendiente'}
                onClick={() => ir(i)}
                aria-label={`Ir al álbum ${i + 1}: ${a.titulo}`}
              >
                <span className={styles.carril}>
                  <span
                    className={styles.relleno}
                    style={
                      i === posicion && !enFin
                        ? {
                            animationDuration: `${SEGUNDOS_POR_ALBUM}s`,
                            animationPlayState: detenido ? 'paused' : 'running',
                          }
                        : undefined
                    }
                    onAnimationEnd={i === posicion && !enFin ? () => ir(posicion + 1, false) : undefined}
                  />
                </span>
              </button>
            ))}
          </div>

          <header className={styles.barra} data-barra="">
            <p className={styles.contador}>
              <strong>
                {enFin ? 'Fin' : `${dosDigitos(posicion + 1)} / ${dosDigitos(total)}`}
              </strong>
              {!enFin && (
                <>
                  <span className={styles.barraTitulo}>{album.titulo}</span>
                  <span className={styles.barraFecha}>· {formatearFechaCorta(album.fecha)}</span>
                </>
              )}
            </p>
            <div className={styles.botones}>
              {!reducido && (
                <button
                  type="button"
                  className={styles.control}
                  onClick={alternarPausa}
                  disabled={enFin}
                  aria-pressed={pausadoFijo}
                  aria-label={pausadoFijo ? 'Reanudar el avance automático' : 'Pausar el avance automático'}
                >
                  {pausadoFijo ? <IconPlay size={18} /> : <IconPause size={18} />}
                </button>
              )}
              {pantalla.soportada && (
                <button
                  type="button"
                  className={styles.control}
                  onClick={pantalla.alternar}
                  aria-pressed={pantalla.activa}
                  aria-label={pantalla.activa ? 'Salir de pantalla completa' : 'Pantalla completa'}
                >
                  {pantalla.activa ? <IconShrink size={18} /> : <IconExpand size={18} />}
                </button>
              )}
              <button ref={cerrarRef} type="button" className={styles.control} onClick={cerrar} aria-label="Cerrar la proyección">
                <IconClose size={20} />
              </button>
            </div>
          </header>

          <div
            ref={escenarioRef}
            className={styles.escenario}
            style={medidasDe(album)}
          >
            <span className={styles.halo} aria-hidden="true" />

            {albumes.map((a, i) => {
              const offset = Math.max(-2, Math.min(2, i - posicion));
              const distancia = Math.abs(offset);
              const actual = i === posicion;
              const cargado = yaCargado(i);
              return (
                <div
                  key={a.codigo}
                  ref={actual ? actualRef : undefined}
                  className={styles.diapositiva}
                  data-cuenta={a.cuenta}
                  data-actual={actual || undefined}
                  data-lejos={distancia >= 2 || undefined}
                  data-panoramica={a.orientacion === 'horizontal' || undefined}
                  style={{ ...medidasDe(a), '--offset': offset, '--distancia': distancia } as CSSProperties}
                  aria-roledescription="diapositiva"
                  aria-label={`Álbum ${i + 1} de ${total}: ${a.titulo}`}
                  aria-hidden={!actual || enFin || undefined}
                  inert={!actual || enFin}
                  onPointerEnter={(e) => actual && e.pointerType === 'mouse' && setEncima(true)}
                  onPointerLeave={() => actual && setEncima(false)}
                >
                  <div className={styles.lienzo}>
                    <PortadaPost post={a.post} />
                    {cargado && (
                      <PostVivo
                        key={clave(a.post.url)}
                        post={a.post}
                        interactivo={actual && !enFin}
                        onTocado={() => {
                          marcar(a.post.url);
                          setPausadoPorToque(true);
                        }}
                      />
                    )}
                  </div>
                  {actual && estadoActual === 'fallo' && (
                    <div className={styles.fallo}>
                      <a href={a.post.url} target="_blank" rel="noopener noreferrer" className={styles.enlaceFallo}>
                        <IconInstagram size={16} /> Ver el álbum en Instagram <IconExternalLink size={13} />
                      </a>
                      <p>No pudimos mostrar el álbum aquí. Puede que tu navegador esté bloqueando Instagram.</p>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Pantallas laterales: llevan a ese álbum (fuera del DOM de los iframes). */}
            {!enFin && escritorio && posicion > 0 && (
              <button
                type="button"
                className={`${styles.capaIr} ${styles.capaAnterior}`}
                tabIndex={-1}
                onClick={() => ir(posicion - 1)}
                aria-label={`Ir al álbum anterior: ${albumes[posicion - 1].titulo}`}
              />
            )}
            {!enFin && escritorio && posicion < total - 1 && (
              <button
                type="button"
                className={`${styles.capaIr} ${styles.capaSiguiente}`}
                tabIndex={-1}
                onClick={() => ir(posicion + 1)}
                aria-label={`Ir al álbum siguiente: ${albumes[posicion + 1].titulo}`}
              />
            )}

            <span className={styles.reflejo} aria-hidden="true" />

            {guia && !enFin && (
              <span className={styles.guia} aria-hidden="true">
                <span className={styles.guiaAnillo} />
                <span className={styles.guiaTexto}>Pasa las fotos aquí →</span>
              </span>
            )}

            {pausadoPorToque && !enFin && !pausadoPorUsuario && !reducido && (
              <p className={styles.aviso}>
                En pausa mientras miras el álbum
                <button type="button" onClick={() => setPausadoPorToque(false)}>
                  Seguir
                </button>
              </p>
            )}

            <button
              type="button"
              className={`${styles.flecha} ${styles.flechaAnterior}`}
              onClick={() => ir((indice ?? 0) - 1)}
              disabled={posicion === 0 && !enFin}
              aria-label="Álbum anterior"
            >
              <IconChevronLeft size={26} />
            </button>
            <button
              type="button"
              className={`${styles.flecha} ${styles.flechaSiguiente}`}
              onClick={() => ir((indice ?? 0) + 1)}
              disabled={enFin}
              aria-label="Álbum siguiente"
            >
              <IconChevronRight size={26} />
            </button>

            {enFin && (
              <div className={styles.placaFin}>
                <h2>Fin de la proyección</h2>
                <p>
                  {total} álbumes de fotos, entre el {formatearFechaLarga(albumes[total - 1].fecha)} y el{' '}
                  {formatearFechaLarga(albumes[0].fecha)}.
                </p>
                <div className={styles.finAcciones}>
                  <button type="button" className={styles.botonPrincipal} onClick={() => ir(0)}>
                    <IconPlay size={16} /> Volver a empezar
                  </button>
                  {onVerLibro && (
                    <button
                      type="button"
                      className={styles.botonSecundario}
                      onClick={() => {
                        soltar();
                        pantalla.salir();
                        onVerLibro();
                      }}
                    >
                      <IconBook size={16} /> Ver el libro de fotos
                    </button>
                  )}
                  <button type="button" className={styles.botonSecundario} onClick={cerrar}>
                    Ver la línea de tiempo
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Ficha del álbum: re-entra al cambiar (key). */}
          <div className={styles.ficha} key={enFin ? 'fin' : posicion}>
            {!enFin && (
              <>
                <p className={styles.fichaMeta}>
                  {fotos != null && (
                    <span className={styles.fichaFotos}>
                      <IconCarousel size={14} /> {fotos} fotos
                      <span className={styles.soloEscritorio}> · pásalas con las flechas del álbum</span>
                      <span className={styles.soloMovil}> · desliza dentro del álbum</span>
                    </span>
                  )}
                  <span>{formatearFechaLarga(album.fecha)}</span>
                </p>
                <h2 className={styles.fichaTitulo}>{album.titulo}</h2>
                <p className={styles.fichaLugar}>
                  {album.lugar && (
                    <>
                      <IconLocation size={14} /> {album.lugar} ·{' '}
                    </>
                  )}
                  {NOMBRE_CUENTA[album.cuenta] ?? album.cuenta} · @{album.cuenta}
                  <a href={album.post.url} target="_blank" rel="noopener noreferrer" className={styles.instagram}>
                    Ver en Instagram <IconExternalLink size={12} />
                  </a>
                </p>
              </>
            )}
            <div className={styles.navegacion}>
              <button type="button" onClick={() => ir((indice ?? 0) - 1)} disabled={posicion === 0 && !enFin} aria-label="Álbum anterior">
                <IconChevronLeft size={20} />
              </button>
              <span>{enFin ? 'Fin' : `${dosDigitos(posicion + 1)} / ${dosDigitos(total)}`}</span>
              <button type="button" onClick={() => ir((indice ?? 0) + 1)} disabled={enFin} aria-label="Álbum siguiente">
                <IconChevronRight size={20} />
              </button>
            </div>
          </div>

          <ol ref={tiraRef} className={styles.tira} aria-label="Ir a un álbum">
            {albumes.map((a, i) => (
              <li key={a.codigo}>
                <button
                  type="button"
                  className={styles.tiraBoton}
                  data-cuenta={a.cuenta}
                  aria-current={!enFin && i === posicion}
                  onClick={() => ir(i)}
                  title={a.titulo}
                  aria-label={`Álbum ${i + 1}: ${a.titulo}`}
                >
                  <span className={styles.tiraMini}>
                    <PortadaPost post={a.post} />
                  </span>
                  <span className={styles.tiraCarril}>
                    <span
                      className={styles.tiraRelleno}
                      data-estado={enFin || i < posicion ? 'visto' : i === posicion ? 'activo' : 'pendiente'}
                      style={
                        i === posicion && !enFin
                          ? {
                              animationDuration: `${SEGUNDOS_POR_ALBUM}s`,
                              animationPlayState: detenido ? 'paused' : 'running',
                            }
                          : undefined
                      }
                    />
                  </span>
                  <span className={styles.tiraFecha}>
                    {formatearMes(a.fecha)} {a.fecha.slice(2, 4)}
                  </span>
                </button>
              </li>
            ))}
          </ol>

          <p className={styles.ayuda}>
            <span className={styles.soloEscritorio}>← → cambiar de álbum · Espacio pausa · F pantalla completa · Esc salir</span>
            <span className={styles.srOnly}> Para volver a los controles, presiona Tab o haz clic fuera del álbum.</span>
          </p>

          <p className={styles.srOnly} aria-live={manual ? 'polite' : 'off'}>
            {anuncio}
          </p>
        </div>
      )}
    </dialog>
  );
}
