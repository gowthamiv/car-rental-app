import apiClient from './client';
import type { RequestOtpPayload, VerifyOtpPayload, VerifyOtpResponse } from '../types/auth.types';

export async function requestOtp(payload: RequestOtpPayload): Promise<{ message: string; otp?: string }> {
  const response = await apiClient.post('/auth/request-otp', payload);
  return response.data;
}

export async function verifyOtp(payload: VerifyOtpPayload): Promise<VerifyOtpResponse> {
  const response = await apiClient.post<VerifyOtpResponse>('/auth/verify-otp', payload);
  return response.data;
}