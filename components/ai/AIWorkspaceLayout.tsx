'use client';
import React from 'react';
import { Sparkles } from 'lucide-react';

export type AIThemeColor = 'indigo' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'purple';

interface AIWorkspaceLayoutProps {
  title: string;
  icon: React.ReactNode;
  headerActions?: React.ReactNode;
  children?: React.ReactNode;
  themeColor?: AIThemeColor;
  subtitle?: string;
  // Legacy panel props — ignored, each page manages its own layout now
  leftPanel?: React.ReactNode;
  centerPanel?: React.ReactNode;
  rightPanel?: React.ReactNode;
}

const THEME_COLORS: Record<AIThemeColor, { hex: string; bg: string; text: string; border: string }> = {
  indigo: { hex: '#4F6BFF', bg: 'bg-[#EEF2FF]', text: 'text-[#4F6BFF]', border: 'border-[#C7D2FE]' },
  emerald: { hex: '#10B981', bg: 'bg-[#ECFDF5]', text: 'text-[#10B981]', border: 'border-[#A7F3D0]' },
  amber: { hex: '#F59E0B', bg: 'bg-[#FFFBEB]', text: 'text-[#F59E0B]', border: 'border-[#FDE68A]' },
  rose: { hex: '#F43F5E', bg: 'bg-[#FFF1F2]', text: 'text-[#F43F5E]', border: 'border-[#FECDD3]' },
  cyan: { hex: '#06B6D4', bg: 'bg-[#ECFEFF]', text: 'text-[#06B6D4]', border: 'border-[#A5F3FC]' },
  purple: { hex: '#8B5CF6', bg: 'bg-[#F5F3FF]', text: 'text-[#8B5CF6]', border: 'border-[#DDD6FE]' },
};

/**
 * AIWorkspaceLayout — now a lightweight native page header.
 * No dark wrapper. No full-screen container. Portal background shows through.
 * Each page controls its own card/panel layout below.
 */
export function AIWorkspaceLayout({
  title,
  icon,
  headerActions,
  children,
  themeColor = 'indigo',
  subtitle,
}: AIWorkspaceLayoutProps) {
  const theme = THEME_COLORS[themeColor];

  return (
    <div className="flex flex-col gap-5">
      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className={`w-10 h-10 ${theme.bg} ${theme.border} border rounded-[12px] flex items-center justify-center ${theme.text} shrink-0`}>
            {icon}
          </div>

          {/* Title + AI badge */}
          <div>
            <h1 className="text-[18px] font-semibold text-[#111827] dark:text-slate-100 tracking-tight leading-none">{title}</h1>
            <div className="flex items-center gap-1.5 mt-1">
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: theme.hex }}
              />
              <span className="text-[11px] text-[#9CA3AF] font-medium">
                Powered by EDUING AI
              </span>
              <Sparkles size={9} style={{ color: theme.hex }} className="opacity-70" />
            </div>
          </div>
        </div>

        {/* Actions */}
        {headerActions && (
          <div className="flex items-center gap-2">
            {headerActions}
          </div>
        )}
      </div>

      {/* ── Page Content ─────────────────────────────────────────── */}
      {children}
    </div>
  );
}
