export interface UniversityFilters {
  searchQuery?: string
  states?: string[]
  state?: string
  city?: string
  programs?: string[]
  program?: string
  requiresEntranceExam?: boolean | null
}

export interface ExtendedUniversityProfile {
  uid: string
  name?: string
  city?: string
  state?: string
  logoUrl?: string
  rating?: number
  programs?: string[]
  applicationDeadline?: string
  requiresEntranceExam?: boolean
  [key: string]: any // allows extra fields accessed via `uni as any`
}export interface UniversityFilters {
  searchQuery?: string
  states?: string[]
  state?: string
  city?: string
  programs?: string[]
  program?: string
  requiresEntranceExam?: boolean | null
}
