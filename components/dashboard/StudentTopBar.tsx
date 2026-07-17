"use client";
import { useMemo } from "react";
import { Search, Bell, User, HelpCircle, Plus } from "lucide-react";
import { useStudentData } from "@/components/providers/StudentDataProvider";
import Image from "next/image";
import { usePathname } from "next/navigation";

const TITLES: Record<string, string> = {
  "/student/dashboard":    "Dashboard",
  "/student/applications": "Applications",
  "/student/universities": "Universities",
  "/student/discover":     "Universities",
  "/student/documents":    "Documents",
  "/student/scholarships": "Scholarships",
  "/student/calendar":     "Planner",
  "/student/copilot":      "AI Copilot",
  "/student/career":       "AI Tools",
  "/student/interview":    "AI Tools",
  "/student/resume":       "Resume",
  "/student/sop":          "AI Tools",
  "/student/email":        "AI Tools",
  "/student/profile":      "Profile",
  "/student/settings":     "Settings",
  "/student/saved":        "Saved",
};

export default function StudentTopBar() {
  const { profile } = useStudentData();
  const pathname = usePathname();

  const title = useMemo(() => {
    for (const [key, val] of Object.entries(TITLES)) {
      if (pathname.startsWith(key)) return val;
    }
    return "Dashboard";
  }, [pathname]);

  return (
    /* h-[72px], px-[32px], border-[#EAECF0] — Aivox header exact */
    <header className="sticky top-0 z-30 h-[72px] bg-white border-b border-[#EAECF0] flex items-center justify-between px-[32px]">

      {/* Left: page title — 20px semibold */}
      <h1 className="text-[20px] font-semibold text-[#111827] leading-none tracking-[-0.01em]">{title}</h1>

      {/* Right cluster — gap-[12px] between each control for breathing room */}
      <div className="flex items-center gap-[12px]">

        {/* Need help: h-[34px] px-[14px] border rounded-[8px] 13px medium */}
        <button className="flex items-center gap-[6px] px-[14px] h-[34px] rounded-[8px] border border-[#EAECF0] bg-white text-[13px] font-medium text-[#374151] hover:bg-[#F9FAFB] transition-colors">
          <HelpCircle size={15} strokeWidth={1.8} className="text-[#6B7280]" />
          Need help
        </button>

        {/* Search: 34×34 square, border radius-[8px] */}
        <button className="w-[34px] h-[34px] flex items-center justify-center rounded-[8px] border border-[#EAECF0] bg-white text-[#6B7280] hover:bg-[#F9FAFB] transition-colors">
          <Search size={15} strokeWidth={1.8} />
        </button>

        {/* Bell: 34×34, red dot 8px */}
        <button className="w-[34px] h-[34px] flex items-center justify-center rounded-[8px] border border-[#EAECF0] bg-white text-[#6B7280] hover:bg-[#F9FAFB] transition-colors relative">
          <Bell size={15} strokeWidth={1.8} />
          <span className="absolute top-[7px] right-[7px] w-[7px] h-[7px] bg-[#EF4444] rounded-full border-[1.5px] border-white" />
        </button>

        {/* Profile avatar — single circle, links to profile */}
        <div className="w-[32px] h-[32px] rounded-full bg-[#EEF2FF] border border-[#EAECF0] overflow-hidden relative flex items-center justify-center cursor-pointer">
          {profile?.profilePhotoURL
            ? <Image src={profile.profilePhotoURL} alt="Avatar" fill className="object-cover" />
            : <User size={15} strokeWidth={1.8} className="text-[#4F6BFF]" />
          }
        </div>

        {/* + button: 32×32, circle, border */}
        <button className="w-[32px] h-[32px] flex items-center justify-center rounded-full border border-[#EAECF0] bg-white text-[#374151] hover:bg-[#F9FAFB] transition-colors">
          <Plus size={15} strokeWidth={2} />
        </button>

      </div>
    </header>
  );
}
