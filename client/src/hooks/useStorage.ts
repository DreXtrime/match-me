import { useEffect, useState } from 'react';

interface StorageValue<T> {
  value: T;
  isLoading: boolean;
  error: string | null;
}

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void, { isLoading: boolean; error: string | null }] {
  const [storedValue, setStoredValue] = useState<StorageValue<T>>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return {
        value: item ? JSON.parse(item) : initialValue,
        isLoading: false,
        error: null,
      };
    } catch (error) {
      return {
        value: initialValue,
        isLoading: false,
        error: `Error reading from localStorage: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  });

  const setValue = (value: T) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      setStoredValue({ value, isLoading: false, error: null });
    } catch (error) {
      setStoredValue((prev) => ({
        ...prev,
        error: `Error writing to localStorage: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }));
    }
  };

  return [storedValue.value, setValue, { isLoading: storedValue.isLoading, error: storedValue.error }];
}

export function useAsync<T>(asyncFunction: () => Promise<T>, immediate = true): { value: T | null; isLoading: boolean; error: string | null } {
  const [state, setState] = useState<{ value: T | null; isLoading: boolean; error: string | null }>({
    value: null,
    isLoading: immediate,
    error: null,
  });

  useEffect(() => {
    if (!immediate) {
      return;
    }

    let isActive = true;

    asyncFunction()
      .then((response) => {
        if (isActive) {
          setState({ value: response, isLoading: false, error: null });
        }
      })
      .catch((error) => {
        if (isActive) {
          setState({ value: null, isLoading: false, error: error.message });
        }
      });

    return () => {
      isActive = false;
    };
  }, [asyncFunction, immediate]);

  return state;
}
