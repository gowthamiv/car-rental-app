import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './NewReservationPage.module.css';

export function NewReservationPage() {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dailyMileage, setDailyMileage] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (new Date(endDate) <= new Date(startDate)) {
      setError('End date must be after the start date.');
      return;
    }
    setError(null);

    navigate('/options', { state: { startDate, endDate, dailyMileage } });
  };

  return (
    <div className={styles.wrapper}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <p className={styles.title}>Plan your reservation</p>
        <p className={styles.subtitle}>Tell us when you need a car.</p>

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
          <label className={styles.label} htmlFor="dailyMileage">Estimated daily mileage (for SUV pricing)</label>
          <input
            id="dailyMileage"
            type="number"
            min={0}
            className={styles.input}
            value={dailyMileage}
            onChange={(e) => setDailyMileage(Number(e.target.value))}
          />
        </div>

        {error && <p className={styles.errorText}>{error}</p>}

        <button type="submit" className={styles.button}>See options</button>
      </form>
    </div>
  );
}