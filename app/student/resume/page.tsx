'use client';

import React, { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudentData } from '@/components/providers/StudentDataProvider';
import ProtectedRoute from '@/components/ProtectedRoute';

import { ResumeService } from '@/lib/ai/gemini/services';
import { calculateProfileStrength } from '@/lib/utils/profileStrength';

import { Sparkles, FileText, CheckCircle2, AlertCircle, Wand2, Download, Copy, Save, LayoutTemplate, MessageSquareText, FileEdit, GripVertical } from 'lucide-react';

function ResumeBuilderContent() {
  const { profile, documents } = useStudentData();
  
  // UI State
  const [activeTab, setActiveTab] = useState<'write' | 'review'>('write');
  const [generationMode, setGenerationMode] = useState('Professional Resume');
  
  // Resume State
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [resumeSections, setResumeSections] = useState<{heading: string, content: string}[]>([]);
  const [resumeReview, setResumeReview] = useState<any>(null);

  const handleGenerate = async () => {
    if (!profile) return;
    setIsGenerating(true);
    setResumeReview(null);
    try {
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

      const res = await ResumeService.generateResume(aiContext, generationMode);
      if (res.success && res.data) {
        setResumeSections(res.data.sections || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReview = async () => {
    if (resumeSections.length === 0) return;
    setIsReviewing(true);
    setActiveTab('review');
    try {
      const resumeContentText = resumeSections.map(s => `${s.heading}\n${s.content}`).join('\n\n');
      const aiContext = { studentProfile: profile };
      const res = await ResumeService.reviewResume(resumeContentText, aiContext);
      if (res.success && res.data) {
        setResumeReview(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsReviewing(false);
    }
  };

  const handleCopy = () => {
    const text = resumeSections.map(s => `${s.heading}\n${s.content}`).join('\n\n');
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard');
  };

  const handleUpdateSection = (index: number, content: string) => {
    const newSections = [...resumeSections];
    newSections[index].content = content;
    setResumeSections(newSections);
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const newSections = [...resumeSections];
      const temp = newSections[index - 1];
      newSections[index - 1] = newSections[index];
      newSections[index] = temp;
      setResumeSections(newSections);
    } else if (direction === 'down' && index < resumeSections.length - 1) {
      const newSections = [...resumeSections];
      const temp = newSections[index + 1];
      newSections[index + 1] = newSections[index];
      newSections[index] = temp;
      setResumeSections(newSections);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col h-screen overflow-hidden">
      {/* Top Navbar */}
      <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#0A0A0F] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400">
            <FileText size={16} />
          </div>
          <div>
            <h1 className="text-sm font-black">AI Resume Builder</h1>
            <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest flex items-center gap-1">
              <Sparkles size={10} className="text-indigo-400" /> Powered by Gemini
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleCopy} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold transition-all flex items-center gap-2">
            <Copy size={14} /> Copy Text
          </button>
          <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold transition-all flex items-center gap-2">
            <Download size={14} /> Export PDF
          </button>
          <button className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20">
            <Save size={14} /> Save Draft
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Controls */}
        <div className="w-64 border-r border-white/5 bg-[#08080C] p-4 flex flex-col gap-6 overflow-y-auto shrink-0">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3">Target Resume</h3>
            <div className="space-y-2">
              {['Professional Resume', 'Academic Resume', 'Internship Resume', 'Research Resume', 'Placement Resume'].map(mode => (
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
        </div>

        {/* Center Panel - Editor */}
        <div className="flex-1 bg-[#050505] overflow-y-auto p-8 lg:p-12">
          <div className="max-w-3xl mx-auto space-y-8">
            {resumeSections.length === 0 && !isGenerating && (
              <div className="text-center py-24">
                <LayoutTemplate size={48} className="text-white/10 mx-auto mb-4" />
                <h2 className="text-xl font-black text-white/60 mb-2">Blank Canvas</h2>
                <p className="text-white/40 text-sm max-w-sm mx-auto">Select a target resume type and click Generate to create a personalized draft based on your EDUING profile.</p>
              </div>
            )}
            
            {isGenerating && (
              <div className="text-center py-24 space-y-4">
                 <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
                 <p className="text-indigo-400 font-bold animate-pulse">Gemini is drafting your Resume...</p>
                 <p className="text-xs text-white/40">Compiling experience, projects, and optimizing format for ATS.</p>
              </div>
            )}

            {!isGenerating && resumeSections.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-24">
                <div className="text-center mb-8">
                   <h2 className="text-3xl font-black">{profile?.firstName} {profile?.lastName}</h2>
                   <p className="text-white/60 mt-2">{profile?.email} {profile?.phone ? `• ${profile.phone}` : ''}</p>
                </div>
                
                {resumeSections.map((section, idx) => (
                  <div key={idx} className="group relative bg-[#111114] border border-white/5 hover:border-white/10 rounded-2xl p-6 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                        {section.heading}
                        <button className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-white transition-opacity"><FileEdit size={12} /></button>
                      </h4>
                      <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                         <button onClick={() => moveSection(idx, 'up')} className="p-1 text-white/40 hover:text-white hover:bg-white/10 rounded"><GripVertical size={14}/></button>
                         <button onClick={() => moveSection(idx, 'down')} className="p-1 text-white/40 hover:text-white hover:bg-white/10 rounded"><GripVertical size={14}/></button>
                      </div>
                    </div>
                    <textarea 
                      value={section.content}
                      onChange={(e) => handleUpdateSection(idx, e.target.value)}
                      className="w-full bg-transparent text-[15px] leading-relaxed text-white/80 outline-none resize-none min-h-[100px]"
                    />
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </div>

        {/* Right Panel - AI Review */}
        <div className="w-80 border-l border-white/5 bg-[#08080C] flex flex-col shrink-0">
          <div className="flex border-b border-white/5">
             <button onClick={() => setActiveTab('write')} className={`flex-1 py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'write' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-white/40 hover:text-white'}`}>Assist</button>
             <button onClick={() => setActiveTab('review')} className={`flex-1 py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'review' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-white/40 hover:text-white'}`}>Review</button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'write' && (
              <div className="space-y-6">
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                  <h4 className="text-xs font-bold mb-2 flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-400"/> Profile Utilization</h4>
                  <p className="text-[11px] text-white/60 leading-relaxed mb-3">Ensure your resume covers all your reported achievements from your EDUING profile to maximize impact.</p>
                  <div className="w-full bg-white/10 rounded-full h-1.5 mb-1"><div className="bg-emerald-500 h-full rounded-full" style={{width: '90%'}}/></div>
                  <div className="text-right text-[10px] text-white/40 font-bold">90% Data Utilized</div>
                </div>

                <button onClick={handleReview} disabled={isReviewing || resumeSections.length === 0} className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                  {isReviewing ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <MessageSquareText size={14} />}
                  Run AI Review
                </button>
              </div>
            )}

            {activeTab === 'review' && (
              <div className="space-y-6">
                {!resumeReview && !isReviewing && (
                  <div className="text-center py-12">
                    <p className="text-xs text-white/40">Run AI Review from the Assist tab to get feedback on your draft.</p>
                  </div>
                )}
                {isReviewing && (
                  <div className="text-center py-12">
                     <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
                     <p className="text-xs text-indigo-400 font-bold">Analyzing ATS compatibility...</p>
                  </div>
                )}
                {resumeReview && !isReviewing && (
                  <AnimatePresence>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#111114] p-4 rounded-2xl border border-white/5 text-center">
                          <span className="text-2xl font-black text-indigo-400">{resumeReview.overallScore}</span>
                          <h4 className="text-[10px] text-white/40 uppercase font-bold tracking-widest mt-1">Overall</h4>
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
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-rose-400 mb-3">Weak Bullets Detected</h4>
                          <ul className="space-y-2">
                            {resumeReview.weakBulletPoints.map((w: string, i: number) => (
                              <li key={i} className="text-xs text-white/70 flex items-start gap-2"><div className="w-1 h-1 bg-rose-500 rounded-full mt-1.5 shrink-0"/>{w}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {resumeReview.missingSections && resumeReview.missingSections.length > 0 && (
                        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-3 flex items-center gap-2"><AlertCircle size={12}/> Missing Information</h4>
                          <ul className="space-y-2">
                            {resumeReview.missingSections.map((g: string, i: number) => (
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
        </div>
      </div>
    </div>
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
