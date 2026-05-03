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
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full" />
    </div>
  )

  if (!application) return (
    <div className="min-h-screen bg-[#0A0A0F] flex flex-col items-center justify-center text-white">
      <AlertCircle size={48} className="text-red-500 mb-4" />
      <h2 className="text-2xl font-black mb-4">Application Dossier Not Found</h2>
      <button onClick={() => router.back()} className="text-indigo-400 font-bold uppercase tracking-widest text-sm flex items-center gap-2">
        <ChevronLeft size={18} /> Return to Dashboard
      </button>
    </div>
  )

  const statusConfig: any = {
    submitted: { color: 'indigo', icon: Clock, label: 'Submitted' },
    under_review: { color: 'amber', icon: AlertCircle, label: 'Under Review' },
    selected: { color: 'green', icon: CheckCircle2, label: 'Accepted' },
    rejected: { color: 'red', icon: XCircle, label: 'Rejected' }
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
      <div className="min-h-screen bg-[#0A0A0F] text-white selection:bg-indigo-500/30 font-sans pb-20">
        
        {/* HEADER */}
        <div className="max-w-6xl mx-auto px-6 pt-12 mb-12">
          <button onClick={() => router.back()} className="group mb-8 flex items-center gap-2 text-white/40 hover:text-white transition-all">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-indigo-500/20 group-hover:border-indigo-500/30">
              <ChevronLeft size={20} />
            </div>
            <span className="text-xs font-black uppercase tracking-widest">Back to Dossier</span>
          </button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <div className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Application Reference: #{application.id.slice(0, 8)}</div>
              <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tight">University Admission Dossier</h1>
              <div className="flex items-center gap-3 text-white/30 text-sm font-bold">
                 <Building2 size={16} /> {application.universityId}
                 <span>•</span>
                 <span className="text-indigo-400">{application.programId}</span>
              </div>
            </div>
            <div className={`px-8 py-4 rounded-3xl border flex items-center gap-3 ${config.color === 'indigo' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : config.color === 'green' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'}`}>
               <config.icon size={24} />
               <span className="text-lg font-black uppercase tracking-widest">{config.label}</span>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-12">
          
          <div className="space-y-12">
            {/* PROGRESS TIMELINE */}
            <section className="bg-[#111114] border border-white/5 rounded-[40px] p-10 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[100px]" />
               <h3 className="text-xs font-black text-white/20 uppercase tracking-[0.3em] mb-12 flex items-center gap-3">
                 <History size={16} /> Journey Progression
               </h3>

               <div className="relative space-y-12 pl-12">
                 <div className="absolute left-[23px] top-2 bottom-2 w-[1px] bg-white/5" />
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
                       <div className={`absolute -left-12 w-12 h-12 rounded-full border-4 border-[#111114] flex items-center justify-center z-10 ${isCompleted ? 'bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]' : 'bg-[#111114] border-white/10 text-white/20'}`}>
                          {isCompleted ? <CheckCircle2 size={24} /> : <div className="w-3 h-3 rounded-full bg-current" />}
                       </div>
                       <div>
                         <div className={`text-xl font-black ${isCompleted ? 'text-white' : 'text-white/20'}`}>{step.label}</div>
                         <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mt-1">{step.date || 'Pending Evaluation'}</div>
                       </div>
                     </motion.div>
                   )
                 })}
               </div>
            </section>

            {/* DIGITAL VAULT PREVIEW */}
            <section className="space-y-6">
              <h3 className="text-xs font-black text-white/20 uppercase tracking-[0.3em] flex items-center gap-3">
                <ShieldCheck size={16} className="text-indigo-400" /> Linked Digital Vault
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {docTypes.map(docType => {
                  const doc = documents[docType.id]
                  return (
                    <div key={docType.id} className="bg-white/5 border border-white/5 rounded-2xl p-5 flex items-center justify-between">
                       <div className="flex items-center gap-4">
                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${doc ? 'bg-green-500/10 text-green-500' : 'bg-white/5 text-white/10'}`}>
                           <FileText size={20} />
                         </div>
                         <div>
                           <div className="text-xs font-black uppercase tracking-widest">{docType.label}</div>
                           <div className={`text-[9px] font-bold uppercase mt-1 ${doc?.status === 'verified' ? 'text-green-500' : 'text-white/20'}`}>
                             {doc ? (doc.status === 'verified' ? 'Verified ✅' : 'Uploaded') : 'Not Uploaded'}
                           </div>
                         </div>
                       </div>
                       {doc && <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:bg-white/10 transition-all"><ExternalLink size={14} /></a>}
                    </div>
                  )
                })}
              </div>
            </section>

            {/* DOCUMENT & PAYMENT STATUS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-[#111114] border border-white/5 rounded-3xl p-8 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-black text-white/20 uppercase trackingwidest mb-6 flex items-center gap-2">
                      <ShieldCheck size={16} className="text-indigo-400" /> Security Clearance
                    </h4>
                    <div className="text-2xl font-black mb-2">{application.documentsVerified ? 'Verified' : 'Pending'}</div>
                    <p className="text-white/30 text-xs leading-relaxed">System-wide verification of all academic credentials submitted for this application.</p>
                  </div>
                  <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                     <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Sync Status</span>
                     <span className="text-[10px] font-black uppercase tracking-widest text-green-500">Live</span>
                  </div>
               </div>

               <div className="bg-[#111114] border border-white/5 rounded-3xl p-8 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-black text-white/20 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <CreditCard size={16} className="text-indigo-400" /> Financial Settlement
                    </h4>
                    <div className={`text-2xl font-black mb-2 uppercase ${application.paymentStatus === 'paid' ? 'text-green-500' : 'text-amber-500'}`}>{application.paymentStatus}</div>
                    <p className="text-white/30 text-xs leading-relaxed">Processing of application and registration fees via encrypted gateway.</p>
                  </div>
                  <div className="mt-8 pt-8 border-t border-white/5">
                     <button className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-white transition-all flex items-center gap-2">
                       View Invoice <ExternalLink size={12} />
                     </button>
                  </div>
               </div>
            </div>
          </div>

          {/* SIDEBAR METADATA */}
          <aside className="space-y-8">
            <div className="bg-indigo-600 rounded-3xl p-8 text-center shadow-2xl shadow-indigo-600/20 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rotate-45 translate-x-16 -translate-y-16 transition-transform group-hover:scale-110" />
               <Download size={40} className="mx-auto mb-6 text-white" />
               <h4 className="text-lg font-black mb-2">Admission Receipt</h4>
               <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-8">Official PDF Confirmation</p>
               <button className="w-full bg-white text-[#0A0A0F] py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-50 transition-all">
                 Download Dossier
               </button>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-8">
               <div>
                 <div className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <Calendar size={14} /> Dossier Creation
                 </div>
                 <div className="text-sm font-bold">{application.appliedAt?.toDate?.().toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' }) || 'Recent'}</div>
               </div>
               
               <div>
                 <div className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-4">Metadata ID</div>
                 <div className="text-[10px] font-mono text-white/40 break-all">{application.id}</div>
               </div>

               <div className="pt-8 border-t border-white/5">
                 <p className="text-[10px] font-bold text-white/20 leading-relaxed italic">
                   "This dossier represents a legally binding admission request submitted to {application.universityId} via the EDUING Gateway."
                 </p>
               </div>
            </div>
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
