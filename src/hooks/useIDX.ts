import { useState, useEffect } from 'react';
import { idxService } from '../services/idxService';
import { Property } from '../types/property';

// Hook for IDX featured properties
export function useIDXFeatured() {
  const [data, setData] = useState<{ properties: Property[]; total: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await idxService.getFeaturedProperties();
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
  }, []);

  return { data, loading, error };
}

// Hook for IDX property search
export function useIDXSearch(searchParams: any = null, enabled: boolean = true) {
  const [data, setData] = useState<{ 
    properties: Property[]; 
    total: number; 
    offset: number; 
    limit: number; 
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (params: any) => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);
      const result = await idxService.searchProperties(params);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (enabled && searchParams) {
      search(searchParams);
    }
  }, [JSON.stringify(searchParams), enabled]);

  return { data, loading, error, search };
}

// Hook for single IDX property
export function useIDXProperty(listingId: string | null) {
  const [data, setData] = useState<{ property: Property } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!listingId) return;

    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await idxService.getProperty(listingId);
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
  }, [listingId]);

  return { data, loading, error };
}

// Hook for IDX property photos
export function useIDXPropertyPhotos(listingId: string | null) {
  const [data, setData] = useState<{ 
    photos: Array<{ url: string; caption: string; order: number }> 
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!listingId) return;

    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await idxService.getPropertyPhotos(listingId);
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
  }, [listingId]);

  return { data, loading, error };
}

// Hook for all IDX listings
export function useIDXListings() {
  const [data, setData] = useState<{ properties: Property[]; total: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await idxService.getAllListings();
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
  }, []);

  return { data, loading, error };
}

// Hook for sold/pending properties
export function useIDXSoldPending() {
  const [data, setData] = useState<{ properties: Property[]; total: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await idxService.getSoldPendingProperties();
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
  }, []);

  return { data, loading, error };
}

// Hook for IDX sync operation
export function useIDXSync() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ 
    message: string; 
    total: number; 
    synced: number; 
    updated: number; 
  } | null>(null);

  const sync = async () => {
    try {
      setLoading(true);
      setError(null);
      const syncResult = await idxService.syncProperties();
      setResult(syncResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return { sync, loading, error, result };
}

// Hook for advanced search with multiple filters
export function useIDXAdvancedSearch() {
  const [data, setData] = useState<{ properties: Property[]; total: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (filters: {
    location?: { city?: string; state?: string; zipcode?: string };
    price?: { min?: number; max?: number };
    size?: { minBeds?: number; minBaths?: number; minSqft?: number; maxSqft?: number };
    type?: string;
    features?: string[];
  }) => {
    try {
      setLoading(true);
      setError(null);
      const result = await idxService.advancedSearch(filters);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, search };
}