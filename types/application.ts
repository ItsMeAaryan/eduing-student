export type ApplicationStatus = "submitted" | "under_review" | "waitlisted" | "selected" | "rejected";

export interface TimelineEvent {
  status: ApplicationStatus;
  date: string; // ISO date string
  message?: string;
}

export interface Application {
  id: string; // Document ID
  studentId: string;
  universityId: string;
  programId: string;
  programName: string;
  message?: string;
  status: ApplicationStatus;
  appliedAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
  timeline?: TimelineEvent[];
  
  // UI helper fields (these will be mocked or joined on the client for this demo)
  universityName?: string;
  universityLogo?: string;
}
