'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase/config'
import ProtectedRoute from '@/components/ProtectedRoute'
import { 
  ClipboardList, 
  Search, 
  Filter, 
  ChevronRight, 
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ApplicationsPage() {
  const router = useRouter()
  const [applications, setApplications] = useState<any[]>([])
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  function normalizeStatus(status: string) {
    if (!status) return 'submitted'
    if (status === 'review') return 'under_review'
    if (status === 'accepted') return 'selected'
    if (status === 'reject') return 'rejected'
    return status
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) { router.push('/auth/login'); return }
      
      const fetchApps = async () => {
        const appsQ = query(
          collection(db, 'applications'),
          where('studentId', '==', user.uid)
        )
        const appsQ2 = query(
          collection(db, 'applications'),
          where('userId', '==', user.uid)
        )

        try {
          const [snap1, snap2] = await Promise.all([
            getDocs(appsQ),
            getDocs(appsQ2),
          ])

          const seen = new Set()
          const apps: any[] = []

          for (const doc of [...snap1.docs, ...snap2.docs]) {
            if (!seen.has(doc.id)) {
              seen.add(doc.id)
              apps.push({ id: doc.id, ...doc.data() })
            }
          }

          apps.sort((a: any, b: any) => {
            const da = a.createdAt?.toDate?.() || new Date(0)
            const db2 = b.createdAt?.toDate?.() || new Date(0)
            return db2 - da
          })

          setApplications(apps)
          setLoading(false)
        } catch (err) {
          console.error("FIRESTORE ERROR:", err)
          setLoading(false)
        }
      }

      fetchApps()
    })
    return unsub
  }, [])

  const filtered = applications.filter(app => {
    const status = normalizeStatus(app.status)
    const matchFilter = filter === 'ALL' ||
      (filter === 'SUBMITTED' && status === 'submitted') ||
      (filter === 'REVIEW' && status === 'under_review') ||
      (filter === 'ACCEPTED' && status === 'selected') ||
      (filter === 'REJECTED' && status === 'rejected')
    
    const matchSearch = !search ||
      app.universityName?.toLowerCase().includes(search.toLowerCase()) ||
      app.program?.toLowerCase().includes(search.toLowerCase())
    
    return matchFilter && matchSearch
  })

  if (loading) return (
    <div className="min-h-screen bg-[#08080A] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
    </div>
  )

  const statusConfig: any = {
    submitted: { bg: 'bg-indigo-500/10', color: 'text-indigo-400', border: 'border-indigo-500/20', label: 'Submitted', icon: Clock },
    under_review: { bg: 'bg-amber-500/10', color: 'text-amber-400', border: 'border-amber-500/20', label: 'In Review', icon: AlertCircle },
    selected: { bg: 'bg-green-500/10', color: 'text-green-400', border: 'border-green-500/20', label: 'Accepted ✓', icon: CheckCircle2 },
    rejected: { bg: 'bg-red-500/10', color: 'text-red-400', border: 'border-red-500/20', label: 'Rejected', icon: XCircle },
  }

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="min-h-screen bg-[#08080A] p-8 text-white font-sans selection:bg-indigo-500/30">
        
        {/* HEADER */}
        <div className="max-w-6xl mx-auto mb-12">
          <div className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
            <ClipboardList size={14} /> My Admissions Dossier
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">Track Applications</h1>
          <p className="text-white/40 text-lg">Centralized monitoring for your academic journey.</p>
        </div>

        {/* FILTERS & SEARCH */}
        <div className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="flex bg-[#111114] border border-white/5 rounded-2xl p-1 overflow-x-auto no-scrollbar w-full md:w-auto">
            {['ALL', 'SUBMITTED', 'REVIEW', 'ACCEPTED', 'REJECTED'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  filter === f ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-white/30 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-indigo-400 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search by university..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#111114] border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm placeholder:text-white/10 focus:border-indigo-500/30 outline-none transition-all"
            />
          </div>
        </div>

        {/* APPLICATIONS LIST */}
        <div className="max-w-6xl mx-auto space-y-4">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center bg-[#111114] border border-white/5 rounded-[40px]">
                <ClipboardList className="mx-auto mb-6 text-white/5" size={64} />
                <h3 className="text-xl font-black text-white/40">No records matching your search</h3>
                <p className="text-white/20 text-sm mt-2">Try adjusting your filters or search criteria.</p>
              </motion.div>
            ) : (
              filtered.map((app, idx) => {
                const status = normalizeStatus(app.status)
                const config = statusConfig[status] || statusConfig.submitted
                const Icon = config.icon

                return (
                  <motion.div
                    key={app.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => router.push(`/student/applications/${app.id}`)}
                    className="group bg-[#111114] border border-white/5 rounded-[32px] p-6 flex flex-col md:flex-row items-center gap-8 cursor-pointer hover:border-indigo-500/30 hover:bg-[#15151a] transition-all relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    {/* University Logo/Icon */}
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white text-2xl font-black shrink-0 shadow-xl shadow-indigo-600/20">
                      {app.universityName?.charAt(0).toUpperCase() || 'U'}
                    </div>

                    {/* Basic Info */}
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-xl font-black mb-1 group-hover:text-indigo-400 transition-colors">{app.universityName || 'University'}</h3>
                      <div className="flex items-center justify-center md:justify-start gap-2 text-white/40 text-xs font-bold uppercase tracking-widest">
                        <Building2 size={12} /> {app.program || 'General Program'}
                      </div>
                    </div>

                    {/* Date */}
                    <div className="text-center md:text-right hidden sm:block">
                      <div className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Applied On</div>
                      <div className="text-sm font-bold">{app.createdAt?.toDate?.().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) || 'Recent'}</div>
                    </div>

                    {/* Status Badge */}
                    <div className={`px-6 py-3 rounded-2xl border ${config.bg} ${config.border} ${config.color} flex items-center gap-2 shrink-0`}>
                       <Icon size={16} />
                       <span className="text-[10px] font-black uppercase tracking-widest">{config.label}</span>
                    </div>

                    {/* Action Arrow */}
                    <div className="p-3 rounded-full bg-white/5 text-white/20 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                      <ChevronRight size={20} />
                    </div>
                  </motion.div>
                )
              })
            )}
          </AnimatePresence>
        </div>

      </div>
    </ProtectedRoute>
  )
}
