import type { Metrica } from '../../types';
import { formatearMetrica } from '../../lib/formato';
import { IconEye, IconNewspaper, IconHeart, IconSparkle } from '../icons';
import styles from './MetricasImpacto.module.css';

const ICONOS = {
  alcance: IconEye,
  publicaciones: IconNewspaper,
  interacciones: IconHeart,
  destacado: IconSparkle,
} as const;

export default function MetricaCard({ metrica }: { metrica: Metrica }) {
  const Icono = ICONOS[metrica.categoria];

  return (
    <article className={styles.card} data-categoria={metrica.categoria}>
      <span className={styles.cardIcon} aria-hidden="true">
        <Icono size={18} />
      </span>

      {/* Número final, estático: una cifra que arranca en 0 se lee como «0». */}
      <p className={styles.cardValor}>
        {formatearMetrica(metrica.valor, metrica.compacto)}
        {metrica.sufijo && <span className={styles.cardSufijo}>{metrica.sufijo}</span>}
      </p>

      <h3 className={styles.cardEtiqueta}>{metrica.etiqueta}</h3>
      <p className={styles.cardDetalle}>{metrica.detalle}</p>
    </article>
  );
}
