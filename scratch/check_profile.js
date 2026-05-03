const admin = require('firebase-admin')
const serviceAccount = require('../scripts/serviceAccount.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const db = admin.firestore()
const auth = admin.auth()

async function check() {
  try {
    const user = await auth.getUserByEmail('aaryan.student@eduing.in')
    console.log('Student UID:', user.uid)

    const profile = await db.collection('student_profiles').doc(user.uid).get()
    if (profile.exists) {
      console.log('Profile exists for UID:', user.uid)
    } else {
      console.log('Profile MISSING for UID:', user.uid)
      
      // Check if there is any profile for this email with a different UID
      const profiles = await db.collection('student_profiles').where('email', '==', 'aaryan.student@eduing.in').get()
      profiles.forEach(doc => {
        console.log('Found profile with different UID:', doc.id)
      })
    }
    process.exit(0)
  } catch (err) {
    console.error('Error:', err)
    process.exit(1)
  }
}

check()
