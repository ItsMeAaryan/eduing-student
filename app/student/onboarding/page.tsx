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
import { Card, Button, H2, H4, Body, Small, Caption, Badge } from '@/components/ui/design-system'
import { useToast } from '@/hooks/useToast'

const steps = [
  { id: 'personal', title: 'Personal', icon: User },
  { id: 'academic', title: 'Academic', icon: GraduationCap },
  { id: 'exams', title: 'Exams', icon: ClipboardList },
  { id: 'documents', title: 'Documents', icon: FileUp },
  { id: 'review', title: 'Review', icon: CheckCircle2 },
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<any>(() => {
    // Try to restore from localStorage so progress isn't lost on refresh
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('eduing_onboarding_draft')
        if (saved) return JSON.parse(saved)
      } catch {}
    }
    return {
      personal: { fullName: '', dob: '', gender: '', phone: '', state: '', city: '', address: '' },
      academic: { school10: '', board10: '', marks10: '', year10: '', school12: '', board12: '', marks12: '', year12: '', stream: '' },
      exams: { jeeMain: '', cuet: '', neet: '', bitSat: '' },
      documents: { photo: true, marksheet10: true, marksheet12: true, idProof: true }
    }
  })
  const router = useRouter()
  const { toast } = useToast()

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
          // Clear localStorage draft on success
          localStorage.removeItem('eduing_onboarding_draft')
          toast.success('Profile saved successfully!')
          router.push('/student/dashboard')
        } catch (err) {
          toast.error('Failed to save profile. Please try again.')
        }
      }
    }
  }

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1)
  }

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="min-h-screen bg-background text-text-primary py-48 px-24">
        <div className="max-w-[800px] mx-auto flex flex-col items-center">
          <div className="mb-48">
            <Logo height={40} />
          </div>

          {/* Progress Bar */}
          <div className="w-full mb-48">
            <div className="flex justify-between mb-16">
              {steps.map((step, i) => (
                <div key={step.id} className={`flex flex-col items-center gap-8 ${i <= currentStep ? 'text-primary' : 'text-text-secondary'}`}>
                  <div className={`w-[40px] h-[40px] rounded-full flex items-center justify-center border-2 transition-all ${
                    i < currentStep ? 'bg-primary border-primary text-white' : 
                    i === currentStep ? 'border-primary text-primary' : 'border-border text-text-secondary bg-hover'
                  }`}>
                    {i < currentStep ? <CheckCircle2 size={20} /> : <step.icon size={20} />}
                  </div>
                  <Caption className="font-bold uppercase tracking-widest">{step.title}</Caption>
                </div>
              ))}
            </div>
            <div className="h-[4px] w-full bg-border rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                className="h-full bg-primary"
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
              className="w-full max-w-[600px]"
            >
              <Card className="!p-32 md:!p-48 relative overflow-hidden">
                <div className="flex justify-between items-start mb-32">
                  <div>
                    <H2 className="mb-4">{steps[currentStep].title} Information</H2>
                    <Small className="text-text-secondary">Please fill in your details to complete your profile.</Small>
                  </div>
                  {currentStep < 3 && (
                    <button 
                      onClick={handleAutofill}
                      className="flex items-center gap-8 px-12 py-[6px] rounded-[8px] bg-warning/10 border border-warning/30 text-warning text-[11px] font-bold hover:bg-warning/20 transition-all"
                    >
                      <Wand2 size={14} />
                      🪄 Autofill
                    </button>
                  )}
                </div>

                {/* Step Content */}
                <div className="space-y-24">
                  {currentStep === 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                      <div className="md:col-span-2 flex justify-center mb-16">
                         <div className="w-[96px] h-[96px] rounded-full border-2 border-dashed border-border flex flex-col items-center justify-center text-text-secondary hover:border-primary hover:text-primary transition-all cursor-pointer">
                           <User size={32} />
                           <Caption className="font-bold mt-4 uppercase">Photo</Caption>
                         </div>
                      </div>
                      <div className="md:col-span-2">
                        <label htmlFor="onb-fullname" className="block text-caption font-bold text-text-secondary mb-8 uppercase tracking-widest">Full Name</label>
                        <input id="onb-fullname" value={formData.personal.fullName} onChange={e => setFormData({...formData, personal: {...formData.personal, fullName: e.target.value}})} className="w-full bg-hover border border-border rounded-[12px] px-16 py-12 outline-none focus:border-primary text-text-primary placeholder:text-text-secondary" />
                      </div>
                      <div>
                        <label htmlFor="onb-dob" className="block text-caption font-bold text-text-secondary mb-8 uppercase tracking-widest">DOB</label>
                        <input id="onb-dob" type="date" value={formData.personal.dob} onChange={e => setFormData({...formData, personal: {...formData.personal, dob: e.target.value}})} className="w-full bg-hover border border-border rounded-[12px] px-16 py-12 outline-none focus:border-primary text-text-primary placeholder:text-text-secondary" />
                      </div>
                      <div>
                        <label htmlFor="onb-gender" className="block text-caption font-bold text-text-secondary mb-8 uppercase tracking-widest">Gender</label>
                        <select id="onb-gender" value={formData.personal.gender} onChange={e => setFormData({...formData, personal: {...formData.personal, gender: e.target.value}})} className="w-full bg-hover border border-border rounded-[12px] px-16 py-12 outline-none focus:border-primary text-text-primary placeholder:text-text-secondary">
                          <option value="">Select</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {currentStep === 1 && (
                    <div className="space-y-32">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 p-16 rounded-[16px] bg-hover border border-border">
                        <H4 className="md:col-span-2 text-primary uppercase tracking-wider">10th Standard</H4>
                        <input placeholder="School Name" value={formData.academic.school10} className="md:col-span-2 bg-background border border-border rounded-[12px] px-16 py-12 outline-none text-text-primary placeholder:text-text-secondary" />
                        <input placeholder="Board" value={formData.academic.board10} className="bg-background border border-border rounded-[12px] px-16 py-12 outline-none text-text-primary placeholder:text-text-secondary" />
                        <input placeholder="Percentage" value={formData.academic.marks10} className="bg-background border border-border rounded-[12px] px-16 py-12 outline-none text-text-primary placeholder:text-text-secondary" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 p-16 rounded-[16px] bg-hover border border-border">
                        <H4 className="md:col-span-2 text-primary uppercase tracking-wider">12th Standard</H4>
                        <input placeholder="School Name" value={formData.academic.school12} className="md:col-span-2 bg-background border border-border rounded-[12px] px-16 py-12 outline-none text-text-primary placeholder:text-text-secondary" />
                        <input placeholder="Stream (e.g. Science)" value={formData.academic.stream} className="bg-background border border-border rounded-[12px] px-16 py-12 outline-none text-text-primary placeholder:text-text-secondary" />
                        <input placeholder="Percentage" value={formData.academic.marks12} className="bg-background border border-border rounded-[12px] px-16 py-12 outline-none text-text-primary placeholder:text-text-secondary" />
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-16">
                      {['jeeMain', 'cuet', 'neet', 'bitSat'].map((exam) => (
                        <div key={exam} className="flex items-center gap-16 p-16 rounded-[16px] bg-hover border border-border group hover:border-primary/50 transition-all">
                          <input type="checkbox" checked={!!formData.exams[exam]} className="w-20 h-20 rounded border-border bg-background text-primary focus:ring-primary" />
                          <Small className="flex-1 font-bold uppercase tracking-wider">{exam.replace(/([A-Z])/g, ' $1').trim()}</Small>
                          {formData.exams[exam] !== undefined && (
                            <input placeholder="Score" value={formData.exams[exam]} onChange={e => setFormData({...formData, exams: {...formData.exams, [exam]: e.target.value}})} className="w-[96px] bg-background border border-border rounded-[8px] px-12 py-[6px] text-right outline-none focus:border-primary text-text-primary placeholder:text-text-secondary" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                      {['Photo', '10th Marksheet', '12th Marksheet', 'ID Proof'].map((doc) => (
                        <div key={doc} className="p-24 rounded-[16px] border-2 border-dashed border-success/30 bg-success/10 flex flex-col items-center justify-center text-center">
                          <div className="w-[40px] h-[40px] rounded-full bg-success/20 flex items-center justify-center text-success mb-12">
                            <CheckCircle2 size={24} />
                          </div>
                          <Small className="font-bold text-text-primary mb-4">{doc}</Small>
                          <Caption className="text-success font-bold uppercase">Uploaded</Caption>
                        </div>
                      ))}
                    </div>
                  )}

                  {currentStep === 4 && (
                    <div className="space-y-16">
                      <div className="p-16 rounded-[12px] bg-hover border border-border">
                        <Caption className="font-bold text-text-secondary uppercase mb-8">Personal</Caption>
                        <Body className="font-medium text-text-primary">{formData.personal.fullName} • {formData.personal.gender} • {formData.personal.city}, {formData.personal.state}</Body>
                      </div>
                      <div className="p-16 rounded-[12px] bg-hover border border-border">
                        <Caption className="font-bold text-text-secondary uppercase mb-8">Academic</Caption>
                        <Body className="font-medium text-text-primary">10th: {formData.academic.marks10}% • 12th: {formData.academic.marks12}% ({formData.academic.stream})</Body>
                      </div>
                      <div className="p-16 rounded-[12px] bg-success/10 border border-success/30 flex items-center justify-between">
                        <Caption className="text-success font-bold uppercase">All Documents Verified</Caption>
                        <CheckCircle2 size={16} className="text-success" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="mt-48 flex items-center justify-between">
                  <button 
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className={`flex items-center gap-8 text-text-secondary hover:text-text-primary transition-all ${currentStep === 0 ? 'invisible' : ''}`}
                  >
                    <ArrowLeft size={20} />
                    Back
                  </button>
                  <Button 
                    onClick={nextStep}
                    variant="primary"
                    className="flex items-center gap-8"
                  >
                    {currentStep === steps.length - 1 ? 'Complete Profile' : 'Next Step'}
                    <ArrowRight size={20} />
                  </Button>
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </ProtectedRoute>
  )
}
