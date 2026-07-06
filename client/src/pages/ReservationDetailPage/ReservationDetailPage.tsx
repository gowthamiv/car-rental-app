// src/pages/ReservationDetailPage/ReservationDetailPage.tsx
import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReservations } from '../../hooks/useReservations';
import { ALL_CATEGORIES, getCategoryConfig } from '../../constants/category.config';
import type { Reservation, VehicleCategory } from '../../types/reservation.types';
import { extractErrorMessage } from '../../utils/errorUtil';
import { calculateDays, calculatePrice } from '../../utils/pricing';
import styles from './ReservationDetailPage.module.css';
import { formatCurrency } from '../../utils/format';

export function ReservationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getById, modify, cancel } = useReservations();

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [category, setCategory] = useState<VehicleCategory | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dailyMileage, setDailyMileage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getById(id)
      .then((r) => {
        setReservation(r);
        setCategory(r.category);
        setStartDate(r.startDate);
        setEndDate(r.endDate);
        setDailyMileage(r.dailyMileage ?? 0);
      })
      .finally(() => setLoading(false));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Live-recalculated price, based on current form field values — updates on every change
  const livePrice = useMemo(() => {
    if (!category || !startDate || !endDate) return null;
    const days = calculateDays(startDate, endDate);
    if (days <= 0) return null;
    return calculatePrice(category, days, dailyMileage);
  }, [category, startDate, endDate, dailyMileage]);

  if (loading) return <p className="text-center py-10 text-gray-500">Loading…</p>;
  if (!reservation || !id) return <p className="text-center py-10 text-gray-500">Reservation not found.</p>;

  const hasChanges = livePrice !== null && livePrice !== reservation.totalPrice;

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await modify(id, { category: category || undefined, startDate, endDate, dailyMileage });
      setReservation(updated);
      navigate('/reservations');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setCategory(reservation.category);
    setStartDate(reservation.startDate);
    setEndDate(reservation.endDate);
    setDailyMileage(reservation.dailyMileage ?? 0);
    setError(null);
    navigate('/reservations');
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <p className={styles.title}>Modify reservation</p>
        <p className={styles.subtitle}>Booking #{reservation.id.slice(0, 8).toUpperCase()}</p>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="category">Category</label>
          <select
            id="category"
            className={styles.select}
            value={category}
            onChange={(e) => setCategory(e.target.value as VehicleCategory)}
          >
            {ALL_CATEGORIES.map((c) => (
              <option key={c} value={c}>{getCategoryConfig(c).displayName}</option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="startDate">Start date</label>
          <input id="startDate" type="date" className={styles.input} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="endDate">End date</label>
          <input id="endDate" type="date" className={styles.input} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="dailyMileage">Daily mileage (SUV)</label>
          <input id="dailyMileage" type="number" min={0} className={styles.input} value={dailyMileage} onChange={(e) => setDailyMileage(Number(e.target.value))} />
        </div>

        <div className={styles.priceBox}>
          <div>
            {hasChanges && (
              <p className="text-xs text-gray-400 line-through">${reservation.totalPrice.toFixed(2)}</p>
            )}
            <p className="text-sm text-gray-500">{hasChanges ? 'Updated total' : 'Current total'}</p>
          </div>
          <p className={styles.priceNew}>
           {formatCurrency(livePrice ?? reservation.totalPrice)}
          </p>
        </div>

        {error && <p className={styles.errorText}>{error}</p>}

        <div className={styles.actions}>
          <button className={styles.buttonSecondary} onClick={handleCancel} disabled={saving}>Cancel</button>
          <button className={styles.buttonPrimary} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}