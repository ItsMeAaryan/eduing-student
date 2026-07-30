'use client'
import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, Plus, Bell, MoreHorizontal,
  CheckCircle2, Clock, AlertTriangle, Calendar, Sparkles,
  TrendingUp, Search, X
} from 'lucide-react'
import { useStudentData } from '@/components/providers/StudentDataProvider'
import ProtectedRoute from '@/components/ProtectedRoute'
import { generateDeadlineInsights, DeadlineInsight } from '@/lib/utils/deadlineEngine'


const DAYS = ['SUN','MON','TUE','WED','THU','FRI','SAT']
const CAT_COLORS: Record<string,string> = { Application:'#4F6BFF', Scholarship:'#10B981', Entrance:'#F59E0B', Interview:'#8B5CF6', Document:'#EC4899', Verification:'#6366F1' }

function getDotColor(cat: string) {
  return CAT_COLORS[cat] || '#9CA3AF'
}

function MiniCalendar({ insights }: { insights: DeadlineInsight[] }) {
  const [cur, setCur] = useState(new Date())
  const [selected, setSelected] = useState<number|null>(new Date().getDate())

  const y = cur.getFullYear(), m = cur.getMonth()
  const firstDay = new Date(y, m, 1).getDay()
  const daysInMonth = new Date(y, m+1, 0).getDate()
  const today = new Date()

  // Map insight dates → dots
  const dotMap: Record<number, string[]> = {}
  insights.forEach(ins => {
    if (ins.date.getFullYear()===y && ins.date.getMonth()===m) {
      const d = ins.date.getDate()
      if (!dotMap[d]) dotMap[d] = []
      dotMap[d].push(getDotColor(ins.type))
    }
  })

  const cells: (number|null)[] = [...Array(firstDay).fill(null), ...Array.from({length:daysInMonth},(_,i)=>i+1)]
  while (cells.length % 7 !== 0) cells.push(null)

  const monthName = cur.toLocaleString('default',{month:'long'})

  return (
    <div className="bg-card border border-border rounded-[16px] p-[20px] flex flex-col gap-[14px]" style={{boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[16px] font-bold text-foreground">{monthName} {y}</span>
        </div>
        <div className="flex items-center gap-[6px]">
          <button onClick={()=>setCur(new Date(y,m-1,1))} className="w-[28px] h-[28px] rounded-[7px] border border-border flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors">
            <ChevronLeft size={14}/>
          </button>
          <button onClick={()=>setCur(new Date(y,m+1,1))} className="w-[28px] h-[28px] rounded-[7px] border border-border flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors">
            <ChevronRight size={14}/>
          </button>
        </div>
      </div>
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-[2px]">
        {DAYS.map(d=><div key={d} className="text-[10px] font-bold text-muted-foreground text-center py-[4px]">{d}</div>)}
      </div>
      {/* Cells */}
      <div className="grid grid-cols-7 gap-[2px]">
        {cells.map((day,i)=>{
          if (!day) return <div key={i}/>
          const isToday = today.getDate()===day && today.getMonth()===m && today.getFullYear()===y
          const isSel = selected===day
          const dots = dotMap[day] || []
          return (
            <motion.button key={i} whileTap={{scale:0.9}} onClick={()=>setSelected(day)}
              className={`relative flex flex-col items-center justify-center w-full aspect-square rounded-[8px] transition-colors ${
                isToday ? 'bg-foreground text-white' : isSel ? 'bg-primary/10 text-[#4F6BFF]' : 'hover:bg-secondary text-foreground'
              }`}>
              <span className={`text-[12px] font-semibold leading-none ${isToday?'text-white':isSel?'text-[#4F6BFF]':''}`}>{day}</span>
              {dots.length>0 && (
                <div className="flex gap-[2px] mt-[2px]">
                  {dots.slice(0,3).map((c,j)=><span key={j} className="w-[4px] h-[4px] rounded-full" style={{background:isToday?'white':c}}/>)}
                </div>
              )}
            </motion.button>
          )
        })}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-[8px] pt-[4px] border-t border-border">
        {Object.entries(CAT_COLORS).slice(0,4).map(([k,v])=>(
          <div key={k} className="flex items-center gap-[4px]">
            <span className="w-[6px] h-[6px] rounded-full" style={{background:v}}/>
            <span className="text-[9px] text-muted-foreground">{k}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

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
    const newTask = {
      id: `t_${Date.now()}`,
      done: false,
      title: newTaskTitle,
      category: newTaskCategory,
      due: 'Today',
      priority: 'Medium',
      color: '#4F6BFF'
    }
    setTasks(prev => [newTask, ...prev])
    setNewTaskTitle('')
    setShowAddTask(false)
  }

  const { insights } = useMemo(() => generateDeadlineInsights({
    deadlines: deadlines || [], applications: uniqueApps || [],
    documents: documents || [], profileScore: profileScore || 0,
  }), [deadlines, uniqueApps, documents, profileScore])

  const stats = useMemo(() => ({
    total:     insights.length,
    completed: insights.filter(i=>i.status==='Completed').length,
    upcoming:  insights.filter(i=>i.date.getTime()>Date.now()&&i.status!=='Completed').length,
    overdue:   insights.filter(i=>i.date.getTime()<Date.now()&&i.status!=='Completed').length,
  }), [insights])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-[36px] h-[36px] border-4 border-border border-t-[#4F6BFF] rounded-full animate-spin"/>
    </div>
  )

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="font-sans flex flex-col gap-[20px]">

        {/* ── TOP STAT CARDS ── */}
        <div className="grid grid-cols-5 gap-[12px]">
          {/* AI Summary */}
          <motion.div whileHover={{y:-2}} className="col-span-2 rounded-[14px] p-[18px] flex items-center gap-[14px]"
            style={{background:'linear-gradient(135deg,#4F6BFF,#6366F1)',boxShadow:'0 4px 20px rgba(79,107,255,0.25)'}}>
            <div className="w-[44px] h-[44px] rounded-[12px] bg-card/20 flex items-center justify-center shrink-0">
              <Sparkles size={20} className="text-white"/>
            </div>
            <div>
              <p className="text-[10px] font-bold text-white/60 uppercase tracking-[0.08em] mb-[1px]">AI Planner Summary</p>
              <p className="text-[15px] font-bold text-white leading-snug">You&apos;re on track!</p>
              <p className="text-[11px] text-white/70">You have {stats.upcoming} tasks pending this week.</p>
            </div>
          </motion.div>
          {[
            {label:'Completed', value:stats.completed, sub:'Tasks completed',  color:'#059669', bg:'#F0FDF4', Icon:CheckCircle2},
            {label:'Upcoming',  value:stats.upcoming,  sub:'Due this week',    color:'#D97706', bg:'#FFFBEB', Icon:Clock},
            {label:'Overdue',   value:stats.overdue,   sub:'Take action now',  color:'#EF4444', bg:'#FEF2F2', Icon:AlertTriangle},
            {label:'Total Tasks',value:stats.total,    sub:'All scheduled',    color:'#4F6BFF', bg:'#EEF2FF', Icon:Calendar},
          ].map(({label,value,sub,color,bg,Icon})=>(
            <motion.div key={label} whileHover={{y:-2}} className="bg-card border border-border rounded-[14px] p-[16px] flex items-start gap-[10px]"
              style={{boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
              <div className="w-[36px] h-[36px] rounded-[10px] flex items-center justify-center shrink-0" style={{background:bg}}>
                <Icon size={16} style={{color}}/>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground mb-[1px]">{label}</div>
                <div className="text-[22px] font-black leading-none mb-[1px]" style={{color}}>{value}</div>
                <div className="text-[10px] text-muted-foreground">{sub}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── MAIN GRID ── */}
        <div className="grid grid-cols-[1fr_1.4fr] gap-[16px]">

          {/* LEFT: Calendar */}
          <MiniCalendar insights={insights} />

          {/* RIGHT: Upcoming Deadlines */}
          <div className="bg-card border border-border rounded-[16px] flex flex-col overflow-hidden" style={{boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
            <div className="flex items-center justify-between px-[20px] py-[14px] border-b border-border shrink-0">
              <p className="text-[14px] font-semibold text-foreground">Upcoming Deadlines</p>
              <button className="flex items-center gap-[5px] px-[12px] h-[30px] rounded-[8px] bg-foreground text-white text-[11px] font-semibold hover:bg-[#1F2937] transition-colors">
                <Plus size={12}/>Add Event
              </button>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-[#F3F4F6]">
              {insights.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-[32px] text-center gap-[8px]">
                  <Calendar size={28} className="text-muted-foreground" />
                  <p className="text-[13px] font-semibold text-foreground">No upcoming deadlines</p>
                  <p className="text-[11px] text-muted-foreground">Apply to universities to see your deadline calendar.</p>
                </div>
              ) : (
                insights
                  .filter(ins => ins.date.getTime() > Date.now() - 86400000) // today onwards
                  .slice(0, 10)
                  .map((ins, i) => {
                    const daysUntil = Math.ceil((ins.date.getTime() - Date.now()) / 86400000)
                    const badge = daysUntil <= 0 ? 'Due Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} Days`
                    const badgeColor = daysUntil <= 0 ? '#EF4444' : daysUntil <= 3 ? '#F59E0B' : '#10B981'
                    return (
                      <motion.div key={i} initial={{opacity:0,x:10}} animate={{opacity:1,x:0}} transition={{delay:i*0.05}}
                        className="flex items-center gap-[14px] px-[20px] py-[12px] hover:bg-muted transition-colors group">
                        <div className="text-center shrink-0 w-[36px]">
                          <div className="text-[16px] font-black text-foreground leading-none">{ins.date.getDate()}</div>
                          <div className="text-[9px] font-bold text-muted-foreground uppercase">{ins.date.toLocaleString('default',{month:'short'})}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-[6px] mb-[2px]">
                            <p className="text-[12.5px] font-semibold text-foreground truncate">{ins.title}</p>
                            <span className="text-[9px] font-bold px-[6px] py-[1px] rounded-full shrink-0" style={{color:badgeColor,background:badgeColor+'18'}}>{badge}</span>
                          </div>
                          <div className="flex items-center gap-[8px] text-[10px] text-muted-foreground">
                            <span className="px-[5px] py-[1px] rounded-full bg-secondary text-foreground font-medium">{ins.type}</span>
                          </div>
                        </div>
                        <button className="shrink-0 text-[#D1D5DB] hover:text-[#4F6BFF] transition-colors"><Bell size={14}/></button>
                      </motion.div>
                    )
                  })
              )}
            </div>
            <div className="px-[20px] py-[10px] border-t border-border">
              <button className="text-[12px] font-semibold text-[#4F6BFF] hover:underline flex items-center gap-[4px]">
                View all events <ChevronRight size={12}/>
              </button>
            </div>
          </div>
        </div>

        {/* ── BOTTOM GRID ── */}
        <div className="grid grid-cols-[1fr_1.4fr] gap-[16px]">

          {/* BOTTOM LEFT: AI Suggestions */}
          <div className="bg-card border border-border rounded-[16px] overflow-hidden" style={{boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
            <div className="flex items-center justify-between px-[20px] py-[14px] border-b border-border">
              <div className="flex items-center gap-[7px]">
                <Sparkles size={14} className="text-[#4F6BFF]"/>
                <p className="text-[14px] font-semibold text-foreground">AI Suggestions & Alerts</p>
              </div>
            </div>
            <div className="divide-y divide-[#F3F4F6]">
              {insights.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-[32px] text-center gap-[8px]">
                  <Sparkles size={24} className="text-muted-foreground" />
                  <p className="text-[12px] text-muted-foreground">AI suggestions will appear as you build your profile and apply to universities.</p>
                </div>
              ) : (
                insights.slice(0, 4).map((ins, i) => {
                  const iconBg = ins.priority === 'High' ? '#FEF2F2' : ins.priority === 'Medium' ? '#FFFBEB' : '#EEF2FF'
                  const iconColor = ins.priority === 'High' ? '#DC2626' : ins.priority === 'Medium' ? '#D97706' : '#4F6BFF'
                  return (
                    <motion.div key={i} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}
                      className="flex items-start gap-[12px] px-[20px] py-[12px] hover:bg-muted cursor-pointer transition-colors">
                      <div className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center shrink-0 mt-[1px]" style={{background:iconBg}}>
                        <TrendingUp size={16} style={{color:iconColor}}/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12.5px] font-semibold text-foreground leading-snug">{ins.title}</p>
                        <p className="text-[11px] text-muted-foreground mt-[1px]">{ins.riskLevel} · {ins.estimatedTime}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0 mt-[1px] whitespace-nowrap">{ins.priority}</span>
                    </motion.div>
                  )
                })
              )}
            </div>
          </div>

          {/* BOTTOM RIGHT: My Tasks */}
          <div className="bg-card border border-border rounded-[16px] overflow-hidden" style={{boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
            <div className="flex items-center justify-between px-[20px] py-[14px] border-b border-border">
              <p className="text-[14px] font-semibold text-foreground">My Tasks</p>
              <button onClick={() => setShowAddTask(true)} className="flex items-center gap-[4px] text-[12px] font-semibold text-foreground hover:text-[#4F6BFF] transition-colors">
                <Plus size={13}/>Add Task
              </button>
            </div>
            {/* Search */}
            <div className="px-[16px] py-[10px] border-b border-border">
              <div className="relative">
                <Search size={13} className="absolute left-[10px] top-1/2 -translate-y-1/2 text-muted-foreground"/>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search tasks..."
                  className="w-full h-[32px] pl-[30px] pr-[10px] bg-muted border border-border rounded-[8px] text-[12px] placeholder:text-muted-foreground focus:outline-none focus:border-[#4F6BFF] transition-colors"/>
                {search && <button onClick={()=>setSearch('')} className="absolute right-[8px] top-1/2 -translate-y-1/2"><X size={12} className="text-muted-foreground"/></button>}
              </div>
            </div>
            <div className="divide-y divide-[#F3F4F6]">
              <AnimatePresence>
                {tasks.filter(t=>!search||t.title.toLowerCase().includes(search.toLowerCase())).map(t=>(
                  <motion.div key={t.id} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                    className={`flex items-center gap-[12px] px-[20px] py-[11px] hover:bg-muted transition-colors group ${t.done?'opacity-50':''}`}>
                    <button onClick={()=>toggleTask(t.id)}
                      className={`w-[16px] h-[16px] rounded-[4px] border-2 flex items-center justify-center shrink-0 transition-colors ${t.done?'bg-[#059669] border-[#059669]':'border-[#D1D5DB] hover:border-[#4F6BFF]'}`}>
                      {t.done && <CheckCircle2 size={10} className="text-white"/>}
                    </button>
                    <p className={`flex-1 text-[12.5px] font-medium truncate ${t.done?'line-through text-muted-foreground':'text-foreground'}`}>{t.title}</p>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0 hidden group-hover:inline">{t.category}</span>
                    <div className="flex items-center gap-[4px] text-[10px] text-muted-foreground shrink-0">
                      <Calendar size={9}/>{t.due}
                    </div>
                    <span className="text-[9px] font-bold px-[6px] py-[1px] rounded-full shrink-0" style={{color:t.color,background:t.color+'18'}}>{t.priority}</span>
                    <button className="text-[#E5E7EB] hover:text-muted-foreground transition-colors shrink-0"><MoreHorizontal size={13}/></button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <div className="px-[20px] py-[10px] border-t border-border">
              <button className="text-[12px] font-semibold text-[#4F6BFF] hover:underline flex items-center gap-[4px]">
                View all tasks <ChevronRight size={12}/>
              </button>
            </div>
          </div>
        </div>

        {/* ── ADD TASK MODAL ── */}
        <AnimatePresence>
          {showAddTask && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-[16px]">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddTask(false)} className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-card border border-border rounded-[16px] p-[24px] w-full max-w-[400px] shadow-2xl z-10">
                <div className="flex items-center justify-between mb-[16px]">
                  <h3 className="text-[16px] font-semibold text-foreground">Add New Task</h3>
                  <button onClick={() => setShowAddTask(false)} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
                </div>
                <div className="flex flex-col gap-[14px]">
                  <div>
                    <label htmlFor="newTaskTitleInput" className="text-[12px] font-medium text-muted-foreground block mb-[4px]">Task Title</label>
                    <input id="newTaskTitleInput" type="text" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} placeholder="e.g. Request recommendation letter" className="w-full h-[38px] px-[12px] bg-muted border border-border rounded-[8px] text-[13px] text-foreground focus:outline-none focus:border-[#4F6BFF]" />
                  </div>
                  <div>
                    <label htmlFor="newTaskCategorySelect" className="text-[12px] font-medium text-muted-foreground block mb-[4px]">Category</label>
                    <select id="newTaskCategorySelect" value={newTaskCategory} onChange={e => setNewTaskCategory(e.target.value)} className="w-full h-[38px] px-[12px] bg-muted border border-border rounded-[8px] text-[13px] text-foreground focus:outline-none focus:border-[#4F6BFF]">
                      <option value="Application">Application</option>
                      <option value="Documents">Documents</option>
                      <option value="Entrance Exam">Entrance Exam</option>
                      <option value="Scholarship">Scholarship</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-[8px] mt-[10px]">
                    <button onClick={() => setShowAddTask(false)} className="px-[14px] h-[34px] border border-border rounded-[8px] text-[12px] font-medium text-foreground">Cancel</button>
                    <button onClick={handleAddTask} className="px-[16px] h-[34px] bg-[#4F6BFF] text-white rounded-[8px] text-[12px] font-semibold hover:bg-[#3D56E0]">Save Task</button>
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
