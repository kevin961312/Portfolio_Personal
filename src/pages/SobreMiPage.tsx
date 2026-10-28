import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import {
  IconChevronRight,
  IconInstagram,
  IconLocation,
  IconMail,
  IconNewspaper,
  IconPhone,
  IconPlay,
} from '../components/icons';
import MetricasImpacto from '../components/MetricasImpacto';
import TarjetaPost from '../components/post/TarjetaPost';
import { postsInstagram } from '../data/posts-instagram';
import { porLikes } from '../lib/posts';
import { useReinicios } from '../hooks/useReinicios';
import { usePerfil } from '../hooks/usePerfil';
import styles from './SobreMiPage.module.css';
import fotoLaura from '../assets/sobre-mi/foto-laura.jpeg';

/* Experiencia, proyectos y educación son comunes a las tres versiones de la
   HV; lo único que cambia por perfil es el cargo, que se resuelve contra
   `perfil.cargos[empresa]`. */

interface Trabajo {
  periodo: string;
  empresa: string;
  items: string[];
  /** Cuenta de Instagram donde se publicó su trabajo en redes. */
  cuenta?: string;
  /** Publicó notas en EL TIEMPO (digital e impreso). */
  prensa?: boolean;
  /** Produjo la nota de televisión de la sección Reportaje. */
  tv?: boolean;
}

const experiencias: Trabajo[] = [
  {
    periodo: '2026 – 2026',
    empresa: 'Cuestión Pública',
    items: [
      'Análisis y selección de temas para creación de parrillas de contenido.',
      'Pre producción, producción, edición y publicación de carruseles, reels e historias para Instagram.',
      'Seguimiento de resultados y creación de estrategia.',
    ],
    cuenta: 'cuestionp',
  },
  {
    periodo: '2025 – 2026',
    empresa: 'No Es Hora de Callar · Casa Editorial El Tiempo',
    items: [
      'Investigación y redacción de notas periodísticas para el periódico digital e impreso.',
      'Creación de parrillas de contenido, carruseles, reels e historias para Instagram.',
      'Producción, pietaje y pasos en cámara para programa televisivo.',
    ],
    cuenta: 'eltiempo',
    prensa: true,
  },
  {
    periodo: '2025 – 2026',
    empresa: 'Escuela de Periodismo Multimedia El Tiempo',
    items: [
      'Investigación y redacción de notas periodísticas para el periódico digital e impreso.',
      'Cobertura fotográfica y en video de conciertos y eventos.',
      'Producción de nota periodística para televisión.',
    ],
    prensa: true,
    tv: true,
  },
];

const proyectos: Trabajo[] = [
  {
    periodo: '2024 – 2025',
    empresa: 'Ventana U',
    items: [
      'Realización de notas en video y escritas para este periódico universitario.',
      'Trabajo de producción, edición y presentación de eventos.',
    ],
  },
  {
    periodo: '2024',
    empresa: 'Capital Enigma',
    items: [
      'Investigación periodística para creación de contenido en redes sociales sobre casos judiciales mediáticos.',
    ],
  },
];

const educacion = [
  {
    periodo: '2025 – 2026',
    institucion: 'El Tiempo',
    titulo: 'Programa de la Escuela de Periodismo Multimedia EL TIEMPO',
  },
  {
    periodo: '2024',
    institucion: 'Universidad Cooperativa de Colombia',
    titulo: 'Diplomado en Reportería y presentación de noticias con énfasis en periodismo judicial y político',
  },
  {
    periodo: '2021 – 2026',
    institucion: 'Universidad Cooperativa de Colombia',
    titulo: 'Comunicación Social',
  },
];

const referencias = [
  {
    nombre: 'Carlos Solano',
    cargo: 'Director de Escuela de Periodismo Multimedia EL TIEMPO y Editor de Podcasts',
    telefono: '320 865 1735',
    correo: 'carsol@eltiempo.com',
  },
  {
    nombre: 'Rafael Quintero',
    cargo: 'Periodista y Jefe editorial de Cuestión Pública',
    telefono: '320 839 5534',
  },
];

/** Posts que se muestran dentro de cada trabajo (los de más interacciones). */
const POSTS_POR_TRABAJO = 3;

const postsDe = (cuenta: string) => postsInstagram.filter((p) => p.cuenta === cuenta).sort(porLikes);

export default function SobreMiPage() {
  const { perfilId, perfil, search } = usePerfil();
  const [abiertos, setAbiertos] = useState<Set<string>>(new Set());
  const { marcar, soltar, clave } = useReinicios();

  // El título de la pestaña acompaña al perfil activo (útil al compartir el enlace).
  useEffect(() => {
    document.title = perfil.tituloDocumento;
  }, [perfil.tituloDocumento]);

  // Al cerrar un trabajo sus posts se desmontan: si alguno sonaba, se corta.
  const alternar = (empresa: string) => {
    setAbiertos((previos) => {
      const siguientes = new Set(previos);
      if (siguientes.has(empresa)) siguientes.delete(empresa);
      else siguientes.add(empresa);
      return siguientes;
    });
  };

  const lineaDeTiempo = (lista: Trabajo[], conEvidencia: boolean) => (
    <ol className={styles.lineaTiempo}>
      {lista.map((t) => {
        const posts = t.cuenta ? postsDe(t.cuenta) : [];
        const tieneEvidencia = conEvidencia && (posts.length > 0 || t.prensa || t.tv);
        const abierto = abiertos.has(t.empresa);
        const idPanel = `trabajo-${t.empresa.replace(/\W+/g, '-')}`;
        return (
          <li key={t.empresa} className={`${styles.trabajo} revelar`}>
            <span className={styles.punto} aria-hidden="true" />
            <article className={styles.trabajoTarjeta} data-abierto={abierto || undefined}>
              <span className={styles.periodo}>{t.periodo}</span>
              <h3 className={styles.empresa}>{t.empresa}</h3>
              {perfil.cargos[t.empresa] && <p className={styles.cargo}>{perfil.cargos[t.empresa]}</p>}
              <ul className={styles.funciones}>
                {t.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              {tieneEvidencia && (
                <>
                  <button
                    type="button"
                    className={styles.verTrabajo}
                    aria-expanded={abierto}
                    aria-controls={idPanel}
                    onClick={() => alternar(t.empresa)}
                  >
                    {abierto ? 'Ocultar su trabajo' : 'Ver su trabajo'}
                    <IconChevronRight size={16} />
                  </button>

                  {abierto && (
                    <div id={idPanel} className={styles.evidencia}>
                      {posts.length > 0 && (
                        <>
                          <p className={styles.evidenciaTitulo}>
                            <IconInstagram size={14} /> En Instagram · @{t.cuenta} · toca uno para verlo
                          </p>
                          <ul className={styles.miniaturas}>
                            {posts.slice(0, POSTS_POR_TRABAJO).map((p) => (
                              <li key={p.url}>
                                <TarjetaPost
                                  post={p}
                                  claveVivo={clave(p.url)}
                                  onTocado={() => {
                                    marcar(p.url);
                                    soltar(p.url);
                                  }}
                                />
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                      <div className={styles.enlaces}>
                        {posts.length > POSTS_POR_TRABAJO && (
                          <Link to={{ pathname: '/posts-instagram', search }} className={styles.enlace}>
                            <IconInstagram size={15} /> Ver las {posts.length} publicaciones
                          </Link>
                        )}
                        {t.prensa && (
                          <Link to={{ pathname: '/articulos-digitales', search }} className={styles.enlace}>
                            <IconNewspaper size={15} /> Artículos en EL TIEMPO
                          </Link>
                        )}
                        {t.prensa && (
                          <Link to={{ pathname: '/articulos-impresos', search }} className={styles.enlace}>
                            <IconNewspaper size={15} /> Edición impresa
                          </Link>
                        )}
                        {t.tv && (
                          <Link to={{ pathname: '/reportaje', search }} className={styles.enlace}>
                            <IconPlay size={14} /> Reportaje en Canal CityTV
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </article>
          </li>
        );
      })}
    </ol>
  );

  return (
    <div className={styles.page}>
      {/* Portada: el contenido lo decide `?perfil=`, no hay selector visible */}
      <section className={styles.hero}>
        <div className={styles.heroTexto} key={perfilId}>
          <p className={styles.eyebrow}>{perfil.rol}</p>
          <h1 className={styles.nombre}>
            Laura Viviana <span>Hernández Martin</span>
          </h1>
          <p className={styles.titular}>{perfil.titular}</p>
          <div className={styles.sobreMi}>
            {perfil.sobreMi.map((parrafo) => (
              <p key={parrafo}>{parrafo}</p>
            ))}
          </div>
          <div className={styles.contactos}>
            <a href="tel:3222448811" className={styles.contacto}>
              <IconPhone size={15} /> 3222448811
            </a>
            <a href="mailto:laurahernandezfcb@hotmail.com" className={styles.contacto}>
              <IconMail size={15} /> laurahernandezfcb@hotmail.com
            </a>
            <span className={styles.contacto}>
              <IconLocation size={15} /> Bogotá
            </span>
          </div>
          <div className={styles.acciones}>
            <Link to={{ pathname: '/top-20', search }} className={styles.botonPrincipal}>
              <IconPlay size={15} /> Ver mi Top 20
            </Link>
            <Link to={{ pathname: '/articulos-digitales', search }} className={styles.botonSecundario}>
              Leer mis artículos
            </Link>
          </div>
        </div>

        <div className={styles.heroFoto}>
          <span className={styles.halo} aria-hidden="true" />
          <img src={fotoLaura} alt="Laura Hernández" className={styles.foto} />
        </div>
      </section>

      {/* Métricas e impacto: los valores cambian con el perfil activo */}
      <div className={`${styles.metricas} revelar`}>
        <MetricasImpacto metricas={perfil.metricas} nota="Cifras verificables en las secciones del portafolio" />
      </div>

      <div className={styles.grid}>
        <div className={styles.principal}>
          <section className={`${styles.seccion} revelar`}>
            <h2 className={styles.seccionTitulo}>Trabajo destacado</h2>
            <ol className={styles.destacados} key={perfilId}>
              {perfil.destacados.map((d, i) => (
                <li key={d}>
                  <span className={styles.numero}>{String(i + 1).padStart(2, '0')}</span>
                  <p>{d}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className={styles.seccion}>
            <h2 className={styles.seccionTitulo}>Experiencia</h2>
            {lineaDeTiempo(experiencias, true)}
          </section>

          <section className={styles.seccion}>
            <h2 className={styles.seccionTitulo}>Proyectos</h2>
            {lineaDeTiempo(proyectos, false)}
          </section>
        </div>

        <aside className={styles.lateral}>
          <section className={`${styles.seccion} revelar`}>
            <h2 className={styles.seccionTitulo}>Habilidades</h2>
            <ul className={styles.habilidades}>
              {perfil.habilidades.map((h) => (
                <li
                  key={`${perfilId}-${h.nombre}`}
                  className={styles.habilidad}
                  style={{ '--nivel': h.nivel } as CSSProperties}
                >
                  <span className={styles.anillo}>
                    <span>{h.nivel}%</span>
                  </span>
                  <span className={styles.habilidadNombre}>{h.nombre}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className={`${styles.seccion} revelar`}>
            <h2 className={styles.seccionTitulo}>Educación</h2>
            <ul className={styles.estudios}>
              {educacion.map((edu) => (
                <li key={edu.titulo} className={styles.estudio}>
                  <span className={styles.periodo}>{edu.periodo}</span>
                  <h3 className={styles.estudioTitulo}>{edu.titulo}</h3>
                  <p className={styles.cargo}>{edu.institucion}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className={`${styles.seccion} revelar`}>
            <h2 className={styles.seccionTitulo}>Referencias</h2>
            <ul className={styles.referencias}>
              {referencias.map((ref) => (
                <li key={ref.nombre} className={styles.referencia}>
                  <p className={styles.refNombre}>{ref.nombre}</p>
                  <p className={styles.refCargo}>{ref.cargo}</p>
                  <div className={styles.refContacto}>
                    <a href={`tel:${ref.telefono.replace(/\s/g, '')}`} className={styles.contacto}>
                      <IconPhone size={14} /> {ref.telefono}
                    </a>
                    {ref.correo && (
                      <a href={`mailto:${ref.correo}`} className={styles.contacto}>
                        <IconMail size={14} /> {ref.correo}
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
