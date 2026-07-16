'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Sparkles, Check, AlertCircle, ChevronRight, Zap } from 'lucide-react';
import { useStudentData } from '@/components/providers/StudentDataProvider';
import { recommendUniversities, RecommendationResult } from '@/lib/utils/recommendationEngine';
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

  const topMatches = recommendations.slice(0, 3);
  const isInsufficientData = recommendations.length === 0 && universities.length > 0;

  return (
    <div className="bg-[#111114] border border-brand-indigo/20 rounded-[24px] p-6 relative overflow-hidden group hover:border-brand-indigo/30 transition-colors h-[380px] flex flex-col shadow-[0_4px_30px_rgba(79,70,229,0.05)]">
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-indigo/10 blur-[50px] rounded-full mix-blend-screen opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <h3 className="text-[15px] font-display font-semibold text-white flex items-center justify-between gap-2 mb-5 shrink-0 z-10">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-amber-400" />
          Recommended For You
        </div>
        {!isInsufficientData && topMatches.length > 0 && (
          <Link href="/student/discover" className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300">
            View All
          </Link>
        )}
      </h3>
      
      <div className="flex-1 flex flex-col justify-between z-10 custom-scrollbar overflow-y-auto pr-2">
        {isInsufficientData ? (
          <div className="h-full flex flex-col items-center justify-center bg-white/[0.02] border border-white/[0.04] rounded-[20px] p-6 text-center group hover:bg-white/[0.03] transition-colors">
            <div className="w-14 h-14 rounded-full bg-brand-indigo/10 flex items-center justify-center text-brand-indigoLight mb-4 group-hover:scale-110 transition-transform duration-500">
              <Sparkles size={28} />
            </div>
            <h4 className="text-[15px] font-display font-semibold text-white mb-2">Insufficient Data</h4>
            <p className="text-[12px] text-white/50 mb-5 max-w-[220px]">We need a little more information before generating personalized recommendations.</p>
            <Link href="/student/profile" className="h-9 px-5 bg-brand-indigo rounded-full text-[12px] font-semibold text-white flex items-center justify-center hover:bg-brand-indigoLight hover:shadow-[0_4px_20px_rgba(79,70,229,0.4)] transition-all">
              Complete Profile
            </Link>
          </div>
        ) : topMatches.length === 0 ? (
          <div className="h-full flex items-center justify-center text-white/40 text-sm">
            Loading recommendations...
          </div>
        ) : (
          <div className="space-y-3">
            {topMatches.map((rec, i) => (
              <motion.div 
                key={rec.university.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group/card relative p-4 rounded-[20px] bg-[#14141A] border border-white/[0.04] hover:bg-[#1A1A24] hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-300 overflow-hidden flex flex-col gap-3"
              >
                <div className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-brand-indigo/10 mix-blend-screen" />
                  <div className="absolute inset-0 ring-1 ring-inset ring-amber-500/20 rounded-[20px]" />
                </div>
                
                <div className="relative z-10 flex gap-3">
                  <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-[#1E1E24] to-[#111114] border border-white/[0.08] flex items-center justify-center text-white font-display font-bold text-[18px] shrink-0 shadow-inner group-hover/card:border-amber-500/30 transition-colors overflow-hidden">
                    {rec.university.imageUrl ? (
                      <img src={rec.university.imageUrl} alt="" className="w-full h-full object-cover opacity-80" />
                    ) : (
                      (rec.university.name || 'U').charAt(0)
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex justify-between items-start mb-0.5">
                      <h4 className="text-[14px] font-bold text-white truncate pr-2 group-hover/card:text-indigo-400 transition-colors">{rec.university.name}</h4>
                      <div className="flex items-center gap-1.5 shrink-0 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                        <Sparkles size={10} className="text-emerald-400" />
                        <span className="text-[10px] font-black text-emerald-400">{rec.overallMatchScore}%</span>
                      </div>
                    </div>
                    
                    <p className="text-[11px] text-white/50 truncate font-medium mb-1">{rec.university.location}</p>
                    
                    <div className="flex items-center gap-2 mt-1">
                       {rec.matchReasons.slice(0, 2).map((reason, idx) => (
                         <div key={idx} className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-amber-400/80 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/10">
                           <Check size={10} /> {reason}
                         </div>
                       ))}
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
