// lib/ai/gemini/client.ts
// NOTE: This Groq client is no longer used for direct browser calls.
// All AI generation is now proxied through /api/ai (server-side).
// This file is kept for structural completeness and server-side use only.

import { geminiConfig } from './config';

export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  retries = geminiConfig.maxRetries
): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    if (retries > 0) {
      console.warn(`[AI Client] Operation failed. Retrying... (${retries} attempts left). Error: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, geminiConfig.retryDelayMs));
      return executeWithRetry(operation, retries - 1);
    }
    throw error;
  }
}
