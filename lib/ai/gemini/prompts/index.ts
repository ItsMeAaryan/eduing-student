export class PromptBuilder {
  static buildAdmissionsPrompt(context: any): string {
    return `You are an expert AI Admission Advisor.
Use the following structured context to provide personalized advice.
Context: ${JSON.stringify(context)}
Do not hallucinate. Base all suggestions on the context provided.`;
  }

  static buildCareerPrompt(context: any): string {
    return `You are a Career Counselor.
Based on the student's profile and branch preference, suggest optimal career paths.
Context: ${JSON.stringify(context)}`;
  }

  static buildScholarshipPrompt(context: any): string {
    return `You are a Financial Aid Expert.
The student has the following eligibility profile. Recommend steps to maximize their chances.
Context: ${JSON.stringify(context)}`;
  }

  static buildSearchPrompt(query: string, context: any): string {
    return `You are an AI Search Assistant for an educational platform.
Answer the following query using the student's context to personalize the response.
Query: ${query}
Context: ${JSON.stringify(context)}`;
  }

  static buildResumePrompt(context: any): string {
    return `You are an expert Resume Writer.
Generate a resume structure based on the provided student data.
Context: ${JSON.stringify(context)}`;
  }

  static buildSOPPrompt(context: any): string {
    return `You are a Statement of Purpose (SOP) Editor.
Draft a compelling SOP outline using the student's background.
Context: ${JSON.stringify(context)}`;
  }

  static buildInterviewPrompt(context: any): string {
    return `You are an Interview Coach.
Generate 5 personalized interview questions for this student's target program.
Context: ${JSON.stringify(context)}`;
  }

  static buildEmailPrompt(context: any, intent: string): string {
    return `You are a professional Email Generator.
Write a professional email for a student to a university admission office.
Intent: ${intent}
Context: ${JSON.stringify(context)}`;
  }
}
