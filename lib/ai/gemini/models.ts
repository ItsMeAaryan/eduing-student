import { geminiConfig } from './config';
import { GeminiModel } from './types';

export const MODELS = {
  FLASH: geminiConfig.defaultModel as GeminiModel,
  PRO: geminiConfig.proModel as GeminiModel,
};

export function getOptimalModelForTask(taskComplexity: 'low' | 'medium' | 'high'): GeminiModel {
  if (taskComplexity === 'high') {
    return MODELS.PRO;
  }
  return MODELS.FLASH;
}
