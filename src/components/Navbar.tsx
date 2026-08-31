import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { IconMicrophone, IconMenu, IconClose } from './icons';
import { usePerfil } from '../hooks/usePerfil';
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
  // Todos los enlaces internos arrastran `?perfil=` para no perder la
  // versión de HV al navegar entre secciones.
  const { perfil, search } = usePerfil();

  // El menú solo lista las secciones que este perfil expone.
  const itemsVisibles = navItems.filter((item) => perfil.secciones.includes(item.path));

  return (
    <nav className={styles.navbar}>
      <div className={styles.inner}>
        <NavLink to={{ pathname: '/', search }} className={styles.brand}>
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
          {itemsVisibles.map((item) => (
            <li key={item.path}>
              <NavLink
                to={{ pathname: item.path, search }}
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
