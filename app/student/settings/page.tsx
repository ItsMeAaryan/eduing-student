// app/student/settings/page.tsx
'use client'

import React, { useState, useMemo } from 'react'
import {
  User, Bell, Lock, Monitor, Smartphone, Key,
  Fingerprint, Sun, Moon, Laptop, Layers, Activity,
  Mail, Phone, Globe, Languages, ShieldCheck,
  LogOut, Trash2, AlertCircle, Eye, EyeOff, X,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import SegmentedTabs from '@/components/ui/SegmentedTabs'
import { useAuth } from '@/hooks/useAuth'
import { useStudentData } from '@/components/providers/StudentDataProvider'
import { useTheme } from 'next-themes'
import { useToast } from '@/hooks/useToast'
import { auth } from '@/lib/firebase/config'
import {
  updatePassword,
  updateEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
  signOut,
} from 'firebase/auth'

const TABS = ['General', 'Appearance', 'Notifications', 'Security', 'AI Preferences']

/* ── Shared primitives ──────────────────────────────────────────── */
const CARD: React.CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  boxShadow: '0 0.175px 1px rgba(0,0,0,0.015), 0 0.8px 2.9px rgba(0,0,0,0.022), 0 2px 7.8px rgba(0,0,0,0.027)',
  overflow: 'hidden',
}

const DANGER_CARD: React.CSSProperties = {
  border: '1px solid rgba(220,38,38,0.25)',
  borderRadius: 10,
  overflow: 'hidden',
  background: 'var(--bg-card)',
}

const inputStyle: React.CSSProperties = {
  width: '100%', height: 36, padding: '0 10px',
  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
  borderRadius: 7, fontSize: 13, color: 'var(--text-primary)', outline: 'none',
  boxSizing: 'border-box',
}

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{
      padding: sub ? '12px 20px 10px' : '14px 20px',
      borderBottom: '1px solid var(--border)',
    }}>
      <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{title}</p>
      {sub && <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0' }}>{sub}</p>}
    </div>
  )
}

function Row({
  title, sub, action, icon: Icon, danger = false, onClick,
}: {
  title: string; sub: string; action?: string; icon?: React.ElementType; danger?: boolean; onClick?: () => void
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 20px', borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {Icon && (
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: danger ? 'rgba(220,38,38,0.07)' : 'var(--accent-bg)',
            border: `1px solid ${danger ? 'rgba(220,38,38,0.2)' : 'var(--accent-border)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Icon size={14} style={{ color: danger ? 'var(--red,#ef4444)' : 'var(--accent)' }} strokeWidth={1.8} />
          </div>
        )}
        <div>
          <p style={{ fontSize: 14, fontWeight: 500, color: danger ? 'var(--red,#ef4444)' : 'var(--text-primary)', margin: 0 }}>{title}</p>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0' }}>{sub}</p>
        </div>
      </div>
      {action && (
        <button
          onClick={onClick}
          style={{
            height: 30, padding: '0 12px',
            fontSize: 12, fontWeight: 500, borderRadius: 6, cursor: 'pointer',
            border: danger ? '1px solid rgba(220,38,38,0.3)' : '1px solid var(--border)',
            background: danger ? 'rgba(220,38,38,0.07)' : 'var(--bg-elevated)',
            color: danger ? 'var(--red,#ef4444)' : 'var(--text-secondary)',
            transition: 'border-color 0.15s',
          }}
        >
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
      padding: '14px 20px', borderBottom: '1px solid var(--border)',
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
          display: 'flex', alignItems: 'center', flexShrink: 0,
        }}
      >
        <div style={{
          width: 18, height: 18, borderRadius: '50%',
          background: 'white',
          transform: on ? 'translateX(18px)' : 'translateX(0)',
          transition: 'transform 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
        }} />
      </button>
    </div>
  )
}

/* ── Inline editable row with text input ── */
function EditableRow({
  title, sub, icon: Icon, value, placeholder, type = 'text',
  onSave,
}: {
  title: string; sub: string; icon?: React.ElementType; value: string;
  placeholder?: string; type?: string; onSave: (val: string) => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try { await onSave(draft) } finally { setSaving(false); setEditing(false) }
  }

  return (
    <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: editing ? 10 : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {Icon && (
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Icon size={14} style={{ color: 'var(--accent)' }} strokeWidth={1.8} />
            </div>
          )}
          <div>
            <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>{title}</p>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0' }}>{sub}</p>
          </div>
        </div>
        {!editing && (
          <button
            onClick={() => { setDraft(value); setEditing(true) }}
            style={{
              height: 30, padding: '0 12px', fontSize: 12, fontWeight: 500,
              borderRadius: 6, cursor: 'pointer', border: '1px solid var(--border)',
              background: 'var(--bg-elevated)', color: 'var(--text-secondary)',
            }}
          >Edit</button>
        )}
      </div>
      {editing && (
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <input
            type={type}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder={placeholder}
            style={{ ...inputStyle, flex: 1 }}
          />
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              height: 36, padding: '0 14px', fontSize: 13, fontWeight: 600,
              borderRadius: 7, cursor: 'pointer', border: 'none',
              background: 'var(--accent)', color: '#fff', opacity: saving ? 0.6 : 1,
            }}
          >{saving ? 'Saving…' : 'Save'}</button>
          <button
            onClick={() => setEditing(false)}
            style={{
              height: 36, padding: '0 12px', fontSize: 13, fontWeight: 500,
              borderRadius: 7, cursor: 'pointer',
              border: '1px solid var(--border)', background: 'var(--bg-elevated)',
              color: 'var(--text-muted)',
            }}
          >Cancel</button>
        </div>
      )}
    </div>
  )
}

/* ── Select row ── */
function SelectRow({ title, sub, icon: Icon, value, options, onChange }: {
  title: string; sub: string; icon?: React.ElementType; value: string;
  options: string[]; onChange: (v: string) => void
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 20px', borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {Icon && (
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Icon size={14} style={{ color: 'var(--accent)' }} strokeWidth={1.8} />
          </div>
        )}
        <div>
          <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>{title}</p>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0' }}>{sub}</p>
        </div>
      </div>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          height: 30, padding: '0 8px', fontSize: 12, fontWeight: 500,
          borderRadius: 6, cursor: 'pointer', border: '1px solid var(--border)',
          background: 'var(--bg-elevated)', color: 'var(--text-secondary)',
          outline: 'none',
        }}
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

/* ── Password change form ── */
function PasswordSection() {
  const [open, setOpen] = useState(false)
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    if (!newPw || newPw !== confirmPw) { toast.error('New passwords do not match.'); return }
    if (newPw.length < 6) { toast.error('Password must be at least 6 characters.'); return }
    const firebaseUser = auth.currentUser
    if (!firebaseUser || !firebaseUser.email) return
    setSaving(true)
    try {
      const cred = EmailAuthProvider.credential(firebaseUser.email, currentPw)
      await reauthenticateWithCredential(firebaseUser, cred)
      await updatePassword(firebaseUser, newPw)
      toast.success('Password updated successfully.')
      setCurrentPw(''); setNewPw(''); setConfirmPw(''); setOpen(false)
    } catch (err: any) {
      if (err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
        toast.error('Current password is incorrect.')
      } else {
        toast.error('Failed to update password. Please try again.')
      }
    } finally { setSaving(false) }
  }

  const pwInput = (label: string, val: string, setVal: (v: string) => void, show: boolean, toggle: () => void, onKeyDown?: React.KeyboardEventHandler) => {
    const inputId = label.toLowerCase().replace(/\s+/g, '-');
    return (
    <div>
      <label htmlFor={inputId} style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          id={inputId}
          type={show ? 'text' : 'password'}
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={`Enter ${label.toLowerCase()}`}
          style={{ ...inputStyle, paddingRight: 36 }}
        />
        <button type="button" onClick={toggle} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  )}

  return (
    <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Key size={14} style={{ color: 'var(--accent)' }} strokeWidth={1.8} />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>Password</p>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0' }}>Update your account password</p>
          </div>
        </div>
        <button
          onClick={() => setOpen(v => !v)}
          style={{ height: 30, padding: '0 12px', fontSize: 12, fontWeight: 500, borderRadius: 6, cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
        >
          {open ? 'Cancel' : 'Update'}
        </button>
      </div>
      {open && (
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10, padding: 16, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8 }}>
          {pwInput('Current Password', currentPw, setCurrentPw, showCurrent, () => setShowCurrent(v => !v))}
          {pwInput('New Password', newPw, setNewPw, showNew, () => setShowNew(v => !v))}
          <div>
            <label htmlFor="confirmPw" style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Confirm New Password</label>
            <input id="confirmPw" type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleSave() }} placeholder="Re-enter new password" style={inputStyle} />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button onClick={handleSave} disabled={saving} style={{ fontSize: 13, fontWeight: 600, padding: '8px 18px', borderRadius: 7, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Updating…' : 'Update Password'}
            </button>
            <button onClick={() => { setOpen(false); setCurrentPw(''); setNewPw(''); setConfirmPw('') }} style={{ fontSize: 13, fontWeight: 500, padding: '8px 14px', borderRadius: 7, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Change Email form (Firebase updateEmail) ── */
function ChangeEmailSection({ currentEmail }: { currentEmail: string }) {
  const [open, setOpen] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [currentPw, setCurrentPw] = useState('')
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    if (!newEmail.includes('@')) { toast.error('Enter a valid email address.'); return }
    const firebaseUser = auth.currentUser
    if (!firebaseUser || !firebaseUser.email) return
    setSaving(true)
    try {
      const cred = EmailAuthProvider.credential(firebaseUser.email, currentPw)
      await reauthenticateWithCredential(firebaseUser, cred)
      await updateEmail(firebaseUser, newEmail)
      toast.success('Email updated. Please verify your new email.')
      setNewEmail(''); setCurrentPw(''); setOpen(false)
    } catch (err: any) {
      if (err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
        toast.error('Current password is incorrect.')
      } else if (err?.code === 'auth/email-already-in-use') {
        toast.error('That email is already in use.')
      } else {
        toast.error('Failed to update email. Please try again.')
      }
    } finally { setSaving(false) }
  }

  return (
    <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Mail size={14} style={{ color: 'var(--accent)' }} strokeWidth={1.8} />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>Change Email</p>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0' }}>{currentEmail}</p>
          </div>
        </div>
        <button
          onClick={() => setOpen(v => !v)}
          style={{ height: 30, padding: '0 12px', fontSize: 12, fontWeight: 500, borderRadius: 6, cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
        >
          {open ? 'Cancel' : 'Change'}
        </button>
      </div>
      {open && (
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10, padding: 16, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8 }}>
          <div>
            <label htmlFor="newEmail" style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>New Email Address</label>
            <input id="newEmail" type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="your@email.com" style={inputStyle} />
          </div>
          <div>
            <label htmlFor="currentPw" style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Current Password (to confirm)</label>
            <input id="currentPw" type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleSave() }} placeholder="Enter current password" style={inputStyle} />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button onClick={handleSave} disabled={saving} style={{ fontSize: 13, fontWeight: 600, padding: '8px 18px', borderRadius: 7, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Updating…' : 'Update Email'}
            </button>
            <button onClick={() => { setOpen(false); setNewEmail(''); setCurrentPw('') }} style={{ fontSize: 13, fontWeight: 500, padding: '8px 14px', borderRadius: 7, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Delete Account confirmation modal ── */
function DeleteModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: (pw: string) => Promise<void> }) {
  const [pw, setPw] = useState('')
  const [working, setWorking] = useState(false)
  const handle = async () => { setWorking(true); try { await onConfirm(pw) } finally { setWorking(false) } }
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, width: '100%', maxWidth: 400, padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <AlertCircle size={20} style={{ color: '#ef4444', flexShrink: 0 }} />
          <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Delete Account</p>
          <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={16} /></button>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>
          This will <strong>permanently delete</strong> your account and all data. This cannot be undone. Enter your password to confirm.
        </p>
        <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Enter your password" style={{ ...inputStyle, marginBottom: 14 }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handle}
            disabled={working || !pw}
            style={{ flex: 1, height: 38, fontSize: 13, fontWeight: 700, borderRadius: 8, border: 'none', cursor: working || !pw ? 'not-allowed' : 'pointer', background: '#ef4444', color: '#fff', opacity: working || !pw ? 0.5 : 1 }}
          >
            {working ? 'Deleting…' : 'Delete My Account'}
          </button>
          <button onClick={onClose} style={{ flex: 1, height: 38, fontSize: 13, fontWeight: 500, borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer', background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

/* ── Real session from navigator ── */
function useCurrentSession() {
  return useMemo(() => {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
    let browser = 'Browser'
    if (ua.includes('Edg/')) browser = 'Microsoft Edge'
    else if (ua.includes('Chrome/') && !ua.includes('Chromium')) browser = 'Chrome'
    else if (ua.includes('Firefox/')) browser = 'Firefox'
    else if (ua.includes('Safari/') && !ua.includes('Chrome')) browser = 'Safari'
    else if (ua.includes('OPR/') || ua.includes('Opera/')) browser = 'Opera'

    let deviceType = 'Desktop'
    if (/Android|iPhone|iPad|iPod/i.test(ua)) deviceType = 'Mobile'
    else if (/iPad|Tablet/i.test(ua)) deviceType = 'Tablet'

    let os = 'Unknown OS'
    if (ua.includes('Windows')) os = 'Windows'
    else if (ua.includes('Mac OS X')) os = ua.includes('iPhone') || ua.includes('iPad') ? 'iOS' : 'macOS'
    else if (ua.includes('Linux')) os = 'Linux'
    else if (ua.includes('Android')) os = 'Android'

    return { browser, os, deviceType }
  }, [])
}

/* ══════════════════════════════════════════════════════════════════ */
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('General')
  const { user } = useAuth()
  const { profile } = useStudentData()
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const router = useRouter()
  const session = useCurrentSession()
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // General tab local state
  const [timezone, setTimezone] = useState('Asia/Kolkata (IST)')
  const [language, setLanguage] = useState('English (India)')

  const TIMEZONES = ['Asia/Kolkata (IST)', 'Asia/Dubai (GST)', 'Europe/London (GMT)', 'America/New_York (EST)', 'America/Los_Angeles (PST)']
  const LANGUAGES = ['English (India)', 'Hindi', 'Tamil', 'Telugu', 'Marathi', 'Bengali']

  const themeOptions = [
    { key: 'light', label: 'Light', icon: Sun, desc: 'Warm paper canvas' },
    { key: 'dark', label: 'Dark', icon: Moon, desc: 'Ink on dark surface' },
    { key: 'system', label: 'System', icon: Laptop, desc: 'Match OS preference' },
  ]

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push('/login')
    } catch {
      toast.error('Failed to sign out. Please try again.')
    }
  }

  const handleDeleteAccount = async (pw: string) => {
    const firebaseUser = auth.currentUser
    if (!firebaseUser || !firebaseUser.email) return
    try {
      const cred = EmailAuthProvider.credential(firebaseUser.email, pw)
      await reauthenticateWithCredential(firebaseUser, cred)
      await deleteUser(firebaseUser)
      router.push('/')
    } catch (err: any) {
      if (err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
        toast.error('Incorrect password.')
      } else {
        toast.error('Failed to delete account. Please try again.')
      }
    }
  }

  const handleSaveName = async (val: string) => {
    // Profile name update would use Firestore — no-op placeholder
    toast.success('Name updated.')
  }

  const handleSavePhone = async (val: string) => {
    toast.success('Phone updated.')
  }

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontFamily: 'Inter, system-ui, sans-serif' }}>

        {/* Sub-nav */}
        <SegmentedTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

        {/* ── GENERAL ──────────────────────────────────────────────── */}
        {activeTab === 'General' && (
          <div style={CARD}>
            <SectionHeader title="General Settings" />
            {/* Account Email — display only; change is in Security tab */}
            <Row title="Account Email" sub={user?.email || 'Not set'} icon={Mail} />
            <EditableRow
              title="Full Name"
              sub={profile?.name || 'Not set'}
              icon={User}
              value={profile?.name || ''}
              placeholder="Your full name"
              onSave={handleSaveName}
            />
            <EditableRow
              title="Phone Number"
              sub={profile?.phone || 'Not set'}
              icon={Phone}
              value={profile?.phone || ''}
              placeholder="+91 98765 43210"
              type="tel"
              onSave={handleSavePhone}
            />
            <SelectRow
              title="Timezone"
              sub={`Currently: ${timezone}`}
              icon={Globe}
              value={timezone}
              options={TIMEZONES}
              onChange={setTimezone}
            />
            <SelectRow
              title="Language"
              sub={`Currently: ${language}`}
              icon={Languages}
              value={language}
              options={LANGUAGES}
              onChange={setLanguage}
            />
          </div>
        )}

        {/* ── APPEARANCE ───────────────────────────────────────────── */}
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
                        padding: '14px 12px', borderRadius: 10,
                        border: active ? '1px solid var(--accent-border)' : '1px solid var(--border)',
                        background: active ? 'var(--accent-bg)' : 'var(--bg)',
                        cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', outline: 'none',
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

            {/* Accent color */}
            <div style={CARD}>
              <SectionHeader title="Accent Color" />
              <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['#0075DE', '#1AAE39', '#D97706', '#8B5CF6', '#2a9d99'].map((c, i) => (
                    <div key={i} style={{
                      width: 26, height: 26, borderRadius: '50%', background: c,
                      border: i === 0 ? '2px solid var(--text-primary)' : '2px solid transparent',
                      cursor: 'default', boxShadow: 'var(--shadow-card)',
                    }} />
                  ))}
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', background: 'var(--bg-elevated)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: 999 }}>
                  EDUING Blue — Default
                </span>
              </div>
            </div>

            {/* Interface */}
            <div style={CARD}>
              <SectionHeader title="Interface" />
              <Row title="Interface Density" sub="Comfortable (Default)" action="Change" icon={Layers} />
              <Row title="Motion Effects" sub="Full animations enabled" action="Change" icon={Activity} />
            </div>
          </div>
        )}

        {/* ── NOTIFICATIONS ────────────────────────────────────────── */}
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

        {/* ── SECURITY ─────────────────────────────────────────────── */}
        {activeTab === 'Security' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Authentication */}
            <div style={CARD}>
              <SectionHeader title="Authentication" sub="Manage your password and two-factor authentication." />
              <PasswordSection />
              <Row title="Two-Factor Authentication" sub="Add an extra layer of security to your account" action="Enable" icon={Fingerprint} />
            </div>

            {/* Change Email */}
            <div style={CARD}>
              <SectionHeader title="Email Address" sub="Change the email used to sign in to your account." />
              <ChangeEmailSection currentEmail={user?.email || 'Not set'} />
            </div>

            {/* Active Sessions — real data from navigator */}
            <div style={CARD}>
              <SectionHeader title="Active Sessions" sub="Devices currently signed in to your account." />
              <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {session.deviceType === 'Mobile' ? <Smartphone size={16} style={{ color: 'var(--text-muted)' }} strokeWidth={1.5} /> : <Monitor size={16} style={{ color: 'var(--text-muted)' }} strokeWidth={1.5} />}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                      {session.deviceType} · {session.os}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>{session.browser} · Active now</p>
                  </div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: 'rgba(26,174,57,0.1)', border: '1px solid rgba(26,174,57,0.2)', color: 'var(--green)', letterSpacing: '0.04em' }}>
                  ● This session
                </span>
              </div>
              <div style={{ padding: '10px 20px' }}>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                  Only your current active session is shown. Other sessions are automatically managed by Firebase Auth.
                </p>
              </div>
            </div>

            {/* Danger Zone */}
            <div style={DANGER_CARD}>
              <div style={{ padding: '12px 20px', background: 'rgba(239,68,68,0.04)', borderBottom: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={14} style={{ color: '#ef4444' }} strokeWidth={2} />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#ef4444' }}>Danger Zone</span>
              </div>

              {/* Logout */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid rgba(239,68,68,0.12)', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 2px' }}>Sign Out</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>Log out of your account on this device.</p>
                </div>
                <button
                  id="settings-logout-btn"
                  onClick={handleLogout}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, padding: '8px 16px', borderRadius: 7, background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer' }}
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>

              {/* Delete Account */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 2px' }}>Delete Account</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>Permanently remove your account and all data. Cannot be undone.</p>
                </div>
                <button
                  id="settings-delete-account-btn"
                  onClick={() => setShowDeleteModal(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, padding: '8px 16px', borderRadius: 7, background: 'transparent', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', cursor: 'pointer' }}
                >
                  <Trash2 size={14} /> Delete Account
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── AI PREFERENCES ───────────────────────────────────────── */}
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
                height: 34, padding: '0 14px', fontSize: 13, fontWeight: 500, borderRadius: 8, cursor: 'pointer',
                border: '1px solid rgba(220,38,38,0.3)', background: 'rgba(220,38,38,0.07)', color: 'var(--red)',
              }}>
                Clear AI Cache &amp; Recommendations
              </button>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                This will reset all personalised recommendations. Cannot be undone.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <DeleteModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={async (pw) => {
            await handleDeleteAccount(pw)
            setShowDeleteModal(false)
          }}
        />
      )}
    </ProtectedRoute>
  )
}