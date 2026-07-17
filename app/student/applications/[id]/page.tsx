'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import ProtectedRoute from '@/components/ProtectedRoute'
import { 
  ChevronLeft, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  FileText, 
  CreditCard, 
  History,
  Building2,
  ExternalLink,
  Download,
  ShieldCheck,
  Calendar
} from 'lucide-react'
import { listenApplication } from '@/lib/firebase/applications'
import { listenUserDocuments } from '@/lib/firebase/student'
import { Application, UserDocument } from '@/types/firebase'
import { Card, Button, Badge, H2, H3, H4, Body, Small, Caption, MetricCard } from '@/components/ui/design-system'

export default function ApplicationDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [application, setApplication] = useState<Application | null>(null)
  const [documents, setDocuments] = useState<Record<string, UserDocument>>({})
  const [loading, setLoading] = useState(true)

  function normalizeStatus(status: string) {
    if (!status) return 'submitted'
    if (status === 'review') return 'under_review'
    if (status === 'accepted') return 'selected'
    if (status === 'reject') return 'rejected'
    return status
  }

  useEffect(() => {
    if (!id) return
    const unsub = listenApplication(id, (app) => {
      setApplication(app)
      if (app?.userId) {
        listenUserDocuments(app.userId, (docs) => {
          setDocuments(docs)
        })
      }
      setLoading(false)
    })
    return unsub
  }, [id])

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-[48px] h-[48px] border-4 border-primary border-t-transparent rounded-full" />
    </div>
  )

  if (!application) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-text-primary">
      <AlertCircle size={48} strokeWidth={1.8} className="text-danger mb-16" />
      <H2 className="mb-16">Application Dossier Not Found</H2>
      <Button onClick={() => router.back()} variant="secondary" className="flex items-center gap-8">
        <ChevronLeft size={18} strokeWidth={1.8} /> Return to Dashboard
      </Button>
    </div>
  )

  const statusConfig: any = {
    submitted: { color: 'primary', icon: Clock, label: 'Submitted' },
    under_review: { color: 'warning', icon: AlertCircle, label: 'Under Review' },
    selected: { color: 'success', icon: CheckCircle2, label: 'Accepted' },
    rejected: { color: 'danger', icon: XCircle, label: 'Rejected' }
  }
  const status = normalizeStatus(application.status)
  const config = statusConfig[status] || statusConfig.submitted

  const timeline = [
    { status: 'submitted', label: 'Application Received', date: application.appliedAt?.toDate?.().toLocaleDateString() || 'Recent', completed: true },
    { status: 'under_review', label: 'Internal Document Review', date: status !== 'submitted' ? 'In Progress' : null, completed: status !== 'submitted' },
    { status: 'selected', label: 'Admission Decision', date: ['selected', 'rejected'].includes(status) ? application.updatedAt?.toDate?.().toLocaleDateString() : null, completed: ['selected', 'rejected'].includes(status) },
    { status: 'final', label: 'Offer Letter Dispatched', date: null, completed: status === 'selected' && application.documentsVerified }
  ]

  const docTypes = [
    { id: '10th_marksheet', label: '10th Marksheet' },
    { id: '12th_marksheet', label: '12th Marksheet' },
    { id: 'id_proof', label: 'Identity Proof' },
    { id: 'passport_photo', label: 'Passport Photo' }
  ]

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="min-h-screen bg-background text-text-primary pb-64">
        
        {/* HEADER */}
        <div className="max-w-6xl mx-auto px-24 pt-48 mb-48">
          <button onClick={() => router.back()} className="group mb-32 flex items-center gap-8 text-text-secondary hover:text-text-primary transition-all">
            <div className="w-[40px] h-[40px] rounded-full bg-hover border border-border flex items-center justify-center group-hover:bg-primary/20 group-hover:border-primary/30">
              <ChevronLeft size={20} strokeWidth={1.8} />
            </div>
            <Caption className="font-bold uppercase tracking-widest">Back to Dossier</Caption>
          </button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-24">
            <div>
              <Caption className="text-primary font-bold uppercase tracking-[0.3em] mb-16">Application Reference: #{application.id.slice(0, 8)}</Caption>
              <H2 className="mb-8 tracking-tight">University Admission Dossier</H2>
              <div className="flex items-center gap-12 text-text-secondary text-sm font-bold">
                 <Building2 size={16} strokeWidth={1.8} /> {application.universityId}
                 <span>•</span>
                 <span className="text-primary">{application.programId}</span>
              </div>
            </div>
            <div className={`px-32 py-16 rounded-[24px] border flex items-center gap-12 ${config.color === 'primary' ? 'bg-primary/10 border-primary/20 text-primary' : config.color === 'success' ? 'bg-success/10 border-success/20 text-success' : 'bg-warning/10 border-warning/20 text-warning'}`}>
               <config.icon size={24} strokeWidth={1.8} />
               <span className="text-lg font-black uppercase tracking-widest">{config.label}</span>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="max-w-6xl mx-auto px-24 grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-48">
          
          <div className="space-y-48">
            {/* PROGRESS TIMELINE */}
            <Card className="!p-40 relative overflow-hidden shadow-sm">
               <div className="absolute top-0 right-0 w-[256px] h-[256px] bg-primary/5 blur-[100px]" />
               <Caption className="font-bold text-text-secondary uppercase tracking-[0.3em] mb-48 flex items-center gap-12">
                 <History size={16} strokeWidth={1.8} /> Journey Progression
               </Caption>

               <div className="relative space-y-48 pl-48">
                 <div className="absolute left-[23px] top-8 bottom-8 w-[1px] bg-border" />
                 {timeline.map((step, i) => {
                   const isCompleted = step.completed
                   return (
                     <motion.div 
                       key={i} 
                       initial={{ opacity: 0, x: -20 }}
                       animate={{ opacity: 1, x: 0 }}
                       transition={{ delay: i * 0.1 }}
                       className="relative"
                     >
                       <div className={`absolute -left-48 w-[48px] h-[48px] rounded-full border-4 border-background flex items-center justify-center z-10 ${isCompleted ? 'bg-primary text-white shadow-[0_0_20px_rgba(77,107,254,0.4)]' : 'bg-background border-border text-text-secondary'}`}>
                          {isCompleted ? <CheckCircle2 size={24} strokeWidth={1.8} /> : <div className="w-12 h-12 rounded-full bg-current" />}
                       </div>
                       <div>
                         <H4 className={`${isCompleted ? 'text-text-primary' : 'text-text-secondary'}`}>{step.label}</H4>
                         <Caption className="font-bold uppercase tracking-widest text-text-secondary mt-4">{step.date || 'Pending Evaluation'}</Caption>
                       </div>
                     </motion.div>
                   )
                 })}
               </div>
            </Card>

            {/* DIGITAL VAULT PREVIEW */}
            <div className="space-y-24">
              <Caption className="font-bold text-text-secondary uppercase tracking-[0.3em] flex items-center gap-12">
                <ShieldCheck size={16} strokeWidth={1.8} className="text-primary" /> Linked Digital Vault
              </Caption>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                {docTypes.map(docType => {
                  const doc = documents[docType.id]
                  return (
                    <div key={docType.id} className="bg-hover border border-border rounded-card p-20 flex items-center justify-between shadow-sm">
                       <div className="flex items-center gap-16">
                         <div className={`w-[40px] h-[40px] rounded-[12px] flex items-center justify-center ${doc ? 'bg-success/10 text-success' : 'bg-background border border-border text-text-secondary'}`}>
                           <FileText size={20} strokeWidth={1.8} />
                         </div>
                         <div>
                           <Caption className="font-bold uppercase tracking-widest">{docType.label}</Caption>
                           <div className={`text-[9px] font-bold uppercase mt-4 ${doc?.status === 'verified' ? 'text-success' : 'text-text-secondary'}`}>
                             {doc ? (doc.status === 'verified' ? 'Verified ✅' : 'Uploaded') : 'Not Uploaded'}
                           </div>
                         </div>
                       </div>
                       {doc && <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="w-[32px] h-[32px] rounded-lg bg-background border border-border flex items-center justify-center text-text-secondary hover:bg-hover hover:text-text-primary transition-all"><ExternalLink size={14} strokeWidth={1.8} /></a>}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* DOCUMENT & PAYMENT STATUS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-32">
               <Card className="!p-32 flex flex-col justify-between shadow-sm">
                  <div>
                    <Caption className="font-bold text-text-secondary uppercase tracking-[0.3em] mb-24 flex items-center gap-8">
                      <ShieldCheck size={16} strokeWidth={1.8} className="text-primary" /> Security Clearance
                    </Caption>
                    <div className="text-2xl font-black mb-8 text-text-primary">{application.documentsVerified ? 'Verified' : 'Pending'}</div>
                    <Small className="text-text-secondary leading-relaxed">System-wide verification of all academic credentials submitted for this application.</Small>
                  </div>
                  <div className="mt-32 pt-32 border-t border-border flex items-center justify-between">
                     <Caption className="font-bold uppercase tracking-widest text-text-secondary">Sync Status</Caption>
                     <Caption className="font-bold uppercase tracking-widest text-success">Live</Caption>
                  </div>
               </Card>

               <Card className="!p-32 flex flex-col justify-between shadow-sm">
                  <div>
                    <Caption className="font-bold text-text-secondary uppercase tracking-[0.3em] mb-24 flex items-center gap-8">
                      <CreditCard size={16} strokeWidth={1.8} className="text-primary" /> Financial Settlement
                    </Caption>
                    <div className={`text-2xl font-black mb-8 uppercase ${application.paymentStatus === 'paid' ? 'text-success' : 'text-warning'}`}>{application.paymentStatus}</div>
                    <Small className="text-text-secondary leading-relaxed">Processing of application and registration fees via encrypted gateway.</Small>
                  </div>
                  <div className="mt-32 pt-32 border-t border-border">
                     <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-all flex items-center gap-8">
                       View Invoice <ExternalLink size={12} strokeWidth={1.8} />
                     </button>
                  </div>
               </Card>
            </div>
          </div>

          {/* SIDEBAR METADATA */}
          <aside className="space-y-32">
            <div className="bg-primary rounded-card p-32 text-center shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-[128px] h-[128px] bg-white/10 rotate-45 translate-x-[64px] -translate-y-[64px] transition-transform group-hover:scale-110" />
               <Download size={40} strokeWidth={1.5} className="mx-auto mb-24 text-white" />
               <H4 className="mb-8 text-white">Admission Receipt</H4>
               <Caption className="text-white/60 font-bold uppercase tracking-widest mb-32">Official PDF Confirmation</Caption>
               <Button variant="secondary" className="w-full !bg-white !text-black !border-transparent hover:!bg-white/90 uppercase tracking-widest text-[10px]">
                 Download Dossier
               </Button>
            </div>

            <Card className="!p-32 space-y-32 shadow-sm">
               <div>
                 <Caption className="font-black text-text-secondary uppercase tracking-widest mb-16 flex items-center gap-8">
                   <Calendar size={14} strokeWidth={1.8} /> Dossier Creation
                 </Caption>
                 <Body className="font-bold">{application.appliedAt?.toDate?.().toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' }) || 'Recent'}</Body>
               </div>
               
               <div>
                 <Caption className="font-black text-text-secondary uppercase tracking-widest mb-16">Metadata ID</Caption>
                 <div className="text-[10px] font-mono text-text-secondary break-all">{application.id}</div>
               </div>

               <div className="pt-32 border-t border-border">
                 <Small className="font-bold text-text-secondary leading-relaxed italic">
                   &quot;This dossier represents a legally binding admission request submitted to {application.universityId} via the EDUING Gateway.&quot;
                 </Small>
               </div>
            </Card>
          </aside>
        </div>
      </div>
    </ProtectedRoute>
  )
}

function X({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  )
}
