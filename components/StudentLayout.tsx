'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '0',
      width: '100%',
      zIndex: 100,
      display: 'flex',
      justifyContent: 'center',
      padding: '0 24px'
    }}>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: '100%',
          maxWidth: '1100px',
          background: 'rgba(6, 6, 10, 0.65)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '9999px',
          padding: '8px 8px 8px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Logo Section */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
          {/* ✅ Logo image */}
          <img
            src="/bandwlogo.PNG"
            alt="EDUING Logo"
            style={{ width: '30px', height: '30px', objectFit: 'contain', filter: 'invert(1)' }}
          />
          <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: '800', letterSpacing: '-0.03em', color: '#FFFFFF' }}>
            EDUING<span style={{ color: '#818CF8', fontSize: '12px' }}>.in</span>
          </span>
        </Link>

        {/* Navigation Items */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {['Features', 'Download', 'About', 'Contact'].map(l => {
            const href = l === 'Download' ? '/#download' : `/${l.toLowerCase()}`;
            const isActive = pathname === href;
            return (
              <Link key={l} href={href} style={{ textDecoration: 'none' }}>
                <span style={{
                  padding: '8px 18px', borderRadius: '9999px', fontSize: '14px',
                  color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.55)', 
                  fontFamily: 'DM Sans, sans-serif',
                  fontWeight: isActive ? '600' : '500', 
                  background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
                onMouseLeave={e => { e.currentTarget.style.color = isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.55)'; e.currentTarget.style.background = isActive ? 'rgba(255,255,255,0.08)' : 'transparent' }}>
                  {l}
                </span>
              </Link>
            );
          })}
        </div>

        {/* CTA Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'flex-end' }}>
          
          {/* Log in */}
          <a href="https://app.eduing.in" style={{ textDecoration: 'none' }}>
            <span style={{
              padding: '8px 16px', fontSize: '14px', fontWeight: '500', 
              color: 'rgba(255, 255, 255, 0.6)', cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif', transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'white'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'}>
              Log in
            </span>
          </a>
          
          {/* Get started */}
          <a href="https://app.eduing.in/" style={{ 
            textDecoration: 'none',
            opacity: scrolled ? 1 : 0,
            transform: scrolled ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.92)',
            filter: scrolled ? 'blur(0)' : 'blur(6px)',
            pointerEvents: scrolled ? 'auto' : 'none',
            transition: 'all 600ms cubic-bezier(0.16, 1, 0.3, 1)',
            transitionDelay: scrolled ? '120ms' : '0ms',
          }}>
            <motion.div 
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.98 }}
              style={{
                padding: '10px 22px', borderRadius: '9999px', fontSize: '14px',
                fontWeight: '600', color: '#06060A', cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif',
                background: 'linear-gradient(135deg, #E0E0FF 0%, #FFFFFF 100%)',
                boxShadow: '0 4px 15px rgba(255, 255, 255, 0.1)',
                transition: 'box-shadow 0.2s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 255, 255, 0.15)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 255, 255, 0.1)'}
            >
              Get started
            </motion.div>
          </a>
        </div>
      </motion.nav>
    </div>
  )
}
