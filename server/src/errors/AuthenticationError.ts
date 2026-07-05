import { AppError } from './AppError';

export class AuthenticationError extends AppError {
  readonly statusCode = 401;
}