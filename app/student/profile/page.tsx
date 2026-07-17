'use client'
import React, { useState, useMemo } from 'react'
import {
  User, Mail, Phone, Calendar, Globe, Building2, BookOpen, MapPin,
  CheckCircle2, ShieldCheck, Download, SlidersHorizontal, ChevronDown, MoreHorizontal,
  Upload, Sparkles
} from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/hooks/useAuth'
import { useStudentData } from '@/components/providers/StudentDataProvider'
import { calculateProfileStrength } from '@/lib/utils/profileStrength'
import SegmentedTabs from '@/components/ui/SegmentedTabs'


const TABS = ['Identity', 'Academic', 'Entrance Exams', 'Preferences']

export default function ProfilePage() {
  const { user } = useAuth()
  const { profile, documents, uniqueApps, selectedOffers } = useStudentData()
  const [activeTab, setActiveTab] = useState('Identity')

  const strength = useMemo(() => {
    if (!profile) return 0
    return calculateProfileStrength(profile, documents || []).percentage
  }, [profile, documents])

  if (!profile) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-[36px] h-[36px] border-4 border-[#E5E7EB] border-t-[#4F6BFF] rounded-full animate-spin" />
    </div>
  )

  const docValues = Object.values(documents || {})
  const verifiedDocs = docValues.filter((d: any) => d.status === 'verified').length

  const fields = [
    { label: 'Full Name', value: profile.fullName || user?.displayName || 'Not Set' },
    { label: 'Email Address', value: user?.email || 'Not Set' },
    { label: 'Phone Number', value: profile.phone || 'Not Set' },
    { label: 'Date of Birth', value: profile.dob || 'Not Set' },
    { label: 'Category', value: profile.category || 'General' },
    { label: 'Nationality', value: profile.nationality || 'Indian' },
    { label: 'Address', value: profile.address || 'Not Set' },
    { label: 'Guardian Name', value: profile.guardianName || 'Not Set' },
    { label: 'Guardian Phone', value: profile.guardianPhone || 'Not Set' },
  ]

  const academics = [
    { label: '10th Board', value: profile.tenthBoard || 'CBSE' },
    { label: '10th Year', value: profile.tenthYear || '2020' },
    { label: '10th Score', value: profile.tenthScore ? `${profile.tenthScore}%` : 'Not Set' },
    { label: '12th Board', value: profile.twelfthBoard || 'CBSE' },
    { label: '12th Year', value: profile.twelfthYear || '2022' },
    { label: '12th Score', value: profile.twelfthScore ? `${profile.twelfthScore}%` : 'Not Set' },
    { label: 'Bachelor Degree', value: profile.bachelorDegree || 'Not Set' },
    { label: 'Bachelor CGPA', value: profile.bachelorCgpa || 'Not Set' },
    { label: 'Bachelor Year', value: profile.bachelorYear || 'Not Set' },
  ]

  const displayData = activeTab === 'Identity' ? fields : academics

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="font-sans flex flex-col gap-[16px]">

        {/* ── SUB-NAV: profile section tabs only ─────────── */}
        <SegmentedTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

        {/* ── STAT CARDS ────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-[16px]">
          {[
            { label: 'Profile Strength', value: `${strength}%`, sub: 'AI Completion Score', color: strength > 80 ? '#059669' : '#D97706' },
            { label: 'Docs Verified',    value: verifiedDocs,   sub: `Out of ${docValues.length}`, color: '#059669' },
            { label: 'Applications',     value: uniqueApps?.length || 0, sub: 'Active' },
            { label: 'Offers',           value: selectedOffers?.length || 0, sub: 'Received', color: '#4F6BFF' },
          ].map((c, i) => (
            <div key={i} className="bg-white border border-[#E5E7EB] rounded-[12px] p-[20px]">
              <div className="flex items-start justify-between mb-[10px]">
                <span className="text-[14px] text-[#6B7280]">{c.label}</span>
                <MoreHorizontal size={16} strokeWidth={1.5} className="text-[#D1D5DB]" />
              </div>
              <div className="text-[28px] font-bold text-[#111827] leading-none mb-[6px]" style={{ color: c.color || '#111827' }}>{c.value}</div>
              <span className="text-[12px] text-[#9CA3AF]">{c.sub}</span>
            </div>
          ))}
        </div>

        {/* ── PROFILE HERO (similar to Chart panel style) ─ */}
        <div className="bg-white border border-[#E5E7EB] rounded-[12px] p-[20px] flex items-center gap-[24px]">
          <div className="w-[80px] h-[80px] rounded-full border border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-center shrink-0 overflow-hidden relative">
            {profile.profilePhotoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.profilePhotoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User size={32} className="text-[#9CA3AF]" strokeWidth={1.5} />
            )}
            <button className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <Upload size={16} className="text-white" strokeWidth={2} />
            </button>
          </div>
          <div className="flex-1 flex flex-col gap-[6px]">
            <h2 className="text-[20px] font-semibold text-[#111827]">{profile.fullName || user?.displayName || 'Student Profile'}</h2>
            <p className="text-[13px] text-[#6B7280]">{user?.email}</p>
            <div className="flex items-center gap-[12px] mt-[4px]">
              <div className="flex items-center gap-[4px] bg-[#EEF2FF] text-[#4F6BFF] px-[8px] py-[2px] rounded-full text-[12px] font-semibold">
                <Sparkles size={12} strokeWidth={2} />
                Profile Engine Active
              </div>
              <div className="flex items-center gap-[4px] bg-[#F3F4F6] text-[#6B7280] px-[8px] py-[2px] rounded-full text-[12px] font-medium">
                {profile.entranceExam || 'B.Tech Aspiring'}
              </div>
            </div>
          </div>
          <div className="shrink-0 flex flex-col items-end gap-[8px]">
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
        <div className="bg-white border border-[#E5E7EB] rounded-[12px] overflow-hidden">
          <div className="flex items-center justify-between px-[20px] py-[14px] border-b border-[#E5E7EB]">
            <span className="text-[15px] font-semibold text-[#111827]">{activeTab} Details</span>
            <div className="flex items-center gap-[8px]">
              <button className="text-[#D1D5DB] hover:text-[#9CA3AF]">
                <MoreHorizontal size={16} strokeWidth={1.5} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-[1px] bg-[#E5E7EB]">
            {displayData.map((f, i) => (
              <div key={i} className="bg-white p-[20px] flex flex-col gap-[6px] hover:bg-[#F9FAFB] transition-colors group">
                <p className="text-[12px] font-medium text-[#9CA3AF] uppercase tracking-[0.04em]">{f.label}</p>
                <div className="flex items-center justify-between">
                  <p className="text-[14px] font-medium text-[#111827]">{f.value}</p>
                  <button className="opacity-0 group-hover:opacity-100 text-[#4F6BFF] text-[12px] font-medium hover:underline">Edit</button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </ProtectedRoute>
  )
}
