// hooks/useAIGeneration.ts
import { useState, useCallback } from 'react';

export function useAIGeneration<T = unknown>() {
  const [data, setData] = useState<T | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (
    apiCall: () => Promise<{ success: boolean; data?: T; text?: string; error?: string }>
  ) => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await apiCall();
      if (res.success && res.data !== undefined) {
        setData(res.data);
      } else {
        setError(res.error || res.text || 'An error occurred during AI generation.');
      }
      return res;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'An unexpected error occurred.';
      setError(msg);
      return { success: false, error: msg, data: undefined };
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsGenerating(false);
  }, []);

  return { data, setData, isGenerating, error, generate, reset };
}