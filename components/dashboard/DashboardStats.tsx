"use client";

import { Application } from "@/types/application";
import { Send, Clock, CheckCircle2, XCircle, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  applications: Application[];
}

export default function DashboardStats({ applications }: Props) {
  
  const stats = [
    {
      label: "Total Applied",
      value: applications.length,
      icon: Send,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20"
    },
    {
      label: "Under Review",
      value: applications.filter(a => a.status === "under_review").length,
      icon: Clock,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/20"
    },
    {
      label: "Selected",
      value: applications.filter(a => a.status === "selected").length,
      icon: CheckCircle2,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20"
    },
    {
      label: "Rejected",
      value: applications.filter(a => a.status === "rejected").length,
      icon: XCircle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20"
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8"
    >
      {stats.map((stat, index) => (
        <motion.div 
          key={index}
          variants={item}
          className={`bg-[#141414] border border-[#242424] rounded-2xl p-6 relative overflow-hidden group hover:border-white/[0.12] transition-all duration-500`}
        >
          {/* Decorative background glow */}
          <div className={`absolute -right-6 -top-6 w-24 h-24 ${stat.bgColor} rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`}></div>
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bgColor} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              {/* Fake trend arrow for UI appeal */}
              <div className={`flex items-center text-xs font-medium ${stat.value > 0 ? "text-green-400" : "text-textSecondary"}`}>
                {stat.value > 0 ? "+1" : "0"} <ArrowUpRight size={14} className="ml-0.5" />
              </div>
            </div>
            
            <div className="mt-auto">
              <h3 className="text-4xl font-black text-white mb-1">{stat.value}</h3>
              <p className="text-sm font-medium text-textSecondary">{stat.label}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
