import { AppError } from './AppError';

export class ReservationNotFoundError extends AppError {
  readonly statusCode = 404;
}