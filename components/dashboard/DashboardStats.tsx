"use client";

import { Application } from "@/types/application";
import { Send, Clock, CheckCircle2, XCircle } from "lucide-react";

interface Props {
  applications: Application[];
}

export default function DashboardStats({ applications }: Props) {
  
  const stats = [
    {
      label: "Total Applied",
      value: applications.length,
      icon: Send,
    },
    {
      label: "Under Review",
      value: applications.filter(a => a.status === "under_review").length,
      icon: Clock,
    },
    {
      label: "Selected",
      value: applications.filter(a => a.status === "selected").length,
      icon: CheckCircle2,
    },
    {
      label: "Rejected",
      value: applications.filter(a => a.status === "rejected").length,
      icon: XCircle,
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <div 
          key={index}
          className="bg-[#151519] border border-white/5 rounded-[20px] p-6 flex flex-col justify-between min-h-[140px]"
        >
          <div className="flex justify-between items-start">
            <div className="text-gray-400">
              <stat.icon size={20} strokeWidth={2} />
            </div>
            {/* Supporting action could be added here, e.g. View All */}
          </div>
          
          <div className="mt-4">
            <h3 className="text-3xl font-medium text-white mb-1">{stat.value}</h3>
            <p className="text-sm text-gray-400">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
