import { calculateAdmissionProbability } from '../probabilityEngine';
import { describe, it, expect } from 'vitest';

describe('calculateAdmissionProbability', () => {
  const mockUniversity = {
    name: 'Test University',
    location: 'Delhi',
    programs: [{ name: 'Computer Science' }],
    tuitionFees: 100000,
    rating: 4.5
  };

  it('handles empty profile', () => {
    const studentData = { profile: null, documents: [], applications: [], savedPrograms: [] };
    const result = calculateAdmissionProbability(studentData, mockUniversity);
    
    expect(result.overallProbability).toBe(0);
    expect(result.probabilityLabel).toBe('Very Low');
    expect(result.missingRequirements).toContain('Profile is significantly incomplete');
  });

  it('calculates probability for a strong profile', () => {
    const studentData = {
      profile: {
        twelfthPercentage: '95',
        entranceExam: { score: 99 },
        preferredBranch: 'Computer Science',
        preferredState: 'Delhi'
      },
      documents: [{}, {}, {}], // 3 documents
      applications: [],
      savedPrograms: [],
      profileScore: 100
    };
    
    const result = calculateAdmissionProbability(studentData, mockUniversity);
    
    expect(result.overallProbability).toBeGreaterThanOrEqual(90); // 30+25+10+10+15+5+5 = up to 100
    expect(result.probabilityLabel).toBe('Very High');
    expect(result.confidence).toBe('High');
    expect(result.strengths.length).toBeGreaterThan(0);
  });

  it('penalizes missing requirements', () => {
    const studentData = {
      profile: {
        twelfthPercentage: '70', // moderate
      },
      documents: [], // missing docs
      applications: [],
      savedPrograms: [],
      profileScore: 50
    };
    
    const result = calculateAdmissionProbability(studentData, mockUniversity);
    
    expect(result.overallProbability).toBeLessThan(50);
    expect(result.missingRequirements).toContain('Entrance exam score missing');
    expect(result.missingRequirements).toContain('Required documents missing');
    expect(result.confidence).not.toBe('High');
  });
});
