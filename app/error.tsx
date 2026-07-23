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
    console.error("Global Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-[440px] bg-white border border-[#EAECF0] p-[40px] rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.06)]"
      >
        <div className="w-[72px] h-[72px] bg-[#FEF2F2] rounded-full flex items-center justify-center mx-auto mb-[20px]">
          <AlertOctagon size={32} className="text-[#EF4444]" strokeWidth={1.5} />
        </div>
        <h2 className="text-[20px] font-bold text-[#111827] mb-[8px]">Something went wrong</h2>
        <p className="text-[13px] text-[#6B7280] mb-[28px] leading-relaxed">
          We encountered an unexpected error. Please try refreshing the page.
          If the issue persists, contact support.
        </p>
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-[8px] px-[20px] h-[40px] bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-[10px] text-[13px] font-semibold transition-colors w-full justify-center"
        >
          <RefreshCcw size={15} strokeWidth={2} />
          Try Again
        </button>
      </motion.div>
    </div>
  );
}
