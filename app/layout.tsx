import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'

const poppins = Poppins({ 
  weight: ['300', '400', '500', '600'],
  subsets: ['latin'], 
  variable: '--font-poppins' 
})

export const metadata: Metadata = {
  // TODO: confirm actual production domain - placeholder used for metadataBase/OG image resolution
  metadataBase: new URL('https://student.eduing.in'),
  title: {
    default: 'EDUING.in - Student Admissions Platform',
    template: '%s | EDUING.in',
  },
  description: 'EDUING.in is the unified admissions platform connecting Indian students with universities - discover programs, track applications, and get admitted, all in one place.',
  icons: {
    icon: '/bandwlogo.PNG',
    apple: '/bandwlogo.PNG',
  },
  openGraph: {
    type: 'website',
    siteName: 'EDUING.in',
    title: 'EDUING.in - Student Admissions Platform',
    description: 'The unified admissions platform connecting Indian students with universities - discover programs, track applications, and get admitted, all in one place.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EDUING.in - Student Admissions Platform',
    description: 'The unified admissions platform connecting Indian students with universities - discover programs, track applications, and get admitted, all in one place.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`dark ${poppins.variable}`}>
      <body className="bg-background text-text-primary antialiased font-sans">
        <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden bg-background" />
        <div className="relative z-10 flex flex-col min-h-screen">
          <main className="flex-grow">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
