import React from 'react';
import { getWinnerIndex, formatCurrency } from '@/lib/utils/compareMetrics';
import { CheckCircle2 } from 'lucide-react';

export function CompareSectionFees({ data }: { data: any[] }) {
  const fees = data.map(d => d.university.feesPerYear);
  const bestFeeIdx = getWinnerIndex(fees, 'lower_is_better');

  return (
    <div className="pt-12">
      <h3 className="text-[28px] font-extrabold text-foreground mb-10 tracking-tight">Financial Comparison</h3>
      
      <div className="flex gap-10 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-8">
        {data.map((item, idx) => {
          const u = item.university;
          const fee = fees[idx];
          const bestScholarship = item.bestScholarship;

          return (
            <div key={u.id} className="min-w-[280px] max-w-[320px] flex-1 snap-start flex flex-col gap-6">
              
              {fee > 0 && (
                <div>
                  <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Estimated Yearly Fees</p>
                  <div className="flex items-end gap-2">
                    <p className="text-[20px] font-bold text-foreground">{formatCurrency(fee)}</p>
                    {idx === bestFeeIdx && <span className="text-[11px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-md mb-1">Most Affordable</span>}
                  </div>
                </div>
              )}

              {bestScholarship ? (
                <div>
                  <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Top Matched Scholarship</p>
                  <div className="bg-success/5 p-4 rounded-2xl">
                    <p className="text-[14px] font-bold text-success mb-1">{bestScholarship.scholarship.name}</p>
                    <p className="text-[12px] text-success/80 font-medium mb-3">Eligibility: {bestScholarship.eligibilityScore}% Match</p>
                    {bestScholarship.scholarship.amount && (
                      <p className="text-[18px] font-bold text-foreground mb-1">
                        {typeof bestScholarship.scholarship.amount === 'number' 
                          ? formatCurrency(bestScholarship.scholarship.amount) 
                          : bestScholarship.scholarship.amount}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Top Matched Scholarship</p>
                  <div className="bg-hover/50 p-4 rounded-2xl text-center">
                    <p className="text-[12px] text-muted-foreground">No highly matched scholarships found for your profile at this institution.</p>
                  </div>
                </div>
              )}

              {u.scholarships && u.scholarships.length > 0 && (
                <div>
                  <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Available Scholarships</p>
                  <ul className="flex flex-col gap-2">
                    {u.scholarships.map((sch: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-[12px] text-foreground">
                        <CheckCircle2 size={14} className="text-primary mt-0.5 shrink-0" />
                        <span>{sch}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
}
