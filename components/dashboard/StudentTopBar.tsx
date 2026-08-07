// components/dashboard/StudentTopBar.tsx
'use client'

import { usePathname } from 'next/navigation'
import { Bell } from 'lucide-react'
import Link from 'next/link'
import { useStudentData } from '@/components/providers/StudentDataProvider'
import { useAuth } from '@/hooks/useAuth'

const PAGE_TITLES: Record<string, string> = {
    '/student/dashboard': 'Dashboard',
    '/student/applications': 'My Applications',
    '/student/universities': 'Universities',
    '/student/scholarships': 'Scholarships',
    '/student/saved': 'Saved',
    '/student/compare': 'Compare',
    '/student/calendar': 'Calendar',
    '/student/notifications': 'Notifications',
    '/student/settings': 'Settings',
    '/student/profile': 'My Profile',
    '/student/documents': 'Documents',
    '/student/onboarding': 'Onboarding',
    '/student/copilot': 'AI Copilot',
    '/student/career': 'Career',
    '/student/resume': 'Resume Builder',
    '/student/sop': 'SOP Builder',
    '/student/email': 'Email Writer',
    '/student/interview': 'Interview Prep',
}

export default function StudentTopBar() {
    const pathname = usePathname()
    const { notifications } = useStudentData()
    const { user } = useAuth()

    const unreadCount = Array.isArray(notifications)
        ? notifications.filter((n: any) => !n.isRead).length
        : 0

    // Match exact then prefix
    const title =
        PAGE_TITLES[pathname] ??
        Object.entries(PAGE_TITLES).find(([k]) => pathname.startsWith(k + '/'))?.[1] ??
        'EDUING'

    const firstName = (user as any)?.fullName?.split(' ')[0] ?? ''

    return (
        <header
            className="sticky top-0 z-30 h-[56px] flex items-center justify-between px-4 lg:px-6 shrink-0"
            style={{
                background: 'var(--bg-elevated)',
                borderBottom: '1px solid var(--border)',
            }}
        >
            {/* Page title */}
            <h1
                className="text-[15px] font-semibold truncate"
                style={{ color: 'var(--text-primary)' }}
            >
                {title}
                {firstName && (
                    <span className="font-normal" style={{ color: 'var(--text-muted)' }}>
                        {' '}— {firstName}
                    </span>
                )}
            </h1>

            {/* Right actions */}
            <div className="flex items-center gap-2">
                {/* Notifications bell */}
                <Link
                    href="/student/notifications"
                    className="relative p-2 rounded-[8px] transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                    aria-label={`Notifications${unreadCount > 0 ? ` — ${unreadCount} unread` : ''}`}
                >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                        <span
                            className="absolute top-1 right-1 min-w-[16px] h-[16px] text-[10px] font-bold flex items-center justify-center rounded-full px-0.5"
                            style={{ background: 'var(--red)', color: '#fff' }}
                        >
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </Link>

                {/* Avatar / profile link */}
                <Link
                    href="/student/profile"
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold transition-opacity hover:opacity-80"
                    style={{ background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}
                    aria-label="My profile"
                >
                    {firstName ? firstName[0].toUpperCase() : '?'}
                </Link>
            </div>
        </header>
    )
}