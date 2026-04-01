import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p>© {new Date().getFullYear()} Laura Hernández · Comunicadora Social y Periodista</p>
    </footer>
  );
}
