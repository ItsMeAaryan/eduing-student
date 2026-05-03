'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Logo from './Logo'

const LoadingScreen = ({ isVisible = true }: { isVisible?: boolean }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] bg-[var(--bg-primary)] flex flex-col items-center justify-center"
        >
          <div className="relative">
            {/* Spinning Ring */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="w-24 h-24 rounded-full border-4 border-brand-indigo/10 border-t-brand-indigo"
            />
            {/* Logo in center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Logo height={32} />
            </div>
          </div>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 flex flex-col items-center gap-2"
          >
            <span className="text-xs font-bold text-brand-indigo uppercase tracking-[0.4em]">Loading</span>
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <motion.div 
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  className="w-1.5 h-1.5 rounded-full bg-brand-indigo"
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default LoadingScreen
