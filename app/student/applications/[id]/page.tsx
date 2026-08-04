// app/student/applications/[id]/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import ProtectedRoute from '@/components/ProtectedRoute'
import {
  ChevronLeft, Clock, CheckCircle2, XCircle, AlertCircle,
  FileText, CreditCard, History, Building2, ExternalLink,
  Download, ShieldCheck, Calendar, X
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
    let unsubDocs: (() => void) | null = null

    const unsubApp = listenApplication(
      id,
      (app) => {
        setApplication(app)
        setLoading(false)
        // Clean up previous docs listener before starting new one
        if (unsubDocs) unsubDocs()
        if (app?.userId) {
          unsubDocs = listenUserDocuments(app.userId, (docs) => setDocuments(docs))
        }
      },
      (err) => {
        if (process.env.NODE_ENV === 'development') console.error('[listenApplication]', err)
        setLoading(false)
      }
    )

    return () => {
      unsubApp()
      if (unsubDocs) unsubDocs()
    }
  }, [id])

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%' }}
      />
    </div>
  )

  if (!application) return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <AlertCircle size={48} strokeWidth={1.5} style={{ color: 'var(--red)' }} />
      <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Application not found</h2>
      <button
        onClick={() => router.back()}
        style={{ display: 'flex', alignItems: 'center', gap: 6, height: 36, padding: '0 14px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 13, fontWeight: 500, borderRadius: 8, cursor: 'pointer' }}
      >
        <ChevronLeft size={15} /> Go Back
      </button>
    </div>
  )

  const statusConfig: Record<string, { color: string; icon: React.ElementType; label: string }> = {
    submitted: { color: 'var(--accent)', icon: Clock, label: 'Submitted' },
    under_review: { color: 'var(--gold)', icon: AlertCircle, label: 'Under Review' },
    selected: { color: 'var(--green)', icon: CheckCircle2, label: 'Accepted' },
    rejected: { color: 'var(--red)', icon: XCircle, label: 'Rejected' },
  }
  const status = normalizeStatus(application.status)
  const config = statusConfig[status] || statusConfig.submitted
  const StatusIcon = config.icon

  const docTypes = [
    { id: '10th_marksheet', label: '10th Marksheet' },
    { id: '12th_marksheet', label: '12th Marksheet' },
    { id: 'id_proof', label: 'Identity Proof' },
    { id: 'passport_photo', label: 'Passport Photo' },
  ]

  const appliedDate = application.appliedAt?.toDate?.()
  const updatedDate = application.updatedAt?.toDate?.()

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 16px 64px', fontFamily: 'Inter, system-ui, sans-serif', color: 'var(--text-primary)' }}>

        {/* Back */}
        <button
          onClick={() => router.back()}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 24, padding: 0 }}
        >
          <ChevronLeft size={16} /> Back to Applications
        </button>

        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
            Reference #{application.id.slice(0, 8)}
          </p>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.5px', margin: '0 0 6px' }}>
                Application Details
              </h1>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>
                <Building2 size={13} style={{ verticalAlign: 'middle', marginRight: 6 }} strokeWidth={1.8} />
                {application.universityName || application.universityId}
                {' · '}
                <span style={{ color: 'var(--accent)' }}>{application.programName || application.programId}</span>
              </p>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 16px', borderRadius: 10,
              border: `1px solid ${config.color}22`,
              background: `${config.color}10`,
              color: config.color,
            }}>
              <StatusIcon size={18} strokeWidth={1.8} />
              <span style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{config.label}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Timeline */}
            <section style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '24px' }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <History size={14} strokeWidth={1.8} /> Application Journey
              </p>
              <div style={{ position: 'relative', paddingLeft: 24, borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 20 }}>
                {[
                  { label: 'Application Submitted', date: appliedDate?.toLocaleDateString('en-IN') ?? 'Recent', done: true },
                  { label: 'Document Review', date: status !== 'submitted' ? 'In Progress' : null, done: status !== 'submitted', active: status === 'under_review' },
                  { label: 'Admission Decision', date: ['selected', 'rejected'].includes(status) ? updatedDate?.toLocaleDateString('en-IN') ?? null : null, done: ['selected', 'rejected'].includes(status) },
                  { label: 'Offer Letter', date: null, done: status === 'selected' && !!application.documentsVerified },
                ].map(({ label, date, done, active }, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} style={{ position: 'relative' }}>
                    <div style={{
                      position: 'absolute', left: -31, top: 2,
                      width: 14, height: 14, borderRadius: '50%',
                      border: `2px solid ${done ? 'var(--green)' : active ? 'var(--accent)' : 'var(--border)'}`,
                      background: done ? 'var(--green)' : 'var(--bg-elevated)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {done && <CheckCircle2 size={8} style={{ color: '#fff' }} strokeWidth={3} />}
                    </div>
                    <p style={{ fontSize: 14, fontWeight: done || active ? 600 : 400, color: done || active ? 'var(--text-primary)' : 'var(--text-muted)', margin: 0 }}>{label}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>{date ?? 'Pending'}</p>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Documents */}
            <section style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '24px' }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck size={14} strokeWidth={1.8} style={{ color: 'var(--accent)' }} /> Linked Documents
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {docTypes.map(dt => {
                  const doc = documents[dt.id]
                  return (
                    <div key={dt.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: doc ? 'rgba(26,174,57,0.08)' : 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FileText size={15} style={{ color: doc ? 'var(--green)' : 'var(--text-muted)' }} strokeWidth={1.8} />
                        </div>
                        <div>
                          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{dt.label}</p>
                          <p style={{ fontSize: 10, fontWeight: 600, color: doc?.status === 'verified' ? 'var(--green)' : doc ? 'var(--gold)' : 'var(--text-muted)', margin: '2px 0 0', textTransform: 'uppercase' }}>
                            {doc ? doc.status : 'Not uploaded'}
                          </p>
                        </div>
                      </div>
                      {doc?.fileUrl && (
                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-muted)' }}>
                          <ExternalLink size={12} strokeWidth={1.8} />
                        </a>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Payment + Docs status */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                {
                  icon: ShieldCheck,
                  label: 'Documents',
                  value: application.documentsVerified ? 'Verified' : 'Pending',
                  color: application.documentsVerified ? 'var(--green)' : 'var(--gold)',
                },
                {
                  icon: CreditCard,
                  label: 'Payment',
                  value: application.paymentStatus ?? 'Pending',
                  color: application.paymentStatus === 'paid' ? 'var(--green)' : 'var(--gold)',
                },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px' }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Icon size={13} strokeWidth={1.8} style={{ color: 'var(--accent)' }} /> {label}
                  </p>
                  <p style={{ fontSize: 20, fontWeight: 700, color, margin: '0 0 4px', textTransform: 'capitalize' }}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Calendar size={12} strokeWidth={1.8} /> Applied On
                </p>
                <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>
                  {appliedDate?.toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' }) ?? 'Recent'}
                </p>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 6px' }}>Application ID</p>
                <p style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-secondary)', margin: 0, wordBreak: 'break-all' }}>{application.id}</p>
              </div>
            </div>

            <button
              onClick={() => router.push('/student/applications')}
              style={{ width: '100%', height: 36, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <ChevronLeft size={14} /> Back to All Applications
            </button>
          </aside>
        </div>
      </div>
    </ProtectedRoute>
  )
}