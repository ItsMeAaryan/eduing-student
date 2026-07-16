'use client';

import React, { useMemo } from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useStudentData } from '@/components/providers/StudentDataProvider';
import { generateAdmissionChecklist } from '@/lib/utils/checklistEngine';

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

  return (
    <div className={`bg-[#151519] border border-white/5 rounded-[20px] p-6 flex flex-col justify-between min-h-[140px] ${className}`}>
      <div className="flex justify-between items-start">
        <div className="text-gray-400">
          <CheckCircle2 size={20} strokeWidth={2} />
        </div>
        <Link href="/student/applications" className="text-sm text-[#6D5DF6] hover:text-white transition-colors flex items-center gap-1">
          Tasks <ArrowRight size={14} />
        </Link>
      </div>
      
      <div className="mt-4">
        <h3 className="text-3xl font-medium text-white mb-1">{checklist.tasks.length}</h3>
        <p className="text-sm text-gray-400">Pending Tasks</p>
      </div>
    </div>
  );
}
