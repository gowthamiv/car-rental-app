// middleware/authMiddleware.ts
import { Response, NextFunction } from 'express';
import { JwtService } from '../services/auth/JwtService';
import { AuthenticationError } from '../errors/AuthenticationError';
import { AuthenticatedRequest } from '../types/AuthenticatedRequest';

export function makeAuthMiddleware(jwtService: JwtService) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const rawHeader = req.headers.authorization;
    const header = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;

    if (!header?.startsWith('Bearer ')) {
      return next(new AuthenticationError('Missing or malformed Authorization header.'));
    }

    const token = header.slice('Bearer '.length);
    try {
      req.user = jwtService.verify(token);
      next();
    } catch (err) {
      next(err);
    }
  };
}