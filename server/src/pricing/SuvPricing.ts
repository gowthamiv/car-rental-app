import { PricingStrategy } from './PricingStrategy';

export class SuvPricing implements PricingStrategy {
  private static readonly DAILY_RATE = 15;
  private static readonly RATE_PER_MILE = 0.5;

  calculatePrice(days: number, dailyMileage: number = 0): number {
    const baseCost = SuvPricing.DAILY_RATE * days;
    const totalMileage = dailyMileage * days;
    const mileageCost = SuvPricing.RATE_PER_MILE * totalMileage;

    return baseCost + mileageCost;
  }
}