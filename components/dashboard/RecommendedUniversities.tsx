"use client";

import { Sparkles, MapPin } from "lucide-react";
import Link from "next/link";

// Mock data for UI demonstration
const MOCK_RECOMMENDATIONS = [
  {
    id: "r1",
    name: "Birla Institute of Technology",
    city: "Pilani",
    state: "Rajasthan",
    matchScore: 98,
    logo: "https://ui-avatars.com/api/?name=BIT&background=3B82F6&color=fff"
  },
  {
    id: "r2",
    name: "Vellore Institute of Technology",
    city: "Vellore",
    state: "Tamil Nadu",
    matchScore: 92,
    logo: "https://ui-avatars.com/api/?name=VIT&background=10B981&color=fff"
  },
  {
    id: "r3",
    name: "SRM University",
    city: "Chennai",
    state: "Tamil Nadu",
    matchScore: 85,
    logo: "https://ui-avatars.com/api/?name=SRM&background=8B5CF6&color=fff"
  }
];

export default function RecommendedUniversities() {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 h-fit mt-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-white flex items-center">
          <Sparkles size={18} className="text-yellow-400 mr-2" /> 
          Top Matches for You
        </h3>
      </div>

      <div className="space-y-4">
        {MOCK_RECOMMENDATIONS.map((uni) => (
          <Link key={uni.id} href={`/student/universities/${uni.id}`} className="block">
            <div className="flex items-center p-3 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all group">
              <img src={uni.logo} alt={uni.name} className="w-12 h-12 rounded-xl object-cover mr-4 border border-white/10" />
              
              <div className="flex-grow">
                <h4 className="font-bold text-white text-sm group-hover:text-primary transition-colors line-clamp-1">{uni.name}</h4>
                <div className="flex items-center text-xs text-textSecondary mt-0.5">
                  <MapPin size={12} className="mr-1" />
                  {uni.city}, {uni.state}
                </div>
              </div>
              
              <div className="shrink-0 flex flex-col items-end justify-center">
                <span className="text-xs font-bold text-green-400 mb-0.5">{uni.matchScore}% Match</span>
                <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="bg-green-400 h-full rounded-full" style={{ width: `${uni.matchScore}%` }}></div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      <Link href="/student/universities" className="block w-full text-center mt-6 text-sm text-primary hover:text-blue-400 font-medium transition-colors">
        View all recommendations
      </Link>
    </div>
  );
}
