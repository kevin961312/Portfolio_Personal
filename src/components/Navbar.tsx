import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { IconMicrophone, IconMenu, IconClose } from './icons';
import styles from './Navbar.module.css';

const navItems = [
  { path: '/', label: 'Sobre mí' },
  { path: '/articulos-impresos', label: 'Artículos impresos' },
  { path: '/articulos-digitales', label: 'Artículos digitales' },
  { path: '/posts-instagram', label: 'Posts de Instagram' },
  { path: '/reportaje', label: 'Reportaje' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className={styles.navbar}>
      <div className={styles.inner}>
        <NavLink to="/" className={styles.brand}>
          <IconMicrophone size={22} />
          <span>Laura Hernández</span>
        </NavLink>

        <button
          className={styles.menuBtn}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <IconClose size={22} /> : <IconMenu size={22} />}
        </button>

        <ul className={`${styles.navList} ${menuOpen ? styles.open : ''}`}>
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.active : ''}`
                }
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
