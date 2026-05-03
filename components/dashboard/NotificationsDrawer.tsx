"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, CheckCircle, Info, AlertTriangle } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

// Mock notifications for UI demonstration
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
  }
];

export default function NotificationsDrawer({ isOpen, onClose }: Props) {
  
  const getIcon = (type: string) => {
    switch(type) {
      case "success": return <CheckCircle size={18} className="text-green-500" />;
      case "warning": return <AlertTriangle size={18} className="text-orange-500" />;
      case "info":
      default: return <Info size={18} className="text-blue-500" />;
    }
  };

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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          ></motion.div>

          {/* Drawer */}
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-96 bg-card border-l border-white/10 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-white/5">
              <div className="flex items-center">
                <Bell size={20} className="text-primary mr-2" />
                <h2 className="text-xl font-bold text-white">Notifications</h2>
              </div>
              <button onClick={onClose} className="text-textSecondary hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* List */}
            <div className="flex-grow overflow-y-auto custom-scrollbar p-6 space-y-4">
              {MOCK_NOTIFICATIONS.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`p-4 rounded-xl border transition-all ${
                    notif.read 
                      ? "bg-white/[0.02] border-white/5" 
                      : "bg-white/5 border-white/10 relative overflow-hidden"
                  }`}
                >
                  {!notif.read && (
                    <div className="absolute top-0 left-0 bottom-0 w-1 bg-primary"></div>
                  )}
                  <div className="flex items-start">
                    <div className="shrink-0 mr-3 mt-0.5">
                      {getIcon(notif.type)}
                    </div>
                    <div>
                      <h4 className={`font-semibold mb-1 ${notif.read ? "text-gray-300" : "text-white"}`}>
                        {notif.title}
                      </h4>
                      <p className="text-sm text-textSecondary mb-2 leading-relaxed">
                        {notif.message}
                      </p>
                      <span className="text-xs text-textSecondary/70 font-medium">
                        {notif.date}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/5 bg-white/[0.02]">
              <button className="w-full text-center text-sm font-medium text-primary hover:text-blue-400 transition-colors">
                Mark all as read
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
