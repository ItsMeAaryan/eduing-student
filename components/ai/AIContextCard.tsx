import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AIContextCardProps {
  title: string;
  icon: LucideIcon;
  value?: string | number;
  valueColor?: string;
  children?: React.ReactNode;
  progress?: number;
}

export function AIContextCard({
  title,
  icon: Icon,
  value,
  valueColor = "text-indigo-400",
  children,
  progress
}: AIContextCardProps) {
  return (
    <div className="bg-[#14141A] border border-white/5 p-4 rounded-2xl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold flex items-center gap-2">
          <Icon size={14} className={valueColor} /> {title}
        </h3>
        {value !== undefined && (
          <span className={`text-[10px] font-black uppercase tracking-widest ${valueColor}`}>
            {value}
          </span>
        )}
      </div>
      
      {progress !== undefined && (
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-3">
          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${progress}%` }} />
        </div>
      )}
      
      {children && (
        <div className="mt-2 space-y-2">
          {children}
        </div>
      )}
    </div>
  );
}
