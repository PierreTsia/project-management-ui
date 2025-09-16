import { useEffect, useState } from 'react';

export const usePersistedState = <T>(key: string, initialValue: T) => {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        return JSON.parse(stored) as T;
      }
    } catch {
      // ignore storage read errors
    }
    return initialValue;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore storage write errors
    }
  }, [key, value]);

  return [value, setValue] as const;
};

export default usePersistedState;
