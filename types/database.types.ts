export type UserRole = 'student' | 'super_admin';

export interface User {
  uid: string;
  email: string;
  role: UserRole;
  createdAt: any; // Firestore Timestamp
  isVerified: boolean;
}

export interface StudentProfile {
  uid: string;
  fullName: string;
  phone: string;
  dob: string;
  gender: string;
  city: string;
  state: string;
  address: string;
  photoURL: string;
  tenthSchool: string;
  tenthBoard: string;
  tenthMarks: string;
  tenthYear: string;
  twelfthSchool: string;
  twelfthBoard: string;
  twelfthMarks: string;
  twelfthYear: string;
  stream: string;
  entranceScores: Record<string, number>;
  documents: Record<string, string>;
  profileComplete: boolean;
  updatedAt: any; // Firestore Timestamp
}

export interface University {
  uid: string; // admin's auth UID
  name: string;
  shortName: string;
  description: string;
  tagline: string;
  type: 'Public' | 'Private' | 'Deemed' | 'Central';
  state: string;
  city: string;
  address: string;
  website: string;
  phone: string;
  email: string;
  established: number;
  accreditation: string;
  totalStudents: number;
  campusSize: string;
  logoURL: string;
  bannerURL: string;
  galleryURLs: string[];
  videoURL: string;
  facilities: string[];
  socialLinks: Record<string, string>;
  placementData: {
    averageSalary: string;
    highestSalary: string;
    topRecruiters: string[];
    placementRate: string;
  };
  alumniCount: number;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  isFeatured: boolean;
  isVerified: boolean;
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
}

export interface Program {
  universityId: string;
  universityName: string;
  name: string;
  level: 'UG' | 'PG' | 'MBA' | 'MTech' | 'MBBS' | 'LLB' | 'PhD';
  duration: string;
  totalSeats: number;
  availableSeats: number;
  annualFee: number;
  eligibility: string;
  hasEntranceExam: boolean;
  entranceExam: string;
  applicationDeadline: any; // Firestore Timestamp
  programDescription: string;
  syllabus: string;
  careerProspects: string[];
  status: 'active' | 'closed' | 'coming_soon';
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
}

export interface Application {
  studentId: string;
  studentName: string;
  studentEmail: string;
  universityId: string;
  universityName: string;
  programId: string;
  programName: string;
  status: 'submitted' | 'under_review' | 'selected' | 'waitlisted' | 'rejected';
  appliedAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
  statusHistory: {
    status: string;
    date: any; // Firestore Timestamp
    note: string;
  }[];
  documents: Record<string, string>; // docType -> storageURL
  applicationFee: number;
  isPaid: boolean;
  notes: string;
}

export interface Review {
  universityId: string;
  studentId: string;
  studentName: string;
  overallRating: number;
  academicsRating: number;
  infrastructureRating: number;
  placementsRating: number;
  facultyRating: number;
  campusLifeRating: number;
  comment: string;
  program: string;
  batch: string;
  isVerified: boolean;
  createdAt: any; // Firestore Timestamp
}

export interface Notification {
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link: string;
  createdAt: any; // Firestore Timestamp
}

export interface ExamSchedule {
  universityId: string;
  programId: string;
  examName: string;
  examDate: any; // Firestore Timestamp
  reportingTime: string;
  centers: string[];
  instructions: string;
  isPublished: boolean;
}

export interface SeatAllotment {
  universityId: string;
  programId: string;
  studentId: string;
  rank: number;
  allottedSeat: string;
  round: number;
  status: 'allotted' | 'confirmed' | 'rejected';
  allottedAt: any; // Firestore Timestamp
}
