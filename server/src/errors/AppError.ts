export abstract class AppError extends Error {
  abstract readonly statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    // Maintains a proper stack trace in V8 (Node) — points to where the error
    // was actually thrown, not to this base constructor
    Error.captureStackTrace?.(this, this.constructor);
  }
}