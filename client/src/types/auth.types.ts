// Auth
export interface RequestOtpPayload {
  mobileNumber: string;
}

export interface VerifyOtpPayload {
  mobileNumber: string;
  otp: string;
}

export interface VerifyOtpResponse {
  token: string;
  userId: string;
}