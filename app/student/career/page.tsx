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

import {
  Sparkles, Briefcase, BookOpen, ChevronRight,
  Compass, Zap, TrendingUp, RefreshCcw
} from 'lucide-react';

// ─── Skill Gap Bar ─────────────────────────────────────────────────────────────
function SkillGapBar({ skill, current, required }: { skill: string; current: number; required: number }) {
  const color = current >= required ? '#10B981' : current >= required * 0.6 ? '#F59E0B' : '#EF4444';
  return (
    <div className="flex items-center gap-3">
      <span className="text-[12px] text-muted-foreground w-32 shrink-0 truncate">{skill}</span>
      <div className="flex-1 relative h-2 rounded-full bg-secondary overflow-hidden">
        <motion.div className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, current)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
        />
      </div>
      <span className="text-[11px] font-semibold w-8 text-right shrink-0" style={{ color }}>{current}%</span>
    </div>
  );
}

// ─── Roadmap Step ──────────────────────────────────────────────────────────────
function RoadmapStep({ step, index, total }: { step: any; index: number; total: number }) {
  const phases = ['Now', '6 months', '1 year', '3 years+'];
  const phase = phases[Math.min(index, phases.length - 1)];
  const isLast = index === total - 1;
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <motion.div className="w-9 h-9 rounded-full bg-[#FFFBEB] border-2 border-[#FDE68A] flex items-center justify-center shrink-0 z-10"
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: index * 0.1 }}>
          <span className="text-[11px] font-bold text-[#D97706]">{index + 1}</span>
        </motion.div>
        {!isLast && <div className="w-0.5 flex-1 bg-gradient-to-b from-[#FDE68A] to-transparent mt-1.5" />}
      </div>
      <motion.div className="flex-1 pb-7"
        initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 + 0.1 }}>
        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#FFFBEB] border border-[#FDE68A] text-[#D97706] uppercase tracking-wider mb-2 inline-block">{phase}</span>
        <h4 className="text-[13px] font-semibold text-foreground mb-1">{step.step}</h4>
        <p className="text-[12px] text-muted-foreground leading-relaxed">{step.description}</p>
      </motion.div>
    </div>
  );
}

// ─── Learning Card ─────────────────────────────────────────────────────────────
function LearningCard({ title, platform, level, duration }: { title: string; platform: string; level: string; duration: string }) {
  const colors: Record<string, { text: string; bg: string; border: string }> = {
    'Coursera': { text: '#0056D2', bg: '#EFF6FF', border: '#BFDBFE' },
    'Udemy': { text: '#EC5252', bg: '#FFF1F2', border: '#FECDD3' },
    'edX': { text: '#374151', bg: '#F9FAFB', border: '#E5E7EB' },
    'LinkedIn': { text: '#0077B5', bg: '#EFF6FF', border: '#BFDBFE' },
  };
  const c = colors[platform] || { text: '#6B7280', bg: '#F9FAFB', border: '#E5E7EB' };
  return (
    <div className="flex items-start gap-3 p-3 rounded-[10px] bg-muted border border-border hover:border-[#D1D5DB] transition-all group cursor-pointer">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border" style={{ background: c.bg, borderColor: c.border }}>
        <BookOpen size={12} style={{ color: c.text }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold text-foreground leading-snug mb-1 group-hover:text-foreground">{title}</p>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] text-muted-foreground">{platform}</span>
          <span className="text-[10px] text-[#D1D5DB]">·</span>
          <span className="text-[10px] text-muted-foreground">{level}</span>
          <span className="text-[10px] text-[#D1D5DB]">·</span>
          <span className="text-[10px] text-muted-foreground">{duration}</span>
        </div>
      </div>
      <ChevronRight size={12} className="text-[#D1D5DB] group-hover:text-muted-foreground transition-colors shrink-0 mt-0.5" />
    </div>
  );
}

function CareerAdvisorContent() {
  const { profile, documents, uniqueApps, savedPrograms, universities: allUniversities, scholarships } = useStudentData();
  const { data: careerData, isGenerating: loading, generate, error } = useAIGeneration<any>();

  const profileEngine = useMemo(() => calculateProfileStrength(profile, documents || []), [profile, documents]);

  const handleGenerate = async () => {
    const recommendations = recommendUniversities(allUniversities, {
      profile, documents: documents || [], applications: uniqueApps || [],
      savedPrograms: savedPrograms || [], profileScore: profileEngine.percentage
    });
    const scholarshipResults = calculateScholarshipEligibility({
      profile, documents: documents || [], profileScore: profileEngine.percentage
    }, scholarships);
    await generate(() => CareerAdvisorService.getCareerPaths({
      studentProfile: profile,
      profileStrength: profileEngine.percentage,
      topRecommendations: recommendations.slice(0, 3).map(r => r.university.name),
      topScholarships: scholarshipResults.slice(0, 2).map(s => s.scholarship.name)
    }));
  };

  const skillGaps = [
    { skill: 'Communication', current: Math.min(90, profileEngine.percentage + 10), required: 85 },
    { skill: 'Research', current: Math.min(80, profileEngine.percentage), required: 75 },
    { skill: 'Technical Skills', current: Math.min(70, profileEngine.percentage - 5), required: 80 },
    { skill: 'Leadership', current: Math.min(65, profileEngine.percentage - 15), required: 70 },
  ];

  const mockLearning = [
    { title: 'Academic Writing Mastery', platform: 'Coursera', level: 'Intermediate', duration: '4 weeks' },
    { title: 'Research Methodology', platform: 'edX', level: 'Beginner', duration: '6 weeks' },
    { title: 'Professional Communication', platform: 'LinkedIn', level: 'All levels', duration: '2 weeks' },
  ];

  return (
    <div className="flex flex-col gap-5">

      {/* ── PAGE HEADER ────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FFFBEB] border border-[#FDE68A] rounded-[12px] flex items-center justify-center text-[#D97706] shrink-0">
            <Compass size={17} strokeWidth={1.8} />
          </div>
          <div>
            <h1 className="text-[18px] font-semibold text-foreground tracking-tight leading-none">Career Roadmap</h1>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse" />
              <span className="text-[11px] text-muted-foreground font-medium">Powered by EDUING AI</span>
            </div>
          </div>
        </div>
        <button onClick={handleGenerate} disabled={loading}
          className="flex items-center gap-1.5 px-4 h-[34px] rounded-[8px] bg-[#F59E0B] hover:bg-[#D97706] text-white text-[12px] font-semibold transition-colors disabled:opacity-60 shadow-sm">
          {loading ? <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" /> : <Sparkles size={12} />}
          {loading ? 'Analyzing…' : careerData ? 'Regenerate' : 'Generate Roadmap'}
        </button>
      </div>

      {/* ── PAGE CONTENT ─────────────────────────────────────── */}

      {/* Pre-generation state */}
      {!careerData && !loading && !error && (
        <div className="flex flex-col gap-4">
          {/* Hero card */}
          <div className="bg-card border border-border rounded-[16px] p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#FEF3C7] to-transparent opacity-60 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="relative z-10 max-w-xl">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 bg-[#FFFBEB] border border-[#FDE68A] rounded-[14px] flex items-center justify-center">
                  <Compass size={22} className="text-[#F59E0B]" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-[18px] font-semibold text-foreground">Discover Your Path</h2>
                  <p className="text-[12px] text-muted-foreground">Personalized for {profile?.fullName || 'you'}</p>
                </div>
              </div>

              {/* Profile bar */}
              <div className="bg-muted border border-border rounded-[12px] p-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-[12px] text-muted-foreground font-medium">Profile Strength</span>
                  <span className="text-[12px] font-bold text-[#F59E0B]">{profileEngine.percentage}%</span>
                </div>
                <div className="h-2 rounded-full bg-secondary/80 overflow-hidden">
                  <motion.div className="h-full rounded-full bg-gradient-to-r from-[#F59E0B] to-[#FBBF24]"
                    initial={{ width: 0 }} animate={{ width: `${profileEngine.percentage}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-2">Your roadmap is calibrated to your {profileEngine.percentage}% profile.</p>
              </div>

              <button onClick={handleGenerate}
                className="flex items-center gap-2 px-6 h-10 rounded-[10px] bg-[#F59E0B] hover:bg-[#D97706] text-white text-[13px] font-semibold transition-colors shadow-sm">
                <Sparkles size={14} /> Map My Future
              </button>
            </div>
          </div>

          {/* Locked teaser cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {['Product Manager', 'Data Scientist', 'UX Researcher'].map((title, i) => (
              <div key={title} className="bg-card border border-border rounded-[16px] p-5 shadow-sm relative overflow-hidden select-none">
                <div className="w-10 h-10 bg-[#FFFBEB] border border-[#FDE68A] rounded-[12px] flex items-center justify-center mb-3">
                  <Briefcase size={16} className="text-[#F59E0B] opacity-40" />
                </div>
                <div className="h-3 rounded bg-secondary w-3/4 mb-2" />
                <div className="h-2 rounded bg-muted w-1/2 mb-1" />
                <div className="h-2 rounded bg-muted w-2/3" />
                {/* Blur overlay */}
                <div className="absolute inset-0 bg-card/70 backdrop-blur-[3px] flex items-center justify-center rounded-[16px]">
                  <div className="w-8 h-8 bg-[#FFFBEB] border border-[#FDE68A] rounded-full flex items-center justify-center">
                    <Zap size={14} className="text-[#F59E0B]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-card border border-border rounded-[16px] p-12 shadow-sm flex flex-col items-center text-center">
          <Zap size={32} className="text-red-400 mb-3 opacity-60" />
          <h3 className="text-[15px] font-semibold text-red-500 mb-2">Generation Failed</h3>
          <p className="text-[12px] text-muted-foreground">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-card border border-border rounded-[16px] p-16 shadow-sm flex flex-col items-center text-center">
          <div className="w-16 h-16 relative mb-5">
            <div className="absolute inset-0 border-2 border-[#F59E0B]/20 rounded-full animate-[spin_2.5s_linear_infinite]" />
            <div className="absolute inset-2 border-2 border-[#F59E0B]/40 border-t-[#F59E0B] rounded-full animate-spin" />
            <Compass size={22} className="absolute inset-0 m-auto text-[#F59E0B] animate-pulse" />
          </div>
          <h3 className="text-[16px] font-semibold text-foreground mb-2">Analyzing Career Trajectories</h3>
          <p className="text-[13px] text-muted-foreground">Mapping your profile to global career paths…</p>
        </div>
      )}

      {/* Generated content */}
      {careerData && !loading && (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5">

            {/* AI Analysis banner */}
            <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-[16px] p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-card border border-[#FDE68A] rounded-[10px] flex items-center justify-center shrink-0">
                  <Sparkles size={14} className="text-[#F59E0B]" />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#D97706] mb-1">AI Analysis</p>
                  <p className="text-[14px] text-foreground leading-relaxed font-medium">&ldquo;{careerData.summary}&rdquo;</p>
                </div>
                <button onClick={handleGenerate} className="shrink-0 text-muted-foreground hover:text-[#F59E0B] transition-colors">
                  <RefreshCcw size={14} />
                </button>
              </div>
            </div>

            {/* Two-column row: Skill Gaps + Salary Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Skill Gap */}
              <div className="bg-card border border-border rounded-[16px] p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp size={16} className="text-foreground" />
                  <h3 className="text-[14px] font-semibold text-foreground">Skill Gap Analysis</h3>
                </div>
                <p className="text-[12px] text-muted-foreground mb-5">Current level vs. required for your target career</p>
                <div className="flex flex-col gap-3">
                  {skillGaps.map(sg => <SkillGapBar key={sg.skill} {...sg} />)}
                </div>
              </div>

              {/* Salary Insights */}
              <div className="bg-card border border-border rounded-[16px] p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Briefcase size={16} className="text-foreground" />
                  <h3 className="text-[14px] font-semibold text-foreground">Salary Insights</h3>
                </div>
                <p className="text-[12px] text-muted-foreground mb-5">Expected compensation by seniority</p>

                <div className="flex flex-col gap-3">
                  {[
                    { label: 'Entry Level', amount: '₹8–12 LPA', width: '35%', color: '#10B981' },
                    { label: 'Mid Level', amount: '₹18–25 LPA', width: '65%', color: '#F59E0B' },
                    { label: 'Senior Level', amount: '₹30–50 LPA', width: '100%', color: '#4F6BFF' },
                  ].map(tier => (
                    <div key={tier.label} className="flex items-center gap-3">
                      <span className="text-[11px] text-muted-foreground w-24 shrink-0">{tier.label}</span>
                      <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                        <motion.div className="h-full rounded-full" style={{ background: tier.color }}
                          initial={{ width: 0 }} animate={{ width: tier.width }}
                          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-foreground w-24 text-right shrink-0">{tier.amount}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 pt-4 border-t border-border flex items-center gap-2">
                  <TrendingUp size={12} className="text-[#10B981]" />
                  <p className="text-[11px] text-muted-foreground">Industry demand growing <span className="text-[#10B981] font-semibold">+24%</span> YoY</p>
                </div>
              </div>
            </div>

            {/* Learning Recommendations */}
            <div className="bg-card border border-border rounded-[16px] p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen size={16} className="text-foreground" />
                <h3 className="text-[14px] font-semibold text-foreground">Learning Recommendations</h3>
              </div>
              <p className="text-[12px] text-muted-foreground mb-4">Bridge your skill gaps with these courses</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {mockLearning.map(l => <LearningCard key={l.title} {...l} />)}
              </div>
            </div>

            {/* Roadmap */}
            <div className="bg-card border border-border rounded-[16px] p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Compass size={16} className="text-foreground" />
                <h3 className="text-[14px] font-semibold text-foreground">Strategic Roadmap</h3>
              </div>
              <p className="text-[12px] text-muted-foreground mb-6">Your personalized journey, phase by phase</p>
              <div className="flex flex-col">
                {careerData.roadmap.map((step: any, idx: number) => (
                  <RoadmapStep key={idx} step={step} index={idx} total={careerData.roadmap.length} />
                ))}
              </div>
            </div>

            {/* Career Cards */}
            <div>
              <h3 className="text-[15px] font-semibold text-foreground mb-4">Top Career Fits</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {careerData.recommendedCareers.map((career: any, idx: number) => (
                  <motion.div key={idx}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className="bg-card border border-border rounded-[16px] p-6 shadow-sm flex flex-col hover:border-[#FDE68A] hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-11 h-11 bg-[#FFFBEB] border border-[#FDE68A] rounded-[12px] flex items-center justify-center">
                        <Briefcase size={18} className="text-[#F59E0B]" strokeWidth={1.5} />
                      </div>
                      <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-muted border border-border text-muted-foreground uppercase tracking-wide">
                        {career.suggestedDegree}
                      </span>
                    </div>

                    <h3 className="text-[15px] font-semibold text-foreground mb-2">{career.title}</h3>
                    <p className="text-[12px] text-muted-foreground leading-relaxed mb-4 flex-1">{career.reasoning}</p>

                    {/* Skills */}
                    <div className="mb-4">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Required Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {career.requiredSkills.map((skill: string, i: number) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-muted border border-[#E5E7EB] text-foreground font-medium">{skill}</span>
                        ))}
                      </div>
                    </div>

                    {/* Future scope */}
                    <div className="flex items-start gap-2 p-3 rounded-[10px] bg-[#FFFBEB] border border-[#FDE68A]">
                      <Zap size={12} className="text-[#F59E0B] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[9px] font-bold text-[#D97706] uppercase tracking-wider mb-0.5">Future Scope</p>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{career.futureScope}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

export default function CareerAdvisorPage() {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      <Suspense fallback={<div className="flex items-center justify-center h-40"><div className="w-8 h-8 border-2 border-[#F59E0B]/20 border-t-[#F59E0B] rounded-full animate-spin" /></div>}>
        <CareerAdvisorContent />
      </Suspense>
    </ProtectedRoute>
  );
}
