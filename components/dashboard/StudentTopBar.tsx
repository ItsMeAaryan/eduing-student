"use client";
import { Search, Bell, MessageSquare, ChevronDown } from "lucide-react";
import { useStudentData } from '@/components/providers/StudentDataProvider'

export default function StudentTopBar() {
  const { profile, profileScore } = useStudentData()
  const name = profile?.fullName || 'Student'
  const score = profileScore || 0
  return (
    <div className="sticky top-0 z-30 h-[72px] bg-[#08080B]/70 backdrop-blur-2xl border-b border-white/[0.06] px-8 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
      {/* Left side: Greeting */}
      <div className="flex items-center gap-4">
        <h2 className="text-white/90 font-display font-medium text-[14px]">
          Welcome back, <span className="text-white/50 font-normal">{name.split(' ')[0]}</span>
        </h2>
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-5">
        {/* Search */}
        <div className="relative group hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-brand-indigoLight transition-colors" size={14} strokeWidth={2.5} />
          <input 
            type="text" 
            placeholder="Search programs..." 
            className="w-[280px] h-9 bg-[#111114] border border-white/[0.08] rounded-full pl-9 pr-14 text-[13px] text-white shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)] focus:outline-none focus:ring-4 focus:ring-brand-indigo/10 focus:border-brand-indigo/50 focus:bg-[#1A1A24] transition-all duration-300 placeholder:text-white/30"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-40 pointer-events-none">
            <span className="text-[9px] font-bold font-mono border border-white/20 rounded-[4px] px-1.5 py-0.5">⌘K</span>
          </div>
        </div>

        {/* Notification Icons */}
        <div className="flex items-center gap-1">
          <button className="w-9 h-9 rounded-full flex items-center justify-center text-white/40 hover:bg-white/[0.06] hover:text-white transition-all relative group">
            <MessageSquare size={16} strokeWidth={2} className="group-hover:scale-110 transition-transform" />
          </button>
          <button className="w-9 h-9 rounded-full flex items-center justify-center text-white/40 hover:bg-white/[0.06] hover:text-white transition-all relative group">
            <Bell size={16} strokeWidth={2} className="group-hover:scale-110 transition-transform" />
            <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-brand-indigoLight rounded-full shadow-[0_0_8px_rgba(79,70,229,1)]" />
          </button>
        </div>

        <div className="h-5 w-px bg-white/[0.08]" />

        {/* Profile Dropdown */}
        <div className="flex items-center gap-3 cursor-pointer group hover:bg-white/[0.03] p-1.5 pr-3 rounded-full transition-colors border border-transparent hover:border-white/[0.05]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-indigo to-[#3730A3] flex items-center justify-center text-white font-semibold text-[13px] shadow-inner border border-white/10 group-hover:border-white/20 transition-colors">
            {name.charAt(0)}
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-[12px] font-medium text-white/90 group-hover:text-white transition-colors">{name}</div>
            <div className="text-[10px] text-emerald-400 font-medium">Profile {score}%</div>
          </div>
          <ChevronDown size={14} className="text-white/30 group-hover:text-white/70 transition-colors hidden sm:block ml-0.5" />
        </div>
      </div>
    </div>
  );
}
