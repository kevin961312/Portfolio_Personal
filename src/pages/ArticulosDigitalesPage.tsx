import { useEffect, useMemo, useState } from 'react';
import { articulosDigitales } from '../data/articulos-digitales';
import EncabezadoPagina from '../components/EncabezadoPagina';
import VisorImagen from '../components/VisorImagen';
import type { ImagenVisor } from '../components/VisorImagen';
import { IconExternalLink, IconNewspaper } from '../components/icons';
import { seccionDesdeUrl } from '../lib/articulos';
import { rutaPublica } from '../lib/rutas';
import { usePerfil } from '../hooks/usePerfil';
import styles from './ArticulosDigitalesPage.module.css';

/* `fecha` es ISO, así que compararla como texto ya ordena bien. */
const articulos = [...articulosDigitales]
  .sort((a, b) => b.fecha.localeCompare(a.fecha))
  .map((a) => ({ ...a, seccion: seccionDesdeUrl(a.url) }));

const SECCIONES = [...new Set(articulos.map((a) => a.seccion))];

export default function ArticulosDigitalesPage() {
  const { perfil } = usePerfil();
  const [seccion, setSeccion] = useState('todas');
  const [soloImpresos, setSoloImpresos] = useState(false);
  const [volteados, setVolteados] = useState<Set<string>>(new Set());
  const [ampliada, setAmpliada] = useState<ImagenVisor | null>(null);

  useEffect(() => {
    document.title = `Artículos digitales · ${perfil.tituloDocumento}`;
  }, [perfil.tituloDocumento]);

  const lista = useMemo(
    () =>
      articulos
        .filter((a) => seccion === 'todas' || a.seccion === seccion)
        .filter((a) => !soloImpresos || a.impreso),
    [seccion, soloImpresos],
  );

  const voltear = (url: string) =>
    setVolteados((previos) => {
      const siguientes = new Set(previos);
      if (siguientes.has(url)) siguientes.delete(url);
      else siguientes.add(url);
      return siguientes;
    });

  return (
    <div className={styles.page}>
      <EncabezadoPagina
        eyebrow="Prensa · EL TIEMPO"
        titulo="Artículos"
        resaltado="digitales"
        lead="Reportería e investigación publicadas en eltiempo.com: justicia, política, ciudad y cultura, con enfoque de género y derechos humanos."
      />

      <div className={styles.barra} role="group" aria-label="Filtrar artículos">
        <button type="button" className={styles.chip} aria-pressed={seccion === 'todas'} onClick={() => setSeccion('todas')}>
          Todas
        </button>
        {SECCIONES.map((s) => (
          <button key={s} type="button" className={styles.chip} aria-pressed={seccion === s} onClick={() => setSeccion(s)}>
            {s}
          </button>
        ))}
        <button
          type="button"
          className={`${styles.chip} ${styles.chipImpreso}`}
          aria-pressed={soloImpresos}
          onClick={() => setSoloImpresos((v) => !v)}
        >
          <IconNewspaper size={14} /> Con versión impresa
        </button>
      </div>

      {lista.length === 0 ? (
        <p className={styles.vacio}>No hay artículos con estos filtros.</p>
      ) : (
        <ul className={styles.revista}>
          {lista.map((a, i) => {
            const volteado = volteados.has(a.url);
            return (
              <li
                key={a.url}
                className={`${styles.item} revelar`}
                data-destacado={(i === 0 && seccion === 'todas' && !soloImpresos) || undefined}
              >
                <article className={styles.tarjeta} data-volteada={volteado || undefined}>
                  {/* Frente: la nota digital. */}
                  <div className={styles.frente} aria-hidden={volteado || undefined}>
                    <div className={styles.imagen}>
                      {a.imagen && <img src={rutaPublica(a.imagen)} alt="" loading="lazy" />}
                      <span className={styles.seccion}>{a.seccion}</span>
                      {a.impreso && (
                        <span className={styles.selloImpreso}>
                          <IconNewspaper size={12} /> Impreso
                        </span>
                      )}
                    </div>
                    <div className={styles.cuerpo}>
                      <p className={styles.medio}>
                        {a.publicacion} · {a.fecha.slice(0, 4)}
                      </p>
                      <h2 className={styles.titulo}>{a.titulo}</h2>
                      <div className={styles.acciones}>
                        <a
                          href={a.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.boton}
                          tabIndex={volteado ? -1 : undefined}
                        >
                          Leer en eltiempo.com <IconExternalLink size={13} />
                        </a>
                        {a.impreso && (
                          <button
                            type="button"
                            className={styles.botonSecundario}
                            onClick={() => voltear(a.url)}
                            tabIndex={volteado ? -1 : undefined}
                          >
                            Ver impreso
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Dorso: la misma nota en papel. */}
                  {a.impreso && (
                    <div className={styles.dorso} aria-hidden={!volteado || undefined}>
                      <button
                        type="button"
                        className={styles.papel}
                        onClick={() => setAmpliada({ src: rutaPublica(a.impreso!), titulo: a.titulo, enlace: a.url })}
                        tabIndex={volteado ? undefined : -1}
                        aria-label={`Ampliar la página impresa: ${a.titulo}`}
                      >
                        <img src={rutaPublica(a.impreso)} alt="" loading="lazy" />
                        <span className={styles.ampliar}>Toca para leerla</span>
                      </button>
                      <div className={styles.dorsoPie}>
                        <span className={styles.medio}>Edición impresa · EL TIEMPO</span>
                        <button
                          type="button"
                          className={styles.botonSecundario}
                          onClick={() => voltear(a.url)}
                          tabIndex={volteado ? undefined : -1}
                        >
                          Volver a la digital
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              </li>
            );
          })}
        </ul>
      )}

      <VisorImagen imagen={ampliada} onCerrar={() => setAmpliada(null)} />
    </div>
  );
}
