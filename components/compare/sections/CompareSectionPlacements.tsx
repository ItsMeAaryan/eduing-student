import React from 'react';
import { getWinnerIndex, formatCurrency } from '@/lib/utils/compareMetrics';

export function CompareSectionPlacements({ data }: { data: any[] }) {
  const highestPackages = data.map(d => d.university.placementDetails?.highestPackageLpa || d.university.highestPackageLpa);
  const avgPackages = data.map(d => d.university.placementDetails?.avgPackageLpa || d.university.avgPackageLpa);
  const placementRates = data.map(d => d.university.placementDetails?.placementRate || d.university.placementRate);

  const bestHighestIdx = getWinnerIndex(highestPackages, 'higher_is_better');
  const bestAvgIdx = getWinnerIndex(avgPackages, 'higher_is_better');
  const bestRateIdx = getWinnerIndex(placementRates, 'higher_is_better');

  return (
    <div className="pt-12">
      <h3 className="text-[28px] font-extrabold text-foreground mb-10 tracking-tight">Career Outcomes</h3>
      
      <div className="flex gap-10 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-8">
        {data.map((item, idx) => {
          const u = item.university;
          const p = u.placementDetails || {};
          
          const highest = highestPackages[idx];
          const avg = avgPackages[idx];
          const rate = placementRates[idx];
          const median = p.medianPackageLpa;

          return (
            <div key={u.id} className="min-w-[280px] max-w-[320px] flex-1 snap-start flex flex-col gap-6">
              
              {highest > 0 && (
                <div>
                  <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Highest Package</p>
                  <div className="flex items-end gap-2">
                    <p className="text-[20px] font-bold text-foreground">₹{highest} <span className="text-[13px] text-muted-foreground font-normal">LPA</span></p>
                    {idx === bestHighestIdx && <span className="text-[11px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-md mb-1">Highest</span>}
                  </div>
                </div>
              )}

              {avg > 0 && (
                <div>
                  <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Average Package</p>
                  <div className="flex items-end gap-2">
                    <p className="text-[20px] font-bold text-foreground">₹{avg} <span className="text-[13px] text-muted-foreground font-normal">LPA</span></p>
                    {idx === bestAvgIdx && <span className="text-[11px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-md mb-1">Best Avg</span>}
                  </div>
                </div>
              )}

              {median && median > 0 && (
                <div>
                  <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Median Package</p>
                  <p className="text-[15px] font-medium text-foreground">₹{median} LPA</p>
                </div>
              )}

              {rate && rate > 0 && (
                <div>
                  <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Placement Rate</p>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[15px] font-bold text-foreground">{rate}%</p>
                      {idx === bestRateIdx && <span className="text-[11px] font-bold text-success">Top</span>}
                    </div>
                    <div className="h-2 w-full bg-hover rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${rate}%` }} />
                    </div>
                  </div>
                </div>
              )}

              {p.topRecruiters && p.topRecruiters.length > 0 && (
                <div>
                  <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Top Recruiters</p>
                  <div className="flex flex-wrap gap-2">
                    {p.topRecruiters.slice(0, 5).map((rec: string) => (
                      <span key={rec} className="text-[11px] font-medium bg-background border border-border px-2 py-1 rounded-md text-foreground">
                        {rec}
                      </span>
                    ))}
                    {p.topRecruiters.length > 5 && (
                      <span className="text-[11px] font-medium text-muted-foreground py-1">+{p.topRecruiters.length - 5} more</span>
                    )}
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
}
