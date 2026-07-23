'use client'
import React, { useState, useEffect, useRef, useMemo } from 'react'
import {
  Sparkles, Send, User, MapPin, Award, FileText, PenTool, Briefcase, Edit3,
  MoreHorizontal, SlidersHorizontal, Download, AlignLeft, RefreshCcw, Copy
} from 'lucide-react'
import { useStudentData } from '@/components/providers/StudentDataProvider'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAIChat } from '@/hooks/useAIChat'
import { CopilotService } from '@/lib/ai/gemini/services'
import { calculateProfileStrength } from '@/lib/utils/profileStrength'

const TABS = ['AI Assistant', 'History', 'Saved Prompts']
const SUGGESTIONS = [
  "Find universities for me",
  "Improve my profile",
  "Check admission chances",
  "Recommend scholarships",
  "Plan my admission",
  "Ask anything"
]

export default function CopilotPage() {
  const { profile, documents } = useStudentData()
  const { messages, isTyping, sendMessage, clearMessages } = useAIChat()
  const [input, setInput] = useState('')
  const [activeTab, setActiveTab] = useState('AI Assistant')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const context = useMemo(() => {
    if (!profile) return null
    return {
      profileEngine: calculateProfileStrength(profile, documents || []),
    }
  }, [profile, documents])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSend = async (text: string) => {
    if (!text.trim() || !context) return
    setInput('')
    await sendMessage(text, async (msgText) => {
      const aiContext = {
        studentName: profile?.firstName,
        profileStrength: context.profileEngine.percentage,
        missingProfileFields: context.profileEngine.missingFields,
      }
      return await CopilotService.processChat(msgText, aiContext)
    })
  }

  const formatInlineText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-[#111827]">{part.slice(2, -2)}</strong>
      }
      return part
    })
  }

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="font-sans flex flex-col gap-[16px] h-full max-h-[calc(100vh-100px)]">

        {/* ── ACTIONS ──────────────────────────────────── */}
        <div className="flex items-center justify-between shrink-0 gap-[8px]">
          {/* ── SUB-NAV: settings tabs only ─────────────── */}
          <div className="flex items-center gap-[4px] overflow-x-auto no-scrollbar">
            {TABS.map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`px-[16px] h-[34px] rounded-[8px] text-[13px] font-medium whitespace-nowrap transition-colors ${
                  activeTab === t ? 'bg-[#F3F4F6] text-[#111827]' : 'text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]'
                }`}>{t}</button>
            ))}
          </div>
          <button onClick={clearMessages} className="flex items-center gap-[6px] px-[14px] h-[34px] rounded-[8px] border border-[#E5E7EB] text-[13px] font-medium text-[#374151] bg-white hover:bg-[#F3F4F6] transition-colors">
            <RefreshCcw size={14} strokeWidth={1.8} />Clear Chat
          </button>
        </div>

        {/* ── MAIN CHAT AREA ────────────────────────────── */}
        {activeTab === 'AI Assistant' && (
          <div className="flex-1 bg-white border border-[#E5E7EB] rounded-[12px] flex flex-col overflow-hidden shadow-sm">
            {/* Header */}
            <div className="px-[20px] py-[14px] border-b border-[#E5E7EB] flex items-center justify-between bg-[#F9FAFB]">
              <div className="flex items-center gap-[10px]">
                <div className="w-[32px] h-[32px] rounded-full bg-[#EEF2FF] flex items-center justify-center border border-[#C7D2FE]">
                  <Sparkles size={16} className="text-[#4F6BFF]" strokeWidth={1.8} />
                </div>
                <div>
                  <span className="text-[15px] font-semibold text-[#111827] block leading-none">Eduing AI Copilot</span>
                  <span className="text-[12px] text-[#059669] flex items-center gap-[4px] mt-[4px]">
                    <span className="w-[6px] h-[6px] rounded-full bg-[#059669]" /> Online
                  </span>
                </div>
              </div>
              <button className="text-[#D1D5DB] hover:text-[#9CA3AF]">
                <MoreHorizontal size={16} strokeWidth={1.5} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-[20px] flex flex-col gap-[24px]">
              {messages.length === 0 ? (
                <div className="m-auto flex flex-col items-center justify-center max-w-md text-center">
                  <div className="w-[64px] h-[64px] bg-[#EEF2FF] rounded-[16px] flex items-center justify-center mb-[20px]">
                    <Sparkles size={32} className="text-[#4F6BFF]" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-[20px] font-semibold text-[#111827] mb-[8px]">How can I help you today?</h3>
                  <p className="text-[14px] text-[#6B7280] mb-[32px] leading-relaxed">
                    I am your AI admission counselor. I can help you find universities, review your profile, or plan your next steps.
                  </p>
                  
                  <div className="w-full flex flex-wrap justify-center gap-[10px]">
                    {SUGGESTIONS.map((s, i) => (
                      <button key={i} onClick={() => handleSend(s)}
                        className="px-[16px] py-[8px] bg-white border border-[#E5E7EB] rounded-full text-[13px] font-medium text-[#374151] hover:bg-[#F3F4F6] hover:border-[#D1D5DB] transition-all shadow-sm">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((m, i) => (
                    <div key={i} className={`flex gap-[16px] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-[36px] h-[36px] rounded-full flex items-center justify-center shrink-0 border ${m.role === 'user' ? 'bg-[#F9FAFB] border-[#E5E7EB]' : 'bg-[#EEF2FF] border-[#C7D2FE]'}`}>
                        {m.role === 'user' ? <User size={18} className="text-[#6B7280]" /> : <Sparkles size={18} className="text-[#4F6BFF]" />}
                      </div>
                      <div className={`max-w-[80%] flex flex-col gap-[8px] ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`px-[16px] py-[12px] rounded-[12px] text-[14px] leading-relaxed ${
                          m.role === 'user' 
                            ? 'bg-[#111827] text-white rounded-tr-[4px]' 
                            : 'bg-[#F9FAFB] border border-[#E5E7EB] text-[#374151] rounded-tl-[4px]'
                        }`}>
                          {formatInlineText(m.content)}
                        </div>
                        {m.role === 'assistant' && (
                          <div className="flex items-center gap-[8px] opacity-0 hover:opacity-100 transition-opacity">
                            <button className="text-[#9CA3AF] hover:text-[#4F6BFF]"><Copy size={14} /></button>
                            <button className="text-[#9CA3AF] hover:text-[#4F6BFF]"><RefreshCcw size={14} /></button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex gap-[16px]">
                      <div className="w-[36px] h-[36px] rounded-full bg-[#EEF2FF] border border-[#C7D2FE] flex items-center justify-center shrink-0">
                        <Sparkles size={18} className="text-[#4F6BFF]" />
                      </div>
                      <div className="px-[16px] py-[14px] rounded-[12px] rounded-tl-[4px] bg-[#F9FAFB] border border-[#E5E7EB] flex items-center gap-[6px]">
                        <div className="w-[6px] h-[6px] rounded-full bg-[#9CA3AF] animate-bounce" />
                        <div className="w-[6px] h-[6px] rounded-full bg-[#9CA3AF] animate-bounce" style={{ animationDelay: '0.2s' }} />
                        <div className="w-[6px] h-[6px] rounded-full bg-[#9CA3AF] animate-bounce" style={{ animationDelay: '0.4s' }} />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Area */}
            <div className="p-[20px] bg-white border-t border-[#E5E7EB]">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend(input)}
                  placeholder="Ask Eduing AI anything..."
                  className="w-full h-[48px] pl-[20px] pr-[60px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-full text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#4F6BFF] focus:ring-1 focus:ring-[#4F6BFF]/20 transition-all shadow-sm"
                />
                <button 
                  onClick={() => handleSend(input)}
                  disabled={!input.trim() || isTyping}
                  className="absolute right-[6px] w-[36px] h-[36px] bg-[#111827] text-white rounded-full flex items-center justify-center hover:bg-[#374151] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={16} strokeWidth={2} className="ml-[2px]" />
                </button>
              </div>
              <div className="flex items-center justify-center gap-[12px] mt-[12px]">
                {['Explain', 'Summarize', 'Generate', 'Improve'].map(action => (
                  <button key={action} onClick={() => setInput(action + ' ')} className="text-[12px] font-medium text-[#6B7280] hover:text-[#111827] transition-colors">
                    {action}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'History' && (
          <div className="flex-1 bg-white border border-[#E5E7EB] rounded-[12px] p-[40px] flex flex-col items-center justify-center text-center">
            <div className="w-[56px] h-[56px] bg-[#EEF2FF] rounded-[16px] flex items-center justify-center mb-[16px]">
              <Sparkles size={24} className="text-[#4F6BFF]" />
            </div>
            <h3 className="text-[16px] font-semibold text-[#111827] mb-[6px]">No chat history yet</h3>
            <p className="text-[13px] text-[#6B7280] max-w-[320px] mb-[20px]">Your conversations with Eduing AI Copilot will be saved here for easy reference.</p>
            <button onClick={() => setActiveTab('AI Assistant')} className="px-[16px] h-[36px] bg-[#4F6BFF] text-white text-[13px] font-semibold rounded-[8px]">Start a Chat</button>
          </div>
        )}

        {activeTab === 'Saved Prompts' && (
          <div className="flex-1 bg-white border border-[#E5E7EB] rounded-[12px] p-[40px] flex flex-col items-center justify-center text-center">
            <div className="w-[56px] h-[56px] bg-[#EEF2FF] rounded-[16px] flex items-center justify-center mb-[16px]">
              <Sparkles size={24} className="text-[#4F6BFF]" />
            </div>
            <h3 className="text-[16px] font-semibold text-[#111827] mb-[6px]">No saved prompts</h3>
            <p className="text-[13px] text-[#6B7280] max-w-[320px] mb-[20px]">Bookmark key prompts to quickly reuse them across your university search.</p>
            <button onClick={() => setActiveTab('AI Assistant')} className="px-[16px] h-[36px] bg-[#4F6BFF] text-white text-[13px] font-semibold rounded-[8px]">Go to AI Assistant</button>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
