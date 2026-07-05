// types/AuthenticatedRequest.ts
import { Request } from 'express';
import { JwtPayload } from '../services/auth/JwtService';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}