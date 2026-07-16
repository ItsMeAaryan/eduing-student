'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useStudentData } from '@/components/providers/StudentDataProvider';
import { recommendUniversities } from '@/lib/utils/recommendationEngine';
import { listenUniversitiesFiltered } from '@/lib/firebase/universities';

export function DashboardRecommendationWidget() {
  const { profile, documents, uniqueApps, savedPrograms, profileScore } = useStudentData();
  const [universities, setUniversities] = useState<any[]>([]);

  useEffect(() => {
    const unsub = listenUniversitiesFiltered({}, (unis) => {
      setUniversities(unis);
    });
    return () => unsub();
  }, []);

  const recommendations = useMemo(() => {
    return recommendUniversities(universities, {
      profile,
      documents,
      applications: uniqueApps,
      savedPrograms,
      profileScore
    });
  }, [universities, profile, documents, uniqueApps, savedPrograms, profileScore]);

  return (
    <div className="bg-[#151519] border border-white/5 rounded-[20px] p-6 flex flex-col justify-between min-h-[140px]">
      <div className="flex justify-between items-start">
        <div className="text-gray-400">
          <Sparkles size={20} strokeWidth={2} />
        </div>
        <Link href="/student/discover" className="text-sm text-[#6D5DF6] hover:text-white transition-colors flex items-center gap-1">
          Discover <ArrowRight size={14} />
        </Link>
      </div>
      
      <div className="mt-4">
        <h3 className="text-3xl font-medium text-white mb-1">{recommendations.length}</h3>
        <p className="text-sm text-gray-400">Recommended</p>
      </div>
    </div>
  );
}
