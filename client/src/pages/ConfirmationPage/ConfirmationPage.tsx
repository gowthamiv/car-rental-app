
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { getReservationById } from '../../api/reservationApi';
import { getCategoryConfig } from '../../constants/category.config';
import type { Reservation } from '../../types/reservation.types';
import styles from './ConfirmationPage.module.css';

function calculateDays(startDate: string, endDate: string): number {
  const msPerDay = 86_400_000;
  return Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / msPerDay);
}

export function ConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getReservationById(id)
      .then(setReservation)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-center py-10 text-gray-500">Loading…</p>;
  if (!reservation) return <p className="text-center py-10 text-gray-500">Reservation not found.</p>;

  const config = getCategoryConfig(reservation.category);
  const days = calculateDays(reservation.startDate, reservation.endDate);

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.iconCircle}>
          <Check size={22} className="text-green-600" />
        </div>
        <p className={styles.title}>Reservation confirmed</p>
        <p className={styles.subtitle}>Booking #{reservation.id.slice(0, 8).toUpperCase()}</p>

        <table className={styles.table}>
          <tbody>
            <tr className={styles.tableRow}>
              <td className={styles.tableLabel}>Category</td>
              <td className={styles.tableValue}>{config.displayName}</td>
            </tr>
            <tr className={styles.tableRow}>
              <td className={styles.tableLabel}>Dates</td>
              <td className={styles.tableValue}>{reservation.startDate} – {reservation.endDate}</td>
            </tr>
            <tr className={styles.tableRow}>
              <td className={styles.tableLabel}>Duration</td>
              <td className={styles.tableValue}>{days} day{days !== 1 ? 's' : ''}</td>
            </tr>
          </tbody>
        </table>

        <div className={styles.totalRow}>
          <p className="text-sm text-gray-500">Total</p>
          <p className={styles.totalPrice}>${reservation.totalPrice.toFixed(2)}</p>
        </div>

        <div className={styles.actions}>
          <button className={styles.buttonSecondary} onClick={() => navigate('/reservations')}>
            View reservations
          </button>
          <button className={styles.buttonPrimary} onClick={() => navigate('/new-reservation')}>
            Book another
          </button>
        </div>
      </div>
    </div>
  );
}