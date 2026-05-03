const admin = require('firebase-admin')
const serviceAccount = require('../scripts/serviceAccount.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const db = admin.firestore()

async function migrate() {
  console.log("Starting Robust Migration...")
  const snapshot = await db.collection('applications').get()
  const batch = db.batch()
  let count = 0

  // The correct userId we want to standardize on
  // Since all 15 belong to the same student in this case:
  const targetUid = "3UH5PVdHHicgfaAws3QyX0J4Wcd2"

  snapshot.docs.forEach(doc => {
    const data = doc.data()
    const update = {}
    
    // Step 1: Standardize userId field name
    const currentUid = data.userId || data.studentId || data.uid || data.userID
    
    if (!data.userId || data.userId !== currentUid || data.userId !== targetUid) {
      update.userId = targetUid
    }

    // Step 2: Ensure studentId also exists for compatibility
    if (!data.studentId || data.studentId !== targetUid) {
      update.studentId = targetUid
    }
    
    // Step 3: Remove bad/duplicate fields
    if (data.uid) update.uid = admin.firestore.FieldValue.delete()
    if (data.userID) update.userID = admin.firestore.FieldValue.delete()

    // Step 4: Ensure createdAt exists
    if (!data.createdAt && data.appliedAt) {
      update.createdAt = data.appliedAt
    }
    
    // Step 5: Ensure universityName and program exist (prevents blanks in UI)
    if (!data.universityName) update.universityName = "Unknown University"
    if (!data.program) update.program = data.programName || "General Program"

    if (Object.keys(update).length > 0) {
      batch.update(doc.ref, update)
      count++
      console.log(`Updating doc ${doc.id}:`, update)
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
