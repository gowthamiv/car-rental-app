import { PricingStrategy } from './PricingStrategy';

export class SedanPricing implements PricingStrategy {
  private static readonly SHORT_TERM_THRESHOLD_DAYS = 10;
  private static readonly SHORT_TERM_DAILY_RATE = 20;
  private static readonly LONG_TERM_DAILY_RATE = 15;

  calculatePrice(days: number): number {
    const dailyRate =
      days < SedanPricing.SHORT_TERM_THRESHOLD_DAYS
        ? SedanPricing.SHORT_TERM_DAILY_RATE
        : SedanPricing.LONG_TERM_DAILY_RATE;

    return dailyRate * days;
  }
}