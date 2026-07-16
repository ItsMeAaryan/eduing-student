import { calculateScholarshipEligibility } from '../scholarshipEngine';
import { describe, it, expect } from 'vitest';

describe('calculateScholarshipEligibility', () => {
  const mockScholarships = [
    {
      id: '1',
      name: 'Merit Scholarship',
      minMarks: 90,
      maxIncome: 500000,
      requiredCategory: 'General',
      requiresIncomeCert: true,
      stateSpecific: 'Delhi',
      amount: '₹50,000'
    },
    {
      id: '2',
      name: 'Open Scholarship',
      minMarks: 60,
      amount: '₹10,000'
    }
  ];

  it('handles completely missing profile data', () => {
    const studentData = {
      profile: null,
      documents: [],
      profileScore: 0
    };
    
    const results = calculateScholarshipEligibility(studentData, mockScholarships);
    
    expect(results.length).toBe(2);
    expect(results[0].eligibilityScore).toBe(0);
    expect(results[0].eligibilityLabel).toBe('Not Eligible');
  });

  it('calculates high eligibility for matching profile', () => {
    const studentData = {
      profile: {
        twelfthPercentage: '95',
        familyIncome: '400000',
        category: 'General',
        state: 'Delhi'
      },
      documents: [{ name: 'income_certificate.pdf' }],
      profileScore: 100,
      probabilityScore: 80
    };
    
    const results = calculateScholarshipEligibility(studentData, mockScholarships);
    
    const meritSch = results.find(r => r.scholarship.name === 'Merit Scholarship');
    expect(meritSch).toBeDefined();
    expect(meritSch!.eligibilityScore).toBeGreaterThanOrEqual(90);
    expect(meritSch!.eligibilityLabel).toBe('Highly Eligible');
  });

  it('penalizes for missing documents', () => {
    const studentData = {
      profile: {
        twelfthPercentage: '95',
        familyIncome: '400000',
        category: 'General',
        state: 'Delhi'
      },
      documents: [], // missing income certificate
      profileScore: 100,
    };
    
    const results = calculateScholarshipEligibility(studentData, mockScholarships);
    const meritSch = results.find(r => r.scholarship.name === 'Merit Scholarship');
    
    expect(meritSch!.missingRequirements).toContain('Income Certificate');
  });
});
