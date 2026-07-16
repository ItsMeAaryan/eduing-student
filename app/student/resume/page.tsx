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
      title="AI Resume Builder"
      icon={<FileText size={16} />}
      headerActions={
        <>
          <button onClick={handleCopy} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold transition-all flex items-center gap-2">
            <Copy size={14} /> Copy Text
          </button>
          <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold transition-all flex items-center gap-2">
            <Download size={14} /> Export PDF
          </button>
          <button className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20">
            <Save size={14} /> Save Draft
          </button>
        </>
      }
      leftPanel={
        <>
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3">Target Profile</h3>
            <div className="space-y-2">
              {['Academic (MS/PhD)', 'Software Engineering Internship', 'Research Assistant', 'Management Consulting'].map(mode => (
                <button 
                  key={mode} 
                  onClick={() => setGenerationMode(mode)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all ${generationMode === mode ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-white/60 hover:bg-white/5 border border-transparent'}`}
                >
                  {mode}
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
            {isGenerating ? 'Generating...' : 'Generate Resume'}
          </button>
        </>
      }
      centerPanel={
        <>
            {resumeSections.length === 0 && !isGenerating && !generationError && (
              <div className="text-center py-24">
                <LayoutTemplate size={48} className="text-white/10 mx-auto mb-4" />
                <h2 className="text-xl font-black text-white/60 mb-2">Blank Canvas</h2>
                <p className="text-white/40 text-sm max-w-sm mx-auto">Click Generate Resume on the left to create a customized ATS-friendly resume using your EDUING profile.</p>
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
                 <p className="text-indigo-400 font-bold animate-pulse">Gemini is structuring your Resume...</p>
              </div>
            )}

            {!isGenerating && resumeSections.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-24">
                {profile && (
                  <div className="text-center mb-8 pb-8 border-b border-white/10">
                    <h2 className="text-3xl font-black text-white mb-2">{profile.firstName} {profile.lastName}</h2>
                    <p className="text-sm text-white/60 font-medium">
                      {profile.email} • {profile.phone || '+91 XXXXX XXXXX'} • {profile.location || 'India'}
                    </p>
                  </div>
                )}
                
                <div className="space-y-4">
                  {resumeSections.map((section: any, idx: number) => (
                    <div 
                      key={idx} 
                      className="group relative bg-[#111114] border border-white/5 hover:border-white/10 rounded-2xl p-6 transition-all"
                      draggable
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, idx)}
                    >
                      <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing text-white/20 hover:text-white/60 p-2 transition-all">
                        <GripVertical size={16} />
                      </div>
                      
                      <div className="pl-6">
                        <div className="flex items-center justify-between mb-4">
                          <input 
                            type="text"
                            value={section.heading}
                            onChange={(e) => handleUpdateSection(idx, 'heading', e.target.value)}
                            className="bg-transparent text-sm font-black text-indigo-400 uppercase tracking-widest outline-none border-b border-transparent focus:border-indigo-500/50 pb-1 transition-all"
                          />
                          <button className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-white transition-opacity"><FileEdit size={14} /></button>
                        </div>
                        <textarea 
                          value={section.content}
                          onChange={(e) => handleUpdateSection(idx, 'content', e.target.value)}
                          className="w-full bg-transparent text-[14px] leading-relaxed text-white/90 outline-none resize-none min-h-[100px] font-mono"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
        </>
      }
      rightPanel={
        <>
          <div className="flex border-b border-white/5">
             <button onClick={() => setActiveTab('write')} className={`flex-1 py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'write' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-white/40 hover:text-white'}`}>Assist</button>
             <button onClick={() => setActiveTab('review')} className={`flex-1 py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'review' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-white/40 hover:text-white'}`}>ATS Review</button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {activeTab === 'write' && (
              <div className="space-y-6">
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                  <h4 className="text-xs font-bold mb-2 flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-400"/> Profile Utilization</h4>
                  <p className="text-[11px] text-white/60 leading-relaxed mb-3">Ensure your Resume includes all relevant projects and skills from your EDUING profile.</p>
                  <div className="w-full bg-white/10 rounded-full h-1.5 mb-1"><div className="bg-emerald-500 h-full rounded-full" style={{width: '90%'}}/></div>
                  <div className="text-right text-[10px] text-white/40 font-bold">90% Data Utilized</div>
                </div>

                <button onClick={handleReview} disabled={isReviewing || resumeSections.length === 0} className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                  {isReviewing ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <MessageSquareText size={14} />}
                  Run ATS Simulator
                </button>
              </div>
            )}

            {activeTab === 'review' && (
              <div className="space-y-6">
                {!resumeReview && !isReviewing && !reviewError && (
                  <div className="text-center py-12">
                    <p className="text-xs text-white/40">Run ATS Simulator from the Assist tab to get feedback.</p>
                  </div>
                )}
                {reviewError && (
                  <div className="text-center py-12">
                    <AlertCircle size={32} className="text-rose-500 mx-auto mb-4" />
                    <p className="text-xs text-rose-400 font-bold">{reviewError}</p>
                  </div>
                )}
                {isReviewing && (
                  <div className="text-center py-12">
                     <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
                     <p className="text-xs text-indigo-400 font-bold">Simulating ATS Parsing...</p>
                  </div>
                )}
                {resumeReview && !isReviewing && (
                  <AnimatePresence>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#111114] p-4 rounded-2xl border border-white/5 text-center">
                          <span className="text-2xl font-black text-indigo-400">{resumeReview.overallScore}</span>
                          <h4 className="text-[10px] text-white/40 uppercase font-bold tracking-widest mt-1">Impact Score</h4>
                        </div>
                        <div className="bg-[#111114] p-4 rounded-2xl border border-white/5 text-center">
                          <span className="text-2xl font-black text-emerald-400">{resumeReview.atsScore}</span>
                          <h4 className="text-[10px] text-white/40 uppercase font-bold tracking-widest mt-1">ATS Score</h4>
                        </div>
                      </div>

                      {resumeReview.strengths && resumeReview.strengths.length > 0 && (
                        <div>
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-3">Strengths</h4>
                          <ul className="space-y-2">
                            {resumeReview.strengths.map((s: string, i: number) => (
                              <li key={i} className="text-xs text-white/70 flex items-start gap-2"><div className="w-1 h-1 bg-emerald-500 rounded-full mt-1.5 shrink-0"/>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {resumeReview.weakBulletPoints && resumeReview.weakBulletPoints.length > 0 && (
                        <div>
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-rose-400 mb-3">Weak Bullet Points</h4>
                          <ul className="space-y-2">
                            {resumeReview.weakBulletPoints.map((w: string, i: number) => (
                              <li key={i} className="text-xs text-white/70 flex items-start gap-2"><div className="w-1 h-1 bg-rose-500 rounded-full mt-1.5 shrink-0"/>{w}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {resumeReview.actionableSuggestions && resumeReview.actionableSuggestions.length > 0 && (
                        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-3 flex items-center gap-2"><AlertCircle size={12}/> Improvements</h4>
                          <ul className="space-y-2">
                            {resumeReview.actionableSuggestions.map((g: string, i: number) => (
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

export default function ResumeBuilderPage() {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      <Suspense fallback={<div className="min-h-screen bg-[#0A0A0F]" />}>
        <ResumeBuilderContent />
      </Suspense>
    </ProtectedRoute>
  );
}
