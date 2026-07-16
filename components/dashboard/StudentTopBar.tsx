"use client";
import { Search, Bell, MessageSquare, ChevronDown, Command } from "lucide-react";
import { useStudentData } from '@/components/providers/StudentDataProvider'
import { usePathname } from "next/navigation";
import Image from 'next/image'
import { motion } from "framer-motion";
import { useState } from "react";

export default function StudentTopBar() {
  const pathname = usePathname();
  const { profile, profileScore } = useStudentData()
  const name = profile?.fullName || 'Student'
  const score = profileScore || 0

  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Generate breadcrumbs from pathname
  const paths = pathname.split('/').filter(Boolean);
  const breadcrumbs = paths.map((path, i) => {
    return {
      label: path.charAt(0).toUpperCase() + path.slice(1),
      isLast: i === paths.length - 1
    }
  });

  // Calculate SVG ring stroke dasharray based on score
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="sticky top-0 z-30 h-[72px] bg-[#08080B]/80 backdrop-blur-2xl border-b border-white/[0.04] px-4 md:px-8 flex items-center justify-between transition-all duration-300">
      {/* Left side: Breadcrumbs */}
      <div className="flex items-center gap-2">
        <div className="flex items-center text-[13px] font-medium tracking-wide">
          {breadcrumbs.map((crumb, i) => (
            <div key={i} className="flex items-center">
              <span className={crumb.isLast ? "text-white" : "text-white/40 hover:text-white/60 transition-colors cursor-pointer"}>
                {crumb.label}
              </span>
              {!crumb.isLast && <span className="mx-2 text-white/20">/</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-4 md:gap-6">
        {/* Search */}
        <div className="relative group hidden lg:block w-72">
          <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${isSearchFocused ? 'text-indigo-400' : 'text-white/30'}`} size={16} strokeWidth={2.5} />
          <input 
            type="text" 
            placeholder="Search anything..." 
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="w-full h-10 bg-white/[0.02] border border-white/[0.05] rounded-[14px] pl-10 pr-14 text-[13px] text-white shadow-sm focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.04] transition-all duration-300 placeholder:text-white/30"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-50 pointer-events-none">
            <span className="text-[10px] font-bold font-mono bg-white/10 rounded-[6px] px-2 py-1 flex items-center gap-1"><Command size={10} /> K</span>
          </div>
        </div>

        {/* Notification Icons */}
        <div className="flex items-center gap-1">
          <button className="w-10 h-10 rounded-xl flex items-center justify-center text-white/40 hover:bg-white/[0.05] hover:text-white transition-all relative group">
            <MessageSquare size={18} strokeWidth={2} className="group-hover:scale-110 transition-transform" />
          </button>
          <button className="w-10 h-10 rounded-xl flex items-center justify-center text-white/40 hover:bg-white/[0.05] hover:text-white transition-all relative group">
            <Bell size={18} strokeWidth={2} className="group-hover:scale-110 transition-transform" />
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-500 rounded-full border border-[#08080B]"
            />
          </button>
        </div>

        <div className="h-6 w-px bg-white/[0.06] hidden md:block" />

        {/* Profile Dropdown */}
        <div className="flex items-center gap-3 cursor-pointer group hover:bg-white/[0.02] p-1 pr-3 rounded-[18px] transition-colors border border-transparent hover:border-white/[0.05]">
          
          <div className="relative w-10 h-10 flex items-center justify-center">
            {/* Completion Ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90 transform" viewBox="0 0 40 40">
              <circle
                cx="20"
                cy="20"
                r={radius}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="2"
                fill="none"
              />
              <motion.circle
                cx="20"
                cy="20"
                r={radius}
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-emerald-400"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                strokeLinecap="round"
              />
            </svg>
            
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-[13px] shadow-inner relative z-10">
              {profile?.profilePhotoURL ? (
                <Image src={profile.profilePhotoURL} alt="Avatar" fill className="rounded-full object-cover" />
              ) : (
                name.charAt(0)
              )}
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <div className="text-[13px] font-bold text-white/90 group-hover:text-white transition-colors tracking-wide">{name}</div>
            <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-0.5">Profile {score}%</div>
          </div>
          <ChevronDown size={14} className="text-white/30 group-hover:text-white/70 transition-colors hidden sm:block ml-1" />
        </div>
      </div>
    </div>
  );
}
