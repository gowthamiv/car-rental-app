// src/pages/ReserveFormPage/ReserveFormPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReservationDraft } from '../../hooks/useReservationDraft';
import { reserveCar } from '../../api/reservationApi';
import { ReservationForm } from '../../components/ReservationForm/ReservationForm';
import { extractErrorMessage } from '../../utils/errorUtil';
import styles from './ReserveFormPage.module.css'; // ← new import

function calculateDays(startDate: string, endDate: string): number {
  const msPerDay = 86_400_000;
  return Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / msPerDay);
}

export function ReserveFormPage() {
  const navigate = useNavigate();
  const { draft, clearDraft } = useReservationDraft();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!draft.category || !draft.startDate || !draft.endDate) {
    navigate('/new-reservation', { replace: true });
    return null;
  }

  const handleConfirm = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const reservation = await reserveCar({
        category: draft.category!,
        startDate: draft.startDate!,
        endDate: draft.endDate!,
        dailyMileage: draft.dailyMileage,
      });
      clearDraft();
      navigate(`/confirmation/${reservation.id}`, { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <ReservationForm
        category={draft.category}
        startDate={draft.startDate}
        endDate={draft.endDate}
        totalPrice={draft.totalPrice ?? 0}
        days={calculateDays(draft.startDate, draft.endDate)}
        onConfirm={handleConfirm}
        onBack={() => navigate('/options', { state: { startDate: draft.startDate, endDate: draft.endDate, dailyMileage: draft.dailyMileage } })}
        submitting={submitting}
      />
      {error && <p className="text-sm text-red-500" role="alert" aria-live="polite">{error}</p>}
    </div>
  );
}