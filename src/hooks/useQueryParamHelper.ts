import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export interface QueryParamConfig {
  // Define the shape of your filter object
  [key: string]: unknown;
}

export interface QueryParamMapping<T> {
  // Map URL parameter names to filter object keys
  [urlParam: string]: keyof T;
}

export interface QueryParamOptions<T> {
  // Configuration for the hook
  mapping: QueryParamMapping<T>;
  defaultValues: Partial<T>;
  // Custom serializers/deserializers for complex types
  serializers?: {
    [K in keyof T]?: {
      serialize: (value: unknown) => string | undefined;
      deserialize: (value: string) => unknown;
    };
  };
}

export function useQueryParamHelper<T extends QueryParamConfig>(
  options: QueryParamOptions<T>
) {
  const { mapping, defaultValues, serializers = {} } = options;

  const [searchParams, setSearchParams] = useSearchParams();

  // Extract values from URL parameters
  const urlValues = useMemo(() => {
    const values: Partial<T> = {};

    Object.entries(mapping).forEach(([urlParam, filterKey]) => {
      const urlValue = searchParams.get(urlParam);
      if (urlValue !== null) {
        const serializer = (
          serializers as Record<
            string,
            {
              serialize: (value: unknown) => string | undefined;
              deserialize: (value: string) => unknown;
            }
          >
        )[filterKey as string];
        if (serializer) {
          try {
            (values as Record<string, unknown>)[filterKey as string] =
              serializer.deserialize(urlValue);
          } catch (error) {
            console.warn(`Failed to deserialize ${urlParam}:`, error);
          }
        } else {
          // Default string handling
          (values as Record<string, unknown>)[filterKey as string] = urlValue;
        }
      }
    });

    return values;
  }, [searchParams, mapping, serializers]);

  // Merge URL values with default values to get current filters
  const filters = useMemo(
    () => ({
      ...defaultValues,
      ...urlValues,
    }),
    [defaultValues, urlValues]
  );

  // Check if there are any active URL parameters
  const hasUrlParams = useMemo(() => {
    return Object.values(urlValues).some(
      value => value !== undefined && value !== null && value !== ''
    );
  }, [urlValues]);

  // Update URL parameters
  const updateUrlParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const newParams = new URLSearchParams(searchParams);

      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === '') {
          newParams.delete(key);
        } else {
          newParams.set(key, value);
        }
      });

      setSearchParams(newParams);
    },
    [searchParams, setSearchParams]
  );

  // Update filters and sync with URL
  const updateFilters = useCallback(
    (newFilters: Partial<T>, resetPage = true) => {
      // Update URL parameters
      const urlUpdates: Record<string, string | undefined> = {};

      if (resetPage) {
        urlUpdates.page = '1';
      }

      Object.entries(newFilters).forEach(([filterKey, value]) => {
        // Find the corresponding URL parameter
        const urlParam = Object.entries(mapping).find(
          ([, mappedKey]) => mappedKey === filterKey
        )?.[0];

        if (urlParam && value !== undefined) {
          const serializer = (
            serializers as Record<
              string,
              {
                serialize: (value: unknown) => string | undefined;
                deserialize: (value: string) => unknown;
              }
            >
          )[filterKey as string];
          if (serializer) {
            urlUpdates[urlParam] = serializer.serialize(value);
          } else {
            // Default string conversion
            urlUpdates[urlParam] = String(value);
          }
        }
      });

      updateUrlParams(urlUpdates);
    },
    [mapping, serializers, updateUrlParams]
  );

  // Update pagination
  const updatePage = useCallback(
    (page: number) => {
      updateUrlParams({ page: String(page) });
    },
    [updateUrlParams]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    // Get current search params directly to avoid stale closure
    const currentParams = new URLSearchParams(window.location.search);

    // Remove only the parameters that are in our mapping
    Object.keys(mapping).forEach(urlParam => {
      currentParams.delete(urlParam);
    });

    // Reset page to 1
    currentParams.set('page', '1');

    // Preserve all other parameters (like viewType) by using the new URLSearchParams directly
    setSearchParams(currentParams);
  }, [mapping, setSearchParams]);

  return {
    filters,
    hasUrlParams,
    updateFilters,
    updatePage,
    clearFilters,
    updateUrlParams,
  };
}

// Predefined serializers for common types
export const queryParamSerializers = {
  boolean: {
    serialize: (value: unknown) => (value ? 'true' : undefined),
    deserialize: (value: string) => value === 'true',
  },
  number: {
    serialize: (value: unknown) =>
      value !== undefined ? String(value) : undefined,
    deserialize: (value: string) => parseInt(value, 10),
  },
  date: {
    serialize: (value: unknown) => value as string | undefined,
    deserialize: (value: string) => value,
  },
  array: {
    serialize: (value: unknown) =>
      value ? (value as string[]).join(',') : undefined,
    deserialize: (value: string) => value.split(',').filter(Boolean),
  },
} as const;
