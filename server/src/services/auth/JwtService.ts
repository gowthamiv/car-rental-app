import jwt from 'jsonwebtoken';
import { config } from '../../config/config';
import { AuthenticationError } from '../../errors/AuthenticationError';

export interface JwtPayload {
  userId: string;
  mobileNumber: string;
}

export class JwtService {
  sign(payload: JwtPayload): string {
    return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
  }

  verify(token: string): JwtPayload {
    try {
      return jwt.verify(token, config.jwtSecret) as JwtPayload;
    } catch {
      throw new AuthenticationError('Invalid or expired token.');
    }
  }
}