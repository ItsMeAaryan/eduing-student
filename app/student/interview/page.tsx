'use client';

import React, { useState, Suspense, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudentData } from '@/components/providers/StudentDataProvider';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAIGeneration } from '@/hooks/useAIGeneration';
import { InterviewService } from '@/lib/ai/gemini/services';
import {
  Sparkles, Mic, Play, Square, MessageSquare, AlertCircle, Wand2,
  CheckCircle2, RefreshCw, FileText, LayoutTemplate, User, Send,
  Target, TrendingUp, BarChart2
} from 'lucide-react';
import AIMarkdown from '@/components/ai/AIMarkdown';

// ─── Tracks + Difficulty ──────────────────────────────────────────────────────
const INTERVIEW_TRACKS = [
  { name: 'University Admission', color: '#4F6BFF' },
  { name: 'Scholarship', color: '#10B981' },
  { name: 'Technical', color: '#06B6D4' },
  { name: 'Behavioral', color: '#8B5CF6' },
  { name: 'Research', color: '#F59E0B' },
  { name: 'Internship', color: '#EC4899' },
];

const DIFFICULTIES = [
  { label: 'Beginner', value: 'beginner', color: '#10B981', bg: '#F0FDF4', border: '#BBF7D0' },
  { label: 'Intermediate', value: 'intermediate', color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A' },
  { label: 'Advanced', value: 'advanced', color: '#EF4444', bg: '#FFF1F2', border: '#FECDD3' },
];

// ─── Session Timer ────────────────────────────────────────────────────────────
function SessionTimer({ isActive }: { isActive: boolean }) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!isActive) { setSeconds(0); return; }
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [isActive]);
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return <span className="font-mono text-[12px] text-muted-foreground tabular-nums">{mm}:{ss}</span>;
}

// ─── Score Badge ──────────────────────────────────────────────────────────────
function ScoreBadge({ score, label }: { score: number; label: string }) {
  const color = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444';
  const bg = score >= 80 ? '#F0FDF4' : score >= 60 ? '#FFFBEB' : '#FFF1F2';
  const border = score >= 80 ? '#BBF7D0' : score >= 60 ? '#FDE68A' : '#FECDD3';
  return (
    <div className="flex flex-col items-center p-3 rounded-[12px] text-center border" style={{ background: bg, borderColor: border }}>
      <motion.span className="text-2xl font-black leading-none mb-1" style={{ color }}
        initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}>
        {score}
      </motion.span>
      <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
  );
}

// ─── Performance Trend ────────────────────────────────────────────────────────
function PerformanceTrend({ scores }: { scores: number[] }) {
  if (scores.length < 2) return null;
  const max = Math.max(...scores);
  return (
    <div className="flex items-end gap-1 h-10">
      {scores.map((s, i) => (
        <div key={i} className="flex-1 rounded-sm transition-all"
          style={{ height: `${(s / max) * 100}%`, background: s >= 80 ? '#10B981' : s >= 60 ? '#F59E0B' : '#EF4444', opacity: i === scores.length - 1 ? 1 : 0.5 }}
        />
      ))}
    </div>
  );
}

function InterviewCoachContent() {
  const { profile } = useStudentData();
  const answerEndRef = useRef<HTMLDivElement>(null);

  const [interviewType, setInterviewType] = useState('University Admission');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const { data: currentQuestion, setData: setCurrentQuestion, isGenerating, generate: generateQuestion } = useAIGeneration<any>();
  const { isGenerating: isEvaluating, generate: generateEvaluation } = useAIGeneration<any>();

  const [currentAnswer, setCurrentAnswer] = useState('');
  const [history, setHistory] = useState<{ question: any; answer: string; evaluation: any }[]>([]);
  const [previousQuestions, setPreviousQuestions] = useState<string[]>([]);

  const overallScores = history.map(h => h.evaluation?.overallScore || 0);
  const avgScore = overallScores.length > 0
    ? Math.round(overallScores.reduce((a, b) => a + b, 0) / overallScores.length) : 0;
  const latestEval = history.length > 0 ? history[history.length - 1].evaluation : null;

  useEffect(() => { answerEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [history, currentQuestion, isEvaluating]);

  const fetchNextQuestion = useCallback(async (prevQ: string[]) => {
    await generateQuestion(() => InterviewService.generateQuestion({
      studentProfile: profile,
      achievements: profile?.achievements || [],
      extracurriculars: profile?.extracurriculars || [],
      experience: profile?.experience || [],
      projects: profile?.projects || [],
    }, interviewType, prevQ));
  }, [profile, interviewType, generateQuestion]);

  const handleStartSession = async () => {
    if (!profile) return;
    setIsSessionActive(true);
    setHistory([]);
    setPreviousQuestions([]);
    setCurrentAnswer('');
    setShowSummary(false);
    await fetchNextQuestion([]);
  };

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim() || !currentQuestion) return;
    const res = await generateEvaluation(() =>
      InterviewService.evaluateAnswer(currentQuestion.question, currentAnswer, { studentProfile: profile })
    );
    if (res.success && res.data) {
      const newHistory = [...history, { question: currentQuestion, answer: currentAnswer, evaluation: res.data }];
      setHistory(newHistory);
      const newPrevQ = [...previousQuestions, currentQuestion.question];
      setPreviousQuestions(newPrevQ);
      setCurrentAnswer('');
      await fetchNextQuestion(newPrevQ);
    }
  };

  const handleEndSession = () => {
    setIsSessionActive(false);
    setCurrentQuestion(null);
    setCurrentAnswer('');
    setShowSummary(true);
  };

  const currentTrack = INTERVIEW_TRACKS.find(t => t.name === interviewType);

  return (
    <div className="flex flex-col gap-5">

      {/* ── PAGE HEADER ────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FFF1F2] border border-[#FECDD3] rounded-[12px] flex items-center justify-center text-[#F43F5E] shrink-0">
            <Mic size={17} strokeWidth={1.8} />
          </div>
          <div>
            <h1 className="text-[18px] font-semibold text-foreground tracking-tight leading-none">Interview Simulator</h1>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F43F5E] animate-pulse" />
              <span className="text-[11px] text-muted-foreground font-medium">Powered by EDUING AI</span>
            </div>
          </div>
        </div>
        {isSessionActive && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-[8px] bg-[#FFF1F2] border border-[#FECDD3]">
              <div className="w-2 h-2 rounded-full bg-[#F43F5E] animate-pulse" />
              <SessionTimer isActive={isSessionActive} />
              <span className="text-[11px] font-semibold text-[#F43F5E]">{history.length} Q</span>
            </div>
            <button onClick={handleEndSession}
              className="flex items-center gap-1.5 px-3 h-[34px] rounded-[8px] bg-[#FFF1F2] hover:bg-[#FFE4E6] border border-[#FECDD3] text-[#E11D48] text-[12px] font-semibold transition-colors">
              <Square size={10} fill="currentColor" /> End Session
            </button>
          </div>
        )}
      </div>

      {/* ── THREE-PANEL WORKSPACE ─────────────────────────────── */}
      <div className="flex gap-4" style={{ height: 'calc(100vh - 240px)', minHeight: 540 }}>

        {/* LEFT: Setup Panel */}
        <div className={`w-[240px] shrink-0 bg-card border border-border rounded-[16px] flex flex-col overflow-y-auto shadow-sm transition-opacity duration-300 ${isSessionActive ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>

          {/* Track selector */}
          <div className="p-4 border-b border-border">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Interview Track</p>
            <div className="flex flex-col gap-1">
              {INTERVIEW_TRACKS.map(track => {
                const active = interviewType === track.name;
                return (
                  <button key={track.name} onClick={() => setInterviewType(track.name)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-left text-[12px] font-medium transition-all ${
                      active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                    style={active ? { background: `${track.color}12`, color: track.color, border: `1px solid ${track.color}30` } : {}}
                  >
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: active ? track.color : '#D1D5DB' }} />
                    {track.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Difficulty */}
          <div className="p-4 border-b border-border">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Difficulty</p>
            <div className="flex flex-col gap-1.5">
              {DIFFICULTIES.map(d => (
                <button key={d.value} onClick={() => setDifficulty(d.value)}
                  className={`px-3 py-2 rounded-[10px] text-[11px] font-semibold text-left transition-all border ${
                    difficulty === d.value ? 'border-opacity-100' : 'border-transparent text-muted-foreground hover:bg-muted'
                  }`}
                  style={difficulty === d.value ? { background: d.bg, borderColor: d.border, color: d.color } : {}}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action */}
          <div className="p-4 mt-auto border-t border-border">
            {showSummary ? (
              <button onClick={handleStartSession}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[10px] border border-border bg-muted text-foreground text-[12px] font-semibold hover:bg-card transition-colors">
                <RefreshCw size={13} /> New Session
              </button>
            ) : (
              <button onClick={handleStartSession}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[10px] bg-[#F43F5E] hover:bg-[#E11D48] text-white text-[12px] font-semibold transition-colors shadow-sm">
                <Play size={13} fill="currentColor" /> Start Interview
              </button>
            )}
            {isSessionActive && (
              <div className="mt-3 p-3 bg-[#FFF1F2] border border-[#FECDD3] rounded-[10px] text-center">
                <p className="text-[10px] font-semibold text-[#F43F5E] uppercase tracking-wider mb-1">Live Session</p>
                <p className="text-2xl font-black text-foreground">{history.length}</p>
                <p className="text-[10px] text-muted-foreground">Questions done</p>
                {avgScore > 0 && (
                  <div className="mt-2 pt-2 border-t border-[#FECDD3]">
                    <p className="text-[10px] text-muted-foreground mb-0.5">Avg Score</p>
                    <p className="text-lg font-black"
                      style={{ color: avgScore >= 80 ? '#10B981' : avgScore >= 60 ? '#F59E0B' : '#EF4444' }}>{avgScore}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* CENTER: Simulator Canvas */}
        <div className="flex-1 min-w-0 bg-card border border-border rounded-[16px] flex flex-col overflow-hidden shadow-sm relative">

          {/* Pre-session empty state */}
          {!isSessionActive && history.length === 0 && !showSummary && (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
              <div className="w-20 h-20 bg-[#FFF1F2] border border-[#FECDD3] rounded-full flex items-center justify-center mb-6">
                <Mic size={36} className="text-[#F43F5E]" strokeWidth={1.2} />
              </div>
              <h2 className="text-[20px] font-semibold text-foreground mb-3">AI Interview Simulator</h2>
              <p className="text-[13px] text-muted-foreground max-w-sm leading-relaxed mb-7">
                Practice with an AI interviewer trained on top university admission patterns. Get instant feedback on every answer.
              </p>
              <div className="grid grid-cols-3 gap-3 w-full max-w-sm mb-7">
                {[
                  { label: 'Realistic', desc: 'Adapted to your profile' },
                  { label: 'Instant', desc: 'Live scoring & feedback' },
                  { label: 'Personal', desc: 'Based on your goals' },
                ].map(item => (
                  <div key={item.label} className="bg-muted border border-border rounded-[12px] p-3 text-center">
                    <p className="text-[11px] font-semibold text-foreground mb-1">{item.label}</p>
                    <p className="text-[10px] text-muted-foreground leading-snug">{item.desc}</p>
                  </div>
                ))}
              </div>
              <button onClick={handleStartSession}
                className="flex items-center gap-2 px-7 h-11 rounded-[12px] bg-[#F43F5E] hover:bg-[#E11D48] text-white text-[14px] font-semibold transition-colors shadow-md shadow-[#F43F5E]/20">
                <Play size={15} fill="currentColor" /> Start Interview
              </button>
            </div>
          )}

          {/* Post-session summary */}
          {showSummary && history.length > 0 && (
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-lg mx-auto p-6 md:p-8">
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5">
                  <div className="text-center">
                    <div className="w-14 h-14 bg-[#F0FDF4] border border-[#BBF7D0] rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 size={24} className="text-[#10B981]" />
                    </div>
                    <h2 className="text-[20px] font-semibold text-foreground mb-1">Session Complete</h2>
                    <p className="text-[12px] text-muted-foreground">{history.length} questions · {interviewType}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-muted border border-border rounded-[12px] p-4 text-center">
                      <p className="text-2xl font-black text-foreground mb-1">{avgScore}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Avg Score</p>
                    </div>
                    <div className="bg-muted border border-border rounded-[12px] p-4 text-center">
                      <p className="text-2xl font-black text-foreground mb-1">{history.length}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Questions</p>
                    </div>
                    <div className="bg-muted border border-border rounded-[12px] p-4 text-center">
                      <p className="text-2xl font-black mb-1" style={{ color: avgScore >= 70 ? '#10B981' : avgScore >= 50 ? '#F59E0B' : '#EF4444' }}>
                        {avgScore >= 70 ? 'Good' : avgScore >= 50 ? 'Fair' : 'Keep Going'}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Rating</p>
                    </div>
                  </div>

                  {overallScores.length >= 2 && (
                    <div className="bg-muted border border-border rounded-[12px] p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                        <TrendingUp size={10} /> Score Trend
                      </p>
                      <PerformanceTrend scores={overallScores} />
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          )}

          {/* Active session — conversation */}
          {(isSessionActive || (history.length > 0 && !showSummary)) && (
            <>
              <div className="flex-1 overflow-y-auto px-5 md:px-8 py-6 pb-[180px]">
                <div className="max-w-2xl mx-auto flex flex-col gap-6">

                  {/* History */}
                  {history.map((item, idx) => (
                    <div key={idx} className="flex flex-col gap-4">
                      {/* AI question */}
                      <div className="flex gap-3">
                        <div className="w-9 h-9 rounded-[10px] bg-[#FFF1F2] border border-[#FECDD3] flex items-center justify-center shrink-0 mt-0.5">
                          <Wand2 size={15} className="text-[#F43F5E]" />
                        </div>
                        <div className="flex-1 bg-muted border border-border rounded-[12px] p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#FFF1F2] text-[#F43F5E] border border-[#FECDD3] uppercase tracking-wider">
                              {item.question.category}
                            </span>
                          </div>
                          <p className="text-[13px] text-foreground leading-relaxed">{item.question.question}</p>
                        </div>
                      </div>
                      {/* User answer */}
                      <div className="flex gap-3 flex-row-reverse">
                        <div className="w-9 h-9 rounded-[10px] bg-primary/10 border border-[#C7D2FE] flex items-center justify-center shrink-0 mt-0.5">
                          <User size={14} className="text-[#4F6BFF]" />
                        </div>
                        <div className="flex-1 max-w-[85%] bg-primary/10 border border-[#C7D2FE] rounded-[12px] p-4">
                          <p className="text-[13px] text-foreground leading-relaxed whitespace-pre-wrap">{item.answer}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Thinking indicator */}
                  {isGenerating && (
                    <div className="flex gap-3">
                      <div className="w-9 h-9 rounded-[10px] bg-muted border border-border flex items-center justify-center shrink-0">
                        <div className="w-4 h-4 border-2 border-[#F43F5E]/30 border-t-[#F43F5E] rounded-full animate-spin" />
                      </div>
                      <div className="flex-1 bg-muted border border-border rounded-[12px] p-4 flex items-center gap-2">
                        <div className="flex gap-1">
                          {[0, 1, 2].map(i => (
                            <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF] animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
                          ))}
                        </div>
                        <p className="text-[12px] text-muted-foreground">Preparing your next question…</p>
                      </div>
                    </div>
                  )}

                  {/* Current question */}
                  {!isGenerating && currentQuestion && (
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                      <div className="w-9 h-9 rounded-[10px] bg-[#FFF1F2] border border-[#FECDD3] flex items-center justify-center shrink-0 mt-0.5">
                        <Wand2 size={15} className="text-[#F43F5E]" />
                      </div>
                      <div className="flex-1 bg-card border-2 border-[#FECDD3] rounded-[12px] p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-2.5">
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#FFF1F2] text-[#F43F5E] border border-[#FECDD3] uppercase tracking-wider">
                            {currentQuestion.category}
                          </span>
                        </div>
                        <p className="text-[14px] text-foreground leading-relaxed font-medium">{currentQuestion.question}</p>
                      </div>
                    </motion.div>
                  )}

                  <div ref={answerEndRef} />
                </div>
              </div>

              {/* Answer input — fixed at bottom of card */}
              {isSessionActive && currentQuestion && !isGenerating && (
                <div className="absolute bottom-0 inset-x-0 p-4 md:p-5 bg-gradient-to-t from-white via-white/95 to-transparent pt-8">
                  <div className="max-w-2xl mx-auto">
                    <div className="bg-card border border-border focus-within:border-[#FECDD3] rounded-[12px] p-2 transition-all shadow-sm flex relative">
                      <div className="absolute -top-3 left-3 flex items-center gap-1.5 px-2 py-0.5 bg-card border border-border rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#F43F5E] animate-pulse" />
                        <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">Your answer</span>
                      </div>
                      <textarea value={currentAnswer}
                        onChange={e => setCurrentAnswer(e.target.value)}
                        placeholder="Type your response… (Enter to submit, Shift+Enter for new line)"
                        className="flex-1 bg-transparent text-[13px] text-foreground outline-none resize-none p-2 min-h-[72px] max-h-[160px] placeholder:text-muted-foreground leading-relaxed"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmitAnswer(); }
                        }}
                      />
                      <div className="flex flex-col justify-end p-1 shrink-0">
                        <button onClick={handleSubmitAnswer}
                          disabled={!currentAnswer.trim() || isEvaluating}
                          className="w-9 h-9 rounded-[10px] bg-[#F43F5E] hover:bg-[#E11D48] disabled:bg-secondary disabled:text-[#D1D5DB] text-white flex items-center justify-center transition-all shadow-sm">
                          {isEvaluating
                            ? <span className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" />
                            : <Send size={14} strokeWidth={2} />
                          }
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* RIGHT: Live Feedback */}
        <div className="w-[260px] shrink-0 bg-card border border-border rounded-[16px] flex flex-col overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-border bg-[#FFF1F2]">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#F43F5E] flex items-center gap-1.5">
              <Sparkles size={9} /> Live Feedback
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">AI evaluation per answer</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4">

            {history.length === 0 && !isEvaluating && (
              <div className="text-center py-10">
                <div className="w-12 h-12 bg-muted border border-border rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Target size={20} className="text-[#D1D5DB]" />
                </div>
                <p className="text-[12px] font-semibold text-muted-foreground mb-1">Awaiting Response</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">Submit your first answer to receive feedback.</p>
              </div>
            )}

            {isEvaluating && (
              <div className="text-center py-10">
                <div className="w-9 h-9 border-2 border-[#F43F5E]/20 border-t-[#F43F5E] rounded-full animate-spin mx-auto mb-3" />
                <p className="text-[12px] text-[#F43F5E] font-medium">Evaluating…</p>
              </div>
            )}

            {history.length > 0 && !isEvaluating && latestEval && (
              <AnimatePresence mode="wait">
                <motion.div key={history.length} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-3">

                  <div className="grid grid-cols-2 gap-2">
                    <ScoreBadge score={latestEval.overallScore} label="Overall" />
                    <ScoreBadge score={latestEval.communicationScore} label="Communication" />
                  </div>

                  {overallScores.length >= 2 && (
                    <div className="bg-muted border border-border rounded-[12px] p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                        <BarChart2 size={9} /> Trend
                      </p>
                      <PerformanceTrend scores={overallScores} />
                    </div>
                  )}

                  {latestEval.strengths?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#10B981] mb-2 flex items-center gap-1.5"><CheckCircle2 size={10} /> Strengths</p>
                      {latestEval.strengths.map((s: string, i: number) => (
                        <div key={i} className="flex items-start gap-2 p-2.5 rounded-[8px] bg-[#F0FDF4] border border-[#BBF7D0] mb-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] mt-1.5 shrink-0" />
                          <AIMarkdown content={s} className="text-[11px]" />
                        </div>
                      ))}
                    </div>
                  )}

                  {latestEval.missingPoints?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#F59E0B] mb-2 flex items-center gap-1.5"><AlertCircle size={10} /> Growth Areas</p>
                      {latestEval.missingPoints.map((s: string, i: number) => (
                        <div key={i} className="flex items-start gap-2 p-2.5 rounded-[8px] bg-[#FFFBEB] border border-[#FDE68A] mb-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] mt-1.5 shrink-0" />
                          <AIMarkdown content={s} className="text-[11px]" />
                        </div>
                      ))}
                    </div>
                  )}

                  {latestEval.suggestedBetterAnswer && (
                    <div className="bg-muted border border-border rounded-[12px] p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5"><MessageSquare size={9} /> Model Response</p>
                      <AIMarkdown content={latestEval.suggestedBetterAnswer} className="text-[11px] italic" />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default function InterviewCoachPage() {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      <Suspense fallback={<div className="flex items-center justify-center h-40"><div className="w-8 h-8 border-2 border-[#F43F5E]/20 border-t-[#F43F5E] rounded-full animate-spin" /></div>}>
        <InterviewCoachContent />
      </Suspense>
    </ProtectedRoute>
  );
}
