import { calculateProfileStrength } from '../profileStrength';
import { describe, it, expect } from 'vitest';

describe('calculateProfileStrength', () => {
  it('handles null profile', () => {
    const result = calculateProfileStrength(null);
    expect(result.percentage).toBe(0);
    expect(result.grade).toBe('Incomplete');
    expect(result.completedFields).toBe(0);
    expect(result.missingFields.length).toBe(result.totalFields);
  });

  it('handles empty profile', () => {
    const result = calculateProfileStrength({});
    expect(result.percentage).toBe(0);
    expect(result.completedFields).toBe(0);
  });

  it('calculates percentage correctly for partially complete profile', () => {
    const profile = {
      fullName: 'John Doe',
      phone: '1234567890',
      dob: '2000-01-01',
    };
    const result = calculateProfileStrength(profile);
    
    // Total fields = 15. Completed = 3. 3/15 = 20%
    expect(result.percentage).toBe(20);
    expect(result.grade).toBe('Incomplete');
    expect(result.completedFields).toBe(3);
  });

  it('sorts missing fields by priority', () => {
    const profile = {
      gender: 'Male', // Low priority
    };
    const result = calculateProfileStrength(profile);
    
    expect(result.missingFields[0].priority).toBe('High');
  });

  it('handles documents correctly', () => {
    const profile = { fullName: 'John Doe' };
    const documents = {
      '10th_marksheet': { fileUrl: 'http://example.com/doc1' }
    };
    
    const result = calculateProfileStrength(profile, documents);
    
    // 1 field + 1 doc = 2 fields
    expect(result.completedFields).toBe(2);
  });
});
