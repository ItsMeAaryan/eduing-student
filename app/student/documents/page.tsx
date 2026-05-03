'use client'

import React, { useState, useEffect } from 'react'

import { motion, AnimatePresence } from 'framer-motion'
import ProtectedRoute from '@/components/ProtectedRoute'
import { 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  CheckCircle2, 
  Clock,
  Eye,
  Plus,
  Loader2,
  Check,
  X
} from 'lucide-react'

import { uploadUserDocument, listenUserProfile, deleteUserDocument } from '@/lib/firebase/student'
import { onAuthChange } from '@/lib/firebase/auth'
import { useAuth } from '@/hooks/useAuth'

const DOC_TYPES = [
  '10th Marksheet',
  '12th Marksheet',
  'ID Proof',
  'Passport Photo'
]

export default function DocumentsPage() {
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, any>>({})
  const [uploadingDocs, setUploadingDocs] = useState<Record<string, boolean>>({})
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  
  const [viewingDoc, setViewingDoc] = useState<any>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  
  const [docToDelete, setDocToDelete] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const { user } = useAuth()

  useEffect(() => {
    const unsub = onAuthChange((firebaseUser) => {
      if (firebaseUser) {
        const unsubProfile = listenUserProfile(firebaseUser.uid, (data) => {
          if (data?.documents) {
            setUploadedDocs(data.documents)
          }
        })
        return () => unsubProfile()
      }
    })
    return unsub
  }, [])

  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' = 'success'
  ) => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    docType: string
  ) => {
    if (!user) return

    const file = e.target.files?.[0]
    if (!file) return

    const maxSize = 10 * 1024 * 1024

    if (file.size > maxSize) {
      showToast('File must be under 10MB', 'error')
      return
    }

    setUploadingDocs(prev => ({
      ...prev,
      [docType]: true
    }))

    try {
      await uploadUserDocument(user.uid, file, docType)

      showToast('Document uploaded successfully!', 'success')

      setUploadingDocs(prev => ({
        ...prev,
        [docType]: false
      }))
    } catch (err) {
      showToast('Upload failed', 'error')

      setUploadingDocs(prev => ({
        ...prev,
        [docType]: false
      }))
    }
  }

  const handleDelete = async () => {
    if (!docToDelete || !user) return

    try {
      await deleteUserDocument(user.uid, docToDelete)

      setShowDeleteConfirm(false)
      setDocToDelete(null)

      showToast('Document deleted', 'info')
    } catch (err) {
      showToast('Failed to delete document', 'error')
    }
  }

  const handleDownload = (url: string) => {
    window.open(url, '_blank')
  }

  const handleView = (type: string) => {
    const url = uploadedDocs[type]

    if (!url) return

    window.open(url, '_blank')
  }

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div style={{ color: '#ffffff', fontFamily: 'Inter, sans-serif' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '32px'
          }}
        >
          <header>
            <h1
              style={{
                fontSize: '32px',
                fontWeight: '800',
                marginBottom: '8px'
              }}
            >
              My Documents
            </h1>

            <p
              style={{
                color: 'rgba(255,255,255,0.5)',
                fontSize: '16px'
              }}
            >
              Upload and manage your admission documents securely
            </p>
          </header>

          <button
            style={{
              background: 'linear-gradient(135deg, #6c6fff, #4f46e5)',
              color: '#ffffff',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '14px',
              fontSize: '14px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              boxShadow: '0 10px 25px rgba(108,111,255,0.3)'
            }}
          >
            <Plus size={20} /> Upload New
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '24px'
          }}
        >
          {DOC_TYPES.map((type, i) => {
            const doc = uploadedDocs[type]
            const isUploading = uploadingDocs[type]

            return (
              <motion.div
                key={type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                style={{
                  background: '#111111',
                  border: doc
                    ? '1px solid rgba(16,185,129,0.2)'
                    : isUploading
                    ? '1px solid rgba(108,111,255,0.4)'
                    : '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '24px',
                  padding: '24px',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '260px',
                  transition: 'all 0.3s ease'
                }}
              >
                <input
                  type="file"
                  id={`upload-${type}`}
                  accept=".pdf,.jpg,.jpeg,.png"
                  style={{ display: 'none' }}
                  onChange={(e) => handleUpload(e, type)}
                />

                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '20px'
                    }}
                  >
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '14px',
                        background: doc
                          ? 'rgba(16,185,129,0.1)'
                          : 'rgba(108,111,255,0.1)',
                        color: doc ? '#10b981' : '#6c6fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {doc ? <FileText size={24} /> : <Upload size={24} />}
                    </div>

                    {doc && (
                      <div
                        style={{
                          padding: '4px 10px',
                          borderRadius: '100px',
                          fontSize: '10px',
                          fontWeight: '800',
                          background: 'rgba(16,185,129,0.1)',
                          color: '#10b981',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Check size={12} /> VERIFIED
                      </div>
                    )}
                  </div>

                  <h3
                    style={{
                      fontSize: '17px',
                      fontWeight: '700',
                      marginBottom: '4px'
                    }}
                  >
                    {type}
                  </h3>

                  <p
                    style={{
                      fontSize: '13px',
                      color: 'rgba(255,255,255,0.4)',
                      marginBottom: '24px'
                    }}
                  >
                    {doc
                      ? `Uploaded Document`
                      : 'Requirement for admission'}
                  </p>
                </div>

                {isUploading ? (
                  <div
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(108,111,255,0.02)',
                      borderRadius: '16px',
                      gap: '12px'
                    }}
                  >
                    <Loader2
                      className="animate-spin"
                      size={24}
                      style={{ color: '#6c6fff' }}
                    />

                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#6c6fff'
                      }}
                    >
                      Uploading...
                    </span>
                  </div>
                ) : doc ? (
                  <div
                    style={{
                      display: 'flex',
                      gap: '12px',
                      borderTop: '1px solid rgba(255,255,255,0.05)',
                      paddingTop: '20px'
                    }}
                  >
                    <button
                      onClick={() => handleView(type)}
                      style={{
                        flex: 1,
                        background: 'rgba(255,255,255,0.05)',
                        border: 'none',
                        color: 'rgba(255,255,255,0.8)',
                        padding: '10px',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      <Eye size={16} /> View
                    </button>

                    <button
                      onClick={() => handleDownload(doc)}
                      style={{
                        width: '44px',
                        background: 'rgba(255,255,255,0.05)',
                        border: 'none',
                        color: 'rgba(255,255,255,0.8)',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <Download size={16} />
                    </button>

                    <button
                      onClick={() => {
                        setDocToDelete(type)
                        setShowDeleteConfirm(true)
                      }}
                      style={{
                        width: '44px',
                        background: 'rgba(248,113,113,0.05)',
                        border: 'none',
                        color: '#f87171',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() =>
                      document.getElementById(`upload-${type}`)?.click()
                    }
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '2px dashed rgba(255,255,255,0.1)',
                      borderRadius: '16px',
                      padding: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <span
                      style={{
                        fontWeight: '700',
                        fontSize: '14px',
                        color: 'rgba(255,255,255,0.6)'
                      }}
                    >
                      Click to upload
                    </span>

                    <span
                      style={{
                        fontSize: '11px',
                        color: 'rgba(255,255,255,0.3)'
                      }}
                    >
                      PDF, JPG, PNG (Max 10MB)
                    </span>
                  </button>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </ProtectedRoute>
  )
}
