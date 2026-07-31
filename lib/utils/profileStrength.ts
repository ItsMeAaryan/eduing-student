export type MissingField = {
  key: string;
  label: string;
  priority: 'High' | 'Medium' | 'Low';
  timeMin: number;
  link: string;
};

export type ProfileStrengthResult = {
  percentage: number;
  grade: 'Excellent' | 'Very Good' | 'Good' | 'Needs Improvement' | 'Incomplete';
  missingFields: MissingField[];
  estimatedTime: number; // in minutes
  completedFields: number;
  totalFields: number;
  // Per-category scores (0–100)
  categoryBreakdown: {
    personal: number;
    academics: number;
    testScores: number;
    preferences: number;
    documents: number;
  };
};

type FieldDef = {
  key: string;
  label: string;
  priority: 'High' | 'Medium' | 'Low';
  timeMin: number;
  link: string;
};

// ── Personal Info ─────────────────────────────────────────────────────────────
const PERSONAL_FIELDS: FieldDef[] = [
  { key: 'fullName',        label: 'Full Name',        priority: 'High',   timeMin: 1, link: '/student/profile' },
  { key: 'phone',           label: 'Phone Number',     priority: 'High',   timeMin: 1, link: '/student/profile' },
  { key: 'dob',             label: 'Date of Birth',    priority: 'Medium', timeMin: 1, link: '/student/profile' },
  { key: 'gender',          label: 'Gender',           priority: 'Low',    timeMin: 1, link: '/student/profile' },
  { key: 'address',         label: 'Detailed Address', priority: 'Medium', timeMin: 2, link: '/student/profile' },
  { key: 'state',           label: 'State',            priority: 'Medium', timeMin: 1, link: '/student/profile' },
  { key: 'city',            label: 'City',             priority: 'Medium', timeMin: 1, link: '/student/profile' },
  { key: 'country',         label: 'Country',          priority: 'Low',    timeMin: 1, link: '/student/profile' },
  { key: 'nationality',     label: 'Nationality',      priority: 'Low',    timeMin: 1, link: '/student/profile' },
  { key: 'bio',             label: 'Bio / About',      priority: 'Low',    timeMin: 3, link: '/student/profile' },
  { key: 'profilePhotoURL', label: 'Profile Photo',    priority: 'High',   timeMin: 3, link: '/student/profile' },
];

// ── Academic Info ─────────────────────────────────────────────────────────────
const ACADEMIC_FIELDS: FieldDef[] = [
  { key: 'tenthPercentage',   label: '10th Percentage',       priority: 'High',   timeMin: 2, link: '/student/profile' },
  { key: 'twelfthPercentage', label: '12th Percentage',       priority: 'High',   timeMin: 2, link: '/student/profile' },
  { key: 'school',            label: 'School Name',           priority: 'Medium', timeMin: 1, link: '/student/profile' },
  { key: 'board',             label: 'Board (CBSE/ICSE/etc)', priority: 'Medium', timeMin: 1, link: '/student/profile' },
  { key: 'cgpa',              label: 'CGPA / Percentage',     priority: 'Medium', timeMin: 1, link: '/student/profile' },
  { key: 'graduationDetails', label: 'Graduation Details',    priority: 'Medium', timeMin: 2, link: '/student/profile' },
];

// ── Test Scores ───────────────────────────────────────────────────────────────
const TEST_SCORE_FIELDS: FieldDef[] = [
  { key: 'entranceExam',  label: 'Entrance Exam',          priority: 'Medium', timeMin: 2, link: '/student/profile' },
  { key: 'testScores',    label: 'Test Scores (JEE/NEET)', priority: 'Medium', timeMin: 2, link: '/student/profile' },
];

// ── Preferences ───────────────────────────────────────────────────────────────
const PREFERENCE_FIELDS: FieldDef[] = [
  { key: 'preferredCountries', label: 'Preferred Countries', priority: 'Medium', timeMin: 2, link: '/student/profile' },
  { key: 'preferredPrograms',  label: 'Preferred Programs',  priority: 'Medium', timeMin: 2, link: '/student/profile' },
  { key: 'preferredBranch',    label: 'Preferred Branch',    priority: 'Medium', timeMin: 1, link: '/student/profile' },
  { key: 'budget',             label: 'Budget Range',        priority: 'Low',    timeMin: 1, link: '/student/profile' },
];

// ── Documents ─────────────────────────────────────────────────────────────────
const DOCUMENT_FIELDS: FieldDef[] = [
  { key: 'doc_10th_marksheet', label: '10th Marksheet', priority: 'High',   timeMin: 2, link: '/student/documents' },
  { key: 'doc_12th_marksheet', label: '12th Marksheet', priority: 'High',   timeMin: 2, link: '/student/documents' },
  { key: 'doc_id_proof',       label: 'ID Proof',        priority: 'High',   timeMin: 2, link: '/student/documents' },
  { key: 'doc_passport_photo', label: 'Passport Photo',  priority: 'Medium', timeMin: 2, link: '/student/documents' },
];

const ALL_FIELDS: FieldDef[] = [
  ...PERSONAL_FIELDS,
  ...ACADEMIC_FIELDS,
  ...TEST_SCORE_FIELDS,
  ...PREFERENCE_FIELDS,
  ...DOCUMENT_FIELDS,
];

function isFieldCompleted(field: FieldDef, profile: any, documents: any): boolean {
  const { key } = field;

  if (key.startsWith('doc_')) {
    const docKey = key.replace('doc_', '');
    // Accept both subcollection map {id: {fileUrl}} and legacy profile.documents map
    if (documents && typeof documents === 'object' && !Array.isArray(documents)) {
      return !!documents[docKey]?.fileUrl;
    }
    return false;
  }

  const val = profile?.[key];
  if (val === undefined || val === null || val === '') return false;
  if (Array.isArray(val)) return val.length > 0;
  if (typeof val === 'object') return Object.keys(val).length > 0;
  return true;
}

function categoryPct(fields: FieldDef[], profile: any, documents: any): number {
  if (fields.length === 0) return 0;
  const done = fields.filter(f => isFieldCompleted(f, profile, documents)).length;
  return Math.round((done / fields.length) * 100);
}

export function calculateProfileStrength(
  profile: any,
  // documents: subcollection map { [docId]: { fileUrl, status, uploadedAt } }
  documents: any = {}
): ProfileStrengthResult {
  const missingFields: MissingField[] = [];
  let completedFields = 0;
  const totalFields = ALL_FIELDS.length;

  if (!profile) {
    return {
      percentage: 0,
      grade: 'Incomplete',
      missingFields: ALL_FIELDS.map(f => ({ ...f })),
      estimatedTime: ALL_FIELDS.reduce((a, f) => a + f.timeMin, 0),
      completedFields: 0,
      totalFields,
      categoryBreakdown: { personal: 0, academics: 0, testScores: 0, preferences: 0, documents: 0 },
    };
  }

  ALL_FIELDS.forEach(field => {
    if (isFieldCompleted(field, profile, documents)) {
      completedFields++;
    } else {
      missingFields.push({ ...field });
    }
  });

  const percentage = Math.round((completedFields / totalFields) * 100);

  let grade: ProfileStrengthResult['grade'];
  if (percentage >= 95)      grade = 'Excellent';
  else if (percentage >= 80) grade = 'Very Good';
  else if (percentage >= 65) grade = 'Good';
  else if (percentage >= 40) grade = 'Needs Improvement';
  else                       grade = 'Incomplete';

  const estimatedTime = missingFields.reduce((acc, f) => acc + f.timeMin, 0);

  const priorityWeight: Record<string, number> = { 'High': 3, 'Medium': 2, 'Low': 1 };
  missingFields.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);

  return {
    percentage,
    grade,
    missingFields,
    estimatedTime,
    completedFields,
    totalFields,
    categoryBreakdown: {
      personal:    categoryPct(PERSONAL_FIELDS,    profile, documents),
      academics:   categoryPct(ACADEMIC_FIELDS,    profile, documents),
      testScores:  categoryPct(TEST_SCORE_FIELDS,  profile, documents),
      preferences: categoryPct(PREFERENCE_FIELDS,  profile, documents),
      documents:   categoryPct(DOCUMENT_FIELDS,    profile, documents),
    },
  };
}
