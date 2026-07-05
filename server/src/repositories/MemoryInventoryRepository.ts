import { VehicleCategory } from '../domain/VehicleCategory';
import { IInventoryRepository } from './IInventoryRepository';

export class MemoryInventoryRepository implements IInventoryRepository {
  private readonly store: Map<VehicleCategory, number>;

  constructor(seedCounts?: Partial<Record<VehicleCategory, number>>) {
    // Default seed data — adjust these to whatever fleet size you want to demo with
    const defaults: Record<VehicleCategory, number> = {
      [VehicleCategory.SEDAN]: 5,
      [VehicleCategory.SUV]: 3,
      [VehicleCategory.VAN]: 4,
      [VehicleCategory.PICKUP_TRUCK]: 2,
    };
    this.store = new Map(Object.entries({ ...defaults, ...seedCounts }) as [VehicleCategory, number][]);
  }

  getTotalCount(category: VehicleCategory): number {
    return this.store.get(category) ?? 0;
  }

  setTotalCount(category: VehicleCategory, count: number): void {
    this.store.set(category, count);
  }

  getAllCategories(): VehicleCategory[] {
    return [...this.store.keys()];
  }
}