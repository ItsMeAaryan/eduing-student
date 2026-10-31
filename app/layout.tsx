// app/layout.tsx
import type { Metadata } from 'next'
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/ThemeProvider'

const bricolage = Bricolage_Grotesque({
  weight: ['500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-bricolage',
  display: 'swap',
})

const jakarta = Plus_Jakarta_Sans({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
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
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: { url: '/apple-touch-icon.png', sizes: '180x180' },
  },
  openGraph: {
    type: 'website',
    siteName: 'EDUING.in',
    title: 'EDUING.in – Student Admissions Platform',
    description:
      'The unified admissions platform connecting Indian students with universities.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'EDUING.in' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EDUING.in – Student Admissions Platform',
    description:
      'The unified admissions platform connecting Indian students with universities.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${bricolage.variable} ${jakarta.variable}`}>
      <body className="antialiased font-sans" style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}