export const DEMO_STUDENT = {
  uid: 'demo-student-001',
  email: 'aaryan.student@eduing.in',
  password: 'demo123',
  role: 'student',
  fullName: 'Aaryan Sharma',
  phone: '9876543210',
  state: 'Karnataka',
  city: 'Bengaluru',
  dob: '2005-03-15',
  gender: 'Male',
  stream: 'Science',
  tenthMarks: '92.4',
  tenthBoard: 'CBSE',
  tenthYear: '2021',
  twelfthMarks: '88.6',
  twelfthBoard: 'CBSE',
  twelfthYear: '2023',
  entranceScores: {
    JEE_Main: '145',
    CUET: '680'
  }
}


export const DEMO_SUPER_ADMIN = {
  uid: 'demo-admin-001', 
  email: 'superadmin@eduing.in',
  password: 'admin123',
  role: 'super_admin'
}

export const DEMO_UNIVERSITIES = [
  {
    id: 'uni-001',
    name: 'Indian Institute of Technology Delhi',
    shortName: 'IIT Delhi',
    state: 'Delhi',
    city: 'New Delhi',
    type: 'Public',
    rating: 4.9,
    programs: ['BTech', 'MTech', 'PhD', 'MBA'],
    totalSeats: 1200,
    established: 1961,
    accreditation: 'NAAC A++',
    applicationDeadline: '2026-05-30',
    hasEntranceExam: true,
    entranceExam: 'JEE Advanced',
    applicationFee: 300,
    website: 'https://home.iitd.ac.in',
    logo: null
  },
  {
    id: 'uni-002', 
    name: 'BITS Pilani',
    shortName: 'BITS',
    state: 'Rajasthan',
    city: 'Pilani',
    type: 'Deemed',
    rating: 4.8,
    programs: ['BE', 'MSc', 'MBA', 'PhD'],
    totalSeats: 900,
    established: 1964,
    accreditation: 'NAAC A',
    applicationDeadline: '2026-06-15',
    hasEntranceExam: true,
    entranceExam: 'BITSAT',
    applicationFee: 350,
    website: 'https://www.bits-pilani.ac.in',
    logo: null
  },
  {
    id: 'uni-003',
    name: 'Manipal Academy of Higher Education',
    shortName: 'MAHE',
    state: 'Karnataka',
    city: 'Manipal',
    type: 'Deemed',
    rating: 4.6,
    programs: ['MBBS', 'BTech', 'BBA', 'LLB', 'MBA'],
    totalSeats: 3000,
    established: 1953,
    accreditation: 'NAAC A++',
    applicationDeadline: '2026-05-20',
    hasEntranceExam: true,
    entranceExam: 'MET',
    applicationFee: 500,
    website: 'https://manipal.edu',
    logo: null
  },
  {
    id: 'uni-004',
    name: 'Lovely Professional University',
    shortName: 'LPU',
    state: 'Punjab',
    city: 'Phagwara',
    type: 'Private',
    rating: 4.3,
    programs: ['BTech', 'MBA', 'BBA', 'LLB', 'BSc'],
    totalSeats: 8000,
    established: 2005,
    accreditation: 'NAAC A++',
    applicationDeadline: '2026-07-01',
    hasEntranceExam: false,
    entranceExam: null,
    applicationFee: 0,
    website: 'https://www.lpu.in',
    logo: null
  },
  {
    id: 'uni-005',
    name: 'VIT Vellore',
    shortName: 'VIT',
    state: 'Tamil Nadu',
    city: 'Vellore',
    type: 'Deemed',
    rating: 4.5,
    programs: ['BTech', 'MTech', 'MBA', 'MCA', 'PhD'],
    totalSeats: 5000,
    established: 1984,
    accreditation: 'NAAC A++',
    applicationDeadline: '2026-06-30',
    hasEntranceExam: true,
    entranceExam: 'VITEEE',
    applicationFee: 1150,
    website: 'https://vit.ac.in',
    logo: null
  },
  {
    id: 'uni-006',
    name: 'SRM Institute of Science and Technology',
    shortName: 'SRM',
    state: 'Tamil Nadu',
    city: 'Chennai',
    type: 'Deemed',
    rating: 4.4,
    programs: ['BTech', 'MBBS', 'MBA', 'LLB', 'BSc'],
    totalSeats: 6000,
    established: 1985,
    accreditation: 'NAAC A++',
    applicationDeadline: '2026-06-20',
    hasEntranceExam: true,
    entranceExam: 'SRMJEEE',
    applicationFee: 1000,
    website: 'https://www.srmist.edu.in',
    logo: null
  }
]

export const DEMO_PROGRAMS = [
  {
    id: 'prog-001',
    universityId: 'uni-001',
    name: 'B.Tech Computer Science & Engineering',
    level: 'UG',
    duration: '4 Years',
    seats: 120,
    eligibility: '12th PCM with min 75%, JEE Advanced qualified',
    hasEntranceExam: true,
    entranceExam: 'JEE Advanced',
    deadline: '2026-05-30',
    fee: 300,
    annualFee: 230000
  },
  {
    id: 'prog-002',
    universityId: 'uni-003',
    name: 'MBBS',
    level: 'UG',
    duration: '5.5 Years',
    seats: 250,
    eligibility: '12th PCB with min 60%, NEET qualified',
    hasEntranceExam: true,
    entranceExam: 'NEET',
    deadline: '2026-05-20',
    fee: 500,
    annualFee: 1200000
  },
  {
    id: 'prog-003',
    universityId: 'uni-004',
    name: 'MBA (Marketing & Finance)',
    level: 'PG',
    duration: '2 Years',
    seats: 300,
    eligibility: 'Any graduation with min 55%',
    hasEntranceExam: false,
    entranceExam: null,
    deadline: '2026-07-01',
    fee: 0,
    annualFee: 280000
  }
]

export const DEMO_APPLICATIONS = [
  {
    id: 'app-001',
    studentId: 'demo-student-001',
    programId: 'prog-001',
    universityId: 'uni-001',
    universityName: 'IIT Delhi',
    programName: 'B.Tech Computer Science',
    status: 'under_review',
    appliedAt: '2026-04-10',
    updatedAt: '2026-04-15',
    statusHistory: [
      { status: 'submitted', date: '2026-04-10', note: 'Application received' },
      { status: 'under_review', date: '2026-04-15', note: 'Documents being verified' }
    ]
  },
  {
    id: 'app-002',
    studentId: 'demo-student-001',
    programId: 'prog-002',
    universityId: 'uni-003',
    universityName: 'Manipal (MAHE)',
    programName: 'MBBS',
    status: 'selected',
    appliedAt: '2026-04-08',
    updatedAt: '2026-04-18',
    statusHistory: [
      { status: 'submitted', date: '2026-04-08', note: 'Application received' },
      { status: 'under_review', date: '2026-04-12', note: 'Under review' },
      { status: 'selected', date: '2026-04-18', note: 'Congratulations! Selected' }
    ]
  },
  {
    id: 'app-003',
    studentId: 'demo-student-001',
    programId: 'prog-003',
    universityId: 'uni-004',
    universityName: 'LPU',
    programName: 'MBA',
    status: 'waitlisted',
    appliedAt: '2026-04-05',
    updatedAt: '2026-04-20',
    statusHistory: [
      { status: 'submitted', date: '2026-04-05', note: 'Application received' },
      { status: 'under_review', date: '2026-04-10', note: 'Under review' },
      { status: 'waitlisted', date: '2026-04-20', note: 'On waitlist position #12' }
    ]
  }
]
