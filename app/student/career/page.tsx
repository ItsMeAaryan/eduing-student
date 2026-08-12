'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudentData } from '@/components/providers/StudentDataProvider';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAIGeneration } from '@/hooks/useAIGeneration';
import { CareerAdvisorService } from '@/lib/ai/gemini/services';
import { calculateProfileStrength } from '@/lib/utils/profileStrength';
import { recommendUniversities } from '@/lib/utils/recommendationEngine';
import { calculateScholarshipEligibility } from '@/lib/utils/scholarshipEngine';

import {
  Sparkles, Briefcase, ChevronRight, Compass, Zap,
  TrendingUp, RefreshCcw, IndianRupee, GraduationCap,
  CheckCircle2, Clock, Circle, ArrowRight
} from 'lucide-react';
import AIMarkdown from '@/components/ai/AIMarkdown';

// ─── Types ───────────────────────────────────────────────────────────────────
interface CareerFormState {
  careerInterest: string;
  degreeLevel: string;
  strengths: string[];
  targetGoal: string;
  timeline: string;
}

const STRENGTHS_OPTIONS = [
  'Technology', 'Science', 'Arts', 'Commerce',
  'Management', 'Healthcare', 'Law', 'Design', 'Other',
];

const DEGREE_LEVELS = ['UG', 'PG', 'Diploma', 'Certificate'];
const TIMELINES = ['6 months', '1 year', '2 years', '3+ years'];
const GOALS = [
  { value: 'top_college', label: 'Get into Top College' },
  { value: 'build_skill', label: 'Build a Skill' },
  { value: 'switch_career', label: 'Switch Career' },
  { value: 'explore', label: 'Explore Options' },
];

const MILESTONE_COLORS = ['#F59E0B', '#10B981', '#6366F1', '#EC4899'];

// ─── Roadmap Timeline ────────────────────────────────────────────────────────
function RoadmapTimeline({ steps }: { steps: any[] }) {
  const statuses = ['done', 'in-progress', 'upcoming', 'upcoming'];
  const timeLabels = ['Month 1–3', 'Month 4–6', 'Month 7–12', 'Year 2+'];
  return (
    <div className="flex flex-col">
      {steps.map((step: any, idx: number) => {
        const status = statuses[Math.min(idx, statuses.length - 1)];
        const isLast = idx === steps.length - 1;
        const color = MILESTONE_COLORS[idx % MILESTONE_COLORS.length];
        const timeLabel = timeLabels[Math.min(idx, timeLabels.length - 1)];
        return (
          <motion.div
            key={idx}
            className="flex gap-4"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 + 0.1 }}
          >
            <div className="flex flex-col items-center">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10 border-2"
                style={{
                  borderColor: color,
                  background: status === 'done' ? color : status === 'in-progress' ? `${color}22` : 'var(--bg-card)',
                }}
              >
                {status === 'done' ? (
                  <CheckCircle2 size={16} color="#fff" />
                ) : status === 'in-progress' ? (
                  <Clock size={14} style={{ color }} />
                ) : (
                  <Circle size={14} style={{ color }} />
                )}
              </div>
              {!isLast && (
                <div className="w-0.5 flex-1 mt-1" style={{ background: `linear-gradient(to bottom, ${color}60, transparent)`, minHeight: 32 }} />
              )}
            </div>
            <div className="flex-1 pb-8">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border"
                  style={{ background: `${color}18`, borderColor: `${color}40`, color }}>
                  {timeLabel}
                </span>
                <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  status === 'done' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    : status === 'in-progress' ? 'bg-amber-50 text-amber-600 border border-amber-200'
                    : 'bg-gray-50 text-gray-400 border border-gray-200'}`}>
                  {status === 'done' ? '✓ Done' : status === 'in-progress' ? '▶ In Progress' : '○ Upcoming'}
                </span>
              </div>
              <h4 className="text-[13px] font-semibold text-foreground mb-1">{step.step}</h4>
              <p className="text-[12px] text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Career Path Card ─────────────────────────────────────────────────────────
function CareerPathCard({ career, idx, profilePct }: { career: any; idx: number; profilePct: number }) {
  const router = useRouter();
  const matchPct = Math.min(99, Math.max(60, profilePct + (idx === 0 ? 18 : idx === 1 ? 9 : 2)));
  const salaries = ['₹6–14 LPA', '₹12–22 LPA', '₹18–35 LPA'];
  const salary = salaries[idx % salaries.length];

  const handleExplore = () => {
    const careerName = career.title || 'Software Engineer';
    router.push(`/student/universities?career=${encodeURIComponent(careerName)}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.1 }}
      className="bg-card border border-border rounded-[16px] p-6 shadow-sm flex flex-col hover:border-[#FDE68A] hover:shadow-md transition-all group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 bg-[#FFFBEB] border border-[#FDE68A] rounded-[12px] flex items-center justify-center">
          <Briefcase size={18} className="text-[#F59E0B]" strokeWidth={1.5} />
        </div>
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-700">{matchPct}% match</span>
        </div>
      </div>
      <h3 className="text-[15px] font-semibold text-foreground mb-4 leading-snug">{career.title}</h3>
      <ul className="flex flex-col gap-2.5 mb-5 flex-1">
        <li className="flex items-start gap-2">
          <GraduationCap size={13} className="text-[#F59E0B] shrink-0 mt-0.5" />
          <span className="text-[12px] text-muted-foreground">
            <span className="font-medium text-foreground">Qualification: </span>
            {career.suggestedDegree || "Bachelor's / Master's Degree"}
          </span>
        </li>
        <li className="flex items-start gap-2">
          <Zap size={13} className="text-[#6366F1] shrink-0 mt-0.5" />
          <span className="text-[12px] text-muted-foreground">
            <span className="font-medium text-foreground">Key Skill: </span>
            {career.requiredSkills?.[0] || 'Domain expertise'}
          </span>
        </li>
        <li className="flex items-start gap-2">
          <IndianRupee size={13} className="text-emerald-600 shrink-0 mt-0.5" />
          <span className="text-[12px] text-muted-foreground">
            <span className="font-medium text-foreground">Avg Salary: </span>
            {salary} (India)
          </span>
        </li>
      </ul>
      <button
        onClick={handleExplore}
        className="flex items-center justify-center gap-1.5 w-full h-9 rounded-[8px] border border-[#FDE68A] bg-[#FFFBEB] text-[#D97706] text-[12px] font-semibold hover:bg-[#F59E0B] hover:text-white hover:border-[#F59E0B] transition-all"
      >
        Explore This Path <ArrowRight size={13} />
      </button>
    </motion.div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-5">
      <div className="bg-card border border-border rounded-[16px] p-6 shadow-sm flex items-center gap-4">
        <div className="w-14 h-14 relative shrink-0">
          <div className="absolute inset-0 border-2 border-[#F59E0B]/20 rounded-full animate-[spin_2.5s_linear_infinite]" />
          <div className="absolute inset-2 border-2 border-[#F59E0B]/40 border-t-[#F59E0B] rounded-full animate-spin" />
          <Compass size={20} className="absolute inset-0 m-auto text-[#F59E0B] animate-pulse" />
        </div>
        <div className="flex-1">
          <div className="h-4 bg-muted rounded-full w-48 mb-2 animate-pulse" />
          <div className="h-3 bg-muted rounded-full w-72 animate-pulse" />
          <p className="text-[11px] text-muted-foreground mt-2">Mapping your profile to career paths…</p>
        </div>
      </div>
      <div className="bg-card border border-border rounded-[16px] p-6 shadow-sm">
        <div className="h-4 bg-muted rounded-full w-36 mb-5 animate-pulse" />
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="flex gap-4 mb-7">
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-muted animate-pulse" />
              {i < 3 && <div className="w-0.5 bg-muted mt-1 animate-pulse" style={{ height: 40 }} />}
            </div>
            <div className="flex-1 pt-1">
              <div className="h-3 bg-muted rounded-full w-20 mb-2 animate-pulse" />
              <div className="h-3.5 bg-muted rounded-full w-48 mb-2 animate-pulse" />
              <div className="h-2.5 bg-muted rounded-full w-full mb-1 animate-pulse" />
              <div className="h-2.5 bg-muted rounded-full w-4/5 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[0, 1, 2].map(i => (
          <div key={i} className="bg-card border border-border rounded-[16px] p-5 shadow-sm animate-pulse">
            <div className="w-11 h-11 bg-muted rounded-[12px] mb-4" />
            <div className="h-4 bg-muted rounded-full w-3/4 mb-3" />
            <div className="h-3 bg-muted rounded-full w-full mb-2" />
            <div className="h-3 bg-muted rounded-full w-4/5 mb-2" />
            <div className="h-3 bg-muted rounded-full w-2/3 mb-5" />
            <div className="h-9 bg-muted rounded-[8px] w-full" />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Phase 1: Input Form ──────────────────────────────────────────────────────
function InputForm({ form, setForm, onSubmit }: {
  form: CareerFormState;
  setForm: React.Dispatch<React.SetStateAction<CareerFormState>>;
  onSubmit: () => void;
}) {
  const toggleStrength = (s: string) => {
    setForm(prev => ({
      ...prev,
      strengths: prev.strengths.includes(s)
        ? prev.strengths.filter(x => x !== s)
        : [...prev.strengths, s],
    }));
  };
  const isValid = form.careerInterest.trim().length > 2 && form.degreeLevel && form.targetGoal && form.timeline;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="bg-card border border-border rounded-[16px] shadow-sm overflow-hidden"
    >
      <div className="px-6 pt-6 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FFFBEB] border border-[#FDE68A] rounded-[12px] flex items-center justify-center shrink-0">
            <Compass size={18} className="text-[#F59E0B]" strokeWidth={1.8} />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-foreground leading-tight">Discover Your Path</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">Answer 5 quick questions to get a personalized career roadmap</p>
          </div>
        </div>
      </div>

      <div className="p-6 flex flex-col gap-6">
        {/* 1. Career Interest */}
        <div>
          <label htmlFor="career-interest-input" className="block text-[12px] font-semibold text-foreground mb-1.5">
            Career Interest <span className="text-[#F59E0B]">*</span>
          </label>
          <input
            id="career-interest-input"
            type="text"
            value={form.careerInterest}
            onChange={e => setForm(p => ({ ...p, careerInterest: e.target.value }))}
            placeholder="e.g. Software Engineering, Medicine, Law, Finance…"
            className="w-full h-10 px-3 rounded-[8px] border border-border bg-muted text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B] transition-all"
          />
        </div>

        {/* 2. Degree Level */}
        <div>
          <label htmlFor="degree-level-select" className="block text-[12px] font-semibold text-foreground mb-1.5">
            Preferred Degree Level <span className="text-[#F59E0B]">*</span>
          </label>
          <select
            id="degree-level-select"
            value={form.degreeLevel}
            onChange={e => setForm(p => ({ ...p, degreeLevel: e.target.value }))}
            className="w-full h-10 px-3 rounded-[8px] border border-border bg-muted text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B] transition-all cursor-pointer"
          >
            <option value="">Select degree level…</option>
            {DEGREE_LEVELS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* 3. Strengths */}
        <div>
          <div className="block text-[12px] font-semibold text-foreground mb-1.5">
            Your Strengths <span className="text-[11px] font-normal text-muted-foreground">(select all that apply)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {STRENGTHS_OPTIONS.map(s => {
              const selected = form.strengths.includes(s);
              return (
                <button
                  key={s}
                  id={`strength-chip-${s.toLowerCase()}`}
                  type="button"
                  onClick={() => toggleStrength(s)}
                  className="text-[12px] font-medium px-3 py-1.5 rounded-full border transition-all"
                  style={{
                    background: selected ? '#FFFBEB' : 'var(--bg-muted)',
                    borderColor: selected ? '#F59E0B' : 'var(--border)',
                    color: selected ? '#D97706' : 'var(--text-muted)',
                  }}
                >
                  {selected && '✓ '}{s}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Target Goal */}
        <div>
          <div className="block text-[12px] font-semibold text-foreground mb-2">
            Target Goal <span className="text-[#F59E0B]">*</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {GOALS.map(g => {
              const selected = form.targetGoal === g.value;
              return (
                <label
                  key={g.value}
                  id={`goal-option-${g.value}`}
                  className="flex items-center gap-2 p-3 rounded-[10px] border cursor-pointer transition-all"
                  style={{
                    background: selected ? '#FFFBEB' : 'var(--bg-muted)',
                    borderColor: selected ? '#F59E0B' : 'var(--border)',
                  }}
                >
                  <input
                    type="radio"
                    name="targetGoal"
                    value={g.value}
                    checked={selected}
                    onChange={() => setForm(p => ({ ...p, targetGoal: g.value }))}
                    className="accent-[#F59E0B] shrink-0"
                  />
                  <span className="text-[12px] font-medium leading-tight" style={{ color: selected ? '#D97706' : 'var(--text-muted)' }}>
                    {g.label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* 5. Timeline */}
        <div>
          <label htmlFor="timeline-select" className="block text-[12px] font-semibold text-foreground mb-1.5">
            Timeline <span className="text-[#F59E0B]">*</span>
          </label>
          <select
            id="timeline-select"
            value={form.timeline}
            onChange={e => setForm(p => ({ ...p, timeline: e.target.value }))}
            className="w-full h-10 px-3 rounded-[8px] border border-border bg-muted text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B] transition-all cursor-pointer"
          >
            <option value="">Select timeline…</option>
            {TIMELINES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* CTA */}
        <button
          id="generate-roadmap-btn"
          type="button"
          onClick={onSubmit}
          disabled={!isValid}
          className="flex items-center justify-center gap-2 w-full h-11 rounded-[10px] bg-[#F59E0B] hover:bg-[#D97706] text-white text-[14px] font-semibold transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed mt-1"
        >
          <Sparkles size={15} />
          Generate My Career Roadmap
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main Content ─────────────────────────────────────────────────────────────
function CareerAdvisorContent() {
  const { profile, documents, uniqueApps, savedPrograms, universities: allUniversities, scholarships } = useStudentData();
  const { data: careerData, isGenerating: loading, generate, error } = useAIGeneration<any>();

  const profileEngine = useMemo(() => calculateProfileStrength(profile, documents || []), [profile, documents]);

  const [form, setForm] = useState<CareerFormState>({
    careerInterest: '',
    degreeLevel: '',
    strengths: [],
    targetGoal: '',
    timeline: '',
  });

  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleGenerate = async () => {
    setHasSubmitted(true);
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
      topRecommendations: recommendations.slice(0, 3).map((r: any) => r.university.name),
      topScholarships: scholarshipResults.slice(0, 2).map((s: any) => s.scholarship.name),
      careerInterest: form.careerInterest,
      degreeLevel: form.degreeLevel,
      strengths: form.strengths,
      targetGoal: GOALS.find(g => g.value === form.targetGoal)?.label || form.targetGoal,
      timeline: form.timeline,
    }));
  };

  const handleRegenerate = () => {
    setHasSubmitted(false);
    setForm({ careerInterest: '', degreeLevel: '', strengths: [], targetGoal: '', timeline: '' });
    // clear the previous data by reloading component state
    window.location.reload();
  };

  const showForm = !hasSubmitted && !loading;
  const showOutput = !!careerData && !loading;

  return (
    <div className="flex flex-col gap-5">

      {/* ── PAGE HEADER ────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FFFBEB] border border-[#FDE68A] rounded-[12px] flex items-center justify-center text-[#D97706] shrink-0">
            <Compass size={17} strokeWidth={1.8} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-[18px] font-semibold text-foreground tracking-tight leading-none">Career Roadmap</h1>
              {showOutput && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-600">
                  Profile {profileEngine.percentage}% complete
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse" />
              <span className="text-[11px] text-muted-foreground font-medium">Powered by EDUING AI</span>
            </div>
          </div>
        </div>

        {showOutput && (
          <button
            id="regenerate-roadmap-btn"
            onClick={handleRegenerate}
            className="flex items-center gap-1.5 px-4 h-[34px] rounded-[8px] border border-border bg-card hover:border-[#FDE68A] hover:bg-[#FFFBEB] text-[12px] font-semibold text-muted-foreground hover:text-[#D97706] transition-all shadow-sm"
          >
            <RefreshCcw size={13} />
            Regenerate
          </button>
        )}
      </div>

      {/* ── CONTENT ────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">

        {/* Phase 1: Form */}
        {showForm && (
          <InputForm key="form" form={form} setForm={setForm} onSubmit={handleGenerate} />
        )}

        {/* Loading Skeleton */}
        {loading && <LoadingSkeleton key="skeleton" />}

        {/* Error */}
        {error && !loading && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-card border border-red-200 rounded-[16px] p-12 shadow-sm flex flex-col items-center text-center"
          >
            <Zap size={32} className="text-red-400 mb-3 opacity-60" />
            <h3 className="text-[15px] font-semibold text-red-500 mb-2">Something went wrong</h3>
            <p className="text-[12px] text-muted-foreground mb-4">{error}</p>
            <button
              onClick={handleRegenerate}
              className="flex items-center gap-1.5 px-4 h-9 rounded-[8px] border border-border text-[12px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <RefreshCcw size={13} /> Try Again
            </button>
          </motion.div>
        )}

        {/* Phase 2: Output */}
        {showOutput && (
          <motion.div
            key="output"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-5"
          >
            {/* AI Summary */}
            <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-[16px] p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white border border-[#FDE68A] rounded-[10px] flex items-center justify-center shrink-0">
                  <Sparkles size={14} className="text-[#F59E0B]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#D97706] mb-1">AI Analysis</p>
                  <AIMarkdown content={careerData.summary} className="text-[13px] font-medium" />
                </div>
              </div>
            </div>

            {/* A. Roadmap Timeline */}
            <div className="bg-card border border-border rounded-[16px] p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Compass size={16} className="text-foreground" />
                <h2 className="text-[14px] font-semibold text-foreground">Career Roadmap Timeline</h2>
              </div>
              <p className="text-[12px] text-muted-foreground mb-6">Your personalized journey, milestone by milestone</p>
              {careerData.roadmap && careerData.roadmap.length > 0
                ? <RoadmapTimeline steps={careerData.roadmap} />
                : <p className="text-[12px] text-muted-foreground">No roadmap steps available.</p>}
            </div>

            {/* B. Recommended Career Paths */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={16} className="text-foreground" />
                <h2 className="text-[15px] font-semibold text-foreground">Recommended Career Paths</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(careerData.recommendedCareers && careerData.recommendedCareers.length > 0
                  ? careerData.recommendedCareers.slice(0, 3)
                  : [
                      { title: 'Software Engineer at Product Company', suggestedDegree: 'B.Tech / B.E. Computer Science', requiredSkills: ['Data Structures', 'System Design', 'Python'] },
                      { title: 'Business Analyst at Consulting Firm', suggestedDegree: 'BBA / MBA Finance', requiredSkills: ['Excel & SQL', 'Stakeholder Management', 'Presentation'] },
                      { title: 'UI/UX Designer at Startup', suggestedDegree: 'B.Des / Certificate in UX', requiredSkills: ['Figma', 'User Research', 'Prototyping'] },
                    ]
                ).map((career: any, idx: number) => (
                  <CareerPathCard key={idx} career={career} idx={idx} profilePct={profileEngine.percentage} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
