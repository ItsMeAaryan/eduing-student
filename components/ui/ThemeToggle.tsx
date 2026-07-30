'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon, Laptop, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!mounted) {
    return (
      <div className="w-[34px] h-[34px] rounded-[8px] border border-border dark:border-slate-800 bg-card dark:bg-slate-900" />
    )
  }

  const options = [
    { key: 'light', label: 'Light', icon: Sun },
    { key: 'dark', label: 'Dark', icon: Moon },
    { key: 'system', label: 'System', icon: Laptop },
  ]

  const ActiveIcon = resolvedTheme === 'dark' ? Moon : Sun

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-[34px] h-[34px] rounded-[8px] border border-border dark:border-slate-800 bg-card dark:bg-slate-900 text-muted-foreground dark:text-slate-400 hover:bg-muted dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label="Toggle theme"
        title={`Current theme: ${theme}`}
      >
        <ActiveIcon size={15} strokeWidth={1.8} className="text-primary dark:text-[#388bfd]" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-[6px] w-[130px] rounded-[10px] bg-card dark:bg-slate-900 border border-border dark:border-slate-800 shadow-xl z-50 p-[4px]"
          >
            {options.map(opt => {
              const IconComp = opt.icon
              const isSelected = theme === opt.key
              return (
                <button
                  key={opt.key}
                  onClick={() => {
                    setTheme(opt.key)
                    setOpen(false)
                  }}
                  className={`w-full flex items-center gap-[8px] px-[10px] py-[6px] rounded-[6px] text-[12px] font-medium transition-colors ${
                    isSelected
                      ? 'bg-primary/10 dark:bg-slate-800 text-primary dark:text-[#388bfd]'
                      : 'text-foreground dark:text-slate-300 hover:bg-muted dark:hover:bg-slate-800/60'
                  }`}
                >
                  <IconComp size={13} strokeWidth={1.8} />
                  {opt.label}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
