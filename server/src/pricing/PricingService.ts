import { VehicleCategory } from '../domain/VehicleCategory';
import { PricingFactory } from './PricingFactory';

export class PricingService {
  constructor(private readonly pricingFactory: PricingFactory) {}

  /**
   * Calculates the total price for a single category, given a duration
   * and (for SUV only) a daily mileage estimate.
   */
  priceFor(category: VehicleCategory, days: number, dailyMileage?: number): number {
    const strategy = this.pricingFactory.getStrategy(category);
    return strategy.calculatePrice(days, dailyMileage);
  }

  /**
   * Calculates prices for every category at once — used by getOptions(),
   * which needs to compare all 4 categories and sort by price.
   */
  priceAllCategories(days: number, dailyMileage?: number): { category: VehicleCategory; totalPrice: number }[] {
    return Object.values(VehicleCategory).map((category) => ({
      category,
      totalPrice: this.priceFor(category, days, dailyMileage),
    }));
  }
}