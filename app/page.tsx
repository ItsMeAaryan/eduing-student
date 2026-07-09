import type { Metadata } from 'next'
import HomeContent from './HomeContent'

export const metadata: Metadata = {
  title: 'Login & Register',
  description: 'Sign in or create your student account on EDUING.in — the unified admissions platform for Indian universities.',
  openGraph: {
    title: 'EDUING.in — Student Login & Registration',
    description: 'Sign in or create your student account on EDUING.in — the unified admissions platform for Indian universities.',
  },
}

export default function Page() {
  return <HomeContent />
}
