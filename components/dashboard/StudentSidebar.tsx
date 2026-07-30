"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard, FileText, Building2, GraduationCap,
  Award, Calendar, Sparkles, User, Settings,
  BookOpen, PanelLeftClose, PanelLeftOpen, ChevronsUpDown, LogOut,
  Mic, FileEdit, Briefcase
} from "lucide-react";
import { logoutUser } from "@/lib/firebase/auth";
import { useStudentData } from "@/components/providers/StudentDataProvider";
import Image from "next/image";
import UserAccountMenu from "./UserAccountMenu";
import LogoutConfirmModal from "./LogoutConfirmModal";
import { useToast } from "@/hooks/useToast";

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
  const { toast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try { 
      setIsLoggingOut(true);
      await logoutUser(); 
      toast.success('Successfully logged out.');
      router.push("/auth/login"); 
    } catch {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* ─── Desktop Sidebar ─────────────────────────────── */}
      <aside
        className={`hidden lg:flex flex-col fixed inset-y-0 left-0 z-50 bg-background border-r border-border transition-all duration-300 ${
          isCollapsed ? "w-[64px]" : "w-[240px]"
        }`}
      >
        {/* ── LOGO ── h-[72px] matches header */}
        <div className="h-[72px] flex items-center justify-between px-[16px] shrink-0 border-b border-border">
          <Link href="/student/dashboard" className="flex items-center gap-[10px] min-w-0">
            <div className="w-[28px] h-[28px] bg-foreground rounded-[7px] flex items-center justify-center shrink-0">
              <span className="text-background font-bold text-[13px] leading-none">E</span>
            </div>
            {!isCollapsed && (
              <span className="text-[16px] font-semibold text-foreground tracking-tight truncate">EDUING</span>
            )}
          </Link>
          {/* Collapse toggle — now wired */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-[24px] h-[24px] flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors rounded-[4px] hover:bg-muted shrink-0"
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
                <div className={`text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.08em] px-[12px] mb-[4px] ${sectionIdx === 0 ? "mt-[16px]" : "mt-[24px]"}`}>
                  {section}
                </div>
              )}
              {sectionIdx > 0 && isCollapsed && (
                <div className="my-[8px] mx-[8px] h-px bg-border" />
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
                        ? "bg-secondary text-secondary-foreground font-semibold shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
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
          <div className="px-[12px] pb-[20px] shrink-0 relative">
            
            <UserAccountMenu 
              isOpen={menuOpen} 
              onClose={() => setMenuOpen(false)} 
              onLogoutClick={() => setLogoutConfirmOpen(true)}
              profile={profile}
            />

            {/* Account card */}
            <button 
              onClick={() => setMenuOpen(prev => !prev)}
              className="w-full flex items-center gap-[10px] p-[10px] rounded-[10px] border border-border bg-card hover:bg-muted hover:shadow-sm transition-all duration-180 cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <div className="shrink-0">
                <div className="w-[34px] h-[34px] rounded-full bg-primary/10 flex items-center justify-center overflow-hidden relative">
                  {profile?.profilePhotoURL
                    ? <Image src={profile.profilePhotoURL} alt="Avatar" fill className="object-cover" />
                    : <User size={15} strokeWidth={1.8} className="text-primary" />
                  }
                </div>
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="text-[13px] font-semibold text-foreground truncate leading-snug">
                  {profile?.fullName || profile?.firstName || "Student"}
                </div>
                <div className="text-[11px] text-muted-foreground truncate leading-snug">
                  {(profile as any)?.email ?? "student@eduing.in"}
                </div>
              </div>

              <div className="shrink-0 text-muted-foreground hover:text-foreground transition-colors p-[2px]">
                <ChevronsUpDown size={14} strokeWidth={1.8} />
              </div>
            </button>
          </div>
        )}

        {/* Collapsed account avatar */}
        {isCollapsed && (
          <div className="px-[12px] pb-[20px] shrink-0 flex justify-center relative">
            <UserAccountMenu 
              isOpen={menuOpen} 
              onClose={() => setMenuOpen(false)} 
              onLogoutClick={() => setLogoutConfirmOpen(true)}
              profile={profile}
            />
            <button 
              onClick={() => setMenuOpen(prev => !prev)}
              className="w-[34px] h-[34px] rounded-full bg-primary/10 flex items-center justify-center overflow-hidden relative cursor-pointer hover:shadow-sm transition-all duration-180 focus:outline-none focus:ring-2 focus:ring-ring"
              title="Account Menu"
              aria-label="Account Menu"
            >
              {profile?.profilePhotoURL
                ? <Image src={profile.profilePhotoURL} alt="Avatar" fill className="object-cover" />
                : <User size={15} strokeWidth={1.8} className="text-primary" />
              }
            </button>
          </div>
        )}
      </aside>

      {/* Logout Modal */}
      <LogoutConfirmModal 
        isOpen={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
        onConfirm={handleLogout}
        isLoggingOut={isLoggingOut}
      />

      {/* ─── Mobile Bottom Navigation ────────────────────── */}
      <MobileBottomNav pathname={pathname} setMenuOpen={setMenuOpen} />
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

function MobileBottomNav({ pathname, setMenuOpen }: { pathname: string, setMenuOpen: (v: boolean) => void }) {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-background border-t border-border flex items-stretch h-[60px] safe-area-inset-bottom">
      {MOBILE_NAV.map(item => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        
        if (item.label === "Profile") {
          return (
            <button
              key={item.label}
              onClick={() => setMenuOpen(true)}
              className="flex-1 flex flex-col items-center justify-center gap-[3px] transition-colors"
              aria-label="Account menu"
            >
              <Icon
                size={20}
                strokeWidth={1.7}
                className="transition-colors text-muted-foreground"
              />
              <span className="text-[10px] font-semibold text-muted-foreground">
                Menu
              </span>
            </button>
          )
        }

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
              className={`transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}
            />
            <span className={`text-[10px] font-semibold ${active ? "text-primary" : "text-muted-foreground"}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
