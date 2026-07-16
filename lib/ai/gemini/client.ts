import { GoogleGenAI } from '@google/genai';
import { geminiConfig } from './config';

class GeminiClient {
  private static instance: GoogleGenAI | null = null;

  private constructor() {}

  public static getInstance(): GoogleGenAI {
    if (!GeminiClient.instance) {
      if (!geminiConfig.apiKey) {
        console.warn('[Gemini Client] API key is missing. AI features will fail or run in fallback mode.');
      }
      GeminiClient.instance = new GoogleGenAI({
        apiKey: geminiConfig.apiKey
      });
    }
    return GeminiClient.instance;
  }
}

export const getGeminiClient = () => GeminiClient.getInstance();

export async function executeWithRetry<T>(
  operation: () => Promise<T>, 
  retries = geminiConfig.maxRetries
): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    if (retries > 0) {
      console.warn(`[Gemini Client] Operation failed. Retrying... (${retries} attempts left). Error: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, geminiConfig.retryDelayMs));
      return executeWithRetry(operation, retries - 1);
    }
    throw error;
  }
}
