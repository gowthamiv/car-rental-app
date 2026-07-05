// src/components/Header.tsx
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Car, User, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import styles from './Header.module.css';

export function Header() {
  const { isAuthenticated, mobileNumber, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <Link to={isAuthenticated ? '/new-reservation' : '/login'} className={styles.brand}>
          <div className={styles.logoCircle}>
            <Car size={16} className="text-blue-600" />
          </div>
          <span className={styles.brandName}>Drive Me</span>
        </Link>

        {isAuthenticated && (
          <nav className={styles.nav}>
            <NavLink
              to="/new-reservation"
              className={({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}
            >
              New reservation
            </NavLink>
            <NavLink
              to="/reservations"
              className={({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}
            >
              My reservations
            </NavLink>
          </nav>
        )}
      </div>

      <div className={styles.right}>
        {isAuthenticated ? (
          <>
            <div className={styles.userInfo}>
              <div className={styles.userIconCircle}>
                <User size={13} className="text-gray-500" />
              </div>
              <span className={styles.mobileNumber}>{mobileNumber}</span>
            </div>
            <button className={styles.logoutButton} onClick={handleLogout}>
              <LogOut size={14} /> Log out
            </button>
          </>
        ) : (
          <button className={styles.loginButton} onClick={() => navigate('/login')}>
            Log in
          </button>
        )}
      </div>
    </header>
  );
}