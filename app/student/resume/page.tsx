'use client'
import React, { useState } from 'react'
import {
  FileText, Sparkles, Download, Copy, Save, CheckCircle2, AlertCircle,
  MoreHorizontal, SlidersHorizontal, ArrowRight, Wand2, RefreshCcw
} from 'lucide-react'
import { useStudentData } from '@/components/providers/StudentDataProvider'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAIGeneration } from '@/hooks/useAIGeneration'
import { ResumeService } from '@/lib/ai/gemini/services'
import { calculateProfileStrength } from '@/lib/utils/profileStrength'

const TABS = ['Editor', 'AI Review', 'Templates']

export default function ResumePage() {
  const { profile, documents } = useStudentData()
  const [activeTab, setActiveTab] = useState('Editor')

  const { data: resumeSectionsData, setData: setResumeSections, isGenerating, generate } = useAIGeneration<any>()
  const resumeSections = resumeSectionsData?.sections || []

  const handleGenerate = async () => {
    if (!profile) return
    const profileEngine = calculateProfileStrength(profile, documents || [])
    const aiContext = {
      studentProfile: profile,
      profileStrength: profileEngine.percentage,
      missingFields: profileEngine.missingFields,
    }
    await generate(() => ResumeService.generateResume(aiContext, 'Professional Resume'))
  }

  const handleCopy = () => {
    const text = resumeSections.map((s: any) => `${s.heading}\n${s.content}`).join('\n\n')
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard')
  }

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="font-sans flex flex-col gap-[16px] h-full max-h-[calc(100vh-100px)]">

        {/* ── SUB-NAV ───────────────────────────────────── */}
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-[4px] overflow-x-auto no-scrollbar">
            {TABS.map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`px-[16px] h-[34px] rounded-[8px] text-[13px] font-medium whitespace-nowrap transition-colors ${
                  activeTab === t ? 'bg-[#F3F4F6] text-[#111827]' : 'text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]'
                }`}>{t}</button>
            ))}
          </div>
          <div className="flex items-center gap-[8px] shrink-0 ml-[12px]">
            <button onClick={handleGenerate} className="flex items-center gap-[6px] px-[14px] h-[34px] rounded-[8px] border border-[#E5E7EB] text-[13px] font-medium text-[#374151] bg-white hover:bg-[#F3F4F6] transition-colors">
              <Sparkles size={14} strokeWidth={1.8} className="text-[#4F6BFF]" />Auto Generate
            </button>
            <button onClick={handleCopy} className="flex items-center gap-[6px] px-[14px] h-[34px] rounded-[8px] border border-[#E5E7EB] text-[13px] font-medium text-[#374151] bg-white hover:bg-[#F3F4F6] transition-colors">
              <Copy size={14} strokeWidth={1.8} />Copy Text
            </button>
            <button className="flex items-center gap-[6px] px-[16px] h-[34px] rounded-[8px] bg-[#4F6BFF] text-white text-[13px] font-semibold hover:bg-[#3D56E0] transition-colors">
              <Download size={14} strokeWidth={2} />Export PDF
            </button>
          </div>
        </div>

        {/* ── WORKSPACE ─────────────────────────────────── */}
        <div className="flex-1 flex gap-[16px] min-h-0">
          
          {/* EDITOR COLUMN */}
          <div className="w-[40%] bg-white border border-[#E5E7EB] rounded-[12px] flex flex-col overflow-hidden">
            <div className="px-[20px] py-[14px] border-b border-[#E5E7EB] flex items-center justify-between bg-[#F9FAFB] shrink-0">
              <span className="text-[15px] font-semibold text-[#111827]">Content Editor</span>
              <button className="text-[#D1D5DB] hover:text-[#9CA3AF]">
                <MoreHorizontal size={16} strokeWidth={1.5} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-[20px] flex flex-col gap-[20px]">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-[48px] text-center">
                  <div className="w-[48px] h-[48px] bg-[#EEF2FF] rounded-[12px] flex items-center justify-center mb-[16px]">
                    <Wand2 size={24} className="text-[#4F6BFF] animate-pulse" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-[16px] font-semibold text-[#111827] mb-[8px]">Crafting Your Resume</h3>
                  <p className="text-[13px] text-[#6B7280]">AI is analyzing your profile to generate professional content.</p>
                </div>
              ) : resumeSections.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-[48px] text-center border-2 border-dashed border-[#E5E7EB] rounded-[12px] bg-[#F9FAFB]">
                  <FileText size={32} className="text-[#D1D5DB] mb-[12px]" strokeWidth={1.5} />
                  <p className="text-[14px] font-medium text-[#374151] mb-[4px]">No content yet</p>
                  <p className="text-[13px] text-[#6B7280] mb-[16px]">Generate a resume using your profile data.</p>
                  <button onClick={handleGenerate} className="px-[16px] h-[34px] bg-[#4F6BFF] text-white rounded-[8px] text-[13px] font-semibold hover:bg-[#3D56E0] transition-colors">
                    Generate Now
                  </button>
                </div>
              ) : (
                resumeSections.map((sec: any, i: number) => (
                  <div key={i} className="flex flex-col gap-[8px]">
                    <input 
                      type="text" 
                      value={sec.heading}
                      onChange={(e) => {
                        const newSecs = [...resumeSections]
                        newSecs[i].heading = e.target.value
                        setResumeSections({ sections: newSecs })
                      }}
                      className="w-full text-[14px] font-semibold text-[#111827] bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                    />
                    <textarea 
                      value={sec.content}
                      onChange={(e) => {
                        const newSecs = [...resumeSections]
                        newSecs[i].content = e.target.value
                        setResumeSections({ sections: newSecs })
                      }}
                      className="w-full min-h-[100px] text-[13px] text-[#374151] bg-[#F9FAFB] border border-[#E5E7EB] rounded-[8px] p-[12px] focus:outline-none focus:border-[#4F6BFF] focus:bg-white transition-colors resize-y leading-relaxed"
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* PREVIEW COLUMN */}
          <div className="flex-1 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[12px] flex flex-col overflow-hidden relative items-center py-[32px] overflow-y-auto">
            {/* A4 Paper Mock */}
            <div className="w-[80%] max-w-[800px] min-h-[1000px] bg-white shadow-sm border border-[#E5E7EB] p-[48px] shrink-0 font-serif">
              <div className="text-center mb-[32px] border-b border-[#E5E7EB] pb-[16px]">
                <h1 className="text-[28px] font-bold text-[#111827] mb-[4px] font-sans tracking-tight">
                  {profile?.fullName || 'Your Name'}
                </h1>
                <p className="text-[13px] text-[#6B7280] font-sans flex items-center justify-center gap-[12px]">
                  <span>{profile?.email || 'email@example.com'}</span>
                  <span>•</span>
                  <span>{profile?.phone || '+1 234 567 8900'}</span>
                  <span>•</span>
                  <span>{profile?.address || 'City, Country'}</span>
                </p>
              </div>

              {resumeSections.length === 0 ? (
                <div className="text-[#D1D5DB] text-center mt-[100px] text-[14px] font-sans">
                  Preview will appear here
                </div>
              ) : (
                <div className="flex flex-col gap-[24px]">
                  {resumeSections.map((sec: any, i: number) => (
                    <div key={i}>
                      <h2 className="text-[14px] font-bold text-[#111827] uppercase tracking-wider mb-[8px] border-b border-[#E5E7EB] pb-[4px] font-sans">
                        {sec.heading}
                      </h2>
                      <div className="text-[13px] text-[#374151] leading-relaxed whitespace-pre-wrap font-sans">
                        {sec.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </ProtectedRoute>
  )
}
