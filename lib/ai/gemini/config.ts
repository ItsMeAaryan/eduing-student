export const geminiConfig = {
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY || '',
  defaultModel: 'llama-3.3-70b-versatile',
  proModel: 'llama-3.3-70b-versatile',
  temperature: 0.7,
  maxTokens: 2048,
  timeoutMs: 30000,
  maxRetries: 3,
  retryDelayMs: 1000,
};
