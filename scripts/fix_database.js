const admin = require('firebase-admin')
const serviceAccount = require('./serviceAccount.json')

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})

const db = admin.firestore()

async function fixDatabase() {
    console.log('Starting database fix...')

    // STEP 1: Fix all applications
    // Make sure every application has:
    // studentId, userId, studentEmail all set
    // status uses consistent values

    const appsSnap = await db
        .collection('applications').get()

    console.log(`Found ${appsSnap.size} applications`)

    for (const appDoc of appsSnap.docs) {
        const data = appDoc.data()

        // Fix status values
        let status = data.status || 'submitted'
        if (status === 'review')
            status = 'under_review'
        if (status === 'accept' ||
            status === 'accepted')
            status = 'selected'
        if (status === 'reject')
            status = 'rejected'

        // Make sure ALL id fields exist
        const updates = {
            status: status,
            // Ensure both field names exist
            studentId: data.studentId
                || data.userId
                || data.uid
                || '',
            userId: data.studentId
                || data.userId
                || data.uid
                || '',
            studentEmail: data.studentEmail
                || data.email
                || '',
            universityId: data.universityId || '',
            universityName: data.universityName || '',
            programId: data.programId || '',
            programName: data.programName || '',
            appliedAt: data.appliedAt
                || admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue
                .serverTimestamp(),
        }

        await db.collection('applications')
            .doc(appDoc.id).update(updates)

        console.log(`Fixed application: ${appDoc.id}`)
    }

    // STEP 2: Fix universities
    // Make sure approvalStatus is set
    const unisSnap = await db
        .collection('universities').get()

    console.log(`Found ${unisSnap.size} universities`)

    for (const uniDoc of unisSnap.docs) {
        const data = uniDoc.data()

        const updates = {
            approvalStatus: data.approvalStatus
                || 'approved',
            isVerified: data.isVerified || true,
            name: data.name || '',
            state: data.state || '',
            city: data.city || '',
        }

        await db.collection('universities')
            .doc(uniDoc.id).update(updates)

        console.log(`Fixed university: ${data.name}`)
    }

    // STEP 3: Fix student profiles
    const profilesSnap = await db
        .collection('student_profiles').get()

    for (const profileDoc of profilesSnap.docs) {
        const data = profileDoc.data()

        await db.collection('student_profiles')
            .doc(profileDoc.id).update({
                uid: data.uid || profileDoc.id,
                userId: data.uid || profileDoc.id,
            })
    }

    // STEP 4: Fix users collection
    const usersSnap = await db
        .collection('users').get()

    for (const userDoc of usersSnap.docs) {
        const data = userDoc.data()

        await db.collection('users')
            .doc(userDoc.id).update({
                uid: data.uid || userDoc.id,
            })
    }

    console.log('✅ Database fix complete!')
}

fixDatabase().catch(console.error)