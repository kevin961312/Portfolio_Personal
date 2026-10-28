import type { ReactNode } from 'react';
import { formatearMetrica } from '../lib/formato';
import { useContadorAnimado } from '../hooks/useContadorAnimado';
import styles from './EncabezadoPagina.module.css';

export interface DatoEncabezado {
  valor: number;
  etiqueta: string;
  /** `true` → 346.386 se muestra como «346K». */
  compacto?: boolean;
}

interface Props {
  eyebrow: string;
  titulo: string;
  /** Palabra final del título, en degradado lila. */
  resaltado?: string;
  lead: string;
  datos?: DatoEncabezado[];
  /** Botones o enlaces bajo el texto. */
  children?: ReactNode;
}

export function Contador({ valor, etiqueta, compacto }: DatoEncabezado) {
  const { ref, valor: animado } = useContadorAnimado<HTMLDivElement>(valor);
  return (
    <div ref={ref} className={styles.dato}>
      <span className={styles.datoValor} aria-hidden="true">
        {formatearMetrica(animado, compacto)}
      </span>
      <span className={styles.datoEtiqueta}>
        <span className={styles.srOnly}>{formatearMetrica(valor, compacto)} </span>
        {etiqueta}
      </span>
    </div>
  );
}

/** Encabezado común de las secciones: título grande, texto y cifras animadas. */
export default function EncabezadoPagina({ eyebrow, titulo, resaltado, lead, datos, children }: Props) {
  return (
    <header className={styles.encabezado}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h1 className={styles.titulo}>
        {titulo} {resaltado && <span>{resaltado}</span>}
      </h1>
      <p className={styles.lead}>{lead}</p>
      {datos && datos.length > 0 && (
        <div className={styles.datos}>
          {datos.map((d) => (
            <Contador key={d.etiqueta} {...d} />
          ))}
        </div>
      )}
      {children && <div className={styles.acciones}>{children}</div>}
    </header>
  );
}
