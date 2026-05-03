'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ProtectedRoute from '@/components/ProtectedRoute'
import Logo from '@/components/Logo'
import { 
  Building2, 
  Users, 
  ClipboardList, 
  BarChart3, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  MessageSquare,
  ArrowUpRight,
  LogOut,
  Globe,
  Phone,
  Mail,
  Clock,
  LayoutDashboard
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'

const StatCard = ({ label, value, icon: Icon, trend, index }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.1 }}
    className="glass-card p-6 border-white/5"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 rounded-xl bg-brand-indigo/10 text-brand-indigo">
        <Icon size={24} />
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-[10px] font-bold text-green-500">
          <ArrowUpRight size={12} /> {trend}
        </div>
      )}
    </div>
    <div className="text-3xl font-extrabold mb-1">{value}</div>
    <div className="text-xs text-white/40 font-bold uppercase tracking-widest">{label}</div>
  </motion.div>
)

export default function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [pendingUnis, setPendingUnis] = useState([
    { id: 'p1', name: 'Amrita Vishwa Vidyapeetham', city: 'Coimbatore', state: 'Tamil Nadu', email: 'admin@amrita.edu', phone: '+91 98765 43210', registered: 2 },
    { id: 'p2', name: 'Thapar Institute', city: 'Patiala', state: 'Punjab', email: 'registrar@thapar.edu', phone: '+91 98765 43211', registered: 3 },
    { id: 'p3', name: 'KIIT University', city: 'Bhubaneswar', state: 'Odisha', email: 'admissions@kiit.ac.in', phone: '+91 98765 43212', registered: 5 },
  ])

  const handleLogout = async () => {
    await signOut(auth)
    router.push('/auth/login')
  }

  const approveUni = (id: string) => {
    setPendingUnis(pendingUnis.filter(u => u.id !== id))
    // Mock toast could be added here
  }

  return (
    <ProtectedRoute allowedRoles={['super_admin']}>
      <div className="min-h-screen bg-[#08080F] text-white flex">
        {/* SIDEBAR */}
        <aside className="w-[280px] h-screen fixed left-0 top-0 bg-[#08080F] border-r border-white/5 flex flex-col p-8">
          <div className="mb-12">
            <Logo height={32} />
            <div className="text-[10px] font-bold text-brand-indigo uppercase tracking-[0.3em] mt-2 px-1">Super Admin</div>
          </div>

          <nav className="flex-1 space-y-2">
            {[
              { id: 'overview', name: 'Overview', icon: LayoutDashboard },
              { id: 'universities', name: 'Universities', icon: Building2 },
              { id: 'students', name: 'Students', icon: Users },
              { id: 'applications', name: 'Applications', icon: ClipboardList },
              { id: 'analytics', name: 'Platform Stats', icon: BarChart3 },
            ].map(item => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-200 ${
                  activeTab === item.id ? 'bg-brand-indigo/15 text-white font-bold' : 'text-white/30 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon size={20} />
                <span className="text-sm">{item.name}</span>
              </button>
            ))}
          </nav>

          <button 
            onClick={handleLogout}
            className="mt-auto flex items-center gap-4 px-5 py-3.5 rounded-2xl text-red-400/50 hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <LogOut size={20} />
            <span className="text-sm font-bold">Sign Out</span>
          </button>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 ml-[280px] p-12">
          <header className="mb-12 flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-[900] mb-2 uppercase tracking-tighter">Platform Control</h1>
              <p className="text-white/30 font-medium">Global infrastructure and user oversight</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 text-green-500 text-[10px] font-bold uppercase tracking-widest border border-green-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Network Online
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-12">
            <StatCard label="Approved Unis" value="487" icon={Building2} index={0} />
            <StatCard label="Pending" value="12" icon={Clock} index={1} />
            <StatCard label="Total Students" value="50k" icon={Users} trend="+12%" index={2} />
            <StatCard label="Applications" value="234k" icon={ClipboardList} index={3} />
            <StatCard label="Monthly Vol" value="8,420" icon={BarChart3} trend="+24%" index={4} />
            <StatCard label="Active Programs" value="2,847" icon={CheckCircle2} index={5} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
            {/* Pending Approvals */}
            <div className="xl:col-span-2">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold flex items-center gap-3">
                  Pending Approvals <span className="w-6 h-6 rounded-full bg-brand-gold/20 text-brand-gold text-[10px] flex items-center justify-center">{pendingUnis.length}</span>
                </h2>
                <button className="text-[10px] font-bold text-white/30 uppercase tracking-widest hover:text-white transition-colors">View All Queue</button>
              </div>

              <div className="space-y-4">
                {pendingUnis.map((uni, i) => (
                  <motion.div 
                    key={uni.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-card p-6 md:p-8 border-white/5 hover:border-brand-indigo/30 transition-all group"
                  >
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-xl font-bold text-white group-hover:text-brand-indigo transition-colors">{uni.name}</h3>
                          <div className="flex items-center gap-2 text-white/40 text-xs font-bold uppercase tracking-wider mt-1">
                            {uni.city}, {uni.state}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-6">
                           <div className="flex items-center gap-2 text-xs text-white/50"><Mail size={14} className="text-brand-indigo" /> {uni.email}</div>
                           <div className="flex items-center gap-2 text-xs text-white/50"><Phone size={14} className="text-brand-indigo" /> {uni.phone}</div>
                           <div className="flex items-center gap-2 text-xs text-brand-indigoLight hover:underline cursor-pointer"><Globe size={14} /> Official Website</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 self-end md:self-center">
                        <div className="text-right mr-4 hidden md:block">
                          <div className="text-[10px] font-bold text-white/20 uppercase mb-1">Registered</div>
                          <div className="text-xs font-bold text-white/60">{uni.registered} days ago</div>
                        </div>
                        <button onClick={() => approveUni(uni.id)} className="p-3 rounded-xl bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all shadow-lg shadow-green-500/10"><CheckCircle2 size={20} /></button>
                        <button className="p-3 rounded-xl bg-brand-gold/10 text-brand-gold hover:bg-brand-gold hover:text-[var(--bg-primary)] transition-all shadow-lg shadow-brand-gold/10"><MessageSquare size={20} /></button>
                        <button className="p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/10"><XCircle size={20} /></button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Quick Stats Sidebar */}
            <div className="space-y-10">
               <div className="glass-card p-8 border-brand-indigo/20 bg-brand-indigo/5">
                 <h3 className="text-lg font-bold mb-6">Security Audit</h3>
                 <div className="space-y-4">
                   {[
                     { label: 'Login Attempts', value: 'Normal', color: 'green' },
                     { label: 'Data Integrity', value: '99.9%', color: 'green' },
                     { label: 'Pending Audits', value: '2', color: 'yellow' },
                   ].map((item, i) => (
                     <div key={i} className="flex justify-between items-center text-sm">
                       <span className="text-white/40">{item.label}</span>
                       <span className={`font-bold text-${item.color}-500`}>{item.value}</span>
                     </div>
                   ))}
                 </div>
               </div>

               <div className="glass-card p-8 border-white/5">
                 <h3 className="text-lg font-bold mb-6">Recent Platform Activity</h3>
                 <div className="space-y-6">
                    {[
                      { user: 'VIT Vellore', action: 'Published results for B.Tech', time: '12m ago' },
                      { user: 'Super Admin', action: 'Updated security policy', time: '45m ago' },
                      { user: 'IIT Delhi', action: 'Updated program fees', time: '1h ago' },
                    ].map((activity, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="w-2 h-2 rounded-full bg-brand-indigo mt-1.5" />
                        <div>
                          <div className="text-xs font-bold text-white">{activity.user}</div>
                          <div className="text-xs text-white/50">{activity.action}</div>
                          <div className="text-[10px] text-white/20 font-bold uppercase mt-1">{activity.time}</div>
                        </div>
                      </div>
                    ))}
                 </div>
               </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
