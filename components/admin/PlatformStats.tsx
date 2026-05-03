"use client";

import { Building2, ShieldAlert, Users, Send, CalendarPlus, BookOpen } from "lucide-react";

interface Props {
  data: {
    totalUniversities: number;
    pendingApprovals: number;
    totalStudents: number;
    totalApplications: number;
    applicationsThisMonth: number;
    activePrograms: number;
  };
}

export default function PlatformStats({ data }: Props) {
  
  const stats = [
    { label: "Approved Universities", value: data.totalUniversities, icon: Building2, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Pending Approvals", value: data.pendingApprovals, icon: ShieldAlert, color: "text-red-500", bg: "bg-red-500/10" },
    { label: "Total Students", value: data.totalStudents, icon: Users, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Total Applications", value: data.totalApplications, icon: Send, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Apps This Month", value: data.applicationsThisMonth, icon: CalendarPlus, color: "text-orange-500", bg: "bg-orange-500/10" },
    { label: "Active Programs", value: data.activePrograms, icon: BookOpen, color: "text-teal-500", bg: "bg-teal-500/10" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 hover:bg-white/5 transition-colors">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.bg} ${stat.color}`}>
            <stat.icon size={20} />
          </div>
          <h3 className="text-2xl font-black text-white mb-1">{stat.value}</h3>
          <p className="text-[10px] font-bold text-textSecondary uppercase tracking-wider leading-tight">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
