import { ExtendedUniversityProfile } from "./university";

export interface Program {
  id: string;
  name: string;
  level: "UG" | "PG" | "MBA" | "PhD" | "Other";
  duration: string;
  totalSeats: number;
  eligibility: string;
  applicationDeadline: string; // ISO date string
  applicationFee: number;
  entranceExamRequired: boolean;
}

export interface Review {
  id: string;
  authorName: string;
  rating: number; // 1-5
  comment: string;
  date: string; // ISO date string
  categories: {
    academics: number;
    infrastructure: number;
    placements: number;
    faculty: number;
    campusLife: number;
  };
}

export interface UniversityDetails extends ExtendedUniversityProfile {
  bannerUrl?: string;
  about?: string;
  keyFacts?: {
    foundedYear: number;
    type: "Public" | "Private" | "Deemed";
    accreditation: string;
    totalStudents: number;
    campusSize: string;
  };
  facilities?: string[];
  gallery?: string[];
  programsList?: Program[];
  reviewsList?: Review[];
}
