// src/constants/categories.ts
import { VehicleCategory } from '../types/reservation.types';

export interface CategoryConfig {
  displayName: string;
  badgeClassName: string;   // Tailwind classes for the colored badge, used consistently everywhere
  iconName: 'car' | 'car-front' | 'bus' | 'truck'; // mapped to a lucide-react icon in the component layer, not here
}

export const CATEGORY_CONFIG: Record<VehicleCategory, CategoryConfig> = {
  [VehicleCategory.SEDAN]: {
    displayName: 'Sedan',
    badgeClassName: 'bg-green-100 text-green-700',
    iconName: 'car',
  },
  [VehicleCategory.SUV]: {
    displayName: 'SUV',
    badgeClassName: 'bg-blue-100 text-blue-700',
    iconName: 'car-front',
  },
  [VehicleCategory.VAN]: {
    displayName: 'Van',
    badgeClassName: 'bg-amber-100 text-amber-700',
    iconName: 'bus',
  },
  [VehicleCategory.PICKUP_TRUCK]: {
    displayName: 'Pickup Truck',
    badgeClassName: 'bg-red-100 text-red-700',
    iconName: 'truck',
  },
};

// Preserves a fixed display order across every screen (Get Options, dropdowns, etc.)
// rather than relying on Object.values() key iteration order, which is technically
// reliable for string enums in JS but worth being explicit about.
export const ALL_CATEGORIES: VehicleCategory[] = [
  VehicleCategory.SEDAN,
  VehicleCategory.SUV,
  VehicleCategory.VAN,
  VehicleCategory.PICKUP_TRUCK,
];

export function getCategoryConfig(category: VehicleCategory): CategoryConfig {
  return CATEGORY_CONFIG[category];
}