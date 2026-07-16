'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useStudentData } from '@/components/providers/StudentDataProvider';
import { listenScholarships } from '@/lib/firebase/scholarships';
import { calculateScholarshipEligibility, ScholarshipResult } from '@/lib/utils/scholarshipEngine';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Search, GraduationCap, CheckCircle2, AlertCircle, Calendar, ChevronRight, X, Sparkles, Filter, IndianRupee } from 'lucide-react';

export default function ScholarshipsPage() {
  const { profile, documents, profileScore } = useStudentData();
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Eligible' | 'Potential' | 'Not Eligible'>('Eligible');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsub = listenScholarships((data) => {
      setScholarships(data);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const results = useMemo(() => {
    if (!profile) return [];
    return calculateScholarshipEligibility({ profile, documents, profileScore }, scholarships);
  }, [profile, documents, profileScore, scholarships]);

  const filteredResults = useMemo(() => {
    let filtered = results;
    if (activeTab === 'Eligible') {
      filtered = results.filter(r => r.eligibilityScore >= 75);
    } else if (activeTab === 'Potential') {
      filtered = results.filter(r => r.eligibilityScore >= 40 && r.eligibilityScore < 75);
    } else {
      filtered = results.filter(r => r.eligibilityScore < 40);
    }

    if (searchQuery) {
      filtered = filtered.filter(r => r.scholarship.name?.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return filtered;
  }, [results, activeTab, searchQuery]);

  const getRingColor = (score: number) => {
    if (score >= 90) return 'stroke-emerald-400';
    if (score >= 75) return 'stroke-emerald-500';
    if (score >= 60) return 'stroke-amber-400';
    if (score >= 40) return 'stroke-orange-500';
    return 'stroke-red-500';
  };

  const getLabelColor = (label: string) => {
    if (label === 'Highly Eligible' || label === 'Eligible') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (label === 'Potentially Eligible') return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    if (label === 'Needs Improvement') return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
    return 'text-red-400 bg-red-500/10 border-red-500/20';
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="min-h-screen bg-[#08080A] text-white font-sans selection:bg-indigo-500/30">
        
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="mb-12">
            <h1 className="text-4xl font-black mb-4">Scholarship Portal</h1>
            <p className="text-white/40 text-lg max-w-2xl">
              Discover financial aid opportunities uniquely matched to your academic profile and socioeconomic background.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            <div className="flex bg-[#111114] p-1.5 rounded-2xl border border-white/5 w-full md:w-auto overflow-x-auto">
              {['Eligible', 'Potential', 'Not Eligible'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-6 py-3 rounded-xl text-sm font-black transition-all whitespace-nowrap ${
                    activeTab === tab ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-indigo-400 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search scholarships..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#111114] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm focus:border-indigo-500/50 outline-none transition-all"
              />
            </div>
          </div>

          {scholarships.length === 0 || results.length === 0 ? (
             <div className="text-center py-32 bg-[#111114] border border-white/5 rounded-[40px]">
                <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <GraduationCap size={32} className="text-indigo-400" />
                </div>
                <h3 className="text-2xl font-black mb-3">No scholarships available</h3>
                <p className="text-white/40 max-w-md mx-auto mb-8">We couldn&apos;t find any scholarships matching your profile currently.</p>
                <Link href="/student/profile" className="px-8 py-4 bg-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all">
                  Improve Profile
                </Link>
             </div>
          ) : filteredResults.length === 0 ? (
             <div className="text-center py-20 bg-[#111114] border border-white/5 rounded-[40px]">
                <p className="text-white/40">No scholarships found for the selected category.</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              <AnimatePresence>
                {filteredResults.map((res, idx) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                    key={res.scholarship.id}
                    className="bg-[#111114] border border-white/10 rounded-[32px] p-8 hover:border-white/20 transition-all flex flex-col md:flex-row gap-8 shadow-2xl"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${getLabelColor(res.eligibilityLabel)}`}>
                          {res.eligibilityLabel}
                        </div>
                        {res.scholarship.provider && (
                          <div className="text-white/40 text-xs font-bold uppercase tracking-widest">
                            {res.scholarship.provider}
                          </div>
                        )}
                      </div>
                      
                      <h2 className="text-2xl md:text-3xl font-black mb-3">{res.scholarship.name}</h2>
                      
                      <div className="flex flex-wrap gap-4 mb-6">
                         <div className="flex items-center gap-2 text-sm text-green-400 font-bold bg-green-500/10 px-4 py-2 rounded-xl border border-green-500/10">
                           <IndianRupee size={16} /> {res.estimatedBenefit}
                         </div>
                         <div className="flex items-center gap-2 text-sm text-amber-400 font-bold bg-amber-500/10 px-4 py-2 rounded-xl border border-amber-500/10">
                           <Calendar size={16} /> Deadline: {res.scholarship.deadline || 'Rolling'}
                         </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div>
                            <h4 className="text-[10px] font-black text-white/46 uppercase tracking-widest mb-3">Why you qualify</h4>
                            <div className="space-y-2">
                              {res.matchReasons.length > 0 ? res.matchReasons.map((reason, i) => (
                                <div key={i} className="flex items-start gap-2 text-xs font-medium text-emerald-400">
                                  <CheckCircle2 size={14} className="shrink-0 mt-0.5" /> {reason}
                                </div>
                              )) : <div className="text-xs text-white/30">No specific match reasons found.</div>}
                            </div>
                         </div>
                         
                         {(res.missingRequirements.length > 0 || res.improvementSuggestions.length > 0) && (
                           <div>
                              {res.missingRequirements.length > 0 && (
                                <div className="mb-4">
                                  <h4 className="text-[10px] font-black text-white/46 uppercase tracking-widest mb-3 text-amber-400">Missing Requirements</h4>
                                  <div className="space-y-2">
                                    {res.missingRequirements.map((req, i) => (
                                      <div key={i} className="flex items-start gap-2 text-xs font-medium text-amber-400/80">
                                        <AlertCircle size={14} className="shrink-0 mt-0.5" /> {req}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {res.improvementSuggestions.length > 0 && (
                                <div>
                                  <h4 className="text-[10px] font-black text-white/46 uppercase tracking-widest mb-3 text-indigo-400">Suggestions</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {res.improvementSuggestions.map((sug, i) => (
                                      <div key={i} className="bg-indigo-500/10 text-indigo-300 text-[10px] font-bold px-3 py-1 rounded-lg border border-indigo-500/20">
                                        {sug}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                           </div>
                         )}
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center shrink-0 w-full md:w-48 bg-white/5 rounded-3xl p-6 border border-white/5">
                      <div className="relative w-24 h-24 mb-6">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="16" className="stroke-white/5" strokeWidth="3" fill="none" />
                          <motion.circle 
                            cx="18" cy="18" r="16" 
                            className={getRingColor(res.eligibilityScore)} 
                            strokeWidth="3" fill="none" strokeLinecap="round"
                            initial={{ strokeDasharray: "100", strokeDashoffset: "100" }}
                            animate={{ strokeDashoffset: 100 - res.eligibilityScore }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                          <span className="text-2xl font-black">{res.eligibilityScore}%</span>
                        </div>
                      </div>
                      
                      <button className="w-full py-4 bg-white text-[#0A0A0F] rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all flex items-center justify-center gap-2">
                        Apply Now <ChevronRight size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
