'use client'

import { useEffect, useRef } from 'react'

interface LogoutConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isLoggingOut: boolean
}

export default function LogoutConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isLoggingOut
}: LogoutConfirmModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  // Trap focus and handle escape key
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    
    // Focus the cancel button initially
    const cancelButton = modalRef.current?.querySelector('button[data-cancel]') as HTMLButtonElement
    if (cancelButton) {
      cancelButton.focus()
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        ref={modalRef}
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="modal-title"
        className="bg-card rounded-[20px] shadow-2xl w-full max-w-[340px] mx-4 overflow-hidden animate-in zoom-in-95 duration-200"
      >
        <div className="p-6">
          <h2 id="modal-title" className="text-xl font-bold text-gray-900 mb-2">
            Logout?
          </h2>
          <p className="text-[14px] text-gray-500 mb-6">
            Are you sure you want to logout?
          </p>
          
          <div className="flex gap-3 mt-6">
            <button
              data-cancel
              onClick={onClose}
              disabled={isLoggingOut}
              className="flex-1 px-4 py-2.5 rounded-[10px] border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoggingOut}
              className="flex-1 px-4 py-2.5 rounded-[10px] bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoggingOut ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Logout'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
