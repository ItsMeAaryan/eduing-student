'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Home, FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-[480px] mx-auto">

        {/* Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-[88px] h-[88px] rounded-[24px] bg-[#EEF2FF] flex items-center justify-center mx-auto mb-[28px]"
        >
          <FileQuestion size={40} className="text-[#4F6BFF]" strokeWidth={1.5} />
        </motion.div>

        {/* 404 */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.3 }}
          className="text-[11px] font-bold text-[#4F6BFF] uppercase tracking-[0.12em] mb-[10px]"
        >
          Error 404
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="text-[28px] font-bold text-[#111827] tracking-[-0.02em] mb-[12px]"
        >
          Page not found
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="text-[14px] text-[#6B7280] leading-[1.6] mb-[32px]"
        >
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Try navigating back to the dashboard.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-[12px]"
        >
          <Link
            href="/student/dashboard"
            className="flex items-center gap-[8px] px-[20px] h-[40px] rounded-[10px] bg-[#4F6BFF] text-white text-[13px] font-semibold hover:bg-[#3D56E0] transition-colors"
          >
            <Home size={16} strokeWidth={2} />
            Back to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-[8px] px-[20px] h-[40px] rounded-[10px] border border-[#EAECF0] bg-white text-[#374151] text-[13px] font-medium hover:bg-[#F9FAFB] transition-colors"
          >
            <ArrowLeft size={16} strokeWidth={2} />
            Go Back
          </button>
        </motion.div>
      </div>
    </div>
  )
}
