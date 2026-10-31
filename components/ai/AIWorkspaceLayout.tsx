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
  indigo: { hex: 'var(--accent)', bg: 'bg-primary/10', text: 'text-[var(--accent)]', border: 'border-[var(--accent-border)]' },
  emerald: { hex: 'var(--green)', bg: 'bg-[#ECFDF5]', text: 'text-[var(--green)]', border: 'border-[#A7F3D0]' },
  amber: { hex: 'var(--gold)', bg: 'bg-[var(--gold-bg)]', text: 'text-[var(--gold)]', border: 'border-[color-mix(in_srgb,_var(--gold-bright)_40%,_transparent)]' },
  rose: { hex: 'var(--red)', bg: 'bg-[color-mix(in_srgb,_var(--red)_8%,_transparent)]', text: 'text-[var(--red)]', border: 'border-[color-mix(in_srgb,_var(--red)_25%,_transparent)]' },
  cyan: { hex: '#06B6D4', bg: 'bg-[#ECFEFF]', text: 'text-[#06B6D4]', border: 'border-[#A5F3FC]' },
  purple: { hex: 'var(--accent-2)', bg: 'bg-[var(--accent-bg)]', text: 'text-[var(--accent-2)]', border: 'border-[var(--accent-border)]' },
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
          <div className={`w-10 h-10 ${theme.bg} ${theme.border} border rounded-[18px] flex items-center justify-center ${theme.text} shrink-0`}>
            {icon}
          </div>

          {/* Title + AI badge */}
          <div>
            <h1 className="text-[18px] font-semibold text-foreground dark:text-slate-100 tracking-tight leading-none">{title}</h1>
            <div className="flex items-center gap-1.5 mt-1">
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: theme.hex }}
              />
              <span className="text-[11px] text-muted-foreground font-medium">
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
