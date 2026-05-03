'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Logo from './Logo'
import { 
  Home, 
  Search, 
  ClipboardList, 
  FileText, 
  Bell, 
  User, 
  LogOut
} from 'lucide-react'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '@/lib/firebase/config'
import { doc, onSnapshot, collection, query, where, updateDoc, writeBatch, getDocs } from 'firebase/firestore'
import { useAuth } from '@/hooks/useAuth'
import { useState, useEffect } from 'react'

const StudentLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()

  // Fetch profile from Firebase
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) return
      const unsubProfile = onSnapshot(
        doc(db, 'student_profiles', user.uid),
        (snap) => setProfile(snap.data())
      )
      return unsubProfile
    })
    return unsub
  }, [])

  const getName = () => {
    const rawName = profile?.fullName || profile?.name || user?.displayName
    if (rawName) {
      return rawName.split(' ').map((word: string) => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ')
    }
    const email = user?.email || ''
    if (email.includes('@')) {
      const prefix = email.split('@')[0]
      return prefix.charAt(0).toUpperCase() + prefix.slice(1).toLowerCase()
    }
    return 'Student'
  }

  const name = getName()
  const firstLetter = name.charAt(0).toUpperCase()
  const photoURL = profile?.photoURL
  const isVerified = profile?.documents?.marksheet_10th 
    && profile?.documents?.marksheet_12th 
    && profile?.documents?.id_proof

  // Notifications State
  const [notifs, setNotifs] = useState<any[]>([])
  const [showNotifs, setShowNotifs] = useState(false)

  // Listen to notifications
  useEffect(() => {
    if (!user?.uid) return
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid)
    )
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({
        id: d.id, ...d.data()
      }))
      list.sort((a: any, b: any) => 
        (b.createdAt?.seconds || 0) - 
        (a.createdAt?.seconds || 0))
      setNotifs(list)
    })
    return unsub
  }, [user?.uid])

  const unread = notifs.filter(n => !n.isRead).length

  async function markRead(id: string) {
    await updateDoc(
      doc(db, 'notifications', id),
      { isRead: true }
    )
  }

  async function markAllRead() {
    if (!user?.uid) return
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      where('isRead', '==', false)
    )
    const snap = await getDocs(q)
    const batch = writeBatch(db)
    snap.docs.forEach(d => {
      batch.update(d.ref, { isRead: true })
    })
    await batch.commit()
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = () => {
      if (showNotifs) setShowNotifs(false)
    }
    document.addEventListener('mousedown', handler)
    return () => 
      document.removeEventListener('mousedown', handler)
  }, [showNotifs])

  // Don't wrap the onboarding page in the dashboard layout
  if (pathname.includes("/student/onboarding")) {
    return <>{children}</>;
  }

  const navItems = [
    { name: 'Dashboard', href: '/student/dashboard', icon: Home },
    { name: 'Applications', href: '/student/applications', icon: ClipboardList },
    { name: 'Discover', href: '/student/discover', icon: Search },
    { name: 'Profile', href: '/student/profile', icon: User },
  ]

  const handleLogout = async () => {
    await signOut(auth)
    router.push('/auth/login')
  }


  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-white">
      {/* SIDEBAR (Desktop) */}
      <aside className="hidden lg:flex flex-col w-[240px] h-screen fixed left-0 top-0 bg-[var(--bg-primary)] border-r border-brand-indigo/15 p-6 z-50">
        <div className="mb-10 px-2 flex flex-col gap-1">
          <Logo height={32} href="/student/dashboard" />
          <span className="text-[10px] font-bold text-brand-indigo uppercase tracking-widest px-1">Student Portal</span>
        </div>

        {/* Profile Bubble */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          background: 'rgba(79,70,229,0.08)',
          border: '1px solid rgba(79,70,229,0.2)',
          borderRadius: '16px',
          cursor: 'pointer',
          marginBottom: '24px',
        }}
        onClick={() => router.push('/student/profile')}
        >
          {/* Avatar */}
          <div style={{
            width: '42px', height: '42px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: '800',
            color: 'white',
            overflow: 'hidden',
            flexShrink: 0,
          }}>
            {photoURL 
              ? <img src={photoURL} 
                  style={{width:'100%',height:'100%',
                    objectFit:'cover'}} />
              : firstLetter
            }
          </div>
          
          {/* Name + status */}
          <div>
            <div style={{
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
            }}>
              {name.split(' ')[0]}
            </div>
            <div style={{
              fontSize: '11px',
              color: isVerified 
                ? '#4ADE80' 
                : 'rgba(255,255,255,0.4)',
            }}>
              {isVerified ? '✓ Verified' : 'Unverified'}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                  isActive 
                  ? 'bg-brand-indigo/15 text-brand-indigoLight' 
                  : 'text-white/50 hover:bg-white/5 hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className="absolute left-0 top-2 bottom-2 w-1 bg-brand-indigo rounded-r-full"
                  />
                )}
                <item.icon size={20} className={isActive ? 'text-brand-indigoLight' : 'group-hover:text-brand-indigo transition-colors'} />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="mt-auto pt-6 border-t border-white/5 flex flex-col gap-2">
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* BOTTOM NAV (Mobile) */}
      <nav className="lg:hidden fixed bottom-6 left-6 right-6 h-16 bg-[var(--bg-primary)]/80 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-around px-4 z-[100] shadow-2xl">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href} className={`p-2 transition-colors ${isActive ? 'text-brand-indigo' : 'text-white/40'}`}>
              <item.icon size={24} />
            </Link>
          )
        })}
      </nav>

      {/* MAIN CONTENT AREA */}
      <main style={{ marginLeft: '240px', minHeight: '100vh', background: '#0A0A0F', width: 'calc(100% - 240px)', overflowX: 'hidden' }} className="pb-24 lg:pb-0">
        <div className="w-full p-8">
          {/* Top Header */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
            <div style={{ position: 'relative' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowNotifs(!showNotifs)
                }}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '50%',
                  width: '40px', height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  fontSize: '18px',
                  color: 'white'
                }}
              >
                <Bell size={20} />
                {unread > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '-2px', right: '-2px',
                    width: '18px', height: '18px',
                    borderRadius: '50%',
                    background: '#EF4444',
                    color: 'white',
                    fontSize: '10px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {unread > 9 ? '9+' : unread}
                  </div>
                )}
              </button>

              {/* Dropdown panel */}
              {showNotifs && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: 'absolute',
                    top: '48px', right: 0,
                    width: '360px',
                    maxHeight: '480px',
                    overflowY: 'auto',
                    background: 'rgba(13,13,25,0.97)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(79,70,229,0.25)',
                    borderRadius: '20px',
                    zIndex: 200,
                    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                  }}
                >
                  {/* Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 20px',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <span style={{
                      color: 'white', fontSize: '16px',
                      fontWeight: '700',
                    }}>
                      Notifications
                    </span>
                    {unread > 0 && (
                      <button
                        onClick={markAllRead}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#6366F1',
                          fontSize: '13px',
                          cursor: 'pointer',
                        }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* List */}
                  {notifs.length === 0 ? (
                    <div style={{
                      padding: '32px',
                      textAlign: 'center',
                      color: 'rgba(255,255,255,0.3)',
                      fontSize: '14px',
                    }}>
                      No notifications yet
                    </div>
                  ) : notifs.map((n) => {
                    const colors: any = {
                      success: '#22C55E',
                      warning: '#F59E0B',
                      update: '#4F46E5',
                      info: '#06B6D4',
                      application: '#8B5CF6',
                    }
                    const color = colors[n.type] || '#4F46E5'
                    return (
                      <div
                        key={n.id}
                        onClick={() => markRead(n.id)}
                        style={{
                          padding: '14px 20px',
                          borderBottom: 
                            '1px solid rgba(255,255,255,0.04)',
                          background: n.isRead
                            ? 'transparent'
                            : `${color}08`,
                          cursor: 'pointer',
                          display: 'flex',
                          gap: '12px',
                          alignItems: 'flex-start',
                        }}
                      >
                        <div style={{
                          width: '36px', height: '36px',
                          borderRadius: '50%',
                          background: `${color}18`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '16px',
                          flexShrink: 0,
                        }}>
                          {n.type === 'success' ? '✅'
                            : n.type === 'warning' ? '⚠️'
                            : n.type === 'application' ? '📋'
                            : 'ℹ️'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: n.isRead ? '400' : '600',
                            marginBottom: '3px',
                          }}>
                            {n.title}
                          </div>
                          <div style={{
                            color: 'rgba(255,255,255,0.5)',
                            fontSize: '12px',
                            lineHeight: '1.5',
                          }}>
                            {n.message}
                          </div>
                        </div>
                        {!n.isRead && (
                          <div style={{
                            width: '8px', height: '8px',
                            borderRadius: '50%',
                            background: color,
                            flexShrink: 0,
                            marginTop: '4px',
                          }}/>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}

export default StudentLayout
