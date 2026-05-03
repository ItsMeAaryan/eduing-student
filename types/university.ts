export interface ExtendedUniversityProfile {
  uid?: string

  name?: string

  email?: string

  phone?: string

  website?: string

  city?: string

  state?: string

  country?: string

  logoUrl?: string

  bannerUrl?: string

  description?: string

  establishedYear?: string

  universityType?: string

  accreditation?: string

  rating?: number

  applicationDeadline?: string

  programs?: string[]

  facilities?: string[]

  documentsRequired?: string[]

  admissionProcess?: string

  contactPerson?: string

  createdAt?: any

  updatedAt?: any
}

export interface UniversityDetails
  extends ExtendedUniversityProfile {}
