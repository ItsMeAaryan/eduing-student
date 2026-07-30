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
  Search
} from 'lucide-react'
import { useStudentData } from '@/components/providers/StudentDataProvider'
import Link from 'next/link'

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
   SECTION 1: WELCOME AREA & QUICK AI SUMMARY
   ========================================================================= */
function WelcomeArea({ profile, profileScore, appsCount }: { profile: any; profileScore: number; appsCount: number }) {
  const name = profile?.fullName ? profile.fullName.split(' ')[0] : 'Prince'

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
   SECTION 2: TODAY'S FOCUS (PRIMARY ACTIONABLE TASKS)
   ========================================================================= */
function TodaysFocus() {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Upload Official Academic Transcript', category: 'Documents', due: 'Today', priority: 'Urgent', link: '/student/documents', icon: FileText, completed: false, tagColor: STICKER_ORANGE },
    { id: 2, title: 'Complete Statement of Purpose First Draft', category: 'SOP', due: 'Tomorrow', priority: 'High', link: '/student/sop', icon: Sparkles, completed: false, tagColor: STICKER_PURPLE },
    { id: 3, title: 'Submit MIT Graduate Application', category: 'Application', due: 'In 3 Days', priority: 'High', link: '/student/applications', icon: Send, completed: false, tagColor: STICKER_SKY },
    { id: 4, title: 'Apply for Global Excellence Scholarship', category: 'Scholarship', due: 'Aug 5', priority: 'Medium', link: '/student/scholarships', icon: Award, completed: false, tagColor: STICKER_GREEN },
    { id: 5, title: 'Complete AI Mock Interview Session', category: 'Practice', due: 'This Week', priority: 'Normal', link: '/student/interview', icon: Video, completed: false, tagColor: STICKER_TEAL },
  ])

  const toggleTask = (id: number) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  const completedCount = tasks.filter(t => t.completed).length

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
            <div className="h-full bg-primary transition-all duration-500 rounded-full" style={{ width: `${(completedCount / tasks.length) * 100}%` }} />
          </div>
          <span className="text-[12px] font-semibold text-primary">{Math.round((completedCount / tasks.length) * 100)}%</span>
        </div>
      </div>

      <div className="flex flex-col gap-[10px]">
        {tasks.map(task => (
          <div
            key={task.id}
            className={`p-[14px] rounded-[10px] border transition-all flex items-center justify-between gap-[12px] ${
              task.completed
                ? 'bg-muted border-border opacity-60'
                : 'bg-card border-border hover:border-primary/30 hover:shadow-xs'
            }`}
          >
            <div className="flex items-center gap-[12px] min-w-0">
              <button
                onClick={() => toggleTask(task.id)}
                className={`w-[20px] h-[20px] rounded-[6px] border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                  task.completed ? 'bg-success border-success text-white' : 'border-border hover:border-primary'
                }`}
                aria-label={`Mark ${task.title} as completed`}
              >
                {task.completed && <Check size={14} strokeWidth={3} />}
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-[8px] flex-wrap">
                  <span className={`text-[13.5px] font-semibold truncate ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {task.title}
                  </span>
                  <span className={`text-[10px] font-semibold px-[8px] py-[2px] rounded-full ${task.tagColor}`}>
                    {task.category}
                  </span>
                </div>
                <div className="flex items-center gap-[12px] text-[11px] text-muted-foreground mt-[2px]">
                  <span className="flex items-center gap-[4px]">
                    <Clock size={11} className="text-muted-foreground" />
                    Due: {task.due}
                  </span>
                  <span className={`font-semibold ${
                    task.priority === 'Urgent' ? 'text-[#dd5b00]' : task.priority === 'High' ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    {task.priority} Priority
                  </span>
                </div>
              </div>
            </div>

            <Link
              href={task.link}
              className={BUTTON_UTILITY}
            >
              Action
              <ChevronRight size={12} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

/* =========================================================================
   SECTION 3: APPLICATION PIPELINE
   ========================================================================= */
/* Map a Firestore application status to the stage label used by the pipeline UI */
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

  // Normalize real apps into the shape the UI expects
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
        {filteredApps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-[32px] gap-[10px] text-center">
            <div className="w-[44px] h-[44px] rounded-full bg-muted flex items-center justify-center">
              <Building2 size={20} className="text-muted-foreground" />
            </div>
            <p className="text-[14px] font-semibold text-foreground">
              {selectedStage ? `No applications in ${selectedStage} stage` : 'No applications yet'}
            </p>
            <p className="text-[12px] text-muted-foreground max-w-[240px]">
              {selectedStage ? 'Try another stage or clear the filter.' : 'Start exploring universities and apply to get your pipeline moving.'}
            </p>
            {!selectedStage && (
              <Link href="/student/universities" className={BUTTON_PRIMARY}>
                Explore Universities
                <ArrowRight size={14} />
              </Link>
            )}
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
   SECTION 4: PROFILE STRENGTH WORKSPACE
   ========================================================================= */
function ProfileStrengthWorkspace({ profileScore }: { profileScore: number }) {
  const missingItems = [
    { title: 'Academic Transcripts', impact: '+12% Readiness', link: '/student/documents' },
    { title: 'Letter of Recommendation (LOR)', impact: '+10% Readiness', link: '/student/documents' },
    { title: 'Statement of Purpose (SOP)', impact: '+15% Readiness', link: '/student/sop' },
  ]

  return (
    <div className={CARD_STYLE}>
      <div className="flex items-center justify-between pb-[16px] mb-[16px] border-b border-border">
        <div>
          <h2 className="text-[16px] font-bold text-foreground tracking-tight">Profile Strength & Readiness</h2>
          <p className="text-[12px] text-muted-foreground">Complete missing requirements to maximize admission probability</p>
        </div>
        <span className="text-[11px] font-bold bg-success/15 text-success px-[8px] py-[2px] rounded-full">
          High Alignment
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
                  strokeDashoffset={239 - (239 * profileScore) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-[20px] font-extrabold text-foreground leading-none">{profileScore}%</span>
                <span className="text-[10px] font-semibold text-muted-foreground mt-[2px]">Score</span>
              </div>
            </div>
            <p className="text-[11px] font-semibold text-foreground mt-[10px] text-center leading-tight">Expected +28% Admission Boost</p>
          </div>

          {/* Missing Requirements List */}
          <div className="md:col-span-2 flex flex-col gap-[10px]">
            <p className="text-[12px] font-bold uppercase text-muted-foreground tracking-wider">Recommended Completion Actions</p>
            {missingItems.map((item, idx) => (
              <div key={idx} className="p-[10px] bg-card text-card-foreground border border-border rounded-[8px] flex items-center justify-between gap-[12px]">
                <div className="flex items-center gap-[8px]">
                  <AlertCircle size={14} className="text-[#dd5b00] shrink-0" />
                  <span className="text-[13px] font-medium text-foreground">{item.title}</span>
                </div>
                <div className="flex items-center gap-[10px]">
                  <span className="text-[11px] font-semibold text-success whitespace-nowrap">{item.impact}</span>
                  <Link href={item.link} className={BUTTON_UTILITY + " shrink-0"}>
                    Fix
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Profile Completion Breakdown */}
        <div className="pt-[16px] border-t border-border grid grid-cols-2 gap-[16px]">
          <div>
            <div className="flex items-center justify-between mb-[6px]">
              <span className="text-[11px] font-semibold text-foreground">Academics</span>
              <span className="text-[11px] text-muted-foreground">85%</span>
            </div>
            <div className="w-full h-[6px] bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: '85%' }} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-[6px]">
              <span className="text-[11px] font-semibold text-foreground">Test Scores</span>
              <span className="text-[11px] text-[#dd5b00]">Pending</span>
            </div>
            <div className="w-full h-[6px] bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-[#dd5b00] rounded-full" style={{ width: '30%' }} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-[6px]">
              <span className="text-[11px] font-semibold text-foreground">Work Experience</span>
              <span className="text-[11px] text-success">100%</span>
            </div>
            <div className="w-full h-[6px] bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-success rounded-full" style={{ width: '100%' }} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-[6px]">
              <span className="text-[11px] font-semibold text-foreground">Documents</span>
              <span className="text-[11px] text-muted-foreground">60%</span>
            </div>
            <div className="w-full h-[6px] bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: '60%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* =========================================================================
   SECTION 5: AI RECOMMENDATIONS HUB
   ========================================================================= */
function AIRecommendationsHub() {
  const recommendations = [
    {
      title: 'Stanford University — MS CS',
      desc: 'Based on your 3.8 GPA & Tech Projects',
      tag: '96% Fit Match',
      type: 'University',
      action: 'Apply Now',
      link: '/student/universities',
      color: STICKER_SKY
    },
    {
      title: 'Global Tech Leaders Fellowship',
      desc: 'Full Tuition Grant ($25,000 Award)',
      tag: 'Eligible',
      type: 'Scholarship',
      action: 'Quick Apply',
      link: '/student/scholarships',
      color: STICKER_GREEN
    },
    {
      title: 'Optimize Resume for ATS',
      desc: 'Add quantitative metrics to project section',
      tag: '+12 Score Boost',
      type: 'Resume',
      action: 'Fix in AI Resume',
      link: '/student/resume',
      color: STICKER_PURPLE
    },
    {
      title: 'Practice Ivy League Mock Interview',
      desc: '5 customized behavioral questions ready',
      tag: 'AI Practice',
      type: 'Interview',
      action: 'Start Practice',
      link: '/student/interview',
      color: STICKER_TEAL
    }
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
   SECTION 6: UPCOMING DEADLINES TIMELINE
   ========================================================================= */
function UpcomingDeadlinesTimeline() {
  const deadlines = [
    { period: 'Today', title: 'Upload Final Semester Marksheet', target: 'Document Portal', time: '11:59 PM', urgent: true },
    { period: 'Tomorrow', title: 'Global Excellence Scholarship Portal Closes', target: 'Scholarships', time: 'Aug 01, 2026', urgent: true },
    { period: 'This Week', title: 'MIT Early Decision Deadline', target: 'Application', time: 'Aug 05, 2026', urgent: false },
    { period: 'Next Month', title: 'Stanford MS CS Document Submissions', target: 'Application', time: 'Sep 01, 2026', urgent: false }
  ]

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

      <div className="relative pl-[16px] border-l border-border flex flex-col gap-[16px]">
        {deadlines.map((item, idx) => (
          <div key={idx} className="relative flex items-start justify-between gap-[12px]">
            {/* Timeline node */}
            <div className={`absolute -left-[21px] top-[4px] w-[10px] h-[10px] rounded-full border-[2px] bg-card ${
              item.urgent ? 'border-[#dd5b00]' : 'border-primary'
            }`} />

            <div>
              <div className="flex items-center gap-[8px] mb-[2px]">
                <span className={`text-[10px] font-bold uppercase px-[6px] py-[1px] rounded-md ${
                  item.urgent ? STICKER_ORANGE : STICKER_SKY
                }`}>
                  {item.period}
                </span>
                <span className="text-[11px] font-semibold text-muted-foreground">{item.time}</span>
              </div>
              <p className="text-[13.5px] font-semibold text-foreground">{item.title}</p>
              <p className="text-[11px] text-muted-foreground">{item.target}</p>
            </div>

            <Link href="/student/calendar" className={BUTTON_UTILITY}>
              Calendar
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

/* =========================================================================
   SECTION 8: GAMIFIED ACHIEVEMENTS
   ========================================================================= */
function GamifiedAchievements() {
  const achievements = [
    { title: 'Profile 80% Unlocked', desc: 'Added transcripts & test scores', icon: Target, unlocked: true },
    { title: 'First Application Sent', desc: 'Submitted to top 50 school', icon: Send, unlocked: true },
    { title: 'Interview Ready', desc: 'Completed 3 AI mock sessions', icon: Video, unlocked: true },
    { title: 'Scholarship Eligible', desc: 'Matched with 5+ merit grants', icon: Award, unlocked: false },
  ]

  return (
    <div className={CARD_STYLE}>
      <div className="flex items-center justify-between pb-[16px] mb-[16px] border-b border-border">
        <div className="flex items-center gap-[8px]">
          <Flame className="text-[#dd5b00]" size={18} />
          <h2 className="text-[16px] font-bold text-foreground tracking-tight">Milestones & Achievements</h2>
        </div>
        <span className="text-[12px] font-semibold text-primary">3 of 4 Unlocked</span>
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
   SECTION 9: INSIGHTS & ANALYTICS
   ========================================================================= */
function StudentInsightsAnalytics() {
  return (
    <div className={CARD_STYLE}>
      <div className="flex items-center justify-between pb-[16px] mb-[16px] border-b border-border">
        <div className="flex items-center gap-[8px]">
          <BarChart3 className="text-primary" size={18} />
          <h2 className="text-[16px] font-bold text-foreground tracking-tight">Admission Insights & Probabilities</h2>
        </div>
        <span className="text-[11px] font-bold bg-primary/15 text-primary px-[8px] py-[2px] rounded-full">
          AI Engine Predictive
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-[16px]">
        <div className="p-[14px] bg-muted border border-border rounded-[10px]">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase">Acceptance Chance</p>
          <p className="text-[24px] font-extrabold text-success leading-tight mt-[4px]">78% High</p>
          <p className="text-[11px] text-muted-foreground mt-[2px]">Top target universities</p>
        </div>

        <div className="p-[14px] bg-muted border border-border rounded-[10px]">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase">Pipeline Health</p>
          <p className="text-[24px] font-extrabold text-primary leading-tight mt-[4px]">Optimal</p>
          <p className="text-[11px] text-muted-foreground mt-[2px]">4 active applications</p>
        </div>

        <div className="p-[14px] bg-muted border border-border rounded-[10px]">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase">University Fit Index</p>
          <p className="text-[24px] font-extrabold text-[#391c57] leading-tight mt-[4px]">92% Match</p>
          <p className="text-[11px] text-muted-foreground mt-[2px]">Aligned with career goals</p>
        </div>
      </div>
    </div>
  )
}

/* =========================================================================
   SECTION 11: UNIVERSITY RECOMMENDATIONS CAROUSEL
   ========================================================================= */
function UniversityRecommendationsGrid({ universities }: { universities: any[] }) {
  // Sort by aiMatch (Firestore field) desc, fall back to placementRate, then take top 3
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
          <p className="text-[12px] text-muted-foreground">AI-matched universities based on your profile & test scores</p>
        </div>
        <Link href="/student/universities" className="text-[12px] font-semibold text-primary hover:underline">
          Explore All →
        </Link>
      </div>

      {topUnis.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-[32px] gap-[10px] text-center">
          <div className="w-[44px] h-[44px] rounded-full bg-muted flex items-center justify-center">
            <GraduationCap size={20} className="text-muted-foreground" />
          </div>
          <p className="text-[14px] font-semibold text-foreground">No universities available</p>
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
              💡 <strong>Today&apos;s AI Advice:</strong> Submitting your SOP early increases review turnaround time by 40%. Want me to review your SOP now?
            </p>

            <div className="flex flex-col gap-[6px]">
              <Link href="/student/sop" className={BUTTON_PRIMARY + " w-full justify-center text-[12px] h-[32px]"}>
                Review SOP with AI
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
  const { loading, error, uniqueApps, profile, profileScore, universities } = useStudentData()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-[36px] h-[36px] border-[3px] border-border border-t-[#0075de] rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-[24px] text-[13px] text-[#EF4444] bg-[#FEF2F2] rounded-[12px] border border-[#FECACA]">
        Error loading dashboard: {error}
      </div>
    )
  }

  const safeApps = uniqueApps || []
  const safeUnis = universities || []

  return (
    <div className="flex flex-col gap-[24px] pb-[40px]">
      {/* SECTION 1: Welcome Area */}
      <WelcomeArea profile={profile} profileScore={profileScore || 73} appsCount={safeApps.length} />

      {/* Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[24px]">
        <ProfileStrengthWorkspace profileScore={profileScore || 73} />
        <UniversityRecommendationsGrid universities={safeUnis} />
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[24px]">
        <TodaysFocus />
        <UpcomingDeadlinesTimeline />
      </div>

      {/* Row 3 */}
      <ApplicationPipeline apps={safeApps} />

      {/* Row 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[24px]">
        <GamifiedAchievements />
        <StudentInsightsAnalytics />
      </div>

      {/* Floating AI Assistant Widget */}
      <FloatingAIAssistantWidget />
    </div>
  )
}
