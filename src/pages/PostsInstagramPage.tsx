import { useState } from 'react';
import { postsInstagram } from '../data/posts-instagram';
import InstagramEmbed from '../components/InstagramEmbed';
import { IconInstagram, IconPlay, IconCarousel } from '../components/icons';
import styles from './PostsInstagramPage.module.css';

type Tab = 'reels' | 'carrusel';

export default function PostsInstagramPage() {
  const [activeTab, setActiveTab] = useState<Tab>('carrusel');

  const byLikes = (a: { likes?: number }, b: { likes?: number }) =>
    (b.likes ?? -1) - (a.likes ?? -1);

  const reels = postsInstagram.filter((p) => p.tipo === 'video').sort(byLikes);
  const carruseles = postsInstagram.filter((p) => p.tipo === 'carrusel').sort(byLikes);
  const posts = activeTab === 'reels' ? reels : carruseles;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerIcon}>
          <IconInstagram size={28} color="var(--color-purple-mid)" />
        </div>
        <div>
          <h1 className={styles.title}>Posts de Instagram</h1>
          <p className={styles.subtitle}>
            Carruseles y reels publicados en Instagram
          </p>
        </div>
      </header>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'carrusel' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('carrusel')}
        >
          <IconCarousel size={15} />
          Carruseles
          <span className={styles.tabCount}>{carruseles.length}</span>
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'reels' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('reels')}
        >
          <IconPlay size={15} />
          Reels
          <span className={styles.tabCount}>{reels.length}</span>
        </button>
      </div>

      {posts.length === 0 ? (
        <div className={styles.empty}>
          <IconInstagram size={48} color="var(--color-lilac-mid)" />
          <h2>Sin publicaciones</h2>
          <p>
            No hay {activeTab === 'reels' ? 'reels' : 'carruseles'} aún. Agrega entradas en{' '}
            <code>src/data/posts-instagram.ts</code>
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {posts.map((post) => (
            <InstagramEmbed key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
