'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Building2,
  GraduationCap,
  Award,
  FileText,
  Video,
  Compass,
  Bookmark,
  ChevronRight,
  Zap,
  Flame,
  Target,
  ShieldCheck,
  BarChart3,
  Calendar,
  ExternalLink,
  Plus,
  RefreshCw,
  Send,
  MessageSquare,
  X,
  Check,
  Star,
  Users,
  Search,
  User,
  BookOpen,
  Globe,
  Upload,
} from 'lucide-react'
import { useStudentData } from '@/components/providers/StudentDataProvider'
import Link from 'next/link'
import { generateAdmissionChecklist } from '@/lib/utils/checklistEngine'
import { generateDeadlineInsights } from '@/lib/utils/deadlineEngine'

/* =========================================================================
   STYLING CONSTANTS (STRICTLY FROM DESIGN.md)
   ========================================================================= */
const CARD_STYLE = "bg-card text-card-foreground border border-border rounded-[12px] p-[20px] md:p-[24px] shadow-sm transition-all duration-200"
const BUTTON_PRIMARY = "bg-primary hover:opacity-90 text-primary-foreground font-medium px-[16px] h-[36px] rounded-[8px] text-[13px] inline-flex items-center gap-[6px] transition-all active:scale-[0.98] shadow-sm cursor-pointer select-none"
const BUTTON_SECONDARY = "bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border font-medium px-[14px] h-[36px] rounded-[8px] text-[13px] inline-flex items-center gap-[6px] transition-all active:scale-[0.98] cursor-pointer select-none"
const BUTTON_UTILITY = "bg-background hover:bg-muted text-muted-foreground border border-border font-medium px-[12px] h-[32px] rounded-[8px] text-[12px] inline-flex items-center gap-[4px] transition-colors cursor-pointer"
const STICKER_TEAL = "bg-[#2a9d99]/10 text-[#1e6b68] border border-[#2a9d99]/20"
const STICKER_PURPLE = "bg-[#d6b6f6]/10 text-[#d6b6f6] border border-[#d6b6f6]/20"
const STICKER_ORANGE = "bg-[#dd5b00]/10 text-[#dd5b00] border border-[#dd5b00]/20"
const STICKER_GREEN = "bg-success/10 text-success border border-success/20"
const STICKER_SKY = "bg-primary/10 text-primary border border-primary/20"

/* =========================================================================
   SECTION 0: VERIFICATION STATUS BANNER
   ========================================================================= */
function VerificationStatusBanner({ status }: { status: string }) {
  const config: Record<string, { color: string; icon: React.ElementType; cta?: string; ctaLink?: string; message: string }> = {
    'Profile Incomplete': {
      color: 'bg-[#dd5b00]/10 border-[#dd5b00]/20 text-[#dd5b00]',
      icon: AlertCircle,
      message: 'Your profile is incomplete. Complete it to unlock university recommendations and admission insights.',
      cta: 'Complete Profile',
      ctaLink: '/student/profile',
    },
    'Profile Complete': {
      color: 'bg-primary/10 border-primary/20 text-primary',
      icon: ShieldCheck,
      message: 'Profile complete! Upload your documents to unlock full verification.',
      cta: 'Upload Documents',
      ctaLink: '/student/documents',
    },
    'Documents Pending': {
      color: 'bg-amber-500/10 border-amber-500/20 text-amber-600',
      icon: Clock,
      message: 'Your documents are under review. We\'ll notify you once verified.',
    },
    'Documents Verified': {
      color: 'bg-success/10 border-success/20 text-success',
      icon: CheckCircle2,
      message: 'Profile & documents verified! You\'re fully set to apply to universities.',
    },
  }

  const c = config[status]
  if (!c) return null
  const Icon = c.icon

  return (
    <div className={`flex items-center justify-between gap-[12px] px-[16px] py-[10px] rounded-[10px] border ${c.color} text-[13px]`}>
      <div className="flex items-center gap-[8px]">
        <Icon size={15} className="shrink-0" />
        <span className="font-medium">{status}</span>
        <span className="text-[12px] opacity-80 hidden sm:inline">— {c.message}</span>
      </div>
      {c.cta && c.ctaLink && (
        <Link href={c.ctaLink} className="shrink-0 font-semibold text-[12px] underline underline-offset-2 whitespace-nowrap">
          {c.cta} →
        </Link>
      )}
    </div>
  )
}

/* =========================================================================
   SECTION 1: WELCOME AREA & QUICK AI SUMMARY
   ========================================================================= */
function WelcomeArea({ profile, profileScore, appsCount }: { profile: any; profileScore: number; appsCount: number }) {
  const name = profile?.fullName ? profile.fullName.split(' ')[0] : 'Student'

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  return (
    <div className="flex flex-col gap-[16px]">
      {/* Top Banner Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-[16px] pb-[4px]">
        <div>
          <h1 className="text-[26px] md:text-[32px] font-bold text-foreground tracking-[-0.02em] leading-tight">
            {getGreeting()}, {name} 👋
          </h1>
        </div>
      </div>
    </div>
  )
}

/* =========================================================================
   SECTION 2: TODAY'S FOCUS (DATA-DRIVEN FROM checklistEngine)
   ========================================================================= */
function TodaysFocus({
  profile,
  userDocuments,
  applications,
  savedPrograms,
  deadlines,
  isOnboardingComplete,
}: {
  profile: any
  userDocuments: Record<string, any>
  applications: any[]
  savedPrograms: any[]
  deadlines: any[]
  isOnboardingComplete: boolean
}) {
  // Convert userDocuments map into a list for the checklist engine
  const docsList = Object.entries(userDocuments).map(([id, d]) => ({ id, ...d }))

  const checklist = useMemo(() =>
    generateAdmissionChecklist({
      profile,
      documents: docsList,
      applications,
      savedPrograms,
      deadlines,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [profile, userDocuments, applications, savedPrograms, deadlines]
  )

  const tasks = checklist.tasks
  const [checked, setChecked] = useState<Set<string>>(new Set())

  const toggle = (id: string) => {
    setChecked(prev => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  const completedCount = checked.size

  const iconMap: Record<string, React.ElementType> = {
    Document: FileText,
    Profile: User,
    Application: Send,
    Deadline: Calendar,
    Bookmark: Bookmark,
  }

  const priorityColor: Record<string, string> = {
    Critical: STICKER_ORANGE,
    High: STICKER_SKY,
    Medium: STICKER_PURPLE,
    Low: STICKER_TEAL,
  }

  if (tasks.length === 0) {
    return (
      <div className={CARD_STYLE}>
        <div className="flex items-center gap-[10px] mb-[16px]">
          <div className="w-[28px] h-[28px] rounded-[8px] bg-primary/10 flex items-center justify-center text-primary">
            <Target size={16} strokeWidth={2} />
          </div>
          <h2 className="text-[16px] font-bold text-foreground tracking-tight">Today&apos;s Focus</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-[32px] gap-[10px] text-center">
          <div className="w-[44px] h-[44px] rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle2 size={20} className="text-success" />
          </div>
          <p className="text-[14px] font-semibold text-foreground">All caught up!</p>
          <p className="text-[12px] text-muted-foreground max-w-[240px]">No pending actions right now. Keep exploring universities and check back soon.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={CARD_STYLE}>
      <div className="flex items-center justify-between pb-[16px] mb-[16px] border-b border-border">
        <div className="flex items-center gap-[10px]">
          <div className="w-[28px] h-[28px] rounded-[8px] bg-primary/10 flex items-center justify-center text-primary">
            <Target size={16} strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-[16px] font-bold text-foreground tracking-tight">Today&apos;s Focus</h2>
            <p className="text-[12px] text-muted-foreground">{completedCount} of {tasks.length} actions completed</p>
          </div>
        </div>

        <div className="flex items-center gap-[8px]">
          <div className="w-[120px] h-[6px] bg-secondary rounded-full overflow-hidden hidden sm:block">
            <div className="h-full bg-primary transition-all duration-500 rounded-full" style={{ width: `${tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0}%` }} />
          </div>
          <span className="text-[12px] font-semibold text-primary">{tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0}%</span>
        </div>
      </div>

      <div className="flex flex-col gap-[10px]">
        {tasks.map(task => {
          const isChecked = checked.has(task.id)
          const Icon = iconMap[task.iconType] || Target
          return (
            <div
              key={task.id}
              className={`p-[14px] rounded-[10px] border transition-all flex items-center justify-between gap-[12px] ${
                isChecked
                  ? 'bg-muted border-border opacity-60'
                  : 'bg-card border-border hover:border-primary/30 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center gap-[12px] min-w-0">
                <button
                  onClick={() => toggle(task.id)}
                  className={`w-[20px] h-[20px] rounded-[6px] border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                    isChecked ? 'bg-success border-success text-white' : 'border-border hover:border-primary'
                  }`}
                  aria-label={`Mark ${task.title} as completed`}
                >
                  {isChecked && <Check size={14} strokeWidth={3} />}
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-[8px] flex-wrap">
                    <span className={`text-[13.5px] font-semibold truncate ${isChecked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {task.title}
                    </span>
                    <span className={`text-[10px] font-semibold px-[8px] py-[2px] rounded-full ${priorityColor[task.priority] || STICKER_SKY}`}>
                      {task.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-[12px] text-[11px] text-muted-foreground mt-[2px]">
                    <span className="flex items-center gap-[4px]">
                      <Clock size={11} className="text-muted-foreground" />
                      ~{task.estimatedTime} min
                    </span>
                    <span className="text-muted-foreground truncate">{task.description}</span>
                  </div>
                </div>
              </div>

              <Link href={task.actionUrl} className={BUTTON_UTILITY}>
                {task.actionLabel}
                <ChevronRight size={12} />
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* =========================================================================
   SECTION 3: APPLICATION PIPELINE
   ========================================================================= */
function getStageLabel(status: string): string {
  switch (status) {
    case 'draft': return 'Draft'
    case 'submitted':  case 'active': return 'Submitted'
    case 'under_review': case 'review': return 'Under Review'
    case 'interview': return 'Interview'
    case 'selected': case 'offer': return 'Offer'
    case 'accepted': return 'Accepted'
    case 'rejected': return 'Rejected'
    default: return 'Submitted'
  }
}

function ApplicationPipeline({ apps }: { apps: any[] }) {
  const [selectedStage, setSelectedStage] = useState<string | null>(null)

  const STAGES = [
    { label: 'Draft',       count: apps.filter(a => a.status === 'draft' || !a.status).length,                           color: '#615d59' },
    { label: 'Submitted',   count: apps.filter(a => a.status === 'submitted' || a.status === 'active').length,            color: '#0075de' },
    { label: 'Under Review',count: apps.filter(a => a.status === 'under_review' || a.status === 'review').length,         color: '#d6b6f6' },
    { label: 'Interview',   count: apps.filter(a => a.status === 'interview').length,                                     color: '#2a9d99' },
    { label: 'Offer',       count: apps.filter(a => a.status === 'selected' || a.status === 'offer').length,              color: '#1aae39' },
    { label: 'Accepted',    count: apps.filter(a => a.status === 'accepted').length,                                      color: '#059669' },
    { label: 'Rejected',    count: apps.filter(a => a.status === 'rejected').length,                                      color: '#ef4444' },
  ]

  const normalizedApps = apps.map(a => ({
    id: a.id,
    name: a.universityName || a.university || 'Unknown University',
    program: a.program || a.programName || a.course || '—',
    stage: getStageLabel(a.status),
    progress: a.progress ?? (a.status === 'accepted' || a.status === 'selected' ? 100 : a.status === 'interview' ? 75 : a.status === 'under_review' || a.status === 'review' ? 60 : 40),
    deadline: a.deadline || (a.createdAt?.seconds ? new Date(a.createdAt.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'),
  }))

  const filteredApps = selectedStage
    ? normalizedApps.filter(a => a.stage.toLowerCase() === selectedStage.toLowerCase())
    : normalizedApps

  return (
    <div className={CARD_STYLE}>
      <div className="flex items-center justify-between pb-[16px] mb-[20px] border-b border-border">
        <div>
          <h2 className="text-[16px] font-bold text-foreground tracking-tight">Application Pipeline</h2>
          <p className="text-[12px] text-muted-foreground">Click a stage to filter your active applications</p>
        </div>
        <Link href="/student/applications" className="text-[12px] font-semibold text-primary hover:underline flex items-center gap-[4px]">
          View Full Tracker →
        </Link>
      </div>

      {/* Stage Flow Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-[8px] mb-[20px]">
        {STAGES.map((s) => {
          const isSelected = selectedStage === s.label
          return (
            <button
              key={s.label}
              onClick={() => setSelectedStage(isSelected ? null : s.label)}
              className={`p-[10px] rounded-[10px] border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-primary/10 border-primary shadow-xs'
                  : 'bg-muted border-border hover:border-border'
              }`}
            >
              <div className="flex items-center justify-between mb-[4px]">
                <span className="text-[10px] font-bold uppercase text-muted-foreground">{s.label}</span>
                <span className="w-[6px] h-[6px] rounded-full" style={{ backgroundColor: s.color }} />
              </div>
              <p className="text-[18px] font-extrabold text-foreground leading-none">{s.count}</p>
            </button>
          )
        })}
      </div>

      {/* Pipeline Active List */}
      <div className="flex flex-col gap-[10px]">
        {apps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-[32px] gap-[10px] text-center">
            <div className="w-[44px] h-[44px] rounded-full bg-muted flex items-center justify-center">
              <Building2 size={20} className="text-muted-foreground" />
            </div>
            <p className="text-[14px] font-semibold text-foreground">No applications yet</p>
            <p className="text-[12px] text-muted-foreground max-w-[260px]">
              Start exploring universities and submit your first application to see your pipeline here.
            </p>
            <Link href="/student/universities" className={BUTTON_PRIMARY}>
              Explore Universities
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-[24px] gap-[8px] text-center">
            <p className="text-[14px] font-semibold text-foreground">No applications in {selectedStage} stage</p>
            <p className="text-[12px] text-muted-foreground">Try another stage or clear the filter.</p>
          </div>
        ) : (
          filteredApps.map((app) => (
            <div key={app.id} className="p-[14px] bg-card text-card-foreground border border-border rounded-[10px] flex flex-col sm:flex-row sm:items-center justify-between gap-[12px] hover:border-primary/30 transition-all">
              <div className="flex items-center gap-[12px]">
                <div className="w-[36px] h-[36px] rounded-[8px] bg-primary/10 flex items-center justify-center shrink-0">
                  <Building2 size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-foreground">{app.name}</p>
                  <p className="text-[12px] text-muted-foreground">{app.program}</p>
                </div>
              </div>

              <div className="flex items-center gap-[16px] flex-wrap justify-between sm:justify-end">
                <div className="flex items-center gap-[8px]">
                  <div className="w-[60px] h-[5px] bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${app.progress}%` }} />
                  </div>
                  <span className="text-[12px] font-semibold text-foreground">{app.progress}%</span>
                </div>

                <span className={`text-[11px] font-semibold px-[10px] py-[3px] rounded-full ${
                  app.stage === 'Offer' || app.stage === 'Accepted' ? STICKER_GREEN : app.stage === 'Interview' ? STICKER_TEAL : app.stage === 'Rejected' ? STICKER_ORANGE : STICKER_SKY
                }`}>
                  {app.stage}
                </span>

                <Link href="/student/applications" className={BUTTON_UTILITY}>
                  Details
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

/* =========================================================================
   SECTION 4: PROFILE STRENGTH WORKSPACE (DYNAMIC)
   ========================================================================= */
function ProfileStrengthWorkspace({ profileStrength }: { profileStrength: any }) {
  const { percentage, grade, missingFields, categoryBreakdown } = profileStrength

  // Show top 3 missing high-priority items as recommended actions
  const topMissing = (missingFields || []).slice(0, 3)

  const gradeColor =
    percentage >= 80 ? 'bg-success/15 text-success' :
    percentage >= 60 ? 'bg-primary/15 text-primary' :
    percentage >= 40 ? 'bg-amber-500/15 text-amber-600' :
    'bg-[#dd5b00]/15 text-[#dd5b00]'

  const breakdown = [
    { label: 'Personal',     pct: categoryBreakdown?.personal    ?? 0 },
    { label: 'Academics',    pct: categoryBreakdown?.academics   ?? 0 },
    { label: 'Test Scores',  pct: categoryBreakdown?.testScores  ?? 0 },
    { label: 'Preferences',  pct: categoryBreakdown?.preferences ?? 0 },
    { label: 'Documents',    pct: categoryBreakdown?.documents   ?? 0 },
  ]

  return (
    <div className={CARD_STYLE}>
      <div className="flex items-center justify-between pb-[16px] mb-[16px] border-b border-border">
        <div>
          <h2 className="text-[16px] font-bold text-foreground tracking-tight">Profile Strength &amp; Readiness</h2>
          <p className="text-[12px] text-muted-foreground">Complete missing requirements to maximize admission probability</p>
        </div>
        <span className={`text-[11px] font-bold px-[8px] py-[2px] rounded-full ${gradeColor}`}>
          {grade}
        </span>
      </div>

      <div className="flex flex-col gap-[20px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[20px] items-center">
          {/* Circle Gauge */}
          <div className="flex flex-col items-center justify-center p-[16px] bg-muted border border-border rounded-[10px] h-full">
            <div className="relative w-[90px] h-[90px] flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="45" cy="45" r="38" stroke="#E5E7EB" strokeWidth="8" fill="transparent" />
                <circle
                  cx="45" cy="45" r="38" stroke="#0075de" strokeWidth="8" fill="transparent"
                  strokeDasharray="239"
                  strokeDashoffset={239 - (239 * percentage) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-[20px] font-extrabold text-foreground leading-none">{percentage}%</span>
                <span className="text-[10px] font-semibold text-muted-foreground mt-[2px]">Score</span>
              </div>
            </div>
            <p className="text-[11px] font-semibold text-foreground mt-[10px] text-center leading-tight">
              {percentage < 100 ? `${100 - percentage}% more to unlock full insights` : 'Profile Complete!'}
            </p>
          </div>

          {/* Missing Requirements */}
          <div className="md:col-span-2 flex flex-col gap-[10px]">
            <p className="text-[12px] font-bold uppercase text-muted-foreground tracking-wider">Recommended Completion Actions</p>
            {topMissing.length === 0 ? (
              <div className="flex items-center gap-[8px] p-[10px] bg-success/10 border border-success/20 rounded-[8px]">
                <CheckCircle2 size={14} className="text-success" />
                <span className="text-[13px] font-medium text-foreground">All key fields completed!</span>
              </div>
            ) : (
              topMissing.map((item: any, idx: number) => (
                <div key={idx} className="p-[10px] bg-card text-card-foreground border border-border rounded-[8px] flex items-center justify-between gap-[12px]">
                  <div className="flex items-center gap-[8px]">
                    <AlertCircle size={14} className={item.priority === 'High' ? 'text-[#dd5b00] shrink-0' : 'text-amber-500 shrink-0'} />
                    <span className="text-[13px] font-medium text-foreground">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-[10px]">
                    <span className={`text-[10px] font-semibold px-[6px] py-[1px] rounded-full ${item.priority === 'High' ? STICKER_ORANGE : STICKER_SKY}`}>
                      {item.priority}
                    </span>
                    <Link href={item.link || '/student/profile'} className={BUTTON_UTILITY + " shrink-0"}>
                      Fix
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Profile Completion Breakdown — all live from categoryBreakdown */}
        <div className="pt-[16px] border-t border-border grid grid-cols-2 gap-[16px]">
          {breakdown.map(({ label, pct }) => (
            <div key={label}>
              <div className="flex items-center justify-between mb-[6px]">
                <span className="text-[11px] font-semibold text-foreground">{label}</span>
                <span className={`text-[11px] ${pct === 100 ? 'text-success' : pct === 0 ? 'text-[#dd5b00]' : 'text-muted-foreground'}`}>
                  {pct === 0 ? 'Pending' : `${pct}%`}
                </span>
              </div>
              <div className="w-full h-[6px] bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${pct === 100 ? 'bg-success' : pct < 30 ? 'bg-[#dd5b00]' : 'bg-primary'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* =========================================================================
   SECTION 5: AI RECOMMENDATIONS HUB (GUARDED)
   ========================================================================= */
function AIRecommendationsHub({ profileScore }: { profileScore: number }) {
  if (profileScore < 40) {
    return (
      <div className={CARD_STYLE}>
        <div className="flex items-center justify-between pb-[16px] mb-[16px] border-b border-border">
          <div className="flex items-center gap-[10px]">
            <div className="w-[28px] h-[28px] rounded-[8px] bg-primary/10 flex items-center justify-center text-primary">
              <Sparkles size={16} strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-foreground tracking-tight">EDING AI Recommendations</h2>
              <p className="text-[12px] text-muted-foreground">Personalized smart suggestions tailored to your profile</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-[32px] gap-[12px] text-center">
          <div className="w-[48px] h-[48px] rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles size={22} className="text-primary" />
          </div>
          <p className="text-[14px] font-semibold text-foreground">AI Recommendations Locked</p>
          <p className="text-[12px] text-muted-foreground max-w-[300px] leading-relaxed">
            Complete at least 40% of your profile — including academic scores and preferences — to unlock personalised university, scholarship, and career recommendations.
          </p>
          <Link href="/student/profile" className={BUTTON_PRIMARY}>
            Complete Profile
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    )
  }

  const recommendations = [
    {
      title: 'Optimize Your Resume',
      desc: 'Add quantitative metrics to boost ATS score',
      tag: 'Resume',
      type: 'Resume',
      action: 'Open AI Resume',
      link: '/student/resume',
      color: STICKER_PURPLE
    },
    {
      title: 'Practice Mock Interview',
      desc: 'AI-driven behavioral questions ready for you',
      tag: 'AI Practice',
      type: 'Interview',
      action: 'Start Practice',
      link: '/student/interview',
      color: STICKER_TEAL
    },
    {
      title: 'Draft Your Statement of Purpose',
      desc: 'AI copilot will help you write a compelling SOP',
      tag: 'SOP',
      type: 'Writing',
      action: 'Write with AI',
      link: '/student/sop',
      color: STICKER_SKY
    },
    {
      title: 'Explore Scholarships',
      desc: 'Discover merit-based grants matching your profile',
      tag: 'Scholarship',
      type: 'Scholarship',
      action: 'View Matches',
      link: '/student/scholarships',
      color: STICKER_GREEN
    },
  ]

  return (
    <div className={CARD_STYLE}>
      <div className="flex items-center justify-between pb-[16px] mb-[16px] border-b border-border">
        <div className="flex items-center gap-[10px]">
          <div className="w-[28px] h-[28px] rounded-[8px] bg-primary/10 flex items-center justify-center text-primary">
            <Sparkles size={16} strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-[16px] font-bold text-foreground tracking-tight">EDING AI Recommendations</h2>
            <p className="text-[12px] text-muted-foreground">Personalized smart suggestions tailored to your profile</p>
          </div>
        </div>
        <Link href="/student/copilot" className="text-[12px] font-semibold text-primary hover:underline">
          Ask AI Copilot →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
        {recommendations.map((rec, i) => (
          <div key={i} className="p-[16px] bg-card text-card-foreground border border-border rounded-[10px] flex flex-col justify-between gap-[12px] hover:border-primary/30 hover:shadow-xs transition-all">
            <div>
              <div className="flex items-center justify-between mb-[6px]">
                <span className={`text-[10px] font-bold px-[8px] py-[2px] rounded-full ${rec.color}`}>
                  {rec.tag}
                </span>
                <span className="text-[11px] font-semibold text-muted-foreground">{rec.type}</span>
              </div>
              <h3 className="text-[14px] font-bold text-foreground mb-[2px]">{rec.title}</h3>
              <p className="text-[12px] text-muted-foreground leading-snug">{rec.desc}</p>
            </div>

            <Link href={rec.link} className={BUTTON_PRIMARY + " w-full justify-center"}>
              {rec.action}
              <ArrowRight size={14} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

/* =========================================================================
   SECTION 6: UPCOMING DEADLINES TIMELINE (DATA-DRIVEN)
   ========================================================================= */
function UpcomingDeadlinesTimeline({
  deadlines,
  applications,
  documents,
  profileScore,
}: {
  deadlines: any[]
  applications: any[]
  documents: any[]
  profileScore: number
}) {
  const { insights } = useMemo(() =>
    generateDeadlineInsights({ deadlines, applications, documents, profileScore }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [deadlines, applications, profileScore]
  )

  // Only show upcoming (non-completed) deadlines
  const upcoming = insights
    .filter(d => d.priority !== 'Completed' && d.daysRemaining >= 0)
    .slice(0, 4)

  const formatDate = (date: Date) => {
    const today = new Date(); today.setHours(0,0,0,0)
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
    const dDate = new Date(date); dDate.setHours(0,0,0,0)

    if (dDate.getTime() === today.getTime()) return 'Today'
    if (dDate.getTime() === tomorrow.getTime()) return 'Tomorrow'
    if ((dDate.getTime() - today.getTime()) / 86400000 <= 7) return 'This Week'
    return dDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className={CARD_STYLE}>
      <div className="flex items-center justify-between pb-[16px] mb-[16px] border-b border-border">
        <div className="flex items-center gap-[8px]">
          <Calendar className="text-primary" size={18} />
          <h2 className="text-[16px] font-bold text-foreground tracking-tight">Upcoming Deadlines Timeline</h2>
        </div>
        <Link href="/student/calendar" className="text-[12px] font-semibold text-primary hover:underline">
          View Planner →
        </Link>
      </div>

      {upcoming.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-[32px] gap-[10px] text-center">
          <div className="w-[44px] h-[44px] rounded-full bg-muted flex items-center justify-center">
            <Calendar size={20} className="text-muted-foreground" />
          </div>
          <p className="text-[14px] font-semibold text-foreground">No application deadlines yet.</p>
          <p className="text-[12px] text-muted-foreground max-w-[240px]">
            Start applying to universities — your deadlines will appear here automatically.
          </p>
          <Link href="/student/universities" className={BUTTON_PRIMARY}>
            Explore Universities
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="relative pl-[16px] border-l border-border flex flex-col gap-[16px]">
          {upcoming.map((item, idx) => (
            <div key={item.id} className="relative flex items-start justify-between gap-[12px]">
              {/* Timeline node */}
              <div className={`absolute -left-[21px] top-[4px] w-[10px] h-[10px] rounded-full border-[2px] bg-card ${
                item.priority === 'Critical' ? 'border-[#dd5b00]' : 'border-primary'
              }`} />

              <div>
                <div className="flex items-center gap-[8px] mb-[2px]">
                  <span className={`text-[10px] font-bold uppercase px-[6px] py-[1px] rounded-md ${
                    item.priority === 'Critical' ? STICKER_ORANGE : STICKER_SKY
                  }`}>
                    {formatDate(item.date)}
                  </span>
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    {item.daysRemaining === 0 ? 'Due Today' : `${item.daysRemaining}d left`}
                  </span>
                </div>
                <p className="text-[13.5px] font-semibold text-foreground">{item.title}</p>
                <p className="text-[11px] text-muted-foreground">{item.universityName}</p>
              </div>

              <Link href={item.appId ? '/student/applications' : '/student/calendar'} className={BUTTON_UTILITY}>
                {item.appId ? 'View App' : 'Calendar'}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* =========================================================================
   SECTION 8: GAMIFIED ACHIEVEMENTS (DATA-DRIVEN)
   ========================================================================= */
function GamifiedAchievements({
  profileScore,
  applications,
  userDocuments,
  scholarships,
}: {
  profileScore: number
  applications: any[]
  userDocuments: Record<string, any>
  scholarships: any[]
}) {
  const docCount = Object.keys(userDocuments).length
  const hasSubmittedApp = applications.some(a => a.status && a.status !== 'draft')
  const hasCompletedInterview = false // would come from a 'mock_sessions' collection
  const isScholarshipEligible = scholarships.length > 0

  const achievements = [
    {
      title: 'Profile 80% Unlocked',
      desc: 'Completed core profile fields',
      icon: Target,
      unlocked: profileScore >= 80,
    },
    {
      title: 'First Application Sent',
      desc: 'Submitted to at least one university',
      icon: Send,
      unlocked: hasSubmittedApp,
    },
    {
      title: 'Documents Uploaded',
      desc: 'Uploaded at least 2 documents',
      icon: FileText,
      unlocked: docCount >= 2,
    },
    {
      title: 'Scholarship Eligible',
      desc: 'Matched with scholarship programs',
      icon: Award,
      unlocked: isScholarshipEligible,
    },
  ]

  const unlockedCount = achievements.filter(a => a.unlocked).length

  return (
    <div className={CARD_STYLE}>
      <div className="flex items-center justify-between pb-[16px] mb-[16px] border-b border-border">
        <div className="flex items-center gap-[8px]">
          <Flame className="text-[#dd5b00]" size={18} />
          <h2 className="text-[16px] font-bold text-foreground tracking-tight">Milestones &amp; Achievements</h2>
        </div>
        <span className="text-[12px] font-semibold text-primary">{unlockedCount} of {achievements.length} Unlocked</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-[12px]">
        {achievements.map((ach, i) => {
          const IconComp = ach.icon
          return (
            <div
              key={i}
              className={`p-[14px] rounded-[10px] border flex flex-col items-center text-center gap-[8px] ${
                ach.unlocked
                  ? 'bg-card border-border shadow-xs'
                  : 'bg-muted border-border opacity-50'
              }`}
            >
              <div className={`w-[36px] h-[36px] rounded-full flex items-center justify-center ${
                ach.unlocked ? 'bg-success/15 text-success' : 'bg-secondary/80 text-muted-foreground'
              }`}>
                <IconComp size={18} strokeWidth={2} />
              </div>
              <div>
                <p className="text-[12px] font-bold text-foreground leading-tight">{ach.title}</p>
                <p className="text-[10px] text-muted-foreground mt-[2px]">{ach.desc}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* =========================================================================
   SECTION 9: ADMISSION INSIGHTS & PROBABILITIES (GUARDED)
   ========================================================================= */
function StudentInsightsAnalytics({
  profileScore,
  applications,
  profileStrength,
}: {
  profileScore: number
  applications: any[]
  profileStrength: any
}) {
  if (profileScore < 40) {
    return (
      <div className={CARD_STYLE}>
        <div className="flex items-center justify-between pb-[16px] mb-[16px] border-b border-border">
          <div className="flex items-center gap-[8px]">
            <BarChart3 className="text-primary" size={18} />
            <h2 className="text-[16px] font-bold text-foreground tracking-tight">Admission Insights &amp; Probabilities</h2>
          </div>
          <span className="text-[11px] font-bold bg-primary/15 text-primary px-[8px] py-[2px] rounded-full">
            AI Engine Predictive
          </span>
        </div>

        <div className="flex flex-col items-center justify-center py-[28px] gap-[10px] text-center">
          <div className="w-[44px] h-[44px] rounded-full bg-muted flex items-center justify-center">
            <BarChart3 size={20} className="text-muted-foreground" />
          </div>
          <p className="text-[14px] font-semibold text-foreground">Complete your profile to unlock admission insights.</p>
          <p className="text-[12px] text-muted-foreground max-w-[280px]">
            We need your academic scores (12th marks or CGPA) and at least 40% profile completion to predict your admission probability.
          </p>
          <Link href="/student/profile" className={BUTTON_PRIMARY}>
            Update Profile
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    )
  }

  // Enough data — compute real stats from Firebase data
  const activeApps = applications.filter(a => a.status && a.status !== 'rejected')
  const acceptedApps = applications.filter(a => a.status === 'accepted' || a.status === 'selected')

  const pipelineHealth =
    applications.length === 0 ? 'No Applications' :
    activeApps.length >= 3 ? 'Optimal' :
    activeApps.length >= 1 ? 'Building' : 'Needs Attention'

  const acceptanceChance =
    profileScore >= 80 ? 'High' :
    profileScore >= 60 ? 'Moderate' : 'Developing'

  return (
    <div className={CARD_STYLE}>
      <div className="flex items-center justify-between pb-[16px] mb-[16px] border-b border-border">
        <div className="flex items-center gap-[8px]">
          <BarChart3 className="text-primary" size={18} />
          <h2 className="text-[16px] font-bold text-foreground tracking-tight">Admission Insights &amp; Probabilities</h2>
        </div>
        <span className="text-[11px] font-bold bg-primary/15 text-primary px-[8px] py-[2px] rounded-full">
          AI Engine Predictive
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-[16px]">
        <div className="p-[14px] bg-muted border border-border rounded-[10px]">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase">Profile Readiness</p>
          <p className={`text-[24px] font-extrabold leading-tight mt-[4px] ${profileScore >= 80 ? 'text-success' : profileScore >= 60 ? 'text-primary' : 'text-amber-600'}`}>
            {profileScore}%
          </p>
          <p className="text-[11px] text-muted-foreground mt-[2px]">{acceptanceChance} readiness level</p>
        </div>

        <div className="p-[14px] bg-muted border border-border rounded-[10px]">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase">Pipeline Health</p>
          <p className={`text-[24px] font-extrabold leading-tight mt-[4px] ${pipelineHealth === 'Optimal' ? 'text-success' : pipelineHealth === 'Building' ? 'text-primary' : 'text-muted-foreground'}`}>
            {pipelineHealth}
          </p>
          <p className="text-[11px] text-muted-foreground mt-[2px]">{activeApps.length} active application{activeApps.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="p-[14px] bg-muted border border-border rounded-[10px]">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase">Offers Received</p>
          <p className={`text-[24px] font-extrabold leading-tight mt-[4px] ${acceptedApps.length > 0 ? 'text-success' : 'text-foreground'}`}>
            {acceptedApps.length}
          </p>
          <p className="text-[11px] text-muted-foreground mt-[2px]">
            {acceptedApps.length > 0 ? 'Congratulations!' : 'Keep applying to universities'}
          </p>
        </div>
      </div>
    </div>
  )
}

/* =========================================================================
   SECTION 11: UNIVERSITY RECOMMENDATIONS GRID (GUARDED)
   ========================================================================= */
function UniversityRecommendationsGrid({
  universities,
  hasMinimumProfileForRecommendations,
}: {
  universities: any[]
  hasMinimumProfileForRecommendations: boolean
}) {
  const topUnis = useMemo(() => {
    return [...universities]
      .sort((a, b) => ((b.aiMatch ?? b.placementRate ?? 0) - (a.aiMatch ?? a.placementRate ?? 0)))
      .slice(0, 3)
  }, [universities])

  return (
    <div className={CARD_STYLE}>
      <div className="flex items-center justify-between pb-[16px] mb-[16px] border-b border-border">
        <div>
          <h2 className="text-[16px] font-bold text-foreground tracking-tight">Top University Recommendations</h2>
          <p className="text-[12px] text-muted-foreground">AI-matched universities based on your profile &amp; test scores</p>
        </div>
        <Link href="/student/universities" className="text-[12px] font-semibold text-primary hover:underline">
          Explore All →
        </Link>
      </div>

      {!hasMinimumProfileForRecommendations ? (
        <div className="flex flex-col items-center justify-center py-[32px] gap-[10px] text-center">
          <div className="w-[44px] h-[44px] rounded-full bg-muted flex items-center justify-center">
            <GraduationCap size={20} className="text-muted-foreground" />
          </div>
          <p className="text-[14px] font-semibold text-foreground">Complete your profile to receive personalized university recommendations.</p>
          <p className="text-[12px] text-muted-foreground max-w-[280px]">
            Add your academic scores and study preferences so our AI can match you with the best-fit universities.
          </p>
          <Link href="/student/profile" className={BUTTON_PRIMARY}>
            Complete Profile
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : topUnis.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-[32px] gap-[10px] text-center">
          <div className="w-[44px] h-[44px] rounded-full bg-muted flex items-center justify-center">
            <GraduationCap size={20} className="text-muted-foreground" />
          </div>
          <p className="text-[14px] font-semibold text-foreground">No universities available yet</p>
          <p className="text-[12px] text-muted-foreground max-w-[220px]">Check back later — our team is continuously adding new institutions.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-[12px]">
          {topUnis.map((u) => {
            const location = typeof u.location === 'object'
              ? `${u.location.city ?? ''}, ${u.location.state ?? ''}`.replace(/^, |, $/g, '')
              : (u.location ?? '')
            const matchPct = u.aiMatch != null ? `${u.aiMatch}%` : u.placementRate != null ? `${u.placementRate}%` : null
            const rank = u.rankings?.nirfOverall != null ? `NIRF #${u.rankings.nirfOverall}` : null
            const scholarship = u.scholarships ? 'Scholarship Available' : null

            return (
              <div key={u.id} className="p-[12px] bg-card text-card-foreground border border-border rounded-[10px] flex items-center justify-between gap-[12px] hover:border-primary/30 transition-all">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-[8px] mb-[4px]">
                    {matchPct && (
                      <span className="text-[10px] font-bold bg-[#62aef0]/20 text-primary px-[6px] py-[2px] rounded-full shrink-0">
                        {matchPct} Match
                      </span>
                    )}
                    {rank && <span className="text-[10px] font-medium text-muted-foreground">{rank}</span>}
                  </div>
                  <h3 className="text-[13px] font-bold text-foreground leading-tight truncate">{u.name}</h3>
                  <div className="flex items-center gap-[8px] mt-[4px] flex-wrap">
                    {location && <p className="text-[11px] text-muted-foreground">{location}</p>}
                    {scholarship && (
                      <span className="text-[10px] font-semibold text-success bg-success/10 px-[6px] py-[2px] rounded-md inline-block shrink-0">
                        {scholarship}
                      </span>
                    )}
                  </div>
                </div>

                <Link href={`/student/universities`} className={BUTTON_PRIMARY + " shrink-0 !h-[30px] !text-[11px] !px-[12px]"}>
                  View Details
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* =========================================================================
   SECTION 12: FLOATING AI ASSISTANT WIDGET
   ========================================================================= */
function FloatingAIAssistantWidget() {
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-[24px] right-[24px] z-40">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-[12px] w-[320px] sm:w-[360px] bg-card text-card-foreground border border-border rounded-[16px] shadow-2xl p-[18px] flex flex-col gap-[12px]"
          >
            <div className="flex items-center justify-between pb-[10px] border-b border-border">
              <div className="flex items-center gap-[8px]">
                <div className="w-[26px] h-[26px] rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Sparkles size={14} />
                </div>
                <span className="text-[13px] font-bold text-foreground">EDING AI Assistant</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground" aria-label="Close AI Widget">
                <X size={16} />
              </button>
            </div>

            <p className="text-[12px] text-muted-foreground leading-relaxed">
              💡 <strong>Need help?</strong> Ask our AI Copilot anything — from university selection to SOP writing and interview prep.
            </p>

            <div className="flex flex-col gap-[6px]">
              <Link href="/student/sop" className={BUTTON_PRIMARY + " w-full justify-center text-[12px] h-[32px]"}>
                Write SOP with AI
              </Link>
              <Link href="/student/copilot" className={BUTTON_SECONDARY + " w-full justify-center text-[12px] h-[32px]"}>
                Ask Copilot Anything
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen(!open)}
        className="w-[48px] h-[48px] rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary/90 transition-all cursor-pointer active:scale-95"
        aria-label="Open AI Assistant"
      >
        <Sparkles size={20} />
      </button>
    </div>
  )
}

/* =========================================================================
   MAIN STUDENT DASHBOARD COMPONENT
   ========================================================================= */
export default function StudentDashboard() {
  console.log('dashboard mounting')

  React.useEffect(() => {
    try {
      // Async error boundary
    } catch (error) {
      console.error('Dashboard async error:', error)
    }
  }, [])

  const {
    loading,
    error,
    uniqueApps,
    profile,
    profileScore,
    profileStrength,
    universities,
    userDocuments,
    docUploaded,
    docVerified,
    docPending,
    verificationStatus,
    isOnboardingComplete,
    hasMinimumProfileForRecommendations,
    deadlines,
    documents,
    savedPrograms,
    scholarships,
  } = useStudentData()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-[36px] h-[36px] border-[3px] border-border border-t-[#0075de] rounded-full animate-spin" />
      </div>
    )
  }

  const safeApps = uniqueApps || []
  const safeUnis = universities || []
  const safeUserDocs = userDocuments || {}
  const safeScholarships = scholarships || []

  return (
    <div className="flex flex-col gap-[24px] pb-[40px]">
      {error && (
        <div className="p-[16px] flex items-center justify-between text-[13px] text-[#EF4444] bg-[#FEF2F2] rounded-[12px] border border-[#FECACA]">
          <div className="flex items-center gap-[10px]">
            <AlertCircle size={18} />
            <span><strong>Warning:</strong> {error}. Some data may be missing or incomplete.</span>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-[6px] px-[12px] py-[6px] bg-[#EF4444] text-white rounded-[6px] font-medium transition-all hover:bg-[#DC2626]"
          >
            <RefreshCw size={14} />
            Retry
          </button>
        </div>
      )}

      {/* SECTION 1: Welcome Area */}
      <WelcomeArea profile={profile} profileScore={profileScore || 0} appsCount={safeApps.length} />

      {/* Verification Status Banner */}
      <VerificationStatusBanner status={verificationStatus || 'Profile Incomplete'} />

      {/* Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[24px]">
        <ProfileStrengthWorkspace profileStrength={profileStrength || { percentage: 0, grade: 'Incomplete', missingFields: [], categoryBreakdown: { personal: 0, academics: 0, testScores: 0, preferences: 0, documents: 0 } }} />
        <UniversityRecommendationsGrid
          universities={safeUnis}
          hasMinimumProfileForRecommendations={hasMinimumProfileForRecommendations || false}
        />
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[24px]">
        <TodaysFocus
          profile={profile}
          userDocuments={safeUserDocs}
          applications={safeApps}
          savedPrograms={savedPrograms || []}
          deadlines={deadlines || []}
          isOnboardingComplete={isOnboardingComplete || false}
        />
        <UpcomingDeadlinesTimeline
          deadlines={deadlines || []}
          applications={safeApps}
          documents={documents || []}
          profileScore={profileScore || 0}
        />
      </div>

      {/* Row 3 */}
      <ApplicationPipeline apps={safeApps} />

      {/* Row 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[24px]">
        <GamifiedAchievements
          profileScore={profileScore || 0}
          applications={safeApps}
          userDocuments={safeUserDocs}
          scholarships={safeScholarships}
        />
        <StudentInsightsAnalytics
          profileScore={profileScore || 0}
          applications={safeApps}
          profileStrength={profileStrength}
        />
      </div>

      {/* Row 5: AI Recommendations */}
      <AIRecommendationsHub profileScore={profileScore || 0} />

      {/* Floating AI Assistant Widget */}
      <FloatingAIAssistantWidget />
    </div>
  )
}
