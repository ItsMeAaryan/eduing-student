'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { useStudentData } from '@/components/providers/StudentDataProvider';
import ProtectedRoute from '@/components/ProtectedRoute';

// Services & Engines
import { listenUniversitiesFiltered } from '@/lib/firebase/universities';
import { listenScholarships } from '@/lib/firebase/scholarships';
import { calculateProfileStrength } from '@/lib/utils/profileStrength';
import { recommendUniversities } from '@/lib/utils/recommendationEngine';
import { calculateAdmissionProbability } from '@/lib/utils/probabilityEngine';
import { calculateScholarshipEligibility } from '@/lib/utils/scholarshipEngine';
import { UniversityComparisonService } from '@/lib/ai/gemini/services';

import { Sparkles, ArrowRight, ShieldCheck, Target, GraduationCap, X, CheckCircle2, ChevronLeft, Plus } from 'lucide-react';

function CompareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawIds = searchParams.get('ids');
  
  const { profile, documents, uniqueApps, savedPrograms } = useStudentData();
  const [allUniversities, setAllUniversities] = useState<any[]>([]);
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>(rawIds ? rawIds.split(',') : []);

  useEffect(() => {
    const unsubU = listenUniversitiesFiltered({}, (data) => setAllUniversities(data), (err) => console.error(err));
    const unsubS = listenScholarships((data) => setScholarships(data), (err) => console.error(err));
    return () => { unsubU(); unsubS(); };
  }, []);

  const selectedUniversities = useMemo(() => {
    return selectedIds.map(id => allUniversities.find(u => u.id === id)).filter(Boolean);
  }, [allUniversities, selectedIds]);

  const comparisonData = useMemo(() => {
    if (!profile || selectedUniversities.length === 0) return null;

    const profileEngine = calculateProfileStrength(profile, documents || []);
    
    // Process each university through the engines
    const detailedList = selectedUniversities.map(uni => {
      // 1. Recommendation
      const rec = recommendUniversities([uni], { 
        profile, 
        documents: documents || [], 
        applications: uniqueApps || [], 
        savedPrograms: savedPrograms || [], 
        profileScore: profileEngine.percentage 
      })[0];
      
      // 2. Probability
      const prob = calculateAdmissionProbability(uni, {
        profile,
        documents: documents || [],
        profileScore: profileEngine.percentage
      });

      // 3. Scholarship Potential (Find highest score scholarship for this uni or general)
      const sch = calculateScholarshipEligibility({ 
        profile, 
        documents: documents || [], 
        profileScore: profileEngine.percentage 
      }, scholarships).filter(s => s.scholarship.universityId === uni.id || !s.scholarship.universityId);
      
      const bestScholarship = sch.length > 0 ? sch[0] : null;

      return {
        university: uni,
        recommendation: rec || { overallMatchScore: 0, strengths: [], weaknesses: [], matchReasons: [] },
        probability: prob || { overallProbability: 0, probabilityLabel: 'Low' },
        bestScholarship: bestScholarship || null
      };
    });

    return {
      profileStrength: profileEngine.percentage,
      universities: detailedList
    };
  }, [profile, documents, uniqueApps, savedPrograms, selectedUniversities, scholarships]);

  // AI Analysis trigger
  useEffect(() => {
    if (comparisonData && comparisonData.universities.length >= 2 && !aiAnalysis && !loadingAI) {
      const fetchAI = async () => {
        setLoadingAI(true);
        try {
          const res = await UniversityComparisonService.compare(selectedUniversities, comparisonData);
          if (res.success && res.data) {
            setAiAnalysis(res.data);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingAI(false);
        }
      };
      fetchAI();
    }
  }, [comparisonData, selectedUniversities, aiAnalysis, loadingAI]);

  const removeUniversity = (id: string) => {
    const newIds = selectedIds.filter(i => i !== id);
    setSelectedIds(newIds);
    setAiAnalysis(null);
    router.replace(`/student/compare?ids=${newIds.join(',')}`);
  };

  const getRingColor = (score: number) => {
    if (score >= 80) return 'stroke-emerald-400';
    if (score >= 60) return 'stroke-amber-400';
    return 'stroke-rose-400';
  };

  if (selectedIds.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[80vh]">
        <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6">
          <Target className="text-indigo-400" size={32} />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Select Universities to Compare</h2>
        <p className="text-white/40 max-w-md mb-8">Go to Discover or your Saved Programs to select 2 to 5 universities to compare them using EDUING AI.</p>
        <button onClick={() => router.push('/student/discover')} className="px-8 py-4 bg-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest text-white hover:bg-indigo-500 transition-all">
          Explore Programs
        </button>
      </div>
    );
  }

  if (!comparisonData || allUniversities.length === 0) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-32">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 py-4 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-black flex items-center gap-2">AI University Comparison</h1>
            <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{selectedUniversities.length} programs selected</p>
          </div>
        </div>
        <button onClick={() => router.push('/student/discover')} className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-colors border border-white/5">
          <Plus size={14} /> Add University
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-12">
        {/* AI Insight Section */}
        {loadingAI ? (
          <div className="bg-[#111114] border border-indigo-500/20 rounded-[32px] p-8 mb-12 flex flex-col items-center justify-center text-center shadow-[0_4px_40px_rgba(99,102,241,0.05)] h-64">
             <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
             <h3 className="text-lg font-bold text-white mb-2">Gemini is analyzing your options...</h3>
             <p className="text-xs text-white/40">Evaluating recommendation scores, probability matrices, and your profile.</p>
          </div>
        ) : aiAnalysis ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#111114] border border-indigo-500/20 rounded-[32px] p-8 mb-12 shadow-[0_4px_40px_rgba(99,102,241,0.05)]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <Sparkles size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black">Copilot Verdict</h2>
                <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Powered by Gemini 2.5</div>
              </div>
            </div>
            
            <p className="text-white/80 leading-relaxed mb-8 text-[15px] font-medium">{aiAnalysis.summary}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5">
                <div className="text-[10px] uppercase tracking-widest text-emerald-400 font-black mb-2">Best Overall Match</div>
                <div className="font-bold text-lg">{aiAnalysis.bestOverallChoice}</div>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5">
                <div className="text-[10px] uppercase tracking-widest text-blue-400 font-black mb-2">Safest Option</div>
                <div className="font-bold text-lg">{aiAnalysis.safestOption}</div>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5">
                <div className="text-[10px] uppercase tracking-widest text-amber-400 font-black mb-2">Most Ambitious</div>
                <div className="font-bold text-lg">{aiAnalysis.mostAmbitiousChoice}</div>
              </div>
            </div>

            {aiAnalysis.actionableAdvice && aiAnalysis.actionableAdvice.length > 0 && (
              <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                <div className="text-[10px] uppercase tracking-widest text-white/40 font-black mb-4">What should I do next?</div>
                <div className="space-y-3">
                  {aiAnalysis.actionableAdvice.map((advice: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-3">
                      <ArrowRight className="text-indigo-400 shrink-0 mt-0.5" size={16} />
                      <div className="text-sm font-medium text-white/80">{advice}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ) : null}

        {/* Comparison Matrix Layout */}
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 no-scrollbar">
          {comparisonData.universities.map((item, idx) => (
            <div key={item.university.id} className="min-w-[320px] md:min-w-[400px] max-w-[450px] shrink-0 snap-center bg-[#111114] border border-white/5 rounded-[32px] flex flex-col relative group hover:border-white/10 transition-colors">
              <button onClick={() => removeUniversity(item.university.id)} className="absolute top-4 right-4 w-8 h-8 bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 rounded-full flex items-center justify-center transition-colors z-10">
                <X size={14} />
              </button>
              
              <div className="p-8 border-b border-white/5 relative overflow-hidden rounded-t-[32px]">
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
                <h3 className="text-2xl font-black mb-2 relative z-10 pr-6">{item.university.name}</h3>
                <div className="text-sm text-white/40 font-medium flex items-center gap-2 mb-6 relative z-10">
                   {item.university.location} • {item.university.type}
                </div>

                <div className="flex gap-4 relative z-10">
                   {/* Recommendation Score Ring */}
                   <div className="flex flex-col items-center bg-[#1A1A24] rounded-2xl p-4 flex-1 border border-white/5 shadow-inner">
                      <div className="relative w-16 h-16 mb-2">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="16" className="stroke-white/5" strokeWidth="3" fill="none" />
                          <circle 
                            cx="18" cy="18" r="16" 
                            className={getRingColor(item.recommendation.overallMatchScore)} 
                            strokeWidth="3" fill="none" strokeLinecap="round"
                            strokeDasharray="100" strokeDashoffset={100 - item.recommendation.overallMatchScore}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-sm font-black">{item.recommendation.overallMatchScore}</div>
                      </div>
                      <div className="text-[9px] uppercase tracking-widest text-white/40 font-bold text-center">Match Score</div>
                   </div>

                   {/* Probability Score Ring */}
                   <div className="flex flex-col items-center bg-[#1A1A24] rounded-2xl p-4 flex-1 border border-white/5 shadow-inner">
                      <div className="relative w-16 h-16 mb-2">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="16" className="stroke-white/5" strokeWidth="3" fill="none" />
                          <circle 
                            cx="18" cy="18" r="16" 
                            className={getRingColor(item.probability.overallProbability)} 
                            strokeWidth="3" fill="none" strokeLinecap="round"
                            strokeDasharray="100" strokeDashoffset={100 - item.probability.overallProbability}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-sm font-black">{item.probability.overallProbability}%</div>
                      </div>
                      <div className="text-[9px] uppercase tracking-widest text-white/40 font-bold text-center">Probability</div>
                   </div>
                </div>
              </div>

              <div className="p-8 space-y-8 flex-1 bg-[#111114] rounded-b-[32px]">
                {/* Profile Alignment */}
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-white/40 font-black mb-4">Profile Alignment</div>
                  <div className="space-y-3">
                    {item.recommendation.matchReasons.map((reason: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-medium text-emerald-400">
                        <CheckCircle2 size={14} className="shrink-0" /> {reason}
                      </div>
                    ))}
                    {item.recommendation.matchReasons.length === 0 && <div className="text-xs text-white/30">Limited alignment points.</div>}
                  </div>
                </div>

                {/* Admission Check */}
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-white/40 font-black mb-4">Admission Status</div>
                  <div className="bg-[#1A1A24] p-4 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-white/60 font-medium">Risk Level</span>
                      <span className={`text-xs font-bold ${item.probability.probabilityLabel === 'Very Low' || item.probability.probabilityLabel === 'Low' ? 'text-rose-400' : item.probability.probabilityLabel === 'Moderate' ? 'text-amber-400' : 'text-emerald-400'}`}>{item.probability.probabilityLabel}</span>
                    </div>
                    {item.recommendation.missingRequirements.length > 0 && (
                      <div className="pt-2 mt-2 border-t border-white/5">
                        <span className="text-[10px] text-amber-400 font-bold block mb-1">Needs Attention:</span>
                        <span className="text-xs text-white/80">{item.recommendation.missingRequirements.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Scholarship Info */}
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-white/40 font-black mb-4">Financial Aid</div>
                  {item.bestScholarship ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl">
                      <div className="text-xs font-bold text-emerald-400 mb-1">{item.bestScholarship.scholarship.name}</div>
                      <div className="text-[10px] text-emerald-400/70 font-medium">Eligibility: {item.bestScholarship.eligibilityScore}% Match</div>
                    </div>
                  ) : (
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-xs text-white/40 font-medium">
                      No matching scholarships found for this profile.
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <button onClick={() => router.push(`/student/universities/${item.university.id}`)} className="w-full py-4 bg-white hover:bg-white/90 text-black rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-xl">
                    View Full Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      <Suspense fallback={<div className="min-h-screen bg-[#0A0A0F]" />}>
        <CompareContent />
      </Suspense>
    </ProtectedRoute>
  );
}
