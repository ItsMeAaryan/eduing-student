'use client'
import React, { useState } from 'react'
import {
  MoreHorizontal, Search, SlidersHorizontal, Download,
  TrendingUp, TrendingDown, ChevronDown, User, Building2,
  CalendarDays, Filter
} from 'lucide-react'
import { useStudentData } from '@/components/providers/StudentDataProvider'
import SegmentedTabs from '@/components/ui/SegmentedTabs'

/* ─────────────────────────────────────────────────────────
   DOT SPARKLINE — 4×4 grid, varying opacity, Aivox style
───────────────────────────────────────────────────────── */
function DotSparkline({ color }: { color: string }) {
  const cols = [
    [0.15, 0.35, 0.65, 1.0 ],
    [0.25, 0.55, 0.85, 0.45],
    [0.10, 0.30, 0.50, 0.80],
    [0.20, 0.45, 0.75, 1.0 ],
  ]
  return (
    <div className="flex gap-[3px]">
      {cols.map((col, ci) => (
        <div key={ci} className="flex flex-col gap-[3px]">
          {col.map((op, ri) => (
            <div
              key={ri}
              className="w-[4px] h-[4px] rounded-full"
              style={{ backgroundColor: color, opacity: op }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   KPI CARD — Aivox exact:
   p-[24px], min-h-[130px], label 14px/normal, number 30px/bold
   trend row at bottom, dots aligned bottom-right
───────────────────────────────────────────────────────── */
function KPICard({
  label, value, pct, pctUp, dotColor, sub,
}: {
  label: string; value: string | number;
  pct: string; pctUp: boolean; dotColor: string; sub?: string;
}) {
  return (
    <div className="bg-white border border-[#EAECF0] rounded-[12px] p-[24px] flex flex-col justify-between min-h-[130px]">
      {/* Row 1: label + menu */}
      <div className="flex items-start justify-between">
        <span className="text-[14px] font-normal text-[#6B7280] leading-none">{label}</span>
        <button className="text-[#D1D5DB] hover:text-[#9CA3AF] transition-colors -mt-[1px]">
          <MoreHorizontal size={15} strokeWidth={1.5} />
        </button>
      </div>

      {/* Row 2: big number + dots */}
      <div className="flex items-end justify-between mt-[12px]">
        <span className="text-[30px] font-bold text-[#111827] leading-none tracking-[-0.02em]">{value}</span>
        <DotSparkline color={dotColor} />
      </div>

      {/* Row 3: trend */}
      <div className="flex items-center gap-[5px] mt-[14px]">
        {pctUp
          ? <TrendingUp  size={14} strokeWidth={2} className="text-[#10B981] shrink-0" />
          : <TrendingDown size={14} strokeWidth={2} className="text-[#EF4444] shrink-0" />}
        <span className={`text-[12px] font-semibold ${pctUp ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>{pct}</span>
        <span className="text-[12px] text-[#9CA3AF]">{sub ?? 'vs last month'}</span>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   BAR CHART — Aivox Revenue Forecast
   Floating outline bars (inactive) + stacked solid bars (active May)
   Card padding p-[24px], chart height 200, legend gap-[32px]
───────────────────────────────────────────────────────── */
function BarChart() {
  const chartData = [
    { month: 'Jan',   bounds: [33, 60] },
    { month: 'Feb',   bounds: [26, 53] },
    { month: 'March', bounds: [6,  76] },
    { month: 'April', bounds: [10, 70] },
    { month: 'May',   bounds: [0,  80], isHovered: true, segments: [[0,33,'#111827'],[36,56,'#6B7280'],[60,80,'#4F6BFF']] },
    { month: 'Jun',   bounds: [33, 60] },
    { month: 'July',  bounds: [10, 56] },
    { month: 'Aug',   bounds: [13, 63] },
    { month: 'Sep',   bounds: [3,  73] },
  ]
  const yLabels = ['300','250','200','150','100','50','0']

  return (
    <div className="bg-white border border-[#EAECF0] rounded-[12px] p-[24px] col-span-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-[24px]">
        <span className="text-[15px] font-semibold text-[#111827]">Admission Progress</span>
        <div className="flex items-center gap-[8px]">
          <button className="flex items-center gap-[5px] px-[10px] h-[28px] rounded-[6px] border border-[#EAECF0] text-[12px] font-medium text-[#374151] hover:bg-[#F9FAFB] transition-colors">
            <CalendarDays size={12} strokeWidth={1.8} className="text-[#6B7280]" />
            Monthly
            <ChevronDown size={11} strokeWidth={2} />
          </button>
          <button className="text-[#D1D5DB] hover:text-[#9CA3AF]">
            <MoreHorizontal size={15} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Chart body */}
      <div className="flex" style={{ height: 200 }}>
        {/* Y-axis */}
        <div className="flex flex-col justify-between pr-[10px] pb-[22px] w-[36px] shrink-0">
          {yLabels.map(l => (
            <span key={l} className="text-[11px] text-[#9CA3AF] text-right leading-none block">{l}</span>
          ))}
        </div>

        {/* Plot area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 relative border-l border-b border-[#EAECF0]">
            {/* Grid lines */}
            {[25, 50, 75].map(p => (
              <div
                key={p}
                className="absolute left-0 right-0 border-t border-dashed border-[#F3F4F6]"
                style={{ bottom: `${p}%` }}
              />
            ))}

            <div className="absolute inset-0 flex justify-around px-[8px]">
              {chartData.map((d, i) => (
                <div key={i} className="h-full w-[36px] relative group">
                  {d.isHovered ? (
                    <>
                      {/* Pinned tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-[10px] z-20 pointer-events-none">
                        <div className="bg-white border border-[#EAECF0] rounded-[10px] shadow-[0_4px_12px_rgba(0,0,0,0.08)] p-[12px] whitespace-nowrap text-left min-w-[148px]">
                          <div className="text-[12px] font-semibold text-[#111827] mb-[10px]">
                            {d.month}, 2026
                          </div>
                          {[
                            { label:'Documents',    color:'#111827', val:'+8.5%',  pos:true  },
                            { label:'Applications', color:'#6B7280', val:'+6.0%',  pos:true  },
                            { label:'Interviews',   color:'#4F6BFF', val:'12.0%',  pos:false },
                          ].map(row => (
                            <div key={row.label} className="flex items-center gap-[8px] text-[11px] text-[#374151] mb-[4px] last:mb-0">
                              <span className="w-[10px] h-[10px] rounded-[2px] inline-block shrink-0" style={{ backgroundColor: row.color }} />
                              <span className="flex-1 font-normal">{row.label}</span>
                              <span className={`font-semibold ml-[8px] ${row.pos ? 'text-[#10B981]' : 'text-[#4F6BFF]'}`}>{row.val}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Stacked solid bars */}
                      {d.segments?.map((seg, si) => (
                        <div
                          key={si}
                          className="absolute w-full rounded-[5px]"
                          style={{
                            bottom:  `${seg[0]}%`,
                            height:  `${(seg[1] as number) - (seg[0] as number)}%`,
                            backgroundColor: seg[2] as string,
                          }}
                        />
                      ))}
                    </>
                  ) : (
                    /* Inactive: outline rectangle, light blue fill */
                    <div
                      className="absolute w-full border border-[#4F6BFF] bg-[#EEF2FF] rounded-[5px]"
                      style={{
                        bottom: `${d.bounds[0]}%`,
                        height: `${d.bounds[1] - d.bounds[0]}%`,
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* X-axis labels */}
          <div className="flex justify-around px-[8px] mt-[8px]">
            {chartData.map(d => (
              <div key={d.month} className="w-[36px] text-center text-[11px] text-[#9CA3AF]">{d.month}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-[32px] mt-[18px] pl-[46px]">
        {[
          { label: 'Documents',    color: '#111827' },
          { label: 'Applications', color: '#6B7280' },
          { label: 'Interviews',   color: '#4F6BFF' },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-[6px]">
            <div className="w-[9px] h-[9px] rounded-full shrink-0" style={{ backgroundColor: color }} />
            <span className="text-[12px] font-normal text-[#6B7280]">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   SOURCE PANEL — Aivox right panel
   p-[24px], 8px progress bar, row py-[12px], badge pill
───────────────────────────────────────────────────────── */
function SourcePanel({ apps, offers, ddls, docs }: { apps:number; offers:number; ddls:number; docs:number }) {
  const total = apps + offers + ddls + docs || 1
  const rows = [
    { label: 'Applications', n: apps,   pct: Math.round(apps/total*100)   || 55, color: '#4F6BFF' },
    { label: 'Offers',       n: offers, pct: Math.round(offers/total*100) || 20, color: '#111827' },
    { label: 'Deadlines',    n: ddls,   pct: Math.round(ddls/total*100)   || 15, color: '#D1D5DB' },
    { label: 'Documents',    n: docs,   pct: Math.round(docs/total*100)   || 10, color: '#9CA3AF' },
  ]
  const grand = apps + offers + ddls + docs

  return (
    <div className="bg-white border border-[#EAECF0] rounded-[12px] p-[24px] col-span-2 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-[20px]">
        <span className="text-[15px] font-semibold text-[#111827]">Source</span>
        <div className="flex items-center gap-[8px]">
          <button className="flex items-center gap-[4px] px-[10px] h-[28px] rounded-[6px] border border-[#EAECF0] text-[12px] font-medium text-[#374151] hover:bg-[#F9FAFB] transition-colors">
            Activity<ChevronDown size={11} strokeWidth={2} />
          </button>
          <button className="text-[#D1D5DB] hover:text-[#9CA3AF]">
            <MoreHorizontal size={15} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Big number */}
      <div className="flex items-start gap-[8px] mb-[16px]">
        <span className="text-[32px] font-bold text-[#111827] leading-none tracking-[-0.02em]">{grand}</span>
        <span className="text-[12px] text-[#9CA3AF] leading-[1.4] mt-[4px]">Total<br/>activity</span>
      </div>

      {/* Segmented bar — h=8px, flat, no gap */}
      <div className="flex overflow-hidden mb-[20px]" style={{ height: 8, borderRadius: 99 }}>
        {rows.map(r => (
          <div key={r.label} className="h-full" style={{ width: `${r.pct}%`, backgroundColor: r.color }} />
        ))}
      </div>

      {/* Source rows */}
      <div className="flex-1 flex flex-col divide-y divide-[#F3F4F6]">
        {rows.map(r => (
          <div key={r.label} className="flex items-center justify-between py-[12px]">
            <div className="flex items-center gap-[10px]">
              <div className="w-[3px] h-[14px] rounded-full shrink-0" style={{ backgroundColor: r.color }} />
              <span className="text-[13.5px] text-[#374151]">{r.label}</span>
            </div>
            <div className="flex items-center gap-[10px]">
              <span className="text-[13.5px] font-medium text-[#111827]">{r.n.toLocaleString()}</span>
              <span
                className="text-[12px] font-semibold px-[8px] py-[2px] rounded-full"
                style={{ color: r.color, backgroundColor: r.color + '18' }}
              >{r.pct}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* View Details */}
      <button className="w-full h-[34px] mt-[16px] rounded-[8px] border border-[#EAECF0] text-[13px] font-medium text-[#374151] bg-white hover:bg-[#F9FAFB] transition-colors">
        View Details
      </button>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   DATA TABLE — Aivox "Table Data Sales" layout
   Toolbar px-[24px] py-[18px], rows py-[16px]
───────────────────────────────────────────────────────── */
function DataTable({ apps }: { apps: any[] }) {
  return (
    <div className="bg-white border border-[#EAECF0] rounded-[12px] overflow-hidden">
      {/* Table toolbar */}
      <div className="flex items-center justify-between px-[24px] py-[18px] border-b border-[#EAECF0]">
        <span className="text-[15px] font-semibold text-[#111827]">Active Applications</span>
        <div className="flex items-center gap-[10px]">
          <div className="relative">
            <Search size={14} className="absolute left-[11px] top-1/2 -translate-y-1/2 text-[#9CA3AF]" strokeWidth={1.8} />
            <input
              type="text"
              placeholder="Search data"
              className="w-[220px] h-[34px] pl-[32px] pr-[12px] bg-[#F9FAFB] border border-[#EAECF0] rounded-[8px] text-[13px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#4F6BFF] transition-colors"
            />
          </div>
          <button className="flex items-center gap-[5px] px-[12px] h-[34px] rounded-[8px] border border-[#EAECF0] text-[12px] font-medium text-[#374151] bg-white hover:bg-[#F9FAFB] transition-colors">
            <SlidersHorizontal size={13} strokeWidth={1.8} />
            Sort by
            <ChevronDown size={11} strokeWidth={2} />
          </button>
          <button className="flex items-center gap-[5px] px-[12px] h-[34px] rounded-[8px] border border-[#EAECF0] text-[12px] font-medium text-[#374151] bg-white hover:bg-[#F9FAFB] transition-colors">
            <Filter size={13} strokeWidth={1.8} />
            Filter
          </button>
          <button className="text-[#D1D5DB] hover:text-[#9CA3AF]">
            <MoreHorizontal size={15} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <table className="w-full text-left">
        {/* Column headers */}
        <thead>
          <tr className="bg-[#F9FAFB] border-b border-[#EAECF0]">
            <th className="px-[24px] py-[13px] w-[44px]">
              <input type="checkbox" className="w-[14px] h-[14px] rounded-[3px] border-[#D1D5DB]" />
            </th>
            {['University','Program','Score','Deadline','Owner','Stage'].map(h => (
              <th key={h} className="px-[16px] py-[13px] text-[11px] font-semibold text-[#6B7280] uppercase tracking-[0.06em] whitespace-nowrap">
                {h}
              </th>
            ))}
            <th className="w-[44px]" />
          </tr>
        </thead>

        <tbody>
          {apps.length > 0
            ? apps.slice(0, 5).map((app: any, i: number) => (
              <tr key={i} className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors group">
                <td className="px-[24px] py-[16px]">
                  <input type="checkbox" className="w-[14px] h-[14px] rounded-[3px] border-[#D1D5DB]" />
                </td>

                {/* University */}
                <td className="px-[16px] py-[16px]">
                  <div className="flex items-center gap-[12px]">
                    <div className="w-[32px] h-[32px] rounded-full bg-[#EEF2FF] flex items-center justify-center shrink-0 border border-[#E5E7EB]">
                      <Building2 size={14} className="text-[#4F6BFF]" strokeWidth={1.8} />
                    </div>
                    <span className="text-[13.5px] font-medium text-[#111827] truncate max-w-[150px]">
                      {app.universityName || 'University'}
                    </span>
                  </div>
                </td>

                {/* Program */}
                <td className="px-[16px] py-[16px]">
                  <span className="text-[13.5px] text-[#6B7280] truncate max-w-[150px] block">
                    {app.programName || 'Program'}
                  </span>
                </td>

                {/* Score */}
                <td className="px-[16px] py-[16px]">
                  <span className="text-[13.5px] font-medium text-[#111827]">
                    {app.progress ? `${app.progress}%` : '—'}
                  </span>
                </td>

                {/* Deadline */}
                <td className="px-[16px] py-[16px]">
                  <span className="text-[13.5px] text-[#6B7280]">Nov 15, 2026</span>
                </td>

                {/* Owner */}
                <td className="px-[16px] py-[16px]">
                  <div className="flex items-center gap-[8px]">
                    <div className="w-[26px] h-[26px] rounded-full bg-[#F3F4F6] flex items-center justify-center shrink-0">
                      <User size={12} strokeWidth={1.8} className="text-[#6B7280]" />
                    </div>
                    <span className="text-[13px] text-[#374151]">You</span>
                  </div>
                </td>

                {/* Stage badge */}
                <td className="px-[16px] py-[16px]">
                  <div className="flex items-center gap-[6px]">
                    <span className="text-[#9CA3AF] text-[14px] leading-none">•</span>
                    <span className="text-[13px] font-medium text-[#374151]">
                      {app.status || 'Active'}
                    </span>
                  </div>
                </td>

                {/* Row action */}
                <td className="px-[16px] py-[16px] text-right">
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity text-[#D1D5DB] hover:text-[#6B7280]">
                    <MoreHorizontal size={15} strokeWidth={1.5} />
                  </button>
                </td>
              </tr>
            ))
            : (
              <tr>
                <td colSpan={8} className="py-[48px] text-center text-[13.5px] text-[#9CA3AF]">
                  No active applications yet.
                </td>
              </tr>
            )}
        </tbody>
      </table>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   PAGE ROOT
───────────────────────────────────────────────────────── */
export default function StudentDashboard() {
  const { loading, error, uniqueApps, selectedOffers, deadlines, documents } = useStudentData()
  const [tab, setTab] = useState('Overview')
  const TABS = ['Overview', 'Sales', 'Order', 'Report']

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-[36px] h-[36px] border-[3px] border-[#EAECF0] border-t-[#4F6BFF] rounded-full animate-spin" />
    </div>
  )
  if (error) return <div className="p-[24px] text-[13.5px] text-[#EF4444]">Error: {error}</div>

  const apps   = uniqueApps?.length     || 0
  const offers = selectedOffers?.length || 0
  const ddls   = deadlines?.length      || 0
  const docs   = documents?.length      || 0

  return (
    <div className="font-sans flex flex-col gap-[24px]">

      {/* ── SUB-NAV: shared SegmentedTabs ────────────────── */}
      <div className="flex items-center justify-between">
        <SegmentedTabs tabs={TABS} active={tab} onChange={setTab} />
        <div className="flex items-center gap-[10px]">
          <button className="flex items-center gap-[6px] px-[14px] h-[34px] rounded-[8px] border border-[#EAECF0] text-[13px] font-medium text-[#374151] bg-white hover:bg-[#F9FAFB] transition-colors">
            <SlidersHorizontal size={13} strokeWidth={1.8} />
            Filter
          </button>
          <button className="flex items-center gap-[6px] px-[16px] h-[34px] rounded-[8px] bg-[#4F6BFF] text-white text-[13px] font-semibold hover:bg-[#3D56E0] transition-colors">
            <Download size={13} strokeWidth={2} />
            Export
          </button>
        </div>
      </div>

      {/* ── THREE KPI CARDS ── */}
      <div className="grid grid-cols-3 gap-[24px]">
        <KPICard
          label="Applications"
          value={apps}
          pct="+10.2%"
          pctUp={true}
          dotColor="#4F6BFF"
          sub="vs last month"
        />
        <KPICard
          label="Offers Received"
          value={offers}
          pct={offers > 0 ? `+${offers} new` : '5.75%'}
          pctUp={offers > 0}
          dotColor="#EF4444"
          sub="vs last month"
        />
        <KPICard
          label="Profile Strength"
          value="85%"
          pct="+8.55%"
          pctUp={true}
          dotColor="#10B981"
          sub="vs last audit"
        />
      </div>

      {/* ── CHART (3/5) + SOURCE PANEL (2/5) ── */}
      <div className="grid grid-cols-5 gap-[24px]">
        <BarChart />
        <SourcePanel apps={apps} offers={offers} ddls={ddls} docs={docs} />
      </div>

      {/* ── DATA TABLE ── */}
      <DataTable apps={uniqueApps || []} />

    </div>
  )
}
