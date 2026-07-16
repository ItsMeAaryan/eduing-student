'use client';

import React, { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudentData } from '@/components/providers/StudentDataProvider';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAIGeneration } from '@/hooks/useAIGeneration';

import { EmailService } from '@/lib/ai/gemini/services';

import { Sparkles, Mail, CheckCircle2, AlertCircle, Wand2, Download, Copy, Save, LayoutTemplate, MessageSquareText, FileEdit, FileText } from 'lucide-react';
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
      title="Communication Hub"
      icon={<Mail size={16} />}
      themeColor="emerald"
      headerActions={
        <>
          <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-xs font-bold transition-all flex items-center gap-2">
            <Save size={14} /> Drafts
          </button>
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-xs font-bold transition-all flex items-center gap-2 shadow-[0_4px_20px_rgba(16,185,129,0.3)] disabled:opacity-50"
          >
            {isGenerating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Wand2 size={14} />}
            {isGenerating ? 'Drafting...' : 'Auto-Draft'}
          </button>
        </>
      }
    >
      <div className="flex flex-1 h-full overflow-hidden bg-[#0A0A0F]">
        
        {/* Left Sidebar (Folders / Templates) */}
        <div className="w-64 border-r border-white/5 bg-[#050505] flex flex-col z-10 shrink-0">
          <div className="p-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4 px-2">Smart Templates</h3>
            <div className="space-y-1">
              {[
                { name: 'University Admission Inquiry', icon: <Mail size={14} /> },
                { name: 'Application Follow-up', icon: <CheckCircle2 size={14} /> },
                { name: 'Scholarship Inquiry', icon: <Sparkles size={14} /> },
                { name: 'Professor Contact', icon: <MessageSquareText size={14} /> },
                { name: 'Recommendation Letter Request', icon: <FileText size={14} /> },
                { name: 'Interview Thank You', icon: <AlertCircle size={14} /> },
                { name: 'Fee Waiver Request', icon: <LayoutTemplate size={14} /> }
              ].map(intent => (
                <button 
                  key={intent.name} 
                  onClick={() => setGenerationIntent(intent.name)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-3 ${generationIntent === intent.name ? 'bg-emerald-500/10 text-emerald-400' : 'text-white/50 hover:bg-white/5 hover:text-white/80'}`}
                >
                  <span className={generationIntent === intent.name ? "text-emerald-400" : "text-white/30"}>{intent.icon}</span>
                  <span className="truncate">{intent.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center Panel (Composer) */}
        <div className="flex-1 overflow-hidden flex flex-col relative z-10">
            
            {/* Blank State overlay if empty */}
            {!emailBody && !isGenerating && !generationError && (
              <div className="absolute inset-0 bg-[#0A0A0F] z-20 flex items-center justify-center flex-col text-white/20">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                  <Mail size={32} />
                </div>
                <h2 className="text-xl font-bold mb-2 text-white/60">New Message</h2>
                <p className="text-sm font-medium">Select a template and Auto-Draft to begin.</p>
              </div>
            )}

            {/* Error State overlay */}
            {generationError && (
              <div className="absolute inset-0 bg-[#0A0A0F] z-20 flex items-center justify-center flex-col text-red-500/80">
                <AlertCircle size={48} className="mb-4 opacity-50" />
                <h2 className="text-xl font-bold mb-2">Generation Failed</h2>
                <p className="text-sm">{generationError}</p>
              </div>
            )}
            
            {/* Loading State overlay */}
            {isGenerating && (
              <div className="absolute inset-0 bg-[#0A0A0F] z-20 flex items-center justify-center flex-col backdrop-blur-md bg-opacity-80">
                 <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-6 shadow-[0_0_20px_rgba(16,185,129,0.3)]" />
                 <p className="text-emerald-400 font-bold animate-pulse text-lg">Composing draft...</p>
              </div>
            )}

            {/* Composer View */}
            <div className="flex-1 flex flex-col bg-white/[0.02]">
              {/* Composer Headers */}
              <div className="flex flex-col border-b border-white/5 bg-[#050505]">
                <div className="flex items-center px-6 py-3 border-b border-white/5">
                  <span className="text-xs font-bold text-white/40 w-16">To:</span>
                  <input type="text" placeholder="university@admissions.edu" className="flex-1 bg-transparent text-sm text-white/90 outline-none placeholder:text-white/20" />
                  <span className="text-[10px] font-bold text-white/30 cursor-pointer hover:text-white/60">Cc/Bcc</span>
                </div>
                <div className="flex items-center px-6 py-3">
                  <span className="text-xs font-bold text-white/40 w-16">Subject:</span>
                  <input 
                    type="text" 
                    value={emailSubject}
                    onChange={e => setEmailData({ ...emailData, subject: e.target.value })}
                    placeholder="Enter subject..."
                    className="flex-1 bg-transparent text-sm font-bold text-white outline-none placeholder:text-white/20" 
                  />
                </div>
              </div>

              {/* Composer Body */}
              <div className="flex-1 p-6 relative">
                <textarea 
                  value={emailBody}
                  onChange={e => setEmailData({ ...emailData, body: e.target.value })}
                  className="w-full h-full bg-transparent text-[15px] leading-[1.8] text-white/80 outline-none resize-none custom-scrollbar"
                  placeholder="Compose your email..."
                />
              </div>

              {/* Composer Action Bar */}
              <div className="p-4 bg-[#050505] border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button onClick={handleCopy} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-emerald-500/20">
                    Copy to Send
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors">
                    <LayoutTemplate size={16} />
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors">
                    <FileEdit size={16} />
                  </button>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium text-white/40">
                  <span>Saved to Drafts</span>
                </div>
              </div>
            </div>
        </div>

        {/* Right Assistant Panel */}
        <div className="w-80 border-l border-white/5 bg-[#050505] flex flex-col shrink-0 z-10">
          <div className="flex border-b border-white/5">
             <button onClick={() => setActiveTab('write')} className={`flex-1 py-5 text-[11px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'write' ? 'text-emerald-400' : 'text-white/40 hover:text-white'}`}>
               Assistant
               {activeTab === 'write' && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-emerald-500" />}
             </button>
             <button onClick={() => setActiveTab('review')} className={`flex-1 py-5 text-[11px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'review' ? 'text-emerald-400' : 'text-white/40 hover:text-white'}`}>
               Tone Check
               {activeTab === 'review' && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-emerald-500" />}
             </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {activeTab === 'write' && (
              <div className="space-y-6">
                <div className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-2xl">
                  <h4 className="text-xs font-bold text-emerald-400 mb-2 flex items-center gap-2"><Sparkles size={14}/> Context Aware</h4>
                  <p className="text-[11px] text-white/60 leading-relaxed">Your drafts automatically include your academic achievements and extracurriculars from your EDUING profile to provide context.</p>
                </div>

                <button onClick={handleReview} disabled={isReviewing || !emailBody} className="w-full py-4 bg-[#111114] hover:bg-[#1A1A24] border border-white/5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg">
                  {isReviewing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <MessageSquareText size={16} />}
                  Run Tone Check
                </button>
              </div>
            )}

            {activeTab === 'review' && (
              <div className="space-y-6">
                {!emailReview && !isReviewing && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-white/20">
                      <MessageSquareText size={24} />
                    </div>
                    <p className="text-xs text-white/40">Run Tone Check from the Assistant tab.</p>
                  </div>
                )}
                
                {isReviewing && (
                  <div className="text-center py-12">
                     <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
                     <p className="text-xs text-emerald-400 font-bold">Analyzing tone...</p>
                  </div>
                )}

                {emailReview && !isReviewing && (
                  <AnimatePresence>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#111114] p-5 rounded-3xl border border-white/5 text-center flex flex-col items-center justify-center shadow-lg">
                          <span className="text-2xl font-display font-black text-emerald-400">{emailReview.professionalismScore}</span>
                          <h4 className="text-[9px] text-white/40 uppercase font-bold tracking-widest mt-2">Professional</h4>
                        </div>
                        <div className="bg-[#111114] p-5 rounded-3xl border border-white/5 text-center flex flex-col items-center justify-center shadow-lg">
                          <span className="text-2xl font-display font-black text-indigo-400">{emailReview.grammarScore}</span>
                          <h4 className="text-[9px] text-white/40 uppercase font-bold tracking-widest mt-2">Grammar</h4>
                        </div>
                      </div>

                      <div className="bg-[#111114] p-5 rounded-2xl border border-white/5 shadow-lg">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-3 flex items-center gap-2"><CheckCircle2 size={12}/> Readability</h4>
                        <p className="text-[11px] text-white/80 leading-relaxed font-medium">{emailReview.readability}</p>
                      </div>

                      {emailReview.alternativeSubjectLines && emailReview.alternativeSubjectLines.length > 0 && (
                        <div>
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3 pl-2">Alternative Subjects</h4>
                          <ul className="space-y-2">
                            {emailReview.alternativeSubjectLines.map((s: string, i: number) => (
                              <li key={i}>
                                <button type="button" onClick={() => setEmailData({ ...emailData, subject: s })} className="w-full text-left text-[11px] text-white/70 bg-[#111114] hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/20 p-4 rounded-xl cursor-pointer transition-all shadow-md group">
                                  <span className="group-hover:text-emerald-400 transition-colors font-medium">{s}</span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {emailReview.missingContext && emailReview.missingContext.length > 0 && (
                        <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl mt-4">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-3 flex items-center gap-2"><AlertCircle size={12}/> Missing Information</h4>
                          <ul className="space-y-3">
                            {emailReview.missingContext.map((g: string, i: number) => (
                              <li key={i} className="text-[11px] text-amber-400/80 leading-relaxed flex items-start gap-3">
                                <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 shrink-0"/>
                                <span>{g}</span>
                              </li>
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
        </div>

      </div>
    </AIWorkspaceLayout>
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
