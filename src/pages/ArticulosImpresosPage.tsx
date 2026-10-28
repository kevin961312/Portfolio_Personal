import { useEffect, useState } from 'react';
import { articulosDigitales } from '../data/articulos-digitales';
import EncabezadoPagina from '../components/EncabezadoPagina';
import VisorImagen from '../components/VisorImagen';
import type { ImagenVisor } from '../components/VisorImagen';
import { IconExternalLink } from '../components/icons';
import { seccionDesdeUrl } from '../lib/articulos';
import { rutaPublica } from '../lib/rutas';
import { usePerfil } from '../hooks/usePerfil';
import styles from './ArticulosImpresosPage.module.css';

/* Las páginas impresas salen de los artículos digitales que tienen su
   versión en papel (`impreso`), así cada una enlaza a su nota en la web. */
const impresos = articulosDigitales
  .filter((a) => a.impreso)
  .sort((a, b) => b.fecha.localeCompare(a.fecha));

export default function ArticulosImpresosPage() {
  const { perfil } = usePerfil();
  const [ampliada, setAmpliada] = useState<ImagenVisor | null>(null);

  useEffect(() => {
    document.title = `Artículos impresos · ${perfil.tituloDocumento}`;
  }, [perfil.tituloDocumento]);

  return (
    <div className={styles.page}>
      <EncabezadoPagina
        eyebrow="Edición impresa · EL TIEMPO"
        titulo="Artículos"
        resaltado="impresos"
        lead="Notas publicadas en la edición física de EL TIEMPO: el mismo trabajo de reportería llevado del papel a la web. Toca una página para leerla de cerca."
      />

      <ul className={styles.mesa}>
        {impresos.map((a) => (
          <li key={a.url} className={`${styles.hoja} revelar`}>
            <button
              type="button"
              className={styles.papel}
              onClick={() => setAmpliada({ src: rutaPublica(a.impreso!), titulo: a.titulo, enlace: a.url })}
              aria-label={`Leer la página impresa: ${a.titulo}`}
            >
              <img src={rutaPublica(a.impreso!)} alt="" loading="lazy" />
              <span className={styles.lupa}>Leer de cerca</span>
            </button>
            <div className={styles.pie}>
              <p className={styles.medio}>
                {seccionDesdeUrl(a.url)} · {a.fecha.slice(0, 4)}
              </p>
              <h2 className={styles.titulo}>{a.titulo}</h2>
              <a href={a.url} target="_blank" rel="noopener noreferrer" className={styles.enlace}>
                Versión digital <IconExternalLink size={13} />
              </a>
            </div>
          </li>
        ))}
      </ul>

      <VisorImagen imagen={ampliada} onCerrar={() => setAmpliada(null)} />
    </div>
  );
}
