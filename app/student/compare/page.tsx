'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { useStudentData } from '@/components/providers/StudentDataProvider';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAIGeneration } from '@/hooks/useAIGeneration';

// Services & Engines
import { calculateProfileStrength } from '@/lib/utils/profileStrength';
import { recommendUniversities } from '@/lib/utils/recommendationEngine';
import { calculateAdmissionProbability } from '@/lib/utils/probabilityEngine';
import { calculateScholarshipEligibility } from '@/lib/utils/scholarshipEngine';
import { UniversityComparisonService } from '@/lib/ai/gemini/services';
import { Sparkles, ArrowRight, ShieldCheck, Target, GraduationCap, X, CheckCircle2, ChevronLeft, Plus, LayoutDashboard } from 'lucide-react';
import { AIWorkspaceLayout } from '@/components/ai/AIWorkspaceLayout';
import { AILoadingState } from '@/components/ai/AILoadingState';
import { AIEmptyState } from '@/components/ai/AIEmptyState';

function CompareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawIds = searchParams.get('ids');
  
  const { profile, documents, uniqueApps, savedPrograms, universities: allUniversities, scholarships } = useStudentData();
  const { data: aiAnalysis, setData: setAiAnalysis, isGenerating: loadingAI, generate, error } = useAIGeneration<any>();
  const [selectedIds, setSelectedIds] = useState<string[]>(rawIds ? rawIds.split(',') : []);

  const selectedUniversities = useMemo(() => {
    return selectedIds.map(id => allUniversities.find((u: any) => u.id === id)).filter(Boolean);
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
    if (comparisonData && comparisonData.universities.length >= 2 && !aiAnalysis && !loadingAI && !error) {
      generate(() => UniversityComparisonService.compare(selectedUniversities, comparisonData));
    }
  }, [comparisonData, selectedUniversities, aiAnalysis, loadingAI, error, generate]);

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
      <AIWorkspaceLayout
        title="AI University Comparison"
        icon={<LayoutDashboard size={16} />}
        leftPanel={<></>}
        centerPanel={
          <AIEmptyState
            icon={Target}
            title="Select Universities to Compare"
            description="Go to Discover or your Saved Programs to select 2 to 5 universities to compare them using EDUING AI."
            actionButton={
              <button onClick={() => router.push('/student/discover')} className="px-8 py-4 bg-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest text-white hover:bg-indigo-500 transition-all">
                Explore Programs
              </button>
            }
          />
        }
        rightPanel={<></>}
      />
    );
  }

  if (!comparisonData || allUniversities.length === 0) {
    return (
      <AIWorkspaceLayout
        title="AI University Comparison"
        icon={<LayoutDashboard size={16} />}
        leftPanel={<></>}
        centerPanel={
          <AILoadingState
            title="Loading Comparison Data..."
            description="Fetching universities and running deterministic engines."
          />
        }
        rightPanel={<></>}
      />
    );
  }

  return (
    <AIWorkspaceLayout
      title="AI University Comparison"
      icon={<LayoutDashboard size={16} />}
      headerActions={
        <>
          <button onClick={() => router.push('/student/discover')} className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-colors border border-white/5">
            <Plus size={14} /> Add University
          </button>
        </>
      }
      leftPanel={
        <>
          <div className="p-4 border-b border-white/5">
             <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40">Selected Programs</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {comparisonData.universities.map(item => (
              <div key={item.university.id} className="bg-[#111114] border border-white/5 p-3 rounded-xl flex items-center justify-between group">
                 <div className="truncate pr-3">
                   <div className="text-xs font-bold text-white truncate">{item.university.name}</div>
                   <div className="text-[10px] text-white/40 truncate">{item.university.location}</div>
                 </div>
                 <button onClick={() => removeUniversity(item.university.id)} className="w-6 h-6 shrink-0 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-full flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100">
                   <X size={12} />
                 </button>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-white/5">
            <button onClick={() => router.push('/student/discover')} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold transition-all text-white flex justify-center items-center gap-2 shadow-lg shadow-indigo-500/20">
              <Plus size={14} /> Compare Another
            </button>
          </div>
        </>
      }
      centerPanel={
        <>
          <div className="flex overflow-x-auto gap-6 pb-8 custom-scrollbar">
            {comparisonData.universities.map((item, idx) => (
              <div key={item.university.id} className="min-w-[320px] max-w-[400px] shrink-0 bg-[#111114] border border-white/5 rounded-[32px] flex flex-col relative group hover:border-white/10 transition-colors">
                
                <div className="p-6 border-b border-white/5 relative overflow-hidden rounded-t-[32px]">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
                  <h3 className="text-xl font-black mb-1 relative z-10">{item.university.name}</h3>
                  <div className="text-[11px] text-white/40 font-medium flex items-center gap-2 mb-6 relative z-10">
                     {item.university.location} • {item.university.type}
                  </div>

                  <div className="flex gap-4 relative z-10">
                     {/* Recommendation Score Ring */}
                     <div className="flex flex-col items-center bg-[#1A1A24] rounded-2xl p-3 flex-1 border border-white/5 shadow-inner">
                        <div className="relative w-12 h-12 mb-2">
                          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="16" className="stroke-white/5" strokeWidth="3" fill="none" />
                            <circle 
                              cx="18" cy="18" r="16" 
                              className={getRingColor(item.recommendation.overallMatchScore)} 
                              strokeWidth="3" fill="none" strokeLinecap="round"
                              strokeDasharray="100" strokeDashoffset={100 - item.recommendation.overallMatchScore}
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center text-xs font-black">{item.recommendation.overallMatchScore}</div>
                        </div>
                        <div className="text-[9px] uppercase tracking-widest text-white/40 font-bold text-center">Match</div>
                     </div>

                     {/* Probability Score Ring */}
                     <div className="flex flex-col items-center bg-[#1A1A24] rounded-2xl p-3 flex-1 border border-white/5 shadow-inner">
                        <div className="relative w-12 h-12 mb-2">
                          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="16" className="stroke-white/5" strokeWidth="3" fill="none" />
                            <circle 
                              cx="18" cy="18" r="16" 
                              className={getRingColor(item.probability.overallProbability)} 
                              strokeWidth="3" fill="none" strokeLinecap="round"
                              strokeDasharray="100" strokeDashoffset={100 - item.probability.overallProbability}
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center text-xs font-black">{item.probability.overallProbability}%</div>
                        </div>
                        <div className="text-[9px] uppercase tracking-widest text-white/40 font-bold text-center">Prob</div>
                     </div>
                  </div>
                </div>

                <div className="p-6 space-y-6 flex-1 bg-[#111114] rounded-b-[32px]">
                  {/* Profile Alignment */}
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-white/40 font-black mb-3">Profile Alignment</div>
                    <div className="space-y-2">
                      {item.recommendation.matchReasons.map((reason: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-xs font-medium text-emerald-400">
                          <CheckCircle2 size={12} className="shrink-0" /> {reason}
                        </div>
                      ))}
                      {item.recommendation.matchReasons.length === 0 && <div className="text-xs text-white/30">Limited alignment points.</div>}
                    </div>
                  </div>

                  {/* Admission Check */}
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-white/40 font-black mb-3">Admission Status</div>
                    <div className="bg-[#1A1A24] p-3 rounded-2xl border border-white/5">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-white/60 font-medium">Risk Level</span>
                        <span className={`text-[11px] uppercase tracking-widest font-black ${item.probability.probabilityLabel === 'Very Low' || item.probability.probabilityLabel === 'Low' ? 'text-rose-400' : item.probability.probabilityLabel === 'Moderate' ? 'text-amber-400' : 'text-emerald-400'}`}>{item.probability.probabilityLabel}</span>
                      </div>
                      {item.recommendation.missingRequirements.length > 0 && (
                        <div className="pt-2 mt-2 border-t border-white/5">
                          <span className="text-[9px] uppercase tracking-widest text-amber-400 font-bold block mb-1">Needs Attention:</span>
                          <span className="text-xs text-white/80">{item.recommendation.missingRequirements.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Scholarship Info */}
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-white/40 font-black mb-3">Financial Aid</div>
                    {item.bestScholarship ? (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-2xl">
                        <div className="text-xs font-bold text-emerald-400 mb-1 truncate">{item.bestScholarship.scholarship.name}</div>
                        <div className="text-[10px] text-emerald-400/70 font-medium">Eligibility: {item.bestScholarship.eligibilityScore}% Match</div>
                      </div>
                    ) : (
                      <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-[11px] text-white/40 font-medium">
                        No matching scholarships found.
                      </div>
                    )}
                  </div>

                  <div className="pt-2">
                    <button onClick={() => router.push(`/student/universities/${item.university.id}`)} className="w-full py-3 bg-white hover:bg-white/90 text-black rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl">
                      View Full Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      }
      rightPanel={
        <>
          <div className="p-4 border-b border-white/5 flex items-center gap-2">
            <Sparkles size={14} className="text-indigo-400" />
            <h2 className="text-xs font-black uppercase tracking-widest text-indigo-400">Copilot Verdict</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
            {error && (
              <AIEmptyState 
                icon={Target} 
                title="Analysis Failed" 
                description={error} 
              />
            )}
            {loadingAI && !error && (
              <AILoadingState 
                title="Analyzing options..." 
                description="Evaluating recommendation scores and probability matrices." 
              />
            )}
            {aiAnalysis && !loadingAI && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                
                <p className="text-white/80 leading-relaxed text-xs font-medium bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-2xl">{aiAnalysis.summary}</p>
                
                <div className="space-y-3">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
                    <div className="text-[9px] uppercase tracking-widest text-emerald-400 font-black mb-1">Best Overall Match</div>
                    <div className="font-bold text-sm text-emerald-400">{aiAnalysis.bestOverallChoice}</div>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
                    <div className="text-[9px] uppercase tracking-widest text-blue-400 font-black mb-1">Safest Option</div>
                    <div className="font-bold text-sm text-blue-400">{aiAnalysis.safestOption}</div>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
                    <div className="text-[9px] uppercase tracking-widest text-amber-400 font-black mb-1">Most Ambitious</div>
                    <div className="font-bold text-sm text-amber-400">{aiAnalysis.mostAmbitiousChoice}</div>
                  </div>
                </div>

                {aiAnalysis.actionableAdvice && aiAnalysis.actionableAdvice.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-white/40 font-black mb-3">Actionable Advice</div>
                    <div className="space-y-2">
                      {aiAnalysis.actionableAdvice.map((advice: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-2 bg-[#14141A] p-3 rounded-xl border border-white/5">
                          <ArrowRight className="text-indigo-400 shrink-0 mt-0.5" size={12} />
                          <div className="text-[11px] font-medium text-white/80 leading-relaxed">{advice}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </>
      }
    />
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
