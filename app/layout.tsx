import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })

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
    <html lang="en" className={`dark ${inter.variable} ${outfit.variable}`}>
      <body className="bg-[#0A0A0F] min-h-screen text-white antialiased font-sans">
        {/* Global Fixed Background System */}
        <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-[#0A0A0F]" />
          
          {/* Scientific Grid */}
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] bg-[size:40px_40px]" />
          
          {/* Ambient Glows */}
          <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 blur-[100px] rounded-full" />
        </div>

        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
