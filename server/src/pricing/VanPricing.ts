import { PricingStrategy } from './PricingStrategy';

export class VanPricing implements PricingStrategy {
  private static readonly DAILY_RATE = 22;

  calculatePrice(days: number): number {
    return VanPricing.DAILY_RATE * days;
  }
}