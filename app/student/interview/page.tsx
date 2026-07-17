'use client';

import React, { useState, Suspense, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudentData } from '@/components/providers/StudentDataProvider';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAIGeneration } from '@/hooks/useAIGeneration';

import { InterviewService } from '@/lib/ai/gemini/services';

import { Sparkles, Mic, Play, Pause, Square, MessageSquare, AlertCircle, Wand2, Download, Copy, Save, CheckCircle2, RefreshCw, FileText, LayoutTemplate, User, Send, Target } from 'lucide-react';
import { AIWorkspaceLayout } from '@/components/ai/AIWorkspaceLayout';
import { Card, Button, Badge, H2, H3, H4, Body, Small, Caption, MetricCard } from '@/components/ui/design-system';

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
      icon={<Mic size={16} strokeWidth={1.8} />}
      themeColor="rose"
      headerActions={
        <>
          {isSessionActive && (
            <Button onClick={handleEndSession} variant="secondary" size="sm" className="!text-danger !bg-danger/10 hover:!bg-danger/20 !border-danger/20 flex items-center gap-8">
              <Square size={14} fill="currentColor" /> End Interview
            </Button>
          )}
        </>
      }
    >
      <div className="flex flex-1 h-full overflow-hidden bg-background">
        
        {/* Left Sidebar (Setup) */}
        <div className={`w-[280px] border-r border-border bg-background flex flex-col z-10 shrink-0 transition-opacity duration-300 ${isSessionActive ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
          <div className="p-24">
            <Small className="font-medium uppercase tracking-wider text-text-secondary mb-12 px-8">Interview Track</Small>
            <div className="flex flex-col gap-4">
              {[
                { name: 'University Admission', icon: <Wand2 size={16} strokeWidth={1.8} /> },
                { name: 'Scholarship', icon: <CheckCircle2 size={16} strokeWidth={1.8} /> },
                { name: 'Technical', icon: <Copy size={16} strokeWidth={1.8} /> },
                { name: 'Behavioral', icon: <MessageSquare size={16} strokeWidth={1.8} /> },
                { name: 'Research', icon: <FileText size={16} strokeWidth={1.8} /> },
                { name: 'Internship', icon: <LayoutTemplate size={16} strokeWidth={1.8} /> }
              ].map(type => (
                <button 
                  key={type.name} 
                  onClick={() => setInterviewType(type.name)}
                  className={`w-full text-left px-12 py-8 rounded-card text-body font-medium transition-all flex items-center gap-12 ${interviewType === type.name ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'text-text-secondary hover:bg-hover hover:text-text-primary border border-transparent'}`}
                >
                  <span className={interviewType === type.name ? "text-rose-500" : "text-text-secondary"}>{type.icon}</span>
                  {type.name}
                </button>
              ))}
            </div>
          </div>
          
          <div className="p-24 mt-auto">
            {!isSessionActive ? (
              <Button 
                onClick={handleStartSession}
                variant="primary"
                className="w-full !bg-rose-500 hover:!bg-rose-600 !border-rose-500 flex items-center justify-center gap-8"
              >
                <Play size={16} fill="currentColor" /> Enter Simulator
              </Button>
            ) : (
               <Card className="!p-20 border-rose-500/20 bg-rose-500/5 text-center">
                  <div className="flex items-center justify-center gap-8 mb-12">
                    <div className="w-8 h-8 bg-rose-500 rounded-full animate-pulse" />
                    <Caption className="font-medium text-rose-500 uppercase tracking-widest">Live Session</Caption>
                  </div>
                  <H2 className="text-text-primary leading-none mb-4">{history.length}</H2>
                  <Caption className="text-text-secondary uppercase">Questions Completed</Caption>
               </Card>
            )}
          </div>
        </div>

        {/* Center Panel (Simulator) */}
        <div className="flex-1 overflow-hidden flex flex-col relative z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-rose-900/5 via-background to-background">
            
          {!isSessionActive && history.length === 0 && (
             <div className="flex-1 flex flex-col items-center justify-center text-center px-24">
                <div className="w-[100px] h-[100px] bg-rose-500/5 rounded-full flex items-center justify-center mb-32 border border-rose-500/10">
                  <Mic size={40} strokeWidth={1.8} className="text-rose-500" />
                </div>
                <H2 className="mb-16">High-Stakes Simulator</H2>
                <Body className="text-text-secondary max-w-md mx-auto">
                  Experience a realistic, pressure-tested interview environment. Select your track and step into the simulator.
                </Body>
             </div>
          )}

          {(isSessionActive || history.length > 0) && (
            <div className="flex-1 overflow-y-auto px-24 md:px-48 pt-48 pb-[200px] custom-scrollbar">
              <div className="max-w-4xl mx-auto w-full space-y-48 flex flex-col justify-end min-h-full">
                
                {/* History */}
                {history.map((item, idx) => (
                  <div key={idx} className="flex flex-col gap-32">
                     {/* Question */}
                     <div className="flex gap-24">
                        <div className="w-48 h-48 rounded-card bg-background text-rose-500 flex items-center justify-center shrink-0 border border-border shadow-sm">
                           <Wand2 size={24} strokeWidth={1.8} />
                        </div>
                        <Card className="!p-24 flex-1 shadow-sm">
                           <div className="flex items-center gap-8 mb-12">
                              <Badge variant="default" className="!px-8 !py-2 text-[10px] uppercase tracking-widest">{item.question.category}</Badge>
                           </div>
                           <Body className="font-medium text-text-primary">{item.question.question}</Body>
                        </Card>
                     </div>

                     {/* Answer */}
                     <div className="flex gap-24 flex-row-reverse">
                        <div className="w-48 h-48 rounded-card bg-background text-text-secondary flex items-center justify-center shrink-0 border border-border shadow-sm">
                           <User size={24} strokeWidth={1.8} />
                        </div>
                        <Card className="!p-24 flex-1 max-w-[85%] shadow-sm">
                           <Body className="whitespace-pre-wrap">{item.answer}</Body>
                        </Card>
                     </div>
                  </div>
                ))}

                {/* Current Question Loading */}
                {isGenerating && (
                  <div className="flex gap-24 animate-pulse">
                     <div className="w-48 h-48 rounded-card bg-background border border-border shadow-sm" />
                     <Card className="!p-24 flex-1 h-[120px] flex items-center gap-16 shadow-sm">
                        <div className="w-24 h-24 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
                        <Body className="text-rose-500 font-medium">Interviewer is preparing the next question...</Body>
                     </Card>
                  </div>
                )}

                {/* Current Question */}
                {!isGenerating && currentQuestion && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex gap-24">
                     <div className="w-48 h-48 rounded-card bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 border border-rose-500/20 shadow-sm">
                        <Wand2 size={24} strokeWidth={1.8} />
                     </div>
                     <Card className="!p-32 flex-1 border-rose-500/30 bg-rose-500/5 shadow-sm">
                        <div className="flex items-center gap-12 mb-16">
                           <Badge variant="purple" className="!bg-rose-500/20 !text-rose-600 !border-rose-500/30 !px-8 !py-2 text-[10px] uppercase tracking-widest">{currentQuestion.category}</Badge>
                           <Caption className="text-text-secondary uppercase tracking-wider flex items-center gap-4"><AlertCircle size={14} strokeWidth={1.8} /> Focus: {currentQuestion.expectedFocus}</Caption>
                        </div>
                        <H4 className="font-serif leading-relaxed text-text-primary">{currentQuestion.question}</H4>
                     </Card>
                  </motion.div>
                )}

                <div ref={answerEndRef} />
              </div>
            </div>
          )}

          {/* Input Area */}
          {isSessionActive && currentQuestion && !isGenerating && (
            <div className="absolute bottom-0 inset-x-0 p-24 md:p-32 bg-gradient-to-t from-background via-background to-transparent pointer-events-none">
              <div className="max-w-4xl mx-auto w-full pointer-events-auto">
                 <div className="bg-background border border-border focus-within:border-rose-500/50 rounded-card p-12 transition-all flex relative shadow-lg">
                    
                    {/* Recording Indicator */}
                    <div className="absolute -top-12 -right-12">
                       <div className="flex items-center gap-8 px-12 py-8 bg-background border border-border rounded-full shadow-sm">
                         <div className="w-8 h-8 bg-rose-500 rounded-full animate-pulse" />
                         <Caption className="font-medium uppercase tracking-widest text-text-secondary">Recording</Caption>
                       </div>
                    </div>

                    <textarea 
                      value={currentAnswer}
                      onChange={e => setCurrentAnswer(e.target.value)}
                      placeholder="Speak or type your response..."
                      className="flex-1 bg-transparent text-body text-text-primary outline-none resize-none p-16 min-h-[100px] max-h-[250px] placeholder:text-text-secondary custom-scrollbar"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmitAnswer();
                        }
                      }}
                    />
                    <div className="flex flex-col justify-end p-8 shrink-0">
                      <button 
                        onClick={handleSubmitAnswer}
                        disabled={!currentAnswer.trim() || isEvaluating}
                        className="w-48 h-48 bg-primary text-white hover:bg-primary/90 disabled:bg-background disabled:text-text-secondary disabled:border disabled:border-border rounded-card flex items-center justify-center transition-all"
                      >
                         {isEvaluating ? <div className="w-24 h-24 border-2 border-text-secondary/30 border-t-text-secondary rounded-full animate-spin" /> : <Send size={20} strokeWidth={1.8} className="translate-x-0.5" />}
                      </button>
                    </div>
                 </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Assistant Panel */}
        <div className="w-[320px] border-l border-border bg-background flex flex-col shrink-0 z-10">
          <div className="p-24 border-b border-border bg-rose-500/5">
             <Caption className="font-medium uppercase tracking-widest text-rose-500 flex items-center gap-8 mb-8">
               <Sparkles size={16} strokeWidth={1.8} />
               Live Feedback
             </Caption>
             <Small className="text-text-secondary">
               Instant AI evaluation of your responses against top university standards.
             </Small>
          </div>
          
          <div className="flex-1 overflow-y-auto p-24 custom-scrollbar">
            {history.length === 0 && !isEvaluating && (
              <div className="text-center py-48">
                 <div className="w-[64px] h-[64px] bg-background rounded-full flex items-center justify-center mx-auto mb-16 text-text-secondary border border-border">
                   <Target size={28} strokeWidth={1.8} />
                 </div>
                 <Body className="font-medium text-text-primary mb-8">Awaiting Response</Body>
                 <Small className="text-text-secondary">Submit your first answer to receive comprehensive feedback.</Small>
              </div>
            )}

            {isEvaluating && (
              <div className="text-center py-48">
                 <div className="w-48 h-48 border-4 border-rose-500/30 border-t-rose-500 rounded-full animate-spin mx-auto mb-16" />
                 <Small className="text-rose-500 font-medium">Computing metrics...</Small>
              </div>
            )}

            {history.length > 0 && !isEvaluating && (
              <AnimatePresence mode="wait">
                <motion.div key={history.length} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-24">
                  
                  <div className="grid grid-cols-2 gap-16">
                    <Card className="!p-20 text-center relative overflow-hidden group border-rose-500/20">
                      <div className="absolute inset-0 bg-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <H2 className="text-rose-500 relative z-10">{history[history.length-1].evaluation.overallScore}</H2>
                      <Caption className="text-text-secondary uppercase font-medium tracking-widest mt-8 relative z-10">Overall Score</Caption>
                    </Card>
                    <Card className="!p-20 text-center relative overflow-hidden group border-success/20">
                      <div className="absolute inset-0 bg-success/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <H2 className="text-success relative z-10">{history[history.length-1].evaluation.communicationScore}</H2>
                      <Caption className="text-text-secondary uppercase font-medium tracking-widest mt-8 relative z-10">Communication</Caption>
                    </Card>
                  </div>

                  {history[history.length-1].evaluation.strengths && (
                    <Card className="!p-24 border-success/20">
                      <Caption className="font-medium uppercase tracking-widest text-success mb-16 flex items-center gap-8"><CheckCircle2 size={16} strokeWidth={1.8}/> Key Strengths</Caption>
                      <ul className="flex flex-col gap-12">
                        {history[history.length-1].evaluation.strengths.map((s: string, i: number) => (
                          <li key={i} className="text-small text-text-primary flex items-start gap-12">
                            <div className="w-6 h-6 bg-success rounded-full mt-8 shrink-0"/>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  )}

                  {history[history.length-1].evaluation.missingPoints && history[history.length-1].evaluation.missingPoints.length > 0 && (
                    <Card className="!p-24 border-warning/20">
                      <Caption className="font-medium uppercase tracking-widest text-warning mb-16 flex items-center gap-8"><AlertCircle size={16} strokeWidth={1.8}/> Growth Areas</Caption>
                      <ul className="flex flex-col gap-12">
                        {history[history.length-1].evaluation.missingPoints.map((s: string, i: number) => (
                          <li key={i} className="text-small text-text-primary flex items-start gap-12">
                            <div className="w-6 h-6 bg-warning rounded-full mt-8 shrink-0"/>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  )}

                  {history[history.length-1].evaluation.suggestedBetterAnswer && (
                    <Card className="!p-24 border-rose-500/20 bg-rose-500/5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-16 opacity-10 text-rose-500">
                        <MessageSquare size={64} strokeWidth={1.5} />
                      </div>
                      <Caption className="font-medium uppercase tracking-widest text-rose-500 mb-12 flex items-center gap-8 relative z-10"><RefreshCw size={16} strokeWidth={1.8}/> Model Response</Caption>
                      <Small className="text-text-primary italic font-medium relative z-10">&quot;{history[history.length-1].evaluation.suggestedBetterAnswer}&quot;</Small>
                    </Card>
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
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <InterviewCoachContent />
      </Suspense>
    </ProtectedRoute>
  );
}
