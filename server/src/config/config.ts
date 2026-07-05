// src/config/config.ts

interface Config {
  port: number;
  jwtSecret: string;
  jwtExpiresIn: number;
  otpTtlMs: number;
  otpLength: number;
  nodeEnv: 'development' | 'production' | 'test';
  isDev: boolean;
}

export const config: Config = {
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-change-in-production',
  jwtExpiresIn: Number(process.env.JWT_EXPIRES_IN_SECONDS ?? 7200), // 2 hours
  otpTtlMs: Number(process.env.OTP_TTL_MS ?? 5 * 60 * 1000), // 5 minutes
  otpLength: 6,
  nodeEnv: (process.env.NODE_ENV as Config['nodeEnv']) ?? 'development',
  get isDev() { return this.nodeEnv === 'development'; },
};