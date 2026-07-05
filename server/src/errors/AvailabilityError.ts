import { AppError } from './AppError';

export class AvailabilityError extends AppError {
  readonly statusCode = 409; // Conflict — the requested slot/category is unavailable
}