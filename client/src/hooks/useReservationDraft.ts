import { useContext } from 'react';
import { ReservationDraftContext } from '../context/ReservationDraftContext.context';

export function useReservationDraft() {
  const context = useContext(ReservationDraftContext);
  if (context === undefined) {
    throw new Error('useReservationDraft must be used within a ReservationDraftProvider');
  }
  return context;
}