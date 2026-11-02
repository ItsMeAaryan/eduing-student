// lib/utils/profileFields.ts
// The student profile has been written by three different screens over time:
//   • onboarding   → fullName, dob, … + academic{marks10, board12, …} + exams{jeeMain, neet, …}
//   • profile page → flat keys (tenthScore, twelfthBoard, jeeScore, targetDegree, …)
//   • mobile app   → personal{fullName, phone}, displayName
// and the engines (profile strength, recommendations, scholarships) read yet
// other names (twelfthPercentage, testScores, preferredPrograms …).
// normalizeProfile() reads all of them and fills in every alias, so each
// consumer sees the same data no matter which screen saved it.

type Profile = Record<string, any>

const first = (...vals: any[]) => {
  for (const v of vals) if (v !== undefined && v !== null && v !== '') return v
  return undefined
}

export const EXAMS: { key: string; label: string; sources: string[] }[] = [
  { key: 'jeeScore', label: 'JEE Main', sources: ['jeeScore', 'exams.jeeMain', 'exams.jee', 'testScores.jee'] },
  { key: 'neetScore', label: 'NEET', sources: ['neetScore', 'exams.neet', 'testScores.neet'] },
  { key: 'cuetScore', label: 'CUET', sources: ['cuetScore', 'exams.cuet', 'testScores.cuet'] },
  { key: 'bitsatScore', label: 'BITSAT', sources: ['bitsatScore', 'exams.bitSat', 'exams.bitsat', 'testScores.bitsat'] },
  { key: 'nataScore', label: 'NATA', sources: ['nataScore', 'exams.nata', 'testScores.nata'] },
  { key: 'clatScore', label: 'CLAT', sources: ['clatScore', 'exams.clat', 'testScores.clat'] },
  { key: 'catPercentile', label: 'CAT', sources: ['catPercentile', 'exams.cat', 'testScores.cat'] },
  { key: 'gateScore', label: 'GATE', sources: ['gateScore', 'exams.gate', 'testScores.gate'] },
]

const get = (obj: Profile, path: string) => path.split('.').reduce<any>((o, k) => (o == null ? undefined : o[k]), obj)

export function normalizeProfile(raw: Profile | null | undefined): Profile | null {
  if (!raw) return raw ?? null
  const a = raw.academic ?? {}
  const personal = raw.personal ?? {}
  const p: Profile = { ...raw }

  // personal
  p.fullName = first(raw.fullName, personal.fullName, raw.displayName, raw.name)
  p.phone = first(raw.phone, personal.phone, raw.phoneNumber)
  p.dob = first(raw.dob, personal.dob, raw.dateOfBirth)
  p.gender = first(raw.gender, personal.gender)
  p.state = first(raw.state, personal.state, raw.address?.state)
  p.city = first(raw.city, personal.city, raw.address?.city)
  p.profilePhotoURL = first(raw.profilePhotoURL, raw.photoURL, raw.avatarUrl)
  p.nationality = first(raw.nationality, 'Indian')

  // class 10 / 12
  p.tenthScore = first(raw.tenthScore, raw.tenthPercentage, a.marks10)
  p.tenthPercentage = p.tenthScore
  p.tenthBoard = first(raw.tenthBoard, a.board10)
  p.tenthYear = first(raw.tenthYear, a.year10)
  p.twelfthScore = first(raw.twelfthScore, raw.twelfthPercentage, a.marks12)
  p.twelfthPercentage = p.twelfthScore
  p.twelfthBoard = first(raw.twelfthBoard, a.board12)
  p.twelfthYear = first(raw.twelfthYear, a.year12)
  p.school = first(raw.school, a.school12, a.school10)
  p.board = first(raw.board, p.twelfthBoard, p.tenthBoard)
  p.stream = first(raw.stream, a.stream)

  // graduation (PG applicants only)
  p.cgpa = first(raw.cgpa, raw.bachelorCgpa)
  p.graduationDetails = first(raw.graduationDetails, raw.bachelorDegree)

  // entrance exams
  const scores: Record<string, any> = {}
  for (const e of EXAMS) {
    const v = first(...e.sources.map(s => get(raw, s)))
    if (v !== undefined) { p[e.key] = v; scores[e.label] = v }
  }
  if (Object.keys(scores).length) p.testScores = { ...(typeof raw.testScores === 'object' ? raw.testScores : {}), ...scores }
  p.entranceExam = first(raw.entranceExam, Object.keys(scores)[0])

  // preferences
  p.preferredPrograms = first(raw.preferredPrograms, raw.targetDegree)
  p.preferredLocation = first(raw.preferredLocation, raw.targetLocation, raw.preferredState)
  p.preferredState = first(raw.preferredState, raw.targetLocation)
  p.preferredBranch = first(raw.preferredBranch, raw.interestedBranch, raw.stream, a.stream)
  p.budget = first(raw.budget, raw.maxBudget)

  for (const k of Object.keys(p)) if (p[k] === undefined) delete p[k]
  return p
}

/** Flat keys onboarding should also write, so new profiles are canonical from day one. */
export function canonicalFromOnboarding(form: { academic?: Profile; exams?: Profile }): Profile {
  const a = form.academic ?? {}
  const x = form.exams ?? {}
  const out: Profile = {
    tenthScore: a.marks10, tenthBoard: a.board10, tenthYear: a.year10,
    twelfthScore: a.marks12, twelfthBoard: a.board12, twelfthYear: a.year12,
    school: a.school12 || a.school10, stream: a.stream,
    jeeScore: x.jeeMain, neetScore: x.neet, cuetScore: x.cuet, bitsatScore: x.bitSat,
  }
  for (const k of Object.keys(out)) if (out[k] === undefined || out[k] === '') delete out[k]
  return out
}
