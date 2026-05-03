const admin = require('firebase-admin')
const serviceAccount = require('../scripts/serviceAccount.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const db = admin.firestore()
const auth = admin.auth()

async function fix() {
  let attempt = 0
  const maxAttempts = 5
  
  while (attempt < maxAttempts) {
    try {
      attempt++
      console.log(`Attempt ${attempt}...`)
      
      const user = await auth.getUserByEmail('aaryan.student@eduing.in')
      console.log('Student UID:', user.uid)

      const applications = await db.collection('applications').get()
      if (applications.empty) {
        console.log('No applications found.')
        process.exit(0)
      }

      const batch = db.batch()
      applications.forEach(doc => {
        const data = doc.data()
        console.log('Application:', doc.id, '| studentId:', data.studentId)
        if (data.studentId !== user.uid) {
          console.log('Updating studentId for:', doc.id)
          batch.update(doc.ref, { studentId: user.uid })
        }
      })

      await batch.commit()
      console.log('✅ Success!')
      process.exit(0)
    } catch (err) {
      console.error(`Attempt ${attempt} failed:`, err.message)
      if (attempt === maxAttempts) {
        process.exit(1)
      }
      await new Promise(r => setTimeout(r, 2000))
    }
  }
}

fix()
