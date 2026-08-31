import type { Metrica } from '../types';
import { formatearMetrica } from '../lib/formato';
import { useContadorAnimado } from '../hooks/useContadorAnimado';
import { IconEye, IconNewspaper, IconHeart, IconSparkle } from './icons';
import styles from './MetricasImpacto.module.css';

const ICONOS = {
  alcance: IconEye,
  publicaciones: IconNewspaper,
  interacciones: IconHeart,
  destacado: IconSparkle,
} as const;

export default function MetricaCard({ metrica }: { metrica: Metrica }) {
  const { ref, valor } = useContadorAnimado<HTMLElement>(metrica.valor);
  const Icono = ICONOS[metrica.categoria];
  const valorFinal = `${formatearMetrica(metrica.valor, metrica.compacto)}${metrica.sufijo ?? ''}`;

  return (
    <article ref={ref} className={styles.card} data-categoria={metrica.categoria}>
      <span className={styles.cardIcon} aria-hidden="true">
        <Icono size={18} />
      </span>

      {/* El número animado se oculta a lectores de pantalla; el valor real
          se expone una sola vez en el aria-label del contenedor. */}
      <p className={styles.cardValor} aria-hidden="true">
        {formatearMetrica(valor, metrica.compacto)}
        {metrica.sufijo && <span className={styles.cardSufijo}>{metrica.sufijo}</span>}
      </p>
      <span className={styles.srOnly}>{valorFinal}</span>

      <h3 className={styles.cardEtiqueta}>{metrica.etiqueta}</h3>
      <p className={styles.cardDetalle}>{metrica.detalle}</p>
    </article>
  );
}
