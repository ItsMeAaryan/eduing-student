'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/Logo'
import { Eye, EyeOff } from 'lucide-react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase/config'


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

  async function handleLogin() {
    setLoading(true)
    setError('')
    try {
      const cred = await signInWithEmailAndPassword(
        auth, email, password)
      
      const userDoc = await getDoc(
        doc(db, 'users', cred.user.uid))
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


  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0F',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Inter, sans-serif',
    }}>

      {/* Background glow */}
      <div style={{
        position: 'absolute',
        width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(108,111,255,0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(80px)',
        pointerEvents: 'none',
      }}/>

      {/* Logo */}
      <div style={{ marginBottom: '32px' }}>
        <Logo height={36} />
      </div>

      {/* Card */}
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: 'rgba(17,17,17,0.8)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '24px',
        padding: '40px',
        backdropFilter: 'blur(20px)',
      }}>

        <h1 style={{
          color: '#FAFAFA',
          fontSize: '28px',
          fontWeight: '700',
          margin: '0 0 8px',
          textAlign: 'center',
        }}>
          Welcome back
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.4)',
          fontSize: '14px',
          textAlign: 'center',
          margin: '0 0 32px',
        }}>
          Sign in to your student account
        </p>

        {/* Inputs */}
        <div style={{ marginBottom: '16px' }}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 16px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              color: '#FFFFFF',
              fontSize: '15px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '24px', position: 'relative' }}>
          <input
            type={showPass ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 48px 14px 16px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              color: '#FFFFFF',
              fontSize: '15px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <button
            onClick={() => setShowPass(!showPass)}
            style={{
              position: 'absolute',
              right: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.3)',
              cursor: 'pointer',
            }}
          >
            {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {error && (
          <p style={{ color: '#F87171', fontSize: '13px', margin: '-12px 0 16px', textAlign: 'center' }}>
            ⚠ {error}
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <button
            type="button"
            onClick={fillDemo}
            style={{
              background: 'rgba(108,111,255,0.12)',
              border: '1px solid rgba(108,111,255,0.25)',
              color: '#6c6fff',
              borderRadius: '8px',
              padding: '6px 14px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            ✦ Autofill Demo
          </button>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%',
            padding: '16px',
            background: '#6c6fff',
            border: 'none',
            borderRadius: '14px',
            color: '#FFFFFF',
            fontSize: '16px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            opacity: loading ? 0.7 : 1,
            boxShadow: '0 8px 24px rgba(108,111,255,0.2)',
          }}
        >
          {loading ? 'Signing in...' : 'Login →'}
        </button>

        <p style={{
          marginTop: '24px',
          textAlign: 'center',
          color: 'rgba(255,255,255,0.4)',
          fontSize: '14px',
        }}>
          Don't have an account?{' '}
          <Link href="/auth/student/register" style={{ color: '#6c6fff', fontWeight: '600', textDecoration: 'none' }}>
            Sign up
          </Link>
        </p>

      </div>

      <Link href="/" style={{
        marginTop: '32px',
        color: 'rgba(255,255,255,0.3)',
        fontSize: '14px',
        textDecoration: 'none',
      }}>
        ← Back to home
      </Link>

    </div>
  )
}
