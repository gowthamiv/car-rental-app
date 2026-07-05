import { z } from 'zod';

export const requestOtpSchema = z.object({
  mobileNumber: z.string().min(7, 'Mobile number is too short').max(15, 'Mobile number is too long'),
});

export const verifyOtpSchema = z.object({
  mobileNumber: z.string().min(7).max(15),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});