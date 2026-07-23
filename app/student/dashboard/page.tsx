'use client'
import React, { useState } from 'react'
import {
  MoreHorizontal, Building2, CalendarDays
} from 'lucide-react'
import { useStudentData } from '@/components/providers/StudentDataProvider'
import SegmentedTabs from '@/components/ui/SegmentedTabs'
import { DotSparkline, KPICard } from '@/components/ui/KPICard'

/* ─────────────────────────────────────────────────────────
   ADMISSION PROGRESS CHART — uses real app counts
───────────────────────────────────────────────────────── */
const AdmissionProgressChart = React.memo(function AdmissionProgressChart({ apps, docs, offers }: { apps: number; docs: number; offers: number }) {
  const total = Math.max(apps + docs + offers, 1)
  const segments = [
    { label: 'Applications', value: apps,   color: '#111827' },
    { label: 'Documents',    value: docs,   color: '#6B7280' },
    { label: 'Offers',       value: offers, color: '#4F6BFF' },
  ]

  return (
    <div className="bg-white border border-[#EAECF0] rounded-[12px] p-[24px] col-span-5 lg:col-span-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-[24px]">
        <span className="text-[14px] font-semibold text-[#111827]">Admission Progress</span>
        <div className="flex items-center gap-[4px] text-[12px] font-medium text-[#374151]">
          <CalendarDays size={12} strokeWidth={1.8} className="text-[#6B7280]" />
          This cycle
        </div>
      </div>

      {/* Stacked bar */}
      <div className="flex overflow-hidden rounded-full mb-[20px]" style={{ height: 10 }}>
        {segments.map(s => (
          <div
            key={s.label}
            className="h-full transition-all duration-700"
            style={{ width: `${(s.value / total) * 100}%`, backgroundColor: s.color }}
          />
        ))}
        {/* Remainder */}
        <div className="h-full flex-1 bg-[#F3F4F6]" />
      </div>

      {/* Stat rows */}
      <div className="flex flex-col divide-y divide-[#F3F4F6]">
        {segments.map(s => (
          <div key={s.label} className="flex items-center justify-between py-[12px]">
            <div className="flex items-center gap-[10px]">
              <div className="w-[3px] h-[14px] rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-[13px] text-[#374151]">{s.label}</span>
            </div>
            <div className="flex items-center gap-[10px]">
              <span className="text-[13px] font-semibold text-[#111827]">{s.value}</span>
              <span
                className="text-[11px] font-semibold px-[8px] py-[2px] rounded-full"
                style={{ color: s.color, backgroundColor: s.color + '18' }}
              >{Math.round((s.value / total) * 100)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
})

/* ─────────────────────────────────────────────────────────
   ACTIVITY OVERVIEW (right panel)
───────────────────────────────────────────────────────── */
function ActivityOverview({ apps, offers, ddls, docs }: { apps: number; offers: number; ddls: number; docs: number }) {
  const total = apps + offers + ddls + docs || 1
  const rows = [
    { label: 'Applications', n: apps,   pct: Math.round(apps/total*100)   || 55, color: '#4F6BFF' },
    { label: 'Offers',       n: offers, pct: Math.round(offers/total*100) || 20, color: '#111827' },
    { label: 'Deadlines',    n: ddls,   pct: Math.round(ddls/total*100)   || 15, color: '#D1D5DB' },
    { label: 'Documents',    n: docs,   pct: Math.round(docs/total*100)   || 10, color: '#9CA3AF' },
  ]
  const grand = apps + offers + ddls + docs

  return (
    <div className="bg-white border border-[#EAECF0] rounded-[12px] p-[24px] col-span-5 lg:col-span-2 flex flex-col">
      <div className="flex items-center justify-between mb-[20px]">
        <span className="text-[14px] font-semibold text-[#111827]">Activity Overview</span>
        <span className="text-[12px] text-[#9CA3AF]">This month</span>
      </div>

      <div className="flex items-start gap-[8px] mb-[16px]">
        <span className="text-[32px] font-bold text-[#111827] leading-none tracking-[-0.02em]">{grand}</span>
        <span className="text-[12px] text-[#9CA3AF] leading-[1.4] mt-[4px]">Total<br/>activity</span>
      </div>

      <div className="flex overflow-hidden mb-[20px]" style={{ height: 8, borderRadius: 99 }}>
        {rows.map(r => (
          <div key={r.label} className="h-full" style={{ width: `${r.pct}%`, backgroundColor: r.color }} />
        ))}
      </div>

      <div className="flex-1 flex flex-col divide-y divide-[#F3F4F6]">
        {rows.map(r => (
          <div key={r.label} className="flex items-center justify-between py-[12px]">
            <div className="flex items-center gap-[10px]">
              <div className="w-[3px] h-[14px] rounded-full shrink-0" style={{ backgroundColor: r.color }} />
              <span className="text-[13px] text-[#374151]">{r.label}</span>
            </div>
            <div className="flex items-center gap-[10px]">
              <span className="text-[13px] font-semibold text-[#111827]">{r.n.toLocaleString()}</span>
              <span
                className="text-[11px] font-semibold px-[8px] py-[2px] rounded-full"
                style={{ color: r.color, backgroundColor: r.color + '18' }}
              >{r.pct}%</span>
            </div>
          </div>
        ))}
      </div>

      <a href="/student/applications" className="w-full h-[34px] mt-[16px] rounded-[8px] border border-[#EAECF0] text-[13px] font-medium text-[#374151] bg-white hover:bg-[#F9FAFB] transition-colors flex items-center justify-center">
        View Details
      </a>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   APPLICATIONS TABLE — uses real deadlines
───────────────────────────────────────────────────────── */
function DataTable({ apps }: { apps: any[] }) {
  return (
    <div className="bg-white border border-[#EAECF0] rounded-[12px] overflow-hidden">
      <div className="flex items-center justify-between px-[24px] py-[14px] border-b border-[#EAECF0]">
        <div className="flex items-center gap-[8px]">
          <span className="text-[14px] font-semibold text-[#111827]">Active Applications</span>
          {apps.length > 0 && <span className="text-[11px] text-[#9CA3AF] font-medium px-[7px] py-[1px] rounded-full bg-[#F3F4F6]">{apps.length}</span>}
        </div>
        <a href="/student/applications" className="text-[12px] font-semibold text-[#4F6BFF] hover:underline">View all →</a>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#F9FAFB] border-b border-[#EAECF0]">
              <th className="px-[24px] py-[13px] w-[44px]">
                <input type="checkbox" className="w-[14px] h-[14px] rounded-[3px] border-[#D1D5DB]" aria-label="Select all" />
              </th>
              {['University','Program','Progress','Deadline','Stage'].map(h => (
                <th key={h} className="px-[16px] py-[11px] text-[10px] font-bold text-[#6B7280] uppercase tracking-[0.06em] whitespace-nowrap">
                  {h}
                </th>
              ))}
              <th className="w-[36px]" />
            </tr>
          </thead>

          <tbody>
            {apps.length > 0
              ? apps.slice(0, 5).map((app: any, i: number) => (
                <tr key={i} className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors group">

                  <td className="px-[16px] py-[13px]">
                    <input type="checkbox" className="w-[14px] h-[14px] rounded-[3px]" aria-label={`Select ${app.universityName}`} />
                  </td>

                  {/* University */}
                  <td className="px-[16px] py-[13px]">
                    <div className="flex items-center gap-[10px]">
                      <div className="w-[28px] h-[28px] rounded-[7px] bg-[#EEF2FF] flex items-center justify-center shrink-0">
                        <Building2 size={12} className="text-[#4F6BFF]" strokeWidth={2} />
                      </div>
                      <span className="text-[13px] font-medium text-[#111827] truncate max-w-[140px]">
                        {app.universityName || 'University'}
                      </span>
                    </div>
                  </td>

                  {/* Program */}
                  <td className="px-[16px] py-[13px]">
                    <span className="text-[12px] text-[#6B7280] truncate max-w-[140px] block">
                      {app.programName || app.program || 'Program'}
                    </span>
                  </td>

                  {/* Progress */}
                  <td className="px-[16px] py-[13px]">
                    <div className="flex items-center gap-[6px]">
                      <div className="w-[40px] h-[3px] bg-[#F3F4F6] rounded-full overflow-hidden">
                        <div className="h-full bg-[#4F6BFF] rounded-full" style={{ width: `${app.progress || 50}%` }} />
                      </div>
                      <span className="text-[12px] font-semibold text-[#374151]">{app.progress || 50}%</span>
                    </div>
                  </td>

                  {/* Deadline — use real data or dash */}
                  <td className="px-[16px] py-[13px]">
                    <span className="text-[12px] text-[#6B7280]">
                      {app.deadline
                        ? new Date(app.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—'}
                    </span>
                  </td>

                  {/* Stage */}
                  <td className="px-[16px] py-[13px]">
                    <span className="text-[11px] font-semibold px-[8px] py-[2px] rounded-full bg-[#EEF2FF] text-[#4F6BFF]">
                      {app.status || 'Active'}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="px-[12px] py-[13px] text-right">
                    <button
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-[#D1D5DB] hover:text-[#6B7280]"
                      aria-label={`More options for ${app.universityName}`}
                    >
                      <MoreHorizontal size={14} strokeWidth={1.5} />
                    </button>
                  </td>
                </tr>
              ))
              : (
                <tr>
                  <td colSpan={7} className="py-[48px] text-center">
                    <div className="flex flex-col items-center gap-[10px]">
                      <div className="w-[48px] h-[48px] rounded-[14px] bg-[#EEF2FF] flex items-center justify-center">
                        <Building2 size={22} className="text-[#4F6BFF]" strokeWidth={1.8} />
                      </div>
                      <p className="text-[14px] font-semibold text-[#374151]">No applications yet</p>
                      <p className="text-[12px] text-[#9CA3AF]">Start by discovering universities that match your profile</p>
                      <a href="/student/universities" className="mt-[4px] px-[16px] h-[34px] rounded-[8px] bg-[#4F6BFF] text-white text-[12px] font-semibold hover:bg-[#3D56E0] transition-colors flex items-center">Discover Universities</a>
                    </div>
                  </td>
                </tr>
              )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   PAGE ROOT
───────────────────────────────────────────────────────── */
export default function StudentDashboard() {
  const { loading, error, uniqueApps, selectedOffers, deadlines, documents, profile } = useStudentData()
  const [tab, setTab] = useState('Overview')
  const TABS = ['Overview', 'Applications', 'Deadlines', 'Documents']

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-[36px] h-[36px] border-[3px] border-[#EAECF0] border-t-[#4F6BFF] rounded-full animate-spin" />
    </div>
  )
  if (error) return <div className="p-[24px] text-[13px] text-[#EF4444] bg-[#FEF2F2] rounded-[12px] border border-[#FECACA]">Error loading dashboard: {error}</div>

  const apps   = uniqueApps?.length     || 0
  const offers = selectedOffers?.length || 0
  const ddls   = deadlines?.length      || 0
  const docs   = documents?.length      || 0

  // Calculate real profile strength
  let profileStrength = 0
  if (profile) {
    const fields = [
      profile.fullName, profile.phone, profile.dob, profile.address,
      profile.tenthScore, profile.twelfthScore, profile.nationality,
    ]
    const filled = fields.filter(Boolean).length
    profileStrength = Math.round((filled / fields.length) * 100)
  }

  return (
    <div className="flex flex-col gap-[24px]">

      {/* ── SUB-NAV ─────────────────────────── */}
      <div className="flex items-center justify-between gap-[12px] flex-wrap">
        <SegmentedTabs tabs={TABS} active={tab} onChange={setTab} />
        <div className="flex items-center gap-[10px]">
          <a
            href="/student/universities"
            className="flex items-center gap-[6px] px-[16px] h-[34px] rounded-[8px] bg-[#4F6BFF] text-white text-[13px] font-semibold hover:bg-[#3D56E0] transition-colors"
          >
            + New Application
          </a>
        </div>
      </div>

      {/* ── THREE KPI CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-[20px]">
        <KPICard
          label="Applications"
          value={apps}
          pct={apps > 0 ? `${apps} active` : 'Get started'}
          pctUp={apps > 0}
          dotColor="#4F6BFF"
          sub="in pipeline"
        />
        <KPICard
          label="Offers Received"
          value={offers}
          pct={offers > 0 ? `+${offers} new` : 'None yet'}
          pctUp={offers > 0}
          dotColor="#EF4444"
          sub="this cycle"
        />
        <KPICard
          label="Profile Strength"
          value={`${profileStrength}%`}
          pct={profileStrength >= 80 ? 'Strong' : profileStrength >= 50 ? 'Improving' : 'Needs work'}
          pctUp={profileStrength >= 50}
          dotColor="#10B981"
          sub="completion score"
        />
      </div>

      {/* ── CHART (3/5) + OVERVIEW (2/5) ── */}
      <div className="grid grid-cols-5 gap-[20px]">
        <AdmissionProgressChart apps={apps} docs={docs} offers={offers} />
        <ActivityOverview apps={apps} offers={offers} ddls={ddls} docs={docs} />
      </div>

      {/* ── DATA TABLE ── */}
      <DataTable apps={uniqueApps || []} />

    </div>
  )
}
