'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Clock, AlertCircle, Sparkles, Flame, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useStudentData } from '@/components/providers/StudentDataProvider';
import { generateDeadlineInsights } from '@/lib/utils/deadlineEngine';

export function DeadlineWidget({ className = '' }: { className?: string }) {
  const { deadlines, uniqueApps, documents, profileScore } = useStudentData();

  const insights = useMemo(() => {
    return generateDeadlineInsights({
      deadlines: deadlines || [],
      applications: uniqueApps || [],
      documents: documents || [],
      profileScore: profileScore || 0
    });
  }, [deadlines, uniqueApps, documents, profileScore]);

  const { criticalTasks, upcomingDeadlines, estimatedWorkload } = insights;
  const hasActiveTasks = criticalTasks.length > 0 || upcomingDeadlines.length > 0;
  
  const displayTasks = [...criticalTasks, ...upcomingDeadlines].slice(0, 3);

  return (
    <div className={`bg-[#111114] border border-rose-500/20 rounded-[24px] p-6 relative overflow-hidden group hover:border-rose-500/30 transition-colors flex flex-col shadow-[0_4px_30px_rgba(244,63,94,0.05)] ${className}`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-[50px] rounded-full mix-blend-screen opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <div className="flex justify-between items-center mb-5 shrink-0 z-10">
        <h3 className="text-[15px] font-display font-semibold text-white flex items-center gap-2">
          <Clock size={16} className="text-rose-400" />
          Intelligence Planner
        </h3>
        {hasActiveTasks && (
          <Link href="/student/calendar" className="text-[10px] font-black uppercase tracking-widest text-rose-400 hover:text-rose-300">
            View All
          </Link>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-start z-10 custom-scrollbar overflow-y-auto pr-2 space-y-3">
        {!hasActiveTasks ? (
          <div className="h-full flex flex-col items-center justify-center bg-white/[0.02] border border-white/[0.04] rounded-[20px] p-6 text-center group hover:bg-white/[0.03] transition-colors">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform duration-500">
              <Sparkles size={28} />
            </div>
            <h4 className="text-[15px] font-display font-semibold text-white mb-2">You&apos;re on track.</h4>
            <p className="text-[12px] text-white/50 mb-5 max-w-[220px]">No urgent admission tasks are pending. Take time to explore new universities.</p>
            <Link href="/student/discover" className="h-9 px-5 bg-white/[0.05] border border-white/10 hover:border-white/30 rounded-full text-[12px] font-semibold text-white flex items-center justify-center transition-colors">
              Explore Universities
            </Link>
          </div>
        ) : (
          <>
            <div className="flex gap-2 mb-2">
              <div className="flex-1 bg-white/5 border border-white/5 rounded-xl p-3">
                <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Est. Workload</div>
                <div className="text-lg font-bold text-white">{estimatedWorkload.estimatedMinutes} mins</div>
              </div>
              <div className="flex-1 bg-white/5 border border-white/5 rounded-xl p-3">
                <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Priority</div>
                <div className={`text-lg font-bold ${estimatedWorkload.difficulty === 'High' ? 'text-rose-400' : estimatedWorkload.difficulty === 'Medium' ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {estimatedWorkload.difficulty}
                </div>
              </div>
            </div>

            {displayTasks.map((task, i) => (
              <motion.div 
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group/card relative p-3 rounded-[16px] bg-[#14141A] border border-white/[0.04] hover:bg-[#1A1A24] hover:border-white/[0.08] transition-all duration-300"
              >
                <div className="relative z-10 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[13px] font-bold text-white truncate max-w-[180px]">{task.title}</h4>
                    <div className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-widest shrink-0 ${
                      task.priority === 'Critical' ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' : 
                      task.priority === 'High' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 
                      'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
                    }`}>
                      {task.priority === 'Critical' && <Flame size={10} className="inline mr-1 mb-0.5" />}
                      {task.priority}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-white/40 truncate">{task.universityName}</span>
                    <span className={`font-semibold ${task.daysRemaining <= 2 ? 'text-rose-400' : 'text-white/60'}`}>
                      {task.daysRemaining < 0 ? 'Overdue' : task.daysRemaining === 0 ? 'Today' : `In ${task.daysRemaining} days`}
                    </span>
                  </div>

                  {(task.riskLevel === 'High Risk' || task.requiredDocuments.length > 0) && (
                    <div className="mt-1 flex items-center gap-1.5 text-[10px] text-amber-400/80 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/10 w-fit">
                      <ShieldAlert size={12} /> {task.requiredDocuments.length > 0 ? `Missing ${task.requiredDocuments[0]}` : 'High Risk Profile'}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
