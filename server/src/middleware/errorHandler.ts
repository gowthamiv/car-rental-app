// middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { config } from '../config/config';
import { ILogger } from '../logging/ILogger';

export function makeErrorHandler(logger: ILogger) {
  return (err: unknown, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof AppError) {
      logger.error(`${err.name}: ${err.message}`);
      return res.status(err.statusCode).json({ error: err.message });
    }

    // Unexpected/unhandled error — log full detail server-side, never leak it to the client
    logger.error('Unhandled error', err);
    return res.status(500).json({
      error: 'Internal server error',
      ...(config.isDev && err instanceof Error && { detail: err.message }),
    });
  };
}