'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import Logo from './Logo'
import { auth } from '@/lib/firebase/config'
import { onAuthStateChanged } from 'firebase/auth'

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()
  const [userRole, setUserRole] = useState<string|null>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const { getDoc, doc } = await import('firebase/firestore')
        const { db } = await import('@/lib/firebase/config')
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        setUserRole(userDoc.data()?.role || null)
      } else {
        setUserRole(null)
      }
    })
    return unsub
  }, [])

  const logoHref = userRole === 'student' 
    ? '/student/dashboard'
    : '/'

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Hide navbar on student, university, auth and landing routes
  if (pathname === '/' || pathname.startsWith('/student') || pathname.startsWith('/university') || pathname.startsWith('/auth')) {
    return null
  }

  const navLinks = [
    { name: 'Universities', href: '/universities' },
    { name: 'Programs', href: '/programs' },
    { name: 'About', href: '/about' },
  ]

  return (
    <>
      <nav 
        style={{
          position: 'fixed',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
          width: isMobile ? '90vw' : 'fit-content',
          minWidth: isMobile ? 'auto' : '700px',
        }}
      >
        {/* Inner pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(15, 15, 24, 0.85)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(79, 70, 229, 0.25)',
          borderRadius: '100px',
          padding: '6px 6px 6px 16px',
          boxShadow: '0 4px 30px rgba(0,0,0,0.4)',
        }}>
          
          {/* Logo - left */}
          <Logo height={24} href={logoHref} />

          {!isMobile && (
            <>
              {/* Spacer */}
              <div style={{ width: '24px' }} />

              {/* Nav links - center */}
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className="text-[rgba(255,255,255,0.65)] text-[14px] font-medium px-[14px] py-[8px] rounded-full no-underline transition-all duration-200 whitespace-nowrap hover:text-white hover:bg-[rgba(255,255,255,0.08)]"
                >
                  {link.name}
                </Link>
              ))}

              {/* Spacer */}
              <div style={{ flex: 1, minWidth: '24px' }} />


              {/* Divider */}
              <div style={{
                width: '1px',
                height: '20px',
                background: 'rgba(255,255,255,0.1)',
                margin: '0 4px',
              }} />

              {/* Login button */}
              <Link href="/auth/login">
                <button className="bg-transparent border border-[rgba(255,255,255,0.2)] rounded-full px-[20px] py-[8px] text-[rgba(255,255,255,0.85)] text-[14px] font-medium cursor-pointer transition-all duration-200 whitespace-nowrap hover:border-[rgba(79,70,229,0.6)] hover:text-white hover:bg-[rgba(79,70,229,0.1)]">
                  Login
                </button>
              </Link>

              {/* Get Started button */}
              <Link href="/auth/register">
                <button className="bg-gradient-to-br from-[#4F46E5] to-[#6366F1] border-none rounded-full px-[20px] py-[8px] text-white text-[14px] font-semibold cursor-pointer whitespace-nowrap shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_8px_25px_rgba(79,70,229,0.45)]">
                  Get Started
                </button>
              </Link>
            </>
          )}

          {isMobile && (
            <>
              <div style={{ flex: 1 }} />
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-[#0a0a0a]/95 backdrop-blur-xl z-[90] flex flex-col items-center justify-center p-8"
          >
            <div className="flex flex-col gap-6 text-center w-full max-w-[300px]">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className="text-2xl font-bold text-white/70 hover:text-white transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              
              <div className="pt-8 flex flex-col gap-6 items-center">
                
                <div className="w-full flex flex-col gap-3 mt-4">
                  <Link href="/auth/login" className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="w-full bg-transparent border border-[rgba(255,255,255,0.2)] rounded-full px-[20px] py-[12px] text-[rgba(255,255,255,0.85)] text-[16px] font-medium cursor-pointer transition-all hover:border-[rgba(79,70,229,0.6)] hover:text-white hover:bg-[rgba(79,70,229,0.1)]">
                      Login
                    </button>
                  </Link>
                  
                  <Link href="/auth/register" className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="w-full bg-gradient-to-br from-[#4F46E5] to-[#6366F1] border-none rounded-full px-[20px] py-[12px] text-white text-[16px] font-semibold cursor-pointer shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all hover:-translate-y-[1px] hover:shadow-[0_8px_25px_rgba(79,70,229,0.45)]">
                      Get Started
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
