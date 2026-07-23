'use client'
import React, { useState, useMemo } from 'react'
import {
  User, Mail, Phone, Calendar, Globe, Building2, BookOpen, MapPin,
  CheckCircle2, ShieldCheck, Download, SlidersHorizontal, ChevronDown, MoreHorizontal,
  Upload, Sparkles, X, Check
} from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/hooks/useAuth'
import { useStudentData } from '@/components/providers/StudentDataProvider'
import { calculateProfileStrength } from '@/lib/utils/profileStrength'
import SegmentedTabs from '@/components/ui/SegmentedTabs'
import { useToast } from '@/hooks/useToast'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'

const TABS = ['Identity', 'Academic', 'Entrance Exams', 'Preferences']

export default function ProfilePage() {
  const { user } = useAuth()
  const { profile, documents, uniqueApps, selectedOffers } = useStudentData()
  const [activeTab, setActiveTab] = useState('Identity')
  const { toast } = useToast()

  // Inline Editing State
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)

  const strength = useMemo(() => {
    if (!profile) return 0
    return calculateProfileStrength(profile, documents || []).percentage
  }, [profile, documents])

  if (!profile) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-[36px] h-[36px] border-4 border-[#EAECF0] border-t-[#4F6BFF] rounded-full animate-spin" />
    </div>
  )

  const docValues = Object.values(documents || {})
  const verifiedDocs = docValues.filter((d: any) => d.status === 'verified').length

  const identityFields = [
    { key: 'fullName', label: 'Full Name', value: profile.fullName || user?.displayName || 'Not Set' },
    { key: 'email', label: 'Email Address', value: user?.email || 'Not Set', readonly: true },
    { key: 'phone', label: 'Phone Number', value: profile.phone || 'Not Set' },
    { key: 'dob', label: 'Date of Birth', value: profile.dob || 'Not Set' },
    { key: 'category', label: 'Category', value: profile.category || 'General' },
    { key: 'nationality', label: 'Nationality', value: profile.nationality || 'Indian' },
    { key: 'address', label: 'Address', value: profile.address || 'Not Set' },
    { key: 'guardianName', label: 'Guardian Name', value: profile.guardianName || 'Not Set' },
    { key: 'guardianPhone', label: 'Guardian Phone', value: profile.guardianPhone || 'Not Set' },
  ]

  const academicFields = [
    { key: 'tenthBoard', label: '10th Board', value: profile.tenthBoard || 'CBSE' },
    { key: 'tenthYear', label: '10th Year', value: profile.tenthYear || '2020' },
    { key: 'tenthScore', label: '10th Score (%)', value: profile.tenthScore ? `${profile.tenthScore}%` : 'Not Set' },
    { key: 'twelfthBoard', label: '12th Board', value: profile.twelfthBoard || 'CBSE' },
    { key: 'twelfthYear', label: '12th Year', value: profile.twelfthYear || '2022' },
    { key: 'twelfthScore', label: '12th Score (%)', value: profile.twelfthScore ? `${profile.twelfthScore}%` : 'Not Set' },
    { key: 'bachelorDegree', label: 'Bachelor Degree', value: profile.bachelorDegree || 'Not Set' },
    { key: 'bachelorCgpa', label: 'Bachelor CGPA', value: profile.bachelorCgpa || 'Not Set' },
    { key: 'bachelorYear', label: 'Bachelor Year', value: profile.bachelorYear || 'Not Set' },
  ]

  const examFields = [
    { key: 'jeeScore', label: 'JEE Main Score/Percentile', value: profile.jeeScore || 'Not Set' },
    { key: 'cuetScore', label: 'CUET Score', value: profile.cuetScore || 'Not Set' },
    { key: 'neetScore', label: 'NEET Score', value: profile.neetScore || 'Not Set' },
    { key: 'gateScore', label: 'GATE Score', value: profile.gateScore || 'Not Set' },
    { key: 'catPercentile', label: 'CAT Percentile', value: profile.catPercentile || 'Not Set' },
  ]

  const preferenceFields = [
    { key: 'targetDegree', label: 'Target Degree', value: profile.targetDegree || 'B.Tech' },
    { key: 'targetLocation', label: 'Preferred State/Location', value: profile.targetLocation || 'All India' },
    { key: 'maxBudget', label: 'Max Annual Tuition Budget', value: profile.maxBudget || '₹5.0 Lakhs' },
  ]

  const displayData =
    activeTab === 'Identity' ? identityFields :
    activeTab === 'Academic' ? academicFields :
    activeTab === 'Entrance Exams' ? examFields : preferenceFields

  const handleStartEdit = (key: string, currentVal: string) => {
    setEditingKey(key)
    setEditValue(currentVal === 'Not Set' ? '' : currentVal)
  }

  const handleSaveField = async (key: string) => {
    if (!user) return
    setSaving(true)
    try {
      const docRef = doc(db, 'student_profiles', user.uid)
      await updateDoc(docRef, {
        [key]: editValue,
        updatedAt: serverTimestamp(),
      })
      toast.success('Field updated successfully!')
      setEditingKey(null)
    } catch (err) {
      toast.error('Failed to update field.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="font-sans flex flex-col gap-[20px]">

        {/* ── SUB-NAV: profile section tabs only ─────────── */}
        <SegmentedTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

        {/* ── STAT CARDS ────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[16px]">
          {[
            { label: 'Profile Strength', value: `${strength}%`, sub: 'AI Completion Score', color: strength > 80 ? '#059669' : '#D97706' },
            { label: 'Docs Verified',    value: verifiedDocs,   sub: `Out of ${docValues.length}`, color: '#059669' },
            { label: 'Applications',     value: uniqueApps?.length || 0, sub: 'Active' },
            { label: 'Offers',           value: selectedOffers?.length || 0, sub: 'Received', color: '#4F6BFF' },
          ].map((c, i) => (
            <div key={i} className="bg-white border border-[#EAECF0] rounded-[14px] p-[20px]">
              <div className="flex items-start justify-between mb-[10px]">
                <span className="text-[14px] text-[#6B7280]">{c.label}</span>
              </div>
              <div className="text-[28px] font-bold text-[#111827] leading-none mb-[6px]" style={{ color: c.color || '#111827' }}>{c.value}</div>
              <span className="text-[12px] text-[#9CA3AF]">{c.sub}</span>
            </div>
          ))}
        </div>

        {/* ── PROFILE HERO ─ */}
        <div className="bg-white border border-[#EAECF0] rounded-[14px] p-[20px] flex flex-col md:flex-row items-center gap-[24px]">
          <div className="w-[80px] h-[80px] rounded-full border border-[#EAECF0] bg-[#F9FAFB] flex items-center justify-center shrink-0 overflow-hidden relative">
            {profile.profilePhotoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.profilePhotoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User size={32} className="text-[#9CA3AF]" strokeWidth={1.5} />
            )}
            <button className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity" aria-label="Upload photo">
              <Upload size={16} className="text-white" strokeWidth={2} />
            </button>
          </div>

          <div className="flex-1 flex flex-col gap-[6px] text-center md:text-left">
            <h2 className="text-[20px] font-semibold text-[#111827]">{profile.fullName || user?.displayName || 'Student Profile'}</h2>
            <p className="text-[13px] text-[#6B7280]">{user?.email}</p>
            <div className="flex items-center justify-center md:justify-start gap-[12px] mt-[4px]">
              <div className="flex items-center gap-[4px] bg-[#EEF2FF] text-[#4F6BFF] px-[8px] py-[2px] rounded-full text-[12px] font-semibold">
                <Sparkles size={12} strokeWidth={2} />
                Profile Engine Active
              </div>
              <div className="flex items-center gap-[4px] bg-[#F3F4F6] text-[#6B7280] px-[8px] py-[2px] rounded-full text-[12px] font-medium">
                {profile.entranceExam || 'B.Tech Aspiring'}
              </div>
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-center md:items-end gap-[8px]">
            <span className="text-[12px] text-[#6B7280]">Profile Completion</span>
            <div className="flex items-center gap-[12px]">
              <div className="w-[120px] h-[6px] bg-[#F3F4F6] rounded-full overflow-hidden">
                <div className="h-full bg-[#059669] rounded-full" style={{ width: `${strength}%` }} />
              </div>
              <span className="text-[15px] font-bold text-[#111827]">{strength}%</span>
            </div>
          </div>
        </div>

        {/* ── DATA GRID ─────────────────────────────────── */}
        <div className="bg-white border border-[#EAECF0] rounded-[14px] overflow-hidden">
          <div className="flex items-center justify-between px-[20px] py-[14px] border-b border-[#EAECF0]">
            <span className="text-[15px] font-semibold text-[#111827]">{activeTab} Details</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-[#E5E7EB]">
            {displayData.map((f, i) => (
              <div key={i} className="bg-white p-[20px] flex flex-col gap-[6px] hover:bg-[#F9FAFB] transition-colors group">
                <p className="text-[12px] font-medium text-[#9CA3AF] uppercase tracking-[0.04em]">{f.label}</p>

                {editingKey === f.key ? (
                  <div className="flex items-center gap-[8px] mt-[4px]">
                    <input
                      type="text"
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      className="flex-1 h-[32px] px-[10px] bg-[#F9FAFB] border border-[#4F6BFF] rounded-[6px] text-[13px] text-[#111827] focus:outline-none"
                    />
                    <button
                      onClick={() => handleSaveField(f.key)}
                      disabled={saving}
                      className="w-[32px] h-[32px] rounded-[6px] bg-[#059669] text-white flex items-center justify-center hover:bg-[#047857] transition-colors disabled:opacity-50"
                      aria-label="Save field"
                    >
                      <Check size={14} strokeWidth={2} />
                    </button>
                    <button
                      onClick={() => setEditingKey(null)}
                      className="w-[32px] h-[32px] rounded-[6px] border border-[#EAECF0] text-[#6B7280] flex items-center justify-center hover:bg-[#F3F4F6] transition-colors"
                      aria-label="Cancel editing"
                    >
                      <X size={14} strokeWidth={2} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between min-h-[32px]">
                    <p className="text-[14px] font-medium text-[#111827]">{f.value}</p>
                    {!(f as any).readonly && (
                      <button
                        onClick={() => handleStartEdit(f.key, f.value)}
                        className="opacity-0 group-hover:opacity-100 text-[#4F6BFF] text-[12px] font-medium hover:underline transition-opacity"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </ProtectedRoute>
  )
}
