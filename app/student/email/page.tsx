'use client';

import React, { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudentData } from '@/components/providers/StudentDataProvider';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAIGeneration } from '@/hooks/useAIGeneration';

import { EmailService } from '@/lib/ai/gemini/services';

import { Sparkles, Mail, CheckCircle2, AlertCircle, Wand2, Download, Copy, Save, LayoutTemplate, MessageSquareText, FileEdit, FileText } from 'lucide-react';
import { AIWorkspaceLayout } from '@/components/ai/AIWorkspaceLayout';
import { Card, Button, Badge, H2, H3, H4, Body, Small, Caption, MetricCard } from '@/components/ui/design-system';

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
      icon={<Mail size={16} strokeWidth={1.8} />}
      themeColor="emerald"
      headerActions={
        <>
          <Button variant="secondary" size="sm" className="flex items-center gap-8">
            <Save size={14} strokeWidth={1.8} /> Drafts
          </Button>
          <Button 
            onClick={handleGenerate}
            disabled={isGenerating}
            variant="primary"
            size="sm"
            className="!bg-emerald-500 hover:!bg-emerald-600 !border-emerald-500 flex items-center gap-8 disabled:!bg-background disabled:!border-border disabled:!text-text-secondary"
          >
            {isGenerating ? <div className="w-16 h-16 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Wand2 size={14} strokeWidth={1.8} />}
            {isGenerating ? 'Drafting...' : 'Auto-Draft'}
          </Button>
        </>
      }
    >
      <div className="flex flex-1 h-full overflow-hidden bg-background">
        
        {/* Left Sidebar (Folders / Templates) */}
        <div className="w-[280px] border-r border-border bg-background flex flex-col z-10 shrink-0">
          <div className="p-24">
            <Small className="font-medium uppercase tracking-wider text-text-secondary mb-12">Smart Templates</Small>
            <div className="flex flex-col gap-4">
              {[
                { name: 'University Admission Inquiry', icon: <Mail size={16} strokeWidth={1.8} /> },
                { name: 'Application Follow-up', icon: <CheckCircle2 size={16} strokeWidth={1.8} /> },
                { name: 'Scholarship Inquiry', icon: <Sparkles size={16} strokeWidth={1.8} /> },
                { name: 'Professor Contact', icon: <MessageSquareText size={16} strokeWidth={1.8} /> },
                { name: 'Recommendation Letter Request', icon: <FileText size={16} strokeWidth={1.8} /> },
                { name: 'Interview Thank You', icon: <AlertCircle size={16} strokeWidth={1.8} /> },
                { name: 'Fee Waiver Request', icon: <LayoutTemplate size={16} strokeWidth={1.8} /> }
              ].map(intent => (
                <button 
                  key={intent.name} 
                  onClick={() => setGenerationIntent(intent.name)}
                  className={`w-full text-left px-12 py-8 rounded-card text-body font-medium transition-all flex items-center gap-12 ${generationIntent === intent.name ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'text-text-secondary hover:bg-hover hover:text-text-primary border border-transparent'}`}
                >
                  <span className={generationIntent === intent.name ? "text-emerald-500" : "text-text-secondary"}>{intent.icon}</span>
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
              <div className="absolute inset-0 bg-background z-20 flex items-center justify-center flex-col text-text-secondary">
                <div className="w-[64px] h-[64px] bg-background border border-border rounded-full flex items-center justify-center mb-24">
                  <Mail size={32} strokeWidth={1.8} />
                </div>
                <H2 className="mb-8">New Message</H2>
                <Body>Select a template and Auto-Draft to begin.</Body>
              </div>
            )}

            {/* Error State overlay */}
            {generationError && (
              <div className="absolute inset-0 bg-background z-20 flex items-center justify-center flex-col text-danger">
                <AlertCircle size={48} strokeWidth={1.8} className="mb-16 opacity-50" />
                <H2 className="mb-8 text-danger">Generation Failed</H2>
                <Body className="text-danger/80">{generationError}</Body>
              </div>
            )}
            
            {/* Loading State overlay */}
            {isGenerating && (
              <div className="absolute inset-0 bg-background/80 z-20 flex items-center justify-center flex-col backdrop-blur-md">
                 <div className="w-48 h-48 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-24 shadow-sm" />
                 <H3 className="text-emerald-500 animate-pulse">Composing draft...</H3>
              </div>
            )}

            {/* Composer View */}
            <div className="flex-1 flex flex-col bg-background">
              {/* Composer Headers */}
              <div className="flex flex-col border-b border-border bg-background">
                <div className="flex items-center px-24 py-12 border-b border-border">
                  <Small className="font-medium text-text-secondary w-[80px]">To:</Small>
                  <input type="text" placeholder="university@admissions.edu" className="flex-1 bg-transparent text-body text-text-primary outline-none placeholder:text-text-secondary" />
                  <Caption className="font-bold text-text-secondary cursor-pointer hover:text-text-primary">Cc/Bcc</Caption>
                </div>
                <div className="flex items-center px-24 py-12">
                  <Small className="font-medium text-text-secondary w-[80px]">Subject:</Small>
                  <input 
                    type="text" 
                    value={emailSubject}
                    onChange={e => setEmailData({ ...emailData, subject: e.target.value })}
                    placeholder="Enter subject..."
                    className="flex-1 bg-transparent text-body font-medium text-text-primary outline-none placeholder:text-text-secondary" 
                  />
                </div>
              </div>

              {/* Composer Body */}
              <div className="flex-1 p-24 relative">
                <textarea 
                  value={emailBody}
                  onChange={e => setEmailData({ ...emailData, body: e.target.value })}
                  className="w-full h-full bg-transparent text-[15px] leading-[1.8] text-text-primary outline-none resize-none custom-scrollbar"
                  placeholder="Compose your email..."
                />
              </div>

              {/* Composer Action Bar */}
              <div className="p-16 bg-background border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <Button onClick={handleCopy} variant="primary" className="!bg-emerald-500 hover:!bg-emerald-600 !border-emerald-500 shadow-sm">
                    Copy to Send
                  </Button>
                  <Button variant="secondary" className="!p-8 !w-auto !h-auto">
                    <LayoutTemplate size={16} strokeWidth={1.8} />
                  </Button>
                  <Button variant="secondary" className="!p-8 !w-auto !h-auto">
                    <FileEdit size={16} strokeWidth={1.8} />
                  </Button>
                </div>
                <div className="flex items-center gap-16">
                  <Caption className="text-text-secondary">Saved to Drafts</Caption>
                </div>
              </div>
            </div>
        </div>

        {/* Right Assistant Panel */}
        <div className="w-[320px] border-l border-border bg-background flex flex-col shrink-0 z-10">
          <div className="flex border-b border-border">
             <button onClick={() => setActiveTab('write')} className={`flex-1 py-16 text-caption font-bold uppercase tracking-widest transition-all relative ${activeTab === 'write' ? 'text-emerald-500' : 'text-text-secondary hover:text-text-primary'}`}>
               Assistant
               {activeTab === 'write' && <div className="absolute bottom-0 inset-x-0 h-[2px] bg-emerald-500" />}
             </button>
             <button onClick={() => setActiveTab('review')} className={`flex-1 py-16 text-caption font-bold uppercase tracking-widest transition-all relative ${activeTab === 'review' ? 'text-emerald-500' : 'text-text-secondary hover:text-text-primary'}`}>
               Tone Check
               {activeTab === 'review' && <div className="absolute bottom-0 inset-x-0 h-[2px] bg-emerald-500" />}
             </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-24 custom-scrollbar">
            {activeTab === 'write' && (
              <div className="flex flex-col gap-24">
                <Card className="!p-20 bg-emerald-500/5 border-emerald-500/20 shadow-sm">
                  <Caption className="font-bold text-emerald-500 mb-8 flex items-center gap-8"><Sparkles size={16} strokeWidth={1.8}/> Context Aware</Caption>
                  <Small className="text-text-secondary leading-relaxed">Your drafts automatically include your academic achievements and extracurriculars from your EDUING profile to provide context.</Small>
                </Card>

                <Button onClick={handleReview} disabled={isReviewing || !emailBody} variant="secondary" className="w-full flex items-center justify-center gap-12 disabled:!bg-background disabled:!border-border disabled:!text-text-secondary shadow-sm">
                  {isReviewing ? <div className="w-16 h-16 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <MessageSquareText size={16} strokeWidth={1.8} />}
                  Run Tone Check
                </Button>
              </div>
            )}

            {activeTab === 'review' && (
              <div className="flex flex-col gap-24">
                {!emailReview && !isReviewing && (
                  <div className="text-center py-48">
                    <div className="w-[64px] h-[64px] bg-background border border-border rounded-full flex items-center justify-center mx-auto mb-16 text-text-secondary">
                      <MessageSquareText size={24} strokeWidth={1.8} />
                    </div>
                    <Small className="text-text-secondary">Run Tone Check from the Assistant tab.</Small>
                  </div>
                )}
                
                {isReviewing && (
                  <div className="text-center py-48">
                     <div className="w-48 h-48 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-16" />
                     <Small className="text-emerald-500 font-bold">Analyzing tone...</Small>
                  </div>
                )}

                {emailReview && !isReviewing && (
                  <AnimatePresence>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-24">
                      
                      <div className="grid grid-cols-2 gap-16">
                        <Card className="!p-20 text-center flex flex-col items-center justify-center shadow-sm">
                          <H2 className="text-emerald-500">{emailReview.professionalismScore}</H2>
                          <Caption className="text-text-secondary uppercase font-bold tracking-widest mt-8">Professional</Caption>
                        </Card>
                        <Card className="!p-20 text-center flex flex-col items-center justify-center shadow-sm">
                          <H2 className="text-primary">{emailReview.grammarScore}</H2>
                          <Caption className="text-text-secondary uppercase font-bold tracking-widest mt-8">Grammar</Caption>
                        </Card>
                      </div>

                      <Card className="!p-20 shadow-sm border-emerald-500/20">
                        <Caption className="font-bold uppercase tracking-widest text-emerald-500 mb-12 flex items-center gap-8"><CheckCircle2 size={16} strokeWidth={1.8}/> Readability</Caption>
                        <Small className="text-text-primary leading-relaxed font-medium">{emailReview.readability}</Small>
                      </Card>

                      {emailReview.alternativeSubjectLines && emailReview.alternativeSubjectLines.length > 0 && (
                        <div>
                          <Caption className="font-bold uppercase tracking-widest text-text-secondary mb-12 pl-8">Alternative Subjects</Caption>
                          <ul className="flex flex-col gap-8">
                            {emailReview.alternativeSubjectLines.map((s: string, i: number) => (
                              <li key={i}>
                                <button type="button" onClick={() => setEmailData({ ...emailData, subject: s })} className="w-full text-left text-small text-text-primary bg-background hover:bg-emerald-500/10 border border-border hover:border-emerald-500/20 p-16 rounded-card cursor-pointer transition-all shadow-sm group">
                                  <span className="group-hover:text-emerald-500 transition-colors font-medium">{s}</span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {emailReview.missingContext && emailReview.missingContext.length > 0 && (
                        <Card className="!p-20 bg-warning/10 border-warning/20 mt-16 shadow-sm">
                          <Caption className="font-bold uppercase tracking-widest text-warning mb-12 flex items-center gap-8"><AlertCircle size={16} strokeWidth={1.8}/> Missing Information</Caption>
                          <ul className="flex flex-col gap-12">
                            {emailReview.missingContext.map((g: string, i: number) => (
                              <li key={i} className="text-small text-warning/80 leading-relaxed flex items-start gap-12">
                                <div className="w-6 h-6 bg-warning rounded-full mt-8 shrink-0"/>
                                <span>{g}</span>
                              </li>
                            ))}
                          </ul>
                        </Card>
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
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <EmailAssistantContent />
      </Suspense>
    </ProtectedRoute>
  );
}
