// components/dashboard/StudentSidebar.tsx
'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
    LayoutDashboard, FileText, Building2, BookOpen,
    Settings, Bookmark, Bot, User, Bell,
    ChevronLeft, ChevronRight, CalendarDays, Sparkles, PenLine,
} from 'lucide-react'
import Logo from '@/components/Logo'
import { useStudentData } from '@/components/providers/StudentDataProvider'
import { useAuth } from '@/hooks/useAuth'

interface NavItem {
    label: string
    href: string
    icon: React.ElementType
    badge?: number | string
}

const primaryNav: NavItem[] = [
    { label: 'Dashboard',     href: '/student/dashboard',    icon: LayoutDashboard },
    { label: 'Universities',  href: '/student/universities',  icon: Building2 },
    { label: 'Applications',  href: '/student/applications',  icon: FileText },
    { label: 'Scholarships',  href: '/student/scholarships',  icon: BookOpen },
    { label: 'Saved',         href: '/student/saved',         icon: Bookmark },
    { label: 'Calendar',      href: '/student/calendar',      icon: CalendarDays },
]

const aiNav: NavItem[] = [
    { label: 'AI Copilot',      href: '/student/copilot', icon: Bot },
    { label: 'Resume Builder',  href: '/student/resume',  icon: User },
    { label: 'SOP Builder',     href: '/student/sop',     icon: PenLine },
]

const bottomNav: NavItem[] = [
    { label: 'Notifications', href: '/student/notifications', icon: Bell },
    { label: 'Settings',      href: '/student/settings',      icon: Settings },
]

interface SidebarProps {
    isCollapsed: boolean
    setIsCollapsed: (v: boolean) => void
}

function useActive(href: string) {
    const pathname = usePathname() ?? ''
    return pathname === href || pathname.startsWith(href + '/')
}

function NavLink({ item, isCollapsed, count }: { item: NavItem; isCollapsed: boolean; count?: number }) {
    const isActive = useActive(item.href)
    return (
        <Link
            href={item.href}
            title={isCollapsed ? item.label : undefined}
            aria-current={isActive ? 'page' : undefined}
            className={`group relative flex items-center gap-3 rounded-full py-2.5 text-[13.5px] font-semibold transition-colors duration-200 ${isCollapsed ? 'justify-center px-0' : 'px-3.5'}`}
            style={{ color: isActive ? '#fff' : 'var(--text-secondary)' }}
        >
            {isActive && (
                <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-full"
                    style={{ background: 'var(--accent)', boxShadow: 'var(--shadow-glow)' }}
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
            )}
            {!isActive && (
                <span className="absolute inset-0 rounded-full opacity-0 transition-opacity group-hover:opacity-100" style={{ background: 'var(--bg-card-hover)' }} />
            )}
            <item.icon size={17} className="relative shrink-0" />
            {!isCollapsed && <span className="relative truncate">{item.label}</span>}
            {!isCollapsed && count && count > 0 ? (
                <span
                    className="relative ml-auto flex h-[19px] min-w-[19px] items-center justify-center rounded-full px-1.5 text-[11px] font-bold"
                    style={{ background: 'var(--gold-bright)', color: '#17142B' }}
                >
                    {count > 99 ? '99+' : count}
                </span>
            ) : null}
            {isCollapsed && (
                <span
                    className="pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded-full px-3 py-1.5 text-[12px] font-semibold opacity-0 transition-opacity group-hover:opacity-100"
                    style={{ background: 'var(--night)', color: '#fff', boxShadow: 'var(--shadow-card-hover)' }}
                >
                    {item.label}
                </span>
            )}
        </Link>
    )
}

function NavSection({ label, items, isCollapsed, counts }: { label: string; items: NavItem[]; isCollapsed: boolean; counts?: Record<string, number> }) {
    return (
        <div className="space-y-1">
            {!isCollapsed && (
                <p className="mb-1.5 px-3.5 text-[10.5px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-faint)' }}>
                    {label}
                </p>
            )}
            {items.map(item => (
                <NavLink key={item.href} item={item} isCollapsed={isCollapsed} count={counts?.[item.href]} />
            ))}
        </div>
    )
}

function ProfileBlock({ isCollapsed }: { isCollapsed: boolean }) {
    const { user } = useAuth()
    const data = useStudentData() as Partial<ReturnType<typeof useStudentData>>
    const profile = (data?.profile ?? {}) as Record<string, any>
    const name: string = profile.fullName || (user as any)?.fullName || (user as any)?.displayName || 'Student'
    const initials = name.split(/\s+/).map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
    const sub: string = profile.city || profile.stream || profile.targetDegree || 'Student'
    const score = typeof data?.profileScore === 'number' ? data.profileScore : null

    const avatar = (size: number) => (
        <span className="relative shrink-0">
            {score !== null && (
                <svg viewBox="0 0 44 44" className="absolute -inset-[5px] -rotate-90" style={{ width: size + 10, height: size + 10 }} aria-hidden>
                    <circle cx="22" cy="22" r="20" fill="none" strokeWidth="2.5" style={{ stroke: 'var(--border)' }} />
                    <circle cx="22" cy="22" r="20" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={125.6} strokeDashoffset={125.6 * (1 - score / 100)} style={{ stroke: 'var(--gold-bright)', transition: 'stroke-dashoffset 1s ease' }} />
                </svg>
            )}
            <span
                className="flex items-center justify-center rounded-full font-bold text-white"
                style={{ width: size, height: size, fontSize: size * 0.34, background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
            >
                {initials}
            </span>
        </span>
    )

    if (isCollapsed) {
        return <Link href="/student/profile" aria-label="Go to profile" className="mx-auto my-3 block">{avatar(36)}</Link>
    }
    return (
        <Link href="/student/profile" aria-label="Go to profile" className="mx-3 my-2 flex flex-col items-center rounded-[22px] px-3 py-3 text-center transition-colors hover:bg-[var(--bg-card-hover)]">
            {avatar(48)}
            <span className="mt-3 max-w-full truncate text-[15px] font-bold" style={{ color: 'var(--text-primary)' }}>{name}</span>
            <span className="max-w-full truncate text-[12px]" style={{ color: 'var(--text-muted)' }}>{sub}</span>
            {score !== null && (
                <span className="mt-2 rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ background: 'var(--gold-bg)', color: 'var(--gold)' }}>
                    Profile {score}%
                </span>
            )}
        </Link>
    )
}

export default function StudentSidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
    const data = useStudentData() as Partial<ReturnType<typeof useStudentData>>
    const notifs = Array.isArray(data?.notifications) ? data!.notifications! : []
    const unread = notifs.filter((n: any) => !n.isRead).length
    const pathname = usePathname() ?? ''

    return (
        <>
            {/* Desktop sidebar — floating rounded panel */}
            <aside
                className={`fixed bottom-3 left-3 top-3 z-40 hidden flex-col rounded-[28px] transition-[width] duration-300 lg:flex ${isCollapsed ? 'w-[76px]' : 'w-[252px]'}`}
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}
            >
                <div className={`relative flex h-[64px] shrink-0 items-center ${isCollapsed ? 'justify-center' : 'justify-between pl-5 pr-3'}`}>
                    {isCollapsed ? <Logo iconOnly height={30} /> : <Logo height={28} />}
                    <button
                        type="button"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-[var(--bg-card-hover)] ${isCollapsed ? 'absolute -right-3.5 top-1/2 -translate-y-1/2' : ''}`}
                        style={{ color: 'var(--text-muted)', ...(isCollapsed ? { background: 'var(--bg-elevated)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' } : {}) }}
                        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={16} />}
                    </button>
                </div>

                <ProfileBlock isCollapsed={isCollapsed} />

                <nav className={`custom-scrollbar flex-1 space-y-4 overflow-y-auto overflow-x-hidden pb-4 ${isCollapsed ? 'px-3' : 'px-3'}`} aria-label="Student navigation">
                    <NavSection label="Main" items={primaryNav} isCollapsed={isCollapsed} />
                    <NavSection label="AI tools" items={aiNav} isCollapsed={isCollapsed} />
                    <NavSection label="Account" items={bottomNav} isCollapsed={isCollapsed} counts={{ '/student/notifications': unread }} />
                </nav>

                {!isCollapsed && (
                    <div className="relative mx-3 mb-3 mt-1 shrink-0 overflow-hidden rounded-[22px] p-4 pt-6 text-center text-white [@media(max-height:940px)]:hidden" style={{ background: 'var(--night)' }}>
                        <span aria-hidden className="absolute -right-[32px] -top-10 h-[96px] w-[96px] rounded-full opacity-60 blur-2xl" style={{ background: 'var(--accent)' }} />
                        <span className="absolute left-1/2 top-0 flex h-9 w-9 -translate-x-1/2 -translate-y-1/3 items-center justify-center rounded-full border-4" style={{ background: 'var(--gold-bright)', color: '#17142B', borderColor: 'var(--bg-elevated)' }}>
                            <Sparkles size={15} />
                        </span>
                        <p className="relative text-[13.5px] font-bold">Need guidance?</p>
                        <p className="relative mb-3 mt-0.5 text-[11.5px] text-white/60">Ask the AI Copilot anything about admissions</p>
                        <Link href="/student/copilot" className="relative block rounded-full bg-white py-2 text-[12px] font-bold text-[#17142B] transition-transform hover:-translate-y-0.5">
                            Ask Copilot
                        </Link>
                    </div>
                )}
            </aside>

            {/* Mobile bottom bar — floating pill with centre action */}
            <nav
                aria-label="Student navigation (mobile)"
                className="fixed inset-x-3 bottom-3 z-40 flex h-[64px] items-center justify-around rounded-[26px] px-2 lg:hidden"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card-hover)' }}
            >
                {[primaryNav[0], primaryNav[1], null, primaryNav[2], bottomNav[0]].map((item, i) => {
                    if (!item) {
                        return (
                            <Link key="fab" href="/student/copilot" aria-label="AI Copilot" className="-mt-[32px] flex h-14 w-14 items-center justify-center rounded-full text-[#17142B] transition-transform active:scale-95" style={{ background: 'var(--gold-bright)', boxShadow: '0 12px 24px -8px rgba(245,184,41,.7)' }}>
                                <Bot size={22} />
                            </Link>
                        )
                    }
                    const active = pathname === item.href || pathname.startsWith(item.href + '/')
                    return (
                        <Link key={item.href} href={item.href} aria-label={item.label} className="relative flex flex-col items-center gap-0.5 px-2 text-[10px] font-semibold" style={{ color: active ? 'var(--accent)' : 'var(--text-muted)' }}>
                            <item.icon size={19} />
                            {item.label.split(' ')[0]}
                            {item.href === '/student/notifications' && unread > 0 && (
                                <span className="absolute -top-1 right-1 h-2 w-2 rounded-full" style={{ background: 'var(--red)' }} />
                            )}
                            {active && <span className="absolute -bottom-2 h-1 w-1 rounded-full" style={{ background: 'var(--accent)' }} />}
                        </Link>
                    )
                })}
            </nav>
        </>
    )
}
