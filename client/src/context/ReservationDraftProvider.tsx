import { useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import { ReservationDraftContext } from './ReservationDraftContext.context';
import type { ReservationDraft, ReservationDraftContextValue } from './ReservationDraftContext.context';

const emptyDraft: ReservationDraft = {};

export function ReservationDraftProvider({ children }: { children: ReactNode }) {
  const [draft, setDraftState] = useState<ReservationDraft>(emptyDraft);

  const setDraft = (newDraft: ReservationDraft) => setDraftState(newDraft);
  const updateDraft = (partial: Partial<ReservationDraft>) => setDraftState((prev) => ({ ...prev, ...partial }));
  const clearDraft = () => setDraftState(emptyDraft);

  const value = useMemo<ReservationDraftContextValue>(
    () => ({ draft, setDraft, updateDraft, clearDraft }),
    [draft],
  );

  return <ReservationDraftContext.Provider value={value}>{children}</ReservationDraftContext.Provider>;
}