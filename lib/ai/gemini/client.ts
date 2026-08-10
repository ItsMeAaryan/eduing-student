import Groq from 'groq-sdk';
import { geminiConfig } from './config';

class GroqClient {
  private static instance: Groq | null = null;

  private constructor() {}

  public static getInstance(): Groq {
    if (!GroqClient.instance) {
      if (!geminiConfig.apiKey) {
        console.warn('[Groq Client] API key is missing. AI features will fail or run in fallback mode.');
      }
      GroqClient.instance = new Groq({
        apiKey: geminiConfig.apiKey,
        dangerouslyAllowBrowser: true,
      });
    }
    return GroqClient.instance;
  }
}

/** Returns the singleton Groq client instance. */
export const getGroqClient = () => GroqClient.getInstance();

/** Alias kept for zero import-churn in existing files. */
export const getGeminiClient = getGroqClient;

export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  retries = geminiConfig.maxRetries
): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    if (retries > 0) {
      console.warn(`[Groq Client] Operation failed. Retrying... (${retries} attempts left). Error: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, geminiConfig.retryDelayMs));
      return executeWithRetry(operation, retries - 1);
    }
    throw error;
  }
}
