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
    const prompt = PromptBuilder.buildCareerAdvisorPrompt(context);
    const response = await generateAIResponse(prompt, { model: getOptimalModelForTask('high') });
    if (response.success && response.text) {
      try {
        const cleanedText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanedText);
        return { success: true, data: parsed, text: response.text };
      } catch (e) {
        console.error('Failed to parse Gemini career JSON', e);
        return { success: true, data: null, text: response.text };
      }
    }
    return response;
  }
}
export class SOPService {
  static async generateSOP(context: any, mode: string = 'Formal Tone'): Promise<GeminiResponse> {
    const prompt = PromptBuilder.buildSOPPrompt(context, mode);
    const response = await generateAIResponse(prompt, { model: getOptimalModelForTask('high') });
    if (response.success && response.text) {
      try {
        const cleanedText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanedText);
        return { success: true, data: parsed, text: response.text };
      } catch (e) {
        console.error('Failed to parse Gemini SOP generation JSON', e);
        return { success: true, data: null, text: response.text };
      }
    }
    return response;
  }

  static async reviewSOP(sopContent: string, context: any): Promise<GeminiResponse> {
    const prompt = PromptBuilder.buildSOPReviewPrompt(sopContent, context);
    const response = await generateAIResponse(prompt, { model: getOptimalModelForTask('high') });
    if (response.success && response.text) {
      try {
        const cleanedText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanedText);
        return { success: true, data: parsed, text: response.text };
      } catch (e) {
        console.error('Failed to parse Gemini SOP review JSON', e);
        return { success: true, data: null, text: response.text };
      }
    }
    return response;
  }
}
export class ScholarshipService {
  static async getFinancialAdvice(context: any): Promise<GeminiResponse> {
    const prompt = PromptBuilder.buildScholarshipPrompt(context);
    return generateAIResponse(prompt, { model: getOptimalModelForTask('medium') });
  }
}

export class UniversityComparisonService {
  static async compare(universities: any[], context: any): Promise<GeminiResponse> {
    const prompt = PromptBuilder.buildUniversityComparisonPrompt({ universities, studentContext: context });
    const response = await generateAIResponse(prompt, { model: getOptimalModelForTask('high') });
    
    if (response.success && response.text) {
      try {
        const cleanedText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanedText);
        return { success: true, data: parsed, text: response.text };
      } catch (e) {
        console.error('Failed to parse Gemini comparison JSON', e);
        // Fallback
        return { success: true, data: null, text: response.text };
      }
    }
    return response;
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

export class ResumeService {
  static async generateResume(context: any, mode: string = 'Professional Resume'): Promise<GeminiResponse> {
    const prompt = PromptBuilder.buildResumePrompt(context, mode);
    const response = await generateAIResponse(prompt, { model: getOptimalModelForTask('high') });
    if (response.success && response.text) {
      try {
        const cleanedText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanedText);
        return { success: true, data: parsed, text: response.text };
      } catch (e) {
        console.error('Failed to parse Gemini Resume generation JSON', e);
        return { success: true, data: null, text: response.text };
      }
    }
    return response;
  }

  static async reviewResume(resumeContent: string, context: any): Promise<GeminiResponse> {
    const prompt = PromptBuilder.buildResumeReviewPrompt(resumeContent, context);
    const response = await generateAIResponse(prompt, { model: getOptimalModelForTask('high') });
    if (response.success && response.text) {
      try {
        const cleanedText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanedText);
        return { success: true, data: parsed, text: response.text };
      } catch (e) {
        console.error('Failed to parse Gemini Resume review JSON', e);
        return { success: true, data: null, text: response.text };
      }
    }
    return response;
  }
}
