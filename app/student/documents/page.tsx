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
import { uploadStudentDocument, listenStudentProfile, deleteStudentDocument } from '@/lib/firebase/student'
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
        const unsubProfile = listenStudentProfile(firebaseUser.uid, (data) => {
          if (data?.documents) {
            setUploadedDocs(data.documents)
          }
        })
        return () => unsubProfile()
      }
    })
    return unsub
  }, [])


  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    if (!user) return
    const file = e.target.files?.[0]
    if (!file) return

    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      showToast('File must be under 10MB', 'error')
      return
    }

    setUploadingDocs(prev => ({ ...prev, [docType]: true }))

    try {
      const url = await uploadStudentDocument(user.uid, file, docType)
      showToast('Document uploaded successfully!', 'success')
      setUploadingDocs(prev => ({ ...prev, [docType]: false }))
    } catch (err) {
      showToast('Upload failed', 'error')
      setUploadingDocs(prev => ({ ...prev, [docType]: false }))
    }
  }


  const handleDelete = async () => {
    if (!docToDelete || !user) return
    try {
      await deleteStudentDocument(user.uid, docToDelete)
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
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
            <header>
              <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>My Documents</h1>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px' }}>
                Upload and manage your admission documents securely
              </p>
            </header>
            <button style={{
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
            }}>
              <Plus size={20} /> Upload New
            </button>
          </div>

          {/* DOCUMENT GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
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
                    border: doc ? '1px solid rgba(16,185,129,0.2)' : isUploading ? '1px solid rgba(108,111,255,0.4)' : '1px solid rgba(255,255,255,0.07)',
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                      <div style={{ 
                        width: '48px', 
                        height: '48px', 
                        borderRadius: '14px', 
                        background: doc ? 'rgba(16,185,129,0.1)' : 'rgba(108,111,255,0.1)', 
                        color: doc ? '#10b981' : '#6c6fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {doc ? <FileText size={24} /> : <Upload size={24} />}
                      </div>
                      {doc && (
                        <div style={{
                          padding: '4px 10px',
                          borderRadius: '100px',
                          fontSize: '10px',
                          fontWeight: '800',
                          background: 'rgba(16,185,129,0.1)',
                          color: '#10b981',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <Check size={12} /> VERIFIED
                        </div>
                      )}
                    </div>

                    <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '4px' }}>{type}</h3>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '24px' }}>
                      {doc ? `Uploaded Document` : 'Requirement for admission'}
                    </p>

                  </div>

                  {isUploading ? (
                    <div style={{ 
                      flex: 1, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      background: 'rgba(108,111,255,0.02)',
                      borderRadius: '16px',
                      gap: '12px'
                    }}>
                      <Loader2 className="animate-spin" size={24} style={{ color: '#6c6fff' }} />
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#6c6fff' }}>Uploading...</span>
                    </div>
                  ) : doc ? (
                    <div style={{ 
                      display: 'flex', 
                      gap: '12px',
                      borderTop: '1px solid rgba(255,255,255,0.05)',
                      paddingTop: '20px'
                    }}>
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
                      onClick={() => document.getElementById(`upload-${type}`)?.click()}
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
                      onMouseOver={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(108,111,255,0.4)'
                        e.currentTarget.style.background = 'rgba(108,111,255,0.02)'
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                        e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                      }}
                    >
                      <span style={{ fontWeight: '700', fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>Click to upload</span>
                      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>PDF, JPG, PNG (Max 10MB)</span>
                    </button>
                  )}
                </motion.div>
              )
            })}
          </div>

        {/* VIEW MODAL */}
        <AnimatePresence>
          {showViewModal && viewingDoc && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.95)',
                zIndex: 2000,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px'
              }}
            >
              <button 
                onClick={() => setShowViewModal(false)}
                style={{
                  position: 'absolute',
                  top: '24px',
                  right: '24px',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: 'white',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={24} />
              </button>

              <img 
                src={viewingDoc.data} 
                alt="Document View"
                style={{
                  maxWidth: '80vw',
                  maxHeight: '80vh',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                }}
              />

              <button 
                onClick={() => handleDownload(viewingDoc)}
                style={{
                  marginTop: '32px',
                  background: '#6c6fff',
                  color: 'white',
                  border: 'none',
                  padding: '12px 32px',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  boxShadow: '0 10px 20px rgba(108,111,255,0.3)'
                }}
              >
                <Download size={20} /> Download Document
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* DELETE CONFIRM MODAL */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.85)',
                zIndex: 2000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                  background: '#111111',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '24px',
                  padding: '32px',
                  width: '100%',
                  maxWidth: '400px',
                  textAlign: 'center'
                }}
              >
                <div style={{ 
                  width: '64px', 
                  height: '64px', 
                  borderRadius: '50%', 
                  background: 'rgba(248,113,113,0.1)', 
                  color: '#f87171',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px'
                }}>
                  <Trash2 size={32} />
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>Delete this document?</h2>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginBottom: '32px' }}>This action cannot be undone and will permanently remove the file.</p>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    onClick={() => {
                      setShowDeleteConfirm(false)
                      setDocToDelete(null)
                    }}
                    style={{
                      flex: 1,
                      background: 'rgba(255,255,255,0.05)',
                      border: 'none',
                      color: 'white',
                      padding: '14px',
                      borderRadius: '12px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleDelete}
                    style={{
                      flex: 1,
                      background: '#f87171',
                      border: 'none',
                      color: 'white',
                      padding: '14px',
                      borderRadius: '12px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TOAST NOTIFICATION */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 20, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: 20, x: '-50%' }}
              style={{
                position: 'fixed',
                bottom: '32px',
                left: '50%',
                background: toast.type === 'success' ? 'rgba(16,185,129,0.9)' : toast.type === 'error' ? 'rgba(239,68,68,0.9)' : 'rgba(59,130,246,0.9)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '100px',
                fontSize: '14px',
                fontWeight: '600',
                zIndex: 1000,
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {toast.type === 'success' ? <CheckCircle2 size={18} /> : toast.type === 'error' ? <Clock size={18} /> : <FileText size={18} />}
              {toast.message}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </ProtectedRoute>
  )
}

function dataURLtoBlob(dataURL: string) {
  const arr = dataURL.split(',')
  const mimeMatch = arr[0].match(/:(.*?);/)
  if (!mimeMatch) return new Blob()
  const mime = mimeMatch[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while(n--) u8arr[n] = bstr.charCodeAt(n)
  return new Blob([u8arr], { type: mime })
}
