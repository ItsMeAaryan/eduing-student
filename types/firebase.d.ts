// types/firebase.d.ts
import { Timestamp } from 'firebase/firestore'

export interface UserProfile {
  uid: string
  fullName: string
  email: string
  phone: string
  dob: string
  gender: 'male' | 'female' | 'other'
  category: 'General' | 'OBC' | 'SC' | 'ST' | 'EWS'
  address: string
  state: string
  nationality: string
  profilePhotoURL: string
  profileCompletion: number
  role: 'student' | 'super_admin'
  isVerified: boolean
  tenthPercentage?: number
  twelfthPercentage?: number
  entranceExam?: string
  entranceScore?: number
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface UserDocument {
  fileUrl: string
  status: 'uploaded' | 'verified' | 'rejected' | 'removed'
  uploadedAt: Timestamp
}

// Canonical application status — use this everywhere
export type ApplicationStatus =
  | 'submitted'
  | 'under_review'
  | 'waitlisted'
  | 'selected'
  | 'rejected'

export interface Application {
  id: string
  userId: string
  studentId: string
  universityId: string
  universityName?: string
  programId: string
  programName?: string
  status: ApplicationStatus
  createdAt: Timestamp
  updatedAt: Timestamp
  paymentStatus?: 'pending' | 'paid' | 'failed'
  documentsVerified?: boolean
}

export interface Program {
  id: string
  name: string
  level: string
  duration: string
  annualFee: number
  fee?: number // backward compat alias
  totalSeats: number
  availableSeats?: number
  eligibility: string
  entranceExam?: string
  hasEntranceExam?: boolean
  description?: string
  availability: 'active' | 'closed' | 'coming_soon'
}

export interface University {
  id: string
  name: string
  location: string | { city: string; state: string } // both shapes exist in DB
  rating?: number
  naacGrade?: string
  imageUrl?: string
  logoUrl?: string
  programs?: Program[]
  isFeatured?: boolean
  approvalStatus: 'pending' | 'approved' | 'rejected'
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Scholarship {
  id: string
  name: string
  provider: string
  amount: number
  eligibility: string
  deadline?: Timestamp
  isActive: boolean
  createdAt: Timestamp
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: Timestamp
}

export interface Payment {
  id: string
  userId: string
  amount: number
  purpose: string
  status: 'success' | 'pending' | 'failed'
  method: string
  transactionId: string
  createdAt: Timestamp
}