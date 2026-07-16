export interface RecommendationResult {
  university: any;
  overallMatchScore: number;
  matchLabel: string;
  matchReasons: string[];
  strengths: string[];
  weaknesses: string[];
  missingRequirements: string[];
  explanation: string;
}

export function recommendUniversities(
  universities: any[],
  studentData: {
    profile: any;
    documents: any[];
    savedPrograms: any[];
    applications: any[];
    profileScore: number;
  }
): RecommendationResult[] {
  // If the profile is largely empty, return empty so UI shows insufficient data
  if (!studentData.profile || studentData.profileScore < 20) {
    return [];
  }
  
  const results: RecommendationResult[] = [];
  
  const prefState = studentData.profile.preferredState || studentData.profile.state;
  const prefBranch = studentData.profile.preferredBranch || studentData.profile.interestedBranch;
  const marks12th = parseFloat(studentData.profile.twelfthPercentage) || 0;
  const hasEntranceExam = !!studentData.profile.entranceExam;

  universities.forEach(uni => {
    let score = 0;
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const missingRequirements: string[] = [];
    const matchReasons: string[] = [];

    // 1. Academic Match (30%)
    let academicScore = 0;
    if (marks12th >= 90) academicScore = 30;
    else if (marks12th >= 80) academicScore = 25;
    else if (marks12th >= 70) academicScore = 15;
    else academicScore = 5;
    
    if (marks12th > 0) {
      score += academicScore;
      if (marks12th >= 80) strengths.push('Strong academic performance');
      else weaknesses.push('Academic score below average for top tier');
      matchReasons.push('Fits Academic Profile');
    } else {
      missingRequirements.push('Update 12th Marks');
    }

    // 2. Entrance Score (20%)
    if (hasEntranceExam) {
      score += 20;
      strengths.push('Entrance exam score available');
      matchReasons.push('Matches Entrance Score');
    } else {
      missingRequirements.push('Add Entrance Score');
    }

    // 3. Location Preference (15%)
    if (prefState && uni.location?.toLowerCase().includes(prefState.toLowerCase())) {
      score += 15;
      matchReasons.push('Preferred State');
      strengths.push('Location matches preference');
    } else if (!prefState) {
       missingRequirements.push('Add Preferred State');
    }

    // 4. Branch Preference (20%)
    if (prefBranch && uni.programs?.some((p: any) => p.name.toLowerCase().includes(prefBranch.toLowerCase()))) {
      score += 20;
      matchReasons.push('Preferred Branch');
      strengths.push('Offers preferred program');
    } else if (!prefBranch) {
      missingRequirements.push('Add Preferred Branch');
    }

    // 5. Profile Completeness (5%)
    if (studentData.profileScore >= 80) {
      score += 5;
    }

    // 6. Application History / Saved Interests (10%)
    if (studentData.savedPrograms?.includes(uni.id)) {
      score += 5;
      matchReasons.push('Saved Program');
    }
    if (studentData.applications?.some(a => a.universityId === uni.id)) {
      score += 5;
      matchReasons.push('Existing Application');
    }

    // Default Score Base
    if (score === 0) score = 15; // Give at least something for being in the database

    // Explanation
    let explanation = `This university is recommended because `;
    if (matchReasons.length > 0) {
      explanation += `it aligns well with your ${matchReasons.join(', ').toLowerCase()}. `;
    } else {
      explanation += `it meets the general eligibility criteria based on available data. `;
    }
    if (missingRequirements.length > 0) {
      explanation += `Updating your profile can yield even better accuracy.`;
    }

    // Match Label
    let matchLabel = '';
    if (score >= 95) matchLabel = 'Excellent Match';
    else if (score >= 80) matchLabel = 'Strong Match';
    else if (score >= 65) matchLabel = 'Good Match';
    else if (score >= 50) matchLabel = 'Possible Match';
    else matchLabel = 'Low Match';

    results.push({
      university: uni,
      overallMatchScore: score,
      matchLabel,
      matchReasons,
      strengths,
      weaknesses,
      missingRequirements,
      explanation
    });
  });

  results.sort((a, b) => b.overallMatchScore - a.overallMatchScore);

  return results;
}
