import React from 'react';
import { getWinnerIndex } from '@/lib/utils/compareMetrics';

export function CompareSectionOverview({ data }: { data: any[] }) {
  const matchScores = data.map(item => item.recommendation?.overallMatchScore || 0);
  const bestMatchIdx = getWinnerIndex(matchScores, 'higher_is_better');

  return (
    <div className="pt-8">
      <h3 className="text-[28px] font-extrabold text-foreground mb-10 tracking-tight">Academic Comparison</h3>
      
      <div className="flex gap-10 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-8">
        {data.map((item, idx) => {
          const isBestMatch = idx === bestMatchIdx;
          const u = item.university;

          return (
            <div key={u.id} className="min-w-[280px] max-w-[320px] flex-1 snap-start flex flex-col gap-6">
              <div>
                <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Profile Match</p>
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-16">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="16" className="stroke-border" strokeWidth="3" fill="none" />
                      <circle cx="18" cy="18" r="16" className="stroke-primary"
                        strokeWidth="3" fill="none" strokeLinecap="round"
                        strokeDasharray="100" strokeDashoffset={100 - matchScores[idx]} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-[14px] font-black text-foreground">
                      {matchScores[idx]}
                    </div>
                  </div>
                  {isBestMatch && (
                    <span className="text-[11px] font-bold text-success bg-success/10 px-2 py-1 rounded-md">Best Match</span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Location</p>
                <p className="text-[15px] font-medium text-foreground">
                  {typeof u.location === 'object' && u.location !== null
                    ? `${u.location.city || ''}, ${u.location.state || ''}`.replace(/^, |, $/g, '')
                    : String(u.location || '')}
                </p>
              </div>

              <div>
                <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Institution Type</p>
                <p className="text-[15px] font-medium text-foreground">{u.type}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
