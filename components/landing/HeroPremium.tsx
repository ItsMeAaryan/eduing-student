"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamic import for 3D scene to ensure no SSR issues and better performance
const HeroPremiumScene = dynamic(() => import("./HeroPremiumScene"), { 
  ssr: false,
  loading: () => <div className="w-full h-[600px] lg:h-[800px] bg-[#0A0F1E] animate-pulse" />
});

export default function HeroPremium() {
  return (
    <section className="relative min-h-screen bg-[#0A0F1E] flex items-center overflow-hidden pt-20">
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#3B82F6] opacity-[0.03] blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#8B5CF6] opacity-[0.02] blur-[150px] rounded-full" />
      </div>

      <div className="container mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center gap-12 lg:gap-0 relative z-10 w-full">
        {/* LEFT SIDE - Text Content */}
        <div className="w-full lg:w-1/2 flex flex-col items-start text-left">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 mb-8"
          >
            <div className="w-2 h-2 rounded-full bg-[#3B82F6] animate-pulse" />
            <span className="text-[12px] font-[600] tracking-[0.1em] text-white/60 uppercase">
              The Future of University Admissions
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-[clamp(45px,6vw,84px)] font-[800] tracking-[-0.03em] leading-[1.05] text-white mb-8"
          >
            Empowering Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] via-[#8B5CF6] to-[#6366F1]">
              Academic Journey.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
            className="text-[18px] text-white/50 max-w-[500px] leading-[1.7] mb-12"
          >
            A unified, intelligent platform to discover and apply to top universities. One profile, endless possibilities. Experience the premium standard of admissions.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
            className="flex flex-wrap items-center gap-6"
          >
            <Link href="/auth/student/register">
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: "0 0 25px rgba(59, 130, 246, 0.5)" }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="px-8 py-4 bg-[#3B82F6] text-white rounded-full font-semibold flex items-center gap-2 group"
              >
                Start Applying
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
            
            <Link href="/universities">
              <motion.button
                whileHover={{ scale: 1.03, borderColor: "rgba(59, 130, 246, 0.5)", backgroundColor: "rgba(59, 130, 246, 0.05)" }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="px-8 py-4 border border-white/20 text-white rounded-full font-semibold"
              >
                Browse Programs
              </motion.button>
            </Link>
          </motion.div>
        </div>

        {/* RIGHT SIDE - 3D Scene */}
        <div className="w-full lg:w-1/2 flex items-center justify-center min-h-[500px] lg:min-h-[800px]">
          <HeroPremiumScene />
        </div>
      </div>
      
      {/* Bottom subtle divider */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </section>
  );
}
