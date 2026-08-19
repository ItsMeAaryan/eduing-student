// lib/ai/gemini/services/searchService.ts
// Refactored to use /api/ai server-side proxy instead of Groq SDK directly.

import { getOptimalModelForTask } from '../models';
import { PromptBuilder } from '../prompts';
import { GeminiResponse } from '../types';

async function callAI(prompt: string, model: string, temperature = 0.7, max_tokens = 1024): Promise<GeminiResponse> {
  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature,
        max_tokens,
      }),
    });

    if (!response.ok) {
      return { success: false, error: 'Something went wrong. Please try again later.' };
    }

    const data = await response.json();
    return { success: true, text: data.text ?? '' };
  } catch (e: any) {
    console.error('[SearchService] callAI error', e);
    return { success: false, error: 'Something went wrong. Please try again later.' };
  }
}

export class NaturalLanguageSearchService {
  static async parseIntent(query: string): Promise<GeminiResponse> {
    const prompt = PromptBuilder.buildNaturalLanguageSearchPrompt(query);
    const res = await callAI(prompt, getOptimalModelForTask('medium'), 0.1, 1024);
    if (!res.success || !res.text) return res;

    try {
      const cleaned = res.text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return { success: true, data: parsed, text: res.text };
    } catch (e: any) {
      console.error('[SearchService] Parse Intent JSON Error', e);
      return { success: true, data: null, text: res.text };
    }
  }

  static async generateExplanation(query: string, results: any[]): Promise<GeminiResponse> {
    const prompt = PromptBuilder.buildSearchExplanationPrompt({ query, results: results.slice(0, 3) });
    return callAI(prompt, getOptimalModelForTask('low'), 0.7);
  }
}
