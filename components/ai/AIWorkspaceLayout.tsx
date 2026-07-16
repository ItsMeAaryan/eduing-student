import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export type AIThemeColor = 'indigo' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'purple';

interface AIWorkspaceLayoutProps {
  title: string;
  icon: React.ReactNode;
  headerActions?: React.ReactNode;
  leftPanel?: React.ReactNode;
  centerPanel?: React.ReactNode;
  rightPanel?: React.ReactNode;
  children?: React.ReactNode;
  themeColor?: AIThemeColor;
}

export function AIWorkspaceLayout({
  title,
  icon,
  headerActions,
  leftPanel,
  centerPanel,
  rightPanel,
  children,
  themeColor = 'indigo'
}: AIWorkspaceLayoutProps) {

  const themes = {
    indigo: {
      bg: 'bg-indigo-500/10',
      text: 'text-indigo-400',
      border: 'border-indigo-500/20'
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/20'
    },
    amber: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/20'
    },
    rose: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      border: 'border-rose-500/20'
    },
    cyan: {
      bg: 'bg-cyan-500/10',
      text: 'text-cyan-400',
      border: 'border-cyan-500/20'
    },
    purple: {
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      border: 'border-purple-500/20'
    }
  };

  const currentTheme = themes[themeColor];

  return (
    <div className="min-h-screen bg-[#09090B] text-white font-sans flex flex-col h-screen overflow-hidden">
      {/* Top Navbar */}
      <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#09090B] shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${currentTheme.bg} rounded-xl flex items-center justify-center ${currentTheme.text} shadow-inner`}>
            {icon}
          </div>
          <div>
            <h1 className="text-sm font-display font-semibold tracking-wide text-white">{title}</h1>
            <div className={`text-[10px] ${currentTheme.text} font-bold uppercase tracking-widest flex items-center gap-1 mt-0.5`}>
              <Sparkles size={10} /> Powered by EDUING AI
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {headerActions}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Subtle background glow based on theme - Global for the workspace */}
        <div className={`absolute top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] ${currentTheme.bg} blur-[120px] rounded-full mix-blend-screen opacity-10 pointer-events-none z-0`} />

        {children ? (
          <div className="flex-1 w-full h-full relative z-10 overflow-hidden flex flex-col">
            {children}
          </div>
        ) : (
          <>
            {/* Left Panel */}
            {leftPanel && (
              <div className="w-64 border-r border-white/5 bg-[#111113] p-4 flex flex-col gap-6 overflow-y-auto shrink-0 custom-scrollbar z-10">
                {leftPanel}
              </div>
            )}

            {/* Center Panel */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-12 custom-scrollbar flex flex-col relative z-10">
              <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col relative">
                {centerPanel}
              </div>
            </div>

            {/* Right Panel */}
            {rightPanel && (
              <div className="w-80 border-l border-white/5 bg-[#111113] flex flex-col shrink-0 z-10">
                {rightPanel}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
