import { getGeminiClient, executeWithRetry } from '../client';
import { MODELS, getOptimalModelForTask } from '../models';
import { PromptBuilder } from '../prompts';
import { GeminiResponse, PromptConfig } from '../types';
import { geminiConfig } from '../config';

async function generateAIResponse(
  prompt: string, 
  config?: PromptConfig
): Promise<GeminiResponse> {
  try {
    const client = getGeminiClient();
    const modelName = config?.model || geminiConfig.defaultModel;
    
    // Fallback if API key is missing
    if (!geminiConfig.apiKey) {
      return {
        success: true,
        text: "AI capabilities are currently in fallback mode due to missing API key configuration.",
        isFallback: true
      };
    }

    const response = await executeWithRetry(async () => {
      // NOTE: @google/genai syntax is client.models.generateContent
      const result = await client.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          temperature: config?.temperature || geminiConfig.temperature,
          maxOutputTokens: config?.maxTokens || geminiConfig.maxTokens,
          systemInstruction: config?.systemInstruction
        }
      });
      return result;
    });

    return {
      success: true,
      text: response.text || ''
    };
  } catch (error: any) {
    console.error('[Gemini Service Error]', error);
    return {
      success: false,
      error: error.message || 'An unknown error occurred during AI generation'
    };
  }
}

export class AdmissionAdvisorService {
  static async getAdvice(context: any): Promise<GeminiResponse> {
    const prompt = PromptBuilder.buildAdmissionsPrompt(context);
    return generateAIResponse(prompt, { model: getOptimalModelForTask('medium') });
  }
}

export class CareerAdvisorService {
  static async getCareerPaths(context: any): Promise<GeminiResponse> {
    const prompt = PromptBuilder.buildCareerPrompt(context);
    return generateAIResponse(prompt, { model: getOptimalModelForTask('high') });
  }
}

export class ScholarshipService {
  static async getFinancialAdvice(context: any): Promise<GeminiResponse> {
    const prompt = PromptBuilder.buildScholarshipPrompt(context);
    return generateAIResponse(prompt, { model: getOptimalModelForTask('medium') });
  }
}

export class UniversityComparisonService {
  static async compare(universityA: string, universityB: string, context: any): Promise<GeminiResponse> {
    const prompt = `Compare ${universityA} and ${universityB} for this student context: ${JSON.stringify(context)}`;
    return generateAIResponse(prompt, { model: getOptimalModelForTask('high') });
  }
}

export class SearchService {
  static async naturalLanguageSearch(query: string, context: any): Promise<GeminiResponse> {
    const prompt = PromptBuilder.buildSearchPrompt(query, context);
    return generateAIResponse(prompt, { model: getOptimalModelForTask('low') });
  }
}

export class CopilotService {
  static async processChat(message: string, context: any): Promise<GeminiResponse> {
    const prompt = `Student Message: ${message}\nContext: ${JSON.stringify(context)}`;
    return generateAIResponse(prompt, { 
      model: getOptimalModelForTask('high'),
      systemInstruction: 'You are the EDUING AI Copilot. Assist the student with their admission journey.' 
    });
  }
}
