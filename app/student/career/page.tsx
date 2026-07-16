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
      title="Career Roadmap"
      icon={<Compass size={16} />}
      themeColor="amber"
      headerActions={
        <button 
          onClick={handleGenerate}
          disabled={loading}
          className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black px-5 py-2 rounded-full font-bold text-xs uppercase tracking-widest shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
        >
          {loading ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <Sparkles size={14} />}
          {loading ? 'Analyzing...' : (careerData ? 'Regenerate' : 'Generate Roadmap')}
        </button>
      }
    >
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10">
        <div className="max-w-6xl mx-auto w-full flex flex-col gap-8">
          
          {!careerData && !loading && !error && (
            <div className="flex-1 min-h-[60vh] flex items-center justify-center">
              <div className="max-w-2xl w-full bg-[#111114] border border-white/5 rounded-[32px] p-10 lg:p-16 text-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-500/10 blur-[100px] mix-blend-screen opacity-50 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                <div className="w-20 h-20 bg-amber-500/10 rounded-[24px] flex items-center justify-center text-amber-400 mx-auto mb-6 relative z-10 border border-amber-500/20">
                  <Compass size={40} />
                </div>
                <h2 className="text-3xl font-display font-bold text-white mb-4 relative z-10">Discover your path</h2>
                <p className="text-white/50 text-lg mb-10 max-w-lg mx-auto relative z-10 leading-relaxed">
                  Generate a personalized career roadmap based on your {profileEngine.percentage}% profile strength, skills, and academic goals.
                </p>
                <button 
                  onClick={handleGenerate}
                  className="bg-amber-500 hover:bg-amber-400 text-black px-8 py-4 rounded-full font-bold text-sm uppercase tracking-widest shadow-[0_8px_30px_rgba(245,158,11,0.3)] transition-all flex items-center justify-center gap-2 mx-auto relative z-10"
                >
                  <Sparkles size={18} /> Map My Future
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-3xl text-center">
              <Zap className="text-red-400 mx-auto mb-4" size={32} />
              <h3 className="text-xl font-bold text-white mb-2">Generation Failed</h3>
              <p className="text-red-400/80">{error}</p>
            </div>
          )}

          {loading && (
            <div className="flex-1 min-h-[60vh] flex items-center justify-center flex-col gap-6">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <div className="absolute inset-0 border-2 border-amber-500/20 rounded-full animate-[spin_3s_linear_infinite]" />
                <div className="absolute inset-2 border-2 border-amber-500/40 border-t-amber-500 rounded-full animate-spin" />
                <Compass className="text-amber-500 relative z-10 animate-pulse" size={32} />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">Analyzing Trajectories</h3>
                <p className="text-white/50">Mapping your profile to global career paths...</p>
              </div>
            </div>
          )}

          {careerData && !loading && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              
              {/* Dashboard Grid Top Row */}
              <div className="grid grid-cols-12 gap-6">
                
                {/* Summary Card */}
                <div className="col-span-12 lg:col-span-8 bg-amber-500/10 border border-amber-500/20 rounded-[32px] p-8 lg:p-10 relative overflow-hidden flex flex-col justify-center shadow-lg">
                  <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-amber-500/20 blur-[100px] rounded-full pointer-events-none" />
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-amber-400 mb-4 flex items-center gap-2 relative z-10">
                    <Activity size={14} /> AI Analysis
                  </h3>
                  <p className="text-xl lg:text-2xl text-white/90 font-medium leading-relaxed relative z-10 tracking-tight">
                    &quot;{careerData.summary}&quot;
                  </p>
                </div>
                
                {/* Profile Context Card */}
                <div className="col-span-12 lg:col-span-4 bg-[#111114] border border-white/5 rounded-[32px] p-8 flex flex-col justify-between">
                  <div>
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2">
                      <User size={14} /> Profile Match
                    </h3>
                    <div className="flex items-end gap-3 mb-2">
                      <span className="text-5xl font-display font-bold text-white">{profileEngine.percentage}%</span>
                    </div>
                    <p className="text-sm text-white/50 mt-4 leading-relaxed">
                      Your career roadmap is optimized based on your deterministic profile strength and current application data.
                    </p>
                  </div>
                  <div className="w-full h-2 bg-black/50 rounded-full mt-6 overflow-hidden border border-white/5">
                    <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full" style={{ width: `${profileEngine.percentage}%` }} />
                  </div>
                </div>
              </div>

              {/* Roadmap Timeline */}
              <div>
                <h3 className="text-lg font-bold text-white mb-6 px-2">Strategic Roadmap</h3>
                <div className="bg-[#111114] border border-white/5 rounded-[32px] p-8 lg:p-12 overflow-x-auto custom-scrollbar">
                  <div className="flex min-w-[800px] relative">
                    <div className="absolute top-6 left-0 right-0 h-1 bg-white/5 rounded-full" />
                    
                    {careerData.roadmap.map((step: any, idx: number) => (
                      <div key={idx} className="flex-1 relative px-4">
                        <div className="w-12 h-12 rounded-full bg-[#1A1A24] border-4 border-[#111114] flex items-center justify-center shadow-xl mx-auto mb-6 relative z-10">
                          <div className="w-3 h-3 bg-amber-400 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
                        </div>
                        <div className="text-center">
                          <h4 className="text-sm font-bold text-white mb-2">{step.step}</h4>
                          <p className="text-xs text-white/50 font-medium leading-relaxed max-w-[200px] mx-auto">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommended Careers Grid */}
              <div>
                <h3 className="text-lg font-bold text-white mb-6 px-2">Top Career Fits</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {careerData.recommendedCareers.map((career: any, idx: number) => (
                    <div key={idx} className="bg-[#111114] border border-white/5 rounded-[32px] p-8 hover:border-white/10 transition-colors flex flex-col h-full group">
                      <div className="flex items-start justify-between mb-6">
                        <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
                          <Briefcase size={24} />
                        </div>
                        <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-white/60 tracking-wider uppercase border border-white/10">
                          {career.suggestedDegree}
                        </span>
                      </div>
                      
                      <h4 className="text-2xl font-bold text-white mb-3">{career.title}</h4>
                      <p className="text-sm text-white/50 leading-relaxed mb-8 flex-1">
                        {career.reasoning}
                      </p>
                      
                      <div className="space-y-6">
                        <div>
                          <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold block mb-3">Required Skills</span>
                          <div className="flex flex-wrap gap-2">
                            {career.requiredSkills.map((skill: string, sIdx: number) => (
                              <span key={sIdx} className="px-3 py-1.5 bg-[#1A1A24] border border-white/5 rounded-xl text-xs font-medium text-white/70">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="bg-[#1A1A24] rounded-2xl p-4 border border-white/5 flex gap-3 items-start">
                          <Zap className="text-amber-400 shrink-0 mt-0.5" size={16} />
                          <div>
                            <span className="text-[10px] uppercase tracking-widest text-amber-400/80 font-bold block mb-1">Future Scope</span>
                            <span className="text-xs text-white/70 leading-relaxed">{career.futureScope}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          )}
        </div>
      </div>
    </AIWorkspaceLayout>
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
