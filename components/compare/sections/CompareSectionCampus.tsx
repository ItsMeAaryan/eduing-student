import React from 'react';
import Image from 'next/image';

export function CompareSectionCampus({ data }: { data: any[] }) {
  return (
    <div className="pt-12">
      <h3 className="text-[28px] font-extrabold text-foreground mb-10 tracking-tight">Campus Experience</h3>
      
      <div className="flex gap-10 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-8">
        {data.map(item => {
          const u = item.university;

          return (
            <div key={u.id} className="min-w-[280px] max-w-[320px] flex-1 snap-start flex flex-col gap-6">
              
              {u.heroImageUrl && (
                <div className="relative w-full h-[180px] rounded-2xl overflow-hidden shadow-sm">
                  <Image 
                    src={u.heroImageUrl} 
                    alt={u.name} 
                    fill 
                    className="object-cover"
                    unoptimized 
                  />
                </div>
              )}

              {u.facilities && u.facilities.length > 0 && (
                <div>
                  <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Key Facilities</p>
                  <div className="flex flex-wrap gap-2">
                    {u.facilities.map((fac: string, i: number) => (
                      <span key={i} className="text-[11px] font-medium bg-background border border-border px-2 py-1 rounded-md text-foreground">
                        {fac}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {u.campusSize && (
                <div>
                  <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Campus Size</p>
                  <p className="text-[15px] font-medium text-foreground">{u.campusSize}</p>
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
}
