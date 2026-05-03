'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/Logo'
import { 
  Loader2, 
  ChevronRight, 
  ChevronLeft, 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Calendar, 
  MapPin, 
  GraduationCap, 
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase/config'

const steps = [
  { id: 1, title: 'Identity', icon: User },
  { id: 2, title: 'Contact', icon: Phone },
  { id: 3, title: 'Academic', icon: GraduationCap },
  { id: 4, title: 'Verification', icon: ShieldCheck },
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
        profileCompletion: 20, // Initial completion
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

  const inputClasses = "w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:border-indigo-500/50 focus:bg-indigo-500/5 outline-none transition-all placeholder:text-white/10"
  const labelClasses = "block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2 ml-1"

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex flex-col font-sans">
      {/* HEADER / PROGRESS BAR */}
      <div className="w-full bg-[#111114] border-b border-white/5 px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
             <Logo height={28} />
             <div className="flex items-center gap-3">
               <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Step {currentStep} of 5</span>
               <div className="h-1 w-32 bg-white/5 rounded-full overflow-hidden">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${(currentStep / 5) * 100}%` }}
                   className="h-full bg-indigo-500"
                 />
               </div>
             </div>
          </div>

          <div className="flex justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/5 -translate-y-1/2 z-0" />
            {steps.map((step) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id
              return (
                <div key={step.id} className="relative z-10 flex flex-col items-center">
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isActive ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 scale-110' : isCompleted ? 'bg-indigo-500/20 text-indigo-400' : 'bg-[#111114] border border-white/5 text-white/20'}`}>
                      {isCompleted ? <CheckCircle2 size={20} /> : <Icon size={20} />}
                   </div>
                   <span className={`mt-3 text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-white/20'}`}>{step.title}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* FORM BODY */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-[#111114] border border-white/5 rounded-[40px] p-10 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[100px] pointer-events-none" />
              
              {currentStep === 1 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-black mb-2 tracking-tight">Identity Creation</h2>
                    <p className="text-white/30 text-sm">Establish your unique student profile credentials.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className={labelClasses}>Full Legal Name</label>
                      <input className={inputClasses} value={formData.fullName} onChange={e => updateFormData({ fullName: e.target.value })} placeholder="Enter your full name" />
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelClasses}>Email Access</label>
                      <input className={inputClasses} type="email" value={formData.email} onChange={e => updateFormData({ email: e.target.value })} placeholder="name@example.com" />
                    </div>
                    <div>
                      <label className={labelClasses}>Secure Password</label>
                      <input className={inputClasses} type="password" value={formData.password} onChange={e => updateFormData({ password: e.target.value })} />
                    </div>
                    <div>
                      <label className={labelClasses}>Confirm Access</label>
                      <input className={inputClasses} type="password" value={formData.confirmPassword} onChange={e => updateFormData({ confirmPassword: e.target.value })} />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-black mb-2 tracking-tight">Contact Matrix</h2>
                    <p className="text-white/30 text-sm">Encryption-secured reachability data.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClasses}>Phone Number (10 Digits)</label>
                      <input className={inputClasses} value={formData.phone} onChange={e => updateFormData({ phone: e.target.value.replace(/\D/g, '').slice(0,10) })} placeholder="9876543210" />
                    </div>
                    <div>
                      <label className={labelClasses}>Date of Birth</label>
                      <input type="date" className={inputClasses + " [color-scheme:dark]"} value={formData.dob} onChange={e => updateFormData({ dob: e.target.value })} />
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelClasses}>Gender Identity</label>
                      <div className="flex gap-4">
                        {['male', 'female', 'other'].map(g => (
                          <button key={g} onClick={() => updateFormData({ gender: g as any })} className={`flex-1 py-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${formData.gender === g ? 'bg-indigo-600/10 border-indigo-600/30 text-indigo-400' : 'bg-white/5 border-white/5 text-white/20'}`}>
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className={labelClasses}>State</label>
                      <input className={inputClasses} value={formData.state} onChange={e => updateFormData({ state: e.target.value })} placeholder="e.g. Karnataka" />
                    </div>
                    <div>
                      <label className={labelClasses}>City</label>
                      <input className={inputClasses} value={formData.city} onChange={e => updateFormData({ city: e.target.value })} placeholder="e.g. Bengaluru" />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-black mb-2 tracking-tight">Academic Metadata</h2>
                    <p className="text-white/30 text-sm">Verified academic performance metrics.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClasses}>10th Percentage (%)</label>
                      <input type="number" className={inputClasses} value={formData.tenthPercentage} onChange={e => updateFormData({ tenthPercentage: e.target.value })} />
                    </div>
                    <div>
                      <label className={labelClasses}>12th Percentage (%)</label>
                      <input type="number" className={inputClasses} value={formData.twelfthPercentage} onChange={e => updateFormData({ twelfthPercentage: e.target.value })} />
                    </div>
                    <div>
                      <label className={labelClasses}>Entrance Exam</label>
                      <input className={inputClasses} value={formData.entranceExam} onChange={e => updateFormData({ entranceExam: e.target.value })} placeholder="e.g. JEE Main" />
                    </div>
                    <div>
                      <label className={labelClasses}>Score / Rank</label>
                      <input type="number" className={inputClasses} value={formData.entranceScore} onChange={e => updateFormData({ entranceScore: e.target.value })} />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-black mb-2 tracking-tight">Identity Verification</h2>
                    <p className="text-white/30 text-sm">Classification and regional metadata.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClasses}>Social Category</label>
                      <select className={inputClasses} value={formData.category} onChange={e => updateFormData({ category: e.target.value as any })}>
                        {['General', 'OBC', 'SC', 'ST', 'EWS'].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelClasses}>Nationality</label>
                      <input className={inputClasses} value={formData.nationality} onChange={e => updateFormData({ nationality: e.target.value })} />
                    </div>
                    <div className="md:col-span-2 bg-indigo-600/10 border border-indigo-600/20 rounded-3xl p-6 flex items-center gap-4">
                       <ShieldCheck className="text-indigo-400 shrink-0" size={24} />
                       <p className="text-[10px] font-black uppercase leading-relaxed text-indigo-400/60 tracking-widest">
                         "Data is encrypted using NTA-grade standards. Documents will be requested in the next phase for full profile verification."
                       </p>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-black mb-2 tracking-tight">Final Dossier Review</h2>
                    <p className="text-white/30 text-sm">Confirm your metadata before identity finalization.</p>
                  </div>
                  <div className="bg-white/5 rounded-3xl p-6 space-y-4">
                     {[
                       { l: 'Name', v: formData.fullName },
                       { l: 'Email', v: formData.email },
                       { l: 'Phone', v: formData.phone },
                       { l: 'Acad', v: `${formData.tenthPercentage}% / ${formData.twelfthPercentage}%` },
                       { l: 'State', v: formData.state }
                     ].map((item, i) => (
                       <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                          <span className="text-[10px] font-black uppercase text-white/20 tracking-widest">{item.l}</span>
                          <span className="text-sm font-bold">{item.v}</span>
                       </div>
                     ))}
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex gap-3 items-center">
                    <AlertCircle className="text-amber-500" size={18} />
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-500/70">Ensure all details match your official documents.</p>
                  </div>
                </div>
              )}

              {/* NAV BUTTONS */}
              <div className="mt-12 flex gap-4">
                {currentStep > 1 && (
                  <button onClick={handleBack} className="flex-1 py-5 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black text-xs uppercase tracking-widest transition-all">
                    Back
                  </button>
                )}
                {currentStep < 5 ? (
                  <button onClick={handleNext} className="flex-[2] py-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2">
                    Next Phase <ChevronRight size={16} />
                  </button>
                ) : (
                  <button onClick={handleFinalSubmit} disabled={loading} className="flex-[2] py-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                    {loading ? <Loader2 className="animate-spin" size={20} /> : "Finalize Registration"}
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 text-center">
             <p className="text-white/20 text-xs font-bold uppercase tracking-widest">
               Already have an identity? <Link href="/auth/login" className="text-indigo-400 hover:underline">Log in</Link>
             </p>
          </div>
        </div>
      </div>
    </div>
  )
}
