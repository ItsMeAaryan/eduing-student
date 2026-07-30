'use client';

import React, { useState, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudentData } from '@/components/providers/StudentDataProvider';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAIGeneration } from '@/hooks/useAIGeneration';
import { useToast } from '@/hooks/useToast';
import { SOPService } from '@/lib/ai/gemini/services';
import { calculateProfileStrength } from '@/lib/utils/profileStrength';
import { recommendUniversities } from '@/lib/utils/recommendationEngine';
import {
  Sparkles, FileText, CheckCircle2, AlertCircle, Wand2,
  Download, Copy, Save, MessageSquareText, BookOpen,
  Clock, Hash, ChevronRight, TrendingUp, Zap
} from 'lucide-react';

const WRITING_MODES = [
  { id: 'Formal Tone', label: 'Formal Tone', desc: 'Academic, structured' },
  { id: 'Academic Focus', label: 'Academic Focus', desc: 'Research & theory' },
  { id: 'Research Focus', label: 'Research Focus', desc: 'Analytical depth' },
  { id: 'Leadership Focus', label: 'Leadership Focus', desc: 'Impact-driven' },
];

// ─── Quality Ring (light version) ─────────────────────────────────────────────
function QualityRing({ score, label, color }: { score: number; label: string; color: string }) {
  const r = 16, c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-10 h-10">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r={r} fill="none" stroke="#E5E7EB" strokeWidth="4" />
          <motion.circle cx="20" cy="20" r={r} fill="none" stroke={color} strokeWidth="4"
            strokeLinecap="round" strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: c - (score / 100) * c }}
            transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[11px] font-bold text-foreground">{score}</span>
        </div>
      </div>
      <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground text-center">{label}</span>
    </div>
  );
}

function SOPBuilderContent() {
  const { profile, documents, uniqueApps, savedPrograms, universities } = useStudentData();
  const textAreaRefs = useRef<(HTMLTextAreaElement | null)[]>([]);
  const [activeRightTab, setActiveRightTab] = useState<'assist' | 'review'>('assist');
  const [generationMode, setGenerationMode] = useState('Formal Tone');

  const { data: sopData, setData: setSopData, isGenerating, generate: generateSOP, error: generationError } = useAIGeneration<any>();
  const sopSections = sopData?.sections || [];
  const sopTitle = sopData?.title || 'Statement of Purpose';

  const { data: sopReview, isGenerating: isReviewing, generate: generateReview } = useAIGeneration<any>();
  const { toast } = useToast();

  const fullText = sopSections.map((s: any) => s.content).join(' ');
  const wordCount = fullText.trim() ? fullText.trim().split(/\s+/).length : 0;
  const readingTimeSecs = Math.ceil((wordCount / 200) * 60);
  const readingTimeStr = readingTimeSecs < 60 ? `${readingTimeSecs}s` : `${Math.ceil(readingTimeSecs / 60)}m read`;

  const profileEngine = calculateProfileStrength(profile, documents || []);
  const alignmentScore = Math.min(100, Math.round(profileEngine.percentage * 0.75));
  const grammarScore = wordCount > 50 ? Math.min(100, 62 + Math.floor(wordCount / 20)) : 0;
  const toneScore = wordCount > 30 ? Math.min(100, 70 + sopSections.length * 4) : 0;
  const structureScore = sopSections.length > 0 ? Math.min(100, sopSections.length * 16) : 0;

  const handleGenerate = async () => {
    if (!profile) return;
    const recommendations = recommendUniversities(universities, {
      profile, documents: documents || [], applications: uniqueApps || [],
      savedPrograms: savedPrograms || [], profileScore: profileEngine.percentage
    });
    await generateSOP(() => SOPService.generateSOP({
      studentProfile: profile,
      profileStrength: profileEngine.percentage,
      missingFields: profileEngine.missingFields,
      topRecommendations: recommendations.slice(0, 3).map(r => r.university.name),
      achievements: profile?.achievements || [],
      extracurriculars: profile?.extracurriculars || []
    }, generationMode));
  };

  const handleReview = async () => {
    if (sopSections.length === 0) return;
    setActiveRightTab('review');
    const text = sopSections.map((s: any) => `${s.heading}\n${s.content}`).join('\n\n');
    await generateReview(() => SOPService.reviewSOP(text, { studentProfile: profile }));
  };

  const handleCopy = () => {
    const text = sopSections.map((s: any) => `${s.heading}\n${s.content}`).join('\n\n');
    navigator.clipboard.writeText(text)
      .then(() => toast.success('SOP copied!'))
      .catch(() => toast.error('Failed to copy.'));
  };

  const handleUpdateSection = (idx: number, content: string) => {
    const s = [...sopSections]; s[idx].content = content;
    setSopData({ ...sopData, sections: s });
  };

  const scrollToSection = (idx: number) => {
    textAreaRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    textAreaRefs.current[idx]?.focus();
  };

  return (
    <div className="flex flex-col gap-5">

      {/* ── PAGE HEADER ────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#F5F3FF] border border-[#DDD6FE] rounded-[12px] flex items-center justify-center text-[#8B5CF6] shrink-0">
            <FileText size={17} strokeWidth={1.8} />
          </div>
          <div>
            <h1 className="text-[18px] font-semibold text-foreground tracking-tight leading-none">SOP Studio</h1>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] animate-pulse" />
              <span className="text-[11px] text-muted-foreground font-medium">Powered by EDUING AI</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleCopy} disabled={sopSections.length === 0}
            className="hidden sm:flex items-center gap-1.5 px-3 h-[34px] rounded-[8px] border border-border text-[12px] font-medium text-foreground bg-card hover:bg-muted transition-colors disabled:opacity-40">
            <Copy size={12} /> Copy
          </button>
          <button className="hidden sm:flex items-center gap-1.5 px-3 h-[34px] rounded-[8px] border border-border text-[12px] font-medium text-foreground bg-card hover:bg-muted transition-colors">
            <Download size={12} /> Export
          </button>
          <button className="flex items-center gap-1.5 px-4 h-[34px] rounded-[8px] bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-[12px] font-semibold transition-colors shadow-sm">
            <Save size={12} /> Save Draft
          </button>
        </div>
      </div>

      {/* ── THREE-PANEL WORKSPACE ─────────────────────────────── */}
      <div className="flex gap-4" style={{ height: 'calc(100vh - 240px)', minHeight: 540 }}>

        {/* LEFT: Writing Controls */}
        <div className="w-[240px] shrink-0 bg-card border border-border rounded-[16px] flex flex-col overflow-hidden shadow-sm">

          {/* Writing mode */}
          <div className="p-4 border-b border-border">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Writing Goal</p>
            <div className="flex flex-col gap-1.5">
              {WRITING_MODES.map(mode => (
                <button key={mode.id} onClick={() => setGenerationMode(mode.id)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-left transition-all ${
                    generationMode === mode.id
                      ? 'bg-[#F5F3FF] border border-[#DDD6FE] text-[#7C3AED]'
                      : 'border border-transparent text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full shrink-0 ${generationMode === mode.id ? 'bg-[#8B5CF6]' : 'bg-[#D1D5DB]'}`} />
                  <div>
                    <p className="text-[12px] font-semibold leading-none mb-0.5">{mode.label}</p>
                    <p className="text-[10px] text-muted-foreground">{mode.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Outline navigator */}
          {sopSections.length > 0 && (
            <div className="p-4 border-b border-border flex-1 overflow-y-auto">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Outline</p>
              <div className="flex flex-col gap-1.5">
                {sopSections.map((sec: any, idx: number) => (
                  <button key={idx} onClick={() => scrollToSection(idx)}
                    className="flex items-center gap-2 px-3 py-2 rounded-[8px] bg-muted border border-border hover:border-[#DDD6FE] hover:bg-[#F5F3FF] transition-all text-left group">
                    <span className="w-5 h-5 rounded-full bg-[#EDE9FE] text-[#8B5CF6] text-[10px] font-bold flex items-center justify-center shrink-0">{idx + 1}</span>
                    <span className="text-[11px] text-muted-foreground truncate group-hover:text-[#7C3AED]">{sec.heading}</span>
                    <ChevronRight size={10} className="text-[#D1D5DB] ml-auto shrink-0 group-hover:text-[#8B5CF6]" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Generate button */}
          <div className="p-4 mt-auto border-t border-border">
            <button onClick={handleGenerate} disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[10px] bg-[#F5F3FF] hover:bg-[#EDE9FE] border border-[#DDD6FE] text-[#8B5CF6] text-[12px] font-semibold transition-all disabled:opacity-50">
              {isGenerating
                ? <span className="w-3.5 h-3.5 border border-[#8B5CF6]/40 border-t-[#8B5CF6] rounded-full animate-spin" />
                : <Wand2 size={13} />}
              {isGenerating ? 'Drafting…' : 'Generate AI SOP'}
            </button>
          </div>
        </div>

        {/* CENTER: Writing Canvas */}
        <div className="flex-1 min-w-0 bg-card border border-border rounded-[16px] flex flex-col overflow-hidden shadow-sm relative">

          {/* Word count chip */}
          {wordCount > 0 && (
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#F5F3FF] border border-[#DDD6FE] text-[10px] text-[#8B5CF6]">
              <span className="flex items-center gap-1"><Hash size={9} /> {wordCount}</span>
              <span className="w-px h-3 bg-[#DDD6FE]" />
              <span className="flex items-center gap-1"><Clock size={9} /> {readingTimeStr}</span>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-6 md:p-10">

            {/* Empty state */}
            {sopSections.length === 0 && !isGenerating && !generationError && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 bg-[#F5F3FF] rounded-2xl border border-[#DDD6FE] flex items-center justify-center mb-5">
                  <BookOpen size={30} className="text-[#8B5CF6]" strokeWidth={1.2} />
                </div>
                <h2 className="text-[18px] font-semibold text-foreground mb-2">Your story starts here</h2>
                <p className="text-[13px] text-muted-foreground max-w-sm leading-relaxed mb-7">
                  EDUING AI will draft a compelling Statement of Purpose from your academic profile and goals.
                </p>
                <button onClick={handleGenerate}
                  className="flex items-center gap-2 px-5 h-9 rounded-[10px] bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-[13px] font-semibold transition-colors shadow-sm">
                  <Wand2 size={13} /> Draft My SOP
                </button>
              </div>
            )}

            {/* Error */}
            {generationError && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <AlertCircle size={36} className="text-red-400 mb-3 opacity-60" />
                <h3 className="text-[15px] font-semibold text-red-500 mb-1">Generation Failed</h3>
                <p className="text-[12px] text-muted-foreground">{generationError}</p>
              </div>
            )}

            {/* Loading */}
            {isGenerating && (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-12 h-12 relative mb-5">
                  <div className="absolute inset-0 border-2 border-[#8B5CF6]/20 rounded-full animate-[spin_2.5s_linear_infinite]" />
                  <div className="absolute inset-1.5 border-2 border-[#8B5CF6]/50 border-t-[#8B5CF6] rounded-full animate-spin" />
                </div>
                <h3 className="text-[15px] font-semibold text-[#8B5CF6] animate-pulse">Drafting your narrative…</h3>
                <p className="text-[12px] text-muted-foreground mt-1.5">Weaving your profile into a compelling story</p>
              </div>
            )}

            {/* Content */}
            {!isGenerating && sopSections.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-10 max-w-[620px] mx-auto pb-16">
                {/* Title */}
                <input type="text" value={sopTitle}
                  onChange={(e) => setSopData({ ...sopData, title: e.target.value })}
                  className="w-full bg-transparent text-[28px] md:text-[32px] font-serif text-foreground outline-none border-b border-transparent focus:border-[#E5E7EB] pb-2 transition-all placeholder:text-[#D1D5DB]"
                  placeholder="Statement of Purpose"
                />

                {/* Sections */}
                {sopSections.map((section: any, idx: number) => (
                  <div key={idx} className="group">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-6 h-6 rounded-full bg-[#F5F3FF] border border-[#DDD6FE] text-[#8B5CF6] text-[10px] font-bold flex items-center justify-center shrink-0">{idx + 1}</span>
                      <span className="text-[10px] font-bold text-[#8B5CF6] uppercase tracking-widest">{section.heading}</span>
                    </div>
                    <textarea
                      ref={el => { textAreaRefs.current[idx] = el; }}
                      value={section.content}
                      onChange={(e) => handleUpdateSection(idx, e.target.value)}
                      className="w-full bg-transparent text-[16px] md:text-[18px] leading-[1.85] font-serif text-foreground outline-none resize-none placeholder:text-[#D1D5DB] focus:text-foreground transition-colors"
                      style={{ height: `${Math.max(100, section.content.split('\n').length * 33)}px` }}
                      placeholder="Start writing…"
                    />
                    {/* Inline AI chips — shown on hover */}
                    <div className="mt-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {['Make concise', 'Add example', 'Improve flow'].map(action => (
                        <button key={action}
                          className="text-[10px] px-2.5 py-1 rounded-full border border-[#DDD6FE] text-[#8B5CF6] hover:bg-[#F5F3FF] transition-all">
                          ✦ {action}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </div>

        {/* RIGHT: Assist / Review */}
        <div className="w-[280px] shrink-0 bg-card border border-border rounded-[16px] flex flex-col overflow-hidden shadow-sm">

          {/* Tabs */}
          <div className="flex border-b border-border shrink-0">
            {(['assist', 'review'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveRightTab(tab)}
                className={`flex-1 py-3 text-[11px] font-semibold uppercase tracking-widest transition-all relative ${
                  activeRightTab === tab ? 'text-[#8B5CF6]' : 'text-muted-foreground hover:text-muted-foreground'
                }`}
              >
                {tab}
                {activeRightTab === tab && (
                  <motion.div layoutId="sop-right-tab" className="absolute bottom-0 inset-x-4 h-0.5 bg-[#8B5CF6] rounded-full" />
                )}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4">

            {/* ASSIST */}
            {activeRightTab === 'assist' && (
              <div className="flex flex-col gap-4">

                {/* Quality Scores */}
                {sopSections.length > 0 && (
                  <div className="bg-muted border border-border rounded-[12px] p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                      <TrendingUp size={9} /> Quality Score
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <QualityRing score={grammarScore} label="Grammar" color="#10B981" />
                      <QualityRing score={toneScore} label="Tone" color="#8B5CF6" />
                      <QualityRing score={structureScore} label="Structure" color="#4F6BFF" />
                    </div>
                  </div>
                )}

                {/* Profile Alignment */}
                <div className="border border-border rounded-[12px] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 size={13} className="text-[#10B981]" />
                    <p className="text-[12px] font-semibold text-foreground">Profile Alignment</p>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary/80 overflow-hidden mb-1.5">
                    <motion.div className="h-full rounded-full bg-gradient-to-r from-[#10B981] to-[#34D399]"
                      initial={{ width: 0 }} animate={{ width: `${alignmentScore}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-[#10B981] font-semibold">{alignmentScore}% utilized</span>
                    <span className="text-muted-foreground">{100 - alignmentScore}% unused</span>
                  </div>
                </div>

                {/* Writing Tips */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2.5 flex items-center gap-1.5">
                    <Zap size={9} className="text-[#F59E0B]" /> Writing Tips
                  </p>
                  {[
                    'Open with a specific moment — not a generic statement.',
                    'Quantify achievements: "Led a team of 8" beats "Led a team".',
                    'End with why THIS university specifically.',
                  ].map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 p-2.5 rounded-[8px] bg-[#FFFBEB] border border-[#FDE68A] mb-2">
                      <span className="text-[9px] font-bold text-[#D97706] mt-0.5 shrink-0">{i + 1}</span>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>

                {/* Review CTA */}
                <button onClick={handleReview} disabled={isReviewing || sopSections.length === 0}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[10px] border border-border bg-muted text-foreground hover:text-[#8B5CF6] hover:border-[#DDD6FE] hover:bg-[#F5F3FF] text-[12px] font-semibold transition-all disabled:opacity-40">
                  {isReviewing
                    ? <span className="w-3.5 h-3.5 border border-[#8B5CF6]/30 border-t-[#8B5CF6] rounded-full animate-spin" />
                    : <MessageSquareText size={13} />}
                  {isReviewing ? 'Analyzing…' : 'Run AI Review'}
                </button>
              </div>
            )}

            {/* REVIEW */}
            {activeRightTab === 'review' && (
              <div className="flex flex-col gap-3">

                {!sopReview && !isReviewing && (
                  <div className="text-center py-10">
                    <div className="w-12 h-12 bg-[#F5F3FF] border border-[#DDD6FE] rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <MessageSquareText size={20} className="text-[#8B5CF6]" />
                    </div>
                    <p className="text-[12px] font-semibold text-foreground mb-1">No Review Yet</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">Click &ldquo;Run AI Review&rdquo; in the Assist tab after generating your SOP.</p>
                  </div>
                )}

                {isReviewing && (
                  <div className="text-center py-10">
                    <div className="w-9 h-9 border-2 border-[#8B5CF6]/20 border-t-[#8B5CF6] rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-[12px] text-[#8B5CF6] font-medium">Analyzing document…</p>
                  </div>
                )}

                {sopReview && !isReviewing && (
                  <AnimatePresence>
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
                      {/* Score */}
                      <div className="flex items-center gap-3 p-4 rounded-[12px] bg-[#F5F3FF] border border-[#DDD6FE]">
                        <div className="w-12 h-12 rounded-full bg-card border border-[#DDD6FE] flex items-center justify-center shrink-0">
                          <span className="text-lg font-black text-[#8B5CF6]">{sopReview.overallScore}</span>
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-foreground">Overall Score</p>
                          <p className="text-[10px] text-muted-foreground">Out of 100</p>
                        </div>
                      </div>

                      {sopReview.strengths?.length > 0 && (
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#10B981] mb-2 flex items-center gap-1.5"><CheckCircle2 size={10} /> Strengths</p>
                          {sopReview.strengths.map((s: string, i: number) => (
                            <div key={i} className="flex items-start gap-2 p-2.5 rounded-[8px] bg-[#F0FDF4] border border-[#BBF7D0] mb-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] mt-1.5 shrink-0" />
                              <p className="text-[11px] text-foreground leading-relaxed">{s}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {sopReview.weaknesses?.length > 0 && (
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#EF4444] mb-2 flex items-center gap-1.5"><AlertCircle size={10} /> Areas to Improve</p>
                          {sopReview.weaknesses.map((w: string, i: number) => (
                            <div key={i} className="flex items-start gap-2 p-2.5 rounded-[8px] bg-[#FFF1F2] border border-[#FECDD3] mb-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444] mt-1.5 shrink-0" />
                              <p className="text-[11px] text-foreground leading-relaxed">{w}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SOPBuilderPage() {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      <Suspense fallback={<div className="flex items-center justify-center h-40"><div className="w-8 h-8 border-2 border-[#8B5CF6]/20 border-t-[#8B5CF6] rounded-full animate-spin" /></div>}>
        <SOPBuilderContent />
      </Suspense>
    </ProtectedRoute>
  );
}
