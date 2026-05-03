"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] bg-[#080808] flex items-center overflow-hidden pt-20 pb-20">
      {/* Scattered Dots Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full"
            style={{
              width: "2px",
              height: "2px",
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `pulse ${2 + Math.random() * 3}s infinite`,
            }}
          />
        ))}
      </div>

      <div className="max-w-[1200px] mx-auto px-5 md:px-10 flex flex-col lg:flex-row items-center gap-16 relative z-10 w-full">
        {/* LEFT SIDE - Text Content */}
        <div className="w-full lg:w-1/2 flex flex-col items-start text-left">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border)] bg-[#111] mb-6"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            <span className="text-[12px] font-[600] tracking-[0.08em] text-[var(--text-muted)] uppercase">
              UNIFIED UNIVERSITY ADMISSIONS
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-[clamp(40px,8vw,72px)] font-[800] tracking-[-0.04em] leading-[1.05] text-white mb-6"
          >
            One Profile. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#6c6fff] to-[#4f8eff]">
              Every University.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-[17px] text-white/50 max-w-[460px] leading-[1.65] mb-10"
          >
            The unified admission platform simplifying the journey for students and universities across India. Discover, apply, and succeed.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65, duration: 0.4 }}
            className="flex flex-wrap items-center gap-4"
          >
            <Link href="/auth/student/register" className="btn-pill btn-primary group">
              Get started — it&apos;s free
              <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* RIGHT SIDE - Floating Cards */}
        <div className="w-full lg:w-1/2 relative h-[400px] lg:h-[600px] hidden md:flex items-center justify-center">
          {/* Radial Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#6c6fff] opacity-10 blur-[100px] rounded-full" />

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full h-full"
          >
            {/* Card 1 */}
            <div className="absolute top-[10%] left-[10%] w-[320px] bg-white/[0.04] border border-white/[0.08] rounded-2xl backdrop-blur-xl p-5 z-30 animate-float shadow-2xl">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6c6fff] to-[#4f8eff]" />
                <div className="flex-1 space-y-2">
                  <div className="h-2.5 w-24 bg-white/10 rounded" />
                  <div className="h-2 w-16 bg-white/5 rounded" />
                </div>
              </div>
              <div className="space-y-3 mb-6">
                <div className="h-2 w-full bg-white/5 rounded" />
                <div className="h-2 w-3/4 bg-white/5 rounded" />
                <div className="h-2 w-1/2 bg-white/5 rounded" />
              </div>
              <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#6c6fff26] border border-[#6c6fff33] text-[11px] font-bold text-[#6c6fffcc]">
                Profile Complete
              </div>
            </div>

            {/* Card 2 */}
            <div className="absolute top-[35%] left-[25%] w-[300px] bg-white/[0.04] border border-white/[0.08] rounded-2xl backdrop-blur-xl p-5 z-20 animate-float shadow-2xl" style={{ animationDelay: "0.5s" }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4f8eff] to-[#6c6fff]" />
                <div className="flex-1 space-y-2">
                  <div className="h-2.5 w-24 bg-white/10 rounded" />
                  <div className="h-2 w-16 bg-white/5 rounded" />
                </div>
              </div>
              <div className="space-y-3 mb-6">
                <div className="h-2 w-full bg-white/5 rounded" />
                <div className="h-2 w-2/3 bg-white/5 rounded" />
              </div>
              <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#6c6fff26] border border-[#6c6fff33] text-[11px] font-bold text-[#6c6fffcc]">
                Applied
              </div>
            </div>

            {/* Card 3 */}
            <div className="absolute top-[20%] left-[40%] w-[280px] bg-white/[0.04] border border-white/[0.08] rounded-2xl backdrop-blur-xl p-5 z-10 animate-float shadow-2xl" style={{ animationDelay: "1s" }}>
               <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6c6fff] to-[#4f8eff]" />
                <div className="flex-1 space-y-2">
                  <div className="h-2.5 w-24 bg-white/10 rounded" />
                  <div className="h-2 w-16 bg-white/5 rounded" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-2 w-full bg-white/5 rounded" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
