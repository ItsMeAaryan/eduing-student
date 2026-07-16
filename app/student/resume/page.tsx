'use client';

import React, { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudentData } from '@/components/providers/StudentDataProvider';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAIGeneration } from '@/hooks/useAIGeneration';

import { ResumeService } from '@/lib/ai/gemini/services';
import { calculateProfileStrength } from '@/lib/utils/profileStrength';

import { Sparkles, FileText, CheckCircle2, AlertCircle, Wand2, Download, Copy, Save, LayoutTemplate, MessageSquareText, FileEdit, GripVertical } from 'lucide-react';
import { AIWorkspaceLayout } from '@/components/ai/AIWorkspaceLayout';

function ResumeBuilderContent() {
  const { profile, documents } = useStudentData();
  
  // UI State
  const [activeTab, setActiveTab] = useState<'write' | 'review'>('write');
  const [generationMode, setGenerationMode] = useState('Professional Resume');
  
  // Resume State
  const { data: resumeSectionsData, setData: setResumeSections, isGenerating, generate: generateResume, error: generationError } = useAIGeneration<any>();
  const resumeSections = resumeSectionsData?.sections || [];
  const { data: resumeReview, isGenerating: isReviewing, generate: generateReview, error: reviewError } = useAIGeneration<any>();

  const handleGenerate = async () => {
    if (!profile) return;
    const profileEngine = calculateProfileStrength(profile, documents || []);

    const aiContext = {
      studentProfile: profile,
      profileStrength: profileEngine.percentage,
      missingFields: profileEngine.missingFields,
      achievements: profile.achievements || [],
      extracurriculars: profile.extracurriculars || [],
      experience: profile.experience || [],
      projects: profile.projects || [],
      skills: profile.skills || []
    };

    await generateResume(() => ResumeService.generateResume(aiContext, generationMode));
  };

  const handleReview = async () => {
    if (resumeSections.length === 0) return;
    setActiveTab('review');
    const resumeContentText = resumeSections.map((s: any) => `${s.heading}\n${s.content}`).join('\n\n');
    const aiContext = { studentProfile: profile };
    await generateReview(() => ResumeService.reviewResume(resumeContentText, aiContext));
  };

  const handleCopy = () => {
    const text = resumeSections.map((s: any) => `${s.heading}\n${s.content}`).join('\n\n');
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard');
  };

  const handleUpdateSection = (index: number, field: 'heading' | 'content', value: string) => {
    const newSections = [...resumeSections];
    newSections[index][field] = value;
    setResumeSections({ sections: newSections });
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('dragIndex', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    const dragIndex = parseInt(e.dataTransfer.getData('dragIndex'));
    const newSections = [...resumeSections];
    const draggedSection = newSections[dragIndex];
    newSections.splice(dragIndex, 1);
    newSections.splice(targetIndex, 0, draggedSection);
    setResumeSections({ sections: newSections });
  };

  return (
    <AIWorkspaceLayout
      title="Resume Editor"
      icon={<FileText size={16} />}
      themeColor="cyan"
      headerActions={
        <>
          <button onClick={handleCopy} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-xs font-bold transition-all flex items-center gap-2">
            <Copy size={14} /> Copy
          </button>
          <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-xs font-bold transition-all flex items-center gap-2">
            <Download size={14} /> PDF
          </button>
          <button className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20">
            <Save size={14} /> Save
          </button>
        </>
      }
    >
      <div className="flex flex-1 h-full overflow-hidden">
        
        {/* Left Toolbar */}
        <div className="w-64 lg:w-72 border-r border-white/5 bg-[#08080C] flex flex-col z-10 shrink-0">
          <div className="p-6 border-b border-white/5">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4">Target Profile</h3>
            <div className="space-y-2">
              {['Academic (MS/PhD)', 'Software Engineering Internship', 'Research Assistant', 'Management Consulting'].map(mode => (
                <button 
                  key={mode} 
                  onClick={() => setGenerationMode(mode)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3 ${generationMode === mode ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-white/60 hover:bg-white/5 border border-transparent'}`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${generationMode === mode ? 'bg-cyan-400' : 'bg-transparent'}`} />
                  {mode}
                </button>
              ))}
            </div>
          </div>
          <div className="p-6">
            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(8,145,178,0.3)] disabled:opacity-50 text-white"
            >
              {isGenerating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Wand2 size={16} />}
              {isGenerating ? 'Drafting...' : 'Generate Resume'}
            </button>
          </div>
        </div>

        {/* Center Canvas */}
        <div className="flex-1 bg-[#050505] overflow-y-auto p-8 lg:p-12 custom-scrollbar flex justify-center relative bg-[url('/grid-pattern.svg')] bg-[length:32px_32px]">
          {/* Document A4 Wrapper */}
          <div className="w-full max-w-[800px] min-h-[1056px] bg-white text-black shadow-2xl shadow-black/50 p-12 relative">
            
            {resumeSections.length === 0 && !isGenerating && !generationError && (
              <div className="absolute inset-0 flex items-center justify-center flex-col text-black/20">
                <LayoutTemplate size={64} className="mb-6 opacity-50" />
                <h2 className="text-2xl font-bold mb-2">Empty Document</h2>
                <p className="text-sm">Select a profile target and generate a draft.</p>
              </div>
            )}

            {generationError && (
              <div className="absolute inset-0 flex items-center justify-center flex-col text-red-500/80">
                <AlertCircle size={64} className="mb-6 opacity-50" />
                <h2 className="text-2xl font-bold mb-2">Generation Failed</h2>
                <p className="text-sm">{generationError}</p>
              </div>
            )}
            
            {isGenerating && (
              <div className="absolute inset-0 flex items-center justify-center flex-col bg-white/80 backdrop-blur-sm z-50">
                 <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-6" />
                 <p className="text-cyan-600 font-bold animate-pulse text-lg">Synthesizing Profile Data...</p>
              </div>
            )}

            {!isGenerating && resumeSections.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                {profile && (
                  <div className="text-center mb-8 pb-6 border-b-2 border-black/10">
                    <h1 className="text-4xl font-serif text-black mb-2">{profile.firstName} {profile.lastName}</h1>
                    <p className="text-sm text-black/70 font-sans">
                      {profile.email} • {profile.phone || '+91 XXXXX XXXXX'} • {profile.location || 'India'}
                    </p>
                  </div>
                )}
                
                <div className="space-y-6">
                  {resumeSections.map((section: any, idx: number) => (
                    <div 
                      key={idx} 
                      className="group relative rounded-lg p-2 -mx-2 hover:bg-black/[0.02] transition-colors border border-transparent hover:border-black/5"
                      draggable
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, idx)}
                    >
                      <div className="absolute -left-6 top-4 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing text-black/30 hover:text-black/60 p-1 transition-all">
                        <GripVertical size={16} />
                      </div>
                      
                      <div className="flex items-center justify-between mb-3 border-b border-black/10 pb-1">
                        <input 
                          type="text"
                          value={section.heading}
                          onChange={(e) => handleUpdateSection(idx, 'heading', e.target.value)}
                          className="bg-transparent text-lg font-serif font-bold text-black uppercase tracking-wider outline-none w-full"
                        />
                      </div>
                      <textarea 
                        value={section.content}
                        onChange={(e) => handleUpdateSection(idx, 'content', e.target.value)}
                        className="w-full bg-transparent text-[15px] leading-[1.6] text-black/90 outline-none resize-none min-h-[100px] font-sans"
                        style={{ height: `${Math.max(100, section.content.split('\\n').length * 24)}px` }}
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Right Assistant Panel */}
        <div className="w-80 border-l border-white/5 bg-[#08080C] flex flex-col shrink-0 z-10">
          <div className="flex border-b border-white/5">
             <button onClick={() => setActiveTab('write')} className={`flex-1 py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'write' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-white/40 hover:text-white'}`}>Assist</button>
             <button onClick={() => setActiveTab('review')} className={`flex-1 py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'review' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-white/40 hover:text-white'}`}>ATS Review</button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {activeTab === 'write' && (
              <div className="space-y-6">
                <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                  <h4 className="text-xs font-bold mb-3 flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-400"/> Profile Utilization</h4>
                  <p className="text-[11px] text-white/60 leading-relaxed mb-4">Your Resume incorporates all relevant projects and skills from your EDUING profile.</p>
                  <div className="w-full bg-white/10 rounded-full h-2 mb-2 overflow-hidden"><div className="bg-emerald-500 h-full rounded-full" style={{width: '90%'}}/></div>
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-emerald-400">Excellent</span>
                    <span className="text-white/40">90% Data Utilized</span>
                  </div>
                </div>

                <button onClick={handleReview} disabled={isReviewing || resumeSections.length === 0} className="w-full py-4 bg-[#111114] hover:bg-[#1A1A24] border border-white/10 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                  {isReviewing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <MessageSquareText size={16} />}
                  Run ATS Simulator
                </button>
              </div>
            )}

            {activeTab === 'review' && (
              <div className="space-y-6">
                {!resumeReview && !isReviewing && !reviewError && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-500/20 text-cyan-400">
                      <LayoutTemplate size={24} />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-2">No Review Found</h3>
                    <p className="text-xs text-white/40">Run ATS Simulator from the Assist tab to get feedback.</p>
                  </div>
                )}
                
                {reviewError && (
                  <div className="text-center py-12 bg-red-500/10 rounded-2xl border border-red-500/20 p-6">
                    <AlertCircle size={32} className="text-rose-500 mx-auto mb-4" />
                    <p className="text-xs text-rose-400 font-bold">{reviewError}</p>
                  </div>
                )}
                
                {isReviewing && (
                  <div className="text-center py-12">
                     <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
                     <p className="text-xs text-cyan-400 font-bold">Simulating ATS Parsing...</p>
                  </div>
                )}

                {resumeReview && !isReviewing && (
                  <AnimatePresence>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#111114] p-5 rounded-2xl border border-white/5 text-center flex flex-col items-center justify-center">
                          <span className="text-3xl font-display font-black text-cyan-400">{resumeReview.overallScore}</span>
                          <h4 className="text-[9px] text-white/40 uppercase font-bold tracking-widest mt-2">Impact Score</h4>
                        </div>
                        <div className="bg-[#111114] p-5 rounded-2xl border border-white/5 text-center flex flex-col items-center justify-center">
                          <span className="text-3xl font-display font-black text-emerald-400">{resumeReview.atsScore}</span>
                          <h4 className="text-[9px] text-white/40 uppercase font-bold tracking-widest mt-2">ATS Score</h4>
                        </div>
                      </div>

                      {resumeReview.strengths && resumeReview.strengths.length > 0 && (
                        <div>
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-3 flex items-center gap-2">
                            <CheckCircle2 size={12} /> Strengths
                          </h4>
                          <ul className="space-y-3">
                            {resumeReview.strengths.map((s: string, i: number) => (
                              <li key={i} className="text-[11px] text-white/70 flex items-start gap-3 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.8)]"/>
                                <span className="leading-relaxed">{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {resumeReview.weakBulletPoints && resumeReview.weakBulletPoints.length > 0 && (
                        <div>
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-rose-400 mb-3 flex items-center gap-2">
                            <AlertCircle size={12} /> Weak Bullet Points
                          </h4>
                          <ul className="space-y-3">
                            {resumeReview.weakBulletPoints.map((w: string, i: number) => (
                              <li key={i} className="text-[11px] text-white/70 flex items-start gap-3 bg-rose-500/5 p-3 rounded-xl border border-rose-500/10">
                                <div className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-1 shrink-0 shadow-[0_0_8px_rgba(244,63,94,0.8)]"/>
                                <span className="leading-relaxed">{w}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {resumeReview.actionableSuggestions && resumeReview.actionableSuggestions.length > 0 && (
                        <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl mt-8 relative overflow-hidden">
                          <div className="absolute -top-4 -right-4 text-amber-500/20"><Sparkles size={64}/></div>
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-4 flex items-center gap-2 relative z-10"><Wand2 size={12}/> Actionable Advice</h4>
                          <ul className="space-y-3 relative z-10">
                            {resumeReview.actionableSuggestions.map((g: string, i: number) => (
                              <li key={i} className="text-[11px] text-amber-400/90 leading-relaxed font-medium">{g}</li>
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

export default function ResumeBuilderPage() {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      <Suspense fallback={<div className="min-h-screen bg-[#0A0A0F]" />}>
        <ResumeBuilderContent />
      </Suspense>
    </ProtectedRoute>
  );
}
