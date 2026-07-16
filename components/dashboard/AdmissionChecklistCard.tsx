'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  CheckCircle2, Clock, ArrowRight, FileText, User, 
  Building2, Calendar, Bookmark, AlertCircle, PartyPopper 
} from 'lucide-react';
import { useStudentData } from '@/components/providers/StudentDataProvider';
import { generateAdmissionChecklist, AdmissionTask, TaskPriority } from '@/lib/utils/checklistEngine';

export function AdmissionChecklistCard({ className = '' }: { className?: string }) {
  const { profile, documents, uniqueApps, savedPrograms, deadlines } = useStudentData();
  
  const checklist = useMemo(() => {
    return generateAdmissionChecklist({
      profile,
      documents,
      applications: uniqueApps,
      savedPrograms,
      deadlines
    });
  }, [profile, documents, uniqueApps, savedPrograms, deadlines]);

  const { tasks, completedTasks, totalTasks, estimatedTimeRemaining, completionPercentage } = checklist;
  const isComplete = tasks.length === 0;

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'Critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'High': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'Medium': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'Low': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    }
  };
  
  const getPriorityDot = (priority: TaskPriority) => {
    switch (priority) {
      case 'Critical': return 'bg-red-500';
      case 'High': return 'bg-orange-500';
      case 'Medium': return 'bg-purple-500';
      case 'Low': return 'bg-emerald-500';
    }
  };

  const getIcon = (type: AdmissionTask['iconType']) => {
    switch (type) {
      case 'Document': return <FileText size={16} />;
      case 'Profile': return <User size={16} />;
      case 'Application': return <Building2 size={16} />;
      case 'Deadline': return <Calendar size={16} />;
      case 'Bookmark': return <Bookmark size={16} />;
    }
  };

  return (
    <div className={`bg-[#111114] border border-white/[0.06] rounded-[24px] p-6 flex flex-col relative overflow-hidden h-[380px] ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6 shrink-0 relative z-10">
        <h3 className="text-[15px] font-display font-semibold text-white flex items-center gap-2">
          <CheckCircle2 size={16} className="text-indigo-400" />
          Today&apos;s Admission Checklist
        </h3>
        {!isComplete && (
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{completedTasks} / {totalTasks} Tasks</span>
              <span className="text-xs font-bold text-indigo-400">{completionPercentage}% Complete</span>
            </div>
            <div className="relative w-10 h-10 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" className="stroke-white/5" strokeWidth="3" fill="none" />
                <motion.circle 
                  cx="18" cy="18" r="16" 
                  className="stroke-indigo-500" 
                  strokeWidth="3" fill="none" strokeLinecap="round"
                  initial={{ strokeDasharray: "100", strokeDashoffset: "100" }}
                  animate={{ strokeDashoffset: 100 - completionPercentage }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 relative z-10 custom-scrollbar overflow-y-auto pr-2">
        {isComplete ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-[20px]">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <PartyPopper size={32} />
            </div>
            <h4 className="text-[16px] font-display font-black text-white mb-2">🎉 You&apos;re admission ready!</h4>
            <p className="text-[13px] text-emerald-100/60 mb-6 max-w-[260px] font-medium leading-relaxed">
              Your profile is complete and all current admission tasks have been finished.
            </p>
            <Link href="/student/discover">
              <button className="h-10 px-6 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-[11px] font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2">
                Explore Universities <ArrowRight size={14} />
              </button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">
              <Clock size={12} className="text-white/30" />
              Est. {estimatedTimeRemaining} minutes remaining
            </div>
            
            {tasks.map((task, i) => (
              <motion.div 
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.01 }}
                className="group flex flex-col p-4 bg-[#14141A] border border-white/[0.04] hover:bg-[#1A1A24] hover:border-white/[0.08] hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)] rounded-[16px] transition-all duration-300"
              >
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 border ${getPriorityColor(task.priority)}`}>
                    {getIcon(task.iconType)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-[14px] font-bold text-white/90 truncate pr-2">{task.title}</h4>
                      <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border ${getPriorityColor(task.priority)} shrink-0`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${getPriorityDot(task.priority)} animate-pulse`} />
                        <span className="text-[9px] font-black uppercase tracking-widest">{task.priority}</span>
                      </div>
                    </div>
                    <p className="text-[11px] font-medium text-white/50 truncate mb-3">{task.description}</p>
                    
                    {/* Action Row */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-white/30 flex items-center gap-1">
                        <Clock size={10} /> {task.estimatedTime} min
                      </span>
                      <Link href={task.actionUrl}>
                        <button className="h-7 px-4 rounded-lg bg-white/5 hover:bg-indigo-600 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-all flex items-center gap-1.5 border border-white/5 hover:border-indigo-500 shadow-sm">
                          {task.actionLabel} <ArrowRight size={12} />
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
