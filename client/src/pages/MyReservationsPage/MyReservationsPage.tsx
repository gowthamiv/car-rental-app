
import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Car } from 'lucide-react';
import { useReservations } from '../../hooks/useReservations';
import { getCategoryConfig } from '../../constants/category.config';
import styles from './MyReservationsPage.module.css';

export function MyReservationsPage() {
  const navigate = useNavigate();
  const { reservations, loading, error, refresh } = useReservations();

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <p className={styles.title}>Your reservations</p>
        <button className={styles.newButton} onClick={() => navigate('/new-reservation')}>
          New reservation
        </button>
      </div>

      {loading && <p className={styles.emptyState}>Loading…</p>}
      {error && <p className={styles.emptyState}>{error}</p>}

      {!loading && !error && reservations.length === 0 && (
        <p className={styles.emptyState}>You have no reservations yet.</p>
      )}

      {!loading && reservations.length > 0 && (
        <div className={styles.list}>
          {reservations.map((reservation) => {
            const config = getCategoryConfig(reservation.category);
            const isActive = reservation.status === 'ACTIVE';
            return (
              <div key={reservation.id} className={`${styles.row} ${!isActive ? styles.rowCancelled : ''}`}>
                <div className={styles.rowLeft}>
                  <div className={styles.iconCircle} style={{ backgroundColor: 'var(--tw-bg-opacity, 1)' }}>
                    <span className={config.badgeClassName + ' rounded-full p-2'}>
                      <Car size={16} />
                    </span>
                  </div>
                  <div>
                    <p className={styles.category}>{config.displayName}</p>
                    <p className={styles.dates}>{reservation.startDate} – {reservation.endDate}</p>
                  </div>
                </div>
                <div className={styles.rowRight}>
                  <p className={styles.price}>${reservation.totalPrice.toFixed(2)}</p>
                  <span className={isActive ? styles.statusActive : styles.statusCancelled}>
                    {isActive ? 'Active' : 'Cancelled'}
                  </span>
                  {isActive && (
                    <Link to={`/reservations/${reservation.id}`} className={styles.linkButton}>
                      Manage
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}