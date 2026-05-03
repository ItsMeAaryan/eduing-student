const admin = require('firebase-admin')
const serviceAccount = require('../scripts/serviceAccount.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const db = admin.firestore()

async function migrate() {
  console.log("Starting Migration...")
  const snapshot = await db.collection('applications').get()
  const batch = db.batch()
  let count = 0

  snapshot.docs.forEach(doc => {
    const data = doc.data()
    const update = {}
    
    // Step 1: Ensure userId exists
    if (data.studentId && !data.userId) {
      update.userId = data.studentId
    }
    
    // Step 2: Ensure createdAt exists
    if (data.appliedAt && !data.createdAt) {
      update.createdAt = data.appliedAt
    }
    
    // Step 3: Standardize status to lowercase
    if (data.status) {
      const lowerStatus = data.status.toLowerCase()
      if (lowerStatus === 'under_review') {
        update.status = 'review'
      } else if (lowerStatus === 'selected') {
        update.status = 'accepted'
      } else if (lowerStatus !== data.status) {
        update.status = lowerStatus
      }
    }

    if (Object.keys(update).length > 0) {
      batch.update(doc.ref, update)
      count++
      console.log(`Prepared update for doc ${doc.id}:`, update)
    }
  })

  if (count > 0) {
    await batch.commit()
    console.log(`Successfully migrated ${count} documents.`)
  } else {
    console.log("No documents needed migration.")
  }
  process.exit(0)
}

migrate().catch(console.error)
