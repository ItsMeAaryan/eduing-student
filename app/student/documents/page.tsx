'use client'
import { auth } from '@/lib/firebase/config'
import { uploadUserDocument } from '@/lib/firebase/student'
import { useStudentData } from '@/components/providers/StudentDataProvider'
import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Upload, FileText, CheckCircle2, Clock, XCircle, AlertTriangle,
  Sparkles, Eye, Download, Trash2, X, FolderOpen, Mic, MoreHorizontal,
  ShieldCheck, Zap, ChevronRight, Bot, ArrowRight, RefreshCw, FileCheck,
  Check, Filter, AlertCircle, Info, Shield, Scale, Plus
} from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import SegmentedTabs from '@/components/ui/SegmentedTabs'
import DocPreviewPanel from '@/components/documents/DocPreviewPanel'
import { EmptyState } from '@/components/ui/EmptyState'

/* =========================================================================
   STYLING CONSTANTS (STRICTLY FROM DESIGN.md)
   ========================================================================= */
const CARD_STYLE = "bg-card border border-border rounded-[12px] p-[20px] md:p-[24px] shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all duration-200"
const BUTTON_PRIMARY = "bg-primary hover:bg-primary/90 text-white font-medium px-[16px] h-[36px] rounded-[8px] text-[13px] inline-flex items-center gap-[6px] transition-all active:scale-[0.98] shadow-sm cursor-pointer select-none"
const BUTTON_SECONDARY = "bg-card hover:bg-muted text-foreground border border-border font-medium px-[14px] h-[36px] rounded-[8px] text-[13px] inline-flex items-center gap-[6px] transition-all active:scale-[0.98] cursor-pointer select-none"
const BUTTON_UTILITY = "bg-card hover:bg-muted text-muted-foreground border border-border font-medium px-[12px] h-[30px] rounded-[8px] text-[12px] inline-flex items-center gap-[4px] transition-colors cursor-pointer"

const STICKER_TEAL = "bg-[#2a9d99]/10 text-[#1e6b68] border border-[#2a9d99]/20"
const STICKER_PURPLE = "bg-[#d6b6f6]/20 text-[#391c57] border border-[#d6b6f6]/40"
const STICKER_ORANGE = "bg-[#dd5b00]/10 text-[#dd5b00] border border-[#dd5b00]/20"
const STICKER_GREEN = "bg-success/10 text-success border border-success/20"
const STICKER_SKY = "bg-[#62aef0]/15 text-primary border border-[#62aef0]/30"

/* =========================================================================
   TYPES & DATA
   ========================================================================= */
type DocStatus = 'verified' | 'pending' | 'rejected' | 'missing'

interface Doc {
  id: string
  name: string
  category: string
  status: DocStatus
  date: string
  size: string
  aiScore: number
  apps: number
  required: boolean
}

const INITIAL_DOCS: Doc[] = [
  { id: 'd1', name: '10th_Marksheet.pdf', category: 'Academic', status: 'verified', date: '20 May 2024', size: '2.4 MB', aiScore: 98, apps: 6, required: true },
  { id: 'd2', name: '12th_Marksheet.pdf', category: 'Academic', status: 'pending', date: '19 May 2024', size: '2.1 MB', aiScore: 87, apps: 5, required: true },
  { id: 'd3', name: 'Aadhaar_Card.jpg', category: 'Identity', status: 'verified', date: '18 May 2024', size: '0.8 MB', aiScore: 99, apps: 8, required: true },
  { id: 'd4', name: 'JEE_Main_Scorecard.pdf', category: 'Entrance Exams', status: 'verified', date: '17 May 2024', size: '1.2 MB', aiScore: 95, apps: 4, required: true },
  { id: 'd5', name: 'Caste_Certificate.jpg', category: 'Certificates', status: 'pending', date: '16 May 2024', size: '0.6 MB', aiScore: 76, apps: 3, required: false },
  { id: 'd6', name: 'Income_Certificate.pdf', category: 'Certificates', status: 'rejected', date: '15 May 2024', size: '0.9 MB', aiScore: 42, apps: 2, required: false },
  { id: 'd7', name: 'Gap_Certificate.docx', category: 'Academic', status: 'verified', date: '14 May 2024', size: '0.3 MB', aiScore: 91, apps: 2, required: false },
  { id: 'd8', name: 'Passport_Copy.pdf', category: 'Identity', status: 'missing', date: '—', size: '—', aiScore: 0, apps: 0, required: true },
  { id: 'd9', name: 'PAN_Card.jpg', category: 'Identity', status: 'missing', date: '—', size: '—', aiScore: 0, apps: 0, required: false },
  { id: 'd10', name: 'Domicile_Certificate.pdf', category: 'Certificates', status: 'verified', date: '12 May 2024', size: '0.5 MB', aiScore: 93, apps: 1, required: false },
]

const CATEGORY_FOLDERS = [
  { name: 'Academic', count: 4, verified: 3, missing: 0, icon: '📚', tagColor: STICKER_PURPLE },
  { name: 'Identity', count: 3, verified: 1, missing: 2, icon: '🪪', tagColor: STICKER_SKY },
  { name: 'Entrance Exams', count: 2, verified: 2, missing: 0, icon: '📝', tagColor: STICKER_TEAL },
  { name: 'Certificates', count: 3, verified: 1, missing: 0, icon: '🏆', tagColor: STICKER_GREEN },
  { name: 'Portfolio', count: 0, verified: 0, missing: 0, icon: '🎨', tagColor: STICKER_ORANGE },
]

const VERIFICATION_FLOW = [
  { step: '1. File Uploaded', desc: 'Secure cloud vault storage', status: 'completed' },
  { step: '2. OCR Data Extraction', desc: 'Parsing marks & candidate info', status: 'completed' },
  { step: '3. AI Authenticity Scan', desc: 'Blur & forgery detection', status: 'completed' },
  { step: '4. Counselor Verification', desc: 'Manual review by admissions team', status: 'active' },
  { step: '5. University Dispatch', desc: 'Ready for 17 target universities', status: 'pending' },
]

/* =========================================================================
   SECTION 1: DOCUMENT HEALTH OVERVIEW CARD
   ========================================================================= */
function DocumentHealthOverview({ verified, pending, missing, total, onUploadClick }: { verified: number; pending: number; missing: number; total: number; onUploadClick: () => void }) {
  const readiness = total ? Math.round((verified / total) * 100) : 0

  return (
    <div className={CARD_STYLE}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-[20px]">
        {/* Left Info & Circle Gauge */}
        <div className="flex items-center gap-[20px]">
          {/* Circular SVG Gauge */}
          <div className="relative w-[96px] h-[96px] flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="48" cy="48" r="40" stroke="#F3F4F6" strokeWidth="8" fill="transparent" />
              <circle
                cx="48" cy="48" r="40" stroke="#0075de" strokeWidth="8" fill="transparent"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * readiness) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-[22px] font-bold text-foreground leading-none">{readiness}%</span>
              <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mt-[2px]">Ready</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-[8px] mb-[4px]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Document Vault Health</span>
              <span className="text-[10px] font-semibold px-[8px] py-[2px] rounded-full bg-success/10 text-success">
                +17 Universities Unlocked
              </span>
            </div>
            <h1 className="text-[20px] font-bold text-foreground tracking-tight">
              Your profile is {readiness}% document ready.
            </h1>
            <p className="text-[13px] text-muted-foreground mt-[2px] max-w-[480px]">
              Upload your <strong className="text-foreground">Passport Copy</strong> and <strong className="text-foreground">12th Marksheet</strong> to achieve 100% verification and speed up university admission decisions.
            </p>
          </div>
        </div>

        {/* Right Stats Breakdown & Primary CTA */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-[16px] shrink-0 border-t lg:border-t-0 lg:border-l border-border pt-[16px] lg:pt-0 lg:pl-[24px]">
          <div className="grid grid-cols-3 gap-[16px] text-center">
            <div className="bg-muted border border-border p-[10px] rounded-[10px] min-w-[80px]">
              <p className="text-[18px] font-extrabold text-success leading-none">{verified}</p>
              <p className="text-[10px] font-semibold text-muted-foreground mt-[2px]">Verified</p>
            </div>
            <div className="bg-muted border border-border p-[10px] rounded-[10px] min-w-[80px]">
              <p className="text-[18px] font-extrabold text-[#dd5b00] leading-none">{pending}</p>
              <p className="text-[10px] font-semibold text-muted-foreground mt-[2px]">Pending</p>
            </div>
            <div className="bg-muted border border-border p-[10px] rounded-[10px] min-w-[80px]">
              <p className="text-[18px] font-extrabold text-destructive leading-none">{missing}</p>
              <p className="text-[10px] font-semibold text-muted-foreground mt-[2px]">Missing</p>
            </div>
          </div>

          <button onClick={onUploadClick} className={BUTTON_PRIMARY + " h-[42px] px-[20px]"}>
            <Upload size={16} />
            Upload Required Files
          </button>
        </div>
      </div>
    </div>
  )
}

/* =========================================================================
   SECTION 2: ACTION CENTER
   ========================================================================= */
function DocumentActionCenter({ onUploadClick }: { onUploadClick: () => void }) {
  const actions = [
    { title: 'Upload Official Passport Copy', category: 'Identity Proof', due: 'Required for International Apps', priority: 'Urgent', tagColor: STICKER_ORANGE, icon: AlertTriangle },
    { title: 'Re-upload 12th Marksheet', category: 'Academic', due: 'Blur detected on OCR scan', priority: 'High', tagColor: STICKER_PURPLE, icon: RefreshCw },
    { title: 'Income Certificate Verification Pending', category: 'Certificates', due: 'Under manual review', priority: 'Medium', tagColor: STICKER_SKY, icon: Clock },
  ]

  return (
    <div className={CARD_STYLE}>
      <div className="flex items-center justify-between pb-[14px] mb-[14px] border-b border-border">
        <div className="flex items-center gap-[8px]">
          <AlertCircle size={18} className="text-[#dd5b00]" />
          <h2 className="text-[16px] font-bold text-foreground tracking-tight">Required Actions</h2>
        </div>
        <span className="text-[11px] font-bold px-[8px] py-[2px] rounded-full bg-[#dd5b00]/10 text-[#dd5b00]">
          3 Actions Pending
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-[12px]">
        {actions.map((act, i) => {
          const IconComp = act.icon
          return (
            <div key={i} className="p-[14px] bg-card border border-border rounded-[10px] flex flex-col justify-between gap-[12px] hover:border-primary/30 transition-all">
              <div>
                <div className="flex items-center justify-between mb-[6px]">
                  <span className={`text-[10px] font-bold px-[8px] py-[2px] rounded-full ${act.tagColor}`}>
                    {act.priority}
                  </span>
                  <span className="text-[11px] font-semibold text-muted-foreground">{act.category}</span>
                </div>
                <h3 className="text-[13.5px] font-bold text-foreground leading-snug">{act.title}</h3>
                <p className="text-[11px] text-muted-foreground mt-[2px]">{act.due}</p>
              </div>

              <button onClick={onUploadClick} className={BUTTON_UTILITY + " w-full justify-center text-[12px] h-[32px]"}>
                <IconComp size={13} />
                Fix Now
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* =========================================================================
   SECTION 3: PREMIUM UPLOAD EXPERIENCE WORKSPACE
   ========================================================================= */
// app/student/documents/page.tsx
// REPLACE the entire PremiumUploadWorkspace function

function PremiumUploadWorkspace({ onFileSelect }: { onFileSelect: (files: FileList) => void }) {
  const uploadInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true)
    else if (e.type === 'dragleave') setDragActive(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files)
    }
  }, [])

  const handleUpload = async (files: FileList) => {
    setUploading(true)
    setProgress(20)
    // Simulate progress bar while real upload runs
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 85) { clearInterval(interval); return prev }
        return prev + 15
      })
    }, 300)
    try {
      await onFileSelect(files)
    } finally {
      clearInterval(interval)
      setProgress(100)
      setTimeout(() => { setUploading(false); setProgress(0) }, 600)
    }
  }

  return (
    <div className={CARD_STYLE}>
      <div className="flex items-center justify-between pb-[14px] mb-[16px] border-b border-border">
        <div>
          <h2 className="text-[16px] font-bold text-foreground tracking-tight">Upload Document Workspace</h2>
          <p className="text-[12px] text-muted-foreground">AI-driven OCR scanning & authenticity verification</p>
        </div>
        <div className="flex items-center gap-[6px]">
          <span className="text-[11px] font-bold bg-[#2a9d99]/10 text-[#1e6b68] px-[8px] py-[2px] rounded-full">
            AI Protection Active
          </span>
        </div>
      </div>

      <input
        ref={uploadInputRef}
        type="file"
        multiple
        accept=".pdf,.jpg,.jpeg,.png,.docx"
        className="hidden"
        onChange={e => e.target.files && handleUpload(e.target.files)}
      />

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') uploadInputRef.current?.click() }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => uploadInputRef.current?.click()}
        className={`border-2 border-dashed rounded-[12px] p-[28px] flex flex-col items-center justify-center text-center cursor-pointer transition-all ${dragActive
          ? 'border-primary bg-[#62aef0]/10 scale-[0.99]'
          : 'border-border bg-muted hover:border-primary hover:bg-primary/10/40'
          }`}
      >
        <motion.div
          whileHover={{ scale: 1.08 }}
          className="w-[52px] h-[52px] rounded-[14px] bg-primary/10 border border-border flex items-center justify-center text-primary mb-[12px] shadow-xs"
        >
          <Upload size={24} strokeWidth={2} />
        </motion.div>

        <h3 className="text-[15px] font-bold text-foreground">
          Drag & drop document files here or <span className="text-primary underline">browse</span>
        </h3>
        <p className="text-[12px] text-muted-foreground mt-[4px]">
          Supports PDF, JPG, PNG up to 10 MB.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-[8px] mt-[16px]">
          {['OCR Extraction', 'AI Authenticity Check', 'Duplicate Detection', 'Blur Scanner'].map(feat => (
            <span key={feat} className="text-[10px] font-semibold px-[8px] py-[2px] rounded-full bg-card border border-border text-foreground flex items-center gap-[4px]">
              <CheckCircle2 size={10} className="text-success" />
              {feat}
            </span>
          ))}
        </div>

        {uploading && (
          <div className="w-full max-w-[360px] mt-[16px] p-[10px] bg-card border border-border rounded-[8px]">
            <div className="flex items-center justify-between text-[11px] font-semibold mb-[4px]">
              <span className="text-foreground">Uploading document...</span>
              <span className="text-primary">{progress}%</span>
            </div>
            <div className="w-full h-[4px] bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all duration-300 rounded-full" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* =========================================================================
   SECTION 4: RECENT DOCUMENTS & FILE VAULT
   ========================================================================= */
function RecentDocumentsVault({ docs, onSelectDoc }: { docs: Doc[]; onSelectDoc: (d: Doc) => void }) {
  const [activeTab, setActiveTab] = useState('All')
  const [search, setSearch] = useState('')

  const TABS = ['All', 'Academic', 'Identity', 'Entrance Exams', 'Certificates']

  const filteredDocs = docs.filter(d => {
    const matchTab = activeTab === 'All' || d.category === activeTab
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  return (
    <div className={CARD_STYLE}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[12px] pb-[16px] border-b border-border">
        <div>
          <h2 className="text-[16px] font-bold text-foreground tracking-tight">Recent Documents & Vault</h2>
          <p className="text-[12px] text-muted-foreground">Manage, preview and replace your uploaded academic files</p>
        </div>

        <div className="flex items-center gap-[10px]">
          <div className="relative w-full sm:w-[220px]">
            <Search size={14} className="absolute left-[10px] top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search files..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-[32px] pl-[30px] pr-[10px] bg-muted border border-border rounded-[8px] text-[12.5px] focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="py-[12px]">
        <SegmentedTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />
      </div>

      {/* File Table */}
      <div className="overflow-x-auto border border-border rounded-[10px]">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-muted border-b border-border">
              {['Document Name', 'Category', 'Status', 'AI Score', 'Applications', 'Action'].map(h => (
                <th key={h} className="px-[16px] py-[10px] text-[10px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredDocs.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-[32px]">
                  <EmptyState
                    icon={FolderOpen}
                    title={search ? `No documents matching "${search}"` : "No documents found"}
                    description="Upload your academic certificates and identity proofs to power AI admission matching."
                    primaryCtaLabel="Upload Document"
                  />
                </td>
              </tr>
            ) : (
              filteredDocs.map(doc => (
                <tr
                  key={doc.id}
                  onClick={() => onSelectDoc(doc)}
                  className="border-b border-border hover:bg-muted cursor-pointer transition-colors group"
                >
                  <td className="px-[16px] py-[12px]">
                    <div className="flex items-center gap-[10px]">
                      <div className="w-[30px] h-[30px] rounded-[6px] bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <FileText size={14} />
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-foreground truncate max-w-[180px]">{doc.name}</p>
                        <p className="text-[10px] text-muted-foreground">{doc.size} • {doc.date}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-[16px] py-[12px]">
                    <span className="text-[12px] font-medium text-foreground">{doc.category}</span>
                  </td>

                  <td className="px-[16px] py-[12px]">
                    <span className={`text-[10px] font-bold px-[8px] py-[2px] rounded-full ${doc.status === 'verified' ? STICKER_GREEN : doc.status === 'pending' ? STICKER_ORANGE : doc.status === 'rejected' ? 'bg-destructive/10 text-destructive' : 'bg-[#f3f4f6] text-muted-foreground'
                      }`}>
                      {doc.status.toUpperCase()}
                    </span>
                  </td>

                  <td className="px-[16px] py-[12px]">
                    {doc.aiScore > 0 ? (
                      <div className="flex items-center gap-[6px]">
                        <div className="w-[40px] h-[4px] bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-success rounded-full" style={{ width: `${doc.aiScore}%` }} />
                        </div>
                        <span className="text-[11px] font-bold text-success">{doc.aiScore}%</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">—</span>
                    )}
                  </td>

                  <td className="px-[16px] py-[12px]">
                    <span className="text-[12px] text-muted-foreground">{doc.apps > 0 ? `${doc.apps} Linked` : '—'}</span>
                  </td>

                  <td className="px-[16px] py-[12px]" onClick={e => e.stopPropagation()}>
                    <button onClick={() => onSelectDoc(doc)} className={BUTTON_UTILITY}>
                      <Eye size={12} />
                      Preview
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* =========================================================================
   SECTION 5: DOCUMENT CATEGORY FOLDERS
   ========================================================================= */
function DocumentCategoryFolders() {
  return (
    <div className={CARD_STYLE}>
      <div className="flex items-center justify-between pb-[14px] mb-[16px] border-b border-border">
        <div>
          <h2 className="text-[16px] font-bold text-foreground tracking-tight">Document Library Categories</h2>
          <p className="text-[12px] text-muted-foreground">Organized category folders for instant verification checks</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-[12px]">
        {CATEGORY_FOLDERS.map((folder, i) => {
          const completion = folder.count > 0 ? Math.round((folder.verified / folder.count) * 100) : 0
          return (
            <div key={i} className="p-[14px] bg-card border border-border rounded-[10px] flex flex-col justify-between gap-[10px] hover:border-primary/30 hover:shadow-xs transition-all cursor-pointer">
              <div className="flex items-center justify-between">
                <span className="text-[24px]">{folder.icon}</span>
                <span className={`text-[10px] font-bold px-[6px] py-[1px] rounded-full ${folder.tagColor}`}>
                  {folder.count} Files
                </span>
              </div>

              <div>
                <h3 className="text-[13px] font-bold text-foreground leading-snug">{folder.name}</h3>
                <p className="text-[10px] text-muted-foreground mt-[2px]">{folder.verified} Verified</p>
              </div>

              <div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-[2px]">
                  <span>Progress</span>
                  <span className="font-semibold text-foreground">{completion}%</span>
                </div>
                <div className="w-full h-[4px] bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${completion}%` }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* =========================================================================
   SECTION 6: VERIFICATION TIMELINE & STATUS FLOW
   ========================================================================= */
function VerificationTimeline() {
  return (
    <div className={CARD_STYLE}>
      <div className="flex items-center justify-between pb-[14px] mb-[16px] border-b border-border">
        <div>
          <h2 className="text-[16px] font-bold text-foreground tracking-tight">Verification Status Pipeline</h2>
          <p className="text-[12px] text-muted-foreground">Real-time tracking of document authenticity verification</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-[12px] relative">
        {VERIFICATION_FLOW.map((flow, i) => (
          <div
            key={i}
            className={`p-[12px] rounded-[10px] border flex flex-col justify-between gap-[6px] ${flow.status === 'completed'
              ? 'bg-[#F0FDF4] border-success/30 text-success'
              : flow.status === 'active'
                ? 'bg-primary/10 border-primary/30 text-primary'
                : 'bg-muted border-border text-muted-foreground'
              }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider">Step 0{i + 1}</span>
              {flow.status === 'completed' && <CheckCircle2 size={14} />}
              {flow.status === 'active' && <Clock size={14} className="animate-spin" />}
            </div>
            <p className="text-[12px] font-bold text-foreground">{flow.step}</p>
            <p className="text-[10px] text-muted-foreground">{flow.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* =========================================================================
   SECTION 7: AI DOCUMENT ASSISTANT & INSIGHTS CARD
   ========================================================================= */
function AIDocumentAssistantCard({ onUploadClick }: { onUploadClick: () => void }) {
  return (
    <div className="bg-gradient-to-r from-[#EEF2FF] via-[#F5F3FF] to-[#FFF7ED] border border-border rounded-[12px] p-[20px] flex flex-col md:flex-row items-start md:items-center justify-between gap-[16px]">
      <div className="flex items-start gap-[14px]">
        <div className="w-[38px] h-[38px] rounded-[10px] bg-card border border-border flex items-center justify-center shrink-0 text-primary">
          <Sparkles size={20} strokeWidth={2} />
        </div>
        <div>
          <div className="flex items-center gap-[8px] mb-[2px]">
            <span className="text-[11px] font-bold text-primary uppercase tracking-wide">EDING AI Document Assistant</span>
            <span className="text-[10px] font-semibold bg-success/15 text-success px-[6px] py-[1px] rounded-full">+24% Admission Boost</span>
          </div>
          <p className="text-[13.5px] font-semibold text-foreground leading-snug">
            Uploading your LOR and Passport Copy will boost your profile score to 100% and enable instant dispatch to 17 top-ranked universities.
          </p>
        </div>
      </div>

      <button onClick={onUploadClick} className={BUTTON_PRIMARY + " shrink-0"}>
        Scan & Upload with AI
        <ArrowRight size={14} />
      </button>
    </div>
  )
}

/* =========================================================================
   MAIN DOCUMENTS PAGE COMPONENT
   ========================================================================= */
export default function DocumentsPage() {
  const { userDocuments } = useStudentData()
  const [localDocs, setLocalDocs] = useState<Doc[]>(INITIAL_DOCS)
  const [selectedDoc, setSelectedDoc] = useState<Doc | null>(null)
  const uploadTriggerRef = useRef<HTMLInputElement>(null)

  // Map filename to a known docId
  const inferDocId = (filename: string): '10th_marksheet' | '12th_marksheet' | 'id_proof' | 'passport_photo' => {
    const lower = filename.toLowerCase()
    if (lower.includes('10th') || lower.includes('tenth')) return '10th_marksheet'
    if (lower.includes('12th') || lower.includes('twelve')) return '12th_marksheet'
    if (lower.includes('passport') || lower.includes('photo')) return 'passport_photo'
    return 'id_proof'
  }

  const handleFileSelect = async (files: FileList) => {
    const uid = auth.currentUser?.uid
    if (!uid || !files[0]) return
    const file = files[0]
    const docId = inferDocId(file.name)
    try {
      await uploadUserDocument(uid, file, docId)
      // The Firestore listener in StudentDataProvider will update userDocuments automatically.
      // Also update local display state so the table reflects the upload immediately.
      const newDoc: Doc = {
        id: `d_${Date.now()}`,
        name: file.name,
        category: 'Academic',
        status: 'pending',
        date: 'Just Now',
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        aiScore: 0,
        apps: 0,
        required: false,
      }
      setLocalDocs(prev => [newDoc, ...prev])
    } catch (err: unknown) {
      if (process.env.NODE_ENV === 'development') console.error('[DocumentsPage] upload failed', err)
    }
  }

  const verified = localDocs.filter(d => d.status === 'verified').length
  const pending = localDocs.filter(d => d.status === 'pending').length
  const missing = localDocs.filter(d => d.status === 'missing').length
  const total = localDocs.length

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="flex flex-col gap-[24px] pb-[40px]">
        <input
          ref={uploadTriggerRef}
          type="file"
          className="hidden"
          multiple
          onChange={e => e.target.files && handleFileSelect(e.target.files)}
        />

        <DocumentHealthOverview
          verified={verified}
          pending={pending}
          missing={missing}
          total={total}
          onUploadClick={() => uploadTriggerRef.current?.click()}
        />

        <DocumentActionCenter onUploadClick={() => uploadTriggerRef.current?.click()} />

        <PremiumUploadWorkspace onFileSelect={handleFileSelect} />

        <RecentDocumentsVault docs={localDocs} onSelectDoc={setSelectedDoc} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[24px]">
          <DocumentCategoryFolders />
          <VerificationTimeline />
        </div>

        <AIDocumentAssistantCard onUploadClick={() => uploadTriggerRef.current?.click()} />

        <AnimatePresence>
          {selectedDoc && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/20 z-40"
                onClick={() => setSelectedDoc(null)}
              />
              <DocPreviewPanel doc={selectedDoc} onClose={() => setSelectedDoc(null)} />
            </>
          )}
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  )
}
