'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Send, User, Target, Award, Calendar, RefreshCcw, 
  Copy, PanelLeftClose, PanelLeftOpen, MessageSquare, Search, 
  Plus, Edit3, ShieldAlert, GraduationCap, MapPin, AlignLeft,
  Wand2, FileText, CheckCircle2, ChevronRight, PenTool, Briefcase, ArrowRight
} from 'lucide-react';
import { useStudentData } from '@/components/providers/StudentDataProvider';
import ProtectedRoute from '@/components/ProtectedRoute';

// Firebase & Engines
import { calculateProfileStrength } from '@/lib/utils/profileStrength';
import { generateAdmissionChecklist } from '@/lib/utils/checklistEngine';
import { recommendUniversities } from '@/lib/utils/recommendationEngine';
import { calculateScholarshipEligibility } from '@/lib/utils/scholarshipEngine';
import { generateDeadlineInsights } from '@/lib/utils/deadlineEngine';
import { CopilotService } from '@/lib/ai/gemini/services';
import { useAIChat, ChatMessage } from '@/hooks/useAIChat';

const QUICK_ACTIONS = [
  { icon: User, label: 'Improve Profile' },
  { icon: MapPin, label: 'Find Universities' },
  { icon: Award, label: 'Scholarships' },
  { icon: FileText, label: 'Resume' },
  { icon: PenTool, label: 'SOP' },
  { icon: Briefcase, label: 'Interview' },
  { icon: Edit3, label: 'Writing' }
];

const SUGGESTIONS = [
  "Find universities for me",
  "Improve my profile",
  "Check admission chances",
  "Recommend scholarships",
  "Plan my admission",
  "Ask anything"
];

const BOTTOM_PILLS = [
  "Explain", "Summarize", "Compare", "Generate", "Improve", "Rewrite", "Plan"
];

export default function CopilotPage() {
  const { profile, documents, uniqueApps, savedPrograms, deadlines, universities, scholarships } = useStudentData();
  const { messages, setMessages, isTyping, sendMessage, clearMessages } = useAIChat();
  const [input, setInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
        elements.push(<ul key={`ul-${key}`} className="list-disc pl-6 my-4 space-y-2 text-[15px]">{listItems}</ul>);
        listItems = [];
      }
    };

    content.split('\n').forEach((line, i) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('•') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const itemText = trimmed.replace(/^[•*\-]\s*/, '');
        listItems.push(
          <li key={`li-${i}`}>
            {formatInlineText(itemText)}
          </li>
        );
      } else {
        flushList(i);
        if (trimmed) {
          elements.push(
            <p key={`p-${i}`} className="text-[15px] leading-relaxed mb-4 last:mb-0">
              {formatInlineText(line)}
            </p>
          );
        }
      }
    });
    
    flushList(content.length);
    return elements;
  };

  if (!context) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-[#6D5DF6]/30 border-t-[#6D5DF6] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="h-screen bg-[#09090B] text-white selection:bg-[#6D5DF6]/30 font-sans flex flex-col overflow-hidden">
        
        {/* HEADER */}
        <header className="h-[72px] shrink-0 border-b border-white/5 flex items-center justify-between px-6 bg-[#111113] z-20">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 bg-[#151519] border border-white/5 hover:bg-white/5 rounded-[12px] text-gray-400 hover:text-white transition-colors">
              {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
            </button>
            <div className="flex flex-col">
              <h1 className="text-[16px] font-medium flex items-center gap-2">AI Copilot 
                <span className="px-2 py-0.5 bg-[#6D5DF6]/10 border border-[#6D5DF6]/20 text-[#6D5DF6] text-[10px] font-medium rounded-full flex items-center gap-1">
                  <Sparkles size={10} /> Gemini 2.5 Flash
                </span>
              </h1>
              <span className="text-[12px] text-gray-500">Your personal admission advisor.</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
              <input type="text" placeholder="Search conversations..." className="bg-[#151519] border border-white/5 rounded-full pl-9 pr-4 py-2 text-[12px] text-white outline-none focus:border-[#6D5DF6]/50 transition-colors w-[200px]" />
            </div>
            <button onClick={clearMessages} className="p-2 bg-[#6D5DF6] hover:bg-[#6D5DF6]/90 text-white rounded-full transition-colors" title="New Chat">
              <Plus size={18} />
            </button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          
          {/* LEFT SIDEBAR */}
          <AnimatePresence initial={false}>
            {sidebarOpen && (
              <motion.div 
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="h-full bg-[#111113] border-r border-white/5 flex flex-col shrink-0 overflow-hidden z-10"
              >
                <div className="flex-1 overflow-y-auto p-4 space-y-8 no-scrollbar w-[280px]">
                  
                  {/* Recent Chats (Mocked for UI as requested) */}
                  <div>
                    <h3 className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-3 px-2">Pinned</h3>
                    <div className="space-y-1">
                      <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] bg-[#151519] text-[13px] text-white border border-white/5">
                        <MessageSquare size={14} className="text-[#6D5DF6]" /> MIT Application Plan
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-3 px-2">Today</h3>
                    <div className="space-y-1">
                      <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] hover:bg-[#151519] text-[13px] text-gray-400 hover:text-white transition-colors">
                        <MessageSquare size={14} /> Scholarship Eligibility Check
                      </button>
                      <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] hover:bg-[#151519] text-[13px] text-gray-400 hover:text-white transition-colors">
                        <MessageSquare size={14} /> Compare Stanford vs MIT
                      </button>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div>
                    <h3 className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-3 px-2">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-2 px-1">
                      {QUICK_ACTIONS.map((action, i) => (
                        <button 
                          key={i} 
                          onClick={() => handleSend(`Help me with ${action.label.toLowerCase()}`)}
                          className="flex flex-col items-center justify-center gap-2 p-3 bg-[#151519] border border-white/5 hover:border-[#6D5DF6]/30 hover:bg-[#151519]/80 rounded-[16px] transition-all"
                        >
                          <action.icon size={16} className="text-gray-400" />
                          <span className="text-[11px] text-gray-400">{action.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CENTER CHAT AREA */}
          <div className="flex-1 flex flex-col relative bg-[#09090B]">
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              
              {messages.length === 0 ? (
                /* EMPTY STATE */
                <div className="h-full flex flex-col items-center justify-center p-8 max-w-3xl mx-auto text-center">
                  <div className="w-20 h-20 bg-[#6D5DF6]/10 rounded-[32px] flex items-center justify-center mb-8 border border-[#6D5DF6]/20">
                    <Sparkles size={32} className="text-[#6D5DF6]" />
                  </div>
                  <h2 className="text-[32px] font-medium mb-12">What would you like help with today?</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    {SUGGESTIONS.map((sug, i) => (
                      <button 
                        key={i}
                        onClick={() => handleSend(sug)}
                        className="bg-[#111113] border border-white/5 hover:border-white/20 rounded-[24px] p-6 text-left transition-all group"
                      >
                        <span className="text-[15px] font-medium text-gray-300 group-hover:text-white transition-colors">{sug}</span>
                        <div className="mt-4 w-8 h-8 rounded-full bg-[#151519] flex items-center justify-center text-gray-500 group-hover:bg-white/10 group-hover:text-white transition-colors">
                          <ArrowRight size={14} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* CHAT MESSAGES */
                <div className="max-w-4xl mx-auto pt-8 pb-40 px-4 md:px-8 space-y-8">
                  <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {msg.role === 'user' ? (
                          <div className="max-w-[70%] bg-[#151519] border border-white/5 rounded-[24px] px-6 py-4 text-[15px] text-white">
                            {msg.content}
                          </div>
                        ) : (
                          <div className="max-w-[85%] bg-transparent text-white">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-8 h-8 rounded-full bg-[#6D5DF6] flex items-center justify-center">
                                <Sparkles size={14} className="text-white" />
                              </div>
                              <span className="text-[14px] font-medium text-gray-300">EDUING Copilot</span>
                            </div>
                            <div className="pl-11">
                              {formatMessageContent(msg.content)}
                              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
                                <button className="p-1.5 text-gray-500 hover:text-white rounded-[8px] hover:bg-white/5 transition-colors"><Copy size={14} /></button>
                                <button className="p-1.5 text-gray-500 hover:text-white rounded-[8px] hover:bg-white/5 transition-colors"><RefreshCcw size={14} /></button>
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {isTyping && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                       <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-[#6D5DF6] flex items-center justify-center">
                          <Sparkles size={14} className="text-white" />
                        </div>
                        <span className="text-[14px] font-medium text-gray-300">Thinking...</span>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} className="h-4" />
                </div>
              )}
            </div>

            {/* INPUT AREA */}
            <div className="absolute bottom-0 inset-x-0 pt-10 pb-8 px-4 md:px-8 bg-gradient-to-t from-[#09090B] via-[#09090B] to-transparent pointer-events-none z-20">
              <div className="max-w-4xl mx-auto pointer-events-auto">
                
                {/* AI Quick Actions (Pills) */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mb-4 px-2">
                  {BOTTOM_PILLS.map(pill => (
                    <button 
                      key={pill} 
                      onClick={() => setInput(`${pill} `)}
                      className="px-4 py-1.5 bg-[#111113] border border-white/5 hover:border-white/20 rounded-full text-[12px] font-medium text-gray-400 hover:text-white transition-colors shrink-0"
                    >
                      {pill}
                    </button>
                  ))}
                </div>

                <div className="relative bg-[#111113] border border-white/10 rounded-[32px] p-2 shadow-[0_0_40px_rgba(0,0,0,0.5)] focus-within:border-[#6D5DF6]/50 transition-colors">
                  <div className="flex items-center">
                    <button className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-white transition-colors">
                      <Plus size={20} />
                    </button>
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                      placeholder="Ask Copilot anything..."
                      className="flex-1 bg-transparent px-2 py-4 text-[15px] outline-none text-white placeholder:text-gray-600"
                    />
                    <button 
                      onClick={() => handleSend(input)}
                      disabled={!input.trim() || isTyping}
                      className="w-10 h-10 bg-[#6D5DF6] hover:bg-[#6D5DF6]/90 disabled:bg-white/5 disabled:text-gray-600 rounded-full flex items-center justify-center transition-all text-white shrink-0 mx-1"
                    >
                      <Send size={16} className={input.trim() && !isTyping ? "translate-x-0.5" : ""} />
                    </button>
                  </div>
                </div>
                <div className="text-center mt-3">
                  <span className="text-[10px] text-gray-600">Copilot can make mistakes. Consider verifying critical admission deadlines.</span>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT PANEL - ADMISSION SNAPSHOT */}
          <div className="w-[320px] bg-[#111113] border-l border-white/5 flex flex-col shrink-0 z-10 hidden xl:flex">
            <div className="p-6 border-b border-white/5 bg-[#151519]">
              <h2 className="text-[14px] font-medium flex items-center gap-2">
                <AlignLeft size={16} className="text-[#6D5DF6]" />
                Admission Snapshot
              </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
              
              <SnapshotCard title="Profile Strength" value={`${context.profileEngine.percentage}%`} icon={User}>
                <div className="w-full h-1.5 bg-[#151519] rounded-full mt-3 overflow-hidden">
                  <div className="h-full bg-[#6D5DF6]" style={{ width: `${context.profileEngine.percentage}%` }} />
                </div>
              </SnapshotCard>

              {context.recommendations.length > 0 && (
                <SnapshotCard title="Top Match" value={`${context.recommendations[0].overallMatchScore}%`} icon={Target}>
                  <div className="text-[12px] text-gray-400 mt-2">{context.recommendations[0].university.name}</div>
                </SnapshotCard>
              )}

              {context.scholarshipsResults.length > 0 && (
                <SnapshotCard title="Scholarship Eligible" value={context.scholarshipsResults.filter(s=>s.eligibilityScore >= 70).length.toString()} icon={Award}>
                  <div className="text-[12px] text-gray-400 mt-2 truncate">{context.scholarshipsResults[0].scholarship.name}</div>
                </SnapshotCard>
              )}

              {context.deadlineInsights.criticalTasks.length > 0 ? (
                <SnapshotCard title="Critical Tasks" value={context.deadlineInsights.criticalTasks.length.toString()} icon={ShieldAlert} color="text-rose-400">
                  <div className="text-[12px] text-rose-400/80 mt-2 line-clamp-2">{context.deadlineInsights.criticalTasks[0].title}</div>
                </SnapshotCard>
              ) : (
                <SnapshotCard title="Critical Tasks" value="0" icon={CheckCircle2} color="text-emerald-400">
                  <div className="text-[12px] text-emerald-400/80 mt-2">You are all caught up!</div>
                </SnapshotCard>
              )}

            </div>
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}

function SnapshotCard({ title, value, icon: Icon, color = "text-white", children }: any) {
  return (
    <div className="bg-[#151519] border border-white/5 rounded-[20px] p-5">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2 text-gray-400">
          <Icon size={14} />
          <span className="text-[12px] font-medium">{title}</span>
        </div>
        <div className={`text-[20px] font-medium ${color}`}>{value}</div>
      </div>
      {children}
    </div>
  )
}
