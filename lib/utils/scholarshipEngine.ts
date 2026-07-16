export interface ScholarshipResult {
  scholarship: any;
  eligibilityScore: number;
  eligibilityLabel: 'Highly Eligible' | 'Eligible' | 'Potentially Eligible' | 'Needs Improvement' | 'Not Eligible';
  matchReasons: string[];
  missingRequirements: string[];
  improvementSuggestions: string[];
  estimatedBenefit: string;
}

export function calculateScholarshipEligibility(
  studentData: {
    profile: any;
    documents: any[];
    profileScore: number;
    probabilityScore?: number;
  },
  scholarships: any[]
): ScholarshipResult[] {
  const results: ScholarshipResult[] = [];

  const incomeStr = studentData.profile?.familyIncome?.toString().replace(/[^0-9]/g, '') || '0';
  const income = parseInt(incomeStr, 10);
  
  const category = studentData.profile?.category || 'General';
  const state = studentData.profile?.state || studentData.profile?.preferredState;
  const marks12th = parseFloat(studentData.profile?.twelfthPercentage) || 0;
  
  scholarships.forEach(sch => {
    let score = 0;
    const matchReasons: string[] = [];
    const missingRequirements: string[] = [];
    const improvementSuggestions: string[] = [];

    // 1. Academic Performance (35%)
    let reqMarks = sch.minMarks || 75;
    if (marks12th >= reqMarks) {
      score += 35;
      matchReasons.push('Academic score qualifies');
    } else if (marks12th > 0) {
      missingRequirements.push(`Minimum ${reqMarks}% marks required`);
      improvementSuggestions.push('Improve academic performance');
    } else {
      missingRequirements.push('12th Marks missing');
      improvementSuggestions.push('Add your 12th standard marks');
    }

    // 2. Income Eligibility (20%)
    let maxIncome = sch.maxIncome || Infinity;
    if (income > 0 && income <= maxIncome) {
      score += 20;
      matchReasons.push('Income range eligible');
    } else if (income > maxIncome) {
      missingRequirements.push(`Income must be below ₹${maxIncome.toLocaleString()}`);
    } else {
      missingRequirements.push('Income Details missing');
      improvementSuggestions.push('Update family income');
    }

    // 3. Category / Reservation (15%)
    if (sch.requiredCategory && sch.requiredCategory !== 'All') {
      if (category === sch.requiredCategory) {
        score += 15;
        matchReasons.push('Category matches requirements');
      } else {
        missingRequirements.push(`Requires ${sch.requiredCategory} category`);
      }
    } else {
      score += 15;
      matchReasons.push('Open to all categories');
    }

    // 4. Required Documents (10%)
    const hasIncomeCert = studentData.documents.some(d => d.name?.toLowerCase().includes('income'));
    const hasCategoryCert = studentData.documents.some(d => d.name?.toLowerCase().includes('caste') || d.name?.toLowerCase().includes('category'));

    let docsMet = true;
    if (sch.requiresIncomeCert && !hasIncomeCert) {
      docsMet = false;
      missingRequirements.push('Income Certificate');
      improvementSuggestions.push('Upload Income Certificate');
    }
    if (sch.requiredCategory && sch.requiredCategory !== 'General' && !hasCategoryCert) {
      docsMet = false;
      missingRequirements.push('Category Certificate');
      improvementSuggestions.push('Upload Category Certificate');
    }
    
    if (docsMet) {
      score += 10;
      matchReasons.push('Required documents available');
    }

    // 5. State Eligibility (10%)
    if (sch.stateSpecific) {
      if (state?.toLowerCase() === sch.stateSpecific.toLowerCase()) {
        score += 10;
        matchReasons.push('State eligible');
      } else {
        missingRequirements.push(`Requires domicile of ${sch.stateSpecific}`);
      }
    } else {
      score += 10; // Pan-India
      matchReasons.push('Nationwide eligibility');
    }

    // 6. Profile Completeness (5%)
    if (studentData.profileScore >= 80) {
      score += 5;
    } else {
      improvementSuggestions.push('Complete Profile');
    }

    // 7. Admission Probability (5%)
    if ((studentData.probabilityScore || 0) >= 70) {
      score += 5;
    }

    // If completely no data, reset score to 0
    if (marks12th === 0 && income === 0 && !state) {
      score = 0;
    }

    let eligibilityLabel: ScholarshipResult['eligibilityLabel'] = 'Not Eligible';
    if (score >= 90) eligibilityLabel = 'Highly Eligible';
    else if (score >= 75) eligibilityLabel = 'Eligible';
    else if (score >= 60) eligibilityLabel = 'Potentially Eligible';
    else if (score >= 40) eligibilityLabel = 'Needs Improvement';
    else eligibilityLabel = 'Not Eligible';

    results.push({
      scholarship: sch,
      eligibilityScore: score,
      eligibilityLabel,
      matchReasons,
      missingRequirements,
      improvementSuggestions: Array.from(new Set(improvementSuggestions)), // deduplicate
      estimatedBenefit: sch.amount || 'Variable'
    });
  });

  return results.sort((a, b) => b.eligibilityScore - a.eligibilityScore);
}
