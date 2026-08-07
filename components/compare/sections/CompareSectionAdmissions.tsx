import React from 'react';
import { getWinnerIndex } from '@/lib/utils/compareMetrics';

export function CompareSectionAdmissions({ data }: { data: any[] }) {
  const probScores = data.map(item => item.probability?.overallProbability || 0);
  const bestProbIdx = getWinnerIndex(probScores, 'higher_is_better');

  return (
    <div className="pt-12">
      <h3 className="text-[28px] font-extrabold text-foreground mb-10 tracking-tight">Admissions</h3>
      
      <div className="flex gap-10 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-8">
        {data.map((item, idx) => {
          const u = item.university;
          const prob = item.probability;
          const isSafest = idx === bestProbIdx;

          return (
            <div key={u.id} className="min-w-[280px] max-w-[320px] flex-1 snap-start flex flex-col gap-6">
              
              <div>
                <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider mb-2">AI Admission Probability</p>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[24px] font-bold text-foreground">{probScores[idx]}%</p>
                  {isSafest && <span className="text-[11px] font-bold text-accent bg-accent/10 px-2 py-1 rounded-md">Safest Choice</span>}
                </div>
                <div className="h-2 w-full bg-hover rounded-full overflow-hidden">
                  <div className={`h-full ${probScores[idx] >= 70 ? 'bg-success' : probScores[idx] >= 40 ? 'bg-warning' : 'bg-danger'}`} style={{ width: `${probScores[idx]}%` }} />
                </div>
              </div>

              <div>
                <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Risk Level</p>
                <p className={`text-[14px] font-bold uppercase tracking-widest ${
                  prob.probabilityLabel === 'Very Low' || prob.probabilityLabel === 'Low' ? 'text-danger' : 
                  prob.probabilityLabel === 'Moderate' ? 'text-warning' : 'text-success'
                }`}>
                  {prob.probabilityLabel}
                </p>
              </div>

              {item.recommendation.missingRequirements && item.recommendation.missingRequirements.length > 0 && (
                <div className="bg-warning/10 p-5 rounded-2xl">
                  <p className="text-[12px] font-bold text-warning uppercase tracking-wider mb-2">Needs Attention</p>
                  <ul className="flex flex-col gap-1">
                    {item.recommendation.missingRequirements.map((req: string, i: number) => (
                      <li key={i} className="text-[13px] text-foreground font-medium">• {req}</li>
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
