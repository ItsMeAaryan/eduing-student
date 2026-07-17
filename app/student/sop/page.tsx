'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudentData } from '@/components/providers/StudentDataProvider';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAIGeneration } from '@/hooks/useAIGeneration';

import { SOPService } from '@/lib/ai/gemini/services';
import { calculateProfileStrength } from '@/lib/utils/profileStrength';
import { recommendUniversities } from '@/lib/utils/recommendationEngine';

import { Sparkles, FileText, CheckCircle2, AlertCircle, Wand2, Download, Copy, Save, LayoutTemplate, MessageSquareText, FileEdit } from 'lucide-react';
import { AIWorkspaceLayout } from '@/components/ai/AIWorkspaceLayout';
import { Card, Button, Badge, H2, H3, H4, Body, Small, Caption, MetricCard } from '@/components/ui/design-system';

function SOPBuilderContent() {
  const { profile, documents, uniqueApps, savedPrograms, universities } = useStudentData();
  
  // UI State
  const [activeTab, setActiveTab] = useState<'write' | 'review'>('write');
  const [generationMode, setGenerationMode] = useState('Formal Tone');
  
  // SOP State
  const { data: sopData, setData: setSopData, isGenerating, generate: generateSOP, error: generationError } = useAIGeneration<any>();
  const sopSections = sopData?.sections || [];
  const sopTitle = sopData?.title || 'Statement of Purpose';
  const { data: sopReview, isGenerating: isReviewing, generate: generateReview, error: reviewError } = useAIGeneration<any>();

  const handleGenerate = async () => {
    if (!profile) return;
    const profileEngine = calculateProfileStrength(profile, documents || []);
    const recommendations = recommendUniversities(universities, {
      profile, documents: documents || [], applications: uniqueApps || [], savedPrograms: savedPrograms || [], profileScore: profileEngine.percentage
    });

    const aiContext = {
      studentProfile: profile,
      profileStrength: profileEngine.percentage,
      missingFields: profileEngine.missingFields,
      topRecommendations: recommendations.slice(0, 3).map(r => r.university.name),
      achievements: profile.achievements || [],
      extracurriculars: profile.extracurriculars || []
    };

    await generateSOP(() => SOPService.generateSOP(aiContext, generationMode));
  };

  const handleReview = async () => {
    if (sopSections.length === 0) return;
    setActiveTab('review');
    const sopContentText = sopSections.map((s: any) => `${s.heading}\n${s.content}`).join('\n\n');
    const aiContext = { studentProfile: profile };
    await generateReview(() => SOPService.reviewSOP(sopContentText, aiContext));
  };

  const handleCopy = () => {
    const text = sopSections.map((s: any) => `${s.heading}\n${s.content}`).join('\n\n');
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard');
  };

  const handleUpdateSection = (index: number, content: string) => {
    const newSections = [...sopSections];
    newSections[index].content = content;
    setSopData({ ...sopData, sections: newSections });
  };

  return (
    <AIWorkspaceLayout
      title="SOP Studio"
      icon={<FileText size={16} strokeWidth={1.8} />}
      themeColor="purple"
      headerActions={
        <>
          <Button onClick={handleCopy} variant="secondary" size="sm" className="flex items-center gap-8">
            <Copy size={14} strokeWidth={1.8} /> Copy
          </Button>
          <Button variant="secondary" size="sm" className="flex items-center gap-8">
            <Download size={14} strokeWidth={1.8} /> Export
          </Button>
          <Button variant="primary" size="sm" className="!bg-purple-500 hover:!bg-purple-600 !border-purple-500 flex items-center gap-8">
            <Save size={14} strokeWidth={1.8} /> Save Draft
          </Button>
        </>
      }
    >
      <div className="flex flex-1 h-full overflow-hidden bg-background">
        
        {/* Left Toolbar (Minimal) */}
        <div className="w-[280px] border-r border-border bg-background flex flex-col z-10 shrink-0">
          <div className="p-24">
            <Small className="font-medium uppercase tracking-wider text-text-secondary mb-12">Writing Target</Small>
            <div className="flex flex-col gap-4">
              {['Formal Tone', 'Academic Focus', 'Research Focus', 'Leadership Focus'].map(mode => (
                <button 
                  key={mode} 
                  onClick={() => setGenerationMode(mode)}
                  className={`w-full text-left px-12 py-8 rounded-card text-body font-medium transition-all flex items-center gap-12 ${generationMode === mode ? 'bg-purple-500/10 text-purple-500' : 'text-text-secondary hover:text-text-primary hover:bg-hover'}`}
                >
                  {generationMode === mode && <Sparkles size={16} strokeWidth={1.8} className="shrink-0" />}
                  {mode}
                </button>
              ))}
            </div>
          </div>
          
          <div className="p-24 mt-auto">
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating}
              variant="primary"
              className="w-full !bg-purple-500/10 hover:!bg-purple-500/20 !border-purple-500/20 !text-purple-500 flex items-center justify-center gap-8 disabled:!bg-background disabled:!border-border disabled:!text-text-secondary"
            >
              {isGenerating ? <div className="w-16 h-16 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Wand2 size={16} strokeWidth={1.8} />}
              {isGenerating ? 'Drafting...' : 'Generate AI SOP'}
            </Button>
          </div>
        </div>

        {/* Center Canvas (Medium-style Editor) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex justify-center relative">
          <div className="w-full max-w-[700px] py-48 px-24 relative z-10">
            
            {sopSections.length === 0 && !isGenerating && !generationError && (
              <div className="h-full flex items-center justify-center flex-col text-text-secondary mt-64 opacity-70">
                <LayoutTemplate size={64} strokeWidth={1.5} className="mb-24 opacity-30" />
                <H2 className="font-serif mb-8">Blank Canvas</H2>
                <Body className="font-sans">Generate a personalized draft to start writing.</Body>
              </div>
            )}

            {generationError && (
              <div className="h-full flex items-center justify-center flex-col text-danger mt-64">
                <AlertCircle size={64} strokeWidth={1.5} className="mb-24 opacity-50" />
                <H2 className="font-serif mb-8 text-danger">Generation Failed</H2>
                <Body className="font-sans text-danger/80">{generationError}</Body>
              </div>
            )}
            
            {isGenerating && (
              <div className="h-full flex items-center justify-center flex-col mt-64">
                 <div className="w-48 h-48 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-[spin_1.5s_linear_infinite] mb-24 relative">
                   <div className="absolute inset-2 border-2 border-purple-400/40 border-l-purple-400 rounded-full animate-[spin_2s_linear_infinite_reverse]" />
                 </div>
                 <H3 className="text-purple-500 font-serif animate-pulse">Drafting your narrative...</H3>
              </div>
            )}

            {!isGenerating && sopSections.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-32 pb-64">
                
                <input 
                  type="text" 
                  value={sopTitle}
                  onChange={(e) => setSopData({ ...sopData, title: e.target.value })}
                  className="w-full bg-transparent text-4xl lg:text-5xl font-serif text-text-primary outline-none border-b border-transparent focus:border-border pb-12 transition-all placeholder:text-text-secondary"
                  placeholder="Statement of Purpose"
                />
                
                <div className="flex flex-col gap-24">
                  {sopSections.map((section: any, idx: number) => (
                    <div key={idx} className="group relative">
                      <div className="flex items-center gap-12 mb-12">
                        <div className="w-24 h-24 rounded-full bg-background border border-border flex items-center justify-center text-caption font-bold text-text-secondary shadow-sm">
                          {idx + 1}
                        </div>
                        <Small className="font-sans font-bold text-purple-500 uppercase tracking-widest">
                          {section.heading}
                        </Small>
                      </div>
                      
                      <textarea 
                        value={section.content}
                        onChange={(e) => handleUpdateSection(idx, e.target.value)}
                        className="w-full bg-transparent text-lg lg:text-[21px] leading-[1.8] font-serif text-text-primary outline-none resize-none min-h-[150px] placeholder:text-text-secondary"
                        style={{ height: `${Math.max(150, section.content.split('\n').length * 36)}px` }}
                        placeholder="Start writing..."
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Right Assistant Panel */}
        <div className="w-[320px] border-l border-border bg-background flex flex-col shrink-0 z-10">
          <div className="flex border-b border-border">
             <button onClick={() => setActiveTab('write')} className={`flex-1 py-16 text-caption font-bold uppercase tracking-widest transition-all relative ${activeTab === 'write' ? 'text-purple-500' : 'text-text-secondary hover:text-text-primary'}`}>
               Assist
               {activeTab === 'write' && <div className="absolute bottom-0 inset-x-0 h-[2px] bg-purple-500" />}
             </button>
             <button onClick={() => setActiveTab('review')} className={`flex-1 py-16 text-caption font-bold uppercase tracking-widest transition-all relative ${activeTab === 'review' ? 'text-purple-500' : 'text-text-secondary hover:text-text-primary'}`}>
               Review
               {activeTab === 'review' && <div className="absolute bottom-0 inset-x-0 h-[2px] bg-purple-500" />}
             </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-24 custom-scrollbar">
            {activeTab === 'write' && (
              <div className="flex flex-col gap-24">
                <Card className="!p-24 shadow-sm">
                  <Body className="font-medium text-text-primary mb-12 flex items-center gap-8"><CheckCircle2 size={16} strokeWidth={1.8} className="text-success"/> Profile Alignment</Body>
                  <Small className="text-text-secondary mb-16">Ensure your SOP covers all your reported achievements from your EDUING profile.</Small>
                  <div className="w-full bg-background border border-border rounded-full h-8 mb-8 overflow-hidden"><div className="bg-success h-full rounded-full" style={{width: '75%'}}/></div>
                  <div className="flex justify-between text-caption font-medium text-text-secondary">
                    <span className="text-success">Good</span>
                    <span>75% Data Utilized</span>
                  </div>
                </Card>

                <Button onClick={handleReview} disabled={isReviewing || sopSections.length === 0} variant="secondary" className="w-full flex items-center justify-center gap-12 disabled:!bg-background disabled:!border-border disabled:!text-text-secondary">
                  {isReviewing ? <div className="w-16 h-16 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <MessageSquareText size={16} strokeWidth={1.8} />}
                  Run AI Review
                </Button>
              </div>
            )}

            {activeTab === 'review' && (
              <div className="flex flex-col gap-24">
                {!sopReview && !isReviewing && (
                  <div className="text-center py-48">
                    <div className="w-[64px] h-[64px] bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-16 border border-purple-500/20 text-purple-500">
                      <LayoutTemplate size={24} strokeWidth={1.8} />
                    </div>
                    <Body className="font-medium text-text-primary mb-8">No Review Found</Body>
                    <Small className="text-text-secondary">Run AI Review from the Assist tab to get feedback.</Small>
                  </div>
                )}
                
                {isReviewing && (
                  <div className="text-center py-48">
                     <div className="w-48 h-48 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-16" />
                     <Small className="text-purple-500 font-medium">Analyzing document...</Small>
                  </div>
                )}

                {sopReview && !isReviewing && (
                  <AnimatePresence>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-24">
                      
                      <Card className="flex items-center gap-16 !p-20 shadow-sm border-purple-500/20">
                        <div className="w-[64px] h-[64px] bg-purple-500/10 rounded-full flex items-center justify-center border border-purple-500/20">
                          <span className="text-2xl font-display font-black text-purple-500">{sopReview.overallScore}</span>
                        </div>
                        <div>
                          <Body className="font-medium text-text-primary mb-4">Overall Score</Body>
                          <Caption className="text-text-secondary uppercase font-medium tracking-widest">Out of 100</Caption>
                        </div>
                      </Card>

                      {sopReview.strengths && sopReview.strengths.length > 0 && (
                        <div>
                          <Caption className="font-medium uppercase tracking-widest text-success mb-12 flex items-center gap-8">
                            <CheckCircle2 size={16} strokeWidth={1.8} /> Narrative Strengths
                          </Caption>
                          <ul className="flex flex-col gap-12">
                            {sopReview.strengths.map((s: string, i: number) => (
                              <li key={i} className="text-small text-text-primary flex items-start gap-12 bg-success/5 p-16 rounded-card border border-success/10">
                                <div className="w-6 h-6 bg-success rounded-full mt-8 shrink-0"/>
                                <span className="leading-relaxed">{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {sopReview.weaknesses && sopReview.weaknesses.length > 0 && (
                        <div>
                          <Caption className="font-medium uppercase tracking-widest text-danger mb-12 flex items-center gap-8">
                            <AlertCircle size={16} strokeWidth={1.8} /> Areas to Improve
                          </Caption>
                          <ul className="flex flex-col gap-12">
                            {sopReview.weaknesses.map((w: string, i: number) => (
                              <li key={i} className="text-small text-text-primary flex items-start gap-12 bg-danger/5 p-16 rounded-card border border-danger/10">
                                <div className="w-6 h-6 bg-danger rounded-full mt-8 shrink-0"/>
                                <span className="leading-relaxed">{w}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {sopReview.grammarSuggestions && sopReview.grammarSuggestions.length > 0 && (
                        <Card className="!p-24 bg-warning/10 border-warning/20 relative overflow-hidden mt-32 shadow-sm">
                          <Caption className="font-medium uppercase tracking-widest text-warning mb-16 flex items-center gap-8 relative z-10"><Wand2 size={16} strokeWidth={1.8}/> Editor Notes</Caption>
                          <ul className="flex flex-col gap-12 relative z-10">
                            {sopReview.grammarSuggestions.map((g: string, i: number) => (
                              <li key={i} className="text-small text-warning/90 leading-relaxed font-medium">{g}</li>
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

export default function SOPBuilderPage() {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <SOPBuilderContent />
      </Suspense>
    </ProtectedRoute>
  );
}
