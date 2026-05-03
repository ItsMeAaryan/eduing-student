'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Logo from '@/components/Logo'
import { 
  User, 
  GraduationCap, 
  ClipboardList, 
  FileUp, 
  CheckCircle2, 
  Wand2, 
  ArrowRight, 
  ArrowLeft 
} from 'lucide-react'
import { DEMO_STUDENT } from '@/lib/demo'
import ProtectedRoute from '@/components/ProtectedRoute'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase/config'

const steps = [
  { id: 'personal', title: 'Personal', icon: User },
  { id: 'academic', title: 'Academic', icon: GraduationCap },
  { id: 'exams', title: 'Exams', icon: ClipboardList },
  { id: 'documents', title: 'Documents', icon: FileUp },
  { id: 'review', title: 'Review', icon: CheckCircle2 },
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<any>({
    personal: { fullName: '', dob: '', gender: '', phone: '', state: '', city: '', address: '' },
    academic: { school10: '', board10: '', marks10: '', year10: '', school12: '', board12: '', marks12: '', year12: '', stream: '' },
    exams: { jeeMain: '', cuet: '', neet: '', bitSat: '' },
    documents: { photo: true, marksheet10: true, marksheet12: true, idProof: true }
  })
  const router = useRouter()

  const handleAutofill = () => {
    const stepId = steps[currentStep].id
    if (stepId === 'personal') {
      setFormData({ ...formData, personal: { 
        fullName: DEMO_STUDENT.fullName, 
        dob: DEMO_STUDENT.dob, 
        gender: DEMO_STUDENT.gender, 
        phone: DEMO_STUDENT.phone, 
        state: DEMO_STUDENT.state, 
        city: DEMO_STUDENT.city, 
        address: '123, Demo Street, Bengaluru' 
      }})
    } else if (stepId === 'academic') {
      setFormData({ ...formData, academic: { 
        school10: 'Demo Public School', board10: DEMO_STUDENT.tenthBoard, marks10: DEMO_STUDENT.tenthMarks, year10: DEMO_STUDENT.tenthYear,
        school12: 'Demo Senior Secondary', board12: DEMO_STUDENT.twelfthBoard, marks12: DEMO_STUDENT.twelfthMarks, year12: DEMO_STUDENT.twelfthYear,
        stream: DEMO_STUDENT.stream
      }})
    } else if (stepId === 'exams') {
      setFormData({ ...formData, exams: { 
        jeeMain: DEMO_STUDENT.entranceScores.JEE_Main, 
        cuet: DEMO_STUDENT.entranceScores.CUET,
        neet: '', bitSat: ''
      }})
    }
  }

  const nextStep = async () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1)
    else {
      // Final submit
      const user = auth.currentUser
      if (user) {
        try {
          await updateDoc(doc(db, 'student_profiles', user.uid), {
            ...formData,
            profileComplete: true,
            updatedAt: serverTimestamp(),
          })
          router.push('/student/dashboard')
        } catch (err) {
          alert('Failed to save profile')
        }
      }
    }
  }

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1)
  }

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="min-h-screen bg-[var(--bg-primary)] text-white py-12 px-6">
        <div className="max-w-[800px] mx-auto flex flex-col items-center">
          <div className="mb-12">
            <Logo height={40} />
          </div>

          {/* Progress Bar */}
          <div className="w-full mb-12">
            <div className="flex justify-between mb-4">
              {steps.map((step, i) => (
                <div key={step.id} className={`flex flex-col items-center gap-2 ${i <= currentStep ? 'text-brand-indigo' : 'text-white/20'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    i < currentStep ? 'bg-brand-indigo border-brand-indigo text-white' : 
                    i === currentStep ? 'border-brand-indigo text-brand-indigo' : 'border-white/10 text-white/20'
                  }`}>
                    {i < currentStep ? <CheckCircle2 size={20} /> : <step.icon size={20} />}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest">{step.title}</span>
                </div>
              ))}
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                className="h-full bg-brand-indigo"
              />
            </div>
          </div>

          {/* Form Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card w-full max-w-[600px] p-8 md:p-10 relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-bold">{steps[currentStep].title} Information</h2>
                  <p className="text-white/50 text-sm mt-1">Please fill in your details to complete your profile.</p>
                </div>
                {currentStep < 3 && (
                  <button 
                    onClick={handleAutofill}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-gold/10 border border-brand-gold/30 text-brand-goldLight text-[11px] font-bold hover:bg-brand-gold/20 transition-all"
                  >
                    <Wand2 size={14} />
                    🪄 Autofill
                  </button>
                )}
              </div>

              {/* Step Content */}
              <div className="space-y-6">
                {currentStep === 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 flex justify-center mb-4">
                       <div className="w-24 h-24 rounded-full border-2 border-dashed border-white/20 flex flex-col items-center justify-center text-white/30 hover:border-brand-indigo hover:text-brand-indigo transition-all cursor-pointer">
                         <User size={32} />
                         <span className="text-[10px] font-bold mt-1 uppercase">Photo</span>
                       </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-white/40 mb-2 uppercase tracking-widest">Full Name</label>
                      <input value={formData.personal.fullName} onChange={e => setFormData({...formData, personal: {...formData.personal, fullName: e.target.value}})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-indigo" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-white/40 mb-2 uppercase tracking-widest">DOB</label>
                      <input type="date" value={formData.personal.dob} onChange={e => setFormData({...formData, personal: {...formData.personal, dob: e.target.value}})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-indigo" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-white/40 mb-2 uppercase tracking-widest">Gender</label>
                      <select value={formData.personal.gender} onChange={e => setFormData({...formData, personal: {...formData.personal, gender: e.target.value}})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-indigo">
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                      <h4 className="md:col-span-2 text-brand-indigo text-xs font-bold uppercase tracking-wider">10th Standard</h4>
                      <input placeholder="School Name" value={formData.academic.school10} className="md:col-span-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none" />
                      <input placeholder="Board" value={formData.academic.board10} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none" />
                      <input placeholder="Percentage" value={formData.academic.marks10} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                      <h4 className="md:col-span-2 text-brand-indigo text-xs font-bold uppercase tracking-wider">12th Standard</h4>
                      <input placeholder="School Name" value={formData.academic.school12} className="md:col-span-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none" />
                      <input placeholder="Stream (e.g. Science)" value={formData.academic.stream} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none" />
                      <input placeholder="Percentage" value={formData.academic.marks12} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none" />
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-4">
                    {['jeeMain', 'cuet', 'neet', 'bitSat'].map((exam) => (
                      <div key={exam} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 group hover:border-brand-indigo/40 transition-all">
                        <input type="checkbox" checked={!!formData.exams[exam]} className="w-5 h-5 rounded border-white/20 bg-transparent text-brand-indigo focus:ring-brand-indigo" />
                        <span className="flex-1 font-bold uppercase tracking-wider text-sm">{exam.replace(/([A-Z])/g, ' $1').trim()}</span>
                        {formData.exams[exam] !== undefined && (
                          <input placeholder="Score" value={formData.exams[exam]} onChange={e => setFormData({...formData, exams: {...formData.exams, [exam]: e.target.value}})} className="w-24 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-right outline-none focus:border-brand-indigo" />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['Photo', '10th Marksheet', '12th Marksheet', 'ID Proof'].map((doc) => (
                      <div key={doc} className="p-6 rounded-2xl border-2 border-dashed border-green-500/20 bg-green-500/5 flex flex-col items-center justify-center text-center">
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 mb-3">
                          <CheckCircle2 size={24} />
                        </div>
                        <span className="text-xs font-bold text-white mb-1">{doc}</span>
                        <span className="text-[10px] text-green-500 font-bold uppercase">Uploaded</span>
                      </div>
                    ))}
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-4 text-sm">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-xs font-bold text-white/30 uppercase mb-2">Personal</div>
                      <div className="text-white font-medium">{formData.personal.fullName} • {formData.personal.gender} • {formData.personal.city}, {formData.personal.state}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-xs font-bold text-white/30 uppercase mb-2">Academic</div>
                      <div className="text-white font-medium">10th: {formData.academic.marks10}% • 12th: {formData.academic.marks12}% ({formData.academic.stream})</div>
                    </div>
                    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-between">
                      <span className="text-green-500 font-bold uppercase text-[10px]">All Documents Verified</span>
                      <CheckCircle2 size={16} className="text-green-500" />
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="mt-12 flex items-center justify-between">
                <button 
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className={`flex items-center gap-2 text-white/50 hover:text-white transition-all ${currentStep === 0 ? 'invisible' : ''}`}
                >
                  <ArrowLeft size={20} />
                  Back
                </button>
                <button 
                  onClick={nextStep}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-brand-indigo to-brand-indigoLight text-white font-bold btn-shimmer shadow-lg shadow-brand-indigo/20 hover:translate-y-[-2px] transition-all"
                >
                  {currentStep === steps.length - 1 ? 'Complete Profile' : 'Next Step'}
                  <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </ProtectedRoute>
  )
}
