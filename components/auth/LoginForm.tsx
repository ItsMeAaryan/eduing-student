'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase/config'
import { useAuth } from '@/hooks/useAuth'

const DEMO_USER = {
  email: 'aaryan.student@eduing.in',
  password: 'demo123',
  name: 'Aaryan Sharma',
}

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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

  const inputClasses = "w-full bg-white/[0.02] border border-white/10 rounded-[12px] px-4 h-[56px] text-[14px] text-white focus:border-brand-indigo focus:bg-brand-indigo/5 focus:ring-4 focus:ring-brand-indigo/10 outline-none transition-all duration-200 placeholder:text-white/30"
  const labelClasses = "block font-sans text-[13px] font-medium text-white/70 mb-2"

  return (
    <div className="w-full">
      <div className="mb-10 text-left">
        <h1 className="text-[42px] sm:text-[48px] font-display font-[800] tracking-tighter leading-[1.05] text-white mb-3">
          Admissions<br />
          Start Here.
        </h1>
        <p className="text-[15px] font-sans font-medium text-white/50 leading-relaxed">
          Sign in to continue your admissions journey.
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-[12px] p-4 flex gap-3 items-center">
            <AlertCircle className="text-red-400 shrink-0" size={18} />
            <p className="text-[13px] font-medium text-red-200/90">{error}</p>
          </div>
        )}

        <div>
          <label htmlFor="email" className={labelClasses}>
            Email Address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClasses}
            placeholder="john@example.com"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="password" className="block font-sans text-[13px] font-medium text-white/70">
              Password
            </label>
            <Link 
              href="/auth/forgot-password" 
              className="text-[12px] font-medium text-brand-indigoLight hover:text-white transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClasses}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full font-display font-bold text-[15px] bg-gradient-to-b from-[#4F46E5] to-[#4338CA] text-white h-[56px] rounded-[14px] shadow-[0_4px_12px_rgba(79,70,229,0.3),inset_0_1px_1px_rgba(255,255,255,0.2)] hover:shadow-[0_6px_16px_rgba(79,70,229,0.4),inset_0_1px_1px_rgba(255,255,255,0.25)] hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3"
        >
          {loading ? <Loader2 className="animate-spin text-white" size={18} /> : <span>Sign In</span>}
        </button>
      </form>

      <div className="mt-5">
        <button
          type="button"
          onClick={fillDemo}
          className="w-full font-display font-medium text-[14px] flex items-center justify-center h-[56px] bg-transparent border border-white/10 hover:bg-white/[0.03] hover:border-white/20 rounded-[14px] transition-all text-white/70 hover:text-white"
        >
          Try Demo Account
        </button>
      </div>
    </div>
  )
}
