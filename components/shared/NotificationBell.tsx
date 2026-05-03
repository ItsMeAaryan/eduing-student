"use client";

import { useState, useEffect, useRef } from "react";
import { AppNotification } from "@/types/notification";
import { Bell, Check, Clock, Send, ShieldAlert, AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Mock notifications for demo
    const mockNotifs: AppNotification[] = [
      {
        id: '1',
        userId: 'demo',
        title: 'Welcome to EDUING',
        message: 'Your account has been successfully created.',
        type: 'approval',
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        userId: 'demo',
        title: 'Application Status',
        message: 'Your application to Stanford University is under review.',
        type: 'status_update',
        isRead: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      }
    ];
    setNotifications(mockNotifs);
  }, []);

  // Close drawer when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = (notifId: string) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, isRead: true } : n));
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const getTimeAgo = (timestamp: any) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'status_update': return <Clock size={16} className="text-yellow-500" />;
      case 'application_submitted': return <Send size={16} className="text-blue-500" />;
      case 'approval': return <ShieldAlert size={16} className="text-green-500" />;
      case 'deadline_alert': return <AlertTriangle size={16} className="text-orange-500" />;
      default: return <Bell size={16} className="text-primary" />;
    }
  };

  return (
    <div className="relative">
      
      {/* Bell Trigger */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-textSecondary hover:text-white hover:bg-white/5 rounded-full transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-background"></span>
        )}
      </button>

      {/* Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            ></motion.div>
            
            <motion.div 
              ref={drawerRef}
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-sm h-full bg-background border-l border-white/10 shadow-2xl flex flex-col z-10"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/[0.02]">
                <h2 className="text-lg font-bold text-white flex items-center">
                  Notifications
                  {unreadCount > 0 && <span className="ml-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{unreadCount} New</span>}
                </h2>
                <div className="flex items-center gap-2">
                  <button onClick={handleMarkAllRead} className="text-xs text-primary hover:text-blue-400 font-medium" title="Mark all as read">
                    <Check size={16} />
                  </button>
                  <button onClick={() => setIsOpen(false)} className="p-1 text-textSecondary hover:text-white rounded-md">
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="flex-grow overflow-y-auto custom-scrollbar p-2">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-center">
                    <Bell size={32} className="text-white/10 mb-2" />
                    <p className="text-sm text-textSecondary">No notifications yet.</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
                      className={`mb-2 p-4 rounded-xl border transition-colors cursor-pointer relative overflow-hidden group ${
                        notif.isRead 
                          ? "bg-transparent border-transparent hover:bg-white/5" 
                          : "bg-white/[0.04] border-white/10 hover:border-white/20"
                      }`}
                    >
                      {!notif.isRead && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                      )}
                      
                      <div className="flex gap-3">
                        <div className="shrink-0 mt-1">
                          {getIcon(notif.type)}
                        </div>
                        <div>
                          <div className="flex justify-between items-start gap-2 mb-1">
                            <h4 className={`text-sm ${notif.isRead ? "text-gray-300 font-medium" : "text-white font-bold"}`}>
                              {notif.title}
                            </h4>
                            <span className="text-[10px] text-textSecondary whitespace-nowrap mt-0.5">{getTimeAgo(notif.createdAt)}</span>
                          </div>
                          <p className={`text-xs leading-relaxed ${notif.isRead ? "text-textSecondary" : "text-gray-300"}`}>
                            {notif.message}
                          </p>
                          
                          {notif.link && (
                            <Link href={notif.link} onClick={() => setIsOpen(false)} className="inline-block mt-2 text-xs font-semibold text-primary hover:text-blue-400">
                              View details →
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
