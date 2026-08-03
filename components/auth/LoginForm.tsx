// components/auth/LoginForm.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { loginUser } from '@/lib/firebase/auth'

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e?: React.FormEvent) {
    if (e) e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { role } = await loginUser(email, password)
      if (role === 'student') router.push('/student/dashboard')
      else if (role === 'super_admin') router.push('/admin/dashboard')
      else setError('Unauthorized access')
    } catch (err: unknown) {
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  const inputClasses = "w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-[12px] px-4 h-[56px] text-[14px] text-[var(--text-primary)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-border)] outline-none transition-all duration-200 placeholder:text-[var(--text-faint)]"
  const labelClasses = "block text-[13px] font-medium text-[var(--text-secondary)] mb-2"

  return (
    <div className="w-full">
      <div className="mb-10 text-left">
        <h1 className="text-[42px] sm:text-[48px] font-display font-[800] tracking-tighter leading-[1.05] text-[var(--text-primary)] mb-3">
          Admissions<br />Start Here.
        </h1>
        <p className="text-[15px] font-medium text-[var(--text-muted)] leading-relaxed">
          Sign in to continue your admissions journey.
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        {error && (
          <div className="rounded-[12px] p-4 flex gap-3 items-center" style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)' }}>
            <AlertCircle className="shrink-0" size={18} style={{ color: 'var(--red)' }} />
            <p className="text-[13px] font-medium" style={{ color: 'var(--red)' }}>{error}</p>
          </div>
        )}

        <div>
          <label htmlFor="email" className={labelClasses}>Email Address</label>
          <input id="email" type="email" required value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClasses} placeholder="john@example.com" />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="password" className={labelClasses} style={{ marginBottom: 0 }}>Password</label>
            <Link href="/auth/forgot-password"
              className="text-[12px] font-medium transition-colors"
              style={{ color: 'var(--accent)' }}>
              Forgot password?
            </Link>
          </div>
          <div className="relative mt-2">
            <input id="password" type={showPassword ? 'text' : 'password'} required
              value={password} onChange={(e) => setPassword(e.target.value)}
              className={inputClasses} placeholder="••••••••" />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: 'var(--text-muted)' }}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full font-display font-bold text-[15px] h-[56px] rounded-[14px] transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3"
          style={{ background: 'var(--accent)', color: '#fff' }}>
          {loading ? <Loader2 className="animate-spin" size={18} /> : <span>Sign In</span>}
        </button>
      </form>
    </div>
  )
}