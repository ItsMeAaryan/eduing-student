"use client";

import { Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

// Mock data for UI demonstration
const MOCK_ALERTS = [
  {
    id: "d1",
    universityName: "IIT Delhi",
    programName: "M.Tech in Data Science",
    daysLeft: 3,
    deadline: "25 Nov 2026",
    universityId: "mock1"
  },
  {
    id: "d2",
    universityName: "Symbiosis Institute",
    programName: "MBA Finance",
    daysLeft: 5,
    deadline: "27 Nov 2026",
    universityId: "mock2"
  }
];

export default function DeadlineAlerts() {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 h-fit">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-white flex items-center">
          <Clock size={18} className="text-orange-400 mr-2" /> 
          Upcoming Deadlines
        </h3>
      </div>

      <div className="space-y-4">
        {MOCK_ALERTS.map((alert) => (
          <div key={alert.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-orange-500/30 transition-colors group">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-bold text-white text-sm">{alert.universityName}</h4>
                <p className="text-xs text-textSecondary">{alert.programName}</p>
              </div>
              <span className="px-2 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-md text-xs font-bold whitespace-nowrap">
                {alert.daysLeft} Days Left
              </span>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-textSecondary">Due: {alert.deadline}</span>
              <Link 
                href={`/student/universities/${alert.universityId}`}
                className="text-xs font-semibold text-primary group-hover:text-blue-400 flex items-center transition-colors"
              >
                Apply Now <ArrowRight size={14} className="ml-1" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
