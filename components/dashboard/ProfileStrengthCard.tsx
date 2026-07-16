'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { calculateProfileStrength, ProfileStrengthResult } from '@/lib/utils/profileStrength';
import { useStudentData } from '@/components/providers/StudentDataProvider';

export function ProfileStrengthCard() {
  const { profile } = useStudentData();
  const [strength, setStrength] = useState<ProfileStrengthResult | null>(null);
  
  useEffect(() => {
    if (profile) {
      setStrength(calculateProfileStrength(profile, profile.documents || {}));
    }
  }, [profile]);

  if (!strength) return null;

  const { percentage, grade, missingFields, estimatedTime } = strength;

  const getGradeColor = (g: string) => {
    switch (g) {
      case 'Excellent': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Very Good': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'Good': return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
      case 'Needs Improvement': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Incomplete': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      default: return 'text-white/60 bg-white/5 border-white/10';
    }
  };

  const getStrokeColor = (p: number) => {
    if (p >= 80) return 'stroke-emerald-500';
    if (p >= 50) return 'stroke-indigo-500';
    return 'stroke-amber-500';
  };

  const gradeColor = getGradeColor(grade);
  const strokeColor = getStrokeColor(percentage);
  const isNewUser = percentage === 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#111114] border border-white/[0.06] hover:border-white/10 transition-colors duration-500 rounded-[24px] p-6 relative overflow-hidden flex flex-col h-full group"
    >
      {/* Background glow based on grade */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-indigo-500/10 transition-colors duration-700" />
      
      <div className="flex items-center justify-between mb-6 z-10 relative">
        <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
          Profile Strength
        </h3>
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${gradeColor}`}>
          {grade}
        </span>
      </div>

      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 z-10 relative flex-1">
        
        {/* Circular Progress */}
        <div className="relative w-32 h-32 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
            <circle 
              cx="64" cy="64" r="56" 
              className="stroke-white/[0.04]" 
              strokeWidth="10" 
              fill="none" 
            />
            <motion.circle 
              cx="64" cy="64" r="56" 
              className={strokeColor}
              strokeWidth="10" 
              fill="none" 
              strokeLinecap="round"
              initial={{ strokeDasharray: "351", strokeDashoffset: "351" }}
              animate={{ strokeDashoffset: 351 - (351 * percentage) / 100 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black text-white leading-none">{percentage}%</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col w-full h-full">
          {isNewUser ? (
            <div className="space-y-4 flex-1 flex flex-col justify-center">
              <p className="text-sm text-white/60 font-medium leading-relaxed">Let&apos;s build your profile. Complete your profile to unlock better university recommendations and AI insights.</p>
              <Link href="/student/profile">
                <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all">
                  Complete Profile <ArrowRight size={14} />
                </button>
              </Link>
            </div>
          ) : percentage >= 100 ? (
            <div className="space-y-4 flex-1 flex flex-col justify-center">
              <p className="text-sm text-white/60 font-medium leading-relaxed">Outstanding! Your profile is highly competitive. You are ready to apply to top universities and receive precise AI recommendations.</p>
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
                <CheckCircle2 size={18} /> All fields completed
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <p className="text-[13px] text-white/60 font-medium leading-relaxed mb-3">
                Complete your profile to unlock better university recommendations and AI capabilities.
              </p>
              
              <div className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">
                <Clock size={14} className="text-indigo-400" />
                Est. {estimatedTime} min to complete
              </div>

              <div className="space-y-2 flex-1 max-h-[140px] overflow-y-auto custom-scrollbar pr-2 mb-4">
                {missingFields.map((field) => (
                  <div key={field.key} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/[0.04] rounded-[14px] hover:bg-white/[0.04] transition-colors">
                    <div className="flex items-center gap-2.5">
                      <AlertCircle size={14} className={field.priority === 'High' ? 'text-rose-400' : field.priority === 'Medium' ? 'text-amber-400' : 'text-blue-400'} />
                      <span className="text-xs font-bold text-white/80">{field.label}</span>
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                      field.priority === 'High' ? 'bg-rose-500/10 text-rose-400' :
                      field.priority === 'Medium' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-blue-500/10 text-blue-400'
                    }`}>
                      {field.priority}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-white/[0.05]">
                <Link href="/student/profile">
                  <button className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors">
                    Update Profile <ArrowRight size={14} />
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
