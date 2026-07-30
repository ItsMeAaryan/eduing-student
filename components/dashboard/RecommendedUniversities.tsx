'use client';

import React from 'react';
import { Building2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useStudentData } from '@/components/providers/StudentDataProvider';

export default function RecommendedUniversities() {
  const { universities } = useStudentData();
  const count = Array.isArray(universities) ? universities.length : 0;

  return (
    <div className="bg-[#151519] border border-white/5 rounded-[20px] p-6 flex flex-col justify-between min-h-[140px] mt-6">
      <div className="flex justify-between items-start">
        <div className="text-gray-400">
          <Building2 size={20} strokeWidth={2} />
        </div>
        <Link href="/student/universities" className="text-sm text-[#6D5DF6] hover:text-white transition-colors flex items-center gap-1">
          Discover <ArrowRight size={14} />
        </Link>
      </div>
      
      <div className="mt-4">
        <h3 className="text-3xl font-medium text-white mb-1">{count}</h3>
        <p className="text-sm text-gray-400">University Matches</p>
      </div>
    </div>
  );
}
