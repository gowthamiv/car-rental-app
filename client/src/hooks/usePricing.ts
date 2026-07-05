import { useState } from 'react';
import { getOptions } from '../api/reservationApi';
import type { PricingOption, OptionsRequest } from '../types/reservation.types';
import { extractErrorMessage } from '../utils/errorUtil';

interface UsePricingResult {
  options: PricingOption[];
  loading: boolean;
  error: string | null;
  fetchOptions: (request: OptionsRequest) => Promise<void>;
}

export function usePricing(): UsePricingResult {
  const [options, setOptions] = useState<PricingOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOptions = async (request: OptionsRequest) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getOptions(request);
      setOptions(result);
    } catch (err) {
      setError(extractErrorMessage(err));
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  return { options, loading, error, fetchOptions };
}