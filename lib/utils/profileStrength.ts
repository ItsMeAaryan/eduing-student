export type MissingField = {
  key: string;
  label: string;
  priority: 'High' | 'Medium' | 'Low';
  timeMin: number;
};

export type ProfileStrengthResult = {
  percentage: number;
  grade: 'Excellent' | 'Very Good' | 'Good' | 'Needs Improvement' | 'Incomplete';
  missingFields: MissingField[];
  estimatedTime: number; // in minutes
  completedFields: number;
  totalFields: number;
};

const PROFILE_FIELDS = [
  { key: 'fullName', label: 'Full Name', priority: 'High', timeMin: 1 },
  { key: 'phone', label: 'Phone Number', priority: 'High', timeMin: 1 },
  { key: 'dob', label: 'Date of Birth', priority: 'Medium', timeMin: 1 },
  { key: 'gender', label: 'Gender', priority: 'Low', timeMin: 1 },
  { key: 'address', label: 'Detailed Address', priority: 'Medium', timeMin: 2 },
  { key: 'state', label: 'State', priority: 'Medium', timeMin: 1 },
  { key: 'nationality', label: 'Nationality', priority: 'Low', timeMin: 1 },
  { key: 'tenthPercentage', label: '10th Percentage', priority: 'High', timeMin: 2 },
  { key: 'twelfthPercentage', label: '12th Percentage', priority: 'High', timeMin: 2 },
  { key: 'entranceExam', label: 'Entrance Exam Details', priority: 'Medium', timeMin: 2 },
  { key: 'profilePhotoURL', label: 'Profile Photo', priority: 'High', timeMin: 3 },
  // Docs
  { key: 'doc_10th_marksheet', label: '10th Marksheet (Doc)', priority: 'High', timeMin: 2 },
  { key: 'doc_12th_marksheet', label: '12th Marksheet (Doc)', priority: 'High', timeMin: 2 },
  { key: 'doc_id_proof', label: 'ID Proof (Doc)', priority: 'High', timeMin: 2 },
  { key: 'doc_passport_photo', label: 'Passport Photo (Doc)', priority: 'Medium', timeMin: 2 },
] as const;

export function calculateProfileStrength(profile: any, documents: any = {}): ProfileStrengthResult {
  const missingFields: MissingField[] = [];
  let completedFields = 0;
  const totalFields = PROFILE_FIELDS.length;

  if (!profile) {
    return {
      percentage: 0,
      grade: 'Incomplete',
      missingFields: PROFILE_FIELDS.map(f => ({ key: f.key, label: f.label, priority: f.priority as any, timeMin: f.timeMin })),
      estimatedTime: PROFILE_FIELDS.reduce((a, b) => a + b.timeMin, 0),
      completedFields: 0,
      totalFields
    };
  }

  PROFILE_FIELDS.forEach(field => {
    let isCompleted = false;
    
    if (field.key.startsWith('doc_')) {
      const docKey = field.key.replace('doc_', '');
      isCompleted = !!documents[docKey]?.fileUrl;
    } else {
      const val = profile?.[field.key];
      isCompleted = val !== undefined && val !== null && val !== '';
    }

    if (isCompleted) {
      completedFields++;
    } else {
      missingFields.push({
        key: field.key,
        label: field.label,
        priority: field.priority as 'High' | 'Medium' | 'Low',
        timeMin: field.timeMin
      });
    }
  });

  const percentage = Math.round((completedFields / totalFields) * 100);
  
  let grade: ProfileStrengthResult['grade'];
  if (percentage >= 95) grade = 'Excellent';
  else if (percentage >= 80) grade = 'Very Good';
  else if (percentage >= 65) grade = 'Good';
  else if (percentage >= 40) grade = 'Needs Improvement';
  else grade = 'Incomplete';

  const estimatedTime = missingFields.reduce((acc, f) => acc + f.timeMin, 0);

  // sort missing fields by priority
  const priorityWeight = { 'High': 3, 'Medium': 2, 'Low': 1 };
  missingFields.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);

  return {
    percentage,
    grade,
    missingFields,
    estimatedTime,
    completedFields,
    totalFields
  };
}
