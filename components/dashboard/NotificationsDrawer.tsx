"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, CheckCircle2, AlertTriangle, Info, Check } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const MOCK_NOTIFICATIONS = [
  {
    id: "1",
    type: "success",
    title: "Application Selected",
    message: "Congratulations! You have been selected for B.Tech CS at Delhi University.",
    date: "2 hours ago",
    read: false
  },
  {
    id: "2",
    type: "info",
    title: "Application Under Review",
    message: "Your application for MBA at IIM Bangalore is now under review.",
    date: "1 day ago",
    read: false
  },
  {
    id: "3",
    type: "warning",
    title: "Deadline Approaching",
    message: "Only 3 days left to apply for M.Tech at IIT Bombay.",
    date: "2 days ago",
    read: true
  },
];

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; bg: string; color: string }> = {
  success: {
    icon: <CheckCircle2 size={15} strokeWidth={2} />,
    bg:    "#F0FDF4",
    color: "#059669",
  },
  warning: {
    icon: <AlertTriangle size={15} strokeWidth={2} />,
    bg:    "#FFFBEB",
    color: "#D97706",
  },
  info: {
    icon: <Info size={15} strokeWidth={2} />,
    bg:    "#EEF2FF",
    color: "#4F6BFF",
  },
};

export default function NotificationsDrawer({ isOpen, onClose }: Props) {
  const unreadCount = MOCK_NOTIFICATIONS.filter(n => !n.read).length;

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
            className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-50"
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
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[380px] bg-white border-l border-[#EAECF0] shadow-[0_0_40px_rgba(0,0,0,0.10)] z-[51] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-[20px] py-[16px] border-b border-[#EAECF0] h-[64px]">
              <div className="flex items-center gap-[8px]">
                <Bell size={16} className="text-[#4F6BFF]" strokeWidth={1.8} />
                <span id="notifications-drawer-title" className="text-[15px] font-semibold text-[#111827]">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold text-white bg-[#4F6BFF] px-[6px] py-[1px] rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-[28px] h-[28px] flex items-center justify-center rounded-[6px] text-[#9CA3AF] hover:text-[#374151] hover:bg-[#F3F4F6] transition-colors"
                aria-label="Close notifications"
              >
                <X size={15} strokeWidth={2} />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto py-[8px]">
              {MOCK_NOTIFICATIONS.map((notif) => {
                const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.info;
                return (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-[12px] px-[16px] py-[14px] border-b border-[#F3F4F6] last:border-0 transition-colors hover:bg-[#F9FAFB] ${
                      !notif.read ? "bg-[#FAFBFF]" : ""
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className="w-[30px] h-[30px] rounded-full flex items-center justify-center shrink-0 mt-[1px]"
                      style={{ backgroundColor: cfg.bg, color: cfg.color }}
                    >
                      {cfg.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-[8px]">
                        <p className={`text-[13px] font-semibold leading-snug ${notif.read ? "text-[#374151]" : "text-[#111827]"}`}>
                          {notif.title}
                        </p>
                        {!notif.read && (
                          <div className="w-[6px] h-[6px] rounded-full bg-[#4F6BFF] shrink-0 mt-[5px]" />
                        )}
                      </div>
                      <p className="text-[12px] text-[#6B7280] mt-[2px] leading-relaxed">
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-[#9CA3AF] mt-[4px]">{notif.date}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-[16px] py-[12px] border-t border-[#EAECF0] flex items-center justify-between">
              <button className="flex items-center gap-[6px] text-[12px] font-medium text-[#4F6BFF] hover:underline transition-colors">
                <Check size={12} strokeWidth={2.5} /> Mark all as read
              </button>
              <button className="text-[12px] font-medium text-[#9CA3AF] hover:text-[#374151] transition-colors">
                View all
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
