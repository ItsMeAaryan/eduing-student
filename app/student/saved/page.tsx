"use client";

import { motion } from "framer-motion";
import { Bookmark, Sparkles } from "lucide-react";

export default function SavedPage() {
  return (
    <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-8 pb-20"
      >
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-display font-semibold text-white">Saved</h1>
          <p className="text-[14px] text-white/50 max-w-xl">
            Access your bookmarked universities, programs, and articles.
          </p>
        </div>

        <div className="w-full h-[400px] bg-[#111114] border border-white/[0.06] rounded-[24px] flex flex-col items-center justify-center p-8 relative overflow-hidden group">
          <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          
          <div className="w-16 h-16 rounded-[16px] bg-[#1A1A24] border border-white/[0.08] flex items-center justify-center text-emerald-400 mb-6 shadow-inner group-hover:scale-110 transition-transform duration-500">
            <Bookmark size={28} strokeWidth={1.5} />
          </div>
          
          <h2 className="text-[18px] font-display font-semibold text-white mb-3 flex items-center gap-2">
            <Sparkles size={16} className="text-amber-400" />
            Coming Soon
          </h2>
          <p className="text-[14px] text-white/40 text-center max-w-md leading-relaxed">
            Your personal collection of saved programs and universities is being curated. Bookmarking functionality will be available in the next release.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
