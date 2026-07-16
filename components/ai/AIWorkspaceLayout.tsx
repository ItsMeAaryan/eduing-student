import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface AIWorkspaceLayoutProps {
  title: string;
  icon: React.ReactNode;
  headerActions?: React.ReactNode;
  leftPanel: React.ReactNode;
  centerPanel: React.ReactNode;
  rightPanel: React.ReactNode;
}

export function AIWorkspaceLayout({
  title,
  icon,
  headerActions,
  leftPanel,
  centerPanel,
  rightPanel
}: AIWorkspaceLayoutProps) {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col h-screen overflow-hidden">
      {/* Top Navbar */}
      <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#0A0A0F] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400">
            {icon}
          </div>
          <div>
            <h1 className="text-sm font-black">{title}</h1>
            <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest flex items-center gap-1">
              <Sparkles size={10} className="text-indigo-400" /> Powered by Gemini
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {headerActions}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        <div className="w-64 border-r border-white/5 bg-[#08080C] p-4 flex flex-col gap-6 overflow-y-auto shrink-0 custom-scrollbar">
          {leftPanel}
        </div>

        {/* Center Panel */}
        <div className="flex-1 bg-[#050505] overflow-y-auto p-6 lg:p-12 custom-scrollbar flex flex-col relative">
          <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
            {centerPanel}
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-80 border-l border-white/5 bg-[#08080C] flex flex-col shrink-0">
          {rightPanel}
        </div>
      </div>
    </div>
  );
}
