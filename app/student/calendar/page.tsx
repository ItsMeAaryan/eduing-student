"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar as CalendarIcon, Sparkles, ChevronLeft, ChevronRight,
  Clock, CheckCircle2, AlertCircle, X, ExternalLink, GraduationCap,
  MapPin, CalendarDays, FileText, Phone, CreditCard, PenTool, XCircle
} from "lucide-react";
import { useStudentData } from "@/components/providers/StudentDataProvider";
import { useRouter } from "next/navigation";

export default function CalendarPage() {
  const router = useRouter();
  const { deadlines: rawDeadlines, applications: rawApplications, loading } = useStudentData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  // Normalize events
  const events = useMemo(() => {
    const combined: any[] = [];
    const deadlines = Array.isArray(rawDeadlines) ? rawDeadlines : [];
    const applications = Array.isArray(rawApplications) ? rawApplications : [];

    // Add explicit deadlines
    deadlines.forEach((d: any) => {
      if (d.date) {
        combined.push({
          id: d.id || Math.random().toString(),
          title: d.title || 'Deadline',
          date: new Date(d.date?.toDate ? d.date.toDate() : d.date),
          type: d.type || 'deadline',
          status: d.status || 'pending',
          university: d.universityName || 'Various',
          program: d.program || '',
          notes: d.notes || ''
        });
      }
    });

    // Add deadlines from applications
    applications.forEach((a: any) => {
      if (a.deadline) {
        combined.push({
          id: `app-${a.id}`,
          title: `Application Deadline`,
          date: new Date(a.deadline?.toDate ? a.deadline.toDate() : a.deadline),
          type: 'Application Deadline',
          status: a.status === 'submitted' || a.status === 'selected' ? 'completed' : 'pending',
          university: a.universityName || 'University',
          program: a.program || '',
          notes: 'Application submission deadline',
          appId: a.id
        });
      }
    });

    // Filter out invalid dates
    return combined.filter(e => !isNaN(e.date.getTime()));
  }, [rawDeadlines, rawApplications]);

  // Statistics
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const upcomingCount = events.filter(e => e.date >= today && e.status !== 'completed').length;
  
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  const thisWeekCount = events.filter(e => e.date >= today && e.date <= nextWeek && e.status !== 'completed').length;

  const nextMonth = new Date(today);
  nextMonth.setMonth(today.getMonth() + 1);
  const thisMonthCount = events.filter(e => e.date >= today && e.date <= nextMonth && e.status !== 'completed').length;

  const completedCount = events.filter(e => e.status === 'completed').length;

  // Calendar logic
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonthClick = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  // Determine colors based on type
  const getEventStyle = (type: string, status: string) => {
    if (status === 'completed') return { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/20', icon: CheckCircle2 };
    
    const t = type.toLowerCase();
    if (t.includes('interview') || t.includes('counselling')) return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', icon: Phone };
    if (t.includes('document')) return { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', icon: FileText };
    if (t.includes('fee') || t.includes('payment')) return { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', icon: CreditCard };
    if (t.includes('exam')) return { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', icon: PenTool };
    if (t.includes('offer')) return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', icon: Sparkles };
    
    return { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20', icon: AlertCircle }; // Default for application deadline
  };

  const currentMonthEvents = events.filter(e => 
    e.date.getMonth() === currentDate.getMonth() && 
    e.date.getFullYear() === currentDate.getFullYear()
  ).sort((a, b) => a.date.getTime() - b.date.getTime());

  if (loading) {
    return (
      <div className="flex-1 w-full flex items-center justify-center p-8 min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col p-4 md:p-8 font-sans pb-24 overflow-hidden relative">
      
      {/* DRAWER OVERLAY */}
      <AnimatePresence>
        {selectedEvent && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEvent(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-[#111114] border-l border-white/[0.05] z-[101] shadow-2xl overflow-y-auto"
            >
              <div className="p-8 pb-32">
                <div className="flex items-center justify-between mb-10">
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/40">Event Details</div>
                  <button onClick={() => setSelectedEvent(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-all">
                    <X size={20} />
                  </button>
                </div>
                
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-black text-white mb-4 leading-tight">{selectedEvent.title}</h2>
                    <div className="flex items-center gap-3">
                      <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getEventStyle(selectedEvent.type, selectedEvent.status).bg} ${getEventStyle(selectedEvent.type, selectedEvent.status).text} ${getEventStyle(selectedEvent.type, selectedEvent.status).border} flex items-center gap-1.5`}>
                        {selectedEvent.status === 'completed' ? 'Completed' : selectedEvent.type}
                      </div>
                      <span className="text-sm font-bold text-white/40 flex items-center gap-1.5">
                        <Clock size={14} /> {selectedEvent.date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 bg-white/[0.02] border border-white/[0.05] rounded-3xl space-y-6">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Institution</div>
                      <div className="text-lg font-bold text-white flex items-center gap-2">
                        <MapPin size={18} className="text-indigo-400" /> {selectedEvent.university}
                      </div>
                    </div>
                    {selectedEvent.program && (
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Program</div>
                        <div className="text-lg font-bold text-white flex items-center gap-2">
                          <GraduationCap size={18} className="text-indigo-400" /> {selectedEvent.program}
                        </div>
                      </div>
                    )}
                    {selectedEvent.notes && (
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Notes</div>
                        <p className="text-sm text-white/60 leading-relaxed bg-[#0a0a0f] p-4 rounded-2xl border border-white/[0.05]">
                          {selectedEvent.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 pt-6 border-t border-white/[0.05]">
                    {selectedEvent.appId && (
                      <button 
                        onClick={() => router.push(`/student/applications/${selectedEvent.appId}`)}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
                      >
                        Open Application <ExternalLink size={16} />
                      </button>
                    )}
                    {selectedEvent.status !== 'completed' && (
                      <button className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                        Mark as Complete <CheckCircle2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3 mb-10"
      >
        <div className="flex items-center gap-2 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em]">
          <CalendarDays size={14} /> Master Schedule
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Academic Planner</h1>
        <p className="text-[16px] text-white/50 max-w-xl font-medium">
          Track every admission deadline, interview, and crucial milestone in one place.
        </p>
      </motion.div>

      {/* Statistics */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
      >
        <div className="bg-[#111114] border border-white/[0.04] p-5 rounded-3xl flex flex-col justify-center">
          <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Upcoming</div>
          <div className="text-2xl font-black text-white">{upcomingCount}</div>
        </div>
        <div className="bg-[#111114] border border-white/[0.04] p-5 rounded-3xl flex flex-col justify-center">
          <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">This Week</div>
          <div className="text-2xl font-black text-white">{thisWeekCount}</div>
        </div>
        <div className="bg-[#111114] border border-white/[0.04] p-5 rounded-3xl flex flex-col justify-center">
          <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">This Month</div>
          <div className="text-2xl font-black text-white">{thisMonthCount}</div>
        </div>
        <div className="bg-[#111114] border border-white/[0.04] p-5 rounded-3xl flex flex-col justify-center">
          <div className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-1">Completed</div>
          <div className="text-2xl font-black text-white">{completedCount}</div>
        </div>
      </motion.div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: Calendar Grid */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-[#111114] border border-white/[0.04] rounded-[40px] p-6 md:p-10 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 blur-[100px] pointer-events-none" />
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <h2 className="text-2xl font-black text-white">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-xl text-white/60 hover:text-white transition-all">
                <ChevronLeft size={20} />
              </button>
              <button onClick={nextMonthClick} className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-xl text-white/60 hover:text-white transition-all">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 md:gap-4 relative z-10">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">{d}</div>
            ))}
            
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square rounded-2xl border border-transparent" />
            ))}
            
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
              const isToday = dateObj.toDateString() === new Date().toDateString();
              
              const dayEvents = currentMonthEvents.filter(e => e.date.getDate() === day);

              return (
                <div 
                  key={day} 
                  className={`aspect-square rounded-2xl flex flex-col p-1.5 md:p-3 transition-all relative group
                    ${isToday ? 'bg-indigo-500/10 border border-indigo-500/30' : 'bg-white/[0.02] border border-white/[0.03] hover:border-white/10'}
                  `}
                >
                  <span className={`text-xs md:text-sm font-bold ${isToday ? 'text-indigo-400' : 'text-white/60'}`}>{day}</span>
                  
                  {dayEvents.length > 0 && (
                    <div className="mt-auto flex flex-wrap gap-1">
                      {dayEvents.slice(0, 3).map((e: any, idx: number) => (
                        <div 
                          key={idx}
                          role="button"
                          tabIndex={0}
                          onClick={(ev) => { ev.stopPropagation(); setSelectedEvent(e); }}
                          onKeyDown={(ev) => { if (ev.key === 'Enter') { ev.stopPropagation(); setSelectedEvent(e); } }}
                          className={`w-2 h-2 rounded-full cursor-pointer hover:scale-150 transition-transform ${getEventStyle(e.type, e.status).bg.replace('/10', '')}`}
                          title={e.title}
                        />
                      ))}
                      {dayEvents.length > 3 && <div className="text-[8px] text-white/40">+{dayEvents.length - 3}</div>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* RIGHT: Upcoming List */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col gap-6"
        >
          <div className="bg-[#111114] border border-white/[0.04] rounded-[40px] p-6 md:p-8 flex-1 flex flex-col">
            <h3 className="text-sm font-black text-white/60 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Sparkles size={16} className="text-amber-400" /> Upcoming Events
            </h3>
            
            <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 no-scrollbar">
              {events.filter(e => e.date >= today && e.status !== 'completed')
                .sort((a, b) => a.date.getTime() - b.date.getTime())
                .slice(0, 5)
                .map((e: any, i: number) => {
                  const style = getEventStyle(e.type, e.status);
                  const Icon = style.icon;
                  
                  return (
                    <div 
                      key={e.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedEvent(e)}
                      onKeyDown={(ev) => { if (ev.key === 'Enter') setSelectedEvent(e) }}
                      className="group p-4 bg-white/[0.02] border border-white/[0.04] rounded-2xl hover:border-white/10 transition-all cursor-pointer flex gap-4 items-center"
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${style.bg} ${style.text} group-hover:scale-105 transition-transform`}>
                        <Icon size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-white truncate">{e.title}</h4>
                        <div className="text-[11px] font-semibold text-white/40 truncate">{e.university}</div>
                        <div className="text-[10px] text-white/30 uppercase tracking-widest mt-1">
                          {e.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  )
              })}

              {events.filter(e => e.date >= today && e.status !== 'completed').length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center py-10 text-center opacity-60">
                  <CalendarIcon size={32} className="text-white/20 mb-4" />
                  <div className="text-sm font-bold text-white mb-1">No upcoming events</div>
                  <div className="text-[11px] text-white/40 mb-6">Your schedule is clear.</div>
                  <button 
                    onClick={() => router.push('/student/universities')}
                    className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Explore Universities
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
