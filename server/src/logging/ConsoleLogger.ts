import { ILogger } from './ILogger';

export class ConsoleLogger implements ILogger {
  info(message: string): void {
    console.log(`[INFO] ${this.timestamp()} ${message}`);
  }

  warn(message: string): void {
    console.warn(`[WARN] ${this.timestamp()} ${message}`);
  }

  error(message: string, err?: unknown): void {
    console.error(`[ERROR] ${this.timestamp()} ${message}`, err ?? '');
  }

  private timestamp(): string {
    return new Date().toISOString();
  }
}