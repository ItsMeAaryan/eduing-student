'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, Zap } from 'lucide-react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase/config'
import { motion } from 'framer-motion'
import AuthContainer from '@/components/AuthContainer'

const DEMO_USER = {
  email: 'aaryan.student@eduing.in',
  password: 'demo123',
  name: 'Aaryan Sharma',
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function fillDemo() {
    setEmail(DEMO_USER.email)
    setPassword(DEMO_USER.password)
    setError('')
  }

  async function handleLogin(e?: React.FormEvent) {
    if (e) e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      
      const userDoc = await getDoc(doc(db, 'users', cred.user.uid))
      const userData = userDoc.data()
      const role = userData?.role
      
      if (role === 'student') {
        router.push('/student/dashboard')
      } else if (role === 'super_admin') {
        router.push('/admin/dashboard')
      } else {
        setError('Unauthorized access')
        setLoading(false)
      }
    } catch (err: any) {
      setError('Invalid email or password')
      setLoading(false)
    }
  }

  const inputClasses = "w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:border-brand-indigo/50 focus:bg-brand-indigo/5 focus:shadow-[0_0_15px_rgba(79,70,229,0.15)] outline-none transition-all placeholder:text-white/40 hover:border-white/20"
  const labelClasses = "block text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-2 ml-1"

  return (
    <AuthContainer>
      <div className="w-full">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
          Welcome back
        </h1>
        <p className="text-white/40 text-sm">
          Sign in to your intelligent workspace
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label htmlFor="email" className={labelClasses}>Email Address</label>
          <input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className={inputClasses}
            required
          />
        </div>

        <div>
          <div className="flex justify-between items-end mb-2">
            <label htmlFor="password" className={labelClasses + " !mb-0"}>Secure Password</label>
            <Link href="/auth/forgot-password" className="text-[10px] font-bold text-brand-indigoLight hover:text-white transition-colors uppercase tracking-widest">
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={inputClasses + " pr-12"}
              required
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && (
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-xs font-semibold text-center bg-red-400/10 py-3 rounded-xl border border-red-400/20"
          >
            {error}
          </motion.p>
        )}

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-brand-indigo hover:bg-brand-indigoLight text-white rounded-2xl font-bold text-sm uppercase tracking-widest shadow-[0_8px_24px_rgba(79,70,229,0.25)] hover:shadow-[0_12px_32px_rgba(79,70,229,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : 'Access Workspace'}
        </motion.button>
      </form>

      <div className="mt-8 relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/5"></div>
        </div>
        <div className="relative bg-[#0A0A0F] px-4 text-[10px] font-black uppercase text-white/30 tracking-widest">
          Or Continue With
        </div>
      </div>

      <div className="mt-8">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="button"
          onClick={fillDemo}
          className="w-full group relative flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-brand-indigo/30 rounded-2xl transition-all overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-brand-indigo/0 via-brand-indigo/5 to-brand-indigo/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-brand-gold/10 text-brand-gold flex items-center justify-center border border-brand-gold/20">
              <Zap size={18} className="fill-brand-gold" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-white mb-0.5">Explore EDUING instantly</div>
              <div className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Demo Account</div>
            </div>
          </div>
          <span className="text-brand-indigoLight font-bold text-sm group-hover:translate-x-1 transition-transform relative z-10">
            →
          </span>
        </motion.button>
      </div>

      </div>
    </AuthContainer>
  )
}
