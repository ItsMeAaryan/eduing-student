// app/student/profile/page.tsx
'use client'

import React, { useState, useMemo, useRef } from 'react'
import {
  User, Check, X, AlertCircle, Upload, Camera, Pencil,
} from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/hooks/useAuth'
import { useStudentData } from '@/components/providers/StudentDataProvider'
import { calculateProfileStrength } from '@/lib/utils/profileStrength'
import SegmentedTabs from '@/components/ui/SegmentedTabs'
import { useToast } from '@/hooks/useToast'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase/config'
import { shareDetailsWithActiveApplications } from '@/lib/firebase/admission'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const TABS = ['Identity', 'Academic', 'Entrance Exams', 'Preferences']

const CARD: React.CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 14,
  boxShadow: '0 0.175px 1px rgba(0,0,0,0.015), 0 0.8px 2.9px rgba(0,0,0,0.022), 0 2px 7.8px rgba(0,0,0,0.027)',
  overflow: 'hidden',
}

function Dot({ color }: { color: string }) {
  return (
    <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: color, marginRight: 6, flexShrink: 0 }} />
  )
}

function StatCard({ label, value, sub, color = 'var(--text-primary)' }: {
  label: string; value: string | number; sub: string; color?: string
}) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14,
      padding: '18px 20px',
      boxShadow: '0 0.175px 1px rgba(0,0,0,0.015), 0 0.8px 2.9px rgba(0,0,0,0.022)',
    }}>
      <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', margin: '0 0 8px' }}>
        {label}
      </p>
      <p style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-1px', color, margin: '0 0 4px', lineHeight: 1 }}>
        {value}
      </p>
      <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>{sub}</p>
    </div>
  )
}

function SectionHeading({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
      <span style={{ color: 'var(--text-muted)', display: 'flex' }}>{icon}</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</span>
    </div>
  )
}

export default function ProfilePage() {
  const { user } = useAuth()
  const { profile, documents, uniqueApps, selectedOffers } = useStudentData()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('Identity')
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  // Edit-all mode
  const [editMode, setEditMode] = useState(false)
  const [editDraft, setEditDraft] = useState<Record<string, string>>({})


  const strength = useMemo(() => {
    if (!profile) return 0
    return calculateProfileStrength(profile, documents || {}).percentage
  }, [profile, documents])

  if (!profile) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        border: '3px solid var(--border)', borderTopColor: 'var(--accent)',
        animation: 'spin 0.8s linear infinite',
      }} />
    </div>
  )

  const docValues = Object.values(documents || {})
  const verifiedDocs = docValues.filter((d: any) => d?.status === 'verified').length

  // Same keys as the mobile app's profile forms and what universities see on an application.
  // No made-up defaults: an empty field stays empty until the student fills it.
  const v = (k: string) => (profile[k] ?? '').toString()
  const identityFields = [
    { key: 'fullName', label: 'Full Name', value: profile.fullName || (user as any)?.displayName || '' },
    { key: 'email', label: 'Email', value: (user as any)?.email || '', readonly: true },
    { key: 'phone', label: 'Phone', value: v('phone') },
    { key: 'dob', label: 'Date of Birth', value: v('dob') },
    { key: 'gender', label: 'Gender', value: v('gender') },
    { key: 'category', label: 'Category (General / EWS / OBC-NCL / SC / ST)', value: v('category') },
    { key: 'pwd', label: 'Person with Disability (Yes / No)', value: v('pwd') },
    { key: 'domicileState', label: 'Domicile State', value: v('domicileState') },
    { key: 'nationality', label: 'Nationality', value: v('nationality') },
    { key: 'address', label: 'Address', value: v('address') },
    { key: 'city', label: 'City', value: v('city') },
    { key: 'state', label: 'State', value: v('state') },
    { key: 'pincode', label: 'PIN Code', value: v('pincode') },
    { key: 'guardianName', label: 'Parent / Guardian Name', value: v('guardianName') },
    { key: 'guardianRelation', label: 'Relationship', value: v('guardianRelation') },
    { key: 'guardianPhone', label: 'Parent / Guardian Phone', value: v('guardianPhone') },
    { key: 'annualIncome', label: 'Annual Family Income', value: v('annualIncome') },
  ]

  const academicFields = [
    { key: 'tenthBoard', label: '10th Board', value: v('tenthBoard') },
    { key: 'tenthYear', label: '10th Passing Year', value: v('tenthYear') },
    { key: 'tenthScore', label: '10th Percentage', value: v('tenthScore') },
    { key: 'school', label: '12th School', value: v('school') },
    { key: 'twelfthBoard', label: '12th Board', value: v('twelfthBoard') },
    { key: 'stream', label: '12th Stream (PCM / PCB / Commerce …)', value: v('stream') },
    { key: 'twelfthYear', label: '12th Passing Year', value: v('twelfthYear') },
    { key: 'twelfthScore', label: '12th Percentage', value: v('twelfthScore') },
    { key: 'bachelorDegree', label: 'Bachelor Degree (PG applicants)', value: v('bachelorDegree') },
    { key: 'bachelorCgpa', label: 'Bachelor CGPA', value: v('bachelorCgpa') },
    { key: 'bachelorYear', label: 'Bachelor Year', value: v('bachelorYear') },
  ]

  const examFields = [
    { key: 'jeeScore', label: 'JEE Main Percentile', value: v('jeeScore') },
    { key: 'neetScore', label: 'NEET Score', value: v('neetScore') },
    { key: 'cuetScore', label: 'CUET Score', value: v('cuetScore') },
    { key: 'bitsatScore', label: 'BITSAT Score', value: v('bitsatScore') },
    { key: 'nataScore', label: 'NATA Score', value: v('nataScore') },
    { key: 'clatScore', label: 'CLAT Score', value: v('clatScore') },
    { key: 'catPercentile', label: 'CAT Percentile', value: v('catPercentile') },
    { key: 'gateScore', label: 'GATE Score', value: v('gateScore') },
  ]

  const preferenceFields = [
    { key: 'targetDegree', label: 'Target Degree', value: v('targetDegree') },
    { key: 'targetLocation', label: 'Preferred Location', value: v('targetLocation') },
    { key: 'maxBudget', label: 'Max Annual Budget', value: v('maxBudget') },
  ]

  const displayData =
    activeTab === 'Identity' ? identityFields :
      activeTab === 'Academic' ? academicFields :
        activeTab === 'Entrance Exams' ? examFields : preferenceFields

  // Enter edit mode — pre-populate draft with current values
  const handleEnterEditMode = () => {
    const allFields = [...identityFields, ...academicFields, ...examFields, ...preferenceFields]
    const draft: Record<string, string> = {}
    allFields.forEach(f => { draft[f.key] = f.value })
    setEditDraft(draft)
    setEditMode(true)
    setEditingKey(null)
  }

  const handleSaveEditMode = async () => {
    const uid = (user as any)?.uid
    if (!uid) return
    setSaving(true)
    try {
      await updateDoc(doc(db, 'users', uid), {
        ...editDraft,
        updatedAt: serverTimestamp(),
      })
      toast.success('Profile saved.')
      setEditMode(false)
      shareDetailsWithActiveApplications(uid).catch(() => {})
    } catch {
      toast.error('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Inline edit (single field, not in editMode)
  const handleStartEdit = (key: string, val: string) => {
    setEditingKey(key)
    setEditValue(val)
  }

  const handleSave = async (key: string) => {
    const uid = (user as any)?.uid
    if (!uid) return
    setSaving(true)
    try {
      await updateDoc(doc(db, 'users', uid), {
        [key]: editValue,
        updatedAt: serverTimestamp(),
      })
      toast.success('Field updated.')
      setEditingKey(null)
      shareDetailsWithActiveApplications(uid).catch(() => {})
    } catch {
      toast.error('Failed to update. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const strengthColor =
    strength >= 80 ? 'var(--green)' :
      strength >= 50 ? 'var(--accent)' : 'var(--gold)'

  const inputStyle: React.CSSProperties = {
    width: '100%', height: 36, padding: '0 10px',
    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
    borderRadius: 7, fontSize: 13, color: 'var(--text-primary)', outline: 'none',
    boxSizing: 'border-box',
  }

  const filledCount = displayData.filter(f => f.value !== '').length

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontFamily: 'Inter, system-ui, sans-serif' }}>

        {/* ── Stats row (responsive grid) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }} className="lg:grid-cols-4" id="profile-stats-grid">
          <style>{`@media (min-width: 1024px) { #profile-stats-grid { grid-template-columns: repeat(4, 1fr) !important; } }`}</style>
          <StatCard label="Profile Strength" value={`${strength}%`} sub="AI completion score" color={strengthColor} />
          <StatCard label="Docs Verified" value={verifiedDocs} sub={`of ${docValues.length} uploaded`} color="var(--green)" />
          <StatCard label="Applications" value={uniqueApps?.length || 0} sub="Submitted" />
          <StatCard label="Offers" value={selectedOffers?.length || 0} sub="Received" color="var(--accent)" />
        </div>

        {/* ── Hero card ── */}
        <div style={{ ...CARD, padding: '20px 24px', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 20 }}>
          {/* Avatar — initials (EDUING doesn't store photos) */}
          <div aria-hidden style={{
            width: 72, height: 72, borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            color: '#fff', fontSize: 24, fontWeight: 700,
          }}>
            {(profile.fullName || (user as any)?.displayName || 'S').split(/\s+/).map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
          </div>

          {/* Name + email + edit button */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.25px' }}>
                {profile.fullName || (user as any)?.displayName || 'Student Profile'}
              </h2>
              <button
                id="edit-profile-btn"
                onClick={editMode ? handleSaveEditMode : handleEnterEditMode}
                disabled={saving}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  fontSize: 12, fontWeight: 600,
                  padding: '4px 10px', borderRadius: 7,
                  background: editMode ? 'var(--green)' : 'var(--accent-bg)',
                  border: `1px solid ${editMode ? 'var(--green)' : 'var(--accent-border)'}`,
                  color: editMode ? '#fff' : 'var(--accent)',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {editMode ? <Check size={12} strokeWidth={2.5} /> : <Pencil size={12} strokeWidth={2} />}
                {editMode ? (saving ? 'Saving…' : 'Save') : 'Edit Profile'}
              </button>
              {editMode && (
                <button
                  onClick={() => setEditMode(false)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    fontSize: 12, fontWeight: 500, padding: '4px 10px', borderRadius: 7,
                    background: 'var(--bg)', border: '1px solid var(--border)',
                    color: 'var(--text-muted)', cursor: 'pointer',
                  }}
                >
                  <X size={12} strokeWidth={2} /> Cancel
                </button>
              )}
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 10px' }}>
              {(user as any)?.email}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999,
                background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', color: 'var(--accent)',
              }}>
                <Dot color="var(--accent)" />AI Engine Active
              </span>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999,
                background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-secondary)',
              }}>
                {profile.entranceExam || 'B.Tech Aspiring'}
              </span>
            </div>
          </div>

          {/* Profile bar */}
          <div style={{ flexShrink: 0, textAlign: 'right' }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>
              Completion
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 100, height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${strength}%`, background: strengthColor, borderRadius: 3, transition: 'width 0.8s ease' }} />
              </div>
              <span style={{ fontSize: 15, fontWeight: 700, color: strengthColor, letterSpacing: '-0.5px' }}>
                {strength}%
              </span>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <SegmentedTabs tabs={TABS} active={activeTab} onChange={(t) => { setActiveTab(t); if (!editMode) setEditingKey(null) }} />

        {/* ── Data grid ── */}
        <div style={CARD}>
          <div style={{
            padding: '12px 20px', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
              {activeTab} Details
            </span>
            <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
              {filledCount}/{displayData.length} filled
            </span>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1px', background: 'var(--border)',
          }}>
            {displayData.map((field, i) => {
              const isEmpty = !field.value
              const isEditing = editingKey === field.key

              return (
                <div
                  key={i}
                  style={{ background: 'var(--bg-card)', padding: '14px 20px', transition: 'background 0.1s' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-card-hover)' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-card)' }}
                >
                  <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', margin: '0 0 6px' }}>
                    {field.label}
                  </p>

                  {/* Edit-all mode */}
                  {editMode && !(field as any).readonly ? (
                    <input
                      value={editDraft[field.key] ?? field.value}
                      onChange={e => setEditDraft(d => ({ ...d, [field.key]: e.target.value }))}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      style={{
                        ...inputStyle,
                        borderColor: 'var(--accent)',
                        boxShadow: '0 0 0 2px var(--accent-bg)',
                      }}
                    />
                  ) : isEditing ? (
                    /* Inline single-field edit */
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleSave(field.key); if (e.key === 'Escape') setEditingKey(null) }}
                        style={{
                          flex: 1, height: 30, padding: '0 8px',
                          background: 'var(--bg-elevated)', border: '1px solid var(--accent)',
                          borderRadius: 10, fontSize: 13, color: 'var(--text-primary)', outline: 'none',
                          boxShadow: '0 0 0 2px var(--accent-bg)',
                        }}
                      />
                      <button
                        onClick={() => handleSave(field.key)}
                        disabled={saving}
                        aria-label="Save field"
                        style={{ width: 28, height: 28, borderRadius: 10, background: 'var(--green)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                      >
                        <Check size={13} style={{ color: '#fff' }} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={() => setEditingKey(null)}
                        aria-label="Cancel editing"
                        style={{ width: 28, height: 28, borderRadius: 10, background: 'var(--bg)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                      >
                        <X size={13} style={{ color: 'var(--text-muted)' }} strokeWidth={2} />
                      </button>
                    </div>
                  ) : (
                    /* Display mode */
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 28 }}>
                      {isEmpty && !(field as any).readonly ? (
                        <button
                          onClick={() => handleStartEdit(field.key, '')}
                          style={{
                            fontSize: 12, fontWeight: 500,
                            color: 'var(--accent)', background: 'none', border: 'none',
                            cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 3, opacity: 0.7,
                          }}
                          title={`Add ${field.label}`}
                        >
                          + Add
                        </button>
                      ) : (
                        <span style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: 'var(--text-primary)',
                        }}>
                          {field.value}
                        </span>
                      )}
                      {!(field as any).readonly && !isEmpty && (
                        <button
                          onClick={() => handleStartEdit(field.key, field.value)}
                          style={{
                            fontSize: 11, fontWeight: 500, color: 'var(--accent)',
                            background: 'none', border: 'none', cursor: 'pointer',
                            opacity: 0, transition: 'opacity 0.15s',
                          }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0' }}
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Missing fields alert ── */}
        {strength < 80 && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            padding: '14px 18px',
            background: 'rgba(217,119,6,0.06)',
            border: '1px solid rgba(217,119,6,0.2)',
            borderRadius: 14, fontSize: 13, color: 'var(--gold)',
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} strokeWidth={1.8} />
            <div>
              <span style={{ fontWeight: 600 }}>Profile {strength}% complete.</span>
              {' '}Fill in the remaining fields to unlock full university recommendations and AI insights.
            </div>
          </div>
        )}

      </div>
    </ProtectedRoute>
  )
}


