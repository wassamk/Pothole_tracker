// src/hooks/useGeolocation.ts
import { useState, useCallback } from 'react';
import type { GeolocationResult } from '@/types';

interface UseGeolocationReturn {
  location: GeolocationResult | null;
  error: string | null;
  loading: boolean;
  getLocation: () => void;
  clearLocation: () => void;
}

const useGeolocation = (): UseGeolocationReturn => {
  const [location, setLocation] = useState<GeolocationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setLoading(false);
      },
      (err) => {
        const messages: Record<number, string> = {
          [err.PERMISSION_DENIED]: 'location_denied',
          [err.POSITION_UNAVAILABLE]: 'Location information is unavailable.',
          [err.TIMEOUT]: 'Location request timed out.',
        };
        setError(messages[err.code] ?? 'An unknown error occurred.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    );
  }, []);

  const clearLocation = useCallback(() => {
    setLocation(null);
    setError(null);
  }, []);

  return { location, error, loading, getLocation, clearLocation };
};

export default useGeolocation;
