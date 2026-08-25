// app/student/copilot/page.tsx
'use client'
import React, { useState, useEffect, useRef, useMemo } from 'react'
import {
  Sparkles, Send, User, MoreHorizontal, RefreshCcw, Copy
} from 'lucide-react'
import { useStudentData } from '@/components/providers/StudentDataProvider'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAIChat } from '@/hooks/useAIChat'
import { CopilotService } from '@/lib/ai/gemini/services'
import { calculateProfileStrength } from '@/lib/utils/profileStrength'
import AIMarkdown from '@/components/ai/AIMarkdown'

const TABS = ['AI Assistant', 'History', 'Saved Prompts']
const SUGGESTIONS = [
  "Why is my admission probability low for a university?",
  "Which scholarships am I missing out on?",
  "What documents are still pending on my applications?",
  "What should I complete on my profile first?",
]

export default function CopilotPage() {
  const { profile, documents, uniqueApps, deadlines, scholarships, profileStrength } = useStudentData()
  const { messages, isTyping, sendMessage, clearMessages } = useAIChat()
  const [input, setInput] = useState('')
  const [activeTab, setActiveTab] = useState('AI Assistant')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // FIXED: UserProfile has fullName not firstName
  const firstName = profile?.fullName?.split(' ')[0] ?? ''

  const context = useMemo(() => {
    if (!profile) return null
    return {
      profileEngine: calculateProfileStrength(profile, documents || []),
    }
  }, [profile, documents])

  /** Build the EDUING Copilot system instruction with live student data injected. */
  const buildSystemContext = useMemo(() => {
    if (!profile) return null

    // ── Profile summary ──────────────────────────────────────────────────────
    const pct = profileStrength.percentage
    const topMissing = profileStrength.missingFields
      .filter((f: any) => f.priority === 'High')
      .slice(0, 3)
      .map((f: any) => f.label)
    const profileSummary = [
      `Profile completion: ${pct}% (${profileStrength.grade})`,
      topMissing.length > 0
        ? `Top missing fields: ${topMissing.join(', ')}`
        : 'Profile fields are well filled',
    ].join('. ')

    // ── Applications summary ─────────────────────────────────────────────────
    const activeApps = (uniqueApps || []).filter(
      (a: any) => !['rejected'].includes((a.status || '').toLowerCase())
    )
    const statusCounts: Record<string, number> = {}
    activeApps.forEach((a: any) => {
      const s = a.status || 'draft'
      statusCounts[s] = (statusCounts[s] || 0) + 1
    })
    const statusSummary = Object.entries(statusCounts)
      .map(([k, v]) => `${v} ${k}`)
      .join(', ')
    const appsSummary = activeApps.length > 0
      ? `Active applications: ${activeApps.length} (${statusSummary})`
      : 'No active applications yet'

    // ── Deadlines summary ────────────────────────────────────────────────────
    const upcomingDeadlines = (deadlines || [])
      .filter((d: any) => d?.date && new Date(d.date) > new Date())
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3)
    const deadlinesSummary = upcomingDeadlines.length > 0
      ? `Upcoming deadlines: ${upcomingDeadlines.map((d: any) => `${d.title || d.universityName || 'Application'} on ${new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`).join('; ')}`
      : 'No upcoming deadlines recorded'

    // ── Scholarships summary ─────────────────────────────────────────────────
    const scholarshipCount = (scholarships || []).length
    const scholarshipsSummary = scholarshipCount > 0
      ? `${scholarshipCount} scholarships available in the system that may match this student`
      : 'Scholarship data not yet loaded'

    const profileDataBlock = [
      profileSummary,
      appsSummary,
      deadlinesSummary,
      scholarshipsSummary,
      profile?.preferredPrograms?.length > 0
        ? `Preferred programs: ${Array.isArray(profile.preferredPrograms) ? profile.preferredPrograms.join(', ') : profile.preferredPrograms}`
        : null,
      profile?.twelfthPercentage ? `12th percentage: ${profile.twelfthPercentage}%` : null,
      profile?.testScores ? `Entrance exam scores: ${JSON.stringify(profile.testScores)}` : null,
    ].filter(Boolean).join('. ')

    return [
      `You are EDUING's AI Copilot, a student admissions assistant.`,
      `You only help with university admissions, applications, scholarships, and education decisions.`,
      `You have access to this student's live data: ${profileDataBlock}.`,
      `Use this data to give specific, personalised answers.`,
      `If a student asks about their admission chances, refer to their profile.`,
      `If they ask about deadlines, refer to their application data.`,
      `Never answer questions unrelated to education and admissions.`,
    ].join(' ')
  }, [profile, profileStrength, uniqueApps, deadlines, scholarships])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSend = async (text: string) => {
    if (!text.trim() || !context) return
    setInput('')
    // Wrap user input in a structured tag to isolate it from injected context
    const sanitisedMessage = `<user_query>${text.trim()}</user_query>`
    await sendMessage(text, async () => {
      const aiContext = {
        studentName: firstName,
        profileStrength: context.profileEngine.percentage,
        missingProfileFields: context.profileEngine.missingFields,
      }
      // Pass all existing messages as history for multi-turn context
      const history = messages.map(m => ({ role: m.role, content: m.content }))
      return await CopilotService.processChat(
        sanitisedMessage,
        aiContext,
        history,
        buildSystemContext ?? undefined
      )
    })
  }



  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="font-sans flex flex-col gap-[16px] h-full max-h-[calc(100vh-100px)]">

        {/* Actions */}
        <div className="flex items-center justify-between shrink-0 gap-[8px]">
          <div className="flex items-center gap-[4px] overflow-x-auto">
            {TABS.map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                style={{
                  padding: '0 16px', height: 34, borderRadius: 8,
                  fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap',
                  background: activeTab === t ? 'var(--bg-elevated)' : 'transparent',
                  color: activeTab === t ? 'var(--text-primary)' : 'var(--text-muted)',
                  border: activeTab === t ? '1px solid var(--border)' : '1px solid transparent',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>
                {t}
              </button>
            ))}
          </div>
          <button onClick={clearMessages} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '0 14px', height: 34, borderRadius: 8,
            border: '1px solid var(--border)', fontSize: 13, fontWeight: 500,
            color: 'var(--text-primary)', background: 'var(--bg-card)',
            cursor: 'pointer', transition: 'background 0.15s',
          }}>
            <RefreshCcw size={14} strokeWidth={1.8} />Clear Chat
          </button>
        </div>

        {/* AI Assistant tab */}
        {activeTab === 'AI Assistant' && (
          <div style={{
            flex: 1, background: 'var(--bg-card)',
            border: '1px solid var(--border)', borderRadius: 12,
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{
              padding: '14px 20px', borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'var(--bg)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Sparkles size={16} style={{ color: 'var(--accent)' }} strokeWidth={1.8} />
                </div>
                <div>
                  <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', display: 'block', lineHeight: 1 }}>
                    Eduing AI Copilot
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
                    Online
                  </span>
                </div>
              </div>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)' }}>
                <MoreHorizontal size={16} strokeWidth={1.5} />
              </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 24 }}>
              {messages.length === 0 ? (
                <div style={{ margin: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 440, textAlign: 'center' }}>
                  <div style={{
                    width: 64, height: 64, background: 'var(--accent-bg)',
                    borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 20,
                  }}>
                    <Sparkles size={32} style={{ color: 'var(--accent)' }} strokeWidth={1.5} />
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
                    How can I help you today?
                  </h3>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.6 }}>
                    I am your AI admission counselor. I can help you find universities, review your profile, or plan your next steps.
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10, width: '100%' }}>
                    {SUGGESTIONS.map((s, i) => (
                      <button key={i} onClick={() => handleSend(s)} style={{
                        padding: '8px 16px',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                        borderRadius: 999, fontSize: 13, fontWeight: 500,
                        color: 'var(--text-primary)', cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((m, i) => (
                    <div key={i} style={{
                      display: 'flex', gap: 16,
                      flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: m.role === 'user' ? 'var(--bg-elevated)' : 'var(--accent-bg)',
                        border: `1px solid ${m.role === 'user' ? 'var(--border)' : 'var(--accent-border)'}`,
                      }}>
                        {m.role === 'user'
                          ? <User size={18} style={{ color: 'var(--text-muted)' }} />
                          : <Sparkles size={18} style={{ color: 'var(--accent)' }} />
                        }
                      </div>
                      <div style={{
                        maxWidth: '80%', display: 'flex', flexDirection: 'column', gap: 8,
                        alignItems: m.role === 'user' ? 'flex-end' : 'flex-start',
                      }}>
                        <div style={{
                          padding: '12px 16px', borderRadius: 12, fontSize: 14, lineHeight: 1.6,
                          ...(m.role === 'user'
                            ? {
                              background: 'var(--text-primary)',
                              color: 'var(--bg)',
                              borderTopRightRadius: 4,
                            }
                            : {
                              background: 'var(--bg-elevated)',
                              border: '1px solid var(--border)',
                              color: 'var(--text-primary)',
                              borderTopLeftRadius: 4,
                            }
                          ),
                        }}>
                          {m.role === 'user'
                            ? m.content
                            : <AIMarkdown content={m.content} className="text-[14px]" />}
                        </div>
                        {m.role === 'assistant' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: 0 }}
                            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.opacity = '1' }}
                            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.opacity = '0' }}
                          >
                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><Copy size={14} /></button>
                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><RefreshCcw size={14} /></button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div style={{ display: 'flex', gap: 16 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <Sparkles size={18} style={{ color: 'var(--accent)' }} />
                      </div>
                      <div style={{
                        padding: '14px 16px', borderRadius: 12, borderTopLeftRadius: 4,
                        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                        display: 'flex', alignItems: 'center', gap: 6,
                      }}>
                        {[0, 1, 2].map(j => (
                          <div key={j} style={{
                            width: 6, height: 6, borderRadius: '50%',
                            background: 'var(--text-muted)',
                            animation: 'bounce 1s infinite',
                            animationDelay: `${j * 0.2}s`,
                          }} />
                        ))}
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <div style={{ padding: 20, background: 'var(--bg-card)', borderTop: '1px solid var(--border)' }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend(input)}
                  placeholder="Ask Eduing AI anything..."
                  style={{
                    width: '100%', height: 48, paddingLeft: 20, paddingRight: 60,
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: 999, fontSize: 14,
                    color: 'var(--text-primary)', outline: 'none',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'var(--accent)' }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
                />
                <button
                  onClick={() => handleSend(input)}
                  disabled={!input.trim() || isTyping}
                  style={{
                    position: 'absolute', right: 6,
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'var(--text-primary)', color: 'var(--bg)',
                    border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: (!input.trim() || isTyping) ? 0.5 : 1,
                    transition: 'opacity 0.15s',
                  }}
                >
                  <Send size={16} strokeWidth={2} style={{ marginLeft: 2 }} />
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 12 }}>
                {['Explain', 'Summarize', 'Generate', 'Improve'].map(action => (
                  <button key={action} onClick={() => setInput(action + ' ')} style={{
                    fontSize: 12, fontWeight: 500, color: 'var(--text-muted)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    transition: 'color 0.15s',
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)' }}
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'History' && (
          <div style={{
            flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 12, padding: 40, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', textAlign: 'center',
          }}>
            <div style={{
              width: 56, height: 56, background: 'var(--accent-bg)', borderRadius: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
            }}>
              <Sparkles size={24} style={{ color: 'var(--accent)' }} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>No chat history yet</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 320, marginBottom: 20 }}>
              Your conversations with Eduing AI Copilot will be saved here for easy reference.
            </p>
            <button onClick={() => setActiveTab('AI Assistant')} style={{
              padding: '0 16px', height: 36, background: 'var(--accent)', color: '#fff',
              fontSize: 13, fontWeight: 600, borderRadius: 8, border: 'none', cursor: 'pointer',
            }}>
              Start a Chat
            </button>
          </div>
        )}

        {activeTab === 'Saved Prompts' && (
          <div style={{
            flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 12, padding: 40, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', textAlign: 'center',
          }}>
            <div style={{
              width: 56, height: 56, background: 'var(--accent-bg)', borderRadius: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
            }}>
              <Sparkles size={24} style={{ color: 'var(--accent)' }} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>No saved prompts</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 320, marginBottom: 20 }}>
              Bookmark key prompts to quickly reuse them across your university search.
            </p>
            <button onClick={() => setActiveTab('AI Assistant')} style={{
              padding: '0 16px', height: 36, background: 'var(--accent)', color: '#fff',
              fontSize: 13, fontWeight: 600, borderRadius: 8, border: 'none', cursor: 'pointer',
            }}>
              Go to AI Assistant
            </button>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}