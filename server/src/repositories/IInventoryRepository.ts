import { VehicleCategory } from "../domain/VehicleCategory";

export interface IInventoryRepository {
  getTotalCount(category: VehicleCategory): number;
  setTotalCount(category: VehicleCategory, count: number): void;
  getAllCategories(): VehicleCategory[];
}