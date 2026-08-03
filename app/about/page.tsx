// app/about/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about EDUING.in, the unified admissions platform connecting Indian students with universities across the country.',
  openGraph: {
    title: 'About EDUING.in',
    description: 'Learn about EDUING.in, the unified admissions platform connecting Indian students with universities across the country.',
  },
}

export default function AboutPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>
        <span style={{
          display: 'inline-block',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--accent)',
          marginBottom: 16,
        }}>
          EDUING.in
        </span>
        <h1 style={{
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: '-0.5px',
          color: 'var(--text-primary)',
          marginBottom: 16,
          lineHeight: 1.15,
        }}>
          About — Coming Soon
        </h1>
        <p style={{
          fontSize: 15,
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          marginBottom: 32,
        }}>
          We&rsquo;re building the story behind India&rsquo;s most student-first admissions platform.
          This page will tell you everything about our mission, team, and why we started EDUING.
        </p>
        <Link
          href="/auth/login"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            height: 36,
            padding: '0 16px',
            background: 'var(--accent)',
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            borderRadius: 8,
            textDecoration: 'none',
            transition: 'opacity 0.15s',
          }}
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}