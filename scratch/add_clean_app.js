const admin = require('firebase-admin')
const serviceAccount = require('../scripts/serviceAccount.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const db = admin.firestore()
const auth = admin.auth()

async function addApp() {
  try {
    const user = await auth.getUserByEmail('aaryan.student@eduing.in')
    console.log('Student UID:', user.uid)

    const uni = await db.collection('universities').limit(1).get()
    if (uni.empty) {
      console.log('No universities found.')
      return
    }
    const university = uni.docs[0]
    console.log('Using University:', university.data().name, '| ID:', university.id)

    const appData = {
      studentId: user.uid,
      studentName: 'Aaryan Sharma',
      studentEmail: 'aaryan.student@eduing.in',
      universityId: university.id,
      universityName: university.data().name,
      programName: 'B.Tech Computer Science & Engineering',
      status: 'submitted',
      appliedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      statusHistory: [
        {
          status: 'submitted',
          date: new Date().toISOString(),
          note: 'Application submitted successfully',
        }
      ],
      isPaid: true
    }

    const res = await db.collection('applications').add(appData)
    console.log('Added new application with ID:', res.id)
    process.exit(0)
  } catch (err) {
    console.error('Error:', err)
    process.exit(1)
  }
}

addApp()
