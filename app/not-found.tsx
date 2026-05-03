'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="noise-overlay absolute inset-0 pointer-events-none z-0" />
      <div 
        className="absolute inset-0 pointer-events-none z-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(79,70,229,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(79,70,229,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-indigo/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 text-center">
        <motion.h1 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-[150px] md:text-[200px] font-[900] leading-none tracking-tighter gradient-text-animated mb-4"
        >
          404
        </motion.h1>
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-4xl font-bold mb-4"
        >
          Page not found
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-white/40 max-w-md mx-auto mb-10"
        >
          The page you&apos;re looking for doesn&apos;t exist or has been moved to another quadrant of the platform.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col md:flex-row items-center justify-center gap-4"
        >
          <Link 
            href="/" 
            className="flex items-center gap-2 px-8 py-4 rounded-full bg-brand-indigo text-white font-bold btn-shimmer shadow-lg shadow-brand-indigo/20 hover:translate-y-[-2px] transition-all"
          >
            <Home size={18} />
            Go Home
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-8 py-4 rounded-full border border-white/10 text-white font-bold hover:bg-white/5 transition-all"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </motion.div>
      </div>
    </div>
  )
}
