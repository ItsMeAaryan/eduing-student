import type { Metadata } from 'next'

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
      background: '#0A0A0F',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '24px'
    }}>
      <h1 style={{ margin: 0, fontSize: "inherit", fontWeight: 700 }}>About EDUING.in - Coming Soon</h1>
    </div>
  )
}
