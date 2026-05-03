'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/Logo'

export default function RegisterPage() {
  const router = useRouter()

  // Redirect directly to student registration
  React.useEffect(() => {
    router.replace('/auth/student/register')
  }, [router])

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
    }}>

      {/* Background glow */}
      <div style={{
        position: 'absolute',
        width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(79,70,229,0.12) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        pointerEvents: 'none',
      }}/>

      <div style={{ marginBottom: '40px' }}>
        <Logo height={32} />
      </div>

      <div style={{
        width: '100%',
        maxWidth: '420px',
        textAlign: 'center',
      }}>
        <h1 style={{
          color: '#FAFAFA',
          fontSize: '28px',
          fontWeight: '700',
          margin: '0 0 8px',
          fontFamily: 'Inter, sans-serif',
        }}>
          Redirecting...
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.4)',
          fontSize: '15px',
          margin: '0 0 40px',
          fontFamily: 'Inter, sans-serif',
        }}>
          Taking you to the registration page
        </p>

        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(79,70,229,0.3)',
          borderTop: '3px solid #4F46E5',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto',
        }}/>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>

        {/* Fallback link */}
        <p style={{
          textAlign: 'center',
          color: 'rgba(255,255,255,0.3)',
          fontSize: '14px',
          marginTop: '28px',
          fontFamily: 'Inter, sans-serif',
        }}>
          Not redirecting?{' '}
          <Link href="/auth/student/register" style={{
            color: '#6366F1',
            textDecoration: 'none',
            fontWeight: '500',
          }}>
            Click here
          </Link>
        </p>

      </div>

      <Link href="/" style={{
        marginTop: '28px',
        color: 'rgba(255,255,255,0.25)',
        fontSize: '13px',
        textDecoration: 'none',
        fontFamily: 'Inter, sans-serif',
      }}>
        ← Back to home
      </Link>

    </div>
  )
}
