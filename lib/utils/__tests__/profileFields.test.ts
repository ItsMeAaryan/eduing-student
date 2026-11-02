import { describe, it, expect } from 'vitest'
import { normalizeProfile, canonicalFromOnboarding } from '../profileFields'
import { calculateProfileStrength } from '../profileStrength'

describe('normalizeProfile', () => {
  it('reads onboarding nested academic/exams data', () => {
    const p = normalizeProfile({
      fullName: 'Aarav', academic: { marks10: '91', marks12: '88', board12: 'CBSE', year12: '2026', stream: 'PCM', school12: 'DPS' },
      exams: { jeeMain: '97.2', neet: '' },
    })!
    expect(p.twelfthPercentage).toBe('88')
    expect(p.twelfthScore).toBe('88')
    expect(p.tenthPercentage).toBe('91')
    expect(p.board).toBe('CBSE')
    expect(p.jeeScore).toBe('97.2')
    expect(p.neetScore).toBeUndefined()
    expect(p.testScores).toEqual({ 'JEE Main': '97.2' })
    expect(p.entranceExam).toBe('JEE Main')
  })

  it('reads profile-page flat keys and the app personal map', () => {
    const p = normalizeProfile({ personal: { fullName: 'Riya', phone: '99' }, twelfthScore: '76', targetDegree: 'B.Arch', targetLocation: 'Karnataka', maxBudget: '5L' })!
    expect(p.fullName).toBe('Riya')
    expect(p.phone).toBe('99')
    expect(p.twelfthPercentage).toBe('76')
    expect(p.preferredPrograms).toBe('B.Arch')
    expect(p.preferredLocation).toBe('Karnataka')
    expect(p.budget).toBe('5L')
  })

  it('lets onboarding data count towards profile strength', () => {
    const raw = { fullName: 'A', academic: { marks10: '90', marks12: '90' } }
    expect(calculateProfileStrength(normalizeProfile(raw)).completedFields).toBeGreaterThan(calculateProfileStrength(raw).completedFields)
  })

  it('canonicalFromOnboarding drops empty values', () => {
    expect(canonicalFromOnboarding({ academic: { marks12: '80', board12: '' }, exams: { cuet: '650' } })).toEqual({ twelfthScore: '80', cuetScore: '650' })
  })
})
