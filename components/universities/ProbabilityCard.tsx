'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ShieldAlert, Zap, CheckCircle2, AlertCircle, Sparkles, ChevronRight, PieChart } from 'lucide-react';
import { calculateAdmissionProbability } from '@/lib/utils/probabilityEngine';
import { useStudentData } from '@/components/providers/StudentDataProvider';

export function ProbabilityCard({ university }: { university: any }) {
  const { profile, documents, uniqueApps, savedPrograms, profileScore } = useStudentData();

  const probabilityData = useMemo(() => {
    if (!university) return null;
    return calculateAdmissionProbability({
      profile, documents, applications: uniqueApps, savedPrograms, profileScore
    }, university);
  }, [university, profile, documents, uniqueApps, savedPrograms, profileScore]);

  if (!probabilityData) return null;

  const isInsufficient = probabilityData.overallProbability === 0 && probabilityData.missingRequirements.length > 0;

  const getLabelColor = (label: string) => {
    switch(label) {
      case 'Very High': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'High': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Moderate': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Low': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'Very Low': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-white/60 bg-white/5 border-white/10';
    }
  };

  const getStrokeColor = (prob: number) => {
    if (prob >= 75) return 'stroke-emerald-500';
    if (prob >= 60) return 'stroke-amber-500';
    if (prob >= 40) return 'stroke-orange-500';
    return 'stroke-red-500';
  };

  if (isInsufficient) {
    return (
      <div className="bg-[#111114] border border-white/10 rounded-[40px] p-8 relative overflow-hidden mb-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[60px] pointer-events-none" />
        <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
          <PieChart className="text-indigo-400" /> Admission Probability
        </h3>
        
        <div className="flex flex-col items-center justify-center p-6 bg-white/5 rounded-3xl border border-white/5 text-center">
          <ShieldAlert size={32} className="text-amber-500 mb-4" />
          <h4 className="text-sm font-black text-white mb-2">Insufficient Data</h4>
          <p className="text-xs text-white/50 mb-6 max-w-[240px]">We need more information before estimating your admission probability.</p>
          <Link href="/student/profile" className="px-6 py-3 bg-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-500 transition-colors">
            Complete Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#111114] border border-white/10 rounded-[40px] p-8 relative overflow-hidden mb-8 shadow-2xl">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[60px] pointer-events-none" />
      <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
        <Zap className="text-amber-400" fill="currentColor" /> Admission Chance
      </h3>

      <div className="flex items-center gap-6 mb-8">
        <div className="relative w-24 h-24 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="16" className="stroke-white/5" strokeWidth="3" fill="none" />
            <motion.circle 
              cx="18" cy="18" r="16" 
              className={getStrokeColor(probabilityData.overallProbability)} 
              strokeWidth="3" fill="none" strokeLinecap="round"
              initial={{ strokeDasharray: "100", strokeDashoffset: "100" }}
              animate={{ strokeDashoffset: 100 - probabilityData.overallProbability }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-2xl font-black">{probabilityData.overallProbability}%</span>
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <div className={`px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest inline-flex w-fit ${getLabelColor(probabilityData.probabilityLabel)}`}>
            {probabilityData.probabilityLabel} Chance
          </div>
          <div className="text-xs font-bold text-white/40 uppercase tracking-widest">
            Confidence: <span className={probabilityData.confidence === 'High' ? 'text-emerald-400' : probabilityData.confidence === 'Medium' ? 'text-amber-400' : 'text-red-400'}>{probabilityData.confidence}</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {probabilityData.strengths.length > 0 && (
          <div>
            <h4 className="text-[10px] font-black text-white/46 uppercase tracking-widest mb-3">Strengths</h4>
            <div className="space-y-2">
              {probabilityData.strengths.slice(0, 3).map((strength, i) => (
                <div key={i} className="flex items-start gap-2 text-xs font-medium text-white/80 bg-white/5 p-2 rounded-lg border border-white/5">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" /> {strength}
                </div>
              ))}
            </div>
          </div>
        )}

        {(probabilityData.weaknesses.length > 0 || probabilityData.missingRequirements.length > 0) && (
          <div>
            <h4 className="text-[10px] font-black text-white/46 uppercase tracking-widest mb-3">Areas to Improve</h4>
            <div className="space-y-2">
              {[...probabilityData.missingRequirements, ...probabilityData.weaknesses].slice(0, 3).map((weakness, i) => (
                <div key={i} className="flex items-start gap-2 text-xs font-medium text-white/80 bg-amber-500/5 p-2 rounded-lg border border-amber-500/10">
                  <AlertCircle size={14} className="text-amber-400 shrink-0 mt-0.5" /> {weakness}
                </div>
              ))}
            </div>
          </div>
        )}

        {probabilityData.improvementSuggestions.length > 0 && (
          <div className="pt-4 border-t border-white/5">
             <h4 className="text-[10px] font-black text-white/46 uppercase tracking-widest mb-3">Suggestions</h4>
             <ul className="list-disc list-inside text-xs text-indigo-300 space-y-1">
               {probabilityData.improvementSuggestions.map((sug, i) => (
                 <li key={i}>{sug}</li>
               ))}
             </ul>
          </div>
        )}
      </div>
    </div>
  );
}
