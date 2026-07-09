import type { Metadata } from 'next'

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
      background: '#0A0A0F',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '24px'
    }}>
      <h1 style={{ margin: 0, fontSize: "inherit", fontWeight: 700 }}>Programs Discovery - Coming Soon</h1>
    </div>
  )
}
