import { UniversityProfile } from "@/lib/auth";

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
