import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { AlbumListo } from '../../types/galeria';
import PortadaPost from '../post/PortadaPost';
import PostVivo from '../post/PostVivo';
import { IconCarousel, IconExternalLink, IconLocation, IconPlay } from '../icons';
import { formatearFechaLarga, formatearMes } from '../../lib/galeria';
import { NOMBRE_CUENTA } from '../../lib/posts';
import { useCerca } from '../../hooks/useCerca';
import { useEstadoEmbed } from '../../hooks/useEstadoEmbed';
import styles from './LineaTiempo.module.css';

interface Props {
  /** Álbumes en el orden de la línea (del más reciente al más antiguo). */
  albumes: AlbumListo[];
  /** Abre el modo proyección en el álbum `i` de `albumes`. */
  onProyectar: (i: number) => void;
  /** Mientras la proyección ocupa la pantalla, las tarjetas no cargan sus
      embeds (la sala tiene prioridad); al cerrarla empiezan a cargar. */
  cargarEmbeds?: boolean;
}

function TarjetaAlbum({ album, cargar, onProyectar }: { album: AlbumListo; cargar: boolean; onProyectar: () => void }) {
  const { ref, cerca } = useCerca<HTMLDivElement>('600px', true);
  const montado = cerca && cargar;
  const estado = useEstadoEmbed(ref, montado);
  const fotos = album.fotos ? `, ${album.fotos} fotos` : '';

  return (
    <div
      ref={ref}
      className={styles.tarjeta}
      data-cuenta={album.cuenta}
      data-estado={estado}
      data-horizontal={album.orientacion === 'horizontal' || undefined}
    >
      <PortadaPost post={album.post} />
      {/* Interactivo: el carrusel se pasa ahí mismo con sus flechas. */}
      {montado && <PostVivo post={album.post} interactivo />}
      {album.fotos != null && (
        <span className={styles.sello} aria-hidden="true">
          <IconCarousel size={12} /> {album.fotos}
        </span>
      )}
      <button
        type="button"
        className={styles.abrir}
        onClick={onProyectar}
        aria-label={`Proyectar el álbum: ${album.titulo}${fotos}`}
      >
        <span className={styles.destello} aria-hidden="true" />
        <span className={styles.proyectar}>
          <IconPlay size={14} /> Proyectar
        </span>
      </button>
      {estado === 'fallo' && (
        <a href={album.post.url} target="_blank" rel="noopener noreferrer" className={styles.enlaceFallo}>
          Ver el álbum en Instagram <IconExternalLink size={12} />
        </a>
      )}
    </div>
  );
}

/**
 * Línea de tiempo vertical de los álbumes, del más reciente al más
 * antiguo. Un eje luminoso baja por el centro (a la izquierda en tablet y
 * celular) y se va llenando con el scroll; los álbumes alternan de lado en
 * escritorio. El nodo que cruza la mitad de la pantalla se enciende y tiñe
 * el fondo con los colores de su cuenta. Tocar un álbum lo proyecta.
 */
export default function LineaTiempo({ albumes, onProyectar, cargarEmbeds = true }: Props) {
  const pistaRef = useRef<HTMLDivElement>(null);
  const [activo, setActivo] = useState(0);
  const [progreso, setProgreso] = useState(0);

  // Progreso del eje y nodo activo: lo que ya pasó por la mitad de la pantalla.
  useEffect(() => {
    const pista = pistaRef.current;
    if (!pista) return;
    let cuadro = 0;
    const medir = () => {
      cuadro = 0;
      const mitad = window.innerHeight / 2;
      const caja = pista.getBoundingClientRect();
      setProgreso(caja.height > 0 ? Math.min(1, Math.max(0, (mitad - caja.top) / caja.height)) : 0);
      let ultimo = 0;
      pista.querySelectorAll<HTMLElement>('[data-nodo]').forEach((nodo, i) => {
        if (nodo.getBoundingClientRect().top <= mitad) ultimo = i;
      });
      setActivo(ultimo);
    };
    const pedir = () => {
      if (!cuadro) cuadro = window.requestAnimationFrame(medir);
    };
    medir();
    window.addEventListener('scroll', pedir, { passive: true });
    window.addEventListener('resize', pedir);
    return () => {
      window.removeEventListener('scroll', pedir);
      window.removeEventListener('resize', pedir);
      cancelAnimationFrame(cuadro);
    };
  }, []);

  const albumActivo = albumes[activo];

  return (
    <div
      className={styles.linea}
      data-cuenta={albumActivo?.cuenta ?? 'lamartineris'}
      style={{ '--progreso': progreso } as CSSProperties}
    >
      <div className={styles.fondo} aria-hidden="true">
        <div className={styles.fondoFijo}>
          <span className={styles.mancha} />
          <span className={styles.mancha} />
        </div>
      </div>

      <div ref={pistaRef} className={styles.recorrido}>
        <span className={styles.eje} aria-hidden="true">
          <span className={styles.ejeRelleno} />
          <span className={styles.ejeCabeza} />
        </span>

        <ol className={styles.pista}>
          {albumes.map((album, i) => {
            const anio = album.fecha.slice(0, 4);
            const cambiaAnio = i === 0 || albumes[i - 1].fecha.slice(0, 4) !== anio;
            const lado = i % 2 === 0 ? 'izquierda' : 'derecha';
            const estado = i === activo ? 'activo' : i < activo ? 'pasado' : undefined;
            return (
              <li
                key={album.codigo}
                className={styles.hito}
                data-lado={lado}
                data-estado={estado}
                data-cuenta={album.cuenta}
                data-horizontal={album.orientacion === 'horizontal' || undefined}
              >
                {cambiaAnio && (
                  <div className={styles.anio} aria-hidden="true">
                    <span className={styles.anioFondo}>{anio}</span>
                    <span className={styles.anioPastilla}>{anio}</span>
                  </div>
                )}

                <div className={styles.marca} data-nodo="">
                  <span className={styles.nodo} aria-hidden="true" />
                  <time className={styles.fecha} dateTime={album.fecha}>
                    <span className={styles.dia}>{Number(album.fecha.slice(8, 10))}</span>
                    <span className={styles.mes}>
                      {formatearMes(album.fecha)} {anio}
                    </span>
                  </time>
                </div>

                <article className={`${styles.contenido} revelar`} aria-labelledby={`album-${album.codigo}`}>
                  <TarjetaAlbum album={album} cargar={cargarEmbeds} onProyectar={() => onProyectar(i)} />
                  <div className={styles.ficha}>
                    <p className={styles.meta}>
                      {album.fotos != null && (
                        <span>
                          <IconCarousel size={13} /> {album.fotos} fotos
                        </span>
                      )}
                      <span>{formatearFechaLarga(album.fecha)}</span>
                    </p>
                    <h3 id={`album-${album.codigo}`} className={styles.titulo}>
                      {album.titulo}
                    </h3>
                    <p className={styles.lugar}>
                      {album.lugar && (
                        <span>
                          <IconLocation size={13} /> {album.lugar}
                        </span>
                      )}
                      <span>
                        {NOMBRE_CUENTA[album.cuenta] ?? album.cuenta} · @{album.cuenta}
                      </span>
                    </p>
                    {album.descripcion && <p className={styles.descripcion}>{album.descripcion}</p>}
                    <div className={styles.acciones}>
                      <button type="button" className={styles.botonProyectar} onClick={() => onProyectar(i)}>
                        <IconPlay size={14} /> Ver en pantalla gigante
                      </button>
                      <a
                        href={album.post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.enlace}
                        aria-label={`Ver en Instagram: ${album.titulo} (se abre en una pestaña nueva)`}
                      >
                        Instagram <IconExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
