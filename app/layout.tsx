import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/ThemeProvider'

const poppins = Poppins({
  weight: ['300', '400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-poppins'
})

export const metadata: Metadata = {
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
    <html lang="en" suppressHydrationWarning className={poppins.variable}>
      <body className="bg-[#f6f5f4] dark:bg-[#0b0f17] text-[#111827] dark:text-slate-100 antialiased font-sans transition-colors duration-200">
        <ThemeProvider>
          <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden bg-[#f6f5f4] dark:bg-[#0b0f17]" />
          <div className="relative z-10 flex flex-col min-h-screen">
            <main className="flex-grow">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
