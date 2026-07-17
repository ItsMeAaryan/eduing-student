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
import { Card, Button, Badge, H2, H3, H4, Body, Small, Caption, MetricCard } from '@/components/ui/design-system';

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
      icon={<Compass size={16} strokeWidth={1.8} />}
      themeColor="amber"
      headerActions={
        <Button 
          onClick={handleGenerate}
          disabled={loading}
          variant="primary"
          size="sm"
          className="!bg-amber-500 hover:!bg-amber-600 !border-amber-500 !text-black flex items-center gap-8 disabled:!bg-background disabled:!border-border disabled:!text-text-secondary"
        >
          {loading ? <div className="w-16 h-16 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Sparkles size={14} strokeWidth={1.8} />}
          {loading ? 'Analyzing...' : (careerData ? 'Regenerate' : 'Generate Roadmap')}
        </Button>
      }
    >
      <div className="flex-1 overflow-y-auto custom-scrollbar p-24 lg:p-40 bg-background">
        <div className="max-w-6xl mx-auto w-full flex flex-col gap-32">
          
          {!careerData && !loading && !error && (
            <div className="flex-1 min-h-[60vh] flex items-center justify-center">
              <Card className="max-w-2xl w-full !p-40 lg:!p-64 text-center relative overflow-hidden group shadow-sm">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-500/10 blur-[100px] mix-blend-screen opacity-50 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                <div className="w-[80px] h-[80px] bg-amber-500/10 rounded-card flex items-center justify-center text-amber-500 mx-auto mb-24 relative z-10 border border-amber-500/20">
                  <Compass size={40} strokeWidth={1.5} />
                </div>
                <H2 className="mb-16 relative z-10">Discover your path</H2>
                <Body className="text-text-secondary mb-40 max-w-lg mx-auto relative z-10">
                  Generate a personalized career roadmap based on your {profileEngine.percentage}% profile strength, skills, and academic goals.
                </Body>
                <Button 
                  onClick={handleGenerate}
                  variant="primary"
                  className="!bg-amber-500 hover:!bg-amber-600 !border-amber-500 !text-black flex items-center justify-center gap-8 mx-auto relative z-10 shadow-sm"
                >
                  <Sparkles size={18} strokeWidth={1.8} /> Map My Future
                </Button>
              </Card>
            </div>
          )}

          {error && (
            <Card className="!p-32 bg-danger/10 border-danger/20 text-center shadow-sm">
              <Zap className="text-danger mx-auto mb-16" size={32} strokeWidth={1.8} />
              <H3 className="text-danger mb-8">Generation Failed</H3>
              <Body className="text-danger/80">{error}</Body>
            </Card>
          )}

          {loading && (
            <div className="flex-1 min-h-[60vh] flex items-center justify-center flex-col gap-24">
              <div className="relative w-[96px] h-[96px] flex items-center justify-center">
                <div className="absolute inset-0 border-2 border-amber-500/20 rounded-full animate-[spin_3s_linear_infinite]" />
                <div className="absolute inset-2 border-2 border-amber-500/40 border-t-amber-500 rounded-full animate-spin" />
                <Compass className="text-amber-500 relative z-10 animate-pulse" size={32} strokeWidth={1.8} />
              </div>
              <div className="text-center">
                <H3 className="text-text-primary mb-8">Analyzing Trajectories</H3>
                <Body className="text-text-secondary">Mapping your profile to global career paths...</Body>
              </div>
            </div>
          )}

          {careerData && !loading && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-32">
              
              {/* Dashboard Grid Top Row */}
              <div className="grid grid-cols-12 gap-24">
                
                {/* Summary Card */}
                <Card className="col-span-12 lg:col-span-8 bg-amber-500/10 border-amber-500/20 !p-32 lg:!p-40 relative overflow-hidden flex flex-col justify-center shadow-sm">
                  <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-amber-500/20 blur-[100px] rounded-full pointer-events-none" />
                  <Caption className="font-bold uppercase tracking-widest text-amber-500 mb-16 flex items-center gap-8 relative z-10">
                    <Activity size={16} strokeWidth={1.8} /> AI Analysis
                  </Caption>
                  <H4 className="text-text-primary font-medium leading-relaxed relative z-10 tracking-tight">
                    &quot;{careerData.summary}&quot;
                  </H4>
                </Card>
                
                {/* Profile Context Card */}
                <Card className="col-span-12 lg:col-span-4 !p-32 flex flex-col justify-between shadow-sm">
                  <div>
                    <Caption className="font-bold uppercase tracking-widest text-text-secondary mb-24 flex items-center gap-8">
                      <User size={16} strokeWidth={1.8} /> Profile Match
                    </Caption>
                    <div className="flex items-end gap-12 mb-8">
                      <span className="text-5xl font-display font-bold text-text-primary">{profileEngine.percentage}%</span>
                    </div>
                    <Small className="text-text-secondary mt-16 leading-relaxed">
                      Your career roadmap is optimized based on your deterministic profile strength and current application data.
                    </Small>
                  </div>
                  <div className="w-full h-[8px] bg-background border border-border rounded-full mt-24 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-600 to-amber-500 rounded-full" style={{ width: `${profileEngine.percentage}%` }} />
                  </div>
                </Card>
              </div>

              {/* Roadmap Timeline */}
              <div>
                <H3 className="mb-24 px-8">Strategic Roadmap</H3>
                <Card className="!p-32 lg:!p-48 overflow-x-auto custom-scrollbar shadow-sm">
                  <div className="flex min-w-[800px] relative">
                    <div className="absolute top-[24px] left-0 right-0 h-[4px] bg-background border-y border-border rounded-full" />
                    
                    {careerData.roadmap.map((step: any, idx: number) => (
                      <div key={idx} className="flex-1 relative px-16">
                        <div className="w-[48px] h-[48px] rounded-full bg-background border-4 border-border flex items-center justify-center shadow-sm mx-auto mb-24 relative z-10">
                          <div className="w-12 h-12 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
                        </div>
                        <div className="text-center">
                          <Body className="font-bold text-text-primary mb-8">{step.step}</Body>
                          <Caption className="text-text-secondary font-medium leading-relaxed max-w-[200px] mx-auto">{step.description}</Caption>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Recommended Careers Grid */}
              <div>
                <H3 className="mb-24 px-8">Top Career Fits</H3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
                  {careerData.recommendedCareers.map((career: any, idx: number) => (
                    <Card key={idx} className="!p-32 hover:border-text-secondary/30 transition-colors flex flex-col h-full group shadow-sm">
                      <div className="flex items-start justify-between mb-24">
                        <div className="w-[56px] h-[56px] bg-amber-500/10 rounded-card flex items-center justify-center text-amber-500 border border-amber-500/20 group-hover:scale-110 transition-transform">
                          <Briefcase size={24} strokeWidth={1.8} />
                        </div>
                        <Badge variant="default" className="text-text-secondary uppercase tracking-wider text-[10px]">
                          {career.suggestedDegree}
                        </Badge>
                      </div>
                      
                      <H3 className="mb-12">{career.title}</H3>
                      <Small className="text-text-secondary leading-relaxed mb-32 flex-1">
                        {career.reasoning}
                      </Small>
                      
                      <div className="flex flex-col gap-24">
                        <div>
                          <Caption className="uppercase tracking-widest text-text-secondary font-bold block mb-12">Required Skills</Caption>
                          <div className="flex flex-wrap gap-8">
                            {career.requiredSkills.map((skill: string, sIdx: number) => (
                              <Badge key={sIdx} variant="default" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="bg-background rounded-card p-16 border border-border flex gap-12 items-start">
                          <Zap className="text-amber-500 shrink-0 mt-4" size={16} strokeWidth={1.8} />
                          <div>
                            <Caption className="uppercase tracking-widest text-amber-500/80 font-bold block mb-4">Future Scope</Caption>
                            <Small className="text-text-secondary leading-relaxed">{career.futureScope}</Small>
                          </div>
                        </div>
                      </div>
                    </Card>
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
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <CareerAdvisorContent />
      </Suspense>
    </ProtectedRoute>
  );
}
