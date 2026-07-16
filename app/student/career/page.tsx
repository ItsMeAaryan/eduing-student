'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudentData } from '@/components/providers/StudentDataProvider';
import ProtectedRoute from '@/components/ProtectedRoute';

import { CareerAdvisorService } from '@/lib/ai/gemini/services';
import { calculateProfileStrength } from '@/lib/utils/profileStrength';
import { recommendUniversities } from '@/lib/utils/recommendationEngine';
import { calculateScholarshipEligibility } from '@/lib/utils/scholarshipEngine';
import { generateAdmissionChecklist } from '@/lib/utils/checklistEngine';

import { Sparkles, Briefcase, GraduationCap, ArrowRight, Activity, Code, Compass, Zap } from 'lucide-react';
import { listenUniversitiesFiltered } from '@/lib/firebase/universities';
import { listenScholarships } from '@/lib/firebase/scholarships';

function CareerAdvisorContent() {
  const { profile, documents, uniqueApps, savedPrograms } = useStudentData();
  const [allUniversities, setAllUniversities] = useState<any[]>([]);
  const [scholarships, setScholarships] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [careerData, setCareerData] = useState<any>(null);

  useEffect(() => {
    const unsubU = listenUniversitiesFiltered({}, (data) => setAllUniversities(data), (err) => console.error(err));
    const unsubS = listenScholarships((data) => setScholarships(data), (err) => console.error(err));
    return () => { unsubU(); unsubS(); };
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    try {
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

      const res = await CareerAdvisorService.getCareerPaths(aiContext);
      if (res.success && res.data) {
        setCareerData(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-32">
      {/* Header */}
      <div className="max-w-5xl mx-auto px-6 pt-16 pb-8 border-b border-white/5">
        <div className="flex items-center gap-4 mb-4 text-indigo-400">
          <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center">
            <Briefcase size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black">AI Career Advisor</h1>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 flex items-center gap-1">
              <Sparkles size={12} /> Powered by Gemini
            </p>
          </div>
        </div>
        <p className="text-white/60 max-w-2xl font-medium leading-relaxed">
          Discover careers, courses and universities that align with your strengths and goals based on your deterministic EDUING profile score.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {!careerData && !loading && (
          <div className="bg-[#111114] border border-white/5 p-12 rounded-[32px] text-center shadow-xl">
            <Compass size={48} className="text-indigo-400 mx-auto mb-6 opacity-80" />
            <h2 className="text-2xl font-black mb-2">Ready to explore your future?</h2>
            <p className="text-white/40 max-w-md mx-auto mb-8">
              Generate a personalized career roadmap and recommendations based on your current academic profile and interests.
            </p>
            <button 
              onClick={handleGenerate}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 mx-auto"
            >
              <Sparkles size={16} /> Generate Career Plan
            </button>
          </div>
        )}

        {loading && (
           <div className="bg-[#111114] border border-indigo-500/20 p-12 rounded-[32px] text-center shadow-[0_0_50px_rgba(99,102,241,0.1)]">
             <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-6" />
             <h2 className="text-xl font-black text-white mb-2">Analyzing your profile...</h2>
             <p className="text-white/40 text-sm">Evaluating scores, interests, and matching potential careers.</p>
           </div>
        )}

        {careerData && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
            
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
      </div>
    </div>
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
