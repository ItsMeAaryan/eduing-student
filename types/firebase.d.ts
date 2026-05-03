import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  gender: 'male' | 'female' | 'other';
  category: 'General' | 'OBC' | 'SC' | 'ST' | 'EWS';
  address: string;
  state: string;
  nationality: string;
  profilePhotoURL: string;
  profileCompletion: number;
  role: 'student' | 'super_admin';
  isVerified: boolean;
  tenthPercentage?: number;
  twelfthPercentage?: number;
  entranceExam?: string;
  entranceScore?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserDocument {
  fileUrl: string;
  status: 'uploaded' | 'verified' | 'rejected';
  uploadedAt: Timestamp;
}

export interface Program {
  id: string;
  name: string;
  level: string;
  duration: string;
  annualFee: number;
  fee: number; // Keeping for backward compatibility
  totalSeats: number;
  availableSeats?: number;
  eligibility: string;
  entranceExam?: string;
  hasEntranceExam?: boolean;
  description?: string;
  availability: 'active' | 'closed' | 'coming_soon';
}

export interface University {
  id: string;
  name: string;
  location: string;
  rating: number;
  naacGrade: string;
  imageUrl: string;
  programs: Program[];
  isFeatured: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Application {
  id: string;
  userId: string;
  studentId?: string;
  universityId: string;
  programId: string;
  status: 'submitted' | 'review' | 'accepted' | 'rejected';
  appliedAt: Timestamp;
  paymentStatus: 'pending' | 'paid' | 'failed';
  documentsVerified: boolean;
  updatedAt: Timestamp;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: Timestamp;
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  purpose: string;
  status: 'success' | 'pending' | 'failed';
  method: string;
  transactionId: string;
  createdAt: Timestamp;
}

