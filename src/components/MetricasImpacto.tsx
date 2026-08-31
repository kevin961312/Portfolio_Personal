import type { Metrica } from '../types';
import MetricaCard from './MetricaCard';
import styles from './MetricasImpacto.module.css';

interface Props {
  metricas: Metrica[];
  titulo?: string;
  nota?: string;
}

/**
 * Bloque de métricas e impacto. Se re-monta con `key` en el perfil activo
 * para que los contadores vuelvan a animar al cambiar de HV.
 */
export default function MetricasImpacto({
  metricas,
  titulo = 'Impacto y resultados',
  nota,
}: Props) {
  if (metricas.length === 0) return null;

  return (
    <section className={styles.bloque} aria-label={titulo}>
      <header className={styles.encabezado}>
        <h2 className={styles.titulo}>{titulo}</h2>
        {nota && <p className={styles.nota}>{nota}</p>}
      </header>

      <div className={styles.grid}>
        {metricas.map((m) => (
          <MetricaCard key={m.id} metrica={m} />
        ))}
      </div>
    </section>
  );
}
