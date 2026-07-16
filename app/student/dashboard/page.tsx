'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  FileText, CheckCircle, ArrowUpRight, Check,
  ShieldCheck, Zap, Calendar, Building2,
  FileCheck2, FileWarning, Clock4, ChevronRight, Activity,
  Clock, Flame, LineChart, Sparkles, Plus, Bookmark
} from 'lucide-react'
import { useStudentData } from '@/components/providers/StudentDataProvider'
import dynamic from 'next/dynamic'

const ProfileStrengthCard = dynamic(() => import('@/components/dashboard/ProfileStrengthCard').then(mod => mod.ProfileStrengthCard), { ssr: false })
const AdmissionChecklistCard = dynamic(() => import('@/components/dashboard/AdmissionChecklistCard').then(mod => mod.AdmissionChecklistCard), { ssr: false })
const DashboardRecommendationWidget = dynamic(() => import('@/components/dashboard/RecommendationWidget').then(mod => mod.DashboardRecommendationWidget), { ssr: false })
const ScholarshipWidget = dynamic(() => import('@/components/dashboard/ScholarshipWidget').then(mod => mod.ScholarshipWidget), { ssr: false })
const DeadlineWidget = dynamic(() => import('@/components/dashboard/DeadlineWidget').then(mod => mod.DeadlineWidget), { ssr: false })

// Animations
const itemFade = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
}
const containerFade = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } }
}

export default function StudentDashboard() {
  const { 
    applications, loading, error, 
    deadlines, documents, activeApp, uniqueApps, selectedOffers,
    aiMatches, notifications, profileScore, profile, savedPrograms
  } = useStudentData()

  if (loading) return (
    <div className="max-w-[1400px] mx-auto w-full pb-12 flex flex-col gap-5 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[#111114] border border-white/[0.04] rounded-[20px] p-4 h-[116px] flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/[0.03]" />
              <div className="w-24 h-4 bg-white/[0.03] rounded-full" />
            </div>
            <div className="flex justify-between items-end">
              <div className="w-16 h-8 bg-white/[0.03] rounded-md" />
              <div className="w-20 h-5 bg-white/[0.03] rounded-full" />
            </div>
          </div>
        ))}
      </div>
      <div className="bg-[#111114] border border-white/[0.04] rounded-[24px] p-6 h-[104px] flex items-center justify-between">
         <div className="flex items-center gap-5">
           <div className="w-14 h-14 rounded-[16px] bg-white/[0.03]" />
           <div className="space-y-2">
             <div className="w-40 h-5 bg-white/[0.03] rounded-full" />
             <div className="w-28 h-4 bg-white/[0.03] rounded-full" />
           </div>
         </div>
         <div className="hidden sm:block w-32 h-10 rounded-full bg-white/[0.03]" />
      </div>
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 xl:col-span-8 bg-[#111114] border border-white/[0.04] rounded-[24px] p-6 h-[380px]" />
        <div className="col-span-12 xl:col-span-4 bg-[#111114] border border-white/[0.04] rounded-[24px] p-6 h-[380px]" />
      </div>
    </div>
  )

  if (error) return (
    <div className="p-8 text-red-400 text-sm">
      Warning: {error} - <button onClick={() => window.location.reload()} className="text-brand-indigoLight hover:underline ml-2">Retry</button>
    </div>
  )

  const metrics = [
    { label: 'Applications', value: uniqueApps ? uniqueApps.length : 0, sub: 'Total submitted', icon: FileText, gradient: 'from-[#4F46E5] to-[#7C3AED]', trendColor: 'text-brand-indigoLight' },
    { label: 'Offers', value: selectedOffers.length, sub: 'Received', icon: ShieldCheck, gradient: 'from-[#059669] to-[#10B981]', trendColor: 'text-emerald-400' },
    { label: 'Deadlines', value: deadlines.length, sub: 'Upcoming', icon: Calendar, gradient: 'from-[#D97706] to-[#F59E0B]', trendColor: 'text-amber-400' },
    { label: 'Documents', value: documents.length, sub: 'Uploaded', icon: FileCheck2, gradient: 'from-[#4338CA] to-[#6366F1]', trendColor: 'text-[#818CF8]' },
  ]

  const STATUS: any = {
    submitted: { bg: 'bg-brand-indigo/10', color: 'text-brand-indigoLight', border: 'border-brand-indigo/20', label: 'Submitted', progress: 25 },
    under_review: { bg: 'bg-amber-500/10', color: 'text-amber-400', border: 'border-amber-500/20', label: 'Under Review', progress: 50 },
    selected: { bg: 'bg-emerald-500/10', color: 'text-emerald-400', border: 'border-emerald-500/20', label: 'Selected', progress: 100 },
    waitlisted: { bg: 'bg-orange-500/10', color: 'text-orange-400', border: 'border-orange-500/20', label: 'Waitlisted', progress: 75 },
    rejected: { bg: 'bg-red-500/10', color: 'text-red-400', border: 'border-red-500/20', label: 'Rejected', progress: 100 },
  }

  return (
    <motion.div 
      variants={containerFade} 
      initial="hidden" 
      animate="show" 
      className="max-w-[1400px] mx-auto w-full pb-12 flex flex-col gap-5"
    >
      
      {/* 1. Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {metrics.map((m, i) => (
          <motion.div 
            variants={itemFade}
            key={i} 
            className="group relative bg-[#111114] border border-white/[0.06] hover:border-white/[0.12] rounded-[20px] p-4 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:-translate-y-0.5"
          >
            {/* Soft background glow on hover */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-[0.08] transition-opacity duration-500 bg-gradient-to-br ${m.gradient}`} />
            
            <div className="relative z-10 flex items-center gap-3 mb-3">
              <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${m.gradient} flex items-center justify-center text-white shadow-inner border border-white/10 group-hover:scale-105 transition-transform duration-300`}>
                <m.icon size={16} strokeWidth={2.5} />
              </div>
              <div className="text-[13px] font-medium text-white/60 tracking-wide">{m.label}</div>
            </div>
            
            <div className="relative z-10 flex items-end justify-between mt-2">
              <div>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5, type: 'spring' }}
                  className="text-[34px] font-display font-[800] text-white tracking-tighter leading-none group-hover:scale-[1.02] origin-left transition-transform"
                >
                  {m.value}
                </motion.div>
              </div>
              <div className="flex items-center gap-1.5 pb-1">
                <span className={`text-[11px] font-semibold ${m.trendColor} bg-white/[0.03] px-2.5 py-1 rounded-full border border-white/[0.05]`}>
                  {m.sub}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 2. Continue Application */}
      <motion.div variants={itemFade} className="bg-[#111114] border border-white/[0.06] hover:border-brand-indigo/30 transition-colors duration-500 rounded-[24px] p-5 md:p-6 relative overflow-hidden mb-5 flex flex-col md:flex-row items-center justify-between gap-6 group">
        <div className="absolute top-1/2 left-[20%] w-[300px] h-[300px] bg-brand-indigo/10 blur-[100px] rounded-full mix-blend-screen -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        
        {uniqueApps && uniqueApps.length > 0 && activeApp ? (
          <>
            <div className="flex items-center gap-5 z-10 w-full md:w-auto">
              <div className="w-14 h-14 rounded-[16px] bg-gradient-to-br from-[#1E1E24] to-[#111114] border border-white/[0.08] flex items-center justify-center text-white font-display font-bold text-[20px] shadow-inner shrink-0 group-hover:border-brand-indigo/30 transition-colors">
                {(activeApp.universityName || 'U').charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-[16px] font-display font-semibold text-white">{activeApp.universityName || 'University'}</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide border bg-brand-indigo/10 text-brand-indigoLight border-brand-indigo/20">
                    {STATUS[activeApp.status]?.label || 'In Progress'}
                  </span>
                </div>
                <p className="text-[13px] text-white/50 font-medium truncate max-w-[280px]">{activeApp.programName || 'Program not specified'}</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6 z-10 w-full md:w-auto">
              <div className="hidden sm:flex flex-col w-48">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">Completion</span>
                  <span className="text-[11px] font-bold text-white/70">{activeApp.progress || 25}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${activeApp.progress || 25}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-brand-indigo rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)]"
                  />
                </div>
              </div>
              <Link href={`/student/applications/${activeApp.id || ''}`} className="h-10 px-6 rounded-full bg-brand-indigo hover:bg-brand-indigoLight flex items-center justify-center text-[13px] font-semibold text-white transition-colors shadow-[0_4px_20px_rgba(79,70,229,0.4)] shrink-0 w-full md:w-auto">
                Continue Application
              </Link>
            </div>
          </>
        ) : (
          <div className="flex flex-col md:flex-row items-center justify-between w-full z-10 gap-4">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-brand-indigo/10 flex items-center justify-center text-brand-indigoLight shrink-0 border border-brand-indigo/20">
                <Plus size={24} />
              </div>
              <div>
                <h3 className="text-[16px] font-display font-semibold text-white mb-0.5">Start your journey</h3>
                <p className="text-[13px] text-white/50">Find your dream program and begin applying today.</p>
              </div>
            </div>
            <Link href="/student/discover" className="h-10 px-6 rounded-full bg-white text-black hover:bg-white/90 flex items-center justify-center text-[13px] font-semibold transition-colors shrink-0 w-full md:w-auto">
              Explore Programs
            </Link>
          </div>
        )}
      </motion.div>

      {/* 3. Main Bento Grid (12 cols) */}
      <div className="grid grid-cols-12 gap-5">
        
        {/* Applications (Span 8) */}
        <motion.div variants={itemFade} className="col-span-12 xl:col-span-8 bg-[#111114] border border-white/[0.06] rounded-[24px] p-6 flex flex-col h-[380px]">
          <div className="flex justify-between items-center mb-5 shrink-0">
            <h3 className="text-[15px] font-display font-semibold text-white">Active Applications</h3>
            <Link href="/student/applications" className="text-[12px] font-medium text-white/40 hover:text-white transition-colors flex items-center gap-1 group">
              View all <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-2">
            {(() => {
              if (uniqueApps.length === 0) {
                return (
                  <div className="h-full flex flex-col items-center justify-center bg-white/[0.02] border border-white/[0.04] rounded-[20px] p-8 text-center group hover:bg-white/[0.03] transition-colors">
                    <div className="w-16 h-16 rounded-full bg-brand-indigo/10 flex items-center justify-center text-brand-indigoLight mb-4 group-hover:scale-110 transition-transform duration-500">
                      <Building2 size={32} />
                    </div>
                    <h4 className="text-[16px] font-display font-semibold text-white mb-2">No active applications</h4>
                    <p className="text-[13px] text-white/50 mb-6 max-w-[260px]">Your future starts here. Discover top universities and begin your application journey.</p>
                    <Link href="/student/discover" className="h-10 px-6 bg-brand-indigo rounded-full text-[13px] font-semibold text-white flex items-center justify-center hover:bg-brand-indigoLight hover:shadow-[0_4px_20px_rgba(79,70,229,0.4)] transition-all">
                      Discover Universities
                    </Link>
                  </div>
                )
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {uniqueApps.slice(0, 4).map((app: any) => {
                    const s = STATUS[app.status] || STATUS.submitted;
                    const date = app.appliedAt?.toDate ? app.appliedAt.toDate().toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : 'Recently';
                    const deadline = app.deadline || 'Rolling';
                    
                    return (
                      <motion.div 
                        key={app.id} 
                        whileHover={{ scale: 1.02, y: -2 }}
                        className="group relative p-5 bg-[#14141A] border border-white/[0.04] hover:bg-[#1A1A24] hover:border-white/[0.08] hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] rounded-[20px] transition-all duration-300 flex flex-col justify-between"
                      >
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-brand-indigo/10 to-transparent pointer-events-none rounded-[20px]" />
                        
                        <div className="relative z-10">
                          <div className="flex justify-between items-start mb-4">
                            <div className="w-11 h-11 rounded-[12px] bg-gradient-to-br from-[#1E1E24] to-[#111114] border border-white/[0.08] flex items-center justify-center text-white font-display font-bold text-[16px] shadow-inner group-hover:border-brand-indigo/30 transition-colors shrink-0">
                              {(app.universityName || 'U').charAt(0)}
                            </div>
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide border ${s.bg} ${s.color} ${s.border}`}>
                              {s.label}
                            </span>
                          </div>
                          
                          <div className="mb-4">
                            <h4 className="text-[15px] font-semibold text-white truncate mb-0.5">{app.universityName || 'University Name'}</h4>
                            <p className="text-[12px] text-white/50 truncate font-medium">{app.programName || 'Program not specified'}</p>
                          </div>
                          
                          <div className="mb-4">
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Progress</span>
                              <span className="text-[10px] font-bold text-white/70">{app.progress || s.progress}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${app.progress || s.progress}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-brand-indigo rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)]"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-white/[0.04]">
                            <div className="flex gap-5">
                              <div className="flex flex-col gap-1">
                                <span className="text-[9px] font-semibold text-white/40 uppercase tracking-wider leading-none">Deadline</span>
                                <span className="text-[11px] font-medium text-white/80 leading-none">{deadline}</span>
                              </div>
                              <div className="flex flex-col gap-1">
                                <span className="text-[9px] font-semibold text-white/40 uppercase tracking-wider leading-none">Updated</span>
                                <span className="text-[11px] font-medium text-white/80 leading-none">{date}</span>
                              </div>
                            </div>
                            <Link href={`/student/applications/${app.id}`} className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-white/50 group-hover:bg-brand-indigo group-hover:text-white group-hover:border-brand-indigo transition-all shrink-0 group-hover:scale-110 shadow-sm">
                              <ArrowUpRight size={14} />
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )
            })()}
          </div>
        </motion.div>

        {/* AI Recommendations (Span 4) */}
        <motion.div variants={itemFade} className="col-span-12 xl:col-span-4 h-[380px]">
          <DashboardRecommendationWidget />
        </motion.div>

        {/* Upcoming Deadlines (Span 4) */}
        <motion.div variants={itemFade} className="col-span-12 xl:col-span-4 h-[380px]">
          <DeadlineWidget className="h-full" />
        </motion.div>

        {/* Document Vault (Span 4) */}
        <motion.div variants={itemFade} className="col-span-12 xl:col-span-4 bg-[#111114] border border-white/[0.06] rounded-[24px] p-6 h-[380px] flex flex-col">
          <h3 className="text-[15px] font-display font-semibold text-white mb-5 shrink-0 flex items-center gap-2">
            <FileCheck2 size={16} className="text-brand-indigoLight" />
            Document Vault
          </h3>
          <div className="flex-1 flex flex-col justify-start gap-3 custom-scrollbar overflow-y-auto">
            {documents.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center bg-white/[0.02] border border-white/[0.04] rounded-[20px] p-6 text-center group hover:bg-white/[0.03] transition-colors">
                <div className="w-14 h-14 rounded-full bg-brand-indigo/10 flex items-center justify-center text-brand-indigoLight mb-4 group-hover:scale-110 transition-transform duration-500">
                  <FileCheck2 size={28} />
                </div>
                <h4 className="text-[15px] font-display font-semibold text-white mb-2">Vault is empty</h4>
                <p className="text-[12px] text-white/50 mb-5 max-w-[220px]">Upload your transcripts and identity proofs to start verification.</p>
                <Link href="/student/documents" className="h-9 px-5 bg-white/[0.05] border border-white/10 hover:border-white/30 rounded-full text-[12px] font-semibold text-white flex items-center justify-center transition-colors">
                  Go to Vault
                </Link>
              </div>
            ) : (
              documents.map((doc: any, i: number) => {
                const isVerified = doc.status === 'Verified';
                const isMissing = doc.status === 'Missing' || doc.status === 'Rejected';
                const sColor = isVerified ? 'text-emerald-400' : isMissing ? 'text-red-400' : 'text-amber-400';
                const sBg = isVerified ? 'bg-emerald-500/10' : isMissing ? 'bg-red-500/10' : 'bg-amber-500/10';
                const sBorder = isVerified ? 'border-emerald-500/20' : isMissing ? 'border-red-500/20' : 'border-amber-500/20';
                const Icon = isVerified ? FileCheck2 : isMissing ? FileWarning : Clock4;
                
                return (
                  <div key={i} className="group flex items-center justify-between p-3 rounded-[16px] bg-[#14141A] border border-white/[0.04] hover:bg-[#1A1A24] hover:border-white/[0.08] hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)] transition-all duration-300 shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-[12px] ${sBg} border ${sBorder} flex items-center justify-center ${sColor} shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0 pr-2">
                        <div className="text-[13px] font-semibold text-white/90 truncate">{doc.name || 'Document'}</div>
                        <div className="text-[11px] text-white/40 mt-0.5">PDF • {doc.size || 'Unknown size'}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide border ${sBg} ${sColor} ${sBorder}`}>
                        {doc.status || 'Pending'}
                      </span>
                      
                      <button className={`h-7 px-3 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-[10px] font-semibold transition-all ${
                        isMissing 
                          ? 'text-white/70 hover:bg-white hover:text-black hover:border-white' 
                          : 'text-white/40 hover:bg-brand-indigo hover:text-white hover:border-brand-indigo'
                      }`}>
                        {isMissing ? 'Upload' : 'View'}
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </motion.div>

        {/* Admission Checklist (Span 4) */}
        <motion.div variants={itemFade} className="col-span-12 xl:col-span-4 h-[380px]">
          <AdmissionChecklistCard className="h-full border-brand-indigo/20 shadow-[0_4px_30px_rgba(79,70,229,0.1)]" />
        </motion.div>

        {/* Scholarships (Span 4) */}
        <motion.div variants={itemFade} className="col-span-12 xl:col-span-4 h-[380px]">
          <ScholarshipWidget className="h-full" />
        </motion.div>

        {/* Analytics (Span 4) */}
        <motion.div variants={itemFade} className="col-span-12 xl:col-span-4 h-[380px]">
          <ProfileStrengthCard />
        </motion.div>

        {/* Offers (Span 4) */}
        <motion.div variants={itemFade} className="col-span-12 md:col-span-6 xl:col-span-3 bg-[#111114] border border-white/[0.06] rounded-[24px] p-6 h-[260px] flex flex-col">
          <h3 className="text-[15px] font-display font-semibold text-white mb-5 shrink-0 flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-400" />
            Latest Offers
          </h3>
          <div className="flex-1 flex flex-col justify-start custom-scrollbar overflow-y-auto">
            {(uniqueApps.filter((a: any) => a?.status === 'selected')).length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center bg-white/[0.02] border border-white/[0.04] rounded-[20px] p-4 text-center group hover:bg-white/[0.03] transition-colors">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-110 transition-transform duration-500">
                  <ShieldCheck size={24} />
                </div>
                <h4 className="text-[14px] font-display font-semibold text-white mb-1">No offers yet</h4>
                <p className="text-[11px] text-white/50 mb-4 max-w-[180px]">Keep applying and checking your dashboard.</p>
                <Link href="/student/applications" className="h-8 px-4 bg-white/[0.05] border border-white/10 hover:border-white/30 rounded-full text-[11px] font-semibold text-white flex items-center justify-center transition-colors">
                  Track Applications
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {(uniqueApps.filter((a: any) => a?.status === 'selected')).map((app: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-2 bg-[#14141A] rounded-[12px] border border-white/[0.04]">
                    <div className="w-10 h-10 rounded-[10px] bg-[#1E1E24] flex items-center justify-center text-white font-bold text-[14px]">{(app.universityName || 'U').charAt(0)}</div>
                    <div>
                      <div className="text-[13px] font-semibold text-white truncate max-w-[120px]">{app.universityName}</div>
                      <div className="text-[11px] text-emerald-400 font-medium mt-0.5">Offer Received</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Saved Universities (Span 3) */}
        <motion.div variants={itemFade} className="col-span-12 md:col-span-6 xl:col-span-3 bg-[#111114] border border-white/[0.06] rounded-[24px] p-6 h-[260px] flex flex-col">
          <h3 className="text-[15px] font-display font-semibold text-white mb-5 shrink-0 flex items-center gap-2">
            <Bookmark size={16} className="text-[#818CF8]" />
            Saved Programs
          </h3>
          <div className="flex-1 flex flex-col justify-start custom-scrollbar overflow-y-auto">
            {(!savedPrograms || savedPrograms.length === 0) ? (
              <div className="h-full flex flex-col items-center justify-center bg-white/[0.02] border border-white/[0.04] rounded-[20px] p-4 text-center group hover:bg-white/[0.03] transition-colors">
                <div className="w-12 h-12 rounded-full bg-[#818CF8]/10 flex items-center justify-center text-[#818CF8] mb-3 group-hover:scale-110 transition-transform duration-500">
                  <Bookmark size={24} />
                </div>
                <h4 className="text-[14px] font-display font-semibold text-white mb-1">No saved programs</h4>
                <p className="text-[11px] text-white/50 mb-4 max-w-[180px]">Bookmark programs to apply later.</p>
                <Link href="/student/discover" className="h-8 px-4 bg-white/[0.05] border border-white/10 hover:border-white/30 rounded-full text-[11px] font-semibold text-white flex items-center justify-center transition-colors">
                  Explore Now
                </Link>
              </div>
            ) : (
              <div className="text-[12px] text-white/50 text-center mt-4">Saved programs will appear here.</div>
            )}
          </div>
        </motion.div>

      </div>
    </motion.div>
  )
}
