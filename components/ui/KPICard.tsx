import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

export function DotSparkline({ color }: { color: string }) {
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

export function KPICard({
  label, value, pct, pctUp, dotColor, sub,
}: {
  label: string; value: string | number;
  pct: string; pctUp: boolean; dotColor: string; sub?: string;
}) {
  return (
    <div className="bg-white border border-[#EAECF0] rounded-[14px] p-[24px] flex flex-col justify-between min-h-[128px]">
      <span className="text-[13px] font-medium text-[#6B7280] leading-none">{label}</span>
      <div className="flex items-end justify-between mt-[12px]">
        <span className="text-[28px] font-bold text-[#111827] leading-none tracking-[-0.02em]">{value}</span>
        <DotSparkline color={dotColor} />
      </div>
      <div className="flex items-center gap-[5px] mt-[12px]">
        {pctUp
          ? <TrendingUp  size={13} strokeWidth={2} className="text-[#10B981] shrink-0" />
          : <TrendingDown size={13} strokeWidth={2} className="text-[#EF4444] shrink-0" />}
        <span className={`text-[11px] font-semibold ${pctUp ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>{pct}</span>
        <span className="text-[11px] text-[#9CA3AF]">{sub ?? 'vs last month'}</span>
      </div>
    </div>
  )
}
