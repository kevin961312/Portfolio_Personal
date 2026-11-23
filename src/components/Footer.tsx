import styles from './Footer.module.css';
import { sitio } from '../data/sitio';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p>© {new Date().getFullYear()} {sitio.nombre} · {sitio.profesion}</p>
    </footer>
  );
}
