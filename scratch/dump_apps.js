const admin = require('firebase-admin')
const serviceAccount = require('../scripts/serviceAccount.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const db = admin.firestore()

async function dump() {
  const snapshot = await db.collection('applications').get()
  const statusStats = {}
  snapshot.docs.forEach(doc => {
    const s = doc.data().status
    statusStats[s] = (statusStats[s] || 0) + 1
  })
  console.log("Total Applications Found:", snapshot.size)
  console.log("Status Distribution:", JSON.stringify(statusStats, null, 2))
  process.exit(0)
}

dump().catch(console.error)
