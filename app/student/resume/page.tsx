'use client'
import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Sparkles, Download, Copy, CheckCircle2,
  Wand2, Plus, ChevronRight, Zap, RefreshCcw,
  User, GraduationCap, Briefcase, Code, Award
} from 'lucide-react'
import { useStudentData } from '@/components/providers/StudentDataProvider'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAIGeneration } from '@/hooks/useAIGeneration'
import { ResumeService } from '@/lib/ai/gemini/services'
import { calculateProfileStrength } from '@/lib/utils/profileStrength'
import { useToast } from '@/hooks/useToast'

// ─── Score Ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score, size = 72, strokeWidth = 5, color, label }: {
  score: number; size?: number; strokeWidth?: number; color: string; label: string
}) {
  const r = (size - strokeWidth) / 2
  const c = 2 * Math.PI * r
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F3F4F6" strokeWidth={strokeWidth} />
          <motion.circle
            cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: c - (score / 100) * c }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[17px] font-bold text-foreground leading-none">{score}</span>
          <span className="text-[8px] text-muted-foreground uppercase tracking-wide">/ 100</span>
        </div>
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
  )
}

// ─── Section Checklist Item ───────────────────────────────────────────────────
function CheckItem({ label, icon: Icon, done }: { label: string; icon: any; done: boolean }) {
  return (
    <div className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all ${
      done ? 'bg-[#F0FDF4] border border-[#BBF7D0]' : 'bg-muted border border-border'
    }`}>
      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
        done ? 'bg-[#10B981] text-white' : 'border border-[#D1D5DB] text-[#D1D5DB]'
      }`}>
        {done ? <CheckCircle2 size={11} /> : <Icon size={10} />}
      </div>
      <span className={`text-[12px] font-medium truncate ${done ? 'text-[#059669]' : 'text-muted-foreground'}`}>
        {label}
      </span>
    </div>
  )
}

// ─── AI Suggestion Card ───────────────────────────────────────────────────────
function SuggestionCard({ text, action }: { text: string; action: string }) {
  return (
    <div className="group flex items-start gap-2.5 p-3 rounded-xl bg-[#F5F7FF] border border-[#E0E7FF] hover:border-[#C7D2FE] hover:bg-primary/10 transition-all cursor-pointer">
      <div className="w-5 h-5 rounded-md bg-primary/10 border border-[#C7D2FE] text-[#4F6BFF] flex items-center justify-center shrink-0 mt-0.5">
        <Zap size={10} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-muted-foreground leading-relaxed">{text}</p>
        <button className="text-[10px] text-[#4F6BFF] font-semibold mt-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {action} <ChevronRight size={9} />
        </button>
      </div>
    </div>
  )
}

const TEMPLATES = [
  { name: 'Professional', desc: 'Clean, ATS-optimized', color: '#4F6BFF', popular: true },
  { name: 'Modern', desc: 'Two-column layout', color: '#8B5CF6', popular: false },
  { name: 'Minimal', desc: 'Typography-forward', color: '#10B981', popular: false },
]

export default function ResumePage() {
  const { profile, documents } = useStudentData()
  const [activeTab, setActiveTab] = useState<'editor' | 'templates'>('editor')
  const [selectedTemplate, setSelectedTemplate] = useState('Professional')

  const { data: resumeSectionsData, setData: setResumeSections, isGenerating, generate } = useAIGeneration<any>()
  const resumeSections = resumeSectionsData?.sections || []
  const { toast } = useToast()

  const profileEngine = useMemo(
    () => calculateProfileStrength(profile, documents || []),
    [profile, documents]
  )

  const atsScore = Math.min(100, Math.round(profileEngine.percentage * 0.85 + (resumeSections.length > 0 ? 15 : 0)))
  const qualityScore = resumeSections.length > 0 ? Math.min(100, atsScore + 5) : 0

  const sectionChecklist = [
    { label: 'Contact Info', icon: User, done: !!(profile?.email || profile?.phone) },
    { label: 'Education', icon: GraduationCap, done: !!(profile?.education?.length) },
    { label: 'Experience', icon: Briefcase, done: !!(profile?.experience?.length) },
    { label: 'Skills', icon: Code, done: !!(profile?.skills?.length) },
    { label: 'Achievements', icon: Award, done: !!(profile?.achievements?.length) },
    { label: 'AI Summary', icon: FileText, done: resumeSections.length > 0 },
  ]
  const completedSections = sectionChecklist.filter(s => s.done).length

  const handleGenerate = async () => {
    if (!profile) return
    await generate(() => ResumeService.generateResume({
      studentProfile: profile,
      profileStrength: profileEngine.percentage,
      missingFields: profileEngine.missingFields,
    }, 'Professional Resume'))
  }

  const handleCopy = () => {
    const text = resumeSections.map((s: any) => `${s.heading}\n${s.content}`).join('\n\n')
    navigator.clipboard.writeText(text)
      .then(() => toast.success('Resume copied to clipboard!'))
      .catch(() => toast.error('Failed to copy.'))
  }

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="flex flex-col gap-5">

        {/* ── PAGE HEADER ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 border border-[#C7D2FE] rounded-[12px] flex items-center justify-center text-[#4F6BFF] shrink-0">
              <FileText size={17} strokeWidth={1.8} />
            </div>
            <div>
              <h1 className="text-[18px] font-semibold text-foreground tracking-tight leading-none">Resume Builder</h1>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4F6BFF] animate-pulse" />
                <span className="text-[11px] text-muted-foreground font-medium">Powered by EDUING AI</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleCopy} disabled={resumeSections.length === 0}
              className="hidden sm:flex items-center gap-1.5 px-3 h-[34px] rounded-[8px] border border-border text-[12px] font-medium text-foreground bg-card hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              <Copy size={12} /> Copy
            </button>
            <button onClick={handleGenerate} disabled={isGenerating}
              className="flex items-center gap-1.5 px-4 h-[34px] rounded-[8px] bg-[#4F6BFF] hover:bg-[#3D56E0] text-white text-[12px] font-semibold transition-colors disabled:opacity-60 shadow-sm">
              {isGenerating ? <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" /> : <Sparkles size={12} />}
              {isGenerating ? 'Generating…' : 'Auto Generate'}
            </button>
            <button className="flex items-center gap-1.5 px-4 h-[34px] rounded-[8px] bg-card border border-border text-[12px] font-semibold text-foreground hover:bg-muted transition-colors">
              <Download size={12} /> Export PDF
            </button>
          </div>
        </div>

        {/* ── THREE-PANEL WORKSPACE ──────────────────────────────── */}
        {/* Height = 100vh - topbar(72) - portal padding(64) - page header(80) - gap(20) ≈ 100vh - 236px */}
        <div className="flex gap-4" style={{ height: 'calc(100vh - 240px)', minHeight: 560 }}>

          {/* LEFT: Intelligence Panel */}
          <div className="w-[256px] shrink-0 bg-card border border-border rounded-[16px] flex flex-col overflow-hidden shadow-sm">

            {/* Scores */}
            <div className="p-5 border-b border-border">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-4">Resume Intelligence</p>
              <div className="flex items-center justify-around mb-4">
                <ScoreRing score={atsScore} size={68} strokeWidth={5} color="#4F6BFF" label="ATS Score" />
                <ScoreRing score={qualityScore} size={68} strokeWidth={5} color="#10B981" label="Quality" />
              </div>
              {/* Profile bar */}
              <div className="bg-muted border border-border rounded-xl p-3">
                <div className="flex justify-between mb-1.5">
                  <span className="text-[11px] text-muted-foreground font-medium">Profile Strength</span>
                  <span className="text-[11px] font-bold text-foreground">{profileEngine.percentage}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-secondary/80 overflow-hidden">
                  <motion.div className="h-full rounded-full bg-gradient-to-r from-[#4F6BFF] to-[#8B5CF6]"
                    initial={{ width: 0 }}
                    animate={{ width: `${profileEngine.percentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5">{completedSections}/6 sections ready</p>
              </div>
            </div>

            {/* Checklist */}
            <div className="p-5 border-b border-border">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Sections</p>
              <div className="flex flex-col gap-1.5">
                {sectionChecklist.map(item => <CheckItem key={item.label} {...item} />)}
              </div>
            </div>

            {/* AI Suggestions */}
            <div className="p-5 flex-1 overflow-y-auto">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                <Sparkles size={9} className="text-[#4F6BFF]" /> AI Suggestions
              </p>
              <div className="flex flex-col gap-2">
                <SuggestionCard text="Add measurable achievements to boost ATS score by ~12%." action="Auto-improve" />
                <SuggestionCard text="Skills section is missing. Add technical skills to increase match rate." action="Add skills" />
                <SuggestionCard text='Use action verbs like "Led", "Built", "Achieved" for stronger impact.' action="Learn more" />
              </div>
            </div>
          </div>

          {/* CENTER: Editor */}
          <div className="flex-1 min-w-0 bg-card border border-border rounded-[16px] flex flex-col overflow-hidden shadow-sm">

            {/* Tab bar */}
            <div className="h-11 flex items-center gap-1 px-4 border-b border-border shrink-0 bg-muted">
              {(['editor', 'templates'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`relative px-3 h-8 text-[12px] font-medium rounded-lg capitalize transition-all ${
                    activeTab === tab ? 'bg-card text-foreground shadow-sm border border-[#E5E7EB]' : 'text-muted-foreground hover:text-foreground hover:bg-card/60'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <AnimatePresence mode="wait">

                {/* Editor tab */}
                {activeTab === 'editor' && (
                  <motion.div key="editor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">

                    {/* Generating */}
                    {isGenerating && (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-5">
                          <Wand2 size={26} className="text-[#4F6BFF] animate-pulse" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-[16px] font-semibold text-foreground mb-2">Crafting your resume</h3>
                        <p className="text-[13px] text-muted-foreground max-w-xs">AI is analyzing your profile and generating professional content.</p>
                      </div>
                    )}

                    {/* Empty state */}
                    {!isGenerating && resumeSections.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-5 border border-[#C7D2FE]">
                          <FileText size={30} className="text-[#4F6BFF]" strokeWidth={1.2} />
                        </div>
                        <h3 className="text-[16px] font-semibold text-foreground mb-2">Your resume starts here</h3>
                        <p className="text-[13px] text-muted-foreground max-w-sm leading-relaxed mb-6">
                          EDUING AI will generate an ATS-optimized resume from your profile data in seconds.
                        </p>
                        <button onClick={handleGenerate}
                          className="flex items-center gap-2 px-5 h-9 rounded-[10px] bg-[#4F6BFF] hover:bg-[#3D56E0] text-white text-[13px] font-semibold transition-colors shadow-sm">
                          <Sparkles size={13} /> Generate with AI
                        </button>
                        <p className="text-[11px] text-muted-foreground mt-3">Based on your {profileEngine.percentage}% profile</p>
                      </div>
                    )}

                    {/* Sections */}
                    {!isGenerating && resumeSections.length > 0 && (
                      <div className="flex flex-col gap-4">
                        {resumeSections.map((sec: any, i: number) => (
                          <motion.div key={i}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="group border border-[#E5E7EB] rounded-[12px] overflow-hidden hover:border-[#C7D2FE] transition-all"
                          >
                            {/* Section heading bar */}
                            <div className="flex items-center justify-between px-4 py-2.5 bg-muted border-b border-[#E5E7EB]">
                              <input type="text" value={sec.heading}
                                onChange={(e) => {
                                  const s = [...resumeSections]; s[i].heading = e.target.value
                                  setResumeSections({ sections: s })
                                }}
                                className="bg-transparent text-[11px] font-bold text-foreground border-none focus:outline-none uppercase tracking-widest flex-1 min-w-0"
                              />
                              <button className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 text-muted-foreground hover:text-[#4F6BFF]">
                                <RefreshCcw size={11} />
                              </button>
                            </div>
                            {/* Content textarea — slightly tinted for editor feel */}
                            <textarea value={String(sec.content ?? '')}
                              onChange={(e) => {
                                const s = [...resumeSections]; s[i].content = e.target.value
                                setResumeSections({ sections: s })
                              }}
                              className="w-full text-[13px] text-foreground bg-card p-4 focus:outline-none focus:bg-[#FAFBFF] transition-colors resize-none leading-relaxed"
                              style={{ minHeight: 100, height: `${Math.max(100, String(sec.content ?? '').split('\n').length * 22 + 40)}px` }}
                              placeholder="Start writing…"
                            />
                          </motion.div>
                        ))}
                        <button className="flex items-center justify-center gap-2 py-3 rounded-[12px] border-2 border-dashed border-[#E5E7EB] text-[12px] text-muted-foreground hover:text-[#4F6BFF] hover:border-[#C7D2FE] hover:bg-[#F5F7FF] transition-all">
                          <Plus size={13} /> Add Section
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Templates tab */}
                {activeTab === 'templates' && (
                  <motion.div key="templates" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-3">
                    <p className="text-[12px] text-muted-foreground">Choose a template to style your PDF export</p>
                    {TEMPLATES.map(tpl => (
                      <button key={tpl.name} onClick={() => setSelectedTemplate(tpl.name)}
                        className={`flex items-center gap-4 p-4 rounded-[12px] border text-left transition-all ${
                          selectedTemplate === tpl.name
                            ? 'border-[#4F6BFF] bg-[#F5F7FF]'
                            : 'border-border bg-card hover:border-[#C7D2FE] hover:bg-muted'
                        }`}
                      >
                        <div className="w-14 h-18 rounded-lg overflow-hidden shrink-0 border border-[#E5E7EB]" style={{ background: `${tpl.color}08`, height: 72 }}>
                          <div className="p-2 flex flex-col gap-1.5">
                            <div className="h-1.5 rounded-full" style={{ background: tpl.color, width: '60%' }} />
                            <div className="h-1 rounded-full bg-secondary/80 w-full" />
                            <div className="h-1 rounded-full bg-secondary/80 w-4/5" />
                            <div className="h-1 rounded-full bg-secondary/80 w-full mt-1" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[13px] font-semibold text-foreground">{tpl.name}</span>
                            {tpl.popular && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">POPULAR</span>}
                          </div>
                          <p className="text-[12px] text-muted-foreground">{tpl.desc}</p>
                        </div>
                        {selectedTemplate === tpl.name && <CheckCircle2 size={16} className="text-[#4F6BFF] shrink-0" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* RIGHT: Live Preview */}
          <div className="w-[340px] shrink-0 bg-card border border-border rounded-[16px] flex flex-col overflow-hidden shadow-sm">
            <div className="h-11 flex items-center justify-between px-4 border-b border-border bg-muted shrink-0">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Live Preview</span>
              <span className="text-[10px] text-muted-foreground">{selectedTemplate}</span>
            </div>
            {/* A4-style preview */}
            <div className="flex-1 overflow-y-auto p-4 bg-secondary flex justify-center">
              <div className="w-full max-w-[300px] min-h-[400px] bg-card shadow border border-[#E5E7EB] p-6 font-sans shrink-0">
                <div className="text-center mb-4 border-b border-[#E5E7EB] pb-3">
                  <h1 className="text-[15px] font-bold text-foreground mb-1">{profile?.fullName || 'Your Name'}</h1>
                  <p className="text-[8px] text-muted-foreground flex items-center justify-center gap-1.5 flex-wrap">
                    <span>{profile?.email || 'email@example.com'}</span>
                    {profile?.phone && <><span>·</span><span>{profile.phone}</span></>}
                  </p>
                </div>
                {resumeSections.length === 0 ? (
                  <p className="text-[9px] text-[#D1D5DB] text-center mt-8">Preview will appear here</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {resumeSections.map((sec: any, i: number) => (
                      <div key={i}>
                        <h2 className="text-[7px] font-black text-foreground uppercase tracking-[0.12em] border-b border-[#E5E7EB] pb-1 mb-1.5">{sec.heading}</h2>
                        <p className="text-[7px] text-muted-foreground leading-[1.6] whitespace-pre-wrap">{sec.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </ProtectedRoute>
  )
}
