'use client';

import React, { useEffect, useState } from 'react';
import { User, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { calculateProfileStrength, ProfileStrengthResult } from '@/lib/utils/profileStrength';
import { useStudentData } from '@/components/providers/StudentDataProvider';

export function ProfileStrengthCard() {
  const { profile } = useStudentData();
  const [strength, setStrength] = useState<ProfileStrengthResult | null>(null);
  
  useEffect(() => {
    if (profile) {
      setStrength(calculateProfileStrength(profile, profile.documents || {}));
    }
  }, [profile]);

  if (!strength) return null;

  const { percentage } = strength;

  return (
    <div className="bg-[#151519] border border-white/5 rounded-[20px] p-6 flex flex-col justify-between min-h-[140px]">
      <div className="flex justify-between items-start">
        <div className="text-gray-400">
          <User size={20} strokeWidth={2} />
        </div>
        <Link href="/student/profile" className="text-sm text-[#6D5DF6] hover:text-white transition-colors flex items-center gap-1">
          Complete <ArrowRight size={14} />
        </Link>
      </div>
      
      <div className="mt-4">
        <h3 className="text-3xl font-medium text-white mb-1">{percentage}%</h3>
        <p className="text-sm text-gray-400">Profile Strength</p>
      </div>
    </div>
  );
}
