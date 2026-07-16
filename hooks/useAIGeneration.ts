import { useState, useCallback } from 'react';

export function useAIGeneration<T = any>() {
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
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError(res.error || res.text || 'An error occurred during AI generation.');
      }
      return res;
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'An unexpected error occurred.');
      return { success: false, error: e.message, data: undefined };
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
