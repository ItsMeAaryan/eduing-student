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

  [key: string]: any
}

export interface UniversityDetails
  extends ExtendedUniversityProfile {}export interface ExtendedUniversityProfile {
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

  [key: string]: any
}

export interface UniversityDetails
  extends ExtendedUniversityProfile {}import { UniversityProfile } from "@/lib/auth";

export interface ExtendedUniversityProfile extends UniversityProfile {
  // Fields that might not be in the base profile initially
  logoUrl?: string;
  programs?: string[];
  applicationDeadline?: string; // ISO date string
  rating?: number; // 1-5
  requiresEntranceExam?: boolean;
}

export interface UniversityFilters {
  searchQuery: string;
  states: string[];
  city: string;
  programs: string[];
  requiresEntranceExam: boolean | null;
}
