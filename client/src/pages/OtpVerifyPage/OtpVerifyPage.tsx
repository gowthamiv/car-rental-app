import { useState } from 'react';
import type { SubmitEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyOtp, requestOtp } from '../../api/authApi';
import { useAuth } from '../../hooks/useAuth';
import { extractErrorMessage } from '../../utils/errorUtil';
import styles from './OtpVerifyPage.module.css'; // reuses the same card/form styles

interface LocationState {
  mobileNumber?: string;
  otp?: string;
  from?: { pathname: string };
}

export function OtpVerifyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const state = (location.state as LocationState) ?? {};
  const mobileNumber = state.mobileNumber;

  const [otp, setOtp] = useState(state.otp ?? '');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If someone lands here directly without going through Login first, send them back
  if (!mobileNumber) {
    navigate('/login', { replace: true });
    return null;
  }

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await verifyOtp({ mobileNumber, otp });
      login(result.token, result.userId, mobileNumber);
      const redirectTo = state.from?.pathname ?? '/new-reservation';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError(null);
    try {
      const result = await requestOtp({ mobileNumber });
      if (result.otp) setOtp(result.otp);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <p className={styles.title}>Enter code</p>
        <p className={styles.subtitle}>Sent to {mobileNumber}</p>

        {state.otp && (
        <p className="text-xs text-amber-600 text-center mb-2">
          Dev mode: code pre-filled automatically
        </p>
        )}

        <label className={styles.label} htmlFor="otp">6-digit code</label>
        <input
          id="otp"
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="123456"
          className={styles.input}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
          required
        />

        <button type="submit" className={styles.button} disabled={loading || otp.length !== 6}>
          {loading ? 'Verifying…' : 'Verify and continue'}
        </button>

        {error && <p className={styles.errorText} role="alert" aria-live="polite">{error}</p>}

        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="text-xs text-gray-400 text-center w-full mt-3 bg-transparent border-none"
        >
          {resending ? 'Resending…' : "Didn't get a code? Resend"}
        </button>
      </form>
    </div>
  );
}