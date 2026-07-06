import { useState } from 'react';
import type { SubmitEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car } from 'lucide-react';
import { requestOtp } from '../../api/authApi';
import { extractErrorMessage } from '../../utils/errorUtil';
import styles from './LoginPage.module.css';

export function LoginPage() {
  const navigate = useNavigate();
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await requestOtp({ mobileNumber });
      // result.otp only exists in dev mode (config.isDev on the backend) — undefined in production
      navigate('/verify-otp', { state: { mobileNumber, otp: result.otp } });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <div className={styles.iconCircle}>
          <Car size={22} className="text-blue-600" />
        </div>
        <p className={styles.title}>Log in to reserve</p>
        <p className={styles.subtitle}>We'll text you a one-time code.</p>

        <label className={styles.label} htmlFor="mobileNumber">Mobile number</label>
        <input
          id="mobileNumber"
          type="tel"
          placeholder="+1 (415) 555-0172"
          className={styles.input}
          value={mobileNumber}
          onChange={(e) => setMobileNumber(e.target.value)}
          required
        />

        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? 'Sending…' : 'Send code'}
        </button>

        {error && <p className={styles.errorText} role="alert" aria-live="polite">{error}</p>}
      </form>
    </div>
  );
}