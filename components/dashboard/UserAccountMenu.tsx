'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  User, Settings, Bell, HelpCircle,
  Moon, Sun, Laptop, LogOut, ChevronRight
} from 'lucide-react'

interface UserAccountMenuProps {
  isOpen: boolean
  onClose: () => void
  onLogoutClick: () => void
  profile: any
}

export default function UserAccountMenu({
  isOpen,
  onClose,
  onLogoutClick,
  profile
}: UserAccountMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')

  // Handle outside click and escape key
  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const name = profile?.fullName || profile?.firstName || "Student"
  const email = (profile as any)?.email ?? "student@eduing.in"

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 z-[90] lg:hidden animate-in fade-in duration-200"
        onClick={onClose}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClose() }}
        role="button"
        tabIndex={0}
        aria-label="Close menu"
      />
      
      {/* Menu Container */}
      <div
        ref={menuRef}
        className="
          fixed bottom-0 left-0 right-0 z-[100] bg-white rounded-t-[20px] 
          shadow-[0_-8px_30px_rgba(0,0,0,0.12)] 
          lg:absolute lg:bottom-[calc(100%+12px)] lg:left-[12px] lg:right-auto lg:top-auto
          lg:w-[320px] lg:rounded-[20px] lg:shadow-[0_12px_40px_rgba(0,0,0,0.12)]
          lg:border lg:border-gray-200/60
          overflow-hidden
          animate-in slide-in-from-bottom-full duration-300
          lg:slide-in-from-bottom-2 lg:fade-in lg:zoom-in-95 lg:duration-180
          origin-bottom-left
        "
      >
        {/* Header section */}
        <div className="p-5 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center overflow-hidden relative border border-gray-200/60 shadow-sm shrink-0">
              {profile?.profilePhotoURL ? (
                <Image src={profile.profilePhotoURL} alt="Avatar" fill className="object-cover" />
              ) : (
                <User size={20} strokeWidth={1.8} className="text-[#4F6BFF]" />
              )}
              {/* Online indicator */}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full z-10" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[15px] font-semibold text-gray-900 truncate">
                {name}
              </div>
              <div className="text-[13px] text-gray-500 truncate">
                {email}
              </div>
              <div className="text-[11px] font-medium text-[#4F6BFF] mt-0.5 inline-block px-1.5 py-0.5 bg-indigo-50 rounded-md">
                Student
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="py-2 px-3 flex flex-col gap-0.5">
          <Link
            href="/student/profile"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[14px] font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors group"
          >
            <User size={16} strokeWidth={2} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
            <span className="flex-1">Profile</span>
            <ChevronRight size={14} className="text-gray-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </Link>
          <Link
            href="/student/settings"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[14px] font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors group"
          >
            <Settings size={16} strokeWidth={2} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
            <span className="flex-1">Settings</span>
            <ChevronRight size={14} className="text-gray-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </Link>
          <Link
            href="/student/notifications"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[14px] font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors group"
          >
            <Bell size={16} strokeWidth={2} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
            <span className="flex-1">Notifications</span>
            <ChevronRight size={14} className="text-gray-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </Link>
          <Link
            href="/student/help"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[14px] font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors group"
          >
            <HelpCircle size={16} strokeWidth={2} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
            <span className="flex-1">Help Center</span>
            <ChevronRight size={14} className="text-gray-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </Link>
        </div>

        {/* Theme Toggle placeholder */}
        <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[13px] font-medium text-gray-500">Theme</span>
          <div className="flex bg-gray-100/80 p-0.5 rounded-lg border border-gray-200/50">
            <button
              onClick={() => setTheme('light')}
              className={`p-1.5 rounded-md transition-all ${
                theme === 'light' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Light"
            >
              <Sun size={14} strokeWidth={2} />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`p-1.5 rounded-md transition-all ${
                theme === 'dark' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Dark"
            >
              <Moon size={14} strokeWidth={2} />
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`p-1.5 rounded-md transition-all ${
                theme === 'system' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'
              }`}
              title="System"
            >
              <Laptop size={14} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 w-full" />

        {/* Logout Action */}
        <div className="p-3 bg-gray-50/50">
          <button
            onClick={() => {
              onClose()
              onLogoutClick()
            }}
            className="w-full flex items-center justify-center gap-2 h-[42px] px-4 rounded-[10px] border border-red-200 bg-white text-[14px] font-semibold text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-colors group focus:outline-none focus:ring-2 focus:ring-red-100"
          >
            <LogOut size={16} strokeWidth={2} className="group-hover:scale-110 transition-transform duration-200" />
            Logout
          </button>
        </div>
      </div>
    </>
  )
}
