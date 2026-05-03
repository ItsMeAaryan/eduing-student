export type UserRole = 'student' | 'super_admin';

export interface BaseProfile {
  uid: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface StudentProfile extends BaseProfile {
  role: 'student';
  fullName: string;
  isVerified: boolean;
  profileComplete: boolean;
}

// Mock Auth logic
export const logoutUser = async () => {
  console.log("Mock logout called");
};

export const getStudentProfile = async (uid: string): Promise<StudentProfile | null> => {
  // Mock student data
  return {
    uid,
    email: 'student@example.com',
    role: 'student',
    createdAt: new Date().toISOString(),
    fullName: 'Rahul Sharma',
    isVerified: true,
    profileComplete: true,
  };
};
