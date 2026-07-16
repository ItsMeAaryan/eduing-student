'use client';

import React, { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudentData } from '@/components/providers/StudentDataProvider';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAIGeneration } from '@/hooks/useAIGeneration';

import { EmailService } from '@/lib/ai/gemini/services';

import { Sparkles, Mail, CheckCircle2, AlertCircle, Wand2, Download, Copy, Save, LayoutTemplate, MessageSquareText, FileEdit } from 'lucide-react';
import { AIWorkspaceLayout } from '@/components/ai/AIWorkspaceLayout';

function EmailAssistantContent() {
  const { profile } = useStudentData();
  
  // UI State
  const [activeTab, setActiveTab] = useState<'write' | 'review'>('write');
  const [generationIntent, setGenerationIntent] = useState('University Admission Inquiry');
  
  // Email State
  const { data: emailData, setData: setEmailData, isGenerating, generate: generateEmail, error: generationError } = useAIGeneration<any>();
  const emailSubject = emailData?.subject || '';
  const emailBody = emailData?.body || '';
  const { data: emailReview, isGenerating: isReviewing, generate: generateReview, error: reviewError } = useAIGeneration<any>();

  const handleGenerate = async () => {
    if (!profile) return;
    const aiContext = {
      studentProfile: profile,
      achievements: profile.achievements || [],
      extracurriculars: profile.extracurriculars || [],
      experience: profile.experience || [],
      projects: profile.projects || [],
    };
    await generateEmail(() => EmailService.generateEmail(aiContext, generationIntent));
  };

  const handleReview = async () => {
    if (!emailBody) return;
    setActiveTab('review');
    const aiContext = { studentProfile: profile };
    await generateReview(() => EmailService.reviewEmail(`Subject: ${emailSubject}\n\n${emailBody}`, aiContext));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${emailSubject}\n\n${emailBody}`);
    alert('Copied to clipboard');
  };

  return (
    <AIWorkspaceLayout
      title="AI Email Assistant"
      icon={<Mail size={16} />}
      headerActions={
        <>
          <button onClick={handleCopy} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold transition-all flex items-center gap-2">
            <Copy size={14} /> Copy
          </button>
          <button className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20">
            <Save size={14} /> Save Draft
          </button>
        </>
      }
      leftPanel={
        <>
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3">Email Templates</h3>
            <div className="space-y-2">
              {[
                'University Admission Inquiry',
                'Application Follow-up',
                'Scholarship Inquiry',
                'Professor Contact',
                'Recommendation Letter Request',
                'Interview Thank You',
                'Fee Waiver Request'
              ].map(intent => (
                <button 
                  key={intent} 
                  onClick={() => setGenerationIntent(intent)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all ${generationIntent === intent ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-white/60 hover:bg-white/5 border border-transparent'}`}
                >
                  {intent}
                </button>
              ))}
            </div>
          </div>
          
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
          >
            {isGenerating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Wand2 size={16} />}
            {isGenerating ? 'Generating...' : 'Generate Email'}
          </button>
        </>
      }
      centerPanel={
        <>
            {!emailBody && !isGenerating && !generationError && (
              <div className="text-center py-24">
                <LayoutTemplate size={48} className="text-white/10 mx-auto mb-4" />
                <h2 className="text-xl font-black text-white/60 mb-2">Blank Canvas</h2>
                <p className="text-white/40 text-sm max-w-sm mx-auto">Select a template on the left and click Generate to draft a personalized professional email.</p>
              </div>
            )}
            {generationError && (
              <div className="text-center py-24">
                <AlertCircle size={48} className="text-rose-500 mx-auto mb-4" />
                <h2 className="text-xl font-black text-white/60 mb-2">Generation Error</h2>
                <p className="text-rose-400 text-sm max-w-sm mx-auto">{generationError}</p>
              </div>
            )}
            
            {isGenerating && (
              <div className="text-center py-24 space-y-4">
                 <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
                 <p className="text-indigo-400 font-bold animate-pulse">Gemini is drafting your Email...</p>
              </div>
            )}

            {!isGenerating && emailBody && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-24 h-full flex flex-col">
                <div className="bg-[#111114] border border-white/5 rounded-2xl flex flex-col h-full overflow-hidden min-h-[500px]">
                  <div className="border-b border-white/5 p-4 flex gap-4 items-center">
                    <span className="text-xs font-black uppercase tracking-widest text-white/40">Subject</span>
                    <input 
                      type="text"
                      value={emailSubject}
                      onChange={e => setEmailData({ ...emailData, subject: e.target.value })}
                      className="flex-1 bg-transparent text-sm font-medium outline-none text-white/90"
                    />
                  </div>
                  <div className="flex-1 p-4">
                    <textarea 
                      value={emailBody}
                      onChange={e => setEmailData({ ...emailData, body: e.target.value })}
                      className="w-full h-full bg-transparent text-[15px] leading-relaxed text-white/80 outline-none resize-none"
                    />
                  </div>
                </div>
              </motion.div>
            )}
        </>
      }
      rightPanel={
        <>
          <div className="flex border-b border-white/5">
             <button onClick={() => setActiveTab('write')} className={`flex-1 py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'write' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-white/40 hover:text-white'}`}>Assist</button>
             <button onClick={() => setActiveTab('review')} className={`flex-1 py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'review' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-white/40 hover:text-white'}`}>Review</button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {activeTab === 'write' && (
              <div className="space-y-6">
                <button onClick={handleReview} disabled={isReviewing || !emailBody} className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                  {isReviewing ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <MessageSquareText size={14} />}
                  Run AI Review
                </button>
              </div>
            )}

            {activeTab === 'review' && (
              <div className="space-y-6">
                {!emailReview && !isReviewing && (
                  <div className="text-center py-12">
                    <p className="text-xs text-white/40">Run AI Review from the Assist tab to get feedback.</p>
                  </div>
                )}
                {isReviewing && (
                  <div className="text-center py-12">
                     <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
                     <p className="text-xs text-indigo-400 font-bold">Analyzing email...</p>
                  </div>
                )}
                {emailReview && !isReviewing && (
                  <AnimatePresence>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#111114] p-4 rounded-2xl border border-white/5 text-center">
                          <span className="text-2xl font-black text-indigo-400">{emailReview.professionalismScore}</span>
                          <h4 className="text-[10px] text-white/40 uppercase font-bold tracking-widest mt-1">Professional</h4>
                        </div>
                        <div className="bg-[#111114] p-4 rounded-2xl border border-white/5 text-center">
                          <span className="text-2xl font-black text-emerald-400">{emailReview.grammarScore}</span>
                          <h4 className="text-[10px] text-white/40 uppercase font-bold tracking-widest mt-1">Grammar</h4>
                        </div>
                      </div>

                      <div className="bg-[#111114] p-4 rounded-2xl border border-white/5">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Readability</h4>
                        <p className="text-xs text-white/80">{emailReview.readability}</p>
                      </div>

                      {emailReview.alternativeSubjectLines && emailReview.alternativeSubjectLines.length > 0 && (
                        <div>
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-3">Alt Subjects</h4>
                          <ul className="space-y-2">
                            {emailReview.alternativeSubjectLines.map((s: string, i: number) => (
                              <li key={i}>
                                <button type="button" onClick={() => setEmailData({ ...emailData, subject: s })} className="w-full text-left text-[11px] text-white/70 bg-white/5 p-2 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                                  {s}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {emailReview.missingContext && emailReview.missingContext.length > 0 && (
                        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-3 flex items-center gap-2"><AlertCircle size={12}/> Missing Info</h4>
                          <ul className="space-y-2">
                            {emailReview.missingContext.map((g: string, i: number) => (
                              <li key={i} className="text-[11px] text-amber-400/80 leading-relaxed">{g}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            )}
          </div>
        </>
      }
    />
  );
}

export default function EmailAssistantPage() {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      <Suspense fallback={<div className="min-h-screen bg-[#0A0A0F]" />}>
        <EmailAssistantContent />
      </Suspense>
    </ProtectedRoute>
  );
}
