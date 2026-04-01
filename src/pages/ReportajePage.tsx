import { IconPlay } from '../components/icons';
import styles from './ReportajePage.module.css';

export default function ReportajePage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerIcon}>
          <IconPlay size={28} color="var(--color-purple-mid)" />
        </div>
        <div>
          <h1 className={styles.title}>Reportaje</h1>
          <p className={styles.subtitle}>
            Reportaje audiovisual publicado en Canal CityTV
          </p>
        </div>
      </header>

      <div className={styles.videoWrapper}>
        <iframe
          src="https://www.youtube.com/embed/kdd4NUzJ9HA"
          title="Reportaje"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    </div>
  );
}
