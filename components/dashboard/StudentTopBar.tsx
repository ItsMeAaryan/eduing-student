// components/dashboard/StudentTopBar.tsx
'use client'

import { usePathname } from 'next/navigation'
import { Bell, CheckCheck, Inbox } from 'lucide-react'
import Link from 'next/link'
import { useRef, useState, useEffect } from 'react'
import { writeBatch, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { useStudentData } from '@/components/providers/StudentDataProvider'
import { useAuth } from '@/hooks/useAuth'
import { markNotificationAsRead } from '@/lib/firebase/notifications'
import type { Notification } from '@/types/firebase'

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

/** Format a Firestore Timestamp or Date-like value into a human-readable relative string */
function formatRelative(ts: any): string {
    if (!ts) return ''
    const date = ts?.toDate ? ts.toDate() : new Date(ts)
    if (isNaN(date.getTime())) return ''
    const diff = Math.floor((Date.now() - date.getTime()) / 1000)
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
}

export default function StudentTopBar() {
    const pathname = usePathname()
    const { notifications } = useStudentData()
    const { user } = useAuth()

    const [bellOpen, setBellOpen] = useState(false)
    const bellRef = useRef<HTMLDivElement>(null)

    const notifList: Notification[] = Array.isArray(notifications) ? notifications : []
    const unreadCount = notifList.filter((n) => !n.isRead).length

    // Match exact then prefix
    const title =
        PAGE_TITLES[pathname] ??
        Object.entries(PAGE_TITLES).find(([k]) => pathname.startsWith(k + '/'))?.[1] ??
        'EDUING'

    const fullName = (user as any)?.fullName ?? (user as any)?.displayName ?? ''
    const firstName = fullName.split(' ')[0] ?? ''
    const avatarLetter = firstName ? firstName[0].toUpperCase() : '?'

    // Close bell dropdown on outside click
    useEffect(() => {
        if (!bellOpen) return
        function handleClick(e: MouseEvent) {
            if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
                setBellOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [bellOpen])

    async function handleMarkRead(id: string) {
        await markNotificationAsRead(id)
    }

    async function handleClearAll() {
        const unread = notifList.filter((n) => !n.isRead)
        if (!unread.length) return
        const batch = writeBatch(db)
        unread.forEach((n) => {
            batch.update(doc(db, 'notifications', n.id), { isRead: true })
        })
        await batch.commit()
    }

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
            </h1>

            {/* Right actions */}
            <div className="flex items-center gap-1.5">

                {/* ── Notification Bell ── */}
                <div ref={bellRef} className="relative">
                    <button
                        id="notif-bell-btn"
                        onClick={() => setBellOpen((v) => !v)}
                        aria-haspopup="true"
                        aria-expanded={bellOpen}
                        aria-label={`Notifications${unreadCount > 0 ? ` — ${unreadCount} unread` : ''}`}
                        className="relative p-2 rounded-[8px] transition-colors"
                        style={{
                            color: bellOpen ? 'var(--accent)' : 'var(--text-muted)',
                            background: bellOpen ? 'var(--accent-bg)' : 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        <Bell size={18} />
                        {unreadCount > 0 && (
                            <span
                                className="absolute top-1 right-1 min-w-[16px] h-[16px] text-[10px] font-bold flex items-center justify-center rounded-full px-0.5"
                                style={{ background: 'var(--red, #ef4444)', color: '#fff' }}
                            >
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Notification dropdown */}
                    {bellOpen && (
                        <div
                            role="dialog"
                            aria-label="Notifications panel"
                            className="absolute right-0 mt-2 flex flex-col"
                            style={{
                                width: '340px',
                                maxWidth: 'calc(100vw - 24px)',
                                background: 'var(--bg-elevated)',
                                border: '1px solid var(--border)',
                                borderRadius: '12px',
                                boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
                                zIndex: 50,
                                overflow: 'hidden',
                            }}
                        >
                            {/* Header row */}
                            <div
                                className="flex items-center justify-between px-4 py-2.5 shrink-0"
                                style={{ borderBottom: '1px solid var(--border)' }}
                            >
                                <span className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                                    Notifications
                                    {unreadCount > 0 && (
                                        <span
                                            className="ml-1.5 text-[11px] font-bold px-1.5 py-0.5 rounded-full"
                                            style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}
                                        >
                                            {unreadCount}
                                        </span>
                                    )}
                                </span>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleClearAll}
                                        className="flex items-center gap-1 text-[12px] transition-colors hover:opacity-70"
                                        style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}
                                        title="Mark all as read"
                                    >
                                        <CheckCheck size={13} />
                                        Clear all
                                    </button>
                                )}
                            </div>

                            {/* Notification list */}
                            <div className="overflow-y-auto" style={{ maxHeight: '360px' }}>
                                {notifList.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 gap-2">
                                        <Inbox size={28} style={{ color: 'var(--text-faint)' }} />
                                        <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
                                            You&apos;re all caught up!
                                        </p>
                                    </div>
                                ) : (
                                    notifList.map((n, idx) => (
                                        <div
                                            key={n.id}
                                            className="flex items-start gap-3 px-4 py-3 transition-colors"
                                            style={{
                                                background: n.isRead ? 'transparent' : 'var(--accent-bg, rgba(99,102,241,0.05))',
                                                borderBottom: idx < notifList.length - 1 ? '1px solid var(--border)' : 'none',
                                            }}
                                        >
                                            {/* Unread dot */}
                                            <span
                                                className="mt-1.5 w-2 h-2 rounded-full shrink-0"
                                                style={{
                                                    background: n.isRead ? 'transparent' : 'var(--accent)',
                                                    border: n.isRead ? '2px solid var(--border)' : 'none',
                                                }}
                                            />

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <p
                                                    className="text-[13px] font-semibold leading-snug truncate"
                                                    style={{ color: 'var(--text-primary)' }}
                                                >
                                                    {n.title}
                                                </p>
                                                <p
                                                    className="text-[12px] leading-snug mt-0.5"
                                                    style={{
                                                        color: 'var(--text-secondary)',
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden',
                                                    } as React.CSSProperties}
                                                >
                                                    {n.message}
                                                </p>
                                                <div className="flex items-center justify-between mt-1">
                                                    <span className="text-[11px]" style={{ color: 'var(--text-faint)' }}>
                                                        {formatRelative(n.createdAt)}
                                                    </span>
                                                    {!n.isRead && (
                                                        <button
                                                            onClick={() => handleMarkRead(n.id)}
                                                            className="text-[11px] transition-colors hover:opacity-70"
                                                            style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}
                                                        >
                                                            Mark as read
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Footer */}
                            {notifList.length > 0 && (
                                <div
                                    className="px-4 py-2 shrink-0 flex justify-center"
                                    style={{ borderTop: '1px solid var(--border)' }}
                                >
                                    <Link
                                        href="/student/notifications"
                                        onClick={() => setBellOpen(false)}
                                        className="text-[12px] transition-colors hover:opacity-70"
                                        style={{ color: 'var(--accent)' }}
                                    >
                                        View all notifications
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Profile chip — navigates directly to /student/profile ── */}
                <Link
                    id="profile-chip-btn"
                    href="/student/profile"
                    aria-label="Go to profile"
                    className="flex items-center gap-2 px-2 py-1 transition-all hover:opacity-80"
                    style={{
                        borderRadius: '12px',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                    }}
                >
                    {/* Avatar circle */}
                    <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                        style={{
                            background: 'var(--accent-bg)',
                            color: 'var(--accent)',
                            border: '1px solid var(--accent-border)',
                        }}
                        aria-hidden="true"
                    >
                        {avatarLetter}
                    </span>

                    {/* Display name */}
                    {firstName && (
                        <span
                            className="text-[13px] font-medium leading-none hidden sm:block"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            {firstName}
                        </span>
                    )}
                </Link>
            </div>
        </header>
    )
}
