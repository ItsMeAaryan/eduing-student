// lib/ai/collegePredictor.ts
// EDUING College Predictor + choice-filling optimizer.
//
// The model (public/ai/josaa-model-2026.json) is trained offline by
// ml/college-predictor/train_predictor.py on JoSAA final-round cutoffs 2016–2024.
// For every seat pool (institute · program · quota · category · gender) it ships
//   mu  — forecast log closing rank for the 2026 counselling
//   s   — how uncertain that forecast is for this kind of seat (learned by
//         gradient-boosted quantile trees)
// and the chance of a seat for rank r is  1 / (1 + exp(-(mu - ln r) / s)).

export type Category = 'OPEN' | 'EWS' | 'OBC-NCL' | 'SC' | 'ST'
export type InstituteType = 'IIT' | 'NIT' | '3IT' | 'CFI'

export interface PredictorInput {
  mainCrl?: number      // JEE Main common rank list (CRL)
  mainCat?: number      // JEE Main category rank (EWS / OBC-NCL / SC / ST)
  advCrl?: number       // JEE Advanced CRL
  advCat?: number       // JEE Advanced category rank
  category: Category
  female: boolean
  homeState: string
}

export interface Backtest {
  testYear: number; horizonYears: number; trainedOn: string; seatPools: number; applicants: number
  cutoffErrorMedianPct: number; cutoffErrorMedianPctNaive: number
  interval80Coverage: number; interval80CoverageConstant: number
  admitAccuracy: number; admitAccuracyNaive: number; admitAccuracyConstant: number
  brier: number; brierNaive: number; brierConstant: number
  calibration: { band: string; predicted: number; actual: number; n: number }[]
}

type SeatRow = [number, number, string, string, 0 | 1, number, number, (number | null)[], number]

export interface PredictorModel {
  version: number
  targetYear: number
  dataYears: [number, number]
  histYears: number[]
  source: string
  method: string
  driftPerYear: number
  institutes: [string, InstituteType, string][]
  programs: string[]
  seats: SeatRow[]
  backtest: Backtest[]
}

export const INSTITUTE_TYPE_LABEL: Record<InstituteType, string> = { IIT: 'IIT', NIT: 'NIT', '3IT': 'IIIT', CFI: 'GFTI' }

export const BANDS = [
  { key: 'safe', label: 'Safe', min: 0.9, tone: 'green' },
  { key: 'likely', label: 'Likely', min: 0.75, tone: 'green' },
  { key: 'target', label: 'Target', min: 0.45, tone: 'gold' },
  { key: 'reach', label: 'Reach', min: 0.2, tone: 'accent' },
  { key: 'unlikely', label: 'Unlikely', min: 0, tone: 'muted' },
] as const
export type BandKey = typeof BANDS[number]['key']
export const bandOf = (p: number): BandKey => (BANDS.find(b => p >= b.min) ?? BANDS[BANDS.length - 1]).key

// ── branch groups (used for filters and the student's preferences) ──────────
export const BRANCH_GROUPS = [
  { key: 'cse', label: 'Computer Science', re: /computer|data science|artificial|machine learning|information technology|software|cyber|mathematics and computing/i },
  { key: 'ece', label: 'Electronics & Communication', re: /electronics|communication|vlsi|instrumentation/i },
  { key: 'ee', label: 'Electrical', re: /electrical|power/i },
  { key: 'mech', label: 'Mechanical & Production', re: /mechanical|production|manufactur|industrial|automobile|aerospace|mechatronics/i },
  { key: 'civil', label: 'Civil', re: /civil|construction|infrastructure/i },
  { key: 'chem', label: 'Chemical, Materials & Metallurgy', re: /chemical|material|metallurg|ceramic|polymer|petroleum|mining|mineral/i },
  { key: 'sci', label: 'Sciences & Others', re: /./ },
] as const
export type BranchKey = typeof BRANCH_GROUPS[number]['key']
export const branchOf = (program: string): BranchKey => (BRANCH_GROUPS.find(g => g.re.test(program)) ?? BRANCH_GROUPS[BRANCH_GROUPS.length - 1]).key

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
  'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha',
  'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
]

// ── loading ────────────────────────────────────────────────────────────────
let modelPromise: Promise<PredictorModel> | null = null
export function loadPredictorModel(): Promise<PredictorModel> {
  if (!modelPromise) {
    modelPromise = fetch('/ai/josaa-model-2026.json', { cache: 'force-cache' })
      .then(r => { if (!r.ok) throw new Error(`Model download failed (${r.status})`); return r.json() as Promise<PredictorModel> })
      .catch(e => { modelPromise = null; throw e })
  }
  return modelPromise
}

// ── prediction ────────────────────────────────────────────────────────────
export interface Prediction {
  id: string                    // institute index · program index
  institute: string
  instituteType: InstituteType
  state: string
  program: string
  branch: BranchKey
  chance: number                // 0..1, best seat pool the student is eligible for
  band: BandKey
  quota: string                 // AI / HS / OS
  seatCategory: string          // OPEN / OBC-NCL / …
  femaleOnly: boolean
  rankUsed: number
  rankLabel: string             // 'JEE Main CRL' …
  cutoff: number                // forecast closing rank
  low: number; high: number     // 80% range of the forecast
  history: (number | null)[]    // closing rank, histYears
  lastCutoff: number | null
  popularity: number            // 0..1, how sought-after the program is with toppers (open-seat cutoff)
  why: string[]
}

const LN9 = Math.log(9)
export const chanceFor = (mu: number, s: number, rank: number) => 1 / (1 + Math.exp(-(mu - Math.log(rank)) / s))
const fmt = (n: number) => Math.round(n).toLocaleString('en-IN')
const QUOTA_LABEL: Record<string, string> = { AI: 'All-India quota', HS: 'Home-state quota', OS: 'Other-state quota' }

function rankFor(input: PredictorInput, iit: boolean, seatCategory: string): { rank?: number; label: string } {
  const open = seatCategory === 'OPEN'
  if (iit) return open ? { rank: input.advCrl, label: 'JEE Advanced CRL' } : { rank: input.advCat, label: `JEE Advanced ${seatCategory} rank` }
  return open ? { rank: input.mainCrl, label: 'JEE Main CRL' } : { rank: input.mainCat, label: `JEE Main ${seatCategory} rank` }
}

/** Every program the student can be considered for, with the chance through their best seat pool. */
export function predict(model: PredictorModel, input: PredictorInput): Prediction[] {
  const best = new Map<string, Prediction>()
  const openMu = new Map<string, number>()   // demand signal: OPEN · gender-neutral cutoff of each program
  const hy = model.histYears
  const lastIdx = hy.length - 1

  for (const [ii, pi, quota, cat, female, mu, s, hist] of model.seats) {
    const id = `${ii}.${pi}`
    if (cat === 'OPEN' && !female && (quota === 'AI' || quota === 'OS')) openMu.set(id, Math.min(openMu.get(id) ?? Infinity, mu))

    const [instName, type, state] = model.institutes[ii]
    const iit = type === 'IIT'
    const program = model.programs[pi]
    // B.Arch / B.Planning outside IITs go by JEE Main Paper 2 ranks, which this form doesn't ask for
    if (!iit && /architecture|planning/i.test(program)) continue
    if (quota !== 'AI' && quota !== 'HS' && quota !== 'OS') continue          // JK / LA / GO special quotas
    if (quota === 'HS' && state !== input.homeState) continue
    if (quota === 'OS' && state === input.homeState) continue
    if (female && !input.female) continue
    if (cat.includes('PwD')) continue
    if (cat !== 'OPEN' && cat !== input.category) continue

    const { rank, label } = rankFor(input, iit, cat)
    if (!rank || rank <= 0) continue
    const chance = chanceFor(mu, s, rank)
    const prev = best.get(id)
    if (prev && prev.chance >= chance) continue

    const cutoff = Math.exp(mu)
    const lastCutoff = hist[lastIdx] ?? null
    const why: string[] = []
    const known = hist.map((v, i) => (v ? `${fmt(v)} (${hy[i]})` : null)).filter(Boolean)
    if (known.length) why.push(`Closing rank: ${known.slice(-3).join(' → ')}.`)
    why.push(`Forecast for ${model.targetYear}: about ${fmt(cutoff)}, likely between ${fmt(Math.exp(mu - s * LN9))} and ${fmt(Math.exp(mu + s * LN9))}.`)
    const gap = cutoff / rank - 1
    why.push(gap >= 0
      ? `Your ${label} of ${fmt(rank)} is ${Math.round(gap * 100)}% inside the forecast cutoff.`
      : `Your ${label} of ${fmt(rank)} is ${Math.round(-gap * 100)}% outside the forecast cutoff.`)
    why.push(s > 0.2 ? 'This cutoff has moved a lot between years, so the chance is spread wide.' : s < 0.07 ? 'This cutoff has been steady, so the chance is sharp.' : 'This cutoff moves a moderate amount between years.')
    why.push(`Counted through the ${QUOTA_LABEL[quota]}, ${cat}${female ? ' female-only' : ''} seats.`)

    best.set(id, {
      id, institute: instName, instituteType: type, state, program, branch: branchOf(program),
      chance, band: bandOf(chance), quota, seatCategory: cat, femaleOnly: !!female,
      rankUsed: rank, rankLabel: label, cutoff, low: Math.exp(mu - s * LN9), high: Math.exp(mu + s * LN9),
      history: hist, lastCutoff, popularity: 0, why,
    })
  }

  // popularity: open-seat forecast cutoff scaled to 0..1 (rank 1 → 1, rank 1.5 lakh → 0)
  const MAXL = Math.log(150000)
  for (const p of Array.from(best.values())) {
    const m = openMu.get(p.id)
    p.popularity = m === undefined ? 0.2 : Math.max(0, Math.min(1, 1 - m / MAXL))
  }
  return Array.from(best.values()).sort((a, b) => b.chance - a.chance || b.popularity - a.popularity)
}

// ── choice-filling optimizer ───────────────────────────────────────────────
// JoSAA gives you the highest choice on your list that you clear, so the order
// should follow what you *want*, not your chances. What the optimizer decides is
// which programs earn a place: everything you'd prefer over your safest option,
// enough safe options to be sure of a seat, and nothing that can never be reached.

export interface ChoicePrefs {
  branches: BranchKey[]                       // in order of preference (first = most wanted)
  types: InstituteType[]                      // institute types to include
  preferHomeState: boolean
  ambition: 'balanced' | 'ambitious' | 'careful'
  focus: 'branch' | 'balanced' | 'institute'   // what matters more when they conflict
}

export interface ChoiceItem extends Prediction {
  preference: number          // 0..1, how much the student wants it
  reachProb: number           // chance this is the seat you end up with
  role: 'dream' | 'target' | 'safe'
}

export interface ChoicePlan {
  list: ChoiceItem[]
  anySeat: number                         // chance of getting at least one seat
  expectedTop: ChoiceItem | null          // most likely final allotment
  counts: Record<'dream' | 'target' | 'safe', number>
  notes: string[]
}

export function preferenceScore(p: Prediction, prefs: ChoicePrefs, homeState: string) {
  const bi = prefs.branches.indexOf(p.branch)
  const branchScore = bi === -1 ? 0 : 1 - bi / Math.max(prefs.branches.length, 1) * 0.8
  const typeBoost = p.instituteType === 'IIT' ? 0.12 : p.instituteType === 'NIT' ? 0.06 : p.instituteType === '3IT' ? 0.04 : 0
  const home = prefs.preferHomeState && p.state === homeState ? 0.04 : 0
  // popularity = what thousands of higher-ranked students chose before — a strong signal of quality and outcomes
  const [wb, wp] = prefs.focus === 'branch' ? [0.6, 0.3] : prefs.focus === 'institute' ? [0.25, 0.65] : [0.45, 0.45]
  return wb * branchScore + wp * p.popularity + typeBoost + home
}

export function buildChoicePlan(preds: Prediction[], prefs: ChoicePrefs, homeState: string, maxChoices = 40): ChoicePlan {
  const minChance = prefs.ambition === 'ambitious' ? 0.03 : prefs.ambition === 'careful' ? 0.15 : 0.07
  const pool = preds
    .filter(p => prefs.types.includes(p.instituteType) && (prefs.branches.length === 0 || prefs.branches.includes(p.branch)))
    .filter(p => p.chance >= minChance)
    .map(p => ({ ...p, preference: preferenceScore(p, prefs, homeState) }))
    .sort((a, b) => b.preference - a.preference)

  // Walk down the preference order. Stop once a seat is practically certain — later choices could never be used.
  // Cutoffs tend to move together in a year, so "certain" needs three safe anchors, not one.
  const list: ChoiceItem[] = []
  let notYet = 1
  let anchors = 0
  for (const p of pool) {
    if (list.length >= maxChoices || (notYet < 0.002 && anchors >= 3)) break
    if (p.chance >= 0.9) anchors++
    const reachProb = notYet * p.chance
    list.push({ ...p, reachProb, role: p.chance >= 0.75 ? 'safe' : p.chance >= 0.45 ? 'target' : 'dream' })
    notYet *= 1 - p.chance
  }

  const notes: string[] = []
  // Not enough safety: add the most-wanted safe options left out, at the bottom
  if (notYet > 0.05 || anchors < 3) {
    const safe = preds
      .filter(p => p.chance >= 0.9 && !list.some(l => l.id === p.id))
      .map(p => ({ ...p, preference: preferenceScore(p, prefs, homeState) }))
      .sort((a, b) => b.preference - a.preference)
    let added = 0
    for (const p of safe) {
      if ((notYet < 0.02 && anchors >= 3) || list.length >= maxChoices + 5) break
      anchors++; added++
      list.push({ ...p, reachProb: notYet * p.chance, role: 'safe' })
      notYet *= 1 - p.chance
    }
    if (added) notes.push('Added safe options from outside your filters so you are not left without a seat.')
  }

  const anySeat = 1 - notYet
  const expectedTop = list.reduce<ChoiceItem | null>((m, c) => (!m || c.reachProb > m.reachProb ? c : m), null)
  const counts = { dream: 0, target: 0, safe: 0 }
  list.forEach(c => counts[c.role]++)
  if (counts.dream === 0 && list.length) notes.push('No dream options made the list — loosen the branch filter or switch to Ambitious to aim higher.')
  if (anySeat < 0.9) notes.push(`Even with this list the chance of a seat is ${Math.round(anySeat * 100)}%. Add more branches or institute types.`)
  notes.push('Chances are treated as independent, which slightly overstates the chance of a seat in years when every cutoff moves the same way.')
  return { list, anySeat, expectedTop, counts, notes }
}
