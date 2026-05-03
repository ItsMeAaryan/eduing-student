"use client";

import Link from "next/link";
import { LayoutDashboard, Building2, Users, FileBarChart, Settings, LogOut, Menu, X, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function SuperAdminSidebar({ activeTab, setActiveTab }: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const NAV_ITEMS = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "universities", label: "Universities", icon: Building2 },
    { id: "students", label: "Students", icon: Users },
    { id: "reports", label: "Reports", icon: FileBarChart },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-black/90 backdrop-blur-xl border-r border-white/10 w-64 pt-6 pb-4 px-4 overflow-y-auto custom-scrollbar">
      
      {/* Brand */}
      <div className="flex flex-col items-center justify-center mb-8 pb-6 border-b border-white/10">
        <div className="w-12 h-12 bg-red-500/20 text-red-500 rounded-2xl flex items-center justify-center mb-3 border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
          <ShieldAlert size={24} />
        </div>
        <Link href="/" className="text-2xl font-black tracking-tighter text-white">
          EDU<span className="text-red-500">ING</span>
        </Link>
        <span className="text-[10px] font-bold text-red-400 uppercase tracking-[0.2em] mt-1 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
          Super Admin
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-grow space-y-2">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button 
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive 
                  ? "bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]" 
                  : "text-textSecondary hover:bg-white/5 hover:text-white border border-transparent"
              }`}
            >
              <item.icon size={18} className="mr-3 shrink-0" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="pt-4 mt-4 border-t border-white/10">
        <button 
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 rounded-xl text-sm font-medium text-textSecondary hover:bg-white/5 hover:text-white transition-colors border border-transparent"
        >
          <LogOut size={18} className="mr-3" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card border border-white/10 rounded-xl text-white shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
          <div className="absolute top-0 left-0 bottom-0 w-64 z-50">
            <SidebarContent />
          </div>
        </div>
      )}

      <div className="hidden lg:block fixed top-0 left-0 bottom-0 z-40">
        <SidebarContent />
      </div>
    </>
  );
}
