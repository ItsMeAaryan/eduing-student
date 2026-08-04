// app/student/compare/page.tsx
'use client';

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { useStudentData } from '@/components/providers/StudentDataProvider';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAIGeneration } from '@/hooks/useAIGeneration';

import { calculateProfileStrength } from '@/lib/utils/profileStrength';
import { recommendUniversities } from '@/lib/utils/recommendationEngine';
import { calculateAdmissionProbability } from '@/lib/utils/probabilityEngine';
import { calculateScholarshipEligibility } from '@/lib/utils/scholarshipEngine';
import { UniversityComparisonService } from '@/lib/ai/gemini/services';
import {
  Sparkles, ArrowRight, Target, X, CheckCircle2, Plus, LayoutDashboard
} from 'lucide-react';
import { AIWorkspaceLayout } from '@/components/ai/AIWorkspaceLayout';
import { AILoadingState } from '@/components/ai/AILoadingState';
import { AIEmptyState } from '@/components/ai/AIEmptyState';
import { Card, Button, Caption, Small, Body } from '@/components/ui/design-system';

function CompareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawIds = searchParams.get('ids');

  const { profile, documents, uniqueApps, savedPrograms, universities: allUniversities, scholarships } = useStudentData();
  const { data: aiAnalysis, setData: setAiAnalysis, isGenerating: loadingAI, generate, error } = useAIGeneration<any>();
  const [selectedIds, setSelectedIds] = useState<string[]>(rawIds ? rawIds.split(',') : []);

  // FIXED: ref guard prevents the useEffect from re-triggering on every render
  const aiTriggered = useRef(false);

  const selectedUniversities = useMemo(() => {
    return selectedIds.map(id => allUniversities.find((u: any) => u.id === id)).filter(Boolean);
  }, [allUniversities, selectedIds]);

  const comparisonData = useMemo(() => {
    if (!profile || selectedUniversities.length === 0) return null;
    const profileEngine = calculateProfileStrength(profile, documents || []);
    const detailedList = selectedUniversities.map(uni => {
      const rec = recommendUniversities([uni], {
        profile,
        documents: documents || [],
        applications: uniqueApps || [],
        savedPrograms: savedPrograms || [],
        profileScore: profileEngine.percentage
      })[0];
      const prob = calculateAdmissionProbability(uni, {
        profile,
        documents: documents || [],
        profileScore: profileEngine.percentage
      });
      const sch = calculateScholarshipEligibility({
        profile,
        documents: documents || [],
        profileScore: profileEngine.percentage
      }, scholarships).filter((s: any) => s.scholarship.universityId === uni.id || !s.scholarship.universityId);
      const bestScholarship = sch.length > 0 ? sch[0] : null;
      return {
        university: uni,
        recommendation: rec || { overallMatchScore: 0, strengths: [], weaknesses: [], matchReasons: [], missingRequirements: [] },
        probability: prob || { overallProbability: 0, probabilityLabel: 'Low' },
        bestScholarship: bestScholarship || null
      };
    });
    return { profileStrength: profileEngine.percentage, universities: detailedList };
  }, [profile, documents, uniqueApps, savedPrograms, selectedUniversities, scholarships]);

  // FIXED: only trigger AI once per set of selected universities, not on every render
  useEffect(() => {
    if (
      comparisonData &&
      comparisonData.universities.length >= 2 &&
      !aiAnalysis &&
      !loadingAI &&
      !error &&
      !aiTriggered.current
    ) {
      aiTriggered.current = true;
      generate(() => UniversityComparisonService.compare(selectedUniversities, comparisonData));
    }
  }, [comparisonData]); // eslint-disable-line react-hooks/exhaustive-deps

  const removeUniversity = (id: string) => {
    const newIds = selectedIds.filter(i => i !== id);
    setSelectedIds(newIds);
    setAiAnalysis(null);
    aiTriggered.current = false; // FIXED: reset so AI re-runs with new selection
    router.replace(`/student/compare?ids=${newIds.join(',')}`);
  };

  const getRingColor = (score: number) => {
    if (score >= 80) return 'stroke-success';
    if (score >= 60) return 'stroke-warning';
    return 'stroke-danger';
  };

  if (selectedIds.length === 0) {
    return (
      <AIWorkspaceLayout
        title="AI University Comparison"
        icon={<LayoutDashboard size={16} strokeWidth={1.8} />}
        leftPanel={<></>}
        centerPanel={
          <AIEmptyState
            icon={Target}
            title="Select Universities to Compare"
            description="Go to Discover or your Saved Programs to select 2 to 5 universities to compare them using EDUING AI."
            actionButton={
              <Button onClick={() => router.push('/student/discover')} variant="primary">
                Explore Programs
              </Button>
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
        icon={<LayoutDashboard size={16} strokeWidth={1.8} />}
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
      icon={<LayoutDashboard size={16} strokeWidth={1.8} />}
      headerActions={
        <Button onClick={() => router.push('/student/discover')} variant="secondary" size="sm" className="hidden md:flex items-center gap-8">
          <Plus size={14} strokeWidth={1.8} /> Add University
        </Button>
      }
      leftPanel={
        <>
          <div className="p-16 border-b border-border">
            <Caption className="font-bold uppercase tracking-widest text-text-secondary">Selected Programs</Caption>
          </div>
          <div className="flex-1 overflow-y-auto p-16 flex flex-col gap-12">
            {comparisonData.universities.map(item => {
              // FIXED: location is an object in UniversityFirestore
              const locationStr = typeof item.university.location === 'object' && item.university.location !== null
                ? `${(item.university.location as any).city ?? ''}, ${(item.university.location as any).state ?? ''}`.replace(/^, |, $/g, '')
                : String(item.university.location ?? '')

              return (
                <Card key={item.university.id} className="!p-12 flex items-center justify-between group shadow-sm">
                  <div className="truncate pr-12">
                    <Small className="font-bold text-text-primary truncate">{item.university.name}</Small>
                    <Caption className="text-text-secondary truncate">{locationStr}</Caption>
                  </div>
                  <button
                    onClick={() => removeUniversity(item.university.id)}
                    className="w-[24px] h-[24px] shrink-0 bg-danger/10 text-danger hover:bg-danger hover:text-white rounded-full flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X size={12} strokeWidth={1.8} />
                  </button>
                </Card>
              )
            })}
          </div>
          <div className="p-16 border-t border-border">
            <Button onClick={() => router.push('/student/discover')} variant="primary" className="w-full flex justify-center items-center gap-8">
              <Plus size={14} strokeWidth={1.8} /> Compare Another
            </Button>
          </div>
        </>
      }
      centerPanel={
        <div className="flex overflow-x-auto gap-24 pb-32">
          {comparisonData.universities.map((item) => {
            const locationStr = typeof item.university.location === 'object' && item.university.location !== null
              ? `${(item.university.location as any).city ?? ''}, ${(item.university.location as any).state ?? ''}`.replace(/^, |, $/g, '')
              : String(item.university.location ?? '')

            return (
              <Card key={item.university.id} className="min-w-[320px] max-w-[400px] shrink-0 !p-0 flex flex-col relative group shadow-sm">
                <div className="p-24 border-b border-border relative overflow-hidden rounded-t-[24px]">
                  <div className="absolute inset-0 bg-gradient-to-b from-hover to-transparent pointer-events-none" />
                  <p className="text-[15px] font-bold text-text-primary mb-4 relative z-10">{item.university.name}</p>
                  <Small className="text-text-secondary font-medium flex items-center gap-8 mb-24 relative z-10">
                    {locationStr} • {item.university.type}
                  </Small>

                  <div className="flex gap-16 relative z-10">
                    <div className="flex flex-col items-center bg-background rounded-[10px] p-12 flex-1 border border-border shadow-sm">
                      <div className="relative w-[48px] h-[48px] mb-8">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="16" className="stroke-border" strokeWidth="3" fill="none" />
                          <circle cx="18" cy="18" r="16" className={getRingColor(item.recommendation.overallMatchScore)}
                            strokeWidth="3" fill="none" strokeLinecap="round"
                            strokeDasharray="100" strokeDashoffset={100 - item.recommendation.overallMatchScore} />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-text-primary">
                          {item.recommendation.overallMatchScore}
                        </div>
                      </div>
                      <Caption className="uppercase tracking-widest text-text-secondary font-bold text-center">Match</Caption>
                    </div>

                    <div className="flex flex-col items-center bg-background rounded-[10px] p-12 flex-1 border border-border shadow-sm">
                      <div className="relative w-[48px] h-[48px] mb-8">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="16" className="stroke-border" strokeWidth="3" fill="none" />
                          <circle cx="18" cy="18" r="16" className={getRingColor(item.probability.overallProbability)}
                            strokeWidth="3" fill="none" strokeLinecap="round"
                            strokeDasharray="100" strokeDashoffset={100 - item.probability.overallProbability} />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-text-primary">
                          {item.probability.overallProbability}%
                        </div>
                      </div>
                      <Caption className="uppercase tracking-widest text-text-secondary font-bold text-center">Prob</Caption>
                    </div>
                  </div>
                </div>

                <div className="p-24 flex flex-col gap-24 flex-1 bg-background rounded-b-[24px]">
                  <div>
                    <Caption className="uppercase tracking-widest text-text-secondary font-bold mb-12">Profile Alignment</Caption>
                    <div className="flex flex-col gap-8">
                      {item.recommendation.matchReasons.map((reason: string, i: number) => (
                        <div key={i} className="flex items-center gap-8 text-[11px] font-medium text-success">
                          <CheckCircle2 size={12} strokeWidth={1.8} className="shrink-0" /> {reason}
                        </div>
                      ))}
                      {item.recommendation.matchReasons.length === 0 && (
                        <Small className="text-text-secondary/70">Limited alignment points.</Small>
                      )}
                    </div>
                  </div>

                  <div>
                    <Caption className="uppercase tracking-widest text-text-secondary font-bold mb-12">Admission Status</Caption>
                    <div className="bg-hover p-12 rounded-[10px] border border-border">
                      <div className="flex justify-between items-center mb-4">
                        <Small className="text-text-secondary font-medium">Risk Level</Small>
                        <Caption className={`uppercase tracking-widest font-bold ${item.probability.probabilityLabel === 'Very Low' || item.probability.probabilityLabel === 'Low'
                          ? 'text-danger'
                          : item.probability.probabilityLabel === 'Moderate'
                            ? 'text-warning'
                            : 'text-success'
                          }`}>
                          {item.probability.probabilityLabel}
                        </Caption>
                      </div>
                      {item.recommendation.missingRequirements?.length > 0 && (
                        <div className="pt-8 mt-8 border-t border-border">
                          <Caption className="uppercase tracking-widest text-warning font-bold block mb-4">Needs Attention:</Caption>
                          <Small className="text-text-primary">{item.recommendation.missingRequirements.join(', ')}</Small>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Caption className="uppercase tracking-widest text-text-secondary font-bold mb-12">Financial Aid</Caption>
                    {item.bestScholarship ? (
                      <div className="bg-success/10 border border-success/20 p-12 rounded-[10px]">
                        <Small className="font-bold text-success mb-4 truncate">{item.bestScholarship.scholarship.name}</Small>
                        <Caption className="text-success/70 font-medium">Eligibility: {item.bestScholarship.eligibilityScore}% Match</Caption>
                      </div>
                    ) : (
                      <div className="bg-hover p-12 rounded-[10px] border border-border text-[11px] text-text-secondary font-medium">
                        No matching scholarships found.
                      </div>
                    )}
                  </div>

                  <div className="pt-8 mt-auto">
                    <Button
                      onClick={() => router.push(`/student/universities/${item.university.id}`)}
                      variant="primary"
                      className="w-full flex justify-center items-center !bg-background !border-border !text-text-primary hover:!bg-hover shadow-sm uppercase tracking-widest text-[10px]"
                    >
                      View Full Details
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      }
      rightPanel={
        <>
          <div className="p-16 border-b border-border flex items-center gap-8">
            <Sparkles size={14} strokeWidth={1.8} style={{ color: 'var(--accent)' }} />
            <Caption className="font-bold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>Copilot Verdict</Caption>
          </div>

          <div className="flex-1 overflow-y-auto p-20">
            {error && (
              <AIEmptyState icon={Target} title="Analysis Failed" description={error} />
            )}
            {loadingAI && !error && (
              <AILoadingState title="Analyzing options..." description="Evaluating recommendation scores and probability matrices." />
            )}
            {aiAnalysis && !loadingAI && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-24">
                <Small className="text-text-primary leading-relaxed font-medium bg-primary/10 border border-primary/20 p-16 rounded-[10px]">
                  {aiAnalysis.summary}
                </Small>
                <div className="flex flex-col gap-12">
                  <div className="bg-success/10 border border-success/20 rounded-[10px] p-16">
                    <Caption className="uppercase tracking-widest text-success font-bold mb-4">Best Overall Match</Caption>
                    <Body className="font-bold text-success">{aiAnalysis.bestOverallChoice}</Body>
                  </div>
                  <div className="bg-primary/10 border border-primary/20 rounded-[10px] p-16">
                    <Caption className="uppercase tracking-widest font-bold mb-4" style={{ color: 'var(--accent)' }}>Safest Option</Caption>
                    <Body className="font-bold" style={{ color: 'var(--accent)' }}>{aiAnalysis.safestOption}</Body>
                  </div>
                  <div className="bg-warning/10 border border-warning/20 rounded-[10px] p-16">
                    <Caption className="uppercase tracking-widest text-warning font-bold mb-4">Most Ambitious</Caption>
                    <Body className="font-bold text-warning">{aiAnalysis.mostAmbitiousChoice}</Body>
                  </div>
                </div>
                {aiAnalysis.actionableAdvice?.length > 0 && (
                  <div>
                    <Caption className="uppercase tracking-widest text-text-secondary font-bold mb-12">Actionable Advice</Caption>
                    <div className="flex flex-col gap-8">
                      {aiAnalysis.actionableAdvice.map((advice: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-8 bg-hover p-12 rounded-[10px] border border-border">
                          <ArrowRight style={{ color: 'var(--accent)' }} className="shrink-0 mt-4" size={12} strokeWidth={1.8} />
                          <Small className="font-medium text-text-primary leading-relaxed">{advice}</Small>
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
      <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--bg)' }} />}>
        <CompareContent />
      </Suspense>
    </ProtectedRoute>
  );
}