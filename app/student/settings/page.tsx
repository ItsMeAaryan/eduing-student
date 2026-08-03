// app/student/settings/page.tsx
'use client'

import React, { useState } from 'react'
import {
  User, Bell, Lock, Monitor, Smartphone, Key,
  Fingerprint, Sun, Moon, Laptop, Layers, Activity,
  Check, ChevronRight
} from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import SegmentedTabs from '@/components/ui/SegmentedTabs'
import { useAuth } from '@/hooks/useAuth'
import { useStudentData } from '@/components/providers/StudentDataProvider'
import { useTheme } from 'next-themes'

const TABS = ['General', 'Appearance', 'Notifications', 'Security', 'AI Preferences']

/* ── Reusable primitives ────────────────────────────────────────── */
const CARD: React.CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  boxShadow: '0 0.175px 1px rgba(0,0,0,0.015), 0 0.8px 2.9px rgba(0,0,0,0.022), 0 2px 7.8px rgba(0,0,0,0.027)',
  overflow: 'hidden',
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div style={{
      padding: '14px 20px',
      borderBottom: '1px solid var(--border)',
      fontSize: 15,
      fontWeight: 600,
      color: 'var(--text-primary)',
    }}>
      {title}
    </div>
  )
}

function Row({
  title, sub, action, icon: Icon, danger = false,
}: {
  title: string; sub: string; action?: string; icon?: React.ElementType; danger?: boolean
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 20px',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {Icon && (
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--accent-bg)',
            border: '1px solid var(--accent-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Icon size={14} style={{ color: 'var(--accent)' }} strokeWidth={1.8} />
          </div>
        )}
        <div>
          <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>{title}</p>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0' }}>{sub}</p>
        </div>
      </div>
      {action && (
        <button style={{
          height: 30, padding: '0 12px',
          fontSize: 12, fontWeight: 500,
          borderRadius: 6, cursor: 'pointer',
          border: danger ? '1px solid rgba(220,38,38,0.3)' : '1px solid var(--border)',
          background: danger ? 'rgba(220,38,38,0.07)' : 'var(--bg-elevated)',
          color: danger ? 'var(--red)' : 'var(--text-secondary)',
          transition: 'border-color 0.15s',
        }}>
          {action}
        </button>
      )}
    </div>
  )
}

function Toggle({ title, sub, defaultOn = false }: { title: string; sub: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 20px',
      borderBottom: '1px solid var(--border)',
    }}>
      <div>
        <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>{title}</p>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0' }}>{sub}</p>
      </div>
      <button
        onClick={() => setOn(v => !v)}
        role="switch"
        aria-checked={on}
        aria-label={title}
        style={{
          width: 40, height: 22, borderRadius: 999,
          border: 'none', cursor: 'pointer', padding: 2,
          background: on ? 'var(--accent)' : 'var(--border)',
          transition: 'background 0.2s',
          display: 'flex', alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <div style={{
          width: 18, height: 18, borderRadius: '50%',
          background: 'var(--bg-elevated)',
          transform: on ? 'translateX(18px)' : 'translateX(0)',
          transition: 'transform 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
        }} />
      </button>
    </div>
  )
}

function SessionCard({ device, browser, icon: Icon, current = false }: {
  device: string; browser: string; icon: React.ElementType; current?: boolean
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 20px',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 8,
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={16} style={{ color: 'var(--text-muted)' }} strokeWidth={1.5} />
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{device}</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>{browser}</p>
        </div>
      </div>
      {current ? (
        <span style={{
          fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 999,
          background: 'rgba(26,174,57,0.1)',
          border: '1px solid rgba(26,174,57,0.2)',
          color: 'var(--green)',
          letterSpacing: '0.04em',
        }}>
          ● This device
        </span>
      ) : (
        <button style={{
          fontSize: 12, fontWeight: 500, color: 'var(--red)',
          background: 'none', border: 'none', cursor: 'pointer',
          textDecoration: 'underline', textUnderlineOffset: 2,
        }}>
          Log out
        </button>
      )}
    </div>
  )
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('General')
  const { user } = useAuth()
  const { profile } = useStudentData()
  const { theme, setTheme } = useTheme()

  const themeOptions = [
    { key: 'light', label: 'Light', icon: Sun, desc: 'Warm paper canvas' },
    { key: 'dark', label: 'Dark', icon: Moon, desc: 'Ink on dark surface' },
    { key: 'system', label: 'System', icon: Laptop, desc: 'Match OS preference' },
  ]

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontFamily: 'Inter, system-ui, sans-serif' }}>

        {/* Sub-nav */}
        <SegmentedTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

        {/* ── GENERAL ─────────────────────────────────────────── */}
        {activeTab === 'General' && (
          <div style={CARD}>
            <SectionHeader title="General Settings" />
            <Row title="Account Email" sub={user?.email || 'Not set'} action="Change" icon={User} />
            <Row title="Phone Number" sub={profile?.phone || 'Not set'} action="Change" icon={User} />
            <Row title="Timezone" sub="Asia/Kolkata (IST)" action="Edit" />
            <Row title="Language" sub="English (India)" action="Edit" />
            <Row title="Delete Account" sub="Permanently remove your account and all data." action="Delete" danger />
          </div>
        )}

        {/* ── APPEARANCE ──────────────────────────────────────── */}
        {activeTab === 'Appearance' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Theme */}
            <div style={CARD}>
              <SectionHeader title="Theme Mode" />
              <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {themeOptions.map(opt => {
                  const IconComp = opt.icon
                  const active = theme === opt.key
                  return (
                    <button
                      key={opt.key}
                      onClick={() => setTheme(opt.key)}
                      style={{
                        padding: '14px 12px',
                        borderRadius: 10,
                        border: active ? '1px solid var(--accent-border)' : '1px solid var(--border)',
                        background: active ? 'var(--accent-bg)' : 'var(--bg)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s',
                        outline: 'none',
                      }}
                    >
                      <div style={{
                        width: 30, height: 30, borderRadius: 8, marginBottom: 10,
                        background: active ? 'var(--accent-bg)' : 'var(--bg-elevated)',
                        border: active ? '1px solid var(--accent-border)' : '1px solid var(--border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <IconComp size={14} style={{ color: active ? 'var(--accent)' : 'var(--text-muted)' }} strokeWidth={1.8} />
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: active ? 'var(--accent)' : 'var(--text-primary)', margin: '0 0 2px' }}>{opt.label}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>{opt.desc}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Accent color (read-only for now) */}
            <div style={CARD}>
              <SectionHeader title="Accent Color" />
              <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['#0075DE', '#1AAE39', '#D97706', '#8B5CF6', '#2a9d99'].map((c, i) => (
                    <div key={i} style={{
                      width: 26, height: 26, borderRadius: '50%',
                      background: c,
                      border: i === 0 ? '2px solid var(--text-primary)' : '2px solid transparent',
                      cursor: 'default',
                      boxShadow: 'var(--shadow-card)',
                    }} />
                  ))}
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  padding: '2px 8px', borderRadius: 999,
                }}>
                  EDUING Blue — Default
                </span>
              </div>
            </div>

            {/* Density & Motion */}
            <div style={CARD}>
              <SectionHeader title="Interface" />
              <Row title="Interface Density" sub="Comfortable (Default)" action="Change" icon={Layers} />
              <Row title="Motion Effects" sub="Full animations enabled" action="Change" icon={Activity} />
            </div>
          </div>
        )}

        {/* ── NOTIFICATIONS ───────────────────────────────────── */}
        {activeTab === 'Notifications' && (
          <div style={CARD}>
            <SectionHeader title="Notification Preferences" />
            <Toggle title="Email Notifications" sub="Receive daily digests and important updates." defaultOn />
            <Toggle title="Push Notifications" sub="Get real-time alerts on your device." defaultOn />
            <Toggle title="Scholarship Alerts" sub="Notified when new scholarships match your profile." defaultOn />
            <Toggle title="Deadline Reminders" sub="Alerts 7 days and 24 hours before each deadline." defaultOn />
            <Toggle title="AI Suggestions" sub="Weekly insights on universities and admissions." />
            <Toggle title="Application Updates" sub="Status changes for each submitted application." defaultOn />
          </div>
        )}

        {/* ── SECURITY ────────────────────────────────────────── */}
        {activeTab === 'Security' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={CARD}>
              <SectionHeader title="Authentication" />
              <Row title="Password" sub="Last changed 3 months ago" action="Update" icon={Key} />
              <Row title="Two-Factor Authentication" sub="Add an extra layer of security" action="Enable" icon={Fingerprint} />
            </div>

            <div style={CARD}>
              <SectionHeader title="Active Sessions" />
              <SessionCard device="MacBook Pro" browser="Chrome · India" icon={Monitor} current />
              <SessionCard device="iPhone 14 Pro" browser="Safari · India" icon={Smartphone} />
            </div>
          </div>
        )}

        {/* ── AI PREFERENCES ──────────────────────────────────── */}
        {activeTab === 'AI Preferences' && (
          <div style={CARD}>
            <SectionHeader title="AI & Personalization" />
            <Toggle title="Profile Engine" sub="Allow AI to automatically match you with universities." defaultOn />
            <Toggle title="Resume Parsing" sub="Allow AI to extract text from uploaded documents." defaultOn />
            <Toggle title="Smart Auto-Fill" sub="Use AI to pre-fill application forms." defaultOn />
            <Toggle title="Career Path Insights" sub="Weekly AI career advice based on your profile." defaultOn />
            <Toggle title="Interview Coaching" sub="Personalised question sets from your academic profile." defaultOn />
            <div style={{ padding: '14px 20px' }}>
              <button style={{
                height: 34, padding: '0 14px',
                fontSize: 13, fontWeight: 500,
                borderRadius: 8, cursor: 'pointer',
                border: '1px solid rgba(220,38,38,0.3)',
                background: 'rgba(220,38,38,0.07)',
                color: 'var(--red)',
              }}>
                Clear AI Cache & Recommendations
              </button>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                This will reset all personalised recommendations. Cannot be undone.
              </p>
            </div>
          </div>
        )}

      </div>
    </ProtectedRoute>
  )
}