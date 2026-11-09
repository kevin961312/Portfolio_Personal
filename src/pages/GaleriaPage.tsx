import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import EncabezadoPagina from '../components/EncabezadoPagina';
import LineaTiempo from '../components/galeria/LineaTiempo';
import ProyeccionAlbumes from '../components/galeria/ProyeccionAlbumes';
import { IconBook, IconPlay } from '../components/icons';
import { ALBUMES, TOTAL_FOTOS } from '../lib/galeria';
import { usePerfil } from '../hooks/usePerfil';
import styles from './GaleriaPage.module.css';

const RUTA_LIBRO = '/libro-de-fotos';

/**
 * Galería de fotos: línea de tiempo vertical, del más reciente al más
 * antiguo. Desde ella (o con «Ver en pantalla gigante») se abre la
 * proyección de cualquier álbum. El libro de fotos tiene su propia página
 * (/libro-de-fotos).
 */
export default function GaleriaPage() {
  const { perfil, search } = usePerfil();
  const navigate = useNavigate();
  // Al entrar se ve la línea de tiempo; la sala se abre solo al pedirla
  // (botón «Ver en pantalla gigante» o tocando un álbum).
  const [proyectando, setProyectando] = useState<number | null>(null);
  const [cortesia, setCortesia] = useState(false);
  // La línea de tiempo carga sus embeds de entrada (ya no compite con la sala).
  const [lineaActiva, setLineaActiva] = useState(true);
  const conLibro = perfil.secciones.includes(RUTA_LIBRO);

  useEffect(() => {
    document.title = `Galería de fotos · ${perfil.tituloDocumento}`;
  }, [perfil.tituloDocumento]);

  const proyectar = (i: number, desdeTarjeta: boolean) => {
    setCortesia(desdeTarjeta);
    setProyectando(i);
  };

  const cerrarProyeccion = useCallback(() => {
    setProyectando(null);
    setLineaActiva(true);
  }, []);

  const verLibro = useCallback(() => {
    setProyectando(null);
    navigate({ pathname: RUTA_LIBRO, search });
  }, [navigate, search]);

  return (
    <div className={styles.marco}>
      <div className={styles.page}>
        <EncabezadoPagina
          eyebrow="Fotografía"
          titulo="Galería de"
          resaltado="fotos"
          lead="Álbumes de reportería en la calle, en marchas y en la coyuntura, del más reciente al más antiguo. Ábrelos en pantalla gigante y pasa las fotos como en una presentación."
          datos={[
            { valor: ALBUMES.length, etiqueta: 'álbumes' },
            { valor: TOTAL_FOTOS, etiqueta: 'fotos' },
          ]}
        >
          <button type="button" className={styles.empezar} onClick={() => proyectar(0, false)}>
            <IconPlay size={18} /> Ver en pantalla gigante
          </button>
          {conLibro && (
            <Link to={{ pathname: RUTA_LIBRO, search }} className={styles.botonSecundario}>
              <IconBook size={16} /> Ver el libro de fotos
            </Link>
          )}
        </EncabezadoPagina>

        <section className={styles.seccion} aria-labelledby="albumes-titulo">
          <header className={styles.seccionEncabezado}>
            <p className={styles.eyebrow}>Línea de tiempo</p>
            <h2 id="albumes-titulo" className={styles.titulo}>
              Álbumes de fotos
            </h2>
            <p className={styles.apoyo}>Del más reciente al más antiguo. Toca uno para verlo en pantalla gigante.</p>
          </header>
          <LineaTiempo albumes={ALBUMES} cargarEmbeds={lineaActiva} onProyectar={(i) => proyectar(i, true)} />
        </section>

        <ProyeccionAlbumes
          albumes={ALBUMES}
          indice={proyectando}
          cortesia={cortesia}
          onCambiar={setProyectando}
          onCerrar={cerrarProyeccion}
          onVerLibro={conLibro ? verLibro : undefined}
        />
      </div>
    </div>
  );
}
