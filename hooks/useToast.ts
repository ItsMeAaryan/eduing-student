'use client'

import React from 'react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  message: string
  type: ToastType
}

type ToastStore = {
  toasts: Toast[]
  addToast: (message: string, type: ToastType) => void
  removeToast: (id: string) => void
}

let subscribers: Function[] = []
let toasts: Toast[] = []

const notify = () => subscribers.forEach(sub => sub([...toasts]))

export const useToast = () => {
  const [currentToasts, setCurrentToasts] = React.useState<Toast[]>(toasts)

  React.useEffect(() => {
    subscribers.push(setCurrentToasts)
    return () => {
      subscribers = subscribers.filter(sub => sub !== setCurrentToasts)
    }
  }, [])

  const addToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9)
    toasts = [...toasts, { id, message, type }]
    notify()
    
    setTimeout(() => {
      removeToast(id)
    }, 4000)
  }

  const removeToast = (id: string) => {
    toasts = toasts.filter(t => t.id !== id)
    notify()
  }

  return {
    toasts: currentToasts,
    toast: {
      success: (msg: string) => addToast(msg, 'success'),
      error: (msg: string) => addToast(msg, 'error'),
      info: (msg: string) => addToast(msg, 'info'),
      warning: (msg: string) => addToast(msg, 'warning'),
    },
    removeToast
  }
}


