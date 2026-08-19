// hooks/useAIGeneration.ts
import { useState, useCallback } from 'react';

/** Converts any raw error (API JSON, exception message, etc.) into a friendly string. */
function toFriendlyError(raw: unknown): string {
  if (!raw) return 'Something went wrong. Please try again later.';
  const str = raw instanceof Error ? raw.message : String(raw);
  if (str.startsWith('{') || str.startsWith('[') || str.includes('API key') || str.includes('quota')) {
    return 'Something went wrong. Please try again later.';
  }
  if (str.length > 120) return 'Something went wrong. Please try again later.';
  return str || 'Something went wrong. Please try again later.';
}

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
      } else if (res.success && res.text !== undefined) {
        // Services that return raw text (not parsed JSON) use res.text
        setData(res.text as unknown as T);
      } else if (!res.success) {
        setError(res.error || 'Something went wrong. Please try again later.');
      } else {
        setError('Something went wrong. Please try again later.');
      }
      return res;
    } catch (e: unknown) {
      const friendly = toFriendlyError(e);
      setError(friendly);
      return { success: false, error: friendly, data: undefined };
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