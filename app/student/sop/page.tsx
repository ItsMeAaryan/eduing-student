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
      icon={<FileText size={16} />}
      themeColor="purple"
      headerActions={
        <>
          <button onClick={handleCopy} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-xs font-bold transition-all flex items-center gap-2">
            <Copy size={14} /> Copy
          </button>
          <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-xs font-bold transition-all flex items-center gap-2">
            <Download size={14} /> Export
          </button>
          <button className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-full text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-purple-500/20">
            <Save size={14} /> Save Draft
          </button>
        </>
      }
    >
      <div className="flex flex-1 h-full overflow-hidden bg-[#050505]">
        
        {/* Left Toolbar (Minimal) */}
        <div className="w-64 border-r border-white/5 bg-transparent flex flex-col z-10 shrink-0">
          <div className="p-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-6">Writing Target</h3>
            <div className="space-y-1">
              {['Formal Tone', 'Academic Focus', 'Research Focus', 'Leadership Focus'].map(mode => (
                <button 
                  key={mode} 
                  onClick={() => setGenerationMode(mode)}
                  className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-medium transition-all flex items-center gap-3 ${generationMode === mode ? 'bg-purple-500/10 text-purple-400' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}
                >
                  {generationMode === mode && <Sparkles size={14} className="shrink-0" />}
                  {mode}
                </button>
              ))}
            </div>
          </div>
          
          <div className="p-6 mt-auto">
            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-4 bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/20 text-purple-400 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.1)] disabled:opacity-50"
            >
              {isGenerating ? <div className="w-4 h-4 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" /> : <Wand2 size={16} />}
              {isGenerating ? 'Drafting...' : 'Generate AI SOP'}
            </button>
          </div>
        </div>

        {/* Center Canvas (Medium-style Editor) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex justify-center relative">
          <div className="w-full max-w-[700px] py-16 px-8 relative z-10">
            
            {sopSections.length === 0 && !isGenerating && !generationError && (
              <div className="h-full flex items-center justify-center flex-col text-white/20 mt-32">
                <LayoutTemplate size={64} className="mb-6 opacity-30" />
                <h2 className="text-2xl font-serif mb-2">Blank Canvas</h2>
                <p className="text-sm font-sans">Generate a personalized draft to start writing.</p>
              </div>
            )}

            {generationError && (
              <div className="h-full flex items-center justify-center flex-col text-red-500/80 mt-32">
                <AlertCircle size={64} className="mb-6 opacity-50" />
                <h2 className="text-2xl font-serif mb-2">Generation Failed</h2>
                <p className="text-sm font-sans">{generationError}</p>
              </div>
            )}
            
            {isGenerating && (
              <div className="h-full flex items-center justify-center flex-col mt-32">
                 <div className="w-16 h-16 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-[spin_1.5s_linear_infinite] mb-8 relative">
                   <div className="absolute inset-2 border-2 border-purple-400/40 border-l-purple-400 rounded-full animate-[spin_2s_linear_infinite_reverse]" />
                 </div>
                 <p className="text-purple-400 font-serif text-xl animate-pulse">Drafting your narrative...</p>
              </div>
            )}

            {!isGenerating && sopSections.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 pb-32">
                
                <input 
                  type="text" 
                  value={sopTitle}
                  onChange={(e) => setSopData({ ...sopData, title: e.target.value })}
                  className="w-full bg-transparent text-4xl lg:text-5xl font-serif text-white outline-none border-b border-transparent focus:border-white/10 pb-4 transition-all placeholder:text-white/20"
                  placeholder="Statement of Purpose"
                />
                
                <div className="space-y-8">
                  {sopSections.map((section: any, idx: number) => (
                    <div key={idx} className="group relative">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-white/40">
                          {idx + 1}
                        </div>
                        <h4 className="text-sm font-sans font-bold text-purple-400/80 uppercase tracking-widest">
                          {section.heading}
                        </h4>
                      </div>
                      
                      <textarea 
                        value={section.content}
                        onChange={(e) => handleUpdateSection(idx, e.target.value)}
                        className="w-full bg-transparent text-lg lg:text-[21px] leading-[1.8] font-serif text-white/90 outline-none resize-none min-h-[150px] placeholder:text-white/20"
                        style={{ height: `${Math.max(150, section.content.split('\\n').length * 36)}px` }}
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
        <div className="w-80 border-l border-white/5 bg-[#08080C] flex flex-col shrink-0 z-10">
          <div className="flex border-b border-white/5">
             <button onClick={() => setActiveTab('write')} className={`flex-1 py-5 text-[11px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'write' ? 'text-purple-400' : 'text-white/40 hover:text-white'}`}>
               Assist
               {activeTab === 'write' && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-purple-500" />}
             </button>
             <button onClick={() => setActiveTab('review')} className={`flex-1 py-5 text-[11px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'review' ? 'text-purple-400' : 'text-white/40 hover:text-white'}`}>
               Review
               {activeTab === 'review' && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-purple-500" />}
             </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {activeTab === 'write' && (
              <div className="space-y-6">
                <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                  <h4 className="text-xs font-bold mb-3 flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-400"/> Profile Alignment</h4>
                  <p className="text-xs text-white/60 leading-relaxed mb-4">Ensure your SOP covers all your reported achievements from your EDUING profile.</p>
                  <div className="w-full bg-white/10 rounded-full h-1.5 mb-2 overflow-hidden"><div className="bg-emerald-500 h-full rounded-full" style={{width: '75%'}}/></div>
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-emerald-400">Good</span>
                    <span className="text-white/40">75% Data Utilized</span>
                  </div>
                </div>

                <button onClick={handleReview} disabled={isReviewing || sopSections.length === 0} className="w-full py-4 bg-[#111114] hover:bg-[#1A1A24] border border-white/10 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                  {isReviewing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <MessageSquareText size={16} />}
                  Run AI Review
                </button>
              </div>
            )}

            {activeTab === 'review' && (
              <div className="space-y-6">
                {!sopReview && !isReviewing && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/20 text-purple-400">
                      <LayoutTemplate size={24} />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-2">No Review Found</h3>
                    <p className="text-xs text-white/40">Run AI Review from the Assist tab to get feedback.</p>
                  </div>
                )}
                
                {isReviewing && (
                  <div className="text-center py-12">
                     <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
                     <p className="text-xs text-purple-400 font-bold">Analyzing document...</p>
                  </div>
                )}

                {sopReview && !isReviewing && (
                  <AnimatePresence>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                      
                      <div className="flex items-center gap-5 bg-[#111114] p-5 rounded-3xl border border-white/5">
                        <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                          <span className="text-2xl font-display font-black text-purple-400">{sopReview.overallScore}</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white mb-1">Overall Score</h4>
                          <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Out of 100</p>
                        </div>
                      </div>

                      {sopReview.strengths && sopReview.strengths.length > 0 && (
                        <div>
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-3 flex items-center gap-2">
                            <CheckCircle2 size={12} /> Narrative Strengths
                          </h4>
                          <ul className="space-y-3">
                            {sopReview.strengths.map((s: string, i: number) => (
                              <li key={i} className="text-xs text-white/70 flex items-start gap-3 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0"/>
                                <span className="leading-relaxed">{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {sopReview.weaknesses && sopReview.weaknesses.length > 0 && (
                        <div>
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-rose-400 mb-3 flex items-center gap-2">
                            <AlertCircle size={12} /> Areas to Improve
                          </h4>
                          <ul className="space-y-3">
                            {sopReview.weaknesses.map((w: string, i: number) => (
                              <li key={i} className="text-xs text-white/70 flex items-start gap-3 bg-rose-500/5 p-3 rounded-xl border border-rose-500/10">
                                <div className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-1.5 shrink-0"/>
                                <span className="leading-relaxed">{w}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {sopReview.grammarSuggestions && sopReview.grammarSuggestions.length > 0 && (
                        <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl relative overflow-hidden">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-4 flex items-center gap-2 relative z-10"><Wand2 size={12}/> Editor Notes</h4>
                          <ul className="space-y-3 relative z-10">
                            {sopReview.grammarSuggestions.map((g: string, i: number) => (
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

export default function SOPBuilderPage() {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      <Suspense fallback={<div className="min-h-screen bg-[#0A0A0F]" />}>
        <SOPBuilderContent />
      </Suspense>
    </ProtectedRoute>
  );
}
