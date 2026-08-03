// app/programs/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Programs',
  description: 'Discover undergraduate and postgraduate programs offered by universities across India on EDUING.in.',
  openGraph: {
    title: 'Programs | EDUING.in',
    description: 'Discover undergraduate and postgraduate programs offered by universities across India on EDUING.in.',
  },
}

export default function ProgramsPage() {
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
          Programs Discovery
        </span>
        <h1 style={{
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: '-0.5px',
          color: 'var(--text-primary)',
          marginBottom: 16,
          lineHeight: 1.15,
        }}>
          Browse Programs — Coming Soon
        </h1>
        <p style={{
          fontSize: 15,
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          marginBottom: 32,
        }}>
          A full programs discovery experience is on the way — search by subject, degree level,
          fees, location and more. For now, explore universities through your student dashboard.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/student/universities"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              height: 36,
              padding: '0 16px',
              background: 'var(--accent)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 8,
              textDecoration: 'none',
            }}
          >
            Explore Universities
          </Link>
          <Link
            href="/student/dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              height: 36,
              padding: '0 16px',
              background: 'var(--bg-elevated)',
              color: 'var(--text-primary)',
              fontSize: 13,
              fontWeight: 500,
              borderRadius: 8,
              border: '1px solid var(--border)',
              textDecoration: 'none',
            }}
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}