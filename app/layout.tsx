// app/layout.tsx
import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/ThemeProvider'

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://student.eduing.in'),
  title: {
    default: 'EDUING.in – Student Admissions Platform',
    template: '%s | EDUING.in',
  },
  description:
    'EDUING.in is the unified admissions platform connecting Indian students with universities — discover programs, track applications, and get admitted, all in one place.',
  icons: {
    icon: '/bandwlogo.PNG',
    apple: '/bandwlogo.PNG',
  },
  openGraph: {
    type: 'website',
    siteName: 'EDUING.in',
    title: 'EDUING.in – Student Admissions Platform',
    description:
      'The unified admissions platform connecting Indian students with universities.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EDUING.in – Student Admissions Platform',
    description:
      'The unified admissions platform connecting Indian students with universities.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={poppins.variable}>
      <body className="antialiased font-sans" style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}