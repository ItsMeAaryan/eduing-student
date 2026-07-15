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

const steps = [
  { id: 1, title: 'Create Your Profile', icon: User },
  { id: 2, title: 'Personal Contact', icon: Phone },
  { id: 3, title: 'Academic Background', icon: GraduationCap },
  { id: 4, title: 'Social Category', icon: ShieldCheck },
  { id: 5, title: 'Review & Finish', icon: CheckCircle2 }
]

export default function RegisterForm() {
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

  const inputClasses = "w-full bg-white/[0.02] border border-white/10 rounded-[12px] px-4 h-[48px] text-[14px] text-white focus:border-brand-indigo focus:bg-brand-indigo/5 focus:ring-4 focus:ring-brand-indigo/10 outline-none transition-all duration-200 placeholder:text-white/30"
  const labelClasses = "block font-sans text-[13px] font-medium text-white/70 mb-1.5"

  return (
    <div className="w-full">
      {/* Premium Step Indicator */}
      <div className="mb-6 w-full relative">
        <div className="flex justify-between items-center relative mb-4">
          <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-white/5 -translate-y-1/2 z-0 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-brand-indigo to-brand-indigoLight"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
          {steps.map((step) => {
            const isActive = currentStep === step.id
            const isCompleted = currentStep > step.id
            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center">
                  <motion.div 
                    initial={false}
                    animate={{
                      backgroundColor: isActive || isCompleted ? '#4F46E5' : '#050508',
                      borderColor: isActive || isCompleted ? '#4F46E5' : 'rgba(255,255,255,0.1)',
                      scale: isActive ? 1.2 : 1
                    }}
                    className={`w-2 h-2 rounded-full border-[2px] transition-colors duration-300 ${isActive ? 'ring-4 ring-[#4F46E5]/30' : ''}`}
                  />
              </div>
            )
          })}
        </div>
        
        <motion.div 
          key={`title-${currentStep}`}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-left"
        >
          <span className="text-[12px] font-sans font-semibold text-white/50 tracking-wider uppercase mb-1 block">
            Step {currentStep} of 5
          </span>
          <h2 className="text-[42px] sm:text-[48px] font-display font-[800] tracking-tighter leading-[1.05] text-white">
            {steps[currentStep-1].title}.
          </h2>
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="relative">
            {/* Form Background Glow */}
            <div className="absolute inset-0 bg-brand-indigo/5 blur-[100px] pointer-events-none rounded-full" />
            
            <div className="relative bg-[#111116]/40 backdrop-blur-md border border-white/5 rounded-[24px] p-5 sm:p-6 shadow-inner">
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="fullName" className={labelClasses}>Full Legal Name</label>
                    <input id="fullName" className={inputClasses} value={formData.fullName} onChange={e => updateFormData({ fullName: e.target.value })} placeholder="Enter your full name" />
                  </div>
                  <div>
                    <label htmlFor="email" className={labelClasses}>Email Access</label>
                    <input id="email" className={inputClasses} type="email" value={formData.email} onChange={e => updateFormData({ email: e.target.value })} placeholder="name@example.com" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <span className={labelClasses}>Gender</span>
                    <div className="flex gap-3" role="group" aria-label="Gender Identity">
                      {['male', 'female', 'other'].map(g => (
                        <button key={g} onClick={() => updateFormData({ gender: g as any })} className={`flex-1 py-2.5 rounded-[12px] border text-[13px] font-medium capitalize transition-all ${formData.gender === g ? 'bg-white/10 border-white/30 text-white shadow-inner' : 'bg-[#13131F]/50 border-white/5 text-white/50 hover:border-white/20 hover:text-white/80'}`}>
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div className="bg-[#111116]/80 border border-brand-indigo/20 rounded-[16px] p-5 flex items-start gap-4 mt-6">
                     <ShieldCheck className="text-brand-indigoLight shrink-0" size={24} />
                     <p className="text-[13px] font-medium leading-relaxed text-white/70">
                       Data is encrypted using strict security standards. Additional documents will be requested from your dashboard once logged in.
                     </p>
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-5">
                  <div className="bg-[#111116]/80 border border-white/5 rounded-[16px] p-6 space-y-3 shadow-inner">
                     {[
                       { l: 'Full Name', v: formData.fullName },
                       { l: 'Email Address', v: formData.email },
                       { l: 'Phone Number', v: formData.phone },
                       { l: 'Academic Stats', v: `${formData.tenthPercentage}% / ${formData.twelfthPercentage}%` },
                       { l: 'Location', v: `${formData.city}, ${formData.state}` }
                     ].map((item, i) => (
                       <div key={i} className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-0">
                          <span className="text-[13px] font-medium text-white/50">{item.l}</span>
                          <span className="text-[14px] font-semibold text-white/90">{item.v}</span>
                       </div>
                     ))}
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-[16px] p-4 flex gap-3 items-center">
                    <AlertCircle className="text-amber-500 shrink-0" size={18} />
                    <p className="text-[13px] font-medium text-amber-500/90">Please ensure all details match your official documents before finalizing.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </motion.div>
      </AnimatePresence>

      <div className="mt-6 flex gap-3">
        {currentStep > 1 && (
          <motion.button 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleBack} 
            className="flex-1 h-[48px] rounded-[14px] bg-transparent border border-white/10 hover:bg-white/[0.03] hover:border-white/20 text-white/70 hover:text-white font-display font-medium text-[14px] transition-all"
          >
            Back
          </motion.button>
        )}
        {currentStep < 5 ? (
          <button 
            onClick={handleNext} 
            className="flex-[2] h-[48px] rounded-[14px] bg-gradient-to-b from-[#4F46E5] to-[#4338CA] shadow-[0_4px_12px_rgba(79,70,229,0.3),inset_0_1px_1px_rgba(255,255,255,0.2)] hover:shadow-[0_6px_16px_rgba(79,70,229,0.4),inset_0_1px_1px_rgba(255,255,255,0.25)] text-white font-display font-bold text-[15px] transition-all flex items-center justify-center gap-2 group active:scale-[0.99]"
          >
            <span>Continue</span> <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        ) : (
          <button 
            onClick={handleFinalSubmit} 
            disabled={loading} 
            className="flex-[2] h-[48px] rounded-[14px] bg-gradient-to-b from-[#4F46E5] to-[#4338CA] shadow-[0_4px_12px_rgba(79,70,229,0.3),inset_0_1px_1px_rgba(255,255,255,0.2)] hover:shadow-[0_6px_16px_rgba(79,70,229,0.4),inset_0_1px_1px_rgba(255,255,255,0.25)] text-white font-display font-bold text-[15px] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group active:scale-[0.99]"
          >
            {loading ? <Loader2 className="animate-spin text-white" size={18} /> : <span>Finalize Registration</span>}
          </button>
        )}
      </div>

      </div>
  )
}
