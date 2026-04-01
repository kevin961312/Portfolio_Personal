import Carousel from '../components/Carousel';
import { IconNewspaper } from '../components/icons';
import styles from './ArticulosImpresosPage.module.css';

const base = import.meta.env.BASE_URL;

const impresoImages = [
  { src: `${base}images/Impreso/cuchas_impreso.jpeg`, alt: 'Cuchas impreso' },
  { src: `${base}images/Impreso/Demoni_impreso.jpeg`, alt: 'Demoni impreso' },
  { src: `${base}images/Impreso/Espanola.jpeg`, alt: 'Española' },
  { src: `${base}images/Impreso/Funcionarios.jpeg`, alt: 'Funcionarios' },
];

export default function ArticulosImpresosPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerIcon}>
          <IconNewspaper size={28} color="var(--color-purple-mid)" />
        </div>
        <div>
          <h1 className={styles.title}>Artículos impresos</h1>
          <p className={styles.subtitle}>
            Publicaciones en medios impresos y físicos
          </p>
        </div>
      </header>

      <Carousel images={impresoImages} />
    </div>
  );
}
