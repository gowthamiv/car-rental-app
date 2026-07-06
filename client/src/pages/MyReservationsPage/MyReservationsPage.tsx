// src/pages/MyReservationsPage/MyReservationsPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car } from 'lucide-react';
import { useReservations } from '../../hooks/useReservations';
import { getCategoryConfig } from '../../constants/category.config';
import { extractErrorMessage } from '../../utils/errorUtil';
import styles from './MyReservationsPage.module.css';

export function MyReservationsPage() {
  const navigate = useNavigate();
  const { reservations, loading, error, refresh, cancel } = useReservations();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this reservation? This cannot be undone.')) return;
    setCancellingId(id);
    setActionError(null);
    try {
      await cancel(id);
    } catch (err) {
      setActionError(extractErrorMessage(err));
    } finally {
      setCancellingId(null);
    }
  };

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
      {actionError && <p className={styles.errorText}>{actionError}</p>}

      {!loading && !error && reservations.length === 0 && (
        <p className={styles.emptyState}>You have no reservations yet.</p>
      )}

      {!loading && reservations.length > 0 && (
        <div className={styles.list}>
          {reservations.map((reservation) => {
            const config = getCategoryConfig(reservation.category);
            const isActive = reservation.status === 'ACTIVE';
            const isCancelling = cancellingId === reservation.id;

            return (
              <div key={reservation.id} className={`${styles.row} ${!isActive ? styles.rowCancelled : ''}`}>
                <div className={styles.rowLeft}>
                  <span className={config.badgeClassName + ' rounded-full p-2'}>
                    <Car size={16} />
                  </span>
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
                    <>
                      <button
                        className={styles.modifyButton}
                        onClick={() => navigate(`/reservations/${reservation.id}`)}
                        disabled={isCancelling}
                      >
                        Modify
                      </button>
                      <button
                        className={styles.cancelButton}
                        onClick={() => handleCancel(reservation.id)}
                        disabled={isCancelling}
                      >
                        {isCancelling ? 'Cancelling…' : 'Cancel'}
                      </button>
                    </>
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