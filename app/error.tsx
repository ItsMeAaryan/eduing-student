"use client";

import { useEffect } from "react";
import { AlertOctagon, RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md bg-white/[0.02] border border-red-500/20 p-8 rounded-3xl"
      >
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertOctagon size={40} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Something went wrong!</h2>
        <p className="text-textSecondary mb-8 text-sm leading-relaxed">
          We encountered an unexpected error. Don't worry, our team has been notified. 
          Please try refreshing the page.
        </p>
        
        <button
          onClick={() => reset()}
          className="inline-flex items-center px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors w-full justify-center"
        >
          <RefreshCcw size={18} className="mr-2" /> Try Again
        </button>
      </motion.div>
    </div>
  );
}
