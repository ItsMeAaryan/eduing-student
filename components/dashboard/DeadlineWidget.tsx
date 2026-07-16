'use client';

import React, { useMemo } from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
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

  const totalTasks = insights.criticalTasks.length + insights.upcomingDeadlines.length;

  return (
    <div className={`bg-[#151519] border border-white/5 rounded-[20px] p-6 flex flex-col justify-between min-h-[140px] ${className}`}>
      <div className="flex justify-between items-start">
        <div className="text-gray-400">
          <Clock size={20} strokeWidth={2} />
        </div>
        <Link href="/student/calendar" className="text-sm text-[#6D5DF6] hover:text-white transition-colors flex items-center gap-1">
          Calendar <ArrowRight size={14} />
        </Link>
      </div>
      
      <div className="mt-4">
        <h3 className="text-3xl font-medium text-white mb-1">{totalTasks}</h3>
        <p className="text-sm text-gray-400">Upcoming Deadlines</p>
      </div>
    </div>
  );
}
