'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Logo from '@/components/Logo'
import { CheckCircle2 } from 'lucide-react'

export default function AuthContainer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  const isLogin = pathname === '/auth/login'
  const isRegister = pathname === '/auth/student/register'

  const features = [
    'AI Discovery',
    'One Profile',
    'Secure Documents',
    'Track Applications'
  ]

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex font-sans overflow-hidden">
      
      {/* LEFT SIDE - Branding & Features */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] max-w-[600px] p-12 relative border-r border-white/5 bg-[#0A0A0F] z-10">
        
        {/* Background Effects */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {/* Radial Glow */}
          <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-brand-indigo/5 blur-[120px] rounded-full" />
          
          {/* Subtle Grid */}
          <div 
            className="absolute inset-0 opacity-[0.03]" 
            style={{ backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}
          />
        </div>

        <div className="relative z-10">
          <Logo height={32} />
        </div>

        <div className="relative z-10 space-y-8 mt-12 mb-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-5xl font-black text-white leading-[1.1] tracking-tight mb-6">
              Welcome to EDUING
            </h1>
            <h2 className="text-2xl font-semibold text-white/80 mb-4">
              One Profile. Unlimited Opportunities.
            </h2>
            <p className="text-white/50 text-lg leading-relaxed max-w-md">
              Apply, discover, track, and manage your university journey from one intelligent workspace.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="flex flex-wrap gap-3 mt-10"
          >
            {features.map((feature, i) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + (i * 0.1) }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-brand-indigo/10 border border-brand-indigo/20 text-brand-indigoLight text-sm font-semibold backdrop-blur-md"
              >
                <CheckCircle2 size={16} className="text-brand-indigoLight" />
                {feature}
              </motion.div>
            ))}
          </motion.div>
        </div>
        
        <div className="relative z-10 text-white/30 text-sm font-medium">
          © {new Date().getFullYear()} EDUING. All rights reserved.
        </div>
      </div>

      {/* RIGHT SIDE - Auth Form */}
      <div className="flex-1 flex flex-col justify-center relative bg-[#0A0A0F]">
        
        {/* Mobile Logo */}
        <div className="lg:hidden absolute top-8 left-8 z-20">
          <Logo height={28} />
        </div>

        {/* Right side background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-indigo/10 rounded-full blur-[100px] pointer-events-none z-0" />

        <div className="w-full max-w-[480px] mx-auto px-6 py-20 z-10 relative">
          
          {/* Segmented Control */}
          {(isLogin || isRegister) && (
            <div className="mb-10 w-full bg-white/5 p-1.5 rounded-2xl flex relative backdrop-blur-xl border border-white/10">
              <Link 
                href="/auth/login" 
                className={`flex-1 text-center py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-colors z-10 ${isLogin ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
              >
                Log In
              </Link>
              <Link 
                href="/auth/student/register" 
                className={`flex-1 text-center py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-colors z-10 ${isRegister ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
              >
                Register
              </Link>
              
              {/* Animated Pill */}
              <motion.div 
                layoutId="auth-tab-pill"
                className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-brand-indigo/20 border border-brand-indigo/30 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.2)] z-0"
                initial={false}
                animate={{
                  left: isLogin ? '6px' : 'calc(50% + 0px)',
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            </div>
          )}

          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
