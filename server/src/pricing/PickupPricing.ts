import { PricingStrategy } from './PricingStrategy';

export class PickupPricing implements PricingStrategy {
  private static readonly DAILY_RATE = 30;

  calculatePrice(days: number): number {
    return PickupPricing.DAILY_RATE * days;
  }
}