import { AIContext } from '../types';

export class ContextBuilder {
  static buildStudentContext(data: any): AIContext {
    return {
      studentProfile: data.profile || {},
      computedScores: {
        profileStrength: data.profileScore || 0
      },
      additionalContext: {
        documents: data.documents?.length || 0,
        applications: data.applications?.length || 0
      }
    };
  }

  static buildRecommendationContext(data: any, recommendationOutput: any): AIContext {
    const base = this.buildStudentContext(data);
    base.additionalContext.recommendations = recommendationOutput;
    return base;
  }

  static buildProbabilityContext(data: any, probabilityOutput: any): AIContext {
    const base = this.buildStudentContext(data);
    base.computedScores.probabilityScore = probabilityOutput.overallProbability;
    base.additionalContext.probabilityDetails = probabilityOutput;
    return base;
  }

  static buildScholarshipContext(data: any, scholarshipOutput: any): AIContext {
    const base = this.buildStudentContext(data);
    base.additionalContext.scholarships = scholarshipOutput;
    return base;
  }

  static buildDeadlineContext(data: any, deadlineOutput: any): AIContext {
    const base = this.buildStudentContext(data);
    base.additionalContext.deadlines = deadlineOutput;
    return base;
  }

  static buildChecklistContext(data: any, checklistOutput: any): AIContext {
    const base = this.buildStudentContext(data);
    base.additionalContext.checklist = checklistOutput;
    return base;
  }
}
