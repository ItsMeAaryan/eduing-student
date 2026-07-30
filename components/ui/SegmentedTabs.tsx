'use client'

interface SegmentedTabsProps {
  tabs: string[]
  active: string
  onChange: (tab: string) => void
  className?: string
}

export default function SegmentedTabs({ tabs, active, onChange, className = '' }: SegmentedTabsProps) {
  return (
    <div className={`flex items-center bg-white dark:bg-slate-900 border border-[#EAECF0] dark:border-slate-800 rounded-[10px] p-[3px] gap-[2px] transition-colors ${className}`}>
      {tabs.map(t => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`px-[14px] h-[28px] rounded-[7px] text-[13px] font-medium whitespace-nowrap transition-all ${
            active === t
              ? 'bg-[#F3F4F6] dark:bg-slate-800 text-[#111827] dark:text-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.06)]'
              : 'text-[#6B7280] dark:text-slate-400 hover:text-[#374151] dark:hover:text-slate-200'
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  )
}
