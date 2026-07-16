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

function SOPBuilderContent() {
  const { profile, documents, uniqueApps, savedPrograms, universities } = useStudentData();
  
  // UI State
  const [activeTab, setActiveTab] = useState<'write' | 'review'>('write');
  const [generationMode, setGenerationMode] = useState('Formal Tone');
  
  // SOP State
  const { data: sopData, setData: setSopData, isGenerating, generate: generateSOP, error: generationError } = useAIGeneration<any>();
  const sopSections = sopData?.sections || [];
  const sopTitle = sopData?.title || 'My Statement of Purpose';
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
      title="AI SOP Builder"
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
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3">Generation Mode</h3>
            <div className="space-y-2">
              {['Formal Tone', 'Academic Focus', 'Research Focus', 'Leadership Focus'].map(mode => (
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
            {isGenerating ? 'Generating...' : 'Generate AI SOP'}
          </button>

          <div className="pt-6 border-t border-white/5">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3">Saved Templates</h3>
            <div className="text-xs text-white/30 italic">No saved templates yet.</div>
          </div>
        </>
      }
      centerPanel={
        <>
            {sopSections.length === 0 && !isGenerating && !generationError && (
              <div className="text-center py-24">
                <LayoutTemplate size={48} className="text-white/10 mx-auto mb-4" />
                <h2 className="text-xl font-black text-white/60 mb-2">Blank Canvas</h2>
                <p className="text-white/40 text-sm max-w-sm mx-auto">Click Generate AI SOP on the left to create a personalized draft based on your EDUING profile.</p>
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
                 <p className="text-indigo-400 font-bold animate-pulse">Gemini is drafting your SOP...</p>
                 <p className="text-xs text-white/40">Gathering profile achievements, resolving templates, and applying formal tone.</p>
              </div>
            )}

            {!isGenerating && sopSections.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-24">
                <input 
                  type="text" 
                  value={sopTitle}
                  onChange={(e) => setSopData({ ...sopData, title: e.target.value })}
                  className="w-full bg-transparent text-3xl font-black text-white outline-none border-b border-transparent focus:border-white/10 pb-2 transition-all"
                />
                
                <div className="space-y-6">
                  {sopSections.map((section: any, idx: number) => (
                    <div key={idx} className="group relative">
                      <h4 className="text-sm font-black text-indigo-400 mb-2 uppercase tracking-widest flex items-center gap-2">
                        {section.heading}
                        <button className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-white transition-opacity"><FileEdit size={12} /></button>
                      </h4>
                      <textarea 
                        value={section.content}
                        onChange={(e) => handleUpdateSection(idx, e.target.value)}
                        className="w-full bg-white/[0.02] hover:bg-white/[0.04] focus:bg-white/[0.05] border border-white/5 focus:border-indigo-500/30 rounded-xl p-4 text-[15px] leading-relaxed text-white/80 outline-none transition-all resize-none min-h-[120px]"
                      />
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
             <button onClick={() => setActiveTab('review')} className={`flex-1 py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'review' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-white/40 hover:text-white'}`}>Review</button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {activeTab === 'write' && (
              <div className="space-y-6">
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                  <h4 className="text-xs font-bold mb-2 flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-400"/> Profile Alignment</h4>
                  <p className="text-[11px] text-white/60 leading-relaxed mb-3">Ensure your SOP covers all your reported achievements from your EDUING profile to maximize impact.</p>
                  <div className="w-full bg-white/10 rounded-full h-1.5 mb-1"><div className="bg-emerald-500 h-full rounded-full" style={{width: '75%'}}/></div>
                  <div className="text-right text-[10px] text-white/40 font-bold">75% Data Utilized</div>
                </div>

                <button onClick={handleReview} disabled={isReviewing || sopSections.length === 0} className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                  {isReviewing ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <MessageSquareText size={14} />}
                  Run AI Review
                </button>
              </div>
            )}

            {activeTab === 'review' && (
              <div className="space-y-6">
                {!sopReview && !isReviewing && (
                  <div className="text-center py-12">
                    <p className="text-xs text-white/40">Run AI Review from the Assist tab to get feedback on your draft.</p>
                  </div>
                )}
                {isReviewing && (
                  <div className="text-center py-12">
                     <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
                     <p className="text-xs text-indigo-400 font-bold">Analyzing document...</p>
                  </div>
                )}
                {sopReview && !isReviewing && (
                  <AnimatePresence>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                      <div className="flex items-center gap-4 bg-[#111114] p-4 rounded-2xl border border-white/5">
                        <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/20">
                          <span className="text-lg font-black text-indigo-400">{sopReview.overallScore}</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-black">Overall Score</h4>
                          <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Out of 100</p>
                        </div>
                      </div>

                      {sopReview.strengths && sopReview.strengths.length > 0 && (
                        <div>
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-3">Strengths</h4>
                          <ul className="space-y-2">
                            {sopReview.strengths.map((s: string, i: number) => (
                              <li key={i} className="text-xs text-white/70 flex items-start gap-2"><div className="w-1 h-1 bg-emerald-500 rounded-full mt-1.5 shrink-0"/>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {sopReview.weaknesses && sopReview.weaknesses.length > 0 && (
                        <div>
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-rose-400 mb-3">Areas to Improve</h4>
                          <ul className="space-y-2">
                            {sopReview.weaknesses.map((w: string, i: number) => (
                              <li key={i} className="text-xs text-white/70 flex items-start gap-2"><div className="w-1 h-1 bg-rose-500 rounded-full mt-1.5 shrink-0"/>{w}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {sopReview.grammarSuggestions && sopReview.grammarSuggestions.length > 0 && (
                        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-3 flex items-center gap-2"><AlertCircle size={12}/> Grammar &amp; Clarity</h4>
                          <ul className="space-y-2">
                            {sopReview.grammarSuggestions.map((g: string, i: number) => (
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

export default function SOPBuilderPage() {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      <Suspense fallback={<div className="min-h-screen bg-[#0A0A0F]" />}>
        <SOPBuilderContent />
      </Suspense>
    </ProtectedRoute>
  );
}
