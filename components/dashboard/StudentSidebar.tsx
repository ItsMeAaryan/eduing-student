"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Send, Building2, FileText, User, LogOut, Search } from "lucide-react";
import { logoutUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";

interface Props {
  studentName?: string;
  studentPhoto?: string;
}

export default function StudentSidebar({ studentName = "Student", studentPhoto }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const NAV_ITEMS = [
    { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
    { label: "Discover", href: "/student/discover", icon: Search },
    { label: "Profile", href: "/student/profile", icon: User },
  ];

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <>
      {/* Desktop Sidebar (hidden on md and below) */}
      <div className="hidden lg:flex flex-col fixed top-0 left-0 bottom-0 z-40 bg-[#0d0d0d] backdrop-blur-xl border-r border-[#242424] w-64 pt-6 pb-4 px-4 overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <Link href="/" className="text-2xl font-black tracking-tighter text-white">
            EDU<span className="text-primary">ING</span>
          </Link>
        </div>

        {/* User Profile */}
        <div 
          onClick={() => router.push('/student/profile')}
          className="flex items-center bg-[#141414] border border-[#242424] rounded-xl p-3 mb-8 cursor-pointer hover:bg-white/5 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden mr-3 shrink-0 relative">
            {studentPhoto ? (
              <Image src={studentPhoto} alt={studentName} fill className="object-cover" sizes="40px" />
            ) : (
              <span className="text-primary font-bold text-lg">{studentName.charAt(0)}</span>
            )}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-bold text-white truncate">{studentName}</h4>
            <span className="text-xs text-textSecondary">Student</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-grow space-y-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.label}
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]" 
                    : "text-textSecondary hover:bg-white/5 hover:text-white border border-transparent"
                }`}
              >
                <item.icon size={18} className="mr-3 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="pt-4 mt-4 border-t border-[#242424]">
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors border border-transparent hover:border-red-500/20"
          >
            <LogOut size={18} className="mr-3 shrink-0" />
            Logout
          </motion.button>
        </div>
      </div>

      {/* Mobile Bottom Tab Navigation (hidden on lg and above) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-xl border-t border-[#242424] pb-safe">
        <div className="flex justify-around items-center h-16 px-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.label}
                href={item.href}
                className="flex flex-col items-center justify-center w-16 h-full relative"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={`p-1.5 rounded-full transition-colors ${
                    isActive ? "text-primary" : "text-textSecondary"
                  }`}
                >
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </motion.div>
                {isActive && (
                  <motion.div 
                    layoutId="bottom-nav-indicator"
                    className="absolute bottom-1 w-1 h-1 rounded-full bg-primary"
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
