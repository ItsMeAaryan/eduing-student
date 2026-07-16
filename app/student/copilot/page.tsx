'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, User, ChevronRight, FileText, Target, Award, Calendar, RefreshCcw, Copy, Trash2, ArrowRight } from 'lucide-react';
import { useStudentData } from '@/components/providers/StudentDataProvider';
import ProtectedRoute from '@/components/ProtectedRoute';
import { AIWorkspaceLayout } from '@/components/ai/AIWorkspaceLayout';
import { AIContextCard } from '@/components/ai/AIContextCard';

// Firebase & Engines
import { calculateProfileStrength } from '@/lib/utils/profileStrength';
import { generateAdmissionChecklist } from '@/lib/utils/checklistEngine';
import { recommendUniversities } from '@/lib/utils/recommendationEngine';
import { calculateScholarshipEligibility } from '@/lib/utils/scholarshipEngine';
import { generateDeadlineInsights } from '@/lib/utils/deadlineEngine';
import { CopilotService } from '@/lib/ai/gemini/services';
import { useAIChat, ChatMessage } from '@/hooks/useAIChat';

const SUGGESTED_TOPICS = [
  "How can I improve my admission chances?",
  "Why is this university recommended?",
  "Explain my scholarship eligibility.",
  "Which applications should I prioritize?",
];

export default function CopilotPage() {
  const { profile, documents, uniqueApps, savedPrograms, deadlines, universities, scholarships } = useStudentData();
  const { messages, setMessages, isTyping, sendMessage, clearMessages } = useAIChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Compute Engines
  const context = useMemo(() => {
    if (!profile) return null;
    const profileEngine = calculateProfileStrength(profile, documents || []);
    const checklist = generateAdmissionChecklist({ profile, documents: documents || [], applications: uniqueApps || [], savedPrograms: savedPrograms || [], deadlines: deadlines || [] });
    const recommendations = recommendUniversities(universities, { profile, documents: documents || [], applications: uniqueApps || [], savedPrograms: savedPrograms || [], profileScore: profileEngine.percentage });
    const scholarshipsResults = calculateScholarshipEligibility({ profile, documents: documents || [], profileScore: profileEngine.percentage }, scholarships);
    const deadlineInsights = generateDeadlineInsights({ deadlines: deadlines || [], applications: uniqueApps || [], documents: documents || [], profileScore: profileEngine.percentage });

    return {
      profileEngine,
      checklist,
      recommendations,
      scholarshipsResults,
      deadlineInsights
    };
  }, [profile, documents, uniqueApps, savedPrograms, deadlines, universities, scholarships]);

  // Initial Welcome
  useEffect(() => {
    if (profile && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `Hi ${profile.firstName || 'Student'} 👋\n\nI'm your EDUING AI Copilot.\n\nI can help you discover universities, improve your admission chances, understand scholarships, prepare documents, compare colleges, and guide you through every step of your admission journey.`,
        timestamp: new Date()
      }]);
    }
  }, [profile, messages.length, setMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim() || !context) return;
    
    setInput('');
    await sendMessage(text, async (msgText) => {
      const aiContext = {
        studentName: profile?.firstName,
        profileStrength: context.profileEngine.percentage,
        missingProfileFields: context.profileEngine.missingFields,
        topChecklistTasks: context.checklist.tasks.filter(t => t.priority === 'Critical' || t.priority === 'High').map(t => t.title),
        topRecommendations: context.recommendations.slice(0, 3).map(r => r.university.name),
        topScholarships: context.scholarshipsResults.slice(0, 2).map(s => s.scholarship.name),
        urgentDeadlines: context.deadlineInsights.criticalTasks.map(d => d.title)
      };
      const response = await CopilotService.processChat(msgText, aiContext);
      return response;
    });
  };

  const formatInlineText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-white">{part.slice(2, -2)}</strong>;
      }
      return <React.Fragment key={i}>{part}</React.Fragment>;
    });
  };

  const formatMessageContent = (content: string) => {
    let inList = false;
    const elements: React.ReactNode[] = [];
    let listItems: React.ReactNode[] = [];

    const flushList = (key: number) => {
      if (listItems.length > 0) {
        elements.push(<ul key={`ul-${key}`} className="list-disc my-2">{listItems}</ul>);
        listItems = [];
      }
    };

    content.split('\n').forEach((line, i) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('•') || trimmed.startsWith('- ')) {
        const itemText = trimmed.replace(/^[•-]\s*/, '');
        listItems.push(
          <li key={`li-${i}`} className="ml-4 mb-1">
            {formatInlineText(itemText)}
          </li>
        );
      } else {
        flushList(i);
        if (trimmed) {
          elements.push(
            <div key={`p-${i}`} className={elements.length > 0 ? "mt-2" : ""}>
              {formatInlineText(line)}
            </div>
          );
        } else {
          // Empty line, could just push a spacer if needed
          elements.push(<div key={`br-${i}`} className="h-2" />);
        }
      }
    });
    
    flushList(content.length);
    return elements;
  };

  if (!context) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <AIWorkspaceLayout
        title="AI Copilot"
        icon={<Sparkles size={16} />}
        leftPanel={
          <>
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3 px-2">Suggested Topics</h3>
              <div className="space-y-1">
                {SUGGESTED_TOPICS.map((topic, i) => (
                  <button 
                    key={i}
                    onClick={() => handleSend(topic)}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/5 text-[12px] font-medium text-white/60 hover:text-white transition-colors"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3 px-2">Quick Actions</h3>
              <div className="space-y-2">
                <button onClick={() => handleSend("Improve My Profile")} className="w-full flex items-center gap-3 px-3 py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-xl text-xs font-bold transition-colors border border-indigo-500/10">
                  <User size={14} /> Improve Profile
                </button>
                <button onClick={() => handleSend("Recommend Universities")} className="w-full flex items-center gap-3 px-3 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold transition-colors border border-emerald-500/10">
                  <Target size={14} /> Find Universities
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5">
              <button 
                onClick={clearMessages}
                className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-white/40 hover:text-white transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCcw size={14} /> Clear Conversation
              </button>
            </div>
          </>
        }
        centerPanel={
          <>
            <div className="flex-1 w-full space-y-8 mt-10 pb-32">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] rounded-[24px] p-5 ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-br-sm' 
                        : 'bg-[#14141A] border border-white/5 text-white/90 rounded-bl-sm'
                    }`}>
                      {msg.role === 'assistant' && (
                        <div className="flex items-center gap-2 mb-3 text-indigo-400 text-xs font-bold">
                          <Sparkles size={14} /> Copilot
                        </div>
                      )}
                      <div className="text-[14px] leading-relaxed font-medium">
                        {formatMessageContent(msg.content)}
                      </div>
                      
                      {msg.role === 'assistant' && (
                        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-white/5">
                          <button className="text-white/30 hover:text-white transition-colors"><Copy size={12} /></button>
                          <button className="text-white/30 hover:text-white transition-colors"><RefreshCcw size={12} /></button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="bg-[#14141A] border border-white/5 rounded-[24px] rounded-bl-sm p-5 flex gap-2 items-center">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="absolute bottom-0 inset-x-0 p-4 md:p-8 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent pointer-events-none">
              <div className="max-w-3xl mx-auto relative pointer-events-auto">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                  placeholder="Ask about your admission journey..."
                  className="w-full bg-[#111114] border border-white/10 rounded-full pl-6 pr-14 py-4 text-sm focus:border-indigo-500/50 outline-none transition-all text-white placeholder:text-white/30 shadow-2xl"
                />
                <button 
                  onClick={() => handleSend(input)}
                  disabled={!input.trim() || isTyping}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 hover:bg-indigo-500 disabled:bg-white/5 disabled:text-white/20 rounded-full flex items-center justify-center transition-all text-white"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </>
        }
        rightPanel={
          <>
            <div className="p-6 border-b border-white/5">
              <h2 className="text-sm font-black text-white/80">Active Context</h2>
              <p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest">Auto-synced with Engines</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
              {/* Profile Strength */}
              <AIContextCard
                title="Profile"
                icon={User}
                value={`${context.profileEngine.percentage}%`}
                progress={context.profileEngine.percentage}
              />

              {/* Top Checklist */}
              <AIContextCard
                title="Priorities"
                icon={FileText}
                valueColor="text-emerald-400"
              >
                {context.checklist.tasks.filter((t: any) => t.priority === 'Critical' || t.priority === 'High').slice(0, 3).map((t: any, i: number) => (
                  <div key={i} className="text-[11px] text-white/60 truncate flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    {t.title}
                  </div>
                ))}
                {context.checklist.tasks.length === 0 && <div className="text-[11px] text-white/40">No critical tasks.</div>}
              </AIContextCard>

              {/* Top Recommendations */}
              <AIContextCard
                title="Matches"
                icon={Target}
                valueColor="text-amber-400"
              >
                {context.recommendations.slice(0, 3).map((r: any, i: number) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-[11px] text-white/60 truncate max-w-[150px]">{r.university.name}</span>
                    <span className="text-[10px] font-bold text-amber-400">{r.overallMatchScore}%</span>
                  </div>
                ))}
              </AIContextCard>

              {/* Scholarships */}
              <AIContextCard
                title="Scholarships"
                icon={Award}
                valueColor="text-rose-400"
              >
                {context.scholarshipsResults.filter(s => s.eligibilityScore >= 60).slice(0, 2).map((s, i) => (
                  <div key={i} className="text-[11px] text-white/60 truncate">
                    {s.scholarship.name}
                  </div>
                ))}
              </AIContextCard>
            </div>
          </>
        }
      />
    </ProtectedRoute>
  );
}
