'use client';

import React from 'react';
import { Building2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

// Mock data to provide the count for the redesigned card
const MOCK_RECOMMENDATIONS = [
  { id: "r1" }, { id: "r2" }, { id: "r3" }
];

export default function RecommendedUniversities() {
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
        <h3 className="text-3xl font-medium text-white mb-1">{MOCK_RECOMMENDATIONS.length}</h3>
        <p className="text-sm text-gray-400">University Matches</p>
      </div>
    </div>
  );
}
