'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { GraduationCap, ArrowRight, IndianRupee, ShieldAlert, CheckCircle2 } from 'lucide-react';
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

  const topMatches = results.slice(0, 3);
  const isInsufficient = results.length === 0 && scholarships.length > 0;

  return (
    <div className={`bg-[#111114] border border-emerald-500/20 rounded-[24px] p-6 relative overflow-hidden group hover:border-emerald-500/30 transition-colors flex flex-col shadow-[0_4px_30px_rgba(16,185,129,0.05)] ${className}`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full mix-blend-screen opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <div className="flex justify-between items-center mb-5 shrink-0 z-10">
        <h3 className="text-[15px] font-display font-semibold text-white flex items-center gap-2">
          <GraduationCap size={16} className="text-emerald-400" />
          Scholarships You May Qualify For
        </h3>
        {!isInsufficient && topMatches.length > 0 && (
          <Link href="/student/scholarships" className="text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300">
            View All
          </Link>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-start z-10 custom-scrollbar overflow-y-auto pr-2 space-y-3">
        {isInsufficient ? (
          <div className="h-full flex flex-col items-center justify-center bg-white/[0.02] border border-white/[0.04] rounded-[20px] p-6 text-center group hover:bg-white/[0.03] transition-colors">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform duration-500">
              <ShieldAlert size={28} />
            </div>
            <h4 className="text-[15px] font-display font-semibold text-white mb-2">Insufficient Data</h4>
            <p className="text-[12px] text-white/50 mb-5 max-w-[220px]">We couldn&apos;t find any scholarships based on your current profile.</p>
            <Link href="/student/profile" className="h-9 px-5 bg-emerald-600 rounded-full text-[12px] font-semibold text-white flex items-center justify-center hover:bg-emerald-500 transition-all">
              Improve Profile
            </Link>
          </div>
        ) : topMatches.length === 0 ? (
           <div className="h-full flex items-center justify-center text-white/40 text-sm">
             Loading...
           </div>
        ) : (
          topMatches.map((res, i) => (
            <motion.div 
              key={res.scholarship.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group/card relative p-4 rounded-[16px] bg-[#14141A] border border-white/[0.04] hover:bg-[#1A1A24] hover:border-white/[0.08] hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)] transition-all duration-300"
            >
              <div className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent mix-blend-screen" />
              </div>

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h4 className="text-[14px] font-bold text-white truncate">{res.scholarship.name}</h4>
                    <div className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-widest shrink-0 ${
                      res.eligibilityScore >= 75 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 
                      res.eligibilityScore >= 60 ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 
                      'text-orange-400 bg-orange-500/10 border-orange-500/20'
                    }`}>
                      {res.eligibilityScore}% Match
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] font-medium text-white/50 mb-3">
                    {res.scholarship.provider && <span>{res.scholarship.provider}</span>}
                    <span className="flex items-center gap-1 text-green-400"><IndianRupee size={12} /> {res.estimatedBenefit}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {res.matchReasons.slice(0, 2).map((reason, idx) => (
                      <div key={idx} className="flex items-center gap-1 text-[9px] font-bold text-emerald-400/80 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        <CheckCircle2 size={10} /> {reason}
                      </div>
                    ))}
                  </div>
                </div>

                <Link href="/student/scholarships" className="shrink-0 flex items-center justify-center w-full md:w-auto px-4 py-2 bg-white/5 hover:bg-emerald-600 text-[10px] font-black uppercase tracking-widest text-white/70 hover:text-white rounded-lg transition-colors border border-white/5 hover:border-emerald-500">
                  Details <ArrowRight size={12} className="ml-1" />
                </Link>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
