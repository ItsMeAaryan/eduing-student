'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Calendar, 
  Loader2,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth'
import { 
  doc, 
  setDoc, 
  getDoc,
  serverTimestamp 
} from 'firebase/firestore'
import { auth, db } from '@/lib/firebase/config'
import { useAuth } from '@/hooks/useAuth'
import Logo from '@/components/Logo'

export default function AuthPage() {
  const router = useRouter()
  const { user, isLoggedIn, loading: authLoading } = useAuth()
  
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Login Form State
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })

  // Register Form State
  const [registerData, setRegisterData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    dob: ''
  })

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && isLoggedIn) {
      router.push('/student/dashboard')
    }
  }, [isLoggedIn, authLoading, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const cred = await signInWithEmailAndPassword(auth, loginData.email, loginData.password)
      const userDoc = await getDoc(doc(db, 'users', cred.user.uid))
      const userData = userDoc.data()
      
      if (userData?.role === 'student') {
        router.push('/student/dashboard')
      } else if (userData?.role === 'super_admin') {
        router.push('/admin/dashboard')
      } else {
        setError('Unauthorized access role.')
        setLoading(false)
      }
    } catch (err: any) {
      setError('Invalid email or password.')
      setLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setLoading(true)
    setError('')
    const demoEmail = 'aaryan.student@eduing.in'
    const demoPassword = 'demo123'
    
    // Visual feedback of auto-filling
    setLoginData({
      email: demoEmail,
      password: demoPassword
    })

    try {
      await signInWithEmailAndPassword(auth, demoEmail, demoPassword)
      router.push('/student/dashboard')
    } catch (err: any) {
      setError('Demo account is currently unavailable.')
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!/^\d+$/.test(registerData.phone)) {
      setError('Phone number must contain only digits.')
      setLoading(false)
      return
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, registerData.email, registerData.password)
      
      await setDoc(doc(db, 'users', cred.user.uid), {
        uid: cred.user.uid,
        email: registerData.email,
        role: 'student',
        createdAt: serverTimestamp(),
        isVerified: false,
      })
      
      await setDoc(doc(db, 'student_profiles', cred.user.uid), {
        uid: cred.user.uid,
        fullName: registerData.fullName,
        email: registerData.email,
        phone: registerData.phone,
        dob: registerData.dob,
        profileComplete: false,
        updatedAt: serverTimestamp(),
      })
      
      router.push('/student/dashboard')
    } catch (err: any) {
      setError(err.message || 'Registration failed.')
      setLoading(false)
    }
  }

  if (authLoading || (isLoggedIn && !loading)) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#6366F1] animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] relative overflow-hidden flex items-center justify-center p-4">
      {/* BACKGROUND ELEMENTS */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Subtle Ambient Glow behind card */}
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#6366F1]/10 blur-[120px] rounded-full" 
        />
        
        {/* Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#6366F1]/5 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[100px] rounded-full" />
        
        {/* Grid Overlay */}
        <div className="absolute inset-0 opacity-[0.05]" style={{ 
          backgroundImage: 'linear-gradient(rgba(99,102,241,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative z-10 w-full max-w-[460px] flex flex-col items-center">
        {/* LOGO */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Logo height={44} />
        </motion.div>

        {/* AUTH CARD */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="w-full glass-card border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_20px_rgba(99,102,241,0.05)] relative overflow-hidden"
        >
          {/* Subtle Inner Glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

          {/* TABS */}
          <div className="flex p-2 bg-white/5 border-b border-white/5">
            <button
              onClick={() => { setActiveTab('login'); setError(''); }}
              className={`flex-1 py-4 text-sm font-bold rounded-xl transition-all duration-300 relative ${
                activeTab === 'login' ? 'text-white' : 'text-white/40 hover:text-white/60'
              }`}
            >
              {activeTab === 'login' && (
                <motion.div 
                  layoutId="active-tab"
                  className="absolute inset-0 bg-white/10 rounded-xl shadow-[inset_0_0_10px_rgba(255,255,255,0.05)] border border-white/5"
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.6 }}
                />
              )}
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Zap size={14} className={activeTab === 'login' ? 'text-[#6366F1]' : ''} />
                Login
              </span>
            </button>
            <button
              onClick={() => { setActiveTab('register'); setError(''); }}
              className={`flex-1 py-4 text-sm font-bold rounded-xl transition-all duration-300 relative ${
                activeTab === 'register' ? 'text-white' : 'text-white/40 hover:text-white/60'
              }`}
            >
              {activeTab === 'register' && (
                <motion.div 
                  layoutId="active-tab"
                  className="absolute inset-0 bg-white/10 rounded-xl shadow-[inset_0_0_10px_rgba(255,255,255,0.05)] border border-white/5"
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.6 }}
                />
              )}
              <span className="relative z-10 flex items-center justify-center gap-2">
                <ShieldCheck size={14} className={activeTab === 'register' ? 'text-[#6366F1]' : ''} />
                Register
              </span>
            </button>
          </div>

          <div className="p-8 md:p-10">
            <AnimatePresence mode="wait">
              {activeTab === 'login' ? (
                <motion.div
                  key="login-form"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
                    <p className="text-white/40 text-sm">Sign in to your student dashboard</p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-white/30 uppercase tracking-widest ml-1">Email Address</label>
                      <motion.div 
                        whileFocus={{ scale: 1.01 }}
                        className="relative group"
                      >
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-white/20 group-focus-within:text-[#6366F1] transition-colors" />
                        <input
                          type="email"
                          required
                          value={loginData.email}
                          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 outline-none focus:border-[#6366F1]/50 focus:bg-white/[0.06] focus:shadow-[0_0_20px_rgba(99,102,241,0.1)] transition-all"
                          placeholder="your.email@example.com"
                        />
                      </motion.div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-[11px] font-bold text-white/30 uppercase tracking-widest">Password</label>
                        <Link href="/auth/forgot-password" title="Forgot Password?" className="text-[11px] font-bold text-[#6366F1] hover:text-[#818cf8] transition-colors">
                          Forgot?
                        </Link>
                      </div>
                      <motion.div 
                        whileFocus={{ scale: 1.01 }}
                        className="relative group"
                      >
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-white/20 group-focus-within:text-[#6366F1] transition-colors" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-4 pl-12 pr-14 text-white placeholder:text-white/20 outline-none focus:border-[#6366F1]/50 focus:bg-white/[0.06] focus:shadow-[0_0_20px_rgba(99,102,241,0.1)] transition-all"
                          placeholder="••••••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors p-1"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </motion.div>
                    </div>

                    {error && (
                      <motion.p 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-xs text-center bg-red-400/10 py-3 rounded-xl border border-red-400/20"
                      >
                        {error}
                      </motion.p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-[#4F46E5] to-[#6366F1] text-white font-bold py-5 rounded-full shadow-[0_12px_40px_-10px_rgba(79,70,229,0.5),0_0_20px_rgba(79,70,229,0.2)] hover:shadow-[0_20px_50px_-10px_rgba(79,70,229,0.6),0_0_30px_rgba(79,70,229,0.3)] hover:-translate-y-1 active:scale-[0.97] active:shadow-inner transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3 group overflow-hidden relative"
                    >
                      {/* Shimmer / Light Sweep Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                      
                      {/* Inner Highlight */}
                      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

                      {loading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <>
                          <span className="text-[15px] tracking-wide">Sign In</span>
                          <ArrowRight className="w-5.5 h-5.5 group-hover:translate-x-1.5 transition-transform duration-300" />
                        </>
                      )}
                    </button>

                    <div className="pt-2 flex flex-col items-center gap-4">
                      <button
                        type="button"
                        onClick={handleDemoLogin}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/[0.03] border border-white/10 text-white/50 text-[13px] font-bold hover:text-white hover:bg-white/[0.08] hover:border-white/20 hover:scale-[1.02] transition-all duration-300 active:scale-[0.98] group"
                      >
                        <Zap size={14} className="text-[#6366F1] group-hover:animate-pulse" />
                        Try Demo Account
                      </button>
                      <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.2em]">Explore platform instantly</p>
                    </div>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="register-form"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
                    <p className="text-white/40 text-sm">Join the student community today</p>
                  </div>

                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-white/30 uppercase tracking-widest ml-1">Full Name</label>
                      <motion.div whileFocus={{ scale: 1.01 }} className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-white/20 group-focus-within:text-[#6366F1] transition-colors" />
                        <input
                          type="text"
                          required
                          value={registerData.fullName}
                          onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 outline-none focus:border-[#6366F1]/50 focus:bg-white/[0.06] focus:shadow-[0_0_20px_rgba(99,102,241,0.1)] transition-all"
                          placeholder="Your Name"
                        />
                      </motion.div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-white/30 uppercase tracking-widest ml-1">Email</label>
                        <motion.div whileFocus={{ scale: 1.01 }} className="relative group">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#6366F1] transition-colors" />
                          <input
                            type="email"
                            required
                            value={registerData.email}
                            onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white text-sm placeholder:text-white/20 outline-none focus:border-[#6366F1]/50 focus:bg-white/[0.06] focus:shadow-[0_0_20px_rgba(99,102,241,0.1)] transition-all"
                            placeholder="Email"
                          />
                        </motion.div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-white/30 uppercase tracking-widest ml-1">Phone</label>
                        <motion.div whileFocus={{ scale: 1.01 }} className="relative group">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#6366F1] transition-colors" />
                          <input
                            type="tel"
                            required
                            value={registerData.phone}
                            onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                            onInput={(e) => {
                              e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '');
                            }}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white text-sm placeholder:text-white/20 outline-none focus:border-[#6366F1]/50 focus:bg-white/[0.06] focus:shadow-[0_0_20px_rgba(99,102,241,0.1)] transition-all"
                            placeholder="Digits only"
                          />
                        </motion.div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-white/30 uppercase tracking-widest ml-1">Date of Birth</label>
                        <motion.div whileFocus={{ scale: 1.01 }} className="relative group">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#6366F1] transition-colors" />
                          <input
                            type="date"
                            required
                            value={registerData.dob}
                            onChange={(e) => setRegisterData({ ...registerData, dob: e.target.value })}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white text-sm outline-none focus:border-[#6366F1]/50 focus:bg-white/[0.06] transition-all [color-scheme:dark]"
                          />
                        </motion.div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-white/30 uppercase tracking-widest ml-1">Password</label>
                        <motion.div whileFocus={{ scale: 1.01 }} className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#6366F1] transition-colors" />
                          <input
                            type="password"
                            required
                            value={registerData.password}
                            onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white text-sm placeholder:text-white/20 outline-none focus:border-[#6366F1]/50 focus:bg-white/[0.06] focus:shadow-[0_0_20px_rgba(99,102,241,0.1)] transition-all"
                            placeholder="••••••••"
                          />
                        </motion.div>
                      </div>
                    </div>

                    {error && (
                      <motion.p 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-xs text-center bg-red-400/10 py-3 rounded-xl border border-red-400/20"
                      >
                        {error}
                      </motion.p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-[#4F46E5] to-[#6366F1] text-white font-bold py-5 rounded-full shadow-[0_12px_40px_-10px_rgba(79,70,229,0.5),0_0_20px_rgba(79,70,229,0.2)] hover:shadow-[0_20px_50px_-10px_rgba(79,70,229,0.6),0_0_30px_rgba(79,70,229,0.3)] hover:-translate-y-1 active:scale-[0.97] active:shadow-inner transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3 group overflow-hidden relative"
                    >
                      {/* Shimmer / Light Sweep Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                      
                      {/* Inner Highlight */}
                      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

                      {loading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <>
                          <span className="text-[15px] tracking-wide">Create Account</span>
                          <ArrowRight className="w-5.5 h-5.5 group-hover:translate-x-1.5 transition-transform duration-300" />
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Support Links */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 flex items-center gap-6"
        >
          <Link href="/about" className="text-white/20 hover:text-white/40 transition-colors text-[11px] font-bold uppercase tracking-wider">Help Center</Link>
          <div className="w-1 h-1 bg-white/10 rounded-full" />
          <Link href="/programs" className="text-white/20 hover:text-white/40 transition-colors text-[11px] font-bold uppercase tracking-wider">Privacy Policy</Link>
          <div className="w-1 h-1 bg-white/10 rounded-full" />
          <Link href="/universities" className="text-white/20 hover:text-white/40 transition-colors text-[11px] font-bold uppercase tracking-wider">Terms of Service</Link>
        </motion.div>
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          opacity: 0.3;
          cursor: pointer;
        }
      `}</style>
    </div>
  )
}
