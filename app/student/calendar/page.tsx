// app/student/calendar/page.tsx
'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, Plus, Bell,
  CheckCircle2, Clock, AlertTriangle, Calendar, Sparkles,
  TrendingUp, Search, X
} from 'lucide-react'
import { useStudentData } from '@/components/providers/StudentDataProvider'
import ProtectedRoute from '@/components/ProtectedRoute'
import { generateDeadlineInsights, DeadlineInsight } from '@/lib/utils/deadlineEngine'

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

const CAT_COLORS: Record<string, string> = {
  Application: 'var(--accent)',
  Scholarship: 'var(--green)',
  Entrance: 'var(--gold)',
  Interview: '#8B5CF6',
  Document: 'var(--red)',
  Verification: '#2a9d99',
}

const CARD: React.CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  boxShadow: '0 0.175px 1px rgba(0,0,0,0.015), 0 0.8px 2.9px rgba(0,0,0,0.022), 0 2px 7.8px rgba(0,0,0,0.027)',
  overflow: 'hidden',
}

/* ── Mini calendar ───────────────────────────────────────────────── */
function MiniCalendar({ insights }: { insights: DeadlineInsight[] }) {
  const [cur, setCur] = useState(new Date())
  const [selected, setSelected] = useState<number | null>(new Date().getDate())

  const y = cur.getFullYear(), m = cur.getMonth()
  const firstDay = new Date(y, m, 1).getDay()
  const daysInMonth = new Date(y, m + 1, 0).getDate()
  const today = new Date()
  const monthName = cur.toLocaleString('default', { month: 'long' })

  const dotMap: Record<number, string[]> = {}
  insights.forEach(ins => {
    if (ins.date.getFullYear() === y && ins.date.getMonth() === m) {
      const d = ins.date.getDate()
      if (!dotMap[d]) dotMap[d] = []
      dotMap[d].push(CAT_COLORS[ins.type] || 'var(--text-muted)')
    }
  })

  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div style={{ ...CARD, padding: '18px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.25px' }}>
          {monthName} {y}
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { label: 'Previous month', icon: ChevronLeft, onClick: () => setCur(new Date(y, m - 1, 1)) },
            { label: 'Next month', icon: ChevronRight, onClick: () => setCur(new Date(y, m + 1, 1)) },
          ].map(({ label, icon: Icon, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              aria-label={label}
              style={{
                width: 26, height: 26, borderRadius: 6,
                border: '1px solid var(--border)',
                background: 'var(--bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--text-muted)',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-hover)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)' }}
            >
              <Icon size={13} strokeWidth={1.8} />
            </button>
          ))}
        </div>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
        {DAYS.map(d => (
          <div key={d} style={{
            fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '0.06em', color: 'var(--text-muted)',
            textAlign: 'center', padding: '4px 0',
          }}>{d}</div>
        ))}
      </div>

      {/* Cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={i} />
          const isToday = today.getDate() === day && today.getMonth() === m && today.getFullYear() === y
          const isSel = selected === day
          const dots = dotMap[day] || []

          return (
            <motion.button
              key={i}
              whileTap={{ scale: 0.88 }}
              onClick={() => setSelected(day)}
              aria-label={`${day} ${monthName} ${y}`}
              aria-pressed={isSel}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                aspectRatio: '1',
                borderRadius: 7,
                border: 'none', cursor: 'pointer',
                background: isToday ? 'var(--text-primary)' : isSel ? 'var(--accent-bg)' : 'transparent',
                transition: 'background 0.1s',
                padding: 4,
              }}
              onMouseEnter={(e) => { if (!isToday && !isSel) (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-card-hover)' }}
              onMouseLeave={(e) => { if (!isToday && !isSel) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
            >
              <span style={{
                fontSize: 12, fontWeight: 600,
                color: isToday ? 'var(--bg)' : isSel ? 'var(--accent)' : 'var(--text-primary)',
                lineHeight: 1,
              }}>
                {day}
              </span>
              {dots.length > 0 && (
                <div style={{ display: 'flex', gap: 2, marginTop: 3 }}>
                  {dots.slice(0, 3).map((c, j) => (
                    <span key={j} style={{
                      width: 4, height: 4, borderRadius: '50%',
                      background: isToday ? 'var(--bg)' : c,
                    }} />
                  ))}
                </div>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingTop: 12, marginTop: 10, borderTop: '1px solid var(--border)' }}>
        {Object.entries(CAT_COLORS).slice(0, 4).map(([k, v]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: v }} />
            <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-muted)' }}>{k}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Main page ───────────────────────────────────────────────────── */
export default function AdmissionPlannerPage() {
  const { deadlines, uniqueApps, documents, profileScore, loading } = useStudentData()
  const [search, setSearch] = useState('')
  const [tasks, setTasks] = useState<any[]>([])
  const [showAddTask, setShowAddTask] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskCategory, setNewTaskCategory] = useState('Application')

  const toggleTask = (id: string) => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return
    setTasks(prev => [{
      id: `t_${Date.now()}`,
      done: false,
      title: newTaskTitle,
      category: newTaskCategory,
      due: 'Today',
      priority: 'Medium',
    }, ...prev])
    setNewTaskTitle('')
    setShowAddTask(false)
  }

  const { insights } = useMemo(() => generateDeadlineInsights({
    deadlines: deadlines || [],
    applications: uniqueApps || [],
    documents: documents || [],
    profileScore: profileScore || 0,
  }), [deadlines, uniqueApps, documents, profileScore])

  const stats = useMemo(() => ({
    total: insights.length,
    completed: insights.filter(i => i.status === 'Completed').length,
    upcoming: insights.filter(i => i.date.getTime() > Date.now() && i.status !== 'Completed').length,
    overdue: insights.filter(i => i.date.getTime() < Date.now() && i.status !== 'Completed').length,
  }), [insights])

  const INPUT_STYLE: React.CSSProperties = {
    width: '100%', height: 34,
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 6, padding: '7px 11px',
    fontSize: 13, color: 'var(--text-primary)', outline: 'none',
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontFamily: 'Inter, system-ui, sans-serif' }}>

        {/* ── STAT CARDS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>

          {/* AI Summary */}
          <div style={{
            gridColumn: 'span 2',
            background: 'var(--accent)',
            borderRadius: 10, padding: '16px',
            display: 'flex', alignItems: 'center', gap: 12,
            boxShadow: '0 2px 7.8px rgba(0,0,0,0.027)',
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Sparkles size={18} style={{ color: '#fff' }} strokeWidth={1.8} />
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.7)', margin: '0 0 2px' }}>
                AI Planner
              </p>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#fff', margin: '0 0 1px' }}>You&apos;re on track!</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', margin: 0 }}>
                {stats.upcoming} tasks pending this week.
              </p>
            </div>
          </div>

          {[
            { label: 'Completed', value: stats.completed, sub: 'Tasks done', color: 'var(--green)', Icon: CheckCircle2 },
            { label: 'Upcoming', value: stats.upcoming, sub: 'Due this week', color: 'var(--gold)', Icon: Clock },
            { label: 'Overdue', value: stats.overdue, sub: 'Take action', color: 'var(--red)', Icon: AlertTriangle },
          ].map(({ label, value, sub, color, Icon }) => (
            <div key={label} style={{
              ...CARD, padding: '14px',
              display: 'flex', alignItems: 'flex-start', gap: 10,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: `${color}12`, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={14} style={{ color }} strokeWidth={1.8} />
              </div>
              <div>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: '0 0 1px' }}>{label}</p>
                <p style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-1px', color, margin: '0 0 1px', lineHeight: 1 }}>{value}</p>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: 0 }}>{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── MAIN GRID ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 14 }}>

          {/* Mini Calendar */}
          <MiniCalendar insights={insights} />

          {/* Upcoming Deadlines */}
          <div style={{ ...CARD, display: 'flex', flexDirection: 'column' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 18px', borderBottom: '1px solid var(--border)', flexShrink: 0,
            }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Upcoming Deadlines</p>
              <button style={{
                display: 'flex', alignItems: 'center', gap: 5,
                height: 28, padding: '0 10px',
                background: 'var(--text-primary)', color: 'var(--bg)',
                border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer',
              }}>
                <Plus size={11} />Add Event
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {insights.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', textAlign: 'center', gap: 8 }}>
                  <Calendar size={26} style={{ color: 'var(--text-muted)' }} strokeWidth={1.5} />
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>No upcoming deadlines</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>Apply to universities to see your deadline calendar.</p>
                </div>
              ) : (
                insights
                  .filter(ins => ins.date.getTime() > Date.now() - 86400000)
                  .slice(0, 10)
                  .map((ins, i) => {
                    const daysUntil = Math.ceil((ins.date.getTime() - Date.now()) / 86400000)
                    const badgeLabel = daysUntil <= 0 ? 'Due Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil}d`
                    const badgeColor = daysUntil <= 0 ? 'var(--red)' : daysUntil <= 3 ? 'var(--gold)' : 'var(--green)'

                    return (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 18px',
                        borderBottom: '1px solid var(--border)',
                        transition: 'background 0.1s',
                      }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-card-hover)' }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
                      >
                        <div style={{ textAlign: 'center', flexShrink: 0, width: 32 }}>
                          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{ins.date.getDate()}</div>
                          <div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                            {ins.date.toLocaleString('default', { month: 'short' })}
                          </div>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {ins.title}
                            </p>
                            <span style={{
                              fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 999, flexShrink: 0,
                              color: badgeColor, background: `${badgeColor}18`,
                            }}>
                              {badgeLabel}
                            </span>
                          </div>
                          <span style={{
                            fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 999,
                            background: 'var(--bg)', border: '1px solid var(--border)',
                            color: 'var(--text-secondary)',
                          }}>
                            {ins.type}
                          </span>
                        </div>
                        <button aria-label="Set reminder" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', flexShrink: 0 }}>
                          <Bell size={13} strokeWidth={1.8} />
                        </button>
                      </div>
                    )
                  })
              )}
            </div>

            <div style={{ padding: '10px 18px', borderTop: '1px solid var(--border)' }}>
              <button style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 2 }}>
                View all events →
              </button>
            </div>
          </div>
        </div>

        {/* ── BOTTOM GRID ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 14 }}>

          {/* AI Suggestions */}
          <div style={{ ...CARD, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '12px 18px', borderBottom: '1px solid var(--border)' }}>
              <Sparkles size={13} style={{ color: 'var(--accent)' }} strokeWidth={1.8} />
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>AI Suggestions</p>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {insights.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 20px', textAlign: 'center', gap: 8 }}>
                  <Sparkles size={22} style={{ color: 'var(--text-muted)' }} strokeWidth={1.5} />
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>AI suggestions appear as you build your profile and apply to universities.</p>
                </div>
              ) : insights.slice(0, 4).map((ins, i) => {
                const urgentColor = ins.priority === 'High' ? 'var(--red)' : ins.priority === 'Medium' ? 'var(--gold)' : 'var(--accent)'
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    padding: '11px 18px', borderBottom: '1px solid var(--border)',
                    cursor: 'pointer', transition: 'background 0.1s',
                  }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-card-hover)' }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
                  >
                    <div style={{
                      width: 28, height: 28, borderRadius: 7,
                      background: `${urgentColor}10`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <TrendingUp size={13} style={{ color: urgentColor }} strokeWidth={1.8} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 1px', lineHeight: 1.3 }}>{ins.title}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>{ins.riskLevel} · {ins.estimatedTime}</p>
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 600, color: urgentColor, flexShrink: 0,
                      padding: '2px 6px', borderRadius: 999, background: `${urgentColor}10`,
                    }}>
                      {ins.priority}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* My Tasks */}
          <div style={{ ...CARD, display: 'flex', flexDirection: 'column' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 18px', borderBottom: '1px solid var(--border)',
            }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>My Tasks</p>
              <button
                onClick={() => setShowAddTask(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)' }}
              >
                <Plus size={13} />Add Task
              </button>
            </div>

            {/* Task search */}
            <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ position: 'relative' }}>
                <Search size={12} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} strokeWidth={1.8} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search tasks..."
                  aria-label="Search tasks"
                  style={{
                    width: '100%', height: 30, paddingLeft: 28, paddingRight: 10,
                    background: 'var(--bg)', border: '1px solid var(--border)',
                    borderRadius: 6, fontSize: 12,
                    color: 'var(--text-primary)', outline: 'none',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--accent)' }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--border)' }}
                />
                {search && (
                  <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    <X size={11} strokeWidth={2} />
                  </button>
                )}
              </div>
            </div>

            {/* Task list */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <AnimatePresence>
                {tasks
                  .filter(t => !search || t.title.toLowerCase().includes(search.toLowerCase()))
                  .map(t => (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 18px',
                        borderBottom: '1px solid var(--border)',
                        opacity: t.done ? 0.5 : 1,
                      }}
                    >
                      <button
                        onClick={() => toggleTask(t.id)}
                        aria-label={`Mark "${t.title}" as ${t.done ? 'incomplete' : 'complete'}`}
                        style={{
                          width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                          border: `2px solid ${t.done ? 'var(--green)' : 'var(--border)'}`,
                          background: t.done ? 'var(--green)' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        {t.done && <CheckCircle2 size={9} style={{ color: '#fff' }} strokeWidth={2.5} />}
                      </button>
                      <p style={{
                        flex: 1, fontSize: 12, fontWeight: 500, margin: 0,
                        color: t.done ? 'var(--text-muted)' : 'var(--text-primary)',
                        textDecoration: t.done ? 'line-through' : 'none',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{t.title}</p>
                      <span style={{
                        fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 999, flexShrink: 0,
                        background: 'var(--accent-bg)', color: 'var(--accent)',
                      }}>
                        {t.priority}
                      </span>
                    </motion.div>
                  ))
                }
              </AnimatePresence>

              {tasks.length === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 20px', textAlign: 'center', gap: 8 }}>
                  <Calendar size={22} style={{ color: 'var(--text-muted)' }} strokeWidth={1.5} />
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>No tasks yet. Add your first task to get started.</p>
                </div>
              )}
            </div>

            <div style={{ padding: '10px 18px', borderTop: '1px solid var(--border)' }}>
              <button style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 2 }}>
                View all tasks →
              </button>
            </div>
          </div>
        </div>

        {/* ── ADD TASK MODAL ── */}
        <AnimatePresence>
          {showAddTask && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setShowAddTask(false)}
                style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(4px)' }}
              />
              <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                style={{
                  position: 'relative',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  padding: '22px 22px 18px',
                  width: '100%', maxWidth: 380,
                  boxShadow: '0 4px 18px rgba(0,0,0,0.12)',
                }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="add-task-title"
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h3 id="add-task-title" style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Add New Task</h3>
                  <button onClick={() => setShowAddTask(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    <X size={16} strokeWidth={2} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label htmlFor="newTaskTitleInput" style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 5 }}>
                      Task Title
                    </label>
                    <input
                      id="newTaskTitleInput"
                      type="text"
                      value={newTaskTitle}
                      onChange={e => setNewTaskTitle(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleAddTask() }}
                      placeholder="e.g. Request recommendation letter"
                      style={INPUT_STYLE}
                      onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 2px var(--accent-bg)' }}
                      onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
                    />
                  </div>
                  <div>
                    <label htmlFor="newTaskCategorySelect" style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 5 }}>
                      Category
                    </label>
                    <select
                      id="newTaskCategorySelect"
                      value={newTaskCategory}
                      onChange={e => setNewTaskCategory(e.target.value)}
                      style={{ ...INPUT_STYLE, appearance: 'none' }}
                    >
                      <option>Application</option>
                      <option>Documents</option>
                      <option>Entrance Exam</option>
                      <option>Scholarship</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 6 }}>
                    <button
                      onClick={() => setShowAddTask(false)}
                      style={{
                        height: 32, padding: '0 12px',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                        borderRadius: 6, fontSize: 12, fontWeight: 500,
                        color: 'var(--text-secondary)', cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddTask}
                      style={{
                        height: 32, padding: '0 14px',
                        background: 'var(--accent)', color: '#fff',
                        border: 'none', borderRadius: 6,
                        fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      Save Task
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </ProtectedRoute>
  )
}