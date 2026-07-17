"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard, FileText, Building2, GraduationCap,
  Award, Calendar, Sparkles, User, Settings,
  BookOpen, PanelLeftClose, ChevronsUpDown, LogOut, ChevronRight
} from "lucide-react";
import { logoutUser } from "@/lib/firebase/auth";
import { useStudentData } from "@/components/providers/StudentDataProvider";
import Image from "next/image";

const NAV = {
  "MAIN MENU": [
    { label: "Dashboard",    href: "/student/dashboard",    icon: LayoutDashboard },
    { label: "Applications", href: "/student/applications", icon: FileText        },
    { label: "Universities", href: "/student/universities", icon: Building2       },
    { label: "Documents",    href: "/student/documents",    icon: GraduationCap   },
    { label: "Scholarships", href: "/student/scholarships", icon: Award           },
    { label: "Planner",      href: "/student/calendar",     icon: Calendar        },
  ],
  "AI TOOLS": [
    { label: "AI Copilot",   href: "/student/copilot",  icon: Sparkles },
    { label: "Resume",       href: "/student/resume",   icon: BookOpen },
  ],
  "PREFERENCES": [
    { label: "Settings",     href: "/student/settings", icon: Settings },
  ],
};

export default function StudentSidebar({ isCollapsed, setIsCollapsed }: { isCollapsed: boolean; setIsCollapsed: (v: boolean) => void }) {
  const pathname = usePathname();
  const router   = useRouter();
  const { profile } = useStudentData();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try { await logoutUser(); router.push("/auth/login"); }
    catch {}
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  return (
    <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 z-50 w-[240px] bg-white border-r border-[#EAECF0]">

      {/* ── LOGO ── h-[72px] matches header */}
      <div className="h-[72px] flex items-center justify-between px-[20px] shrink-0 border-b border-[#EAECF0]">
        <Link href="/student/dashboard" className="flex items-center gap-[10px]">
          <div className="w-[28px] h-[28px] bg-[#111827] rounded-[7px] flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-[13px] leading-none">E</span>
          </div>
          <span className="text-[16px] font-semibold text-[#111827] tracking-tight">EDUING</span>
        </Link>
        <button className="w-[24px] h-[24px] flex items-center justify-center text-[#9CA3AF] hover:text-[#111827] transition-colors rounded-[4px] hover:bg-[#F3F4F6]">
          <PanelLeftClose size={15} strokeWidth={1.8} />
        </button>
      </div>

      {/* ── NAV ── */}
      <div className="flex-1 overflow-y-auto py-[4px] px-[8px]">
        {Object.entries(NAV).map(([section, items], sectionIdx) => (
          <div key={section}>
            <div className={`text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-[0.08em] px-[12px] mb-[4px] ${sectionIdx === 0 ? 'mt-[16px]' : 'mt-[24px]'}`}>
              {section}
            </div>
            {items.map(item => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-[10px] h-[36px] px-[12px] mb-[1px] rounded-[8px] text-[13.5px] font-medium transition-colors ${
                    active
                      ? "bg-[#111827] text-white"
                      : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6]"
                  }`}
                >
                  <Icon size={15} strokeWidth={active ? 2 : 1.7} className="shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* ── ACCOUNT SECTION ── */}
      <div className="px-[12px] pb-[20px] shrink-0 relative" ref={menuRef}>

        {/* Dropdown menu — appears above the account card */}
        {menuOpen && (
          <div className="absolute bottom-[calc(100%-8px)] left-[12px] right-[12px] bg-white border border-[#EAECF0] rounded-[12px] shadow-[0_8px_24px_rgba(0,0,0,0.08)] overflow-hidden z-50 mb-[8px]">
            <Link
              href="/student/profile"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-[10px] px-[14px] h-[40px] text-[13.5px] font-medium text-[#374151] hover:bg-[#F9FAFB] transition-colors"
            >
              <User size={14} strokeWidth={1.8} className="text-[#6B7280]" />
              My Profile
            </Link>
            <Link
              href="/student/settings"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-[10px] px-[14px] h-[40px] text-[13.5px] font-medium text-[#374151] hover:bg-[#F9FAFB] transition-colors"
            >
              <Settings size={14} strokeWidth={1.8} className="text-[#6B7280]" />
              Settings
            </Link>
            <div className="h-px bg-[#F3F4F6] mx-[10px]" />
            <button
              onClick={() => { setMenuOpen(false); handleLogout(); }}
              className="w-full flex items-center gap-[10px] px-[14px] h-[40px] text-[13.5px] font-medium text-[#EF4444] hover:bg-[#FEF2F2] transition-colors text-left"
            >
              <LogOut size={14} strokeWidth={1.8} />
              Log Out
            </button>
          </div>
        )}

        {/* Account card — clicking opens Profile, arrow toggles dropdown */}
        <div className="flex items-center gap-[10px] p-[10px] rounded-[10px] border border-[#EAECF0] bg-white hover:bg-[#F9FAFB] transition-colors cursor-pointer group">
          {/* Avatar — clicking goes to profile */}
          <Link href="/student/profile" className="shrink-0" onClick={() => setMenuOpen(false)}>
            <div className="w-[34px] h-[34px] rounded-full bg-[#EEF2FF] flex items-center justify-center overflow-hidden relative">
              {profile?.profilePhotoURL
                ? <Image src={profile.profilePhotoURL} alt="Avatar" fill className="object-cover" />
                : <User size={15} strokeWidth={1.8} className="text-[#4F6BFF]" />
              }
            </div>
          </Link>

          {/* Name + email — clicking goes to profile */}
          <Link href="/student/profile" className="flex-1 min-w-0 flex flex-col justify-center" onClick={() => setMenuOpen(false)}>
            <div className="text-[13px] font-semibold text-[#111827] truncate leading-snug">
              {profile?.fullName || profile?.firstName || "Student"}
            </div>
            <div className="text-[11px] text-[#9CA3AF] truncate leading-snug">
              {(profile as any)?.email ?? "student@eduing.in"}
            </div>
          </Link>

          {/* Dropdown arrow — toggles menu */}
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen(prev => !prev); }}
            className="shrink-0 text-[#9CA3AF] hover:text-[#374151] transition-colors p-[2px]"
            aria-label="Account menu"
          >
            <ChevronsUpDown size={14} strokeWidth={1.8} />
          </button>
        </div>

      </div>
    </aside>
  );
}
