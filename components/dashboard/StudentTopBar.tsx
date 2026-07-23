"use client";
import { useMemo, useState, useEffect, useRef } from "react";
import { Search, Bell, HelpCircle, Plus, X, Building2, BookOpen, GraduationCap, Award, LayoutDashboard, FileText, Mic } from "lucide-react";
import { useStudentData } from "@/components/providers/StudentDataProvider";
import { usePathname, useRouter } from "next/navigation";
import NotificationsDrawer from "@/components/dashboard/NotificationsDrawer";
import Link from "next/link";

const TITLES: Record<string, string> = {
  "/student/dashboard":    "Dashboard",
  "/student/applications": "Applications",
  "/student/universities": "Universities",
  "/student/discover":     "Universities",
  "/student/documents":    "Documents",
  "/student/scholarships": "Scholarships",
  "/student/calendar":     "Planner",
  "/student/copilot":      "AI Copilot",
  "/student/career":       "Career Advisor",
  "/student/interview":    "Interview Simulator",
  "/student/resume":       "Resume Builder",
  "/student/sop":          "SOP Workspace",
  "/student/email":        "Email Assistant",
  "/student/profile":      "Profile",
  "/student/settings":     "Settings",
  "/student/saved":        "Saved",
  "/student/compare":      "Compare Universities",
};

// Quick navigation items for command palette
const QUICK_LINKS = [
  { label: "Dashboard",         href: "/student/dashboard",    icon: LayoutDashboard, desc: "Overview of your activity" },
  { label: "Universities",      href: "/student/universities", icon: Building2,       desc: "Discover and compare universities" },
  { label: "Applications",      href: "/student/applications", icon: FileText,        desc: "Track your application pipeline" },
  { label: "Documents",         href: "/student/documents",    icon: GraduationCap,   desc: "Manage your academic documents" },
  { label: "Scholarships",      href: "/student/scholarships", icon: Award,           desc: "Find scholarships you qualify for" },
  { label: "Resume Builder",    href: "/student/resume",       icon: BookOpen,        desc: "AI-powered resume builder" },
];

/** Light-themed command palette search modal */
function SearchModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filtered = query.trim()
    ? QUICK_LINKS.filter(l =>
        l.label.toLowerCase().includes(query.toLowerCase()) ||
        l.desc.toLowerCase().includes(query.toLowerCase())
      )
    : QUICK_LINKS;

  const handleSelect = (href: string) => {
    router.push(href);
    onClose();
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[120px] px-4">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close modal backdrop"
        className="absolute inset-0 bg-black/20 backdrop-blur-sm border-0 cursor-default"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette search"
        className="relative w-full max-w-[540px] bg-white border border-[#EAECF0] rounded-[16px] shadow-[0_20px_60px_rgba(0,0,0,0.12)] overflow-hidden"
      >
        {/* Search input */}
        <div className="flex items-center gap-[10px] px-[16px] py-[14px] border-b border-[#F3F4F6]">
          <Search size={16} className="text-[#9CA3AF] shrink-0" strokeWidth={1.8} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search universities, applications, documents..."
            className="flex-1 text-[14px] text-[#111827] placeholder:text-[#9CA3AF] outline-none bg-transparent"
          />
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#6B7280] transition-colors" aria-label="Close search">
            <X size={16} strokeWidth={1.8} />
          </button>
        </div>

        {/* Results */}
        <div className="py-[8px] max-h-[320px] overflow-y-auto">
          {query.trim() && filtered.length === 0 ? (
            <div className="py-[32px] text-center text-[13px] text-[#9CA3AF]">No results for &ldquo;{query}&rdquo;</div>
          ) : (
            <>
              <p className="px-[16px] pt-[4px] pb-[8px] text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-[0.08em]">
                {query.trim() ? "Results" : "Quick Navigation"}
              </p>
              {filtered.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.href}
                    onClick={() => handleSelect(item.href)}
                    className="w-full flex items-center gap-[12px] px-[16px] py-[10px] hover:bg-[#F9FAFB] transition-colors text-left"
                  >
                    <div className="w-[32px] h-[32px] rounded-[8px] bg-[#EEF2FF] flex items-center justify-center shrink-0">
                      <Icon size={14} className="text-[#4F6BFF]" strokeWidth={1.8} />
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-[#111827]">{item.label}</p>
                      <p className="text-[11px] text-[#9CA3AF]">{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-[16px] py-[10px] border-t border-[#F3F4F6] flex items-center gap-[16px]">
          <span className="text-[11px] text-[#9CA3AF]">
            <kbd className="px-[5px] py-[1px] rounded-[4px] bg-[#F3F4F6] text-[10px] font-medium">↵</kbd> to select
          </span>
          <span className="text-[11px] text-[#9CA3AF]">
            <kbd className="px-[5px] py-[1px] rounded-[4px] bg-[#F3F4F6] text-[10px] font-medium">Esc</kbd> to close
          </span>
        </div>
      </div>
    </div>
  );
}

export default function StudentTopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const title = useMemo(() => {
    for (const [key, val] of Object.entries(TITLES)) {
      if (pathname.startsWith(key)) return val;
    }
    return "Dashboard";
  }, [pathname]);

  // Global ⌘K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(v => !v);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 h-[72px] bg-white border-b border-[#EAECF0] flex items-center justify-between px-[32px]">

        {/* Left: page title */}
        <h1 className="text-[20px] font-semibold text-[#111827] leading-none tracking-[-0.01em]">{title}</h1>

        {/* Right cluster */}
        <div className="flex items-center gap-[10px]">

          {/* Need help */}
          <a
            href="mailto:support@eduing.in"
            className="hidden sm:flex items-center gap-[6px] px-[14px] h-[34px] rounded-[8px] border border-[#EAECF0] bg-white text-[13px] font-medium text-[#374151] hover:bg-[#F9FAFB] transition-colors"
            aria-label="Get help"
          >
            <HelpCircle size={15} strokeWidth={1.8} className="text-[#6B7280]" />
            Need help
          </a>

          {/* Search — opens command palette */}
          <button
            onClick={() => setSearchOpen(true)}
            className="w-[34px] h-[34px] flex items-center justify-center rounded-[8px] border border-[#EAECF0] bg-white text-[#6B7280] hover:bg-[#F9FAFB] transition-colors"
            aria-label="Search (⌘K)"
            title="Search (⌘K)"
          >
            <Search size={15} strokeWidth={1.8} />
          </button>

          {/* Notification bell — wired to NotificationsDrawer */}
          <button
            onClick={() => setNotifOpen(true)}
            className="w-[34px] h-[34px] flex items-center justify-center rounded-[8px] border border-[#EAECF0] bg-white text-[#6B7280] hover:bg-[#F9FAFB] transition-colors relative"
            aria-label="Notifications"
          >
            <Bell size={15} strokeWidth={1.8} />
            {/* Show indicator — will be driven by real unread count later */}
            <span className="absolute top-[7px] right-[7px] w-[7px] h-[7px] bg-[#EF4444] rounded-full border-[1.5px] border-white" />
          </button>

          {/* + New Application — wired to universities */}
          <Link
            href="/student/universities"
            className="w-[34px] h-[34px] flex items-center justify-center rounded-[8px] border border-[#EAECF0] bg-white text-[#374151] hover:bg-[#F9FAFB] transition-colors"
            aria-label="New Application"
            title="New Application"
          >
            <Plus size={15} strokeWidth={2} />
          </Link>

        </div>
      </header>

      {/* Notification Drawer — light-theme wrapper */}
      <NotificationsDrawer isOpen={notifOpen} onClose={() => setNotifOpen(false)} />

      {/* Command Palette */}
      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
    </>
  );
}
