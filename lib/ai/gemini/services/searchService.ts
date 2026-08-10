import { getGroqClient, executeWithRetry } from '../client';
import { getOptimalModelForTask } from '../models';
import { PromptBuilder } from '../prompts';
import { GeminiResponse } from '../types';
import { geminiConfig } from '../config';

export class NaturalLanguageSearchService {
  static async parseIntent(query: string): Promise<GeminiResponse> {
    const prompt = PromptBuilder.buildNaturalLanguageSearchPrompt(query);
    const client = getGroqClient();

    try {
      const completion = await executeWithRetry(() =>
        client.chat.completions.create({
          model: getOptimalModelForTask('medium'),
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1, // Low temp for deterministic JSON parsing
          max_tokens: 1024,
        })
      );

      const text = completion.choices[0]?.message?.content ?? '';
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return { success: true, data: parsed, text };
    } catch (e: any) {
      console.error('[SearchService] Parse Intent Error', e);
      return { success: false, error: 'Something went wrong. Please try again later.' };
    }
  }

  static async generateExplanation(query: string, results: any[]): Promise<GeminiResponse> {
    const prompt = PromptBuilder.buildSearchExplanationPrompt({ query, results: results.slice(0, 3) });
    const client = getGroqClient();

    try {
      const completion = await executeWithRetry(() =>
        client.chat.completions.create({
          model: getOptimalModelForTask('low'),
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        })
      );

      const text = completion.choices[0]?.message?.content ?? '';
      return { success: true, text };
    } catch (e: any) {
      console.error('[SearchService] Explanation Error', e);
      return { success: false, error: 'Something went wrong. Please try again later.' };
    }
  }
}
