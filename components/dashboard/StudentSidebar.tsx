"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Home, BookOpen, Building2, Sparkles, User,
  FileText, GraduationCap, Award, Calendar,
  Search, Bookmark, BarChart2,
  Briefcase, Mic, PenTool, Mail,
  ChevronDown, ChevronRight, LogOut
} from "lucide-react";
import { logoutUser } from "@/lib/firebase/auth";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  studentName?: string;
  studentPhoto?: string;
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}

export default function StudentSidebar({ isCollapsed, setIsCollapsed }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'Admissions': false,
    'Universities': false,
    'AI': false,
    'Account': false,
  });

  const toggleGroup = (title: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const NAVIGATION = [
    {
      title: "Home",
      href: "/student/dashboard",
      icon: Home,
      type: "link"
    },
    {
      title: "Admissions",
      icon: BookOpen,
      type: "group",
      items: [
        { label: "Applications", href: "/student/applications", icon: FileText },
        { label: "Documents", href: "/student/documents", icon: GraduationCap },
        { label: "Scholarships", href: "/student/scholarships", icon: Award },
        { label: "Calendar", href: "/student/calendar", icon: Calendar },
      ]
    },
    {
      title: "Universities",
      icon: Building2,
      type: "group",
      items: [
        { label: "Discover", href: "/student/discover", icon: Search },
        { label: "Saved", href: "/student/saved", icon: Bookmark },
        { label: "Compare", href: "/student/compare", icon: BarChart2 },
      ]
    },
    {
      title: "AI",
      icon: Sparkles,
      type: "group",
      items: [
        { label: "Copilot", href: "/student/copilot", icon: Sparkles },
        { label: "Career Advisor", href: "/student/career", icon: Briefcase },
        { label: "Interview Coach", href: "/student/interview", icon: Mic },
        { 
          label: "Writing Tools", 
          type: "subgroup",
          items: [
            { label: "Resume Builder", href: "/student/resume", icon: PenTool },
            { label: "SOP Builder", href: "/student/sop", icon: FileText },
            { label: "Email Assistant", href: "/student/email", icon: Mail },
          ]
        }
      ]
    },
    {
      title: "Account",
      icon: User,
      type: "group",
      items: [
        { label: "Profile", href: "/student/profile", icon: User },
        { label: "Settings", href: "/student/settings", icon: LogOut }, // Simplified
      ]
    }
  ];

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const NavItem = ({ item, isSub = false }: { item: any, isSub?: boolean }) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
    const Icon = item.icon;

    return (
      <Link 
        href={item.href || '#'}
        className={`relative flex items-center h-10 px-3 my-1 rounded-xl transition-all duration-200 group ${
          isActive ? 'bg-white/[0.04]' : 'hover:bg-white/[0.02]'
        } ${isSub ? 'ml-6 h-9' : ''}`}
      >
        <div className={`flex items-center justify-center transition-colors duration-200 ${
          isActive ? 'text-[#6D5DF6]' : 'text-gray-400 group-hover:text-white'
        } mr-3`}>
          {Icon && <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />}
        </div>
        <div className={`flex-1 truncate text-sm transition-colors duration-200 ${
          isActive ? 'text-white font-medium' : 'text-gray-400 group-hover:text-white'
        }`}>
          {item.label || item.title}
        </div>
      </Link>
    );
  };

  return (
    <>
      <div className="hidden lg:flex flex-col fixed top-0 left-0 bottom-0 z-50 bg-[#09090B] border-r border-white/5 w-[260px]">
        {/* Header / Logo */}
        <div className="h-20 flex items-center px-6 shrink-0">
          <Link 
            href="/student/dashboard"
            className="flex items-center cursor-pointer"
          >
            <div className="w-8 h-8 bg-[#6D5DF6] rounded-xl flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="ml-3 text-white font-medium tracking-wide text-sm">
              EDUING
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-3 py-2">
          {NAVIGATION.map((navItem, idx) => {
            if (navItem.type === 'link') {
              return <NavItem key={idx} item={navItem} />;
            }
            
            const isExpanded = expandedGroups[navItem.title];
            const GroupIcon = navItem.icon;

            return (
              <div key={idx} className="mb-1">
                <button 
                  onClick={() => toggleGroup(navItem.title)}
                  className={`w-full flex items-center justify-between px-3 h-10 rounded-xl transition-all duration-200 group hover:bg-white/[0.02] ${
                    isExpanded ? 'bg-white/[0.02]' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`flex items-center justify-center mr-3 transition-colors duration-200 ${
                      isExpanded ? 'text-white' : 'text-gray-400 group-hover:text-white'
                    }`}>
                      <GroupIcon size={16} strokeWidth={2} />
                    </div>
                    <span className={`text-sm transition-colors duration-200 ${
                      isExpanded ? 'text-white font-medium' : 'text-gray-400 group-hover:text-white'
                    }`}>
                      {navItem.title}
                    </span>
                  </div>
                  <ChevronDown 
                    size={14} 
                    className={`text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                  />
                </button>
                
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col overflow-hidden"
                    >
                      {navItem.items?.map((subItem, subIdx) => {
                        if (subItem.type === 'subgroup') {
                          return (
                            <div key={subIdx} className="ml-9 mt-1 mb-1">
                              <div className="text-xs font-medium text-gray-500 mb-1 px-3 uppercase tracking-wider">
                                {subItem.label}
                              </div>
                              {subItem.items?.map((nestedItem, nestedIdx) => (
                                <NavItem key={nestedIdx} item={nestedItem} isSub={true} />
                              ))}
                            </div>
                          );
                        }
                        return <NavItem key={subIdx} item={subItem} isSub={true} />;
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 shrink-0">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center px-3 h-10 rounded-xl transition-all duration-200 group hover:bg-white/[0.02]"
          >
            <div className="flex items-center justify-center mr-3 text-gray-400 group-hover:text-red-400 transition-colors">
              <LogOut size={16} strokeWidth={2} />
            </div>
            <div className="text-sm text-gray-400 group-hover:text-red-400 transition-colors">
              Log Out
            </div>
          </button>
        </div>
      </div>
      
      {/* Mobile Nav - hidden for simplicity as per requirements to simplify completely, but keeping minimal version if needed. Since sidebar MUST NEVER scroll and fit inside viewport, we are keeping the Desktop version extremely clean. */}
    </>
  );
}
