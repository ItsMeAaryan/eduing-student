const admin = require('firebase-admin')
const serviceAccount = 
  require('./serviceAccount.json')

admin.initializeApp({
  credential: 
    admin.credential.cert(serviceAccount)
})

const db = admin.firestore()
const auth = admin.auth()

async function seed() {
  console.log('Seeding Firebase...')

  // Create demo student
  const studentAuth = await auth.createUser({
    email: 'aaryan.student@eduing.in',
    password: 'demo123',
    displayName: 'Aaryan Sharma',
  })

  await db.collection('users')
    .doc(studentAuth.uid).set({
    uid: studentAuth.uid,
    email: 'aaryan.student@eduing.in',
    role: 'student',
    createdAt: admin.firestore
      .FieldValue.serverTimestamp(),
    isVerified: true,
  })

  await db.collection('student_profiles')
    .doc(studentAuth.uid).set({
    uid: studentAuth.uid,
    fullName: 'Aaryan Sharma',
    email: 'aaryan.student@eduing.in',
    phone: '+91 9876543210',
    city: 'Bengaluru',
    state: 'Karnataka',
    stream: 'Science',
    tenthSchool: 'Delhi Public School',
    tenthBoard: 'CBSE',
    tenthMarks: '92.4',
    tenthYear: '2021',
    twelfthSchool: 'Delhi Public School',
    twelfthBoard: 'CBSE',
    twelfthMarks: '88.6',
    twelfthYear: '2023',
    entranceScores: { 'JEE_Main': '145' },
    documents: {},
    profileComplete: true,
    updatedAt: admin.firestore
      .FieldValue.serverTimestamp(),
  })

  // Create demo university admin
  const uniAuth = await auth.createUser({
    email: 'admin@dsu.eduing.in',
    password: 'demo123',
    displayName: 'DSU Admin',
  })

  await db.collection('users')
    .doc(uniAuth.uid).set({
    uid: uniAuth.uid,
    email: 'admin@dsu.eduing.in',
    role: 'uni_admin',
    createdAt: admin.firestore
      .FieldValue.serverTimestamp(),
    isVerified: true,
  })

  const uniRef = await db
    .collection('universities')
    .doc(uniAuth.uid).set({
    uid: uniAuth.uid,
    name: 'Dayananda Sagar University',
    shortName: 'DSU',
    email: 'admin@dsu.eduing.in',
    state: 'Karnataka',
    city: 'Bengaluru',
    type: 'Private',
    accreditation: 'NAAC A',
    established: 2014,
    totalStudents: 12000,
    campusSize: '60 acres',
    description: 'Premier private university in Bengaluru offering diverse programs.',
    approvalStatus: 'approved',
    isVerified: true,
    isFeatured: false,
    placementData: {
      averageSalary: '6 LPA',
      highestSalary: '32 LPA',
      placementRate: '82%',
      topRecruiters: [
        'Infosys','TCS','Wipro','Accenture'
      ],
    },
    alumniCount: 25000,
    facilities: [
      'Library','Hostel','Sports',
      'Labs','Medical','WiFi','Gym'
    ],
    createdAt: admin.firestore
      .FieldValue.serverTimestamp(),
    updatedAt: admin.firestore
      .FieldValue.serverTimestamp(),
  })

  // Add universities
  const universities = [
    {
      name: 'Indian Institute of Technology Delhi',
      shortName: 'IIT Delhi',
      state: 'Delhi',
      city: 'New Delhi',
      type: 'Public',
      accreditation: 'NAAC A++',
      established: 1961,
      totalStudents: 8000,
      campusSize: '325 acres',
      description: 'Premier engineering institute of national importance.',
      approvalStatus: 'approved',
      isVerified: true,
      isFeatured: true,
      placementData: {
        averageSalary: '21 LPA',
        highestSalary: '2.4 CPA',
        placementRate: '98%',
        topRecruiters: [
          'Google','Microsoft',
          'Amazon','Goldman Sachs'
        ],
      },
      alumniCount: 45000,
      facilities: [
        'Library','Hostel','Sports',
        'Labs','Medical','WiFi','Gym'
      ],
    },
    {
      name: 'BITS Pilani',
      shortName: 'BITS',
      state: 'Rajasthan',
      city: 'Pilani',
      type: 'Deemed',
      accreditation: 'NAAC A',
      established: 1964,
      totalStudents: 15000,
      campusSize: '328 acres',
      description: 'Top deemed university known for engineering and sciences.',
      approvalStatus: 'approved',
      isVerified: true,
      isFeatured: true,
      placementData: {
        averageSalary: '18 LPA',
        highestSalary: '1.2 CPA',
        placementRate: '95%',
        topRecruiters: [
          'Google','Adobe',
          'Qualcomm','Samsung'
        ],
      },
      alumniCount: 60000,
      facilities: [
        'Library','Hostel','Sports',
        'Labs','Medical','WiFi'
      ],
    },
    {
      name: 'Manipal Academy of Higher Education',
      shortName: 'MAHE',
      state: 'Karnataka',
      city: 'Manipal',
      type: 'Deemed',
      accreditation: 'NAAC A++',
      established: 1953,
      totalStudents: 28000,
      campusSize: '600 acres',
      description: 'Indias top deemed university with diverse programs.',
      approvalStatus: 'approved',
      isVerified: true,
      isFeatured: false,
      placementData: {
        averageSalary: '8 LPA',
        highestSalary: '45 LPA',
        placementRate: '85%',
        topRecruiters: [
          'Infosys','TCS',
          'Wipro','Manipal Health'
        ],
      },
      alumniCount: 100000,
      facilities: [
        'Library','Hostel','Hospital',
        'Sports','Labs','Medical','WiFi'
      ],
    },
    {
      name: 'VIT Vellore',
      shortName: 'VIT',
      state: 'Tamil Nadu',
      city: 'Vellore',
      type: 'Deemed',
      accreditation: 'NAAC A++',
      established: 1984,
      totalStudents: 55000,
      campusSize: '372 acres',
      description: 'Leading deemed university with strong industry connections.',
      approvalStatus: 'approved',
      isVerified: true,
      isFeatured: false,
      placementData: {
        averageSalary: '7 LPA',
        highestSalary: '48 LPA',
        placementRate: '90%',
        topRecruiters: [
          'TCS','Wipro',
          'Infosys','HCL'
        ],
      },
      alumniCount: 80000,
      facilities: [
        'Library','Hostel','Sports',
        'Labs','Medical','WiFi','Gym'
      ],
    },
  ]

  const uniIds = []
  for (const uni of universities) {
    const ref = await db
      .collection('universities').add({
      ...uni,
      createdAt: admin.firestore
        .FieldValue.serverTimestamp(),
      updatedAt: admin.firestore
        .FieldValue.serverTimestamp(),
    })
    uniIds.push({ id: ref.id, ...uni })
    console.log(`Added university: ${uni.name}`)
  }

  // Add programs for each university
  const programs = [
    {
      name: 'B.Tech Computer Science & Engineering',
      level: 'UG',
      duration: '4 Years',
      totalSeats: 120,
      availableSeats: 33,
      annualFee: 230000,
      eligibility: '12th PCM minimum 75%. JEE Advanced qualified.',
      hasEntranceExam: true,
      entranceExam: 'JEE Advanced',
      status: 'active',
    },
    {
      name: 'MBA Business Administration',
      level: 'MBA',
      duration: '2 Years',
      totalSeats: 60,
      availableSeats: 15,
      annualFee: 280000,
      eligibility: 'Any graduation minimum 55%. CAT/MAT score required.',
      hasEntranceExam: true,
      entranceExam: 'CAT',
      status: 'active',
    },
    {
      name: 'B.Tech Electronics & Communication',
      level: 'UG',
      duration: '4 Years',
      totalSeats: 90,
      availableSeats: 20,
      annualFee: 220000,
      eligibility: '12th PCM minimum 70%.',
      hasEntranceExam: true,
      entranceExam: 'JEE Main',
      status: 'active',
    },
  ]

  for (const uni of uniIds) {
    for (const prog of programs) {
      await db.collection('programs').add({
        universityId: uni.id,
        universityName: uni.name,
        ...prog,
        applicationDeadline: admin.firestore
          .Timestamp.fromDate(
            new Date('2026-06-30')),
        createdAt: admin.firestore
          .FieldValue.serverTimestamp(),
        updatedAt: admin.firestore
          .FieldValue.serverTimestamp(),
      })
    }
    console.log(`Added programs for: ${uni.name}`)
  }

  // Add notifications for student
  const notifications = [
    {
      userId: studentAuth.uid,
      title: 'Welcome to EDUING.in! 🎉',
      message: 'Start exploring universities and apply to your dream programs.',
      type: 'info',
      isRead: false,
    },
    {
      userId: studentAuth.uid,
      title: 'Deadline Alert ⏰',
      message: 'IIT Delhi application closes in 10 days. Apply now!',
      type: 'warning',
      isRead: false,
    },
    {
      userId: studentAuth.uid,
      title: 'Profile Incomplete',
      message: 'Complete your profile to apply to universities.',
      type: 'update',
      isRead: true,
    },
  ]

  for (const notif of notifications) {
    await db.collection('notifications').add({
      ...notif,
      createdAt: admin.firestore
        .FieldValue.serverTimestamp(),
    })
  }

  // Add sample application
  await db.collection('applications').add({
    studentId: studentAuth.uid,
    studentName: 'Aaryan Sharma',
    studentEmail: 'aaryan.student@eduing.in',
    universityId: uniAuth.uid,
    universityName: 'Dayananda Sagar University',
    programName: 'B.Tech Computer Science & Engineering',
    status: 'under_review',
    appliedAt: admin.firestore
      .FieldValue.serverTimestamp(),
    updatedAt: admin.firestore
      .FieldValue.serverTimestamp(),
    statusHistory: [
      {
        status: 'submitted',
        date: new Date().toISOString(),
        note: 'Application received',
      },
      {
        status: 'under_review',
        date: new Date().toISOString(),
        note: 'Documents being verified',
      },
    ],
    isPaid: false,
  })

  console.log('✅ Seeding complete!')
  console.log('Demo Student Login:')
  console.log('  Email: aaryan.student@eduing.in')
  console.log('  Password: demo123')
  console.log('Demo University Login:')
  console.log('  Email: admin@dsu.eduing.in')
  console.log('  Password: demo123')
  
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})