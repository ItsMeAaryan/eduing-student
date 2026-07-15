import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Universities',
  description: 'Browse and compare universities across India - admissions, programs, and eligibility, all in one place on EDUING.in.',
  openGraph: {
    title: 'Universities | EDUING.in',
    description: 'Browse and compare universities across India - admissions, programs, and eligibility, all in one place on EDUING.in.',
  },
}

export default function UniversitiesPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0F',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '24px'
    }}>
      <h1 style={{ margin: 0, fontSize: "inherit", fontWeight: 700 }}>Universities Listing - Coming Soon</h1>
    </div>
  )
}
