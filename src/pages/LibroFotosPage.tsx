import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import EncabezadoPagina from '../components/EncabezadoPagina';
import VisorLibro from '../components/galeria/VisorLibro';
import { IconCarousel } from '../components/icons';
import { libroIra } from '../data/galeria';
import { usePerfil } from '../hooks/usePerfil';
import styles from './LibroFotosPage.module.css';

const RUTA_GALERIA = '/galeria';

/**
 * Libro de fotos «40 años de I.R.A.»: fotorreportaje del concierto en la
 * Media Torta, en un visor de fotolibro (hoja que gira, miniaturas, zoom,
 * pantalla completa, presentación y descarga del PDF).
 */
export default function LibroFotosPage() {
  const { perfil, search } = usePerfil();
  const conGaleria = perfil.secciones.includes(RUTA_GALERIA);

  useEffect(() => {
    document.title = `Libro de fotos · ${perfil.tituloDocumento}`;
  }, [perfil.tituloDocumento]);

  return (
    <div className={styles.page}>
      <EncabezadoPagina
        eyebrow="Libro de fotos · Fotorreportaje"
        titulo="40 años de"
        resaltado="I.R.A."
        lead={libroIra.descripcion}
        datos={[
          { valor: libroIra.paginas.length, etiqueta: 'páginas' },
          { valor: 40, etiqueta: 'años de la banda' },
        ]}
      >
        {conGaleria && (
          <Link to={{ pathname: RUTA_GALERIA, search }} className={styles.botonSecundario}>
            <IconCarousel size={16} /> Ver los álbumes de fotos
          </Link>
        )}
      </EncabezadoPagina>

      <VisorLibro libro={libroIra} titulado={false} />
    </div>
  );
}
