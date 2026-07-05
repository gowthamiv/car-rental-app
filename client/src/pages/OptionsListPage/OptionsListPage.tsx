// src/pages/OptionsListPage/OptionsListPage.tsx
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePricing } from '../../hooks/usePricing';
import { useReservationDraft } from '../../hooks/useReservationDraft';
import { CategoryOptionCard } from '../../components/CategoryOptionCard/CategoryOptionCard';
import type { PricingOption } from '../../types/reservation.types';
import styles from './OptionsListPage.module.css';

interface LocationState {
  startDate?: string;
  endDate?: string;
  dailyMileage?: number;
}

function calculateDays(startDate: string, endDate: string): number {
  const msPerDay = 86_400_000;
  return Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / msPerDay);
}

export function OptionsListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateDraft } = useReservationDraft();
  const { options, loading, error, fetchOptions } = usePricing();

  const state = (location.state as LocationState) ?? {};

  const [startDate, setStartDate] = useState(state.startDate ?? '');
  const [endDate, setEndDate] = useState(state.endDate ?? '');
  const [dailyMileage, setDailyMileage] = useState(state.dailyMileage ?? 0);

  // If someone lands here with no dates at all, send them back to set them up first
  useEffect(() => {
    if (!state.startDate || !state.endDate) {
      navigate('/new-reservation', { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (startDate && endDate) {
      fetchOptions({ startDate, endDate, dailyMileage });
    }
  }, [startDate, endDate, dailyMileage]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpdate = (e: FormEvent) => {
    e.preventDefault();
    fetchOptions({ startDate, endDate, dailyMileage });
  };

  const handleSelect = (option: PricingOption) => {
    updateDraft({
      category: option.category,
      startDate,
      endDate,
      dailyMileage,
      totalPrice: option.totalPrice,
    });
    navigate('/reserve');
  };

  const days = startDate && endDate ? calculateDays(startDate, endDate) : 0;
  const sortedOptions = [...options].sort((a, b) => a.totalPrice - b.totalPrice);
  const cheapestPrice = sortedOptions[0]?.totalPrice;

  return (
    <div className={styles.wrapper}>
      <form className={styles.header} onSubmit={handleUpdate}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="startDate">Start date</label>
          <input
            id="startDate"
            type="date"
            className={styles.input}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="endDate">End date</label>
          <input
            id="endDate"
            type="date"
            className={styles.input}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="dailyMileage">Daily mileage (SUV)</label>
          <input
            id="dailyMileage"
            type="number"
            min={0}
            className={styles.mileageInput}
            value={dailyMileage}
            onChange={(e) => setDailyMileage(Number(e.target.value))}
          />
        </div>
        <button type="submit" className={styles.updateButton}>Update options</button>
      </form>

      {error && <p className={styles.errorText}>{error}</p>}

      {loading && <p className={styles.emptyState}>Loading options…</p>}

      {!loading && !error && sortedOptions.length === 0 && (
        <p className={styles.emptyState}>No options available for these dates.</p>
      )}

      {!loading && sortedOptions.length > 0 && (
        <div className={styles.grid}>
          {sortedOptions.map((option) => (
            <CategoryOptionCard
              key={option.category}
              option={option}
              days={days}
              isBestValue={option.totalPrice === cheapestPrice && option.availableCount > 0}
              onSelect={handleSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}