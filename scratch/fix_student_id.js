const admin = require('firebase-admin')
const serviceAccount = require('../scripts/serviceAccount.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const db = admin.firestore()
const auth = admin.auth()

async function fix() {
  try {
    const user = await auth.getUserByEmail('aaryan.student@eduing.in')
    console.log('Student UID:', user.uid)

    const applications = await db.collection('applications').get()
    if (applications.empty) {
      console.log('No applications found.')
      return
    }

    const batch = db.batch()
    applications.forEach(doc => {
      const data = doc.data()
      console.log('Application Document:', doc.id)
      console.log(JSON.stringify(data, null, 2))
      if (data.studentId !== user.uid) {
        console.log('Updating studentId for application:', doc.id, 'from', data.studentId, 'to', user.uid)
        batch.update(doc.ref, { studentId: user.uid })
      }
    })

    await batch.commit()
    console.log('Fixed all applications.')
    process.exit(0)
  } catch (err) {
    console.error('Error:', err)
    process.exit(1)
  }
}

fix()
