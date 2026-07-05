import { Request } from 'express';
import { ValidationError } from '../errors/ValidationError';

export function getRequiredParam(req: Request, name: string): string {
  const value = req.params[name];
  if (typeof value !== 'string' || value.length === 0) {
    throw new ValidationError(`Missing or invalid path parameter: ${name}`);
  }
  return value;
}