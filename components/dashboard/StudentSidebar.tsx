"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, Search, FileText, Building2, Calendar, 
  Bookmark, Settings, LogOut, GraduationCap
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
  const [expanded, setExpanded] = useState(false);

  const NAV_ITEMS = [
    { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
    { label: "Applications", href: "/student/applications", icon: FileText },
    { label: "Discover", href: "/student/discover", icon: Search },
    { label: "Universities", href: "/student/universities", icon: Building2 },
    { label: "Documents", href: "/student/documents", icon: GraduationCap },
    { label: "Calendar", href: "/student/calendar", icon: Calendar },
    { label: "Saved", href: "/student/saved", icon: Bookmark },
    { label: "Settings", href: "/student/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <>
      <motion.div 
        className="hidden lg:flex flex-col fixed top-5 left-5 bottom-5 z-50 bg-[#0A0A0C]/80 backdrop-blur-2xl border border-white/[0.05] rounded-[20px] py-6 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-colors duration-500 hover:bg-[#0A0A0C]/90"
        initial={{ width: 72 }}
        animate={{ width: expanded ? 230 : 72 }}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        transition={{ type: "spring", stiffness: 350, damping: 35 }}
      >
        <div className="flex items-center justify-start h-8 px-5 mb-8 shrink-0 overflow-hidden">
          <Logo height={24} />
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link 
                key={item.label}
                href={item.href}
                className="relative flex items-center h-[42px] rounded-lg text-[13px] font-medium transition-all duration-300 group"
              >
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active-bg"
                    className="absolute inset-0 bg-white/[0.05] rounded-lg shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] border border-white/[0.05]"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                {!isActive && (
                  <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                )}
                
                {/* Subtle active edge indicator */}
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active-bar"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-brand-indigoLight rounded-r-full shadow-[0_0_8px_rgba(79,70,229,0.6)]"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                <div className={`relative z-10 flex items-center justify-center w-12 h-full shrink-0 transition-colors duration-300 ${isActive ? "text-brand-indigoLight" : "text-white/40 group-hover:text-white/80"}`}>
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: isActive ? 0 : 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  </motion.div>
                </div>

                <AnimatePresence>
                  {expanded && (
                    <motion.span 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className={`whitespace-nowrap tracking-wide truncate pr-4 ${isActive ? "text-white font-semibold" : "text-white/60 group-hover:text-white/90"}`}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pt-4 mt-2 shrink-0 relative">
          <div className="absolute top-0 left-5 right-5 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
          <button 
            onClick={handleLogout}
            className="relative flex items-center h-[42px] w-full rounded-lg text-[13px] font-medium transition-colors group"
          >
            <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
            
            <div className="relative z-10 flex items-center justify-center w-12 h-full shrink-0 transition-colors duration-300 text-white/40 group-hover:text-red-400">
              <motion.div
                whileHover={{ scale: 1.1, rotate: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut size={18} />
              </motion.div>
            </div>

            <AnimatePresence>
              {expanded && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="whitespace-nowrap text-white/60 group-hover:text-red-400 tracking-wide pr-4"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.div>

      {/* Mobile Nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#08080B]/90 backdrop-blur-2xl border-t border-white/[0.08] pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
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
                  className={`p-1.5 transition-colors duration-300 ${isActive ? "text-brand-indigoLight" : "text-white/40 group-hover:text-white"}`}
                >
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </motion.div>
                {isActive && (
                  <motion.div 
                    layoutId="mobile-nav-indicator"
                    className="absolute top-0 w-8 h-1 rounded-b-full bg-brand-indigoLight shadow-[0_0_10px_rgba(79,70,229,0.8)]"
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
