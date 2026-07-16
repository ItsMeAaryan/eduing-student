'use client'

import React, { useState, useMemo } from 'react'
import { 
  Search, LayoutGrid, CheckCircle2, Clock, Calendar, 
  Building2, X, FileText, Zap, Sparkles, ShieldCheck, 
  AlertCircle, ChevronDown, MoreHorizontal
} from 'lucide-react'
import { useStudentData } from '@/components/providers/StudentDataProvider'
import ProtectedRoute from '@/components/ProtectedRoute'
import { motion, AnimatePresence } from 'framer-motion'

// Status normalization
function normalizeStatus(status: string) {
  if (!status) return 'draft'
  const s = status.toLowerCase()
  if (s === 'submitted') return 'submitted'
  if (s === 'review' || s === 'under_review') return 'under_review'
  if (s === 'interview') return 'interview'
  if (s === 'accepted' || s === 'selected') return 'accepted'
  if (s === 'reject' || s === 'rejected') return 'rejected'
  return 'draft'
}

const COLUMNS = [
  { id: 'draft', label: 'Draft' },
  { id: 'submitted', label: 'Submitted' },
  { id: 'under_review', label: 'Under Review' },
  { id: 'interview', label: 'Interview' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'rejected', label: 'Rejected' }
];

export default function ApplicationsPage() {
  const { uniqueApps, loading, deadlines } = useStudentData()
  const [search, setSearch] = useState('')
  const [selectedApp, setSelectedApp] = useState<any | null>(null)

  const filteredApps = useMemo(() => {
    const appsToFilter = uniqueApps || []
    return appsToFilter.filter((app: any) => {
      const matchSearch = !search || 
        app.universityName?.toLowerCase().includes(search.toLowerCase()) ||
        app.program?.toLowerCase().includes(search.toLowerCase())
      return matchSearch
    })
  }, [uniqueApps, search])

  const applications = uniqueApps || []

  const activeApps = applications.filter((a: any) => {
    const s = normalizeStatus(a.status)
    return s !== 'accepted' && s !== 'rejected'
  }).length
  
  const submittedApps = applications.filter((a: any) => normalizeStatus(a.status) === 'submitted').length
  const offersReceived = applications.filter((a: any) => normalizeStatus(a.status) === 'accepted').length
  const upcomingDeadlines = deadlines?.length || 0

  if (loading) return (
    <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-[#6D5DF6]/30 border-t-[#6D5DF6] rounded-full animate-spin" />
    </div>
  )

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="min-h-screen bg-[#09090B] text-white font-sans selection:bg-[#6D5DF6]/30">
        
        {/* Sticky Toolbar */}
        <div className="sticky top-0 z-40 bg-[#09090B]/90 backdrop-blur-xl border-b border-white/5 px-8 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto no-scrollbar">
            <div className="relative w-full md:w-64 shrink-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input 
                type="text" 
                placeholder="Search..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#111113] border border-white/5 rounded-full py-3 pl-12 pr-4 text-[14px] text-white focus:outline-none focus:border-[#6D5DF6]/50 transition-colors placeholder:text-gray-500"
              />
            </div>
            <ToolbarSelect label="Status" />
            <ToolbarSelect label="State" />
            <ToolbarSelect label="Course" />
            <ToolbarSelect label="Deadline" />
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <ToolbarSelect label="Sort" />
            <div className="h-6 w-px bg-white/10" />
            <button className="p-2 text-gray-500 hover:text-white transition-colors rounded-full hover:bg-white/5">
              <LayoutGrid size={20} />
            </button>
          </div>
        </div>

        <div className="p-8 pb-32 max-w-full overflow-x-hidden">
          {/* HEADER */}
          <div className="mb-12">
            <h1 className="text-[48px] font-medium tracking-tight mb-4">Applications</h1>
            <p className="text-[16px] text-gray-400">Track and manage your admission journey.</p>
          </div>

          {/* SECTION 1: Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <MetricCard title="Active Applications" value={activeApps} icon={Building2} />
            <MetricCard title="Submitted" value={submittedApps} icon={CheckCircle2} />
            <MetricCard title="Offers Received" value={offersReceived} icon={ShieldCheck} />
            <MetricCard title="Upcoming Deadlines" value={upcomingDeadlines} icon={Clock} />
          </div>

          {/* SECTION 2: Pipeline */}
          {filteredApps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-[#111113] border border-white/5 rounded-[24px]">
               <div className="w-16 h-16 bg-[#151519] border border-white/5 rounded-[16px] flex items-center justify-center mb-8">
                 <Building2 size={24} className="text-gray-400" />
               </div>
               <h3 className="text-[28px] font-medium text-white mb-4">Start Your First Application</h3>
               <p className="text-[16px] text-gray-400 mb-8 max-w-md text-center">Your pipeline is currently empty. Explore top universities and begin your admission journey.</p>
               <button onClick={() => window.location.href='/student/discover'} className="px-8 py-4 bg-[#6D5DF6] hover:bg-[#6D5DF6]/90 text-white text-[14px] font-medium rounded-full transition-colors">
                 Explore Universities
               </button>
            </div>
          ) : (
            <div className="flex gap-6 overflow-x-auto pb-8 no-scrollbar snap-x items-start">
              {COLUMNS.map(col => {
                const colApps = filteredApps.filter((a: any) => normalizeStatus(a.status) === col.id)
                return (
                  <div key={col.id} className="min-w-[320px] max-w-[320px] flex-shrink-0 snap-center">
                    <div className="flex items-center justify-between mb-6 px-2">
                      <h3 className="text-[14px] font-medium text-gray-400">{col.label}</h3>
                      <span className="text-[12px] text-gray-500 bg-[#111113] border border-white/5 px-2 py-0.5 rounded-full">{colApps.length}</span>
                    </div>
                    <div className="flex flex-col gap-6">
                      {colApps.map((app: any) => (
                        <ApplicationCard key={app.id} app={app} onClick={() => setSelectedApp(app)} />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* DETAILS DRAWER */}
        <AnimatePresence>
          {selectedApp && (
            <ApplicationDrawer app={selectedApp} onClose={() => setSelectedApp(null)} />
          )}
        </AnimatePresence>
        
      </div>
    </ProtectedRoute>
  )
}

function ToolbarSelect({ label }: { label: string }) {
  return (
    <button className="flex items-center gap-2 px-6 py-3 bg-[#111113] border border-white/5 rounded-full text-[14px] text-gray-400 hover:text-white transition-colors shrink-0">
      {label} <ChevronDown size={14} />
    </button>
  )
}

function MetricCard({ title, value, icon: Icon }: { title: string, value: string | number, icon: any }) {
  return (
    <div className="bg-[#151519] border border-white/5 rounded-[24px] p-8 flex flex-col justify-between group hover:border-white/10 transition-colors h-[180px]">
      <div className="text-gray-400">
        <Icon size={24} strokeWidth={1.5} />
      </div>
      <div>
        <div className="text-[48px] font-medium text-white leading-none tracking-tight mb-2">{value}</div>
        <div className="text-[14px] text-gray-400">{title}</div>
      </div>
    </div>
  )
}

function ApplicationCard({ app, onClick }: { app: any, onClick: () => void }) {
  const progress = app.progress || 25;
  const deadline = app.deadline || 'Rolling';

  return (
    <div 
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
      className="bg-[#151519] border border-white/5 rounded-[24px] p-6 cursor-pointer hover:-translate-y-1 hover:border-white/10 transition-all duration-300 shadow-sm group text-left"
    >
      <div className="flex justify-between items-start mb-8">
        <div className="w-12 h-12 bg-[#111113] border border-white/5 rounded-[16px] flex items-center justify-center text-[16px] font-medium text-white shrink-0">
          {(app.universityName || 'U').charAt(0)}
        </div>
        <button className="p-2 text-gray-600 hover:text-white transition-colors rounded-full" onClick={(e) => { e.stopPropagation(); }}>
          <MoreHorizontal size={16} />
        </button>
      </div>

      <div className="mb-8">
        <h4 className="text-[16px] font-medium text-white mb-2 leading-tight">{app.universityName || 'University'}</h4>
        <p className="text-[14px] text-gray-400 line-clamp-1">{app.program || 'Program Name'}</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center text-[12px]">
          <span className="text-gray-500 flex items-center gap-2"><Calendar size={12} /> {deadline}</span>
          <span className="text-[#6D5DF6] font-medium">{progress}%</span>
        </div>
        
        <div className="w-full h-1 bg-[#111113] rounded-full overflow-hidden">
          <div className="h-full bg-[#6D5DF6] rounded-full" style={{ width: `${progress}%` }} />
        </div>

        <button className="w-full py-3 mt-4 bg-[#111113] group-hover:bg-[#6D5DF6] rounded-[16px] text-[14px] font-medium text-white transition-colors border border-white/5 group-hover:border-transparent">
          Review Application
        </button>
      </div>
    </div>
  )
}

function ApplicationDrawer({ app, onClose }: { app: any, onClose: () => void }) {
  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
      />
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 bottom-0 w-full max-w-2xl bg-[#09090B] border-l border-white/5 z-50 overflow-y-auto no-scrollbar flex flex-col"
      >
        {/* Drawer Header */}
        <div className="sticky top-0 bg-[#09090B]/90 backdrop-blur-xl border-b border-white/5 px-8 py-6 flex justify-between items-center z-10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-[#151519] border border-white/5 rounded-[16px] flex items-center justify-center text-[20px] font-medium text-white">
              {(app.universityName || 'U').charAt(0)}
            </div>
            <div>
              <h2 className="text-[24px] font-medium text-white mb-1">{app.universityName || 'University'}</h2>
              <p className="text-[16px] text-gray-400">{app.program || 'Program Name'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-[#111113] border border-white/5 rounded-full text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-8 flex flex-col gap-12">
          
          {/* AI Panel */}
          <section>
            <h3 className="text-[20px] font-medium text-white mb-8 flex items-center gap-3">
              <Sparkles size={20} className="text-[#6D5DF6]" /> AI Analysis
            </h3>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-[#151519] border border-white/5 rounded-[24px] p-6">
                <div className="text-gray-400 text-[14px] mb-2">Admission Chance</div>
                <div className="text-[36px] font-medium text-white">85%</div>
              </div>
              <div className="bg-[#151519] border border-white/5 rounded-[24px] p-6">
                <div className="text-gray-400 text-[14px] mb-2">Profile Match</div>
                <div className="text-[36px] font-medium text-white">High</div>
              </div>
            </div>
            <div className="bg-[#151519] border border-white/5 rounded-[24px] p-6 flex flex-col gap-6">
               <div>
                 <div className="text-[14px] text-gray-400 mb-2">Missing Requirements</div>
                 <div className="text-[16px] text-white flex items-center gap-3"><AlertCircle size={16} className="text-orange-400" /> Letter of Recommendation</div>
               </div>
               <div className="h-px bg-white/5 w-full" />
               <div>
                 <div className="text-[14px] text-gray-400 mb-2">Next Best Action</div>
                 <div className="text-[16px] text-white flex items-center gap-3"><Zap size={16} className="text-[#6D5DF6]" /> Draft SOP using AI Builder</div>
               </div>
            </div>
          </section>

          {/* Timeline */}
          <section>
            <h3 className="text-[20px] font-medium text-white mb-8">Timeline</h3>
            <div className="relative pl-6 border-l border-white/10 flex flex-col gap-12 ml-4">
              <TimelineItem title="Application Started" date="Oct 12, 2025" completed={true} />
              <TimelineItem title="Documents Uploaded" date="Oct 15, 2025" completed={true} />
              <TimelineItem title="Application Submitted" date="Oct 20, 2025" completed={false} active={true} />
              <TimelineItem title="Under Review" date="Pending" completed={false} />
              <TimelineItem title="Decision" date="Pending" completed={false} />
            </div>
          </section>

          {/* Documents */}
          <section>
            <h3 className="text-[20px] font-medium text-white mb-8">Required Documents</h3>
            <div className="flex flex-col gap-4">
              {['Transcripts', 'Statement of Purpose', 'Passport Copy'].map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between bg-[#151519] border border-white/5 rounded-[20px] p-6">
                  <div className="flex items-center gap-4">
                    <FileText size={20} className="text-gray-500" />
                    <span className="text-[16px] text-white">{doc}</span>
                  </div>
                  {idx === 0 ? (
                    <span className="text-[14px] text-green-400 flex items-center gap-2"><CheckCircle2 size={16} /> Uploaded</span>
                  ) : (
                    <button className="text-[14px] text-[#6D5DF6] hover:text-white transition-colors font-medium">Upload</button>
                  )}
                </div>
              ))}
            </div>
          </section>

        </div>
      </motion.div>
    </>
  )
}

function TimelineItem({ title, date, completed, active = false }: { title: string, date: string, completed: boolean, active?: boolean }) {
  return (
    <div className="relative">
      <div className={`absolute -left-[31px] top-1 w-[12px] h-[12px] rounded-full border-2 bg-[#09090B] ${completed ? 'border-green-400' : active ? 'border-[#6D5DF6]' : 'border-white/20'}`} />
      <div className="flex flex-col gap-2">
        <span className={`text-[16px] font-medium ${completed || active ? 'text-white' : 'text-gray-500'}`}>{title}</span>
        <span className="text-[14px] text-gray-500">{date}</span>
      </div>
    </div>
  )
}
