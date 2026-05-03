"use client";

import { useState } from "react";
import { Application, TimelineEvent } from "@/types/application";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Send, Clock, Search, CheckCircle2, XCircle, FileText } from "lucide-react";
import Link from "next/link";

interface Props {
  application: Application;
}

const STATUS_CONFIG = {
  submitted: { label: "Submitted", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", icon: Send },
  under_review: { label: "Under Review", color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20", icon: Search },
  waitlisted: { label: "Waitlisted", color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20", icon: Clock },
  selected: { label: "Selected", color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", icon: XCircle }
};

// Generate a fake timeline for demo purposes if not present
const getTimeline = (app: Application): TimelineEvent[] => {
  if (app.timeline && app.timeline.length > 0) return app.timeline;

  const appliedDate = app.appliedAt?.toDate ? app.appliedAt.toDate() : new Date(app.appliedAt);
  const timeline: TimelineEvent[] = [
    { status: "submitted", date: appliedDate.toISOString(), message: "Application received by university." }
  ];

  if (app.status === "under_review" || app.status === "selected" || app.status === "rejected" || app.status === "waitlisted") {
    timeline.push({ 
      status: "under_review", 
      date: new Date(appliedDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(), 
      message: "Documents are being verified by the admissions team." 
    });
  }

  if (app.status === "selected" || app.status === "rejected" || app.status === "waitlisted") {
    timeline.push({ 
      status: app.status, 
      date: new Date(appliedDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), 
      message: app.status === "selected" ? "Congratulations! Offer letter generated." : "Final decision made."
    });
  }

  return timeline;
};

export default function ApplicationCard({ application }: Props) {
  const [expanded, setExpanded] = useState(false);
  const config = STATUS_CONFIG[application.status] || STATUS_CONFIG.submitted;
  const timeline = getTimeline(application);

  const formatDate = (dateValue: any) => {
    if (!dateValue) return "Recently";
    const date = dateValue.toDate ? dateValue.toDate() : new Date(dateValue);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden transition-all hover:border-white/10">
      
      {/* Card Header (Always visible) */}
      <div 
        className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
            {application.universityLogo ? (
              <img src={application.universityLogo} alt="Logo" className="w-full h-full object-cover rounded-xl" />
            ) : (
              <BuildingIcon name={application.universityName || "U"} />
            )}
          </div>
          <div>
            <h3 className="font-bold text-white text-lg leading-tight">{application.universityName || "Unknown University"}</h3>
            <p className="text-sm text-textSecondary">{application.programName}</p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto mt-2 sm:mt-0 border-t border-white/5 sm:border-t-0 pt-3 sm:pt-0">
          <div className="text-xs text-textSecondary">
            Applied: <span className="text-white font-medium">{formatDate(application.appliedAt)}</span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg border ${config.bg} ${config.color} ${config.border}`}>
              {config.label}
            </span>
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-textSecondary"
            >
              <ChevronDown size={18} />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Expanded Content (Timeline) */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-6 bg-black/20 border-t border-white/5">
              <h4 className="text-sm font-semibold text-white mb-6 flex items-center">
                <FileText size={16} className="text-primary mr-2" /> Application Timeline
              </h4>
              
              <div className="relative pl-6 space-y-8 before:absolute before:inset-y-0 before:left-2 before:w-px before:bg-white/10 before:ml-[3px]">
                {timeline.map((event, idx) => {
                  const evConfig = STATUS_CONFIG[event.status];
                  const isLast = idx === timeline.length - 1;
                  
                  return (
                    <div key={idx} className="relative">
                      {/* Timeline Dot */}
                      <div className={`absolute -left-[29px] w-4 h-4 rounded-full border-4 border-background ${isLast ? evConfig.bg : "bg-primary"} ${isLast ? evConfig.color : "text-primary"} flex items-center justify-center z-10`}>
                        {isLast ? <span className="w-2 h-2 rounded-full bg-current"></span> : null}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div>
                          <span className={`font-semibold text-sm ${isLast ? "text-white" : "text-gray-300"}`}>
                            {evConfig.label}
                          </span>
                          {event.message && (
                            <p className="text-xs text-textSecondary mt-1 leading-relaxed max-w-md">
                              {event.message}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-textSecondary whitespace-nowrap mt-1 sm:mt-0 font-medium">
                          {formatDate(event.date)}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Future state indicator if not finalized */}
                {application.status !== "selected" && application.status !== "rejected" && (
                  <div className="relative">
                    <div className="absolute -left-[29px] w-4 h-4 rounded-full border-4 border-background bg-white/10 z-10"></div>
                    <span className="font-medium text-sm text-textSecondary italic">
                      Final Decision Pending
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-end">
                <Link 
                  href={`/student/universities/${application.universityId}`}
                  className="px-4 py-2 text-sm font-medium text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors"
                >
                  View University Profile
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Helper for fake logo
function BuildingIcon({ name }: { name: string }) {
  return <span className="text-xl font-bold text-textSecondary">{name.substring(0, 2).toUpperCase()}</span>;
}
