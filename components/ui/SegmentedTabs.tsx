'use client'

interface SegmentedTabsProps {
  tabs: string[]
  active: string
  onChange: (tab: string) => void
  className?: string
}

export default function SegmentedTabs({ tabs, active, onChange, className = '' }: SegmentedTabsProps) {
  return (
    <div className={`flex items-center bg-card border border-border rounded-[10px] p-[3px] gap-[2px] transition-colors ${className}`}>
      {tabs.map(t => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`px-[14px] h-[28px] rounded-[7px] text-[13px] font-medium whitespace-nowrap transition-all ${
            active === t
              ? 'bg-secondary text-secondary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  )
}
