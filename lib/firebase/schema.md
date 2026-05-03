# Firestore Schema for EDUING.in (Web & Mobile Sync)

This document outlines the Firestore collection structure and field definitions for the EDUING.in platform, ensuring full replication of mobile app features.

## COLLECTIONS

### 1. USERS collection
- **Document ID**: Firebase Auth UID
- **Fields**:
  - `uid`: string
  - `fullName`: string
  - `email`: string
  - `phone`: string
  - `dob`: string (YYYY-MM-DD)
  - `gender`: 'male' | 'female' | 'other'
  - `category`: 'General' | 'OBC' | 'SC' | 'ST' | 'EWS'
  - `address`: string
  - `state`: string
  - `nationality`: string
  - `profilePhotoURL`: string (Firebase Storage URL)
  - `profileCompletion`: number (0–100)
  - `role`: 'student' | 'super_admin'
  - `isVerified`: boolean (true/false)
  - `createdAt`: timestamp
  - `updatedAt`: timestamp

#### 1.1 DOCUMENTS subcollection
- **Path**: `users/{uid}/documents/{docId}`
- **Document IDs**: `10th_marksheet`, `12th_marksheet`, `id_proof`, `passport_photo`
- **Fields**:
  - `fileUrl`: string (Firebase Storage URL)
  - `status`: 'uploaded' | 'verified' | 'rejected'
  - `uploadedAt`: timestamp

---

### 2. UNIVERSITIES collection
- **Document ID**: Auto-generated
- **Fields**:
  - `name`: string
  - `location`: string (City, State)
  - `rating`: number (1-5)
  - `naacGrade`: string (e.g., 'A++', 'A')
  - `imageUrl`: string (Firebase Storage URL)
  - `programs`: array of maps
    - `{ name, level, duration, fee, availability }`
  - `isFeatured`: boolean
  - `createdAt`: timestamp
  - `updatedAt`: timestamp

---

### 3. APPLICATIONS collection
- **Document ID**: Auto-generated
- **Fields**:
  - `userId`: string (Student's UID)
  - `universityId`: string
  - `programId`: string
  - `status`: 'submitted' | 'review' | 'accepted' | 'rejected'
  - `appliedAt`: timestamp
  - `paymentStatus`: 'pending' | 'paid' | 'failed'
  - `documentsVerified`: boolean (true/false)
  - `updatedAt`: timestamp

---

### 4. NOTIFICATIONS collection
- **Document ID**: Auto-generated
- **Fields**:
  - `userId`: string
  - `title`: string
  - `message`: string
  - `type`: string
  - `isRead`: boolean
  - `createdAt`: timestamp
