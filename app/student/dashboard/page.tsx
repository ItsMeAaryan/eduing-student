'use client'

import React from 'react'
import Link from 'next/link'
import { Search, ArrowRight, FileText, UploadCloud, Calendar, Building2, TrendingUp, ShieldCheck, Sparkles, Zap, MessageSquare } from 'lucide-react'
import { useStudentData } from '@/components/providers/StudentDataProvider'

function MinimalCard({ 
  title, 
  value, 
  description, 
  actionLabel, 
  actionUrl, 
  icon: Icon, 
  className = "" 
}: { 
  title: string, 
  value: React.ReactNode, 
  description: string, 
  actionLabel: string, 
  actionUrl: string, 
  icon: any, 
  className?: string 
}) {
  return (
    <div className={`bg-[#151519] border border-white/5 rounded-[24px] p-8 flex flex-col h-full group hover:scale-[1.02] transition-transform duration-300 ${className}`}>
      <div className="flex items-center gap-2 mb-12">
        <Icon size={20} strokeWidth={1.5} className="text-gray-400" />
        <span className="text-[16px] text-white font-medium">{title}</span>
      </div>
      
      <div className="flex-1 flex flex-col justify-end mb-12">
        <div className="text-[36px] font-medium text-white tracking-tight leading-none mb-4">{value}</div>
        <p className="text-[14px] text-gray-400 leading-relaxed max-w-[280px]">{description}</p>
      </div>
      
      <div>
        {actionUrl && (
          <Link href={actionUrl} className="text-[14px] text-[#6D5DF6] hover:text-white transition-colors flex items-center gap-2 font-medium w-fit">
            {actionLabel} <ArrowRight size={16} />
          </Link>
        )}
      </div>
    </div>
  )
}

export default function StudentDashboard() {
  const { 
    loading, error, 
    documents, uniqueApps, selectedOffers,
    profile, deadlines, activeApp
  } = useStudentData()

  if (loading) return (
    <div className="max-w-[1400px] mx-auto w-full p-8 md:p-12 animate-pulse">
      <div className="w-64 h-12 bg-[#151519] rounded-[24px] mb-16" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-[#151519] border border-white/5 rounded-[24px] h-[320px]" />
        ))}
      </div>
    </div>
  )

  if (error) return (
    <div className="p-12 text-red-400 text-[14px]">
      Error loading dashboard: {error} - <button onClick={() => window.location.reload()} className="text-[#6D5DF6] hover:underline ml-2">Retry</button>
    </div>
  )

  const activeAppProgress = activeApp?.progress || 25;
  const missingDocsCount = documents?.filter((d: any) => d.status === 'Missing')?.length || 0;
  const upcomingDeadlinesCount = deadlines?.length || 0;

  return (
    <div className="max-w-[1400px] mx-auto w-full p-8 md:p-12 pb-16">
      
      {/* SECTION 1: Welcome Back */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
        <div>
          <h1 className="text-[48px] font-medium text-white tracking-tight mb-2">
            Welcome back, {profile?.firstName || 'Student'}.
          </h1>
          <p className="text-[16px] text-gray-400">
            Your future is waiting. Let&apos;s make progress today.
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input 
            type="text" 
            placeholder="Quick Search" 
            className="w-full bg-[#151519] border border-white/5 rounded-[24px] py-4 pl-12 pr-4 text-[14px] text-white focus:outline-none focus:border-[#6D5DF6]/50 transition-colors placeholder:text-gray-500" 
          />
        </div>
      </section>

      {/* SECTION 2: Today's Focus */}
      <section className="mb-16">
        <h2 className="text-[20px] font-medium text-white mb-8">Today&apos;s Focus</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MinimalCard 
            title="Continue Application"
            value={activeApp?.universityName || 'Stanford University'}
            description={activeApp ? `Pick up where you left off on your ${activeApp.programName || 'program'} application.` : 'Start a new application to your dream university.'}
            actionLabel={activeApp ? 'Continue' : 'Start Application'}
            actionUrl={activeApp ? `/student/applications/${activeApp.id}` : '/student/discover'}
            icon={FileText}
          />
          <MinimalCard 
            title="Missing Documents"
            value={missingDocsCount}
            description={missingDocsCount > 0 ? 'You have missing documents that need to be uploaded.' : 'All your required documents are safely stored in your vault.'}
            actionLabel={missingDocsCount > 0 ? 'Upload Documents' : 'View Vault'}
            actionUrl="/student/documents"
            icon={UploadCloud}
          />
          <MinimalCard 
            title="Upcoming Deadlines"
            value={upcomingDeadlinesCount}
            description={upcomingDeadlinesCount > 0 ? `You have ${upcomingDeadlinesCount} tasks due soon.` : 'You are completely caught up on your timeline.'}
            actionLabel="View Calendar"
            actionUrl="/student/calendar"
            icon={Calendar}
          />
        </div>
      </section>

      {/* SECTION 3: Applications */}
      <section className="mb-16">
        <h2 className="text-[20px] font-medium text-white mb-8">Applications</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MinimalCard 
            title="Active Applications"
            value={uniqueApps?.length || 0}
            description="Total number of university applications currently in progress."
            actionLabel="View Applications"
            actionUrl="/student/applications"
            icon={Building2}
          />
          <MinimalCard 
            title="Application Progress"
            value={`${activeAppProgress}%`}
            description="Overall completion rate of your primary active application."
            actionLabel="View Details"
            actionUrl="/student/applications"
            icon={TrendingUp}
          />
          <MinimalCard 
            title="Offer Status"
            value={selectedOffers?.length || 0}
            description="Congratulations! Number of admission offers you have received."
            actionLabel="View Offers"
            actionUrl="/student/applications"
            icon={ShieldCheck}
          />
        </div>
      </section>

      {/* SECTION 4: Recommendations */}
      <section className="mb-16">
        <h2 className="text-[20px] font-medium text-white mb-8">Recommendations</h2>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8">
            <MinimalCard 
              title="Recommended Universities"
              value="3 Top Matches"
              description="Our AI has found universities that perfectly align with your academic profile and career aspirations."
              actionLabel="Discover Universities"
              actionUrl="/student/discover"
              icon={Sparkles}
            />
          </div>
          <div className="md:col-span-4 flex flex-col gap-6">
            <MinimalCard 
              title="Scholarships"
              value="₹24L+"
              description="Potential financial aid available based on your eligibility."
              actionLabel="View Scholarships"
              actionUrl="/student/scholarships"
              icon={Building2}
            />
            <MinimalCard 
              title="Admission Probability"
              value="85%"
              description="Your estimated chance of admission to your top choices."
              actionLabel="Improve Profile"
              actionUrl="/student/profile"
              icon={TrendingUp}
            />
          </div>
        </div>
      </section>

      {/* SECTION 5: AI Assistant */}
      <section className="mb-16">
        <h2 className="text-[20px] font-medium text-white mb-8">AI Assistant</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MinimalCard 
            title="Copilot"
            value="Active"
            description="Your personal AI advisor is ready to help you navigate your journey."
            actionLabel="Chat with Copilot"
            actionUrl="/student/copilot"
            icon={Zap}
          />
          <MinimalCard 
            title="Recent Suggestions"
            value="2 Unread"
            description="New recommendations to strengthen your Statement of Purpose."
            actionLabel="View Suggestions"
            actionUrl="/student/copilot"
            icon={MessageSquare}
          />
          <MinimalCard 
            title="Quick Actions"
            value="Resume"
            description="Instantly generate or review your professional resume using AI."
            actionLabel="Open Builder"
            actionUrl="/student/resume"
            icon={FileText}
          />
        </div>
      </section>

    </div>
  )
}
