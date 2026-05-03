const admin = require('firebase-admin')
const serviceAccount = require('../scripts/serviceAccount.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const auth = admin.auth()

async function listUsers() {
  try {
    const listUsersResult = await auth.listUsers(100)
    listUsersResult.users.forEach((userRecord) => {
      console.log('User:', userRecord.email, '| UID:', userRecord.uid)
    })
    process.exit(0)
  } catch (err) {
    console.error('Error:', err)
    process.exit(1)
  }
}

listUsers()
