// app/student/onboarding/page.tsx
'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  User, GraduationCap, ClipboardList, FileUp, CheckCircle2,
  ArrowRight, ArrowLeft, AlertCircle
} from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase/config'
import { useToast } from '@/hooks/useToast'

const STEPS = [
  { id: 'personal', title: 'Personal', icon: User },
  { id: 'academic', title: 'Academic', icon: GraduationCap },
  { id: 'exams', title: 'Exams', icon: ClipboardList },
  { id: 'documents', title: 'Documents', icon: FileUp },
  { id: 'review', title: 'Review', icon: CheckCircle2 },
]

type FormData = {
  personal: { fullName: string; dob: string; gender: string; phone: string; state: string; city: string; address: string }
  academic: { school10: string; board10: string; marks10: string; year10: string; school12: string; board12: string; marks12: string; year12: string; stream: string }
  exams: { jeeMain: string; cuet: string; neet: string; bitSat: string }
  documents: { photo: boolean; marksheet10: boolean; marksheet12: boolean; idProof: boolean }
}

const INITIAL: FormData = {
  personal: { fullName: '', dob: '', gender: '', phone: '', state: '', city: '', address: '' },
  academic: { school10: '', board10: '', marks10: '', year10: '', school12: '', board12: '', marks12: '', year12: '', stream: '' },
  exams: { jeeMain: '', cuet: '', neet: '', bitSat: '' },
  documents: { photo: true, marksheet10: true, marksheet12: true, idProof: true },
}

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  padding: '9px 12px',
  fontSize: 14,
  color: 'var(--text-primary)',
  outline: 'none',
  transition: 'border-color 0.15s',
}

const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 500,
  color: 'var(--text-secondary)',
  marginBottom: 6,
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={LABEL_STYLE}>{label}</label>
      {children}
    </div>
  )
}

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormData>(INITIAL)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const router = useRouter()
  const { toast } = useToast()

  const update = <K extends keyof FormData>(section: K, fields: Partial<FormData[K]>) => {
    setForm(prev => ({ ...prev, [section]: { ...prev[section], ...fields } }))
  }

  const next = () => { if (step < STEPS.length - 1) setStep(s => s + 1) }
  const prev = () => { if (step > 0) setStep(s => s - 1) }

  const submit = async () => {
    const user = auth.currentUser
    if (!user) { router.push('/auth/login'); return }
    setSaving(true)
    setSaveError('')
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        ...form.personal,
        academic: form.academic,
        exams: form.exams,
        profileComplete: true,
        updatedAt: serverTimestamp(),
      })
      toast.success('Profile saved successfully!')
      router.push('/student/dashboard')
    } catch {
      setSaveError('Failed to save profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const progress = (step / (STEPS.length - 1)) * 100

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '48px 16px 64px',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}>

        {/* Logo mark */}
        <div style={{ marginBottom: 36, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, background: 'var(--text-primary)',
            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: 'var(--bg)', fontWeight: 800, fontSize: 16 }}>E</span>
          </div>
          <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>EDUING</span>
        </div>

        {/* Progress */}
        <div style={{ width: '100%', maxWidth: 560, marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            {STEPS.map((s, i) => {
              const StepIcon = s.icon
              const done = i < step
              const active = i === step
              return (
                <div key={s.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    border: `2px solid ${done || active ? 'var(--accent)' : 'var(--border)'}`,
                    background: done ? 'var(--accent)' : 'var(--bg-elevated)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}>
                    {done
                      ? <CheckCircle2 size={16} style={{ color: '#fff' }} strokeWidth={2.5} />
                      : <StepIcon size={16} style={{ color: active ? 'var(--accent)' : 'var(--text-muted)' }} strokeWidth={1.8} />
                    }
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em',
                    color: active ? 'var(--accent)' : done ? 'var(--text-secondary)' : 'var(--text-muted)',
                  }}>
                    {s.title}
                  </span>
                </div>
              )
            })}
          </div>
          <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
              style={{ height: '100%', background: 'var(--accent)', borderRadius: 2 }}
            />
          </div>
        </div>

        {/* Form card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
            style={{
              width: '100%', maxWidth: 560,
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: '28px 28px 24px',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <h2 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.25px', color: 'var(--text-primary)', marginBottom: 4 }}>
              {STEPS[step].title} Information
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
              Step {step + 1} of {STEPS.length}
            </p>

            {/* Step 1 — Personal */}
            {step === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Field label="Full Name">
                  <input
                    style={INPUT_STYLE}
                    value={form.personal.fullName}
                    onChange={e => update('personal', { fullName: e.target.value })}
                    placeholder="Your full legal name"
                    aria-label="Full Name"
                  />
                </Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <Field label="Date of Birth">
                    <input type="date" style={INPUT_STYLE} value={form.personal.dob}
                      onChange={e => update('personal', { dob: e.target.value })} aria-label="Date of Birth" />
                  </Field>
                  <Field label="Gender">
                    <select style={INPUT_STYLE} value={form.personal.gender}
                      onChange={e => update('personal', { gender: e.target.value })} aria-label="Gender">
                      <option value="">Select</option>
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </Field>
                </div>
                <Field label="Phone Number">
                  <input style={INPUT_STYLE} value={form.personal.phone}
                    onChange={e => update('personal', { phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    placeholder="10-digit mobile number" aria-label="Phone Number" />
                </Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <Field label="State">
                    <input style={INPUT_STYLE} value={form.personal.state}
                      onChange={e => update('personal', { state: e.target.value })} placeholder="e.g. Karnataka" aria-label="State" />
                  </Field>
                  <Field label="City">
                    <input style={INPUT_STYLE} value={form.personal.city}
                      onChange={e => update('personal', { city: e.target.value })} placeholder="e.g. Bengaluru" aria-label="City" />
                  </Field>
                </div>
              </div>
            )}

            {/* Step 2 — Academic */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* 10th */}
                <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                    10th Standard
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <Field label="Board">
                      <select style={INPUT_STYLE} value={form.academic.board10}
                        onChange={e => update('academic', { board10: e.target.value })} aria-label="10th Board">
                        <option value="">Select</option>
                        <option>CBSE</option><option>ICSE</option><option>State Board</option><option>Other</option>
                      </select>
                    </Field>
                    <Field label="Percentage">
                      <input style={INPUT_STYLE} type="number" value={form.academic.marks10}
                        onChange={e => update('academic', { marks10: e.target.value })} placeholder="e.g. 92.5" aria-label="10th Percentage" />
                    </Field>
                  </div>
                </div>
                {/* 12th */}
                <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                    12th Standard
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <Field label="Board">
                      <select style={INPUT_STYLE} value={form.academic.board12}
                        onChange={e => update('academic', { board12: e.target.value })} aria-label="12th Board">
                        <option value="">Select</option>
                        <option>CBSE</option><option>ICSE</option><option>State Board</option><option>Other</option>
                      </select>
                    </Field>
                    <Field label="Percentage">
                      <input style={INPUT_STYLE} type="number" value={form.academic.marks12}
                        onChange={e => update('academic', { marks12: e.target.value })} placeholder="e.g. 88.0" aria-label="12th Percentage" />
                    </Field>
                    <Field label="Stream">
                      <select style={INPUT_STYLE} value={form.academic.stream}
                        onChange={e => update('academic', { stream: e.target.value })} aria-label="Stream">
                        <option value="">Select</option>
                        <option>Science</option><option>Commerce</option><option>Arts</option><option>Diploma</option>
                      </select>
                    </Field>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 — Exams */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 4px' }}>
                  Enter your scores for any entrance exams you have appeared for.
                </p>
                {(['jeeMain', 'cuet', 'neet', 'bitSat'] as const).map(key => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg)' }}>
                    <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <input
                      style={{ ...INPUT_STYLE, width: 120, textAlign: 'right' }}
                      placeholder="Score / Rank"
                      value={form.exams[key]}
                      onChange={e => update('exams', { [key]: e.target.value })}
                      aria-label={`${key} score`}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Step 4 — Documents */}
            {step === 3 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {(['photo', 'marksheet10', 'marksheet12', 'idProof'] as const).map(key => (
                  <div key={key} style={{
                    padding: '20px 16px', borderRadius: 10,
                    border: '2px dashed rgba(26,174,57,0.3)',
                    background: 'rgba(26,174,57,0.06)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center',
                  }}>
                    <CheckCircle2 size={20} style={{ color: '#1AAE39' }} strokeWidth={2} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {key === 'photo' ? 'Passport Photo' : key === 'marksheet10' ? '10th Marksheet' : key === 'marksheet12' ? '12th Marksheet' : 'ID Proof'}
                    </span>
                    <span style={{ fontSize: 11, color: '#1AAE39', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Uploaded
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Step 5 — Review */}
            {step === 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Personal', value: `${form.personal.fullName || '—'} · ${form.personal.city || '—'}, ${form.personal.state || '—'}` },
                  { label: 'Academic', value: `10th: ${form.academic.marks10 || '—'}% · 12th: ${form.academic.marks12 || '—'}% (${form.academic.stream || '—'})` },
                  { label: 'Board', value: `10th: ${form.academic.board10 || '—'} · 12th: ${form.academic.board12 || '—'}` },
                  { label: 'Documents', value: '4 files ready for upload' },
                ].map(row => (
                  <div key={row.label} style={{
                    padding: '12px 16px',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    background: 'var(--bg)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
                  }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0 }}>
                      {row.label}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', textAlign: 'right' }}>
                      {row.value}
                    </span>
                  </div>
                ))}

                {saveError && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 14px',
                    background: 'rgba(220,38,38,0.07)',
                    border: '1px solid rgba(220,38,38,0.2)',
                    borderRadius: 8, fontSize: 13, color: '#DC2626',
                  }}>
                    <AlertCircle size={14} />
                    {saveError}
                  </div>
                )}
              </div>
            )}

            {/* Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 28 }}>
              <button
                onClick={prev}
                disabled={step === 0}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  height: 36, padding: '0 14px',
                  background: 'transparent', border: '1px solid var(--border)',
                  borderRadius: 8, fontSize: 13, fontWeight: 500,
                  color: 'var(--text-secondary)', cursor: step === 0 ? 'not-allowed' : 'pointer',
                  opacity: step === 0 ? 0 : 1,
                  transition: 'all 0.15s',
                }}
              >
                <ArrowLeft size={15} /> Back
              </button>

              <button
                onClick={step === STEPS.length - 1 ? submit : next}
                disabled={saving}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  height: 36, padding: '0 18px',
                  background: 'var(--accent)', color: '#fff',
                  border: 'none', borderRadius: 8,
                  fontSize: 13, fontWeight: 600,
                  cursor: saving ? 'wait' : 'pointer',
                  opacity: saving ? 0.7 : 1,
                  transition: 'opacity 0.15s',
                }}
              >
                {saving ? 'Saving…' : step === STEPS.length - 1 ? 'Complete Profile' : 'Next Step'}
                {!saving && <ArrowRight size={15} strokeWidth={2} />}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  )
}