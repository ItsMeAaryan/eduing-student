'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { GraduationCap, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useStudentData } from '@/components/providers/StudentDataProvider';
import { listenScholarships } from '@/lib/firebase/scholarships';
import { calculateScholarshipEligibility } from '@/lib/utils/scholarshipEngine';

export function ScholarshipWidget({ className = '' }: { className?: string }) {
  const { profile, documents, profileScore } = useStudentData();
  const [scholarships, setScholarships] = useState<any[]>([]);

  useEffect(() => {
    const unsub = listenScholarships((data) => setScholarships(data), (err) => console.error(err));
    return () => unsub();
  }, []);

  const results = useMemo(() => {
    return calculateScholarshipEligibility({ profile, documents, profileScore }, scholarships);
  }, [profile, documents, profileScore, scholarships]);

  return (
    <div className={`bg-[#151519] border border-white/5 rounded-[20px] p-6 flex flex-col justify-between min-h-[140px] ${className}`}>
      <div className="flex justify-between items-start">
        <div className="text-gray-400">
          <GraduationCap size={20} strokeWidth={2} />
        </div>
        <Link href="/student/scholarships" className="text-sm text-[#6D5DF6] hover:text-white transition-colors flex items-center gap-1">
          View All <ArrowRight size={14} />
        </Link>
      </div>
      
      <div className="mt-4">
        <h3 className="text-3xl font-medium text-white mb-1">{results.length}</h3>
        <p className="text-sm text-gray-400">Eligible Scholarships</p>
      </div>
    </div>
  );
}
