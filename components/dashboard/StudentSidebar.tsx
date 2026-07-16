"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, Search, FileText, Building2, Calendar, 
  Bookmark, Settings, LogOut, GraduationCap,
  Command, Sparkles, Briefcase, Mail, Mic
} from "lucide-react";
import { logoutUser } from "@/lib/firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "@/components/Logo";

interface Props {
  studentName?: string;
  studentPhoto?: string;
}

export default function StudentSidebar({ studentName = "Student", studentPhoto }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const NAV_ITEMS = [
    { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard, shortcut: "D" },
    { label: "AI Copilot", href: "/student/copilot", icon: Sparkles, shortcut: "I" },
    { label: "Career Advisor", href: "/student/career", icon: Briefcase, shortcut: "W" },
    { label: "AI SOP Builder", href: "/student/sop", icon: FileText, shortcut: "S" },
    { label: "Resume Builder", href: "/student/resume", icon: FileText, shortcut: "R" },
    { label: "AI Email Assistant", href: "/student/email", icon: Mail, shortcut: "E" },
    { label: "AI Interview Coach", href: "/student/interview", icon: Mic, shortcut: "V" },
    { label: "Applications", href: "/student/applications", icon: FileText, shortcut: "A" },
    { label: "Discover", href: "/student/discover", icon: Search, shortcut: "F" },
    { label: "Universities", href: "/student/universities", icon: Building2, shortcut: "U" },
    { label: "Documents", href: "/student/documents", icon: GraduationCap, shortcut: "M" },
    { label: "Calendar", href: "/student/calendar", icon: Calendar, shortcut: "C" },
    { label: "Saved", href: "/student/saved", icon: Bookmark, shortcut: "S" },
  ];

  const BOTTOM_ITEMS = [
    { label: "Settings", href: "/student/settings", icon: Settings, shortcut: "," },
  ];

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const SidebarItem = ({ item, isBottom = false }: { item: any, isBottom?: boolean }) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
    const Icon = item.icon;
    const isHovered = hoveredItem === item.label;

    return (
      <Link 
        href={item.href}
        onMouseEnter={() => setHoveredItem(item.label)}
        onMouseLeave={() => setHoveredItem(null)}
        className="relative flex items-center justify-center w-12 h-12 mb-1 group"
      >
        {/* Active Background Glow */}
        {isActive && (
          <motion.div 
            layoutId="sidebar-active-bg"
            className="absolute inset-2 bg-indigo-500/10 rounded-xl"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
        
        {/* Hover Background */}
        {!isActive && (
          <div className="absolute inset-2 bg-white/[0.04] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        )}

        {/* Active Line Indicator */}
        {isActive && (
          <motion.div 
            layoutId="sidebar-active-indicator"
            className="absolute left-0 top-3 bottom-3 w-[3px] bg-indigo-500 rounded-r-full shadow-[0_0_12px_rgba(99,102,241,0.8)]"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}

        {/* Icon */}
        <div className={`relative z-10 transition-colors duration-300 ${isActive ? 'text-indigo-400' : 'text-white/40 group-hover:text-white'}`}>
          <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
        </div>

        {/* Floating Tooltip */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, x: -5, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -5, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute left-14 py-1.5 px-3 bg-[#1A1A24] border border-white/[0.08] text-white text-[12px] font-bold rounded-lg shadow-xl whitespace-nowrap z-50 flex items-center gap-3"
            >
              {item.label}
              {item.shortcut && (
                <span className="flex items-center text-[9px] text-white/40 font-mono tracking-widest bg-black/20 px-1 py-0.5 rounded">
                  <Command size={10} className="mr-0.5" /> {item.shortcut}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Link>
    );
  };

  return (
    <>
      <div className="hidden lg:flex flex-col fixed top-0 left-0 bottom-0 w-[72px] z-50 bg-[#08080B] border-r border-white/[0.04] py-6 items-center">
        {/* Logo */}
        <div 
          role="button"
          tabIndex={0}
          className="flex items-center justify-center w-12 h-12 mb-6 shrink-0 group cursor-pointer" 
          onClick={() => router.push('/student/dashboard')}
          onKeyDown={(e) => { if (e.key === 'Enter') router.push('/student/dashboard'); }}
        >
          <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.3)] group-hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] transition-all">
            <span className="text-white font-black text-lg">E</span>
          </div>
        </div>

        {/* Main Nav Items */}
        <nav className="flex-1 flex flex-col items-center w-full">
          {NAV_ITEMS.map((item) => (
            <SidebarItem key={item.label} item={item} />
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="flex flex-col items-center w-full pt-4 relative">
          <div className="absolute top-0 w-8 h-px bg-white/[0.06]" />
          
          {BOTTOM_ITEMS.map((item) => (
            <SidebarItem key={item.label} item={item} isBottom={true} />
          ))}

          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            onMouseEnter={() => setHoveredItem('Logout')}
            onMouseLeave={() => setHoveredItem(null)}
            className="relative flex items-center justify-center w-12 h-12 mt-1 group"
          >
            <div className="absolute inset-2 bg-red-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            <div className="relative z-10 text-white/40 group-hover:text-red-400 transition-colors duration-300">
              <LogOut size={20} strokeWidth={2} />
            </div>

            <AnimatePresence>
              {hoveredItem === 'Logout' && (
                <motion.div
                  initial={{ opacity: 0, x: -5, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -5, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute left-14 py-1.5 px-3 bg-[#1A1A24] border border-white/[0.08] text-white text-[12px] font-bold rounded-lg shadow-xl whitespace-nowrap z-50 flex items-center gap-3"
                >
                  Logout
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#08080B]/90 backdrop-blur-2xl border-t border-white/[0.04] pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="flex justify-around items-center h-16 px-2">
          {NAV_ITEMS.slice(0, 5).map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link 
                key={item.label}
                href={item.href}
                className="flex flex-col items-center justify-center w-16 h-full relative group"
              >
                <motion.div 
                  whileTap={{ scale: 0.9 }}
                  className={`p-2 transition-colors duration-300 ${isActive ? "text-indigo-400" : "text-white/40 group-hover:text-white"}`}
                >
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </motion.div>
                {isActive && (
                  <motion.div 
                    layoutId="mobile-nav-indicator"
                    className="absolute top-0 w-8 h-1 rounded-b-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
