"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, CheckCircle2, AlertTriangle, Info, Check } from "lucide-react";
import { useStudentData } from "@/components/providers/StudentDataProvider";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; bgClass: string; colorClass: string }> = {
  success: {
    icon: <CheckCircle2 size={15} strokeWidth={2} />,
    bgClass:    "bg-[#0ABE52]/10",
    colorClass: "text-[#0ABE52]",
  },
  warning: {
    icon: <AlertTriangle size={15} strokeWidth={2} />,
    bgClass:    "bg-[#EE8248]/10",
    colorClass: "text-[#EE8248]",
  },
  info: {
    icon: <Info size={15} strokeWidth={2} />,
    bgClass:    "bg-primary/10",
    colorClass: "text-primary",
  },
};

/** Map Firestore notification types to display config keys */
function getNotifType(n: any): 'success' | 'warning' | 'info' {
  const t = (n.type || n.status || '').toLowerCase();
  if (t.includes('success') || t.includes('selected') || t.includes('accepted') || t.includes('approved')) return 'success';
  if (t.includes('warn') || t.includes('deadline') || t.includes('overdue') || t.includes('expir')) return 'warning';
  return 'info';
}

export default function NotificationsDrawer({ isOpen, onClose }: Props) {
  const { notifications } = useStudentData();
  const notifList = Array.isArray(notifications) ? notifications : [];
  const unreadCount = notifList.filter((n: any) => !n.read && !n.isRead).length;

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="notifications-drawer-title"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[380px] bg-background border-l border-border shadow-2xl z-[51] flex flex-col transition-colors"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-[20px] py-[16px] border-b border-border h-[64px]">
              <div className="flex items-center gap-[8px]">
                <Bell size={16} className="text-primary" strokeWidth={1.8} />
                <span id="notifications-drawer-title" className="text-[15px] font-semibold text-foreground">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold text-primary-foreground bg-primary px-[6px] py-[1px] rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-[28px] h-[28px] flex items-center justify-center rounded-[6px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Close notifications"
              >
                <X size={15} strokeWidth={2} />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto py-[8px]">
              {notifList.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-[8px] py-[48px] text-center px-[24px]">
                  <Bell size={28} className="text-muted-foreground" />
                  <p className="text-[13px] font-semibold text-foreground">No notifications yet</p>
                  <p className="text-[12px] text-muted-foreground">You&apos;ll be notified about application updates, deadlines, and more.</p>
                </div>
              ) : (
                notifList.map((notif: any) => {
                  const type = getNotifType(notif);
                  const cfg = TYPE_CONFIG[type];
                  const isRead = notif.read || notif.isRead;
                  const dateStr = notif.createdAt?.toDate
                    ? notif.createdAt.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                    : notif.date || '';
                  return (
                    <div
                      key={notif.id}
                      className={`flex items-start gap-[12px] px-[16px] py-[14px] border-b border-border last:border-0 transition-colors hover:bg-muted/50 ${
                        !isRead ? "bg-muted/30" : ""
                      }`}
                    >
                      {/* Icon */}
                      <div
                        className={`w-[30px] h-[30px] rounded-full flex items-center justify-center shrink-0 mt-[1px] ${cfg.bgClass} ${cfg.colorClass}`}
                      >
                        {cfg.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-[8px]">
                          <p className={`text-[13px] font-semibold leading-snug ${isRead ? "text-muted-foreground" : "text-foreground"}`}>
                            {notif.title || notif.message || 'Notification'}
                          </p>
                          {!isRead && (
                            <div className="w-[6px] h-[6px] rounded-full bg-primary shrink-0 mt-[5px]" />
                          )}
                        </div>
                        {notif.message && notif.title && (
                          <p className="text-[12px] text-muted-foreground mt-[2px] leading-relaxed">
                            {notif.message}
                          </p>
                        )}
                        {dateStr && (
                          <p className="text-[10px] text-muted-foreground mt-[4px] opacity-70">{dateStr}</p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-[16px] py-[12px] border-t border-border flex items-center justify-between">
              <button className="flex items-center gap-[6px] text-[12px] font-medium text-primary hover:underline transition-colors">
                <Check size={12} strokeWidth={2.5} /> Mark all as read
              </button>
              <button className="text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors">
                View all
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
