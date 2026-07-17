/**
 * SegmentedTabs — single shared tab component for the entire Student Portal.
 *
 * Design spec (from Dashboard, the source of truth):
 *   Container : bg-white, border border-[#EAECF0], rounded-[10px], p-[3px], gap-[2px]
 *   Inactive  : text-[13px] font-medium text-[#6B7280], hover:text-[#374151]
 *   Active    : bg-[#F3F4F6] text-[#111827], shadow-[0_1px_2px_rgba(0,0,0,0.06)]
 *   Button    : px-[14px] h-[28px] rounded-[7px]
 *
 * Usage:
 *   <SegmentedTabs tabs={['All', 'Draft', 'Submitted']} active={tab} onChange={setTab} />
 */
'use client'

interface SegmentedTabsProps {
  tabs: string[]
  active: string
  onChange: (tab: string) => void
  className?: string
}

export default function SegmentedTabs({ tabs, active, onChange, className = '' }: SegmentedTabsProps) {
  return (
    <div className={`flex items-center bg-white border border-[#EAECF0] rounded-[10px] p-[3px] gap-[2px] ${className}`}>
      {tabs.map(t => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`px-[14px] h-[28px] rounded-[7px] text-[13px] font-medium whitespace-nowrap transition-all ${
            active === t
              ? 'bg-[#F3F4F6] text-[#111827] shadow-[0_1px_2px_rgba(0,0,0,0.06)]'
              : 'text-[#6B7280] hover:text-[#374151]'
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  )
}
