'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react'
import { useToast } from '@/hooks/useToast'

const icons: any = {
  success: <CheckCircle2 className="text-green-500" size={20} />,
  error: <XCircle className="text-red-500" size={20} />,
  info: <Info className="text-brand-indigo" size={20} />,
  warning: <AlertTriangle className="text-brand-gold" size={20} />,
}

const colors: any = {
  success: 'border-green-500/20',
  error: 'border-red-500/20',
  info: 'border-brand-indigo/20',
  warning: 'border-brand-gold/20',
}

export const ToastContainer = () => {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed top-8 right-8 z-[9999] flex flex-col gap-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className={`glass-card p-4 flex items-start gap-3 w-[360px] relative overflow-hidden ${colors[toast.type]}`}
          >
            <div className="mt-0.5">{icons[toast.type]}</div>
            <div className="flex-1">
               <p className="text-sm font-bold text-white">{toast.message}</p>
            </div>
            <button 
              onClick={() => removeToast(toast.id)}
              className="text-white/20 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>

            {/* Progress Bar */}
            <motion.div 
              initial={{ width: '100%' }}
              animate={{ width: 0 }}
              transition={{ duration: 4, ease: 'linear' }}
              className={`absolute bottom-0 left-0 h-1 ${
                toast.type === 'success' ? 'bg-green-500' :
                toast.type === 'error' ? 'bg-red-500' :
                toast.type === 'info' ? 'bg-brand-indigo' : 'bg-brand-gold'
              }`}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
