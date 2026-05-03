"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
  return (
    <section className="py-24 px-5 text-center bg-[#080808]">
      <div className="max-w-[800px] mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-[clamp(40px,7vw,72px)] font-[800] tracking-[-0.04em] leading-[1.05] text-white mb-6"
        >
          Design. Collaborate. Ship.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-[18px] max-w-[500px] mx-auto mb-12 leading-[1.65] text-[var(--text-muted)]"
        >
          Join millions of students building their future with <span className="inline-flex items-center"><span className="text-white font-[800]">EDU</span><span className="font-[800] bg-clip-text text-transparent bg-gradient-to-br from-[#6c6fff] to-[#4f8eff]">ING</span></span>. One profile, endless possibilities.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Link href="/auth/student/register" className="btn-pill btn-primary group">
            Get started for free
            <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
