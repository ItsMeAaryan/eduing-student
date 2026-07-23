import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  onPrimaryClick?: () => void;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  onSecondaryClick?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  primaryCtaLabel,
  primaryCtaHref,
  onPrimaryClick,
  secondaryCtaLabel,
  secondaryCtaHref,
  onSecondaryClick,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-[40px] text-center bg-white border border-[#EAECF0] rounded-[16px] ${className}`}>
      <div className="w-[56px] h-[56px] rounded-[16px] bg-[#EEF2FF] flex items-center justify-center mb-[16px]">
        <Icon size={26} className="text-[#4F6BFF]" strokeWidth={1.8} />
      </div>
      <h3 className="text-[16px] font-semibold text-[#111827] mb-[6px]">{title}</h3>
      <p className="text-[13px] text-[#6B7280] max-w-[360px] leading-relaxed mb-[24px]">{description}</p>
      
      <div className="flex items-center gap-[12px] flex-wrap justify-center">
        {primaryCtaLabel && (
          primaryCtaHref ? (
            <a
              href={primaryCtaHref}
              className="px-[16px] h-[36px] bg-[#4F6BFF] text-white text-[13px] font-semibold rounded-[8px] hover:bg-[#3D56E0] transition-colors flex items-center justify-center"
            >
              {primaryCtaLabel}
            </a>
          ) : (
            <button
              onClick={onPrimaryClick}
              className="px-[16px] h-[36px] bg-[#4F6BFF] text-white text-[13px] font-semibold rounded-[8px] hover:bg-[#3D56E0] transition-colors flex items-center justify-center"
            >
              {primaryCtaLabel}
            </button>
          )
        )}

        {secondaryCtaLabel && (
          secondaryCtaHref ? (
            <a
              href={secondaryCtaHref}
              className="px-[16px] h-[36px] border border-[#EAECF0] bg-white text-[#374151] text-[13px] font-medium rounded-[8px] hover:bg-[#F9FAFB] transition-colors flex items-center justify-center"
            >
              {secondaryCtaLabel}
            </a>
          ) : (
            <button
              onClick={onSecondaryClick}
              className="px-[16px] h-[36px] border border-[#EAECF0] bg-white text-[#374151] text-[13px] font-medium rounded-[8px] hover:bg-[#F9FAFB] transition-colors flex items-center justify-center"
            >
              {secondaryCtaLabel}
            </button>
          )
        )}
      </div>
    </div>
  );
}
