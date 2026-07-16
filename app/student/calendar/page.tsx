"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar as CalendarIcon, Sparkles, ChevronLeft, ChevronRight,
  Clock, CheckCircle2, AlertCircle, X, ExternalLink, GraduationCap,
  MapPin, CalendarDays, Flame, ShieldAlert, Search, Filter, 
  AlignLeft, LayoutGrid, CalendarRange, TrendingUp, Flag
} from "lucide-react";
import { useStudentData } from "@/components/providers/StudentDataProvider";
import { useRouter } from "next/navigation";
import { generateDeadlineInsights, DeadlineInsight } from "@/lib/utils/deadlineEngine";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AdmissionPlannerPage() {
  const router = useRouter();
  const { deadlines, uniqueApps, documents, profileScore, loading } = useStudentData();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<DeadlineInsight | null>(null);
  const [activeView, setActiveView] = useState<'Timeline' | 'Calendar'>('Timeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const { insights, upcomingDeadlines, completedDeadlines, criticalTasks, weeklyPlan } = useMemo(() => {
    return generateDeadlineInsights({
      deadlines: deadlines || [],
      applications: uniqueApps || [],
      documents: documents || [],
      profileScore: profileScore || 0
    });
  }, [deadlines, uniqueApps, documents, profileScore]);

  // Calendar logic
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonthClick = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const currentMonthEvents = insights.filter(e => 
    e.date.getMonth() === currentDate.getMonth() && 
    e.date.getFullYear() === currentDate.getFullYear()
  ).sort((a, b) => a.date.getTime() - b.date.getTime());

  // Filtered insights for timeline
  const filteredInsights = useMemo(() => {
    return insights.filter(i => {
      const matchSearch = i.title.toLowerCase().includes(searchQuery.toLowerCase()) || (i.universityName || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchFilter = activeFilter === 'All' || i.priority === activeFilter || (activeFilter === 'Completed' && i.status === 'Completed');
      return matchSearch && matchFilter;
    }).sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [insights, searchQuery, activeFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-[#6D5DF6]/30 border-t-[#6D5DF6] rounded-full animate-spin" />
      </div>
    );
  }

  const getPriorityStyle = (priority: string) => {
    switch(priority) {
      case 'Completed': return { bg: 'bg-emerald-400/5', text: 'text-emerald-400', border: 'border-emerald-400/10', glow: 'shadow-[0_0_20px_rgba(52,211,153,0.1)]' };
      case 'Critical': return { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', glow: 'shadow-[0_0_20px_rgba(244,63,94,0.15)]' };
      case 'High': return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.1)]' };
      case 'Medium': return { bg: 'bg-[#6D5DF6]/10', text: 'text-[#6D5DF6]', border: 'border-[#6D5DF6]/20', glow: 'shadow-[0_0_20px_rgba(109,93,246,0.1)]' };
      default: return { bg: 'bg-white/5', text: 'text-gray-400', border: 'border-white/5', glow: '' };
    }
  };

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="min-h-screen bg-[#09090B] text-white selection:bg-[#6D5DF6]/30 font-sans pb-32 overflow-hidden relative">
        
        {/* HEADER */}
        <section className="pt-24 pb-8 px-8 max-w-[1600px] mx-auto border-b border-white/5">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-8">
            <div>
              <h1 className="text-[48px] font-medium tracking-tight mb-2">Admission Planner</h1>
              <p className="text-[16px] text-gray-400 max-w-xl">Stay ahead of every admission milestone with AI-driven prioritization.</p>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">
              <div className="relative flex-1 md:w-64 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#6D5DF6] transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#151519] border border-white/5 rounded-full pl-12 pr-4 py-3.5 text-[14px] text-white placeholder:text-gray-500 focus:border-[#6D5DF6]/50 outline-none transition-all"
                />
              </div>
              <div className="flex items-center gap-2 bg-[#151519] border border-white/5 p-1 rounded-full">
                <button onClick={() => setActiveView('Timeline')} className={`px-4 py-2.5 rounded-full text-[14px] font-medium flex items-center gap-2 transition-all ${activeView === 'Timeline' ? 'bg-[#6D5DF6] text-white' : 'text-gray-400 hover:text-white'}`}>
                  <AlignLeft size={16} /> Timeline
                </button>
                <button onClick={() => setActiveView('Calendar')} className={`px-4 py-2.5 rounded-full text-[14px] font-medium flex items-center gap-2 transition-all ${activeView === 'Calendar' ? 'bg-[#6D5DF6] text-white' : 'text-gray-400 hover:text-white'}`}>
                  <CalendarRange size={16} /> Calendar
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 bg-[#151519] border border-white/5 rounded-full px-2 py-1">
              <button onClick={prevMonth} className="p-2 text-gray-400 hover:text-white transition-colors"><ChevronLeft size={18} /></button>
              <div className="text-[14px] font-medium min-w-[120px] text-center">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</div>
              <button onClick={nextMonthClick} className="p-2 text-gray-400 hover:text-white transition-colors"><ChevronRight size={18} /></button>
            </div>
            <button onClick={goToToday} className="px-6 py-2.5 bg-white/5 hover:bg-white/10 rounded-full text-[14px] font-medium text-white transition-colors">
              Today
            </button>
          </div>
        </section>

        {/* FILTERS STICKY TOOLBAR */}
        <div className="sticky top-0 z-40 bg-[#09090B]/80 backdrop-blur-xl border-b border-white/5 py-4 px-8">
          <div className="max-w-[1600px] mx-auto flex items-center gap-3 overflow-x-auto no-scrollbar">
            {['All', 'Critical', 'High', 'Medium', 'Completed'].map(f => (
              <button 
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-5 py-2 rounded-full text-[12px] font-medium transition-colors border ${activeFilter === f ? 'bg-[#6D5DF6] border-[#6D5DF6] text-white' : 'bg-[#151519] border-white/5 text-gray-400 hover:text-white'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto px-8 mt-12 flex flex-col xl:flex-row gap-12">
          
          <div className="flex-1 flex flex-col gap-16">
            {/* SECTION 1: TODAY'S AGENDA */}
            <section>
              <h2 className="text-[20px] font-medium mb-6 flex items-center gap-2"><Sparkles className="text-[#6D5DF6]" size={20} /> Today&apos;s Agenda</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <AgendaCard label="Today's Tasks" value={weeklyPlan.filter((t:any) => t.daysRemaining === 0).length} color="text-white" />
                <AgendaCard label="Critical Deadlines" value={criticalTasks.length} color="text-rose-400" />
                <AgendaCard label="Pending Documents" value={insights.filter(i => i.requiredDocuments.length > 0).length} color="text-amber-400" />
                <AgendaCard label="Upcoming Interv." value={insights.filter(i => i.title.toLowerCase().includes('interview')).length} color="text-[#6D5DF6]" />
              </div>
            </section>

            {/* SECTION 2 & 3: MAIN VIEWS */}
            {activeView === 'Timeline' ? (
              <section>
                {filteredInsights.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="relative pl-8 border-l border-white/10 ml-4 space-y-12">
                    {filteredInsights.map(insight => {
                      const style = getPriorityStyle(insight.priority);
                      return (
                        <div 
                          key={insight.id} 
                          className="relative group cursor-pointer" 
                          role="button"
                          tabIndex={0}
                          onClick={() => setSelectedEvent(insight)}
                          onKeyDown={(e) => { if(e.key === 'Enter') setSelectedEvent(insight); }}
                        >
                          <div className={`absolute -left-[45px] top-4 w-5 h-5 rounded-full border-[4px] border-[#09090B] ${style.bg.replace('/10', '')} transition-transform group-hover:scale-125 z-10`} />
                          
                          <div className={`bg-[#111113] border ${style.border} rounded-[24px] p-6 hover:shadow-2xl transition-all ${style.glow}`}>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                              <div className="flex flex-wrap items-center gap-3">
                                <div className={`px-3 py-1 rounded-full text-[12px] font-medium border ${style.bg} ${style.text} ${style.border}`}>
                                  {insight.priority}
                                </div>
                                <div className="text-[14px] text-gray-400 flex items-center gap-1.5"><Clock size={14}/> {insight.date.toLocaleDateString()}</div>
                              </div>
                              {insight.riskLevel === 'High Risk' && (
                                <div className="text-[12px] text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full flex items-center gap-1.5 border border-rose-500/20">
                                  <ShieldAlert size={12}/> High Risk
                                </div>
                              )}
                            </div>
                            
                            <h3 className="text-[20px] font-medium text-white mb-2">{insight.title}</h3>
                            <div className="flex items-center gap-2 text-[14px] text-gray-500 mb-6">
                              <MapPin size={14} className="text-[#6D5DF6]" /> {insight.universityName}
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <button className="px-6 py-2.5 bg-[#151519] border border-white/5 hover:bg-white/5 rounded-[12px] text-[12px] font-medium transition-colors">
                                View Details
                              </button>
                              <div className="text-[12px] text-gray-500 flex items-center gap-1.5">
                                <Clock size={12}/> Est. {insight.estimatedTime}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </section>
            ) : (
              <section>
                <div className="bg-[#111113] border border-white/5 rounded-[32px] p-8">
                  <div className="grid grid-cols-7 gap-4">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                      <div key={d} className="text-center text-[12px] font-medium text-gray-500 mb-4">{d}</div>
                    ))}
                    
                    {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                      <div key={`empty-${i}`} className="aspect-square rounded-[16px]" />
                    ))}
                    
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                      const isToday = dateObj.toDateString() === new Date().toDateString();
                      const dayEvents = currentMonthEvents.filter(e => e.date.getDate() === day);

                      return (
                        <div 
                          key={day} 
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => { if(e.key === 'Enter' && dayEvents.length > 0) setSelectedEvent(dayEvents[0]) }}
                          onClick={() => { if(dayEvents.length > 0) setSelectedEvent(dayEvents[0]) }}
                          className={`aspect-square rounded-[16px] p-3 transition-all relative flex flex-col group cursor-pointer
                            ${isToday ? 'bg-[#6D5DF6]/10 border border-[#6D5DF6]/30' : 'bg-[#151519] border border-white/5 hover:border-white/20'}
                          `}
                        >
                          <span className={`text-[14px] font-medium ${isToday ? 'text-[#6D5DF6]' : 'text-white'}`}>{day}</span>
                          <div className="mt-auto flex flex-col gap-1">
                            {dayEvents.slice(0, 2).map((e, idx) => {
                              const st = getPriorityStyle(e.priority);
                              return (
                                <div key={idx} className={`w-full truncate px-1.5 py-0.5 rounded-[4px] text-[9px] font-medium border ${st.bg} ${st.text} ${st.border}`}>
                                  {e.title}
                                </div>
                              )
                            })}
                            {dayEvents.length > 2 && <div className="text-[10px] text-gray-500 pl-1">+{dayEvents.length - 2} more</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}
          </div>

          <aside className="w-full xl:w-[400px] shrink-0 flex flex-col gap-12">
            
            {/* SECTION 4: UPCOMING MILESTONES */}
            <div className="bg-[#111113] border border-white/5 rounded-[32px] p-8 shadow-2xl">
              <h3 className="text-[18px] font-medium mb-8">Admission Roadmap</h3>
              <div className="relative pl-6 border-l border-white/10 ml-3 space-y-8">
                {['Application Submit', 'Document Verification', 'Interview Round', 'Admission Offer', 'Enrollment'].map((step, i) => (
                  <div key={i} className="relative">
                    <div className={`absolute -left-[31px] top-1 w-3 h-3 rounded-full ${i === 0 ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'bg-[#151519] border-2 border-white/20'}`} />
                    <h5 className={`text-[14px] font-medium ${i === 0 ? 'text-emerald-400' : 'text-white'}`}>{step}</h5>
                    <p className="text-[12px] text-gray-500">{i === 0 ? 'In Progress' : 'Pending'}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 5: AI PLANNER */}
            <div className="bg-[#151519] border border-[#6D5DF6]/20 rounded-[32px] p-8 shadow-[0_0_30px_rgba(109,93,246,0.05)]">
              <div className="flex items-center gap-2 text-[12px] font-medium text-[#6D5DF6] mb-4">
                <Sparkles size={14} /> AI Planner Insights
              </div>
              <h3 className="text-[20px] font-medium leading-tight mb-6">
                You have {criticalTasks.length} critical tasks pending this week. 
                {criticalTasks.length > 0 && " Prioritize application submissions."}
              </h3>
              
              {criticalTasks.length > 0 && (
                <div className="bg-rose-500/5 border border-rose-500/10 rounded-[16px] p-4 mb-4">
                  <div className="flex items-center gap-2 text-[12px] font-medium text-rose-400 mb-2">
                    <ShieldAlert size={14} /> High Risk Detected
                  </div>
                  <p className="text-[12px] text-gray-400">Missing documents could delay your processing for 2 applications.</p>
                </div>
              )}
              
              <button className="w-full py-4 bg-white hover:bg-gray-200 text-black rounded-[16px] text-[12px] font-medium transition-colors">
                Generate Smart Schedule
              </button>
            </div>

          </aside>

        </div>

        {/* DAY DRAWER */}
        <AnimatePresence>
          {selectedEvent && (
            <>
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSelectedEvent(null)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              />
              <motion.div 
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 h-full w-full max-w-[500px] bg-[#111113] border-l border-white/5 z-[60] shadow-2xl flex flex-col"
              >
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                  <div className="text-[12px] text-gray-400 font-medium">{selectedEvent.date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  <button onClick={() => setSelectedEvent(null)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                    <X size={16} />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8 space-y-10">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      {(() => {
                         const s = getPriorityStyle(selectedEvent.priority);
                         return <div className={`px-4 py-1.5 rounded-full text-[12px] font-medium border ${s.bg} ${s.text} ${s.border}`}>{selectedEvent.priority}</div>
                      })()}
                    </div>
                    <h2 className="text-[32px] font-medium leading-tight mb-4">{selectedEvent.title}</h2>
                    <div className="flex items-center gap-2 text-[16px] text-[#6D5DF6]">
                      <MapPin size={18} /> {selectedEvent.universityName}
                    </div>
                  </div>

                  <div className="bg-[#151519] border border-white/5 rounded-[24px] p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <div className="text-[12px] text-gray-500 mb-1">Estimated Time</div>
                        <div className="text-[16px] font-medium text-white">{selectedEvent.estimatedTime}</div>
                      </div>
                      <div>
                        <div className="text-[12px] text-gray-500 mb-1">Risk Assessment</div>
                        <div className={`text-[16px] font-medium ${selectedEvent.riskLevel === 'High Risk' ? 'text-rose-400' : 'text-emerald-400'}`}>{selectedEvent.riskLevel}</div>
                      </div>
                    </div>
                    
                    {selectedEvent.requiredDocuments.length > 0 && (
                      <div className="pt-6 border-t border-white/5">
                        <div className="text-[12px] text-amber-400 mb-3 flex items-center gap-2"><ShieldAlert size={14}/> Missing Documents</div>
                        <ul className="space-y-2">
                          {selectedEvent.requiredDocuments.map((doc, i) => (
                            <li key={i} className="text-[14px] text-gray-300 flex items-center gap-2"><AlertCircle size={14} className="text-amber-400"/> {doc}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-8 border-t border-white/5 bg-[#09090B] flex flex-col gap-3">
                  {selectedEvent.appId && (
                    <button onClick={() => router.push(`/student/applications/${selectedEvent.appId}`)} className="w-full py-4 bg-[#6D5DF6] hover:bg-[#6D5DF6]/90 rounded-[16px] text-[14px] font-medium text-white transition-colors flex justify-center gap-2 items-center">
                      Open Application <ExternalLink size={16} />
                    </button>
                  )}
                  {selectedEvent.status !== 'Completed' && (
                    <button className="w-full py-4 bg-[#151519] hover:bg-white/5 rounded-[16px] text-[14px] font-medium text-white transition-colors flex justify-center gap-2 items-center">
                      Mark as Complete <CheckCircle2 size={16} />
                    </button>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

      </div>
    </ProtectedRoute>
  );
}

function AgendaCard({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="bg-[#111113] border border-white/5 rounded-[24px] p-6 flex flex-col gap-2">
      <span className="text-[14px] font-medium text-gray-400">{label}</span>
      <span className={`text-[40px] font-medium ${color}`}>{value}</span>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 bg-[#111113] border border-white/5 rounded-[32px]">
      <CheckCircle2 size={48} className="text-emerald-400 mb-6" />
      <h3 className="text-[24px] font-medium mb-3">You&apos;re all caught up.</h3>
      <p className="text-[14px] text-gray-400 max-w-md text-center mb-8">No urgent admission tasks are pending for the selected filter.</p>
      <button className="px-8 py-4 bg-white hover:bg-gray-200 text-black rounded-full text-[14px] font-medium transition-colors">
        Explore Universities
      </button>
    </div>
  )
}
