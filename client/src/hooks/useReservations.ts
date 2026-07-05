import { useState, useCallback } from 'react';
import {
  getMyReservations,
  getReservationById,
  modifyReservation as modifyReservationApi,
  cancelReservation as cancelReservationApi,
} from '../api/reservationApi';
import type { Reservation, ModifyRequest } from '../types/reservation.types';
import { extractErrorMessage } from '../utils/errorUtil';

interface UseReservationsResult {
  reservations: Reservation[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getById: (id: string) => Promise<Reservation>;
  modify: (id: string, payload: ModifyRequest) => Promise<Reservation>;
  cancel: (id: string) => Promise<void>;
}

export function useReservations(): UseReservationsResult {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getMyReservations();
      setReservations(result);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const getById = useCallback(async (id: string) => {
    return getReservationById(id);
  }, []);

  const modify = useCallback(async (id: string, payload: ModifyRequest) => {
    const updated = await modifyReservationApi(id, payload);
    await refresh(); // keep the list in sync after a successful modify
    return updated;
  }, [refresh]);

  const cancel = useCallback(async (id: string) => {
    await cancelReservationApi(id);
    await refresh(); // keep the list in sync after a successful cancel
  }, [refresh]);

  return { reservations, loading, error, refresh, getById, modify, cancel };
}