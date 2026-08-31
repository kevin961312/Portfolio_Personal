import { useEffect } from 'react';
import { IconMail, IconPhone, IconLocation } from '../components/icons';
import MetricasImpacto from '../components/MetricasImpacto';
import { usePerfil } from '../hooks/usePerfil';
import styles from './SobreMiPage.module.css';
import fotoLaura from '../assets/sobre-mi/foto-laura.jpeg';

/* Experiencia, proyectos y educación son comunes a las tres versiones de la
   HV; lo único que cambia por perfil es el cargo, que se resuelve contra
   `perfil.cargos[empresa]`. */

const experiencias = [
  {
    periodo: '2026 – Actualmente',
    empresa: 'Cuestión Pública',
    items: [
      'Análisis y selección de temas para creación de parrillas de contenido.',
      'Pre producción, producción, edición y publicación de carruseles, reels e historias para Instagram.',
      'Seguimiento de resultados y creación de estrategia.',
    ],
  },
  {
    periodo: '2025 – 2026',
    empresa: 'No Es Hora de Callar · Casa Editorial El Tiempo',
    items: [
      'Investigación y redacción de notas periodísticas para el periódico digital e impreso.',
      'Creación de parrillas de contenido, carruseles, reels e historias para Instagram.',
      'Producción, pietaje y pasos en cámara para programa televisivo.',
    ],
  },
  {
    periodo: '2025 – 2026',
    empresa: 'Escuela de Periodismo Multimedia El Tiempo',
    items: [
      'Investigación y redacción de notas periodísticas para el periódico digital e impreso.',
      'Cobertura fotográfica y en video de conciertos y eventos.',
      'Producción de nota periodística para televisión.',
    ],
  },
];

const proyectos = [
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
    nombre: 'Abrahán Gutiérrez Navarro',
    cargo: 'Periodista',
    telefono: '350 480 0639',
  },
];

export default function SobreMiPage() {
  const { perfilId, perfil } = usePerfil();

  // El título de la pestaña acompaña al perfil activo (útil al compartir el enlace).
  useEffect(() => {
    document.title = perfil.tituloDocumento;
  }, [perfil.tituloDocumento]);

  return (
    <div className={styles.page}>
      {/* Hero + Sobre mí: el contenido lo decide `?perfil=`, no hay selector visible */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.avatarWrap}>
            <img src={fotoLaura} alt="Laura Hernández" className={styles.avatar} />
          </div>
          <div className={styles.heroText} key={perfilId}>
            <p className={styles.heroRole}>{perfil.rol}</p>
            <h1 className={styles.heroName}>Laura Viviana Hernández Martin</h1>
            <p className={styles.heroTitular}>{perfil.titular}</p>
            <div className={styles.heroDesc}>
              {perfil.sobreMi.map((parrafo, i) => (
                <p key={i}>{parrafo}</p>
              ))}
            </div>
            <div className={styles.contactList}>
              <a href="tel:3222448811" className={styles.contactItem}>
                <IconPhone size={15} /> 3222448811
              </a>
              <a href="mailto:laurahernandezfcb@hotmail.com" className={styles.contactItem}>
                <IconMail size={15} /> laurahernandezfcb@hotmail.com
              </a>
              <span className={styles.contactItem}>
                <IconLocation size={15} /> Bogotá
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Métricas e impacto: los valores cambian con el perfil activo */}
      <div className={styles.metricas}>
        <MetricasImpacto
          metricas={perfil.metricas}
          nota="Cifras verificables en las secciones del portafolio"
        />
      </div>

      <div className={styles.grid}>
        <div className={styles.left}>
          {/* Trabajo destacado */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Trabajo destacado</h2>
            <ul className={styles.destacados} key={perfilId}>
              {perfil.destacados.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </section>

          {/* Experiencia */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Experiencia</h2>
            <div className={styles.timeline}>
              {experiencias.map((exp, i) => (
                <div key={i} className={styles.timelineItem}>
                  <div className={styles.timelineDot} />
                  <div className={styles.timelineContent}>
                    <span className={styles.periodo}>{exp.periodo}</span>
                    <h3 className={styles.empresa}>{exp.empresa}</h3>
                    {perfil.cargos[exp.empresa] && (
                      <p className={styles.cargo}>{perfil.cargos[exp.empresa]}</p>
                    )}
                    <ul className={styles.timelineList}>
                      {exp.items.map((item, j) => (
                        <li key={j}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Proyectos */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Proyectos</h2>
            <div className={styles.timeline}>
              {proyectos.map((p, i) => (
                <div key={i} className={styles.timelineItem}>
                  <div className={styles.timelineDot} />
                  <div className={styles.timelineContent}>
                    <span className={styles.periodo}>{p.periodo}</span>
                    <h3 className={styles.empresa}>{p.empresa}</h3>
                    {perfil.cargos[p.empresa] && (
                      <p className={styles.cargo}>{perfil.cargos[p.empresa]}</p>
                    )}
                    <ul className={styles.timelineList}>
                      {p.items.map((item, j) => (
                        <li key={j}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className={styles.aside}>
          {/* Habilidades (varían por perfil) */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Habilidades</h2>
            <div className={styles.skills}>
              {perfil.habilidades.map((h) => (
                <div key={`${perfilId}-${h.nombre}`} className={styles.skill}>
                  <div className={styles.skillLabel}>
                    <span>{h.nombre}</span>
                    <span className={styles.skillPct}>{h.nivel}%</span>
                  </div>
                  <div className={styles.skillBar}>
                    <div className={styles.skillFill} style={{ width: `${h.nivel}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Educación */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Educación</h2>
            <div className={styles.timeline}>
              {educacion.map((edu, i) => (
                <div key={i} className={styles.timelineItem}>
                  <div className={styles.timelineDot} />
                  <div className={styles.timelineContent}>
                    <span className={styles.periodo}>{edu.periodo}</span>
                    <h3 className={styles.empresa}>{edu.titulo}</h3>
                    <p className={styles.cargo}>{edu.institucion}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Referencias */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Referencias</h2>
            <div className={styles.refList}>
              {referencias.map((ref) => (
                <div key={ref.nombre} className={styles.refCard}>
                  <p className={styles.refName}>{ref.nombre}</p>
                  <p className={styles.refRole}>{ref.cargo}</p>
                  <a
                    href={`tel:${ref.telefono.replace(/\s/g, '')}`}
                    className={styles.contactItem}
                    style={{ marginTop: '0.5rem' }}
                  >
                    <IconPhone size={14} /> {ref.telefono}
                  </a>
                  {ref.correo && (
                    <a href={`mailto:${ref.correo}`} className={styles.contactItem}>
                      <IconMail size={14} /> {ref.correo}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
