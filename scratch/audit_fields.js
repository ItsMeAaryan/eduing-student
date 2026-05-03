const admin = require('firebase-admin')
const serviceAccount = require('../scripts/serviceAccount.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const db = admin.firestore()

async function audit() {
  const snapshot = await db.collection('applications').get()
  let count = 0
  let missingUserId = 0
  
  snapshot.docs.forEach(doc => {
    const data = doc.data()
    if (data.studentId && !data.userId) {
      missingUserId++
    }
    count++
  })
  
  console.log("Total Applications:", count)
  console.log("Missing userId:", missingUserId)
  process.exit(0)
}

audit().catch(console.error)
