'use client';

import React, { useState, Suspense, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudentData } from '@/components/providers/StudentDataProvider';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAIGeneration } from '@/hooks/useAIGeneration';

import { InterviewService } from '@/lib/ai/gemini/services';

import { Sparkles, Mic, Play, Pause, Square, MessageSquare, AlertCircle, Wand2, Download, Copy, Save, CheckCircle2, RefreshCw } from 'lucide-react';
import { AIWorkspaceLayout } from '@/components/ai/AIWorkspaceLayout';

function InterviewCoachContent() {
  const { profile } = useStudentData();
  const answerEndRef = useRef<HTMLDivElement>(null);
  
  // UI State
  const [interviewType, setInterviewType] = useState('University Admission');
  const [isSessionActive, setIsSessionActive] = useState(false);
  
  // Interview State
  const { data: currentQuestion, setData: setCurrentQuestion, isGenerating, generate: generateQuestion, error: generationError } = useAIGeneration<any>();
  const { isGenerating: isEvaluating, generate: generateEvaluation, error: evaluationError } = useAIGeneration<any>();
  
  const [currentAnswer, setCurrentAnswer] = useState('');
  
  const [history, setHistory] = useState<{question: any, answer: string, evaluation: any}[]>([]);
  const [previousQuestions, setPreviousQuestions] = useState<string[]>([]);

  useEffect(() => {
    answerEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, currentQuestion, isEvaluating]);

  const handleStartSession = async () => {
    if (!profile) return;
    setIsSessionActive(true);
    setHistory([]);
    setPreviousQuestions([]);
    setCurrentAnswer('');
    await fetchNextQuestion([]);
  };

  const fetchNextQuestion = async (prevQ: string[]) => {
    const aiContext = {
      studentProfile: profile,
      achievements: profile?.achievements || [],
      extracurriculars: profile?.extracurriculars || [],
      experience: profile?.experience || [],
      projects: profile?.projects || [],
    };
    await generateQuestion(() => InterviewService.generateQuestion(aiContext, interviewType, prevQ));
  };

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim() || !currentQuestion) return;
    
    const aiContext = { studentProfile: profile };
    const res = await generateEvaluation(() => InterviewService.evaluateAnswer(currentQuestion.question, currentAnswer, aiContext));
    
    if (res.success && res.data) {
      const newHistory = [...history, {
        question: currentQuestion,
        answer: currentAnswer,
        evaluation: res.data
      }];
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
  };

  return (
    <AIWorkspaceLayout
      title="AI Interview Coach"
      icon={<Mic size={16} />}
      headerActions={
        <>
          {isSessionActive && (
            <button onClick={handleEndSession} className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-rose-500/20">
              <Square size={14} /> End Session
            </button>
          )}
        </>
      }
      leftPanel={
        <>
          <div className={isSessionActive ? 'opacity-50 pointer-events-none' : ''}>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3">Interview Type</h3>
            <div className="space-y-2">
              {[
                'University Admission',
                'Scholarship',
                'Technical',
                'Behavioral',
                'Research',
                'Internship'
              ].map(type => (
                <button 
                  key={type} 
                  onClick={() => setInterviewType(type)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all ${interviewType === type ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-white/60 hover:bg-white/5 border border-transparent'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          
          {!isSessionActive && (
            <button 
              onClick={handleStartSession}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
            >
              <Play size={16} /> Start Interview
            </button>
          )}

          {isSessionActive && (
             <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-center">
                <div className="w-3 h-3 bg-indigo-400 rounded-full animate-ping mx-auto mb-2" />
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Session Active</h4>
                <p className="text-[10px] text-white/60 mt-1">{history.length} Questions Answered</p>
             </div>
          )}
        </>
      }
      centerPanel={
        <>
          {!isSessionActive && history.length === 0 && (
             <div className="flex-1 flex flex-col items-center justify-center text-center">
                <Mic size={48} className="text-white/10 mx-auto mb-4" />
                <h2 className="text-xl font-black text-white/60 mb-2">Ready to Practice?</h2>
                <p className="text-white/40 text-sm max-w-sm mx-auto">Select an interview type on the left and start the session to receive personalized questions.</p>
             </div>
          )}

          {(isSessionActive || history.length > 0) && (
            <div className="flex-1 max-w-3xl mx-auto w-full space-y-8 pb-32 flex flex-col justify-end min-h-full">
              <div className="flex-1" />
              {/* History */}
              {history.map((item, idx) => (
                <div key={idx} className="space-y-6">
                   {/* Question */}
                   <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">
                         <Wand2 size={14} />
                      </div>
                      <div className="bg-[#111114] border border-white/5 rounded-2xl p-5 flex-1">
                         <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-[9px] font-black uppercase tracking-widest rounded">{item.question.category}</span>
                         </div>
                         <p className="text-[15px] leading-relaxed text-white/90">{item.question.question}</p>
                      </div>
                   </div>

                   {/* Answer */}
                   <div className="flex gap-4 flex-row-reverse">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                         <MessageSquare size={14} />
                      </div>
                      <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-5 flex-1 max-w-[85%]">
                         <p className="text-[15px] leading-relaxed text-emerald-50/90 whitespace-pre-wrap">{item.answer}</p>
                      </div>
                   </div>
                </div>
              ))}

              {/* Current Question Loading */}
              {isGenerating && (
                <div className="flex gap-4 animate-pulse">
                   <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30" />
                   <div className="bg-[#111114] border border-white/5 rounded-2xl p-5 flex-1 h-24 flex items-center gap-3">
                      <div className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                      <span className="text-xs text-indigo-400 font-bold">Coach is generating the next question...</span>
                   </div>
                </div>
              )}

              {/* Current Question */}
              {!isGenerating && currentQuestion && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4">
                   <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                      <Wand2 size={14} />
                   </div>
                   <div className="bg-[#111114] border border-indigo-500/20 rounded-2xl p-5 flex-1 shadow-lg shadow-indigo-500/5">
                      <div className="flex items-center gap-2 mb-2">
                         <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-[9px] font-black uppercase tracking-widest rounded">{currentQuestion.category}</span>
                      </div>
                      <p className="text-[15px] leading-relaxed text-white">{currentQuestion.question}</p>
                      <p className="text-[10px] text-white/40 mt-3 font-medium uppercase tracking-wider flex items-center gap-1"><AlertCircle size={10} /> Focus: {currentQuestion.expectedFocus}</p>
                   </div>
                </motion.div>
              )}

              <div ref={answerEndRef} />
            </div>
          )}

          {/* Input Area */}
          {isSessionActive && currentQuestion && !isGenerating && (
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent pointer-events-none">
              <div className="max-w-3xl mx-auto w-full pointer-events-auto">
                 <div className="bg-[#111114] border border-white/10 focus-within:border-indigo-500/50 rounded-2xl p-2 transition-colors flex shadow-2xl">
                    <textarea 
                      value={currentAnswer}
                      onChange={e => setCurrentAnswer(e.target.value)}
                      placeholder="Type your answer here..."
                      className="flex-1 bg-transparent text-sm leading-relaxed text-white/90 outline-none resize-none p-3 min-h-[60px] max-h-[200px]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmitAnswer();
                        }
                      }}
                    />
                    <div className="flex flex-col justify-end p-2 shrink-0">
                      <button 
                        onClick={handleSubmitAnswer}
                        disabled={!currentAnswer.trim() || isEvaluating}
                        className="w-8 h-8 bg-indigo-600 hover:bg-indigo-500 disabled:bg-white/5 disabled:text-white/20 rounded-xl flex items-center justify-center transition-colors"
                      >
                         {isEvaluating ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Play size={12} className="ml-0.5" />}
                      </button>
                    </div>
                 </div>
              </div>
            </div>
          )}
        </>
      }
      rightPanel={
        <>
          <div className="p-4 border-b border-white/5">
             <h2 className="text-xs font-black uppercase tracking-widest text-white/40">Latest Evaluation</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {history.length === 0 && !isEvaluating && (
              <div className="text-center py-12">
                 <p className="text-xs text-white/40">Answer a question to see real-time AI feedback.</p>
              </div>
            )}

            {isEvaluating && (
              <div className="text-center py-12">
                 <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
                 <p className="text-xs text-indigo-400 font-bold">Analyzing your response...</p>
              </div>
            )}

            {history.length > 0 && !isEvaluating && (
              <AnimatePresence mode="wait">
                <motion.div key={history.length} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#111114] p-4 rounded-2xl border border-white/5 text-center relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/10 blur-xl" />
                      <span className="text-2xl font-black text-indigo-400 relative z-10">{history[history.length-1].evaluation.overallScore}</span>
                      <h4 className="text-[10px] text-white/40 uppercase font-bold tracking-widest mt-1 relative z-10">Overall</h4>
                    </div>
                    <div className="bg-[#111114] p-4 rounded-2xl border border-white/5 text-center relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 blur-xl" />
                      <span className="text-2xl font-black text-emerald-400 relative z-10">{history[history.length-1].evaluation.communicationScore}</span>
                      <h4 className="text-[10px] text-white/40 uppercase font-bold tracking-widest mt-1 relative z-10">Comm</h4>
                    </div>
                  </div>

                  {history[history.length-1].evaluation.strengths && (
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-3 flex items-center gap-2"><CheckCircle2 size={12}/> Strengths</h4>
                      <ul className="space-y-2">
                        {history[history.length-1].evaluation.strengths.map((s: string, i: number) => (
                          <li key={i} className="text-[11px] text-white/70 leading-relaxed border-l-2 border-emerald-500/30 pl-2">{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {history[history.length-1].evaluation.missingPoints && history[history.length-1].evaluation.missingPoints.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-rose-400 mb-3 flex items-center gap-2"><AlertCircle size={12}/> Missing Points</h4>
                      <ul className="space-y-2">
                        {history[history.length-1].evaluation.missingPoints.map((s: string, i: number) => (
                          <li key={i} className="text-[11px] text-white/70 leading-relaxed border-l-2 border-rose-500/30 pl-2">{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {history[history.length-1].evaluation.suggestedBetterAnswer && (
                    <div className="bg-indigo-500/5 border border-indigo-500/10 p-4 rounded-xl">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-3 flex items-center gap-2"><RefreshCw size={12}/> Suggested Response</h4>
                      <p className="text-[11px] text-white/80 leading-relaxed italic">&quot;{history[history.length-1].evaluation.suggestedBetterAnswer}&quot;</p>
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </>
      }
    />
  );
}

export default function InterviewCoachPage() {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      <Suspense fallback={<div className="min-h-screen bg-[#0A0A0F]" />}>
        <InterviewCoachContent />
      </Suspense>
    </ProtectedRoute>
  );
}
