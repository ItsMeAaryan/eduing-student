'use client'
import React, { useState, useRef, useMemo } from 'react'
import {
  Search, Shield, GraduationCap, PenTool, Award, Briefcase, FileText,
  Upload, Trash2, CheckCircle2, ChevronDown, MoreHorizontal, SlidersHorizontal, Download, X, AlertCircle, Clock
} from 'lucide-react'
import { useStudentData } from '@/components/providers/StudentDataProvider'
import ProtectedRoute from '@/components/ProtectedRoute'
import { AnimatePresence, motion } from 'framer-motion'
import { uploadUserDocument, deleteUserDocument } from '@/lib/firebase/student'
import { useAuth } from '@/hooks/useAuth'
import SegmentedTabs from '@/components/ui/SegmentedTabs'


const CATEGORIES = [
  {
    id: 'personal',
    title: 'Identity',
    icon: Shield,
    documents: [
      { id: 'aadhaar_card', label: 'Aadhaar Card' },
      { id: 'passport', label: 'Passport' },
      { id: 'pan_card', label: 'PAN Card' },
      { id: 'passport_photo', label: 'Passport Photo' },
      { id: 'signature', label: 'Signature' },
    ]
  },
  {
    id: 'academic',
    title: 'Academic',
    icon: GraduationCap,
    documents: [
      { id: '10th_marksheet', label: '10th Marksheet' },
      { id: '12th_marksheet', label: '12th Marksheet' },
      { id: 'diploma', label: 'Diploma' },
      { id: 'graduation', label: 'Graduation' },
      { id: 'transfer_certificate', label: 'Transfer Certificate' },
      { id: 'migration_certificate', label: 'Migration Certificate' },
    ]
  },
  {
    id: 'entrance',
    title: 'Entrance Exams',
    icon: PenTool,
    documents: [
      { id: 'jee', label: 'JEE' },
      { id: 'neet', label: 'NEET' },
      { id: 'cuet', label: 'CUET' },
      { id: 'cat', label: 'CAT' },
      { id: 'gate', label: 'GATE' },
    ]
  },
  {
    id: 'certificates',
    title: 'Certificates',
    icon: Award,
    documents: [
      { id: 'income_certificate', label: 'Income Certificate' },
      { id: 'caste_certificate', label: 'Caste Certificate' },
      { id: 'domicile_certificate', label: 'Domicile Certificate' },
    ]
  },
  {
    id: 'portfolio',
    title: 'Portfolio',
    icon: Briefcase,
    documents: [
      { id: 'resume', label: 'Resume' },
      { id: 'sop', label: 'SOP' },
      { id: 'lor', label: 'LOR' },
    ]
  }
]

const REQUIRED_DOCS = ['10th_marksheet', '12th_marksheet', 'aadhaar_card', 'passport_photo']
const TABS = ['All', 'Identity', 'Academic', 'Entrance Exams', 'Certificates', 'Portfolio']

export default function AcademicLockerPage() {
  const { user } = useAuth()
  const { profile } = useStudentData()
  const uploadedDocs = profile?.documents || {}

  const [activeTab, setActiveTab] = useState('All')
  const [search, setSearch] = useState('')
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null)
  
  const [uploadingDocs, setUploadingDocs] = useState<Record<string, boolean>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadTargetId, setUploadTargetId] = useState<string | null>(null)

  const docValues = Object.values(uploadedDocs) as any[]
  const validDocs = docValues.filter(d => !!d?.fileUrl)
  const verifiedDocs = validDocs.filter(d => d.status === 'verified').length
  const pendingDocs = validDocs.filter(d => d.status === 'uploaded' || d.status === 'pending').length
  const missingRequired = REQUIRED_DOCS.filter(id => !uploadedDocs[id]?.fileUrl).length

  // Flatten documents list for table
  const allDocs = useMemo(() => {
    let list: any[] = []
    CATEGORIES.forEach(cat => {
      cat.documents.forEach(doc => {
        const uDoc = uploadedDocs[doc.id]
        list.push({
          ...doc,
          category: cat.title,
          categoryIcon: cat.icon,
          catId: cat.id,
          uploaded: !!uDoc?.fileUrl,
          status: uDoc?.status || 'missing',
          updatedAt: uDoc?.updatedAt,
          fileUrl: uDoc?.fileUrl,
          fileType: uDoc?.fileType,
          fileName: uDoc?.fileName,
          isRequired: REQUIRED_DOCS.includes(doc.id)
        })
      })
    })
    return list
  }, [uploadedDocs])

  const filteredDocs = useMemo(() => {
    return allDocs.filter(d => {
      const matchSearch = !search || d.label.toLowerCase().includes(search.toLowerCase())
      const matchTab = activeTab === 'All' || d.category === activeTab
      return matchSearch && matchTab
    })
  }, [allDocs, search, activeTab])

  const triggerUpload = (docId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setUploadTargetId(docId)
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user?.uid || !uploadTargetId) return

    setUploadingDocs(prev => ({ ...prev, [uploadTargetId]: true }))
    try {
      await uploadUserDocument(user.uid, file, uploadTargetId as Parameters<typeof uploadUserDocument>[2])
    } catch (error) {
      console.error("Upload error:", error)
      alert("Failed to upload document. Please try again.")
    } finally {
      setUploadingDocs(prev => ({ ...prev, [uploadTargetId]: false }))
      setUploadTargetId(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDelete = async (docId: string) => {
    if (!user?.uid || !confirm('Are you sure you want to delete this document?')) return
    setUploadingDocs(prev => ({ ...prev, [docId]: true }))
    try {
      await deleteUserDocument(user.uid, docId)
      setSelectedDoc(null)
    } catch (error) {
      console.error("Delete error:", error)
      alert("Failed to delete document.")
    } finally {
      setUploadingDocs(prev => ({ ...prev, [docId]: false }))
    }
  }

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="font-sans flex flex-col gap-[16px]">

        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileChange}
          accept=".pdf,.jpg,.jpeg,.png"
        />

        {/* ── SUB-NAV: category filter tabs only ────────── */}
        <SegmentedTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

        {/* ── STAT CARDS ────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-[16px]">
          {[
            { label: 'Total Uploaded', value: validDocs.length, sub: 'Out of ' + allDocs.length },
            { label: 'Verified',       value: verifiedDocs,     sub: 'Ready to use', color: '#059669' },
            { label: 'Under Review',   value: pendingDocs,      sub: 'Pending verification', color: '#D97706' },
            { label: 'Missing Required',value: missingRequired, sub: 'Needs action', color: missingRequired > 0 ? '#EF4444' : '#059669' },
          ].map((c, i) => (
            <div key={i} className="bg-white border border-[#E5E7EB] rounded-[12px] p-[20px]">
              <div className="flex items-start justify-between mb-[10px]">
                <span className="text-[14px] text-[#6B7280]">{c.label}</span>
                <MoreHorizontal size={16} strokeWidth={1.5} className="text-[#D1D5DB]" />
              </div>
              <div className="text-[28px] font-bold text-[#111827] leading-none mb-[6px]" style={{ color: c.color || '#111827' }}>{c.value}</div>
              <span className="text-[12px] text-[#9CA3AF]">{c.sub}</span>
            </div>
          ))}
        </div>

        {/* ── TABLE CARD ────────────────────────────────── */}
        <div className="bg-white border border-[#E5E7EB] rounded-[12px] overflow-hidden">
          <div className="flex items-center justify-between px-[20px] py-[14px] border-b border-[#E5E7EB]">
            <span className="text-[15px] font-semibold text-[#111827]">Document Vault</span>
            <div className="flex items-center gap-[8px]">
              <div className="relative">
                <Search size={13} className="absolute left-[10px] top-1/2 -translate-y-1/2 text-[#9CA3AF]" strokeWidth={1.8} />
                <input type="text" placeholder="Search documents"
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="w-[200px] h-[32px] pl-[28px] pr-[10px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-[8px] text-[13px] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#4F6BFF] transition-colors" />
              </div>
              <button className="flex items-center gap-[5px] px-[12px] h-[32px] rounded-[8px] border border-[#E5E7EB] text-[12px] font-medium text-[#374151] bg-white hover:bg-[#F3F4F6] transition-colors">
                <SlidersHorizontal size={12} strokeWidth={1.8} />Sort by<ChevronDown size={11} />
              </button>
              <MoreHorizontal size={16} strokeWidth={1.5} className="text-[#D1D5DB]" />
            </div>
          </div>

          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <th className="px-[20px] py-[12px] w-[40px]"><input type="checkbox" className="w-[14px] h-[14px] rounded-[3px]" /></th>
                {['Document','Category','Requirement','Status','Last Updated','Action'].map(h => (
                  <th key={h} className="px-[16px] py-[12px] text-[12px] font-semibold text-[#6B7280] uppercase tracking-[0.05em] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredDocs.length === 0 ? (
                <tr><td colSpan={7} className="py-[48px] text-center text-[14px] text-[#9CA3AF]">No documents found.</td></tr>
              ) : filteredDocs.map((doc: any, i: number) => {
                const Icon = doc.categoryIcon
                return (
                  <tr key={i} onClick={() => setSelectedDoc(doc)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => { if (e.key === 'Enter') setSelectedDoc(doc) }}
                    className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors group cursor-pointer">
                    <td className="px-[20px] py-[14px]" onClick={e => e.stopPropagation()}>
                      <input type="checkbox" className="w-[14px] h-[14px] rounded-[3px]" />
                    </td>
                    <td className="px-[16px] py-[14px]">
                      <div className="flex items-center gap-[12px]">
                        <div className={`w-[32px] h-[32px] rounded-full flex items-center justify-center shrink-0 border border-[#E5E7EB] ${doc.uploaded ? 'bg-[#EEF2FF]' : 'bg-[#F9FAFB]'}`}>
                          <Icon size={14} className={doc.uploaded ? 'text-[#4F6BFF]' : 'text-[#9CA3AF]'} strokeWidth={1.8} />
                        </div>
                        <div>
                          <span className="text-[14px] font-medium text-[#111827] truncate max-w-[180px] block">{doc.label}</span>
                          {doc.fileName && <span className="text-[11px] text-[#9CA3AF] truncate max-w-[150px] block">{doc.fileName}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-[16px] py-[14px]">
                      <span className="text-[13px] text-[#6B7280]">{doc.category}</span>
                    </td>
                    <td className="px-[16px] py-[14px]">
                      {doc.isRequired 
                        ? <span className="text-[12px] font-semibold text-[#EF4444] bg-[#FEE2E2] px-[8px] py-[2px] rounded-full">Required</span>
                        : <span className="text-[12px] font-medium text-[#6B7280] bg-[#F3F4F6] px-[8px] py-[2px] rounded-full">Optional</span>}
                    </td>
                    <td className="px-[16px] py-[14px]">
                      {doc.status === 'verified' && <span className="text-[13px] text-[#059669] flex items-center gap-[4px]"><CheckCircle2 size={14} strokeWidth={2}/>Verified</span>}
                      {doc.status === 'uploaded' && <span className="text-[13px] text-[#D97706] flex items-center gap-[4px]"><Clock size={14} strokeWidth={2}/>Pending</span>}
                      {doc.status === 'missing' && <span className="text-[13px] text-[#9CA3AF] flex items-center gap-[4px]"><AlertCircle size={14} strokeWidth={1.8}/>Missing</span>}
                    </td>
                    <td className="px-[16px] py-[14px]">
                      <span className="text-[13px] text-[#6B7280]">
                        {doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString() : '—'}
                      </span>
                    </td>
                    <td className="px-[16px] py-[14px]">
                      {uploadingDocs[doc.id] ? (
                        <div className="w-[14px] h-[14px] border-2 border-[#E5E7EB] border-t-[#4F6BFF] rounded-full animate-spin" />
                      ) : doc.uploaded ? (
                        <div className="flex items-center gap-[8px] opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="text-[#6B7280] hover:text-[#4F6BFF]" onClick={e => { e.stopPropagation(); window.open(doc.fileUrl) }}>
                            <Download size={14} strokeWidth={2} />
                          </button>
                          <button className="text-[#6B7280] hover:text-[#EF4444]" onClick={e => { e.stopPropagation(); handleDelete(doc.id) }}>
                            <Trash2 size={14} strokeWidth={2} />
                          </button>
                        </div>
                      ) : (
                        <button className="text-[12px] font-medium text-[#4F6BFF] hover:underline" onClick={e => triggerUpload(doc.id, e)}>
                          Upload
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* ── DRAWER ───────────────────────────────────── */}
        <AnimatePresence>
          {selectedDoc && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSelectedDoc(null)} className="fixed inset-0 bg-black/30 z-50" />
              <motion.div
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                className="fixed top-0 right-0 bottom-0 w-full max-w-[520px] bg-white border-l border-[#E5E7EB] z-50 flex flex-col shadow-xl overflow-y-auto"
              >
                <div className="sticky top-0 bg-white border-b border-[#E5E7EB] px-[24px] py-[20px] flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-[14px]">
                    <div className={`w-[44px] h-[44px] rounded-[10px] flex items-center justify-center border border-[#E5E7EB] ${selectedDoc.uploaded ? 'bg-[#EEF2FF] text-[#4F6BFF]' : 'bg-[#F9FAFB] text-[#9CA3AF]'}`}>
                      <selectedDoc.categoryIcon size={20} strokeWidth={1.8} />
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold text-[#111827]">{selectedDoc.label}</p>
                      <p className="text-[13px] text-[#9CA3AF]">{selectedDoc.category}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedDoc(null)} className="w-[32px] h-[32px] flex items-center justify-center rounded-[8px] border border-[#E5E7EB] text-[#9CA3AF] hover:bg-[#F3F4F6] transition-colors">
                    <X size={16} strokeWidth={1.8} />
                  </button>
                </div>
                <div className="flex-1 p-[24px] flex flex-col gap-[16px]">
                  
                  <div className="grid grid-cols-2 gap-[12px]">
                    {[
                      { label: 'Requirement', value: selectedDoc.isRequired ? 'Required' : 'Optional' },
                      { label: 'Status', value: selectedDoc.status === 'verified' ? 'Verified' : selectedDoc.status === 'uploaded' ? 'Pending Review' : 'Missing' },
                      { label: 'Last Updated', value: selectedDoc.updatedAt ? new Date(selectedDoc.updatedAt).toLocaleDateString() : 'N/A' },
                      { label: 'File Type', value: selectedDoc.fileType?.split('/')[1]?.toUpperCase() || 'N/A' },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-[8px] p-[14px]">
                        <p className="text-[11px] text-[#9CA3AF] uppercase tracking-[0.06em] mb-[4px]">{label}</p>
                        <p className="text-[14px] font-semibold text-[#111827]">{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white border border-[#E5E7EB] rounded-[12px] p-[20px] flex flex-col gap-[12px]">
                    <p className="text-[14px] font-semibold text-[#111827]">Guidelines</p>
                    <ul className="text-[13px] text-[#6B7280] flex flex-col gap-[8px] list-disc pl-[16px]">
                      <li>Ensure the document is clear and readable.</li>
                      <li>File size must be under 5MB.</li>
                      <li>Accepted formats: PDF, JPG, PNG.</li>
                      {selectedDoc.isRequired && <li className="text-[#EF4444]">This document is required for all university applications.</li>}
                    </ul>
                  </div>
                </div>
                
                <div className="sticky bottom-0 bg-white border-t border-[#E5E7EB] p-[20px] flex gap-[10px]">
                  {selectedDoc.uploaded ? (
                    <>
                      <button onClick={() => window.open(selectedDoc.fileUrl)} className="flex-1 h-[38px] bg-[#F9FAFB] border border-[#E5E7EB] text-[#111827] rounded-[8px] text-[13px] font-semibold flex items-center justify-center gap-[6px] hover:bg-[#F3F4F6] transition-colors">
                        <Download size={14} strokeWidth={2} /> Download
                      </button>
                      <button onClick={() => handleDelete(selectedDoc.id)} className="h-[38px] px-[16px] border border-[#EF4444]/20 bg-[#FEF2F2] text-[#EF4444] rounded-[8px] text-[13px] font-medium hover:bg-[#FEE2E2] transition-colors">Delete</button>
                    </>
                  ) : (
                    <button onClick={(e) => triggerUpload(selectedDoc.id, e as any)} className="flex-1 h-[38px] bg-[#4F6BFF] text-white rounded-[8px] text-[13px] font-semibold flex items-center justify-center gap-[6px] hover:bg-[#3D56E0] transition-colors">
                      <Upload size={14} strokeWidth={2} /> Upload Document
                    </button>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  )
}
