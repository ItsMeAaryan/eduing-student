// components/dashboard/StudentSidebar.tsx
'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
    LayoutDashboard, FileText, Building2, BookOpen,
    Bell, Settings, Bookmark, GitCompare, Compass,
    Bot, Briefcase, FileUser, Mail, MessageSquare,
    GraduationCap, ChevronLeft, ChevronRight, X,
    CalendarDays
} from 'lucide-react'
import { useStudentData } from '@/components/providers/StudentDataProvider'
import Logo from '@/components/Logo'

interface NavItem {
    label: string
    href: string
    icon: React.ElementType
    badge?: number | string
}

const primaryNav: NavItem[] = [
    { label: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
    { label: 'Applications', href: '/student/applications', icon: FileText },
    { label: 'Universities', href: '/student/universities', icon: Building2 },
    { label: 'Programs', href: '/programs', icon: GraduationCap },
    { label: 'Scholarships', href: '/student/scholarships', icon: BookOpen },
    { label: 'Discover', href: '/student/discover', icon: Compass },
    { label: 'Saved', href: '/student/saved', icon: Bookmark },
    { label: 'Compare', href: '/student/compare', icon: GitCompare },
    { label: 'Calendar', href: '/student/calendar', icon: CalendarDays },
]

const aiNav: NavItem[] = [
    { label: 'AI Copilot', href: '/student/copilot', icon: Bot },
    { label: 'Career', href: '/student/career', icon: Briefcase },
    { label: 'Resume', href: '/student/resume', icon: FileUser },
    { label: 'SOP Builder', href: '/student/sop', icon: FileText },
    { label: 'Email Writer', href: '/student/email', icon: Mail },
    { label: 'Interview Prep', href: '/student/interview', icon: MessageSquare },
]

const bottomNav: NavItem[] = [
    { label: 'Notifications', href: '/student/notifications', icon: Bell },
    { label: 'Settings', href: '/student/settings', icon: Settings },
]

interface SidebarProps {
    isCollapsed: boolean
    setIsCollapsed: (v: boolean) => void
}

function NavLink({
    item,
    isCollapsed,
    unreadCount,
}: {
    item: NavItem
    isCollapsed: boolean
    unreadCount?: number
}) {
    const pathname = usePathname()
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

    return (
        <Link
            href={item.href}
            title={isCollapsed ? item.label : undefined}
            className="flex items-center gap-3 px-3 py-2 rounded-[10px] text-[13px] font-medium transition-all duration-150 group relative"
            style={{
                background: isActive ? 'var(--accent-bg)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                border: `1px solid ${isActive ? 'var(--accent-border)' : 'transparent'}`,
            }}
            onMouseEnter={e => {
                if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--bg-card-hover)'
            }}
            onMouseLeave={e => {
                if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'
            }}
        >
            <item.icon size={16} className="shrink-0" />
            {!isCollapsed && <span className="truncate">{item.label}</span>}
            {!isCollapsed && unreadCount && unreadCount > 0 ? (
                <span
                    className="ml-auto text-[11px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1"
                    style={{ background: 'var(--accent)', color: '#fff' }}
                >
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>
            ) : null}
            {/* Tooltip for collapsed state */}
            {isCollapsed && (
                <span
                    className="absolute left-full ml-2 px-2 py-1 rounded-[8px] text-[12px] font-medium whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                >
                    {item.label}
                </span>
            )}
        </Link>
    )
}

function NavSection({
    label,
    items,
    isCollapsed,
    unreadMap,
}: {
    label: string
    items: NavItem[]
    isCollapsed: boolean
    unreadMap?: Record<string, number>
}) {
    return (
        <div className="space-y-0.5">
            {!isCollapsed && (
                <p
                    className="px-3 text-[10px] font-bold tracking-widest uppercase mb-1"
                    style={{ color: 'var(--text-faint)' }}
                >
                    {label}
                </p>
            )}
            {items.map(item => (
                <NavLink
                    key={item.href}
                    item={item}
                    isCollapsed={isCollapsed}
                    unreadCount={unreadMap?.[item.href]}
                />
            ))}
        </div>
    )
}

export default function StudentSidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
    const { notifications } = useStudentData()
    const unreadCount = Array.isArray(notifications)
        ? notifications.filter((n: any) => !n.isRead).length
        : 0

    return (
        <>
            {/* Desktop sidebar */}
            <aside
                className={`hidden lg:flex flex-col fixed top-0 left-0 h-screen z-40 transition-all duration-300 ${isCollapsed ? 'w-[64px]' : 'w-[240px]'
                    }`}
                style={{
                    background: 'var(--bg-elevated)',
                    borderRight: '1px solid var(--border)',
                }}
            >
                {/* Logo + collapse toggle */}
                <div
                    className="flex items-center justify-between px-3 h-[56px] shrink-0"
                    style={{ borderBottom: '1px solid var(--border)' }}
                >
                    {!isCollapsed && <Logo />}
                    <button
                        type="button"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-1.5 rounded-[8px] transition-colors ml-auto"
                        style={{ color: 'var(--text-muted)' }}
                        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    </button>
                </div>

                {/* Scrollable nav */}
                <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 space-y-5">
                    <NavSection label="Main" items={primaryNav} isCollapsed={isCollapsed} />
                    <div style={{ borderTop: '1px solid var(--border)', marginTop: '8px', paddingTop: '8px' }}>
                        <NavSection
                            label="AI Tools"
                            items={aiNav}
                            isCollapsed={isCollapsed}
                        />
                    </div>
                </nav>

                {/* Bottom nav */}
                <div
                    className="px-2 py-3 space-y-0.5 shrink-0"
                    style={{ borderTop: '1px solid var(--border)' }}
                >
                    <NavLink
                        item={bottomNav[0]}
                        isCollapsed={isCollapsed}
                        unreadCount={unreadCount}
                    />
                    <NavLink item={bottomNav[1]} isCollapsed={isCollapsed} />
                </div>
            </aside>

            {/* Mobile bottom nav */}
            <nav
                className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-2 h-[60px]"
                style={{
                    background: 'var(--bg-elevated)',
                    borderTop: '1px solid var(--border)',
                }}
            >
                {[...primaryNav.slice(0, 4), ...bottomNav].map(item => {
                    return (
                        <NavLink key={item.href} item={item} isCollapsed={true} />
                    )
                })}
            </nav>
        </>
    )
}