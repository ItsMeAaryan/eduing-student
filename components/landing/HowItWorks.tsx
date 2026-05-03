"use client";

import { motion } from "framer-motion";
import { UserPlus, Search, FileCheck } from "lucide-react";

const steps = [
  {
    title: "Create Your Profile",
    desc: "Sign up and build your comprehensive academic profile once.",
    icon: <UserPlus size={36} />
  },
  {
    title: "Discover Universities",
    desc: "Find the best fit based on your preferences, scores, and location.",
    icon: <Search size={36} />
  },
  {
    title: "Apply & Track",
    desc: "Submit applications to multiple universities and track them in real-time.",
    icon: <FileCheck size={36} />
  }
];

export default function HowItWorks() {
  return (
    <section className="py-24 px-5 bg-[#080808]" id="about">
      <div className="max-w-[900px] mx-auto relative">
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-white mb-4"
          >
            How <span className="inline-flex items-center"><span className="text-white font-[800]">EDU</span><span className="font-[800] bg-clip-text text-transparent bg-gradient-to-br from-[#6c6fff] to-[#4f8eff]">ING</span></span> Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="max-w-[500px] mx-auto text-[17px] text-white/50"
          >
            Three simple steps to your dream university.
          </motion.p>
        </div>

        <div className="relative flex flex-col md:flex-row items-stretch justify-between gap-10">
          {/* Connecting dashed line - desktop only */}
          <div className="hidden md:block absolute top-[60px] left-[15%] right-[15%] h-px border-t border-dashed border-[#6c6fff40] z-0" />

          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, delay: idx * 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 bg-[#111111] border border-white/5 rounded-[20px] p-9 text-center hover:translate-y-[-4px] hover:border-[#6c6fff40] transition-all duration-300 relative z-10 group"
            >
              {/* Step number badge */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6c6fff] to-[#4f8eff] flex items-center justify-center text-white font-[700] text-[20px] mx-auto mb-6 shadow-[0_0_20px_rgba(108,111,255,0.3)]">
                {idx + 1}
              </div>
              
              {/* SVG Icon */}
              <div className="text-white opacity-70 group-hover:opacity-100 transition-opacity mb-5 flex justify-center">
                {step.icon}
              </div>

              <h3 className="text-[18px] font-bold text-white mb-3">{step.title}</h3>
              <p className="text-[14px] text-white/50 leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
