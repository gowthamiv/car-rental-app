export const VehicleCategory = {
  SEDAN: 'SEDAN',
  SUV: 'SUV',
  VAN: 'VAN',
  PICKUP_TRUCK: 'PICKUP_TRUCK',
} as const;

export type VehicleCategory = (typeof VehicleCategory)[keyof typeof VehicleCategory];

export type ReservationStatus = 'ACTIVE' | 'CANCELLED';

export interface Reservation {
  id: string;
  userId: string;
  category: VehicleCategory;
  startDate: string;
  endDate: string;
  dailyMileage?: number;
  totalPrice: number;
  status: ReservationStatus;
}

export interface PricingOption {
  category: VehicleCategory;
  totalPrice: number;
  availableCount: number;
}

// Request payload shapes — mirror the backend's Zod schemas exactly
export interface OptionsRequest {
  startDate: string;
  endDate: string;
  dailyMileage?: number;
}

export interface ReserveRequest {
  category: VehicleCategory;
  startDate: string;
  endDate: string;
  dailyMileage?: number;
}

export interface ModifyRequest {
  category?: VehicleCategory;
  startDate?: string;
  endDate?: string;
  dailyMileage?: number;
}