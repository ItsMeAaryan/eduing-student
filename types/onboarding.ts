export interface OnboardingData {
  // Step 1
  profilePhotoUrl: string;
  dob: string;
  gender: string;
  phone: string;
  state: string;
  city: string;
  address: string;

  // Step 2
  school10th: string;
  board10th: string;
  percentage10th: string;
  year10th: string;
  
  school12th: string;
  board12th: string;
  percentage12th: string;
  year12th: string;
  stream: string;

  // Step 3
  exams: {
    [key: string]: string; // Exam name -> Score/Rank
  };

  // Step 4
  marksheet10thUrl: string;
  marksheet12thUrl: string;
  idProofUrl: string;
  passportPhotoUrl: string;
}

export const defaultOnboardingData: OnboardingData = {
  profilePhotoUrl: "",
  dob: "",
  gender: "",
  phone: "",
  state: "",
  city: "",
  address: "",

  school10th: "",
  board10th: "",
  percentage10th: "",
  year10th: "",
  
  school12th: "",
  board12th: "",
  percentage12th: "",
  year12th: "",
  stream: "",

  exams: {},

  marksheet10thUrl: "",
  marksheet12thUrl: "",
  idProofUrl: "",
  passportPhotoUrl: "",
};
