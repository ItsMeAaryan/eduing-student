import { getGroqClient, executeWithRetry } from '../client';
import { MODELS, getOptimalModelForTask } from '../models';
import { PromptBuilder } from '../prompts';
import { GeminiResponse, PromptConfig } from '../types';
import { geminiConfig } from '../config';

/** Rename: was parseGeminiResponse — logic unchanged, provider-agnostic. */
function parseAIResponse(response: GeminiResponse, contextName: string): GeminiResponse {
  if (response.success && response.text) {
    try {
      const cleanedText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanedText);

      // Normalize sections[].content to string — Groq can return arrays or other types
      if (parsed && Array.isArray(parsed.sections)) {
        parsed.sections = parsed.sections.map((sec: any) => ({
          ...sec,
          content: Array.isArray(sec.content)
            ? sec.content.join('\n')
            : String(sec.content ?? ''),
        }));
      }

      return { success: true, data: parsed, text: response.text };
    } catch (e) {
      console.error(`Failed to parse AI ${contextName} JSON`, e);
      return { success: true, data: null, text: response.text };
    }
  }
  return response;
}

async function generateAIResponse(
  prompt: string,
  config?: PromptConfig
): Promise<GeminiResponse> {
  try {
    // Fallback if API key is missing
    if (!geminiConfig.apiKey) {
      return {
        success: true,
        text: 'AI capabilities are currently in fallback mode due to missing API key configuration.',
        isFallback: true,
      };
    }

    const client = getGroqClient();
    const modelName = config?.model || geminiConfig.defaultModel;

    // Build messages array — prepend system instruction if provided
    const messages: { role: 'system' | 'user'; content: string }[] = [];
    if (config?.systemInstruction) {
      messages.push({ role: 'system', content: config.systemInstruction });
    }
    messages.push({ role: 'user', content: prompt });

    const completion = await executeWithRetry(() =>
      client.chat.completions.create({
        model: modelName,
        messages,
        temperature: config?.temperature ?? geminiConfig.temperature,
        max_tokens: config?.maxTokens ?? geminiConfig.maxTokens,
      })
    );

    const text = completion.choices[0]?.message?.content ?? '';
    return { success: true, text };
  } catch (error: any) {
    console.error('[Groq Service Error]', error);
    return {
      success: false,
      error: 'Something went wrong. Please try again later.',
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
    return parseAIResponse(response, 'career');
  }
}

export class SOPService {
  static async generateSOP(context: any, mode: string = 'Formal Tone'): Promise<GeminiResponse> {
    const prompt = PromptBuilder.buildSOPPrompt(context, mode);
    const response = await generateAIResponse(prompt, { model: getOptimalModelForTask('high') });
    return parseAIResponse(response, 'SOP generation');
  }

  static async reviewSOP(sopContent: string, context: any): Promise<GeminiResponse> {
    const prompt = PromptBuilder.buildSOPReviewPrompt(sopContent, context);
    const response = await generateAIResponse(prompt, { model: getOptimalModelForTask('high') });
    return parseAIResponse(response, 'SOP review');
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
    return parseAIResponse(response, 'comparison');
  }
}

export class SearchService {
  static async naturalLanguageSearch(query: string, context: any): Promise<GeminiResponse> {
    const prompt = PromptBuilder.buildSearchPrompt(query, context);
    return generateAIResponse(prompt, { model: getOptimalModelForTask('low') });
  }
}

export class CopilotService {
  static async processChat(
    message: string,
    context: any,
    history: { role: 'user' | 'assistant'; content: string }[] = []
  ): Promise<GeminiResponse> {
    // Build a multi-turn formatted history for context
    const historyText = history.length > 0
      ? history.map(m => `${m.role === 'user' ? 'Student' : 'Advisor'}: ${m.content}`).join('\n')
      : '';

    const prompt = [
      historyText,
      `Student: ${message}`,
      `Context: ${JSON.stringify(context)}`,
    ].filter(Boolean).join('\n\n');

    return generateAIResponse(prompt, {
      model: getOptimalModelForTask('high'),
      systemInstruction:
        'You are an expert Indian university admissions counselor. Help the student with college selection, entrance exams, career planning, and application strategy. Be specific, actionable, and encouraging. Format your responses clearly with bullet points or numbered lists when appropriate.',
    });
  }
}

export class ResumeService {
  static async generateResume(context: any, mode: string = 'Professional Resume'): Promise<GeminiResponse> {
    const prompt = PromptBuilder.buildResumePrompt(context, mode);
    const response = await generateAIResponse(prompt, { model: getOptimalModelForTask('high') });
    return parseAIResponse(response, 'Resume generation');
  }

  static async reviewResume(resumeContent: string, context: any): Promise<GeminiResponse> {
    const prompt = PromptBuilder.buildResumeReviewPrompt(resumeContent, context);
    const response = await generateAIResponse(prompt, { model: getOptimalModelForTask('high') });
    return parseAIResponse(response, 'Resume review');
  }
}

export class EmailService {
  static async generateEmail(context: any, intent: string): Promise<GeminiResponse> {
    const prompt = PromptBuilder.buildEmailPrompt(context, intent);
    const response = await generateAIResponse(prompt, { model: getOptimalModelForTask('high') });
    return parseAIResponse(response, 'Email generation');
  }

  static async reviewEmail(emailContent: string, context: any): Promise<GeminiResponse> {
    const prompt = PromptBuilder.buildEmailReviewPrompt(emailContent, context);
    const response = await generateAIResponse(prompt, { model: getOptimalModelForTask('high') });
    return parseAIResponse(response, 'Email review');
  }
}

export class InterviewService {
  static async generateQuestion(context: any, interviewType: string, previousQuestions: string[]): Promise<GeminiResponse> {
    const prompt = PromptBuilder.buildInterviewPrompt(context, interviewType, previousQuestions);
    const response = await generateAIResponse(prompt, { model: getOptimalModelForTask('high') });
    return parseAIResponse(response, 'Interview generation');
  }

  static async evaluateAnswer(question: string, answer: string, context: any): Promise<GeminiResponse> {
    const prompt = PromptBuilder.buildInterviewEvaluationPrompt(question, answer, context);
    const response = await generateAIResponse(prompt, { model: getOptimalModelForTask('high') });
    return parseAIResponse(response, 'Interview evaluate');
  }
}
