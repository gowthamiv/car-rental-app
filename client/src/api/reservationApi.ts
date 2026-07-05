import apiClient from './client';
import type {
  Reservation,
  PricingOption,
  OptionsRequest,
  ReserveRequest,
  ModifyRequest,
} from '../types/reservation.types';

export async function getOptions(payload: OptionsRequest): Promise<PricingOption[]> {
  const response = await apiClient.post<PricingOption[]>('/options', payload);
  return response.data;
}

export async function reserveCar(payload: ReserveRequest): Promise<Reservation> {
  const response = await apiClient.post<Reservation>('/reservations', payload);
  return response.data;
}

export async function getMyReservations(): Promise<Reservation[]> {
  const response = await apiClient.get<Reservation[]>('/reservations');
  return response.data;
}

export async function getReservationById(id: string): Promise<Reservation> {
  const response = await apiClient.get<Reservation>(`/reservations/${id}`);
  return response.data;
}

export async function modifyReservation(id: string, payload: ModifyRequest): Promise<Reservation> {
  const response = await apiClient.put<Reservation>(`/reservations/${id}`, payload);
  return response.data;
}

export async function cancelReservation(id: string): Promise<void> {
  await apiClient.delete(`/reservations/${id}`);
}