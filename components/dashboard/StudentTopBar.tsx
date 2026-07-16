"use client";
import { Search, Bell, User } from "lucide-react";
import { useStudentData } from '@/components/providers/StudentDataProvider'
import Image from 'next/image'
import { useState } from "react";

export default function StudentTopBar() {
  const { profile } = useStudentData()
  const name = profile?.fullName || 'Student'
  
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <div className="sticky top-0 z-30 h-20 bg-[#09090B] px-8 flex items-center justify-end transition-all duration-300">
      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="relative group hidden md:block w-[240px]">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isSearchFocused ? 'text-white' : 'text-gray-500'}`} size={16} strokeWidth={2} />
          <input 
            type="text" 
            placeholder="Search..." 
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="w-full h-10 bg-[#111113] border border-white/5 rounded-xl pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#6D5DF6]/50 transition-all duration-300 placeholder:text-gray-500"
          />
        </div>

        {/* Notifications */}
        <button aria-label="Notifications" className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all relative">
          <Bell size={18} strokeWidth={2} />
          <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#6D5DF6] rounded-full" />
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="w-10 h-10 rounded-xl bg-[#111113] border border-white/5 flex items-center justify-center text-white font-medium text-sm overflow-hidden relative">
            {profile?.profilePhotoURL ? (
              <Image src={profile.profilePhotoURL} alt="Avatar" fill className="object-cover" />
            ) : (
              <User size={16} className="text-gray-400 group-hover:text-white transition-colors" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
