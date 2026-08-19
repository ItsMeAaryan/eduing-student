// lib/ai/gemini/config.ts
// NOTE: apiKey is intentionally empty — AI calls go through /api/ai (server-side proxy).
// The actual GROQ_API_KEY lives in server-only env vars, never exposed to the browser.
export const geminiConfig = {
  apiKey: '', // unused — kept for legacy compatibility
  defaultModel: 'llama-3.3-70b-versatile',
  proModel: 'llama-3.3-70b-versatile',
  temperature: 0.7,
  maxTokens: 2048,
  timeoutMs: 30000,
  maxRetries: 2,
  retryDelayMs: 1000,
};
