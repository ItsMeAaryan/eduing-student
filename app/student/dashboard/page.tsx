'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase/config'
import Link from 'next/link'

export default function StudentDashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [applications, setApplications] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) { router.push('/auth/login'); return }

      // Profile
      const unsubProfile = onSnapshot(
        doc(db, 'student_profiles', user.uid),
        (snap) => { setProfile(snap.exists() ? snap.data() : {}); setLoading(false) },
        (err) => { console.error(err); setLoading(false); setError('Failed to load profile') }
      )

      // Applications
      const unsubApps = onSnapshot(
        query(collection(db, 'applications'), where('studentId', '==', user.uid)),
        (snap) => setApplications(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
        (err) => console.error('Apps error:', err)
      )

      // Notifications
      const unsubNotifs = onSnapshot(
        query(collection(db, 'notifications'), where('userId', '==', user.uid)),
        (snap) => setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
        (err) => console.error('Notifs error:', err)
      )

      return () => { unsubProfile(); unsubApps(); unsubNotifs() }
    })
    return unsub
  }, [router])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ width: '32px', height: '32px', border: '2px solid rgba(79,70,229,0.2)', borderTop: '2px solid #4F46E5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (error) return (
    <div style={{ padding: '32px', color: '#FCA5A5', fontSize: '14px' }}>
      ⚠️ {error} — <button onClick={() => window.location.reload()} style={{ color: '#818CF8', background: 'none', border: 'none', cursor: 'pointer' }}>Retry</button>
    </div>
  )

  const name = profile?.fullName || 'Student'
  const submitted = applications.filter(a => a.status === 'submitted').length
  const underReview = applications.filter(a => a.status === 'under_review').length
  const selected = applications.filter(a => a.status === 'selected').length
  const unread = notifications.filter(n => !n.isRead).length

  const STATUS: any = {
    submitted: { bg: 'rgba(79,70,229,0.15)', color: '#818CF8', label: 'Submitted' },
    under_review: { bg: 'rgba(245,158,11,0.15)', color: '#FCD34D', label: 'Under Review' },
    selected: { bg: 'rgba(34,197,94,0.15)', color: '#4ADE80', label: 'Selected' },
    waitlisted: { bg: 'rgba(249,115,22,0.15)', color: '#FB923C', label: 'Waitlisted' },
    rejected: { bg: 'rgba(239,68,68,0.15)', color: '#FCA5A5', label: 'Rejected' },
  }

  return (
    <div style={{ padding: '28px', color: '#FAFAFA', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', margin: '0 0 4px', letterSpacing: '-0.03em' }}>
          Good morning, {name.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', margin: 0 }}>
          {applications.length} active applications
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'Total Applied', value: applications.length, color: '#4F46E5', bg: 'rgba(79,70,229,0.1)' },
          { label: 'Under Review', value: underReview, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
          { label: 'Selected', value: selected, color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Notifications', value: unread, color: '#818CF8', bg: 'rgba(129,140,248,0.1)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'rgba(13,13,25,0.8)', border: '1px solid rgba(79,70,229,0.2)', borderRadius: '16px', padding: '22px' }}>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>{s.label}</div>
            <div style={{ fontSize: '40px', fontWeight: '800', color: s.color, letterSpacing: '-0.04em', lineHeight: 1 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Applications */}
      <div style={{ background: 'rgba(13,13,25,0.8)', border: '1px solid rgba(79,70,229,0.2)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>My Applications</h2>
          <Link href="/student/applications" style={{ color: '#818CF8', fontSize: '13px', textDecoration: 'none' }}>View all →</Link>
        </div>

        {applications.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>
            No applications yet.{' '}
            <Link href="/student/discover" style={{ color: '#818CF8', textDecoration: 'none' }}>Discover universities →</Link>
          </div>
        ) : applications.slice(0, 5).map(app => {
          const s = STATUS[app.status] || STATUS.submitted
          const date = app.appliedAt?.toDate ? app.appliedAt.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently'
          return (
            <div key={app.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr', gap: '16px', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.03)', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', flexShrink: 0 }}>
                  {(app.universityName || 'U').charAt(0)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{app.universityName || 'University'}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{app.studentEmail || ''}</div>
                </div>
              </div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{app.programName || '—'}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>{date}</div>
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: '100px', background: s.bg, color: s.color, fontSize: '11px', fontWeight: '600', whiteSpace: 'nowrap' }}>{s.label}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
