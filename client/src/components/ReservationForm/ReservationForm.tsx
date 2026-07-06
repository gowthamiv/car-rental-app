// src/components/ReservationForm.tsx
import { useState } from 'react';
import type { SubmitEvent } from 'react';
import { getCategoryConfig } from '../../constants/category.config';
import styles from './ReservationForm.module.css';
import { formatCurrency } from '../../utils/format';

interface ReservationFormValues {
  fullName: string;
  licenseNumber: string;
  email: string;
}

interface ReservationFormProps {
  category: import('../../types/reservation.types').VehicleCategory;
  startDate: string;
  endDate: string;
  totalPrice: number;
  days: number;
  onConfirm: (values: ReservationFormValues) => void;
  onBack: () => void;
  submitting?: boolean;
}

export function ReservationForm({
  category,
  startDate,
  endDate,
  totalPrice,
  days,
  onConfirm,
  onBack,
  submitting = false,
}: ReservationFormProps) {
  const config = getCategoryConfig(category);
  const [values, setValues] = useState<ReservationFormValues>({ fullName: '', licenseNumber: '', email: '' });
  const [emailError, setEmailError] = useState<string | null>(null);

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      setEmailError('Enter a valid email address.');
      return;
    }
    setEmailError(null);
    onConfirm(values);
  };

  return (
    <form className={styles.card} onSubmit={handleSubmit}>
      <p className="text-lg font-medium mb-1">Confirm your reservation</p>
      <p className="text-sm text-gray-500 mb-4">Review the details before you reserve.</p>

      <div className={styles.summary}>
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-md text-sm ${config.badgeClassName}`}>
          {config.displayName}
        </span>
        <p className="text-sm text-gray-500 mt-2">
          {startDate} – {endDate} · {days} day{days !== 1 ? 's' : ''}
        </p>
        <p className={styles.summaryPrice}>{formatCurrency(totalPrice)} total</p>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="fullName">Full name</label>
        <input
          id="fullName"
          className={styles.input}
          value={values.fullName}
          onChange={(e) => setValues((v) => ({ ...v, fullName: e.target.value }))}
          required
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="licenseNumber">Driver's license number</label>
        <input
          id="licenseNumber"
          className={styles.input}
          value={values.licenseNumber}
          onChange={(e) => setValues((v) => ({ ...v, licenseNumber: e.target.value }))}
          required
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          className={styles.input}
          value={values.email}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
          required
        />
        {emailError && <p className={styles.errorText}>{emailError}</p>}
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.buttonSecondary} onClick={onBack} disabled={submitting}>
          Back
        </button>
        <button type="submit" className={styles.buttonPrimary} disabled={submitting}>
          {submitting ? 'Reserving…' : 'Confirm reservation'}
        </button>
      </div>
    </form>
  );
}