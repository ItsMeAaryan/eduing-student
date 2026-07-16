import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AIEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionButton?: React.ReactNode;
}

export function AIEmptyState({ 
  icon: Icon, 
  title, 
  description,
  actionButton
}: AIEmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center py-24 px-6 h-full">
      <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-indigo-500/10">
        <Icon size={32} className="text-indigo-400 opacity-80" />
      </div>
      <h2 className="text-2xl font-black mb-2">{title}</h2>
      <p className="text-white/40 max-w-md mx-auto mb-8 text-sm">
        {description}
      </p>
      {actionButton}
    </div>
  );
}
