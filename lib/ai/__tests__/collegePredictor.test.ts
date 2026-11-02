import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { predict, buildChoicePlan, chanceFor, type PredictorModel } from '../collegePredictor'

const model = JSON.parse(readFileSync(path.join(__dirname, '../../../public/ai/josaa-model-2026.json'), 'utf8')) as PredictorModel

describe('college predictor', () => {
  it('a better rank never lowers the chance', () => {
    expect(chanceFor(9, 0.1, 5000)).toBeGreaterThan(chanceFor(9, 0.1, 9000))
  })

  it('respects quota, gender and category eligibility', () => {
    const preds = predict(model, { mainCrl: 30000, category: 'OPEN', female: false, homeState: 'Karnataka' })
    expect(preds.length).toBeGreaterThan(100)
    for (const p of preds) {
      expect(p.femaleOnly).toBe(false)
      expect(p.seatCategory).toBe('OPEN')
      expect(p.instituteType).not.toBe('IIT') // no Advanced rank given
      if (p.quota === 'HS') expect(p.state).toBe('Karnataka')
      if (p.quota === 'OS') expect(p.state).not.toBe('Karnataka')
    }
  })

  it('orders the choice list by preference and ends with a seat almost certain', () => {
    const input = { mainCrl: 45000, category: 'OPEN' as const, female: true, homeState: 'Bihar' }
    const plan = buildChoicePlan(predict(model, input), { branches: ['cse', 'ece'], types: ['NIT', '3IT', 'CFI'], preferHomeState: false, ambition: 'balanced', focus: 'balanced' }, 'Bihar')
    expect(plan.list.length).toBeGreaterThan(3)
    expect(plan.anySeat).toBeGreaterThan(0.95)
    const inFilter = plan.list.filter(c => ['cse', 'ece'].includes(c.branch) && c.instituteType !== 'IIT').map(c => c.preference)
    expect(inFilter).toEqual([...inFilter].sort((a, b) => b - a))
  })
})
