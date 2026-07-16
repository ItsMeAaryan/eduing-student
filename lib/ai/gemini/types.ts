export type GeminiModel = 'gemini-2.5-flash' | 'gemini-2.5-pro';

export interface GeminiResponse<T = any> {
  success: boolean;
  data?: T;
  text?: string;
  error?: string;
  isFallback?: boolean;
}

export interface PromptConfig {
  model?: GeminiModel;
  temperature?: number;
  maxTokens?: number;
  systemInstruction?: string;
}

export interface AIContext {
  studentProfile: any;
  computedScores: {
    profileStrength: number;
    probabilityScore?: number;
    scholarshipScore?: number;
  };
  additionalContext?: any;
}
