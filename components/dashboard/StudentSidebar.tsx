"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard, FileText, Building2, GraduationCap,
  Award, Calendar, Sparkles, User, Settings,
  BookOpen, PanelLeftClose, PanelLeftOpen, ChevronsUpDown, LogOut,
  Mic, FileEdit, Briefcase, Scale
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
    { label: "AI Copilot",    href: "/student/copilot",   icon: Sparkles  },
    { label: "Resume",        href: "/student/resume",    icon: BookOpen  },
    { label: "SOP Workspace", href: "/student/sop",       icon: FileEdit  },
    { label: "Interview Sim", href: "/student/interview", icon: Mic       },
    { label: "Career Advice", href: "/student/career",    icon: Briefcase },
    { label: "Compare",       href: "/student/compare",   icon: Scale     },
  ],
  "PREFERENCES": [
    { label: "Settings", href: "/student/settings", icon: Settings },
  ],
};

/** Full sidebar — visible on desktop (≥1024px) */
export default function StudentSidebar({
  isCollapsed,
  setIsCollapsed,
}: {
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
}) {
  const pathname = usePathname();
  const router   = useRouter();
  const { profile } = useStudentData();
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
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
        setLogoutConfirm(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  return (
    <>
      {/* ─── Desktop Sidebar ─────────────────────────────── */}
      <aside
        className={`hidden lg:flex flex-col fixed inset-y-0 left-0 z-50 bg-white border-r border-[#EAECF0] transition-all duration-300 ${
          isCollapsed ? "w-[64px]" : "w-[240px]"
        }`}
      >
        {/* ── LOGO ── h-[72px] matches header */}
        <div className="h-[72px] flex items-center justify-between px-[16px] shrink-0 border-b border-[#EAECF0]">
          <Link href="/student/dashboard" className="flex items-center gap-[10px] min-w-0">
            <div className="w-[28px] h-[28px] bg-[#111827] rounded-[7px] flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-[13px] leading-none">E</span>
            </div>
            {!isCollapsed && (
              <span className="text-[16px] font-semibold text-[#111827] tracking-tight truncate">EDUING</span>
            )}
          </Link>
          {/* Collapse toggle — now wired */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-[24px] h-[24px] flex items-center justify-center text-[#9CA3AF] hover:text-[#111827] transition-colors rounded-[4px] hover:bg-[#F3F4F6] shrink-0"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed
              ? <PanelLeftOpen  size={15} strokeWidth={1.8} />
              : <PanelLeftClose size={15} strokeWidth={1.8} />
            }
          </button>
        </div>

        {/* ── NAV ── */}
        <div className="flex-1 overflow-y-auto py-[4px] px-[8px]">
          {Object.entries(NAV).map(([section, items], sectionIdx) => (
            <div key={section}>
              {!isCollapsed && (
                <div className={`text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-[0.08em] px-[12px] mb-[4px] ${sectionIdx === 0 ? "mt-[16px]" : "mt-[24px]"}`}>
                  {section}
                </div>
              )}
              {sectionIdx > 0 && isCollapsed && (
                <div className="my-[8px] mx-[8px] h-px bg-[#F3F4F6]" />
              )}
              {items.map(item => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={isCollapsed ? item.label : undefined}
                    className={`flex items-center gap-[10px] h-[36px] mb-[1px] rounded-[8px] text-[13px] font-medium transition-colors ${
                      isCollapsed ? "px-[0px] justify-center" : "px-[12px]"
                    } ${
                      active
                        ? "bg-[#111827] text-white"
                        : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6]"
                    }`}
                  >
                    <Icon size={15} strokeWidth={active ? 2 : 1.7} className="shrink-0" />
                    {!isCollapsed && item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* ── ACCOUNT SECTION ── */}
        {!isCollapsed && (
          <div className="px-[12px] pb-[20px] shrink-0 relative" ref={menuRef}>

            {/* Dropdown menu — appears above the account card */}
            {menuOpen && (
              <div className="absolute bottom-[calc(100%-8px)] left-[12px] right-[12px] bg-white border border-[#EAECF0] rounded-[12px] shadow-[0_8px_24px_rgba(0,0,0,0.08)] overflow-hidden z-50 mb-[8px]">
                <Link
                  href="/student/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-[10px] px-[14px] h-[40px] text-[13px] font-medium text-[#374151] hover:bg-[#F9FAFB] transition-colors"
                >
                  <User size={14} strokeWidth={1.8} className="text-[#6B7280]" />
                  My Profile
                </Link>
                <Link
                  href="/student/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-[10px] px-[14px] h-[40px] text-[13px] font-medium text-[#374151] hover:bg-[#F9FAFB] transition-colors"
                >
                  <Settings size={14} strokeWidth={1.8} className="text-[#6B7280]" />
                  Settings
                </Link>
                <div className="h-px bg-[#F3F4F6] mx-[10px]" />
                {/* Logout with inline confirmation */}
                {logoutConfirm ? (
                  <div className="px-[14px] py-[10px] flex flex-col gap-[6px]">
                    <p className="text-[12px] text-[#374151] font-medium">Are you sure?</p>
                    <div className="flex items-center gap-[6px]">
                      <button
                        onClick={() => { setLogoutConfirm(false); setMenuOpen(false); handleLogout(); }}
                        className="flex-1 h-[28px] rounded-[6px] bg-[#EF4444] text-white text-[11px] font-semibold hover:bg-[#DC2626] transition-colors"
                      >
                        Yes, log out
                      </button>
                      <button
                        onClick={() => setLogoutConfirm(false)}
                        className="flex-1 h-[28px] rounded-[6px] border border-[#EAECF0] text-[11px] font-medium text-[#374151] hover:bg-[#F9FAFB] transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setLogoutConfirm(true)}
                    className="w-full flex items-center gap-[10px] px-[14px] h-[40px] text-[13px] font-medium text-[#EF4444] hover:bg-[#FEF2F2] transition-colors text-left"
                  >
                    <LogOut size={14} strokeWidth={1.8} />
                    Log Out
                  </button>
                )}
              </div>
            )}

            {/* Account card */}
            <div className="flex items-center gap-[10px] p-[10px] rounded-[10px] border border-[#EAECF0] bg-white hover:bg-[#F9FAFB] transition-colors cursor-pointer">
              <Link href="/student/profile" className="shrink-0" onClick={() => setMenuOpen(false)}>
                <div className="w-[34px] h-[34px] rounded-full bg-[#EEF2FF] flex items-center justify-center overflow-hidden relative">
                  {profile?.profilePhotoURL
                    ? <Image src={profile.profilePhotoURL} alt="Avatar" fill className="object-cover" />
                    : <User size={15} strokeWidth={1.8} className="text-[#4F6BFF]" />
                  }
                </div>
              </Link>

              <Link href="/student/profile" className="flex-1 min-w-0 flex flex-col justify-center" onClick={() => setMenuOpen(false)}>
                <div className="text-[13px] font-semibold text-[#111827] truncate leading-snug">
                  {profile?.fullName || profile?.firstName || "Student"}
                </div>
                <div className="text-[11px] text-[#9CA3AF] truncate leading-snug">
                  {(profile as any)?.email ?? "student@eduing.in"}
                </div>
              </Link>

              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(prev => !prev); setLogoutConfirm(false); }}
                className="shrink-0 text-[#9CA3AF] hover:text-[#374151] transition-colors p-[2px]"
                aria-label="Account menu"
              >
                <ChevronsUpDown size={14} strokeWidth={1.8} />
              </button>
            </div>
          </div>
        )}

        {/* Collapsed account avatar */}
        {isCollapsed && (
          <div className="px-[12px] pb-[20px] shrink-0 flex justify-center">
            <Link href="/student/profile" title="My Profile">
              <div className="w-[34px] h-[34px] rounded-full bg-[#EEF2FF] flex items-center justify-center overflow-hidden relative">
                {profile?.profilePhotoURL
                  ? <Image src={profile.profilePhotoURL} alt="Avatar" fill className="object-cover" />
                  : <User size={15} strokeWidth={1.8} className="text-[#4F6BFF]" />
                }
              </div>
            </Link>
          </div>
        )}
      </aside>

      {/* ─── Mobile Bottom Navigation ────────────────────── */}
      <MobileBottomNav pathname={pathname} />
    </>
  );
}

/** Mobile bottom tab bar — visible below 1024px */
const MOBILE_NAV = [
  { label: "Home",    href: "/student/dashboard",    icon: LayoutDashboard },
  { label: "Unis",    href: "/student/universities", icon: Building2       },
  { label: "Apps",    href: "/student/applications", icon: FileText        },
  { label: "AI",      href: "/student/copilot",      icon: Sparkles        },
  { label: "Profile", href: "/student/profile",      icon: User            },
];

function MobileBottomNav({ pathname }: { pathname: string }) {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-[#EAECF0] flex items-stretch h-[60px] safe-area-inset-bottom">
      {MOBILE_NAV.map(item => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex-1 flex flex-col items-center justify-center gap-[3px] transition-colors"
            aria-label={item.label}
            aria-current={active ? "page" : undefined}
          >
            <Icon
              size={20}
              strokeWidth={active ? 2.2 : 1.7}
              className={`transition-colors ${active ? "text-[#4F6BFF]" : "text-[#9CA3AF]"}`}
            />
            <span className={`text-[10px] font-semibold ${active ? "text-[#4F6BFF]" : "text-[#9CA3AF]"}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
