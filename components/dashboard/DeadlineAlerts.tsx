"use client";

import { Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { useStudentData } from "@/components/providers/StudentDataProvider";

export default function DeadlineAlerts() {
  const { uniqueApps, deadlines } = useStudentData();

  // Build deadline alerts from real application data and Firestore deadlines
  const alerts = useMemo(() => {
    const now = Date.now();
    const items: { id: string; universityName: string; programName: string; daysLeft: number; deadline: string; universityId: string }[] = [];

    // From applications that have a deadline field
    const safeApps = Array.isArray(uniqueApps) ? uniqueApps : [];
    safeApps.forEach((app: any) => {
      if (!app.deadline) return;
      const dl = new Date(app.deadline?.toDate ? app.deadline.toDate() : app.deadline);
      const daysLeft = Math.ceil((dl.getTime() - now) / 86400000);
      if (daysLeft < 0 || daysLeft > 30) return; // only show within 30 days
      items.push({
        id: app.id,
        universityName: app.universityName || 'University',
        programName: app.program || app.programName || '',
        daysLeft,
        deadline: dl.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        universityId: app.universityId || '',
      });
    });

    // From dedicated deadlines collection
    const safeDeadlines = Array.isArray(deadlines) ? deadlines : [];
    safeDeadlines.forEach((dl: any) => {
      const date = new Date(dl.date?.toDate ? dl.date.toDate() : dl.date);
      const daysLeft = Math.ceil((date.getTime() - now) / 86400000);
      if (daysLeft < 0 || daysLeft > 30) return;
      if (items.find(i => i.id === dl.id)) return; // deduplicate
      items.push({
        id: dl.id,
        universityName: dl.universityName || dl.title || 'Deadline',
        programName: dl.programName || dl.description || '',
        daysLeft,
        deadline: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        universityId: dl.universityId || '',
      });
    });

    return items.sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 5);
  }, [uniqueApps, deadlines]);

  return (
    <div className="bg-card/[0.02] border border-white/5 rounded-3xl p-6 h-fit">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-white flex items-center">
          <Clock size={18} className="text-orange-400 mr-2" />
          Upcoming Deadlines
        </h3>
      </div>

      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-[24px] text-center gap-[6px]">
            <Clock size={24} className="text-orange-400/40" />
            <p className="text-[13px] font-semibold text-white/60">No upcoming deadlines</p>
            <p className="text-[11px] text-white/30">Apply to universities to track deadlines here.</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} className="bg-card/5 border border-white/10 rounded-2xl p-4 hover:border-orange-500/30 transition-colors group">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-white text-sm">{alert.universityName}</h4>
                  {alert.programName && <p className="text-xs text-white/50">{alert.programName}</p>}
                </div>
                <span className={`px-2 py-1 rounded-md text-xs font-bold whitespace-nowrap border ${
                  alert.daysLeft <= 3
                    ? 'bg-red-500/10 text-red-400 border-red-500/20'
                    : alert.daysLeft <= 7
                    ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                    : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                }`}>
                  {alert.daysLeft === 0 ? 'Due Today' : `${alert.daysLeft} Days Left`}
                </span>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-white/40">Due: {alert.deadline}</span>
                {alert.universityId && (
                  <Link
                    href={`/student/universities/${alert.universityId}`}
                    className="text-xs font-semibold text-primary group-hover:text-blue-400 flex items-center transition-colors"
                  >
                    View <ArrowRight size={14} className="ml-1" />
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
