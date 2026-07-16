import { getGeminiClient, executeWithRetry } from '../client';
import { getOptimalModelForTask } from '../models';
import { PromptBuilder } from '../prompts';
import { GeminiResponse } from '../types';

export class NaturalLanguageSearchService {
  static async parseIntent(query: string): Promise<GeminiResponse> {
    const prompt = PromptBuilder.buildNaturalLanguageSearchPrompt(query);
    const client = getGeminiClient();
    
    try {
      const response = await executeWithRetry(async () => {
        const result = await client.models.generateContent({
          model: getOptimalModelForTask('medium'),
          contents: prompt,
          config: {
            temperature: 0.1, // Low temp for deterministic JSON parsing
            maxOutputTokens: 1024,
          }
        });
        return result;
      });
      
      const text = response.text || '';
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return { success: true, data: parsed, text };
    } catch (e: any) {
      console.error('[SearchService] Parse Intent Error', e);
      return { success: false, error: e.message };
    }
  }

  static async generateExplanation(query: string, results: any[]): Promise<GeminiResponse> {
    const prompt = PromptBuilder.buildSearchExplanationPrompt({ query, results: results.slice(0, 3) });
    const client = getGeminiClient();
    
    try {
      const response = await executeWithRetry(async () => {
        const result = await client.models.generateContent({
          model: getOptimalModelForTask('low'),
          contents: prompt,
          config: {
            temperature: 0.7,
          }
        });
        return result;
      });
      
      return { success: true, text: response.text || '' };
    } catch (e: any) {
      console.error('[SearchService] Explanation Error', e);
      return { success: false, error: e.message };
    }
  }
}
