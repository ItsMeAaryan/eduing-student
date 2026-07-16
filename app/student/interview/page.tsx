'use client';

import React, { useState, Suspense, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudentData } from '@/components/providers/StudentDataProvider';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAIGeneration } from '@/hooks/useAIGeneration';

import { InterviewService } from '@/lib/ai/gemini/services';

import { Sparkles, Mic, Play, Pause, Square, MessageSquare, AlertCircle, Wand2, Download, Copy, Save, CheckCircle2, RefreshCw, FileText, LayoutTemplate, User, Send, Target } from 'lucide-react';
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
      title="Interview Simulator"
      icon={<Mic size={16} />}
      themeColor="rose"
      headerActions={
        <>
          {isSessionActive && (
            <button onClick={handleEndSession} className="px-4 py-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/20 rounded-full text-xs font-bold transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(225,29,72,0.1)]">
              <Square size={14} fill="currentColor" /> End Interview
            </button>
          )}
        </>
      }
    >
      <div className="flex flex-1 h-full overflow-hidden bg-[#020202]">
        
        {/* Left Sidebar (Setup) */}
        <div className={`w-64 border-r border-white/5 bg-[#050505] flex flex-col z-10 shrink-0 transition-opacity duration-300 ${isSessionActive ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
          <div className="p-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-6 px-2">Interview Track</h3>
            <div className="space-y-2">
              {[
                { name: 'University Admission', icon: <Wand2 size={14} /> },
                { name: 'Scholarship', icon: <CheckCircle2 size={14} /> },
                { name: 'Technical', icon: <Copy size={14} /> },
                { name: 'Behavioral', icon: <MessageSquare size={14} /> },
                { name: 'Research', icon: <FileText size={14} /> },
                { name: 'Internship', icon: <LayoutTemplate size={14} /> }
              ].map(type => (
                <button 
                  key={type.name} 
                  onClick={() => setInterviewType(type.name)}
                  className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-3 ${interviewType === type.name ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'text-white/50 hover:bg-white/5 border border-transparent'}`}
                >
                  <span className={interviewType === type.name ? "text-rose-400" : "text-white/30"}>{type.icon}</span>
                  {type.name}
                </button>
              ))}
            </div>
          </div>
          
          <div className="p-6 mt-auto">
            {!isSessionActive ? (
              <button 
                onClick={handleStartSession}
                className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(225,29,72,0.3)]"
              >
                <Play size={16} fill="currentColor" /> Enter Simulator
              </button>
            ) : (
               <div className="p-5 bg-rose-500/5 border border-rose-500/10 rounded-2xl text-center">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                    <h4 className="text-xs font-bold text-rose-400 uppercase tracking-widest">Live Session</h4>
                  </div>
                  <div className="text-2xl font-black text-white">{history.length}</div>
                  <p className="text-[10px] text-white/40 mt-1 uppercase">Questions Completed</p>
               </div>
            )}
          </div>
        </div>

        {/* Center Panel (Simulator) */}
        <div className="flex-1 overflow-hidden flex flex-col relative z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-rose-900/5 via-[#020202] to-[#020202]">
            
          {!isSessionActive && history.length === 0 && (
             <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                <div className="w-24 h-24 bg-rose-500/5 rounded-full flex items-center justify-center mb-8 border border-rose-500/10">
                  <Mic size={40} className="text-rose-400/50" />
                </div>
                <h2 className="text-3xl font-display font-black text-white/90 mb-4">High-Stakes Simulator</h2>
                <p className="text-white/40 text-sm max-w-md mx-auto leading-relaxed">
                  Experience a realistic, pressure-tested interview environment. Select your track and step into the simulator.
                </p>
             </div>
          )}

          {(isSessionActive || history.length > 0) && (
            <div className="flex-1 overflow-y-auto px-6 md:px-12 pt-12 pb-48 custom-scrollbar">
              <div className="max-w-4xl mx-auto w-full space-y-12 flex flex-col justify-end min-h-full">
                
                {/* History */}
                {history.map((item, idx) => (
                  <div key={idx} className="space-y-8">
                     {/* Question */}
                     <div className="flex gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-[#050505] text-rose-400 flex items-center justify-center shrink-0 border border-white/5 shadow-lg">
                           <Wand2 size={20} />
                        </div>
                        <div className="bg-[#0A0A0F] border border-white/5 rounded-3xl p-6 flex-1 shadow-xl">
                           <div className="flex items-center gap-2 mb-3">
                              <span className="px-3 py-1 bg-white/5 text-white/60 text-[10px] font-black uppercase tracking-widest rounded-full">{item.question.category}</span>
                           </div>
                           <p className="text-lg leading-[1.7] font-medium text-white/90">{item.question.question}</p>
                        </div>
                     </div>

                     {/* Answer */}
                     <div className="flex gap-6 flex-row-reverse">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 text-white/60 flex items-center justify-center shrink-0 border border-white/10 shadow-lg">
                           <User size={20} />
                        </div>
                        <div className="bg-[#111114] border border-white/10 rounded-3xl p-6 flex-1 max-w-[85%] shadow-xl">
                           <p className="text-[15px] leading-[1.8] text-white/80 whitespace-pre-wrap">{item.answer}</p>
                        </div>
                     </div>
                  </div>
                ))}

                {/* Current Question Loading */}
                {isGenerating && (
                  <div className="flex gap-6 animate-pulse">
                     <div className="w-12 h-12 rounded-2xl bg-[#050505] border border-white/5" />
                     <div className="bg-[#0A0A0F] border border-white/5 rounded-3xl p-6 flex-1 h-32 flex items-center gap-4">
                        <div className="w-5 h-5 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
                        <span className="text-sm text-rose-400 font-bold tracking-wide">Interviewer is preparing the next question...</span>
                     </div>
                  </div>
                )}

                {/* Current Question */}
                {!isGenerating && currentQuestion && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex gap-6">
                     <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20 shadow-[0_0_20px_rgba(225,29,72,0.15)]">
                        <Wand2 size={20} />
                     </div>
                     <div className="bg-[#050505] border border-rose-500/20 rounded-3xl p-8 flex-1 shadow-[0_10px_40px_rgba(225,29,72,0.05)]">
                        <div className="flex items-center gap-3 mb-4">
                           <span className="px-3 py-1 bg-rose-500/10 text-rose-400 text-[10px] font-black uppercase tracking-widest rounded-full">{currentQuestion.category}</span>
                           <span className="text-[10px] text-white/40 font-medium uppercase tracking-wider flex items-center gap-1.5"><AlertCircle size={12} /> Focus: {currentQuestion.expectedFocus}</span>
                        </div>
                        <p className="text-xl lg:text-2xl font-serif leading-[1.6] text-white">{currentQuestion.question}</p>
                     </div>
                  </motion.div>
                )}

                <div ref={answerEndRef} />
              </div>
            </div>
          )}

          {/* Input Area */}
          {isSessionActive && currentQuestion && !isGenerating && (
            <div className="absolute bottom-0 inset-x-0 p-6 md:p-8 bg-gradient-to-t from-[#020202] via-[#020202] to-transparent pointer-events-none">
              <div className="max-w-4xl mx-auto w-full pointer-events-auto">
                 <div className="bg-[#0A0A0F] border border-white/10 focus-within:border-rose-500/50 focus-within:shadow-[0_0_30px_rgba(225,29,72,0.1)] rounded-3xl p-3 transition-all flex shadow-2xl relative">
                    
                    {/* Recording Indicator */}
                    <div className="absolute -top-3 -right-3">
                       <div className="flex items-center gap-2 px-3 py-1.5 bg-[#111114] border border-white/10 rounded-full shadow-lg">
                         <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                         <span className="text-[9px] font-black uppercase tracking-widest text-white/60">Recording</span>
                       </div>
                    </div>

                    <textarea 
                      value={currentAnswer}
                      onChange={e => setCurrentAnswer(e.target.value)}
                      placeholder="Speak or type your response..."
                      className="flex-1 bg-transparent text-[15px] leading-[1.8] text-white outline-none resize-none p-4 min-h-[80px] max-h-[250px] placeholder:text-white/20 custom-scrollbar"
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
                        className="w-12 h-12 bg-white text-[#050505] hover:bg-white/90 disabled:bg-white/5 disabled:text-white/20 rounded-2xl flex items-center justify-center transition-all shadow-lg"
                      >
                         {isEvaluating ? <div className="w-5 h-5 border-2 border-[#050505]/30 border-t-[#050505] rounded-full animate-spin" /> : <Send size={18} className="translate-x-0.5" />}
                      </button>
                    </div>
                 </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Assistant Panel */}
        <div className="w-80 border-l border-white/5 bg-[#050505] flex flex-col shrink-0 z-10">
          <div className="p-6 border-b border-white/5 bg-rose-500/5">
             <h2 className="text-xs font-black uppercase tracking-widest text-rose-400 flex items-center gap-2">
               <Sparkles size={14} />
               Live Feedback
             </h2>
             <p className="text-[10px] text-white/50 mt-2 leading-relaxed">
               Instant AI evaluation of your responses against top university standards.
             </p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {history.length === 0 && !isEvaluating && (
              <div className="text-center py-16">
                 <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-white/20 border border-white/10">
                   <Target size={24} />
                 </div>
                 <h3 className="text-sm font-bold text-white mb-2">Awaiting Response</h3>
                 <p className="text-xs text-white/40 leading-relaxed">Submit your first answer to receive comprehensive feedback.</p>
              </div>
            )}

            {isEvaluating && (
              <div className="text-center py-16">
                 <div className="w-12 h-12 border-4 border-rose-500/30 border-t-rose-500 rounded-full animate-spin mx-auto mb-4" />
                 <p className="text-xs text-rose-400 font-bold">Computing metrics...</p>
              </div>
            )}

            {history.length > 0 && !isEvaluating && (
              <AnimatePresence mode="wait">
                <motion.div key={history.length} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#0A0A0F] p-5 rounded-3xl border border-white/5 text-center shadow-lg relative overflow-hidden group">
                      <div className="absolute inset-0 bg-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="text-3xl font-display font-black text-rose-400 relative z-10">{history[history.length-1].evaluation.overallScore}</span>
                      <h4 className="text-[9px] text-white/40 uppercase font-bold tracking-widest mt-2 relative z-10">Overall Score</h4>
                    </div>
                    <div className="bg-[#0A0A0F] p-5 rounded-3xl border border-white/5 text-center shadow-lg relative overflow-hidden group">
                      <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="text-3xl font-display font-black text-emerald-400 relative z-10">{history[history.length-1].evaluation.communicationScore}</span>
                      <h4 className="text-[9px] text-white/40 uppercase font-bold tracking-widest mt-2 relative z-10">Communication</h4>
                    </div>
                  </div>

                  {history[history.length-1].evaluation.strengths && (
                    <div className="bg-[#0A0A0F] p-5 rounded-2xl border border-white/5 shadow-md">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-4 flex items-center gap-2"><CheckCircle2 size={12}/> Key Strengths</h4>
                      <ul className="space-y-3">
                        {history[history.length-1].evaluation.strengths.map((s: string, i: number) => (
                          <li key={i} className="text-[11px] text-white/70 leading-relaxed flex items-start gap-3">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0"/>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {history[history.length-1].evaluation.missingPoints && history[history.length-1].evaluation.missingPoints.length > 0 && (
                    <div className="bg-[#0A0A0F] p-5 rounded-2xl border border-white/5 shadow-md">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-4 flex items-center gap-2"><AlertCircle size={12}/> Growth Areas</h4>
                      <ul className="space-y-3">
                        {history[history.length-1].evaluation.missingPoints.map((s: string, i: number) => (
                          <li key={i} className="text-[11px] text-white/70 leading-relaxed flex items-start gap-3">
                            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 shrink-0"/>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {history[history.length-1].evaluation.suggestedBetterAnswer && (
                    <div className="bg-rose-500/5 border border-rose-500/10 p-5 rounded-2xl shadow-inner relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <MessageSquare size={48} />
                      </div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-rose-400 mb-3 flex items-center gap-2 relative z-10"><RefreshCw size={12}/> Model Response</h4>
                      <p className="text-[11px] text-white/90 leading-[1.8] italic font-medium relative z-10">&quot;{history[history.length-1].evaluation.suggestedBetterAnswer}&quot;</p>
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>

      </div>
    </AIWorkspaceLayout>
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
