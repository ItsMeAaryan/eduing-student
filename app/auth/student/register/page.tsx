'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Loader2, 
  ChevronRight, 
  User, 
  Phone, 
  GraduationCap, 
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase/config'
import AuthContainer from '@/components/AuthContainer'

const steps = [
  { id: 1, title: 'Identity', icon: User },
  { id: 2, title: 'Contact', icon: Phone },
  { id: 3, title: 'Academic', icon: GraduationCap },
  { id: 4, title: 'Verify', icon: ShieldCheck },
  { id: 5, title: 'Review', icon: CheckCircle2 }
]

export default function MultiStepRegisterPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dob: '',
    gender: 'male',
    state: '',
    city: '',
    address: '',
    tenthPercentage: '',
    twelfthPercentage: '',
    entranceExam: '',
    entranceScore: '',
    category: 'General',
    nationality: 'Indian'
  })

  const updateFormData = (fields: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...fields }))
  }

  const validateStep = () => {
    if (currentStep === 1) {
      if (!formData.fullName || !formData.email || !formData.password) return false
      if (formData.password !== formData.confirmPassword) {
        alert("Passwords do not match")
        return false
      }
      if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
        alert("Invalid email format")
        return false
      }
    }
    if (currentStep === 2) {
      if (!formData.phone || !formData.dob) return false
      if (!/^\d{10}$/.test(formData.phone)) {
        alert("Phone must be 10 digits")
        return false
      }
    }
    if (currentStep === 3) {
      if (!formData.tenthPercentage || !formData.twelfthPercentage) return false
    }
    return true
  }

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(prev => prev + 1)
    } else {
      alert("Please fill all required fields correctly.")
    }
  }

  const handleBack = () => setCurrentStep(prev => prev - 1)

  const handleFinalSubmit = async () => {
    setLoading(true)
    try {
      const cred = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      
      const userData = {
        uid: cred.user.uid,
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
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      await setDoc(doc(db, 'users', cred.user.uid), userData)
      
      router.push('/student/dashboard')
    } catch (err: any) {
      alert(err.message || "Registration failed")
      setLoading(false)
    }
  }

  const inputClasses = "w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:border-brand-indigo/50 focus:bg-brand-indigo/5 focus:shadow-[0_0_15px_rgba(79,70,229,0.15)] outline-none transition-all placeholder:text-white/40 hover:border-white/20"
  const labelClasses = "block text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-2 ml-1"

  return (
    <AuthContainer>
      <div className="w-full">
      {/* Compact Progress Indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center relative mb-4">
          <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-white/5 -translate-y-1/2 z-0" />
          {steps.map((step) => {
            const Icon = step.icon
            const isActive = currentStep === step.id
            const isCompleted = currentStep > step.id
            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center group">
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-brand-indigo text-white shadow-[0_0_15px_rgba(79,70,229,0.4)] scale-110' : isCompleted ? 'bg-brand-indigo/20 text-brand-indigoLight' : 'bg-[#111114] border border-white/10 text-white/30 group-hover:border-white/30'}`}>
                    {isCompleted ? <CheckCircle2 size={14} /> : <Icon size={14} />}
                 </div>
              </div>
            )
          })}
        </div>
        <div className="text-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-brand-indigoLight">
            Step {currentStep} of 5: {steps[currentStep-1].title}
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {currentStep === 1 && (
            <div className="space-y-5">
              <div>
                <label htmlFor="fullName" className={labelClasses}>Full Legal Name</label>
                <input id="fullName" className={inputClasses} value={formData.fullName} onChange={e => updateFormData({ fullName: e.target.value })} placeholder="Enter your full name" />
              </div>
              <div>
                <label htmlFor="email" className={labelClasses}>Email Access</label>
                <input id="email" className={inputClasses} type="email" value={formData.email} onChange={e => updateFormData({ email: e.target.value })} placeholder="name@example.com" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="password" className={labelClasses}>Secure Password</label>
                  <input id="password" className={inputClasses} type="password" value={formData.password} onChange={e => updateFormData({ password: e.target.value })} placeholder="••••••••" />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className={labelClasses}>Confirm Access</label>
                  <input id="confirmPassword" className={inputClasses} type="password" value={formData.confirmPassword} onChange={e => updateFormData({ confirmPassword: e.target.value })} placeholder="••••••••" />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="phone" className={labelClasses}>Phone (10 Digits)</label>
                  <input id="phone" className={inputClasses} value={formData.phone} onChange={e => updateFormData({ phone: e.target.value.replace(/\D/g, '').slice(0,10) })} placeholder="9876543210" />
                </div>
                <div>
                  <label htmlFor="dob" className={labelClasses}>Date of Birth</label>
                  <input id="dob" type="date" className={inputClasses + " [color-scheme:dark]"} value={formData.dob} onChange={e => updateFormData({ dob: e.target.value })} />
                </div>
              </div>
              <div>
                <span className={labelClasses}>Gender Identity</span>
                <div className="flex gap-3" role="group" aria-label="Gender Identity">
                  {['male', 'female', 'other'].map(g => (
                    <button key={g} onClick={() => updateFormData({ gender: g as any })} className={`flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${formData.gender === g ? 'bg-brand-indigo/10 border-brand-indigo/30 text-brand-indigoLight' : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20 hover:text-white/70'}`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="state" className={labelClasses}>State</label>
                  <input id="state" className={inputClasses} value={formData.state} onChange={e => updateFormData({ state: e.target.value })} placeholder="e.g. Karnataka" />
                </div>
                <div>
                  <label htmlFor="city" className={labelClasses}>City</label>
                  <input id="city" className={inputClasses} value={formData.city} onChange={e => updateFormData({ city: e.target.value })} placeholder="e.g. Bengaluru" />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="tenthPercentage" className={labelClasses}>10th Percentage (%)</label>
                  <input id="tenthPercentage" type="number" className={inputClasses} value={formData.tenthPercentage} onChange={e => updateFormData({ tenthPercentage: e.target.value })} placeholder="0.00" />
                </div>
                <div>
                  <label htmlFor="twelfthPercentage" className={labelClasses}>12th Percentage (%)</label>
                  <input id="twelfthPercentage" type="number" className={inputClasses} value={formData.twelfthPercentage} onChange={e => updateFormData({ twelfthPercentage: e.target.value })} placeholder="0.00" />
                </div>
                <div>
                  <label htmlFor="entranceExam" className={labelClasses}>Entrance Exam</label>
                  <input id="entranceExam" className={inputClasses} value={formData.entranceExam} onChange={e => updateFormData({ entranceExam: e.target.value })} placeholder="e.g. JEE Main" />
                </div>
                <div>
                  <label htmlFor="entranceScore" className={labelClasses}>Score / Rank</label>
                  <input id="entranceScore" type="number" className={inputClasses} value={formData.entranceScore} onChange={e => updateFormData({ entranceScore: e.target.value })} placeholder="0" />
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="category" className={labelClasses}>Social Category</label>
                  <select id="category" className={inputClasses} value={formData.category} onChange={e => updateFormData({ category: e.target.value as any })}>
                    {['General', 'OBC', 'SC', 'ST', 'EWS'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="nationality" className={labelClasses}>Nationality</label>
                  <input id="nationality" className={inputClasses} value={formData.nationality} onChange={e => updateFormData({ nationality: e.target.value })} />
                </div>
              </div>
              <div className="bg-brand-indigo/10 border border-brand-indigo/20 rounded-2xl p-5 flex items-center gap-4 mt-2">
                 <ShieldCheck className="text-brand-indigoLight shrink-0" size={24} />
                 <p className="text-[10px] font-black uppercase leading-relaxed text-brand-indigoLight/70 tracking-widest">
                   Data is encrypted using NTA-grade standards. Documents will be requested in the next phase.
                 </p>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
                 {[
                   { l: 'Name', v: formData.fullName },
                   { l: 'Email', v: formData.email },
                   { l: 'Phone', v: formData.phone },
                   { l: 'Acad', v: `${formData.tenthPercentage}% / ${formData.twelfthPercentage}%` },
                   { l: 'State', v: formData.state }
                 ].map((item, i) => (
                   <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                      <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">{item.l}</span>
                      <span className="text-sm font-bold text-white/90">{item.v}</span>
                   </div>
                 ))}
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3 items-center">
                <AlertCircle className="text-amber-500 shrink-0" size={18} />
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-500/70">Ensure all details match official documents.</p>
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex gap-3">
        {currentStep > 1 && (
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleBack} 
            className="flex-1 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-widest transition-all"
          >
            Back
          </motion.button>
        )}
        {currentStep < 5 ? (
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNext} 
            className="flex-[2] py-4 rounded-2xl bg-brand-indigo hover:bg-brand-indigoLight text-white font-bold text-xs uppercase tracking-widest shadow-[0_8px_24px_rgba(79,70,229,0.25)] hover:shadow-[0_12px_32px_rgba(79,70,229,0.4)] transition-all flex items-center justify-center gap-2"
          >
            Continue <ChevronRight size={16} />
          </motion.button>
        ) : (
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleFinalSubmit} 
            disabled={loading} 
            className="flex-[2] py-4 rounded-2xl bg-brand-indigo hover:bg-brand-indigoLight text-white font-bold text-xs uppercase tracking-widest shadow-[0_8px_24px_rgba(79,70,229,0.25)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Finalize"}
          </motion.button>
        )}
      </div>

      </div>
    </AuthContainer>
  )
}
