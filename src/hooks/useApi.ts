import { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

// Generic hook for API calls
export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiCall();
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'An error occurred');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  return { data, loading, error, refetch: () => fetchData() };
}

// Specific hooks for common API calls
export function useProperties(params: Record<string, any> = {}) {
  return useApi(
    () => apiService.getProperties(params),
    [JSON.stringify(params)]
  );
}

export function useProperty(id: string) {
  return useApi(
    () => apiService.getProperty(id),
    [id]
  );
}

export function useFeaturedProperties() {
  return useApi(
    () => apiService.getFeaturedProperties(),
    []
  );
}

export function useCurrentUser() {
  return useApi(
    () => apiService.getCurrentUser(),
    []
  );
}

export function useUserFavorites(userId: string | null) {
  return useApi(
    () => userId ? apiService.getUserFavorites(userId) : Promise.resolve({ properties: [] }),
    [userId]
  );
}