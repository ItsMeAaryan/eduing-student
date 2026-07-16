import { recommendUniversities } from './recommendationEngine';

export interface ProbabilityResult {
  overallProbability: number;
  probabilityLabel: 'Very High' | 'High' | 'Moderate' | 'Low' | 'Very Low';
  confidence: 'High' | 'Medium' | 'Low';
  strengths: string[];
  weaknesses: string[];
  missingRequirements: string[];
  improvementSuggestions: string[];
}

export function calculateAdmissionProbability(
  studentData: {
    profile: any;
    documents: any[];
    applications: any[];
    savedPrograms: any[];
    profileScore?: number;
  },
  university: any
): ProbabilityResult {
  const profileScore = studentData.profileScore || 0;

  // 1. Empty/Insufficient state
  if (!studentData.profile || profileScore < 20) {
    return {
      overallProbability: 0,
      probabilityLabel: 'Very Low',
      confidence: 'Low',
      strengths: [],
      weaknesses: [],
      missingRequirements: ['Profile is significantly incomplete'],
      improvementSuggestions: ['Complete your profile to get an admission probability estimate']
    };
  }

  let probability = 0;
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const missingRequirements: string[] = [];
  const improvementSuggestions: string[] = [];
  let confidencePoints = 100;

  const marks12th = parseFloat(studentData.profile.twelfthPercentage) || 0;
  const hasEntranceExam = !!studentData.profile.entranceExam;
  const prefBranch = studentData.profile.preferredBranch || studentData.profile.interestedBranch;
  const prefState = studentData.profile.preferredState || studentData.profile.state;

  // 2. Academic Performance (30%)
  if (marks12th >= 90) {
    probability += 30;
    strengths.push('Strong academic profile');
  } else if (marks12th >= 80) {
    probability += 25;
    strengths.push('Good academic profile');
  } else if (marks12th >= 65) {
    probability += 15;
    weaknesses.push('Academic scores are moderate');
  } else if (marks12th > 0) {
    probability += 5;
    weaknesses.push('Academic scores may be below average for top programs');
  } else {
    confidencePoints -= 30;
    missingRequirements.push('12th Board Marks missing');
    improvementSuggestions.push('Add your 12th standard marks');
  }

  // 3. Entrance Exam (25%)
  if (hasEntranceExam) {
    probability += 25;
    strengths.push('Entrance exam score available');
  } else {
    confidencePoints -= 25;
    missingRequirements.push('Entrance exam score missing');
    improvementSuggestions.push('Add an entrance exam score (e.g. JEE, CUET)');
  }

  // 4. Profile Completeness (10%)
  if (profileScore >= 80) {
    probability += 10;
    strengths.push('Profile is complete');
  } else {
    probability += 5;
    improvementSuggestions.push('Improve your profile completeness');
  }

  // 5. Required Documents (10%)
  if (studentData.documents && studentData.documents.length >= 3) {
    probability += 10;
    strengths.push('Essential documents uploaded');
  } else {
    confidencePoints -= 10;
    missingRequirements.push('Required documents missing');
    improvementSuggestions.push('Upload remaining documents');
  }

  // 6. Branch Match (15%)
  if (prefBranch && university.programs?.some((p: any) => p.name.toLowerCase().includes(prefBranch.toLowerCase()))) {
    probability += 15;
    strengths.push('Preferred branch available');
  } else if (prefBranch) {
    weaknesses.push('Preferred branch might not be offered here');
  } else {
    confidencePoints -= 10;
  }

  // 7. Location Preference (5%)
  if (prefState && university.location?.toLowerCase().includes(prefState.toLowerCase())) {
    probability += 5;
  }

  // 8. Recommendation Engine Baseline (5%)
  const recs = recommendUniversities([university], { ...studentData, profileScore });
  if (recs.length > 0 && recs[0].overallMatchScore >= 75) {
    probability += 5;
    strengths.push('High recommendation match');
  }

  let probabilityLabel: ProbabilityResult['probabilityLabel'] = 'Moderate';
  if (probability >= 90) probabilityLabel = 'Very High';
  else if (probability >= 75) probabilityLabel = 'High';
  else if (probability >= 60) probabilityLabel = 'Moderate';
  else if (probability >= 40) probabilityLabel = 'Low';
  else probabilityLabel = 'Very Low';

  let confidence: 'High' | 'Medium' | 'Low' = 'High';
  if (confidencePoints < 50) confidence = 'Low';
  else if (confidencePoints < 80) confidence = 'Medium';

  return {
    overallProbability: probability,
    probabilityLabel,
    confidence,
    strengths,
    weaknesses,
    missingRequirements,
    improvementSuggestions
  };
}
