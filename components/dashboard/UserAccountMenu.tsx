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
          fixed bottom-0 left-0 right-0 z-[100] bg-popover text-popover-foreground rounded-t-[20px] 
          shadow-2xl 
          lg:absolute lg:bottom-[calc(100%+12px)] lg:left-[12px] lg:right-auto lg:top-auto
          lg:w-[320px] lg:rounded-[20px] lg:shadow-2xl
          lg:border lg:border-border
          overflow-hidden
          animate-in slide-in-from-bottom-full duration-300
          lg:slide-in-from-bottom-2 lg:fade-in lg:zoom-in-95 lg:duration-180
          origin-bottom-left
        "
      >
        {/* Header section */}
        <div className="p-5 border-b border-border bg-muted/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden relative border border-primary/20 shadow-sm shrink-0">
              {profile?.profilePhotoURL ? (
                <Image src={profile.profilePhotoURL} alt="Avatar" fill className="object-cover" />
              ) : (
                <User size={20} strokeWidth={1.8} className="text-primary" />
              )}
              {/* Online indicator */}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#0ABE52] border-2 border-background rounded-full z-10" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[15px] font-semibold text-foreground truncate">
                {name}
              </div>
              <div className="text-[13px] text-muted-foreground truncate">
                {email}
              </div>
              <div className="text-[11px] font-medium text-primary mt-0.5 inline-block px-1.5 py-0.5 bg-primary/10 rounded-md">
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
            className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[14px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors group"
          >
            <User size={16} strokeWidth={2} className="text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="flex-1">Profile</span>
            <ChevronRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </Link>
          <Link
            href="/student/settings"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[14px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors group"
          >
            <Settings size={16} strokeWidth={2} className="text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="flex-1">Settings</span>
            <ChevronRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </Link>
          <Link
            href="/student/notifications"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[14px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors group"
          >
            <Bell size={16} strokeWidth={2} className="text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="flex-1">Notifications</span>
            <ChevronRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </Link>
          <Link
            href="/student/help"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[14px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors group"
          >
            <HelpCircle size={16} strokeWidth={2} className="text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="flex-1">Help Center</span>
            <ChevronRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </Link>
        </div>

        {/* Theme Toggle placeholder */}
        <div className="px-6 py-3 border-t border-border flex items-center justify-between">
          <span className="text-[13px] font-medium text-muted-foreground">Theme</span>
          <div className="flex bg-muted/50 p-0.5 rounded-lg border border-border">
            <button
              onClick={() => setTheme('light')}
              className={`p-1.5 rounded-md transition-all ${
                theme === 'light' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Light"
            >
              <Sun size={14} strokeWidth={2} />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`p-1.5 rounded-md transition-all ${
                theme === 'dark' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Dark"
            >
              <Moon size={14} strokeWidth={2} />
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`p-1.5 rounded-md transition-all ${
                theme === 'system' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
              title="System"
            >
              <Laptop size={14} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border w-full" />

        {/* Logout Action */}
        <div className="p-3 bg-muted/30">
          <button
            onClick={() => {
              onClose()
              onLogoutClick()
            }}
            className="w-full flex items-center justify-center gap-2 h-[42px] px-4 rounded-[10px] border border-destructive/20 bg-background text-[14px] font-semibold text-destructive hover:bg-destructive/10 hover:border-destructive/30 transition-colors group focus:outline-none focus:ring-2 focus:ring-destructive/20"
          >
            <LogOut size={16} strokeWidth={2} className="group-hover:scale-110 transition-transform duration-200" />
            Logout
          </button>
        </div>
      </div>
    </>
  )
}
