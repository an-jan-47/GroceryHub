import React, { useState, useCallback } from "react";

interface LoadingStates {
  [key: string]: boolean;
}

/**
 * Hook for managing multiple loading states in a component
 */
export function useLoadingStates(initialStates: LoadingStates = {}) {
  const [loadingStates, setLoadingStates] = useState<LoadingStates>(initialStates);

  /**
   * Set a specific loading state
   * @param key Loading state identifier
   * @param isLoading Loading state value
   */
  const setLoading = useCallback((key: string, isLoading: boolean) => {
    setLoadingStates((prev) => ({
      ...prev,
      [key]: isLoading
    }));
  }, []);

  /**
   * Start loading for a specific key
   * @param key Loading state identifier
   */
  const startLoading = useCallback((key: string) => {
    setLoading(key, true);
  }, [setLoading]);

  /**
   * Stop loading for a specific key
   * @param key Loading state identifier
   */
  const stopLoading = useCallback((key: string) => {
    setLoading(key, false);
  }, [setLoading]);

  /**
   * Check if any loading state is active
   * @returns Boolean indicating if any state is loading
   */
  const isAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some(Boolean);
  }, [loadingStates]);

  /**
   * Check if a specific state is loading
   * @param key Loading state identifier
   * @returns Boolean indicating if the state is loading
   */
  const isLoading = useCallback((key: string) => {
    return !!loadingStates[key];
  }, [loadingStates]);

  /**
   * Wrap an async function with loading state management
   * @param key Loading state identifier
   * @param fn Async function to wrap
   * @returns Wrapped function that manages loading state
   */
  const withLoading = useCallback(<T extends any[], R>(
    key: string,
    fn: (...args: T) => Promise<R>
  ) => {
    return async (...args: T): Promise<R> => {
      try {
        startLoading(key);
        return await fn(...args);
      } finally {
        stopLoading(key);
      }
    };
  }, [startLoading, stopLoading]);

  return {
    loadingStates,
    setLoading,
    startLoading,
    stopLoading,
    isLoading,
    isAnyLoading,
    withLoading
  };
}
