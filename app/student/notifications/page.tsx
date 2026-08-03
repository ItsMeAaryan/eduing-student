// app/student/notifications/page.tsx
'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Bell, Info, CheckCircle2, AlertCircle, Clock, Mail } from 'lucide-react'
import { useStudentData } from '@/components/providers/StudentDataProvider'

function getNotifConfig(type: string): {
  Icon: React.ElementType
  dotColor: string
  bg: string
  border: string
  iconColor: string
} {
  switch ((type || '').toLowerCase()) {
    case 'offer':
    case 'approved':
    case 'selected':
      return {
        Icon: CheckCircle2,
        dotColor: '#1AAE39',
        bg: 'rgba(26,174,57,0.07)',
        border: 'rgba(26,174,57,0.18)',
        iconColor: '#1AAE39',
      }
    case 'warning':
    case 'deadline':
    case 'overdue':
      return {
        Icon: AlertCircle,
        dotColor: '#D97706',
        bg: 'rgba(217,119,6,0.07)',
        border: 'rgba(217,119,6,0.18)',
        iconColor: '#D97706',
      }
    case 'status':
    case 'status_update':
      return {
        Icon: Info,
        dotColor: 'var(--accent)',
        bg: 'var(--accent-bg)',
        border: 'var(--accent-border)',
        iconColor: 'var(--accent)',
      }
    default:
      return {
        Icon: Clock,
        dotColor: 'var(--text-muted)',
        bg: 'rgba(0,0,0,0.04)',
        border: 'var(--border)',
        iconColor: 'var(--text-muted)',
      }
  }
}

export default function NotificationsPage() {
  const { notifications } = useStudentData()
  const safeNotifs = Array.isArray(notifications) ? notifications : []

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="flex flex-col gap-[24px]">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1
              style={{
                fontSize: 26,
                fontWeight: 700,
                letterSpacing: '-0.5px',
                color: 'var(--text-primary)',
                margin: 0,
              }}
            >
              Notifications
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
              Stay updated with your application progress and announcements.
            </p>
          </div>
          {safeNotifs.length > 0 && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: '2px 10px',
                borderRadius: 999,
                background: 'var(--accent-bg)',
                border: '1px solid var(--accent-border)',
                color: 'var(--accent)',
                letterSpacing: '0.04em',
              }}
            >
              {safeNotifs.filter((n: any) => !n.read && !n.isRead).length} Unread
            </span>
          )}
        </div>

        {/* Empty state */}
        {safeNotifs.length === 0 && (
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: '48px 24px',
              textAlign: 'center',
              boxShadow: 'var(--shadow-card)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bell size={22} style={{ color: 'var(--text-muted)' }} strokeWidth={1.5} />
            </div>
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              No notifications yet
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 320, margin: 0, lineHeight: 1.5 }}>
              You&rsquo;ll be notified about application updates, deadlines, and platform announcements here.
            </p>
          </div>
        )}

        {/* Notification list */}
        {safeNotifs.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 800 }}>
            <AnimatePresence initial={false}>
              {safeNotifs.map((notif: any, i: number) => {
                const cfg = getNotifConfig(notif.type || '')
                const Icon = cfg.Icon
                const isRead = notif.read || notif.isRead
                const dateStr = notif.createdAt?.toDate
                  ? notif.createdAt.toDate().toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })
                  : notif.time || ''

                return (
                  <motion.div
                    key={notif.id || i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ delay: i * 0.04 }}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: 10,
                      padding: '16px 20px',
                      display: 'flex',
                      gap: 16,
                      alignItems: 'flex-start',
                      boxShadow: 'var(--shadow-card)',
                      opacity: isRead ? 0.75 : 1,
                      cursor: 'default',
                      transition: 'border-color 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-hover)'
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'
                    }}
                  >
                    {/* Unread dot */}
                    {!isRead && (
                      <div
                        style={{
                          position: 'absolute',
                          left: 8,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: 'var(--accent)',
                        }}
                      />
                    )}

                    {/* Icon */}
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: cfg.bg,
                        border: `1px solid ${cfg.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={18} style={{ color: cfg.iconColor }} strokeWidth={1.8} />
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 4 }}>
                        <p
                          style={{
                            fontSize: 14,
                            fontWeight: isRead ? 500 : 600,
                            color: 'var(--text-primary)',
                            margin: 0,
                          }}
                        >
                          {notif.title || 'Notification'}
                        </p>
                        {dateStr && (
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                            {dateStr}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                        {notif.message || notif.description || ''}
                      </p>

                      {/* Dot badge for type */}
                      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: '50%',
                            background: cfg.dotColor,
                            display: 'inline-block',
                          }}
                        />
                        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          {notif.type || 'General'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}