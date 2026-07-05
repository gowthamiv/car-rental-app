import { config } from '../../config/config';
import { AuthenticationError } from '../../errors/AuthenticationError';

interface OtpRecord {
  otp: string;
  expiresAt: number;
}

export class OtpService {
  private readonly store = new Map<string, OtpRecord>();

  /** Generates a new OTP for a mobile number, overwriting any existing one */
  generate(mobileNumber: string): string {
    const otp = this.generateNumericCode(config.otpLength);
    this.store.set(mobileNumber, {
      otp,
      expiresAt: Date.now() + config.otpTtlMs,
    });
    return otp;
  }

  /** Verifies and consumes the OTP — a code can only be used once, whether correct or not */
  verify(mobileNumber: string, otp: string): void {
    const record = this.store.get(mobileNumber);

    if (!record) {
      throw new AuthenticationError('No OTP was requested for this number.');
    }

    // Always remove the record once checked — prevents replay of a used or stale code
    this.store.delete(mobileNumber);

    if (Date.now() > record.expiresAt) {
      throw new AuthenticationError('OTP has expired. Please request a new one.');
    }

    if (record.otp !== otp) {
      throw new AuthenticationError('Incorrect OTP.');
    }
  }

  private generateNumericCode(length: number): string {
    const min = 10 ** (length - 1);
    const max = 10 ** length - 1;
    return String(Math.floor(min + Math.random() * (max - min + 1)));
  }
}