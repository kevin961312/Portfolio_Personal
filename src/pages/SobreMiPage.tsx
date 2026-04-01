import { IconMail, IconPhone, IconLocation } from '../components/icons';
import styles from './SobreMiPage.module.css';
import fotoLaura from '../assets/sobre-mi/foto-laura.jpeg';

const habilidades = [
  { nombre: 'Redacción y ortografía', nivel: 90 },
  { nombre: 'Edición de videos', nivel: 80 },
  { nombre: 'Investigación', nivel: 85 },
  { nombre: 'Oratoria', nivel: 80 },
  { nombre: 'Copys', nivel: 80 },
  { nombre: 'Capcut', nivel: 80 },
  { nombre: 'Canva', nivel: 80 },
];

const experiencias = [
  {
    periodo: '2025 – 2026',
    empresa: 'No Es Hora de Callar · El Tiempo',
    cargo: '',
    items: [
      'Investigación y redacción de notas periodísticas para el periódico digital e impreso.',
      'Creación de parrillas de contenido, carruseles, reels e historias para Instagram.',
      'Producción, pietaje y pasos en cámara para programa televisivo.',
    ],
  },
  {
    periodo: '2025 – 2026',
    empresa: 'Escuela de Periodismo Multimedia El Tiempo',
    cargo: '',
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
    cargo: 'Periodista',
    items: [
      'Realización de notas en video y escritas para este periódico universitario.',
      'Trabajo de producción, edición y presentación de eventos.',
    ],
  },
  {
    periodo: '2024',
    empresa: 'Capital Enigma',
    cargo: 'Investigadora periodística',
    items: [
      'Investigación periodística para creación de contenido en redes sociales sobre casos judiciales mediáticos.',
    ],
  },
];

const educacion = [
  {
    periodo: '2025 – 2026',
    institucion: 'El Tiempo',
    titulo: 'Escuela de Periodismo Multimedia El Tiempo',
  },
  {
    periodo: '2024',
    institucion: 'Universidad Cooperativa de Colombia',
    titulo: 'Diplomado en Reportería y presentación de noticias con énfasis en periodismo judicial y político',
  },
  {
    periodo: '2021 – Actualmente',
    institucion: 'Universidad Cooperativa de Colombia',
    titulo: 'Comunicación Social',
  },
];

export default function SobreMiPage() {
  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.avatarWrap}>
            <img src={fotoLaura} alt="Laura Hernández" className={styles.avatar} />
          </div>
          <div className={styles.heroText}>
            <p className={styles.heroRole}>Comunicadora Social y Periodista</p>
            <h1 className={styles.heroName}>Laura Viviana Hernández Martin</h1>
            <p className={styles.heroDesc}>
              Periodista y content manager con experiencia en temas de género. Apasionada por la reportería desde enfoques que aporten a la equidad y la visibilización de problemáticas sociales.<br/> <br/>
              Cuento con habilidades en creación de contenido digital y audiovisual, así como en formatos transmedia.<br/> <br/>
              Destaco por mi creatividad, curiosidad, aprendizaje continuo y habilidades de liderazgo.
            </p>
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

      <div className={styles.grid}>
        <div className={styles.left}>
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
                    {exp.cargo && <p className={styles.cargo}>{exp.cargo}</p>}
                    {exp.items && exp.items.length > 0 && (
                      <ul className={styles.timelineList}>
                        {exp.items.map((item, j) => (
                          <li key={j}>{item}</li>
                        ))}
                      </ul>
                    )}
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
                    {p.cargo && <p className={styles.cargo}>{p.cargo}</p>}
                    {p.items && p.items.length > 0 && (
                      <ul className={styles.timelineList}>
                        {p.items.map((item, j) => (
                          <li key={j}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className={styles.aside}>
          {/* Habilidades */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Habilidades</h2>
            <div className={styles.skills}>
              {habilidades.map((h) => (
                <div key={h.nombre} className={styles.skill}>
                  <div className={styles.skillLabel}>
                    <span>{h.nombre}</span>
                    <span className={styles.skillPct}>{h.nivel}%</span>
                  </div>
                  <div className={styles.skillBar}>
                    <div
                      className={styles.skillFill}
                      style={{ width: `${h.nivel}%` }}
                    />
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

          {/* Referencia */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Referencia</h2>
            <div className={styles.refCard}>
              <p className={styles.refName}>Carlos Solano</p>
              <p className={styles.refRole}>Director de Escuela de Periodismo Multimedia EL TIEMPO y Editor de Podcasts</p>
              <a href="tel:3133189136" className={styles.contactItem} style={{ marginTop: '0.5rem' }}>
                <IconPhone size={14} /> 320 8651735
              </a>
              <a href="mailto:carsol@eltiempo.com" className={styles.contactItem}>
                <IconMail size={14} /> carsol@eltiempo.com
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
