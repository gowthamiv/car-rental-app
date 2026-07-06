import { VehicleCategory } from '../types/reservation.types';

export function calculateDays(startDate: string, endDate: string): number {
  const msPerDay = 86_400_000;
  const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / msPerDay);
  return Number.isFinite(days) && days > 0 ? days : 0;
}

// Mirrors the backend's pricing/*.ts Strategy classes exactly.
// If the backend's pricing rules ever change, update both places.
export function calculatePrice(category: VehicleCategory, days: number, dailyMileage: number = 0): number {
  switch (category) {
    case VehicleCategory.SEDAN: {
      const dailyRate = days < 10 ? 20 : 15;
      return dailyRate * days;
    }
    case VehicleCategory.VAN:
      return 22 * days;
    case VehicleCategory.SUV:
      return 15 * days + 0.5 * dailyMileage * days;
    case VehicleCategory.PICKUP_TRUCK:
      return 30 * days;
    default:
      return 0;
  }
}