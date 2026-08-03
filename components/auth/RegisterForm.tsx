// components/auth/RegisterForm.tsx
'use client'
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  Loader2, ChevronRight, User, Phone,
  GraduationCap, ShieldCheck, CheckCircle2, AlertCircle
} from 'lucide-react'
import { registerStudent } from '@/lib/firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'

const steps = [
  { id: 1, title: 'Create Your Profile', icon: User },
  { id: 2, title: 'Personal Contact', icon: Phone },
  { id: 3, title: 'Academic Background', icon: GraduationCap },
  { id: 4, title: 'Social Category', icon: ShieldCheck },
  { id: 5, title: 'Review & Finish', icon: CheckCircle2 },
]

const initialForm = {
  fullName: '', email: '', password: '', confirmPassword: '',
  phone: '', dob: '', gender: 'male', state: '', city: '', address: '',
  tenthPercentage: '', twelfthPercentage: '',
  entranceExam: '', entranceScore: '',
  category: 'General', nationality: 'Indian',
}

export default function RegisterForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [stepError, setStepError] = useState('')
  const [formData, setFormData] = useState(initialForm)

  const update = (fields: Partial<typeof formData>) =>
    setFormData(prev => ({ ...prev, ...fields }))

  const validateStep = (): string | null => {
    if (currentStep === 1) {
      if (!formData.fullName || !formData.email || !formData.password) return 'Please fill all required fields.'
      if (formData.password !== formData.confirmPassword) return 'Passwords do not match.'
      if (!/^\S+@\S+\.\S+$/.test(formData.email)) return 'Invalid email format.'
      if (formData.password.length < 8) return 'Password must be at least 8 characters.'
    }
    if (currentStep === 2) {
      if (!formData.phone || !formData.dob) return 'Please fill all required fields.'
      if (!/^\d{10}$/.test(formData.phone)) return 'Phone must be 10 digits.'
    }
    if (currentStep === 3) {
      if (!formData.tenthPercentage || !formData.twelfthPercentage) return 'Please enter both percentages.'
    }
    return null
  }

  const handleNext = () => {
    const err = validateStep()
    if (err) { setStepError(err); return }
    setStepError('')
    setCurrentStep(prev => prev + 1)
  }

  const handleFinalSubmit = async () => {
    setLoading(true)
    setFormError('')
    try {
      const user = await registerStudent(formData.email, formData.password, formData.fullName)

      const profileData = {
        uid: user.uid,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        dob: formData.dob,
        gender: formData.gender,
        state: formData.state,
        city: formData.city,
        address: formData.address,
        tenthPercentage: parseFloat(formData.tenthPercentage) || 0,
        twelfthPercentage: parseFloat(formData.twelfthPercentage) || 0,
        entranceExam: formData.entranceExam,
        entranceScore: parseFloat(formData.entranceScore) || 0,
        category: formData.category,
        nationality: formData.nationality,
        role: 'student',
        isVerified: false,
        profileCompletion: 20,
        updatedAt: serverTimestamp(),
      }

      // student_profiles is what StudentDataProvider reads
      await setDoc(doc(db, 'student_profiles', user.uid), profileData)

      router.push('/student/onboarding')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Please try again.'
      setFormError(msg)
      setLoading(false)
    }
  }

  const inputClasses = "w-full rounded-[12px] px-4 h-[48px] text-[14px] outline-none transition-all duration-200"
  const inputStyle = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'var(--text-primary)',
  }
  const labelClasses = "block text-[13px] font-medium mb-1.5"

  return (
    <div className="w-full">
      {/* Step indicator */}
      <div className="mb-6 w-full relative">
        <div className="flex justify-between items-center relative mb-4">
          <div className="absolute top-1/2 left-0 right-0 h-[2px] -translate-y-1/2 z-0 rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              className="h-full"
              style={{ background: 'var(--accent)' }}
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
          </div>
          {steps.map(step => {
            const isActive = currentStep === step.id
            const isDone = currentStep > step.id
            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center">
                <motion.div
                  initial={false}
                  animate={{ scale: isActive ? 1.2 : 1 }}
                  className="w-2 h-2 rounded-full border-2"
                  style={{
                    background: isActive || isDone ? 'var(--accent)' : 'transparent',
                    borderColor: isActive || isDone ? 'var(--accent)' : 'rgba(255,255,255,0.15)',
                  }}
                />
              </div>
            )
          })}
        </div>
        <motion.div key={`title-${currentStep}`} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
          <span className="text-[12px] font-semibold tracking-wider uppercase mb-1 block"
            style={{ color: 'var(--text-muted)' }}>
            Step {currentStep} of 5
          </span>
          <h2 className="text-[42px] sm:text-[48px] font-display font-[800] tracking-tighter leading-[1.05]"
            style={{ color: 'var(--text-primary)' }}>
            {steps[currentStep - 1].title}.
          </h2>
        </motion.div>
      </div>

      {/* Step error */}
      {stepError && (
        <div className="mb-4 rounded-[12px] p-3 flex gap-2 items-center"
          style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)' }}>
          <AlertCircle size={16} style={{ color: 'var(--red)' }} className="shrink-0" />
          <p className="text-[13px] font-medium" style={{ color: 'var(--red)' }}>{stepError}</p>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div key={currentStep}
          initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
          <div className="rounded-[24px] p-5 sm:p-6"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>

            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className={labelClasses} style={{ color: 'var(--text-secondary)' }}>Full Legal Name</label>
                  <input className={inputClasses} style={inputStyle} value={formData.fullName}
                    onChange={e => update({ fullName: e.target.value })} placeholder="Enter your full name" />
                </div>
                <div>
                  <label className={labelClasses} style={{ color: 'var(--text-secondary)' }}>Email Address</label>
                  <input className={inputClasses} style={inputStyle} type="email" value={formData.email}
                    onChange={e => update({ email: e.target.value })} placeholder="name@example.com" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClasses} style={{ color: 'var(--text-secondary)' }}>Password</label>
                    <input className={inputClasses} style={inputStyle} type="password" value={formData.password}
                      onChange={e => update({ password: e.target.value })} placeholder="Min. 8 characters" />
                  </div>
                  <div>
                    <label className={labelClasses} style={{ color: 'var(--text-secondary)' }}>Confirm Password</label>
                    <input className={inputClasses} style={inputStyle} type="password" value={formData.confirmPassword}
                      onChange={e => update({ confirmPassword: e.target.value })} placeholder="••••••••" />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClasses} style={{ color: 'var(--text-secondary)' }}>Phone (10 Digits)</label>
                    <input className={inputClasses} style={inputStyle} value={formData.phone}
                      onChange={e => update({ phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      placeholder="9876543210" />
                  </div>
                  <div>
                    <label className={labelClasses} style={{ color: 'var(--text-secondary)' }}>Date of Birth</label>
                    <input type="date" className={inputClasses} style={{ ...inputStyle, colorScheme: 'dark' }}
                      value={formData.dob} onChange={e => update({ dob: e.target.value })} />
                  </div>
                </div>
                <div>
                  <span className={labelClasses} style={{ color: 'var(--text-secondary)' }}>Gender</span>
                  <div className="flex gap-3" role="group">
                    {(['male', 'female', 'other'] as const).map(g => (
                      <button key={g} type="button" onClick={() => update({ gender: g })}
                        className="flex-1 py-2.5 rounded-[12px] text-[13px] font-medium capitalize transition-all"
                        style={{
                          border: `1px solid ${formData.gender === g ? 'var(--accent)' : 'rgba(255,255,255,0.08)'}`,
                          background: formData.gender === g ? 'var(--accent-bg)' : 'transparent',
                          color: formData.gender === g ? 'var(--accent)' : 'var(--text-muted)',
                        }}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClasses} style={{ color: 'var(--text-secondary)' }}>State</label>
                    <input className={inputClasses} style={inputStyle} value={formData.state}
                      onChange={e => update({ state: e.target.value })} placeholder="e.g. Karnataka" />
                  </div>
                  <div>
                    <label className={labelClasses} style={{ color: 'var(--text-secondary)' }}>City</label>
                    <input className={inputClasses} style={inputStyle} value={formData.city}
                      onChange={e => update({ city: e.target.value })} placeholder="e.g. Bengaluru" />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: '10th Percentage (%)', key: 'tenthPercentage', placeholder: '0.00' },
                    { label: '12th Percentage (%)', key: 'twelfthPercentage', placeholder: '0.00' },
                    { label: 'Entrance Exam', key: 'entranceExam', placeholder: 'e.g. JEE Main', type: 'text' },
                    { label: 'Score / Rank', key: 'entranceScore', placeholder: '0' },
                  ].map(({ label, key, placeholder, type }) => (
                    <div key={key}>
                      <label className={labelClasses} style={{ color: 'var(--text-secondary)' }}>{label}</label>
                      <input className={inputClasses} style={inputStyle}
                        type={type ?? 'number'} placeholder={placeholder}
                        value={formData[key as keyof typeof formData] as string}
                        onChange={e => update({ [key]: e.target.value })} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClasses} style={{ color: 'var(--text-secondary)' }}>Social Category</label>
                    <select className={inputClasses} style={inputStyle}
                      value={formData.category} onChange={e => update({ category: e.target.value })}>
                      {['General', 'OBC', 'SC', 'ST', 'EWS'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClasses} style={{ color: 'var(--text-secondary)' }}>Nationality</label>
                    <input className={inputClasses} style={inputStyle}
                      value={formData.nationality} onChange={e => update({ nationality: e.target.value })} />
                  </div>
                </div>
                <div className="flex items-start gap-4 mt-6 rounded-[16px] p-5"
                  style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-border)' }}>
                  <ShieldCheck size={24} style={{ color: 'var(--accent)' }} className="shrink-0" />
                  <p className="text-[13px] font-medium leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    Data is encrypted using strict security standards. Documents can be uploaded after login.
                  </p>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-5">
                <div className="rounded-[16px] p-6 space-y-3"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                  {[
                    { l: 'Full Name', v: formData.fullName },
                    { l: 'Email Address', v: formData.email },
                    { l: 'Phone Number', v: formData.phone },
                    { l: 'Academic Stats', v: `${formData.tenthPercentage}% / ${formData.twelfthPercentage}%` },
                    { l: 'Location', v: `${formData.city}, ${formData.state}` },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-2.5"
                      style={{ borderBottom: i < 4 ? '1px solid var(--border)' : 'none' }}>
                      <span className="text-[13px] font-medium" style={{ color: 'var(--text-muted)' }}>{item.l}</span>
                      <span className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>{item.v}</span>
                    </div>
                  ))}
                </div>
                {formError && (
                  <div className="rounded-[12px] p-3 flex gap-2 items-center"
                    style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)' }}>
                    <AlertCircle size={16} style={{ color: 'var(--red)' }} className="shrink-0" />
                    <p className="text-[13px] font-medium" style={{ color: 'var(--red)' }}>{formError}</p>
                  </div>
                )}
                <div className="flex items-center gap-3 rounded-[16px] p-4"
                  style={{ background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.2)' }}>
                  <AlertCircle size={18} style={{ color: 'var(--gold)' }} className="shrink-0" />
                  <p className="text-[13px] font-medium" style={{ color: 'var(--gold)' }}>
                    Ensure all details match your official documents before finalizing.
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 flex gap-3">
        {currentStep > 1 && (
          <button type="button" onClick={() => setCurrentStep(p => p - 1)}
            className="flex-1 h-[48px] rounded-[14px] text-[14px] font-medium transition-all"
            style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)', background: 'transparent' }}>
            Back
          </button>
        )}
        {currentStep < 5 ? (
          <button type="button" onClick={handleNext}
            className="flex-[2] h-[48px] rounded-[14px] font-bold text-[15px] transition-all flex items-center justify-center gap-2 group"
            style={{ background: 'var(--accent)', color: '#fff' }}>
            <span>Continue</span>
            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        ) : (
          <button type="button" onClick={handleFinalSubmit} disabled={loading}
            className="flex-[2] h-[48px] rounded-[14px] font-bold text-[15px] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'var(--accent)', color: '#fff' }}>
            {loading ? <Loader2 className="animate-spin" size={18} /> : <span>Finalize Registration</span>}
          </button>
        )}
      </div>
    </div>
  )
}