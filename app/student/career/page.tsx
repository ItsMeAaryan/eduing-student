'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudentData } from '@/components/providers/StudentDataProvider';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAIGeneration } from '@/hooks/useAIGeneration';

import { CareerAdvisorService } from '@/lib/ai/gemini/services';
import { calculateProfileStrength } from '@/lib/utils/profileStrength';
import { recommendUniversities } from '@/lib/utils/recommendationEngine';
import { calculateScholarshipEligibility } from '@/lib/utils/scholarshipEngine';
import { Sparkles, Briefcase, GraduationCap, ArrowRight, Activity, Code, Compass, Zap, User } from 'lucide-react';
import { AIWorkspaceLayout } from '@/components/ai/AIWorkspaceLayout';
import { AIContextCard } from '@/components/ai/AIContextCard';
import { AIEmptyState } from '@/components/ai/AIEmptyState';
import { AILoadingState } from '@/components/ai/AILoadingState';

function CareerAdvisorContent() {
  const { profile, documents, uniqueApps, savedPrograms, universities: allUniversities, scholarships } = useStudentData();
  
  const { data: careerData, isGenerating: loading, generate, error } = useAIGeneration<any>();

  const handleGenerate = async () => {
    const profileEngine = calculateProfileStrength(profile, documents || []);
    const recommendations = recommendUniversities(allUniversities, {
      profile,
      documents: documents || [],
      applications: uniqueApps || [],
      savedPrograms: savedPrograms || [],
      profileScore: profileEngine.percentage
    });
    const scholarshipResults = calculateScholarshipEligibility({
      profile,
      documents: documents || [],
      profileScore: profileEngine.percentage
    }, scholarships);

    const aiContext = {
      studentProfile: profile,
      profileStrength: profileEngine.percentage,
      topRecommendations: recommendations.slice(0, 3).map(r => r.university.name),
      topScholarships: scholarshipResults.slice(0, 2).map(s => s.scholarship.name)
    };

    await generate(() => CareerAdvisorService.getCareerPaths(aiContext));
  };

  const profileEngine = useMemo(() => calculateProfileStrength(profile, documents || []), [profile, documents]);

  return (
    <AIWorkspaceLayout
      title="AI Career Advisor"
      icon={<Briefcase size={16} />}
      leftPanel={
        <>
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3">Action</h3>
            <button 
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Sparkles size={16} />}
              {loading ? 'Analyzing...' : 'Generate Plan'}
            </button>
          </div>
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl mt-4">
             <h4 className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2">How it works</h4>
             <p className="text-[11px] text-white/40 leading-relaxed">
               Discover careers, courses and universities that align with your strengths and goals based on your deterministic EDUING profile score.
             </p>
          </div>
        </>
      }
      centerPanel={
        <>
          {!careerData && !loading && !error && (
            <AIEmptyState
              icon={Compass}
              title="Ready to explore your future?"
              description="Generate a personalized career roadmap and recommendations based on your current academic profile and interests."
            />
          )}

          {error && (
            <AIEmptyState
              icon={Zap}
              title="Generation Error"
              description={error}
            />
          )}

          {loading && (
            <AILoadingState
              title="Analyzing your profile..."
              description="Evaluating scores, interests, and matching potential careers."
            />
          )}

          {careerData && !loading && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 pb-24">
              
              {/* Summary */}
              <div className="bg-indigo-500/10 border border-indigo-500/20 p-8 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[100px]" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-4 flex items-center gap-2">
                  <Activity size={14} /> AI Analysis
                </h3>
                <p className="text-lg text-white/90 font-medium leading-relaxed relative z-10">
                  {careerData.summary}
                </p>
              </div>

              {/* Recommended Careers */}
              <div>
                <h3 className="text-xl font-black mb-6">Top Career Recommendations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {careerData.recommendedCareers.map((career: any, idx: number) => (
                    <div key={idx} className="bg-[#111114] border border-white/5 rounded-[24px] p-8 hover:border-white/10 transition-colors">
                      <h4 className="text-xl font-black text-white mb-2">{career.title}</h4>
                      <div className="text-sm font-medium text-emerald-400 mb-6 flex items-center gap-2">
                        <GraduationCap size={16} /> {career.suggestedDegree}
                      </div>
                      
                      <p className="text-sm text-white/60 leading-relaxed mb-6">
                        {career.reasoning}
                      </p>
                      
                      <div className="mb-6">
                        <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold block mb-3">Required Skills</span>
                        <div className="flex flex-wrap gap-2">
                          {career.requiredSkills.map((skill: string, sIdx: number) => (
                            <span key={sIdx} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-medium text-white/80">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="bg-[#1A1A24] rounded-xl p-4 border border-white/5">
                        <span className="text-[10px] uppercase tracking-widest text-amber-400 font-bold block mb-1">Future Scope</span>
                        <span className="text-xs text-white/60 font-medium">{career.futureScope}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Roadmap */}
              <div>
                <h3 className="text-xl font-black mb-6">Your Personalized Roadmap</h3>
                <div className="bg-[#111114] border border-white/5 rounded-[32px] p-8 relative">
                  <div className="absolute top-8 bottom-8 left-[43px] w-0.5 bg-white/10" />
                  <div className="space-y-8">
                    {careerData.roadmap.map((step: any, idx: number) => (
                      <div key={idx} className="flex gap-6 relative z-10">
                        <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center shrink-0 mt-1 shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-white mb-1 uppercase tracking-wider">{step.step}</h4>
                          <p className="text-sm text-white/60 font-medium">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div>
                <h3 className="text-xl font-black mb-6">Actionable Next Steps</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {careerData.nextSteps.map((step: string, idx: number) => (
                    <div key={idx} className="bg-[#1A1A24] border border-white/5 p-5 rounded-2xl flex items-start gap-4">
                      <Zap className="text-amber-400 shrink-0 mt-0.5" size={18} />
                      <span className="text-sm text-white/80 font-medium">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          )}
        </>
      }
      rightPanel={
        <>
          <div className="p-4 border-b border-white/5">
             <h2 className="text-xs font-black uppercase tracking-widest text-white/40">Profile Context</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {/* Profile Strength */}
            <AIContextCard
              title="Score"
              icon={User}
              value={`${profileEngine.percentage}%`}
              progress={profileEngine.percentage}
            />
            
            <p className="text-xs text-white/40 leading-relaxed">
              This score represents the deterministic strength of your academic profile and is used to generate highly personalized career roadmaps.
            </p>
          </div>
        </>
      }
    />
  );
}

export default function CareerAdvisorPage() {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      <Suspense fallback={<div className="min-h-screen bg-[#0A0A0F]" />}>
        <CareerAdvisorContent />
      </Suspense>
    </ProtectedRoute>
  );
}
