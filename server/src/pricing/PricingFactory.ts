import { PricingStrategy } from './PricingStrategy';
import { SedanPricing } from './SedanPricing';
import { SuvPricing } from './SuvPricing';
import { VanPricing } from './VanPricing';
import { PickupPricing } from './PickupPricing';
import { VehicleCategory } from '../domain/VehicleCategory';

export class PricingFactory {
  private strategies = new Map<VehicleCategory, PricingStrategy>([
    [VehicleCategory.SEDAN, new SedanPricing()],
    [VehicleCategory.SUV, new SuvPricing()],
    [VehicleCategory.VAN, new VanPricing()],
    [VehicleCategory.PICKUP_TRUCK, new PickupPricing()],
  ]);

  getStrategy(category: VehicleCategory): PricingStrategy {
    const strategy = this.strategies.get(category);
    if (!strategy) throw new Error(`No pricing strategy for ${category}`);
    return strategy;
  }
}