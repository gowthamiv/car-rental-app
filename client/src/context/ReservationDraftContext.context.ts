import { createContext } from 'react';
import type { VehicleCategory } from '../types/reservation.types';

export interface ReservationDraft {
  category?: VehicleCategory;
  startDate?: string;
  endDate?: string;
  dailyMileage?: number;
  totalPrice?: number;
}

export interface ReservationDraftContextValue {
  draft: ReservationDraft;
  setDraft: (draft: ReservationDraft) => void;
  updateDraft: (partial: Partial<ReservationDraft>) => void;
  clearDraft: () => void;
}

export const ReservationDraftContext = createContext<ReservationDraftContextValue | undefined>(undefined);