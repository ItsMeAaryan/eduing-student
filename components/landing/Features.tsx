"use client";

import { motion } from "framer-motion";
import { Users, Search, FileCheck, Bell, ShieldCheck } from "lucide-react";

const featureData = [
  {
    title: "Real-time Collaboration",
    desc: "Work with your team in the same scene, simultaneously reviewing and editing applications.",
    icon: <Users size={32} />,
    category: "TEAMS",
    wide: true
  },
  {
    title: "Smart Discovery",
    desc: "AI-powered university matching based on your profile, scores, and preferences.",
    icon: <Search size={32} />,
    category: "AI",
    wide: false
  },
  {
    title: "Application Tracking",
    desc: "Real-time status updates across every university you've applied to.",
    icon: <FileCheck size={32} />,
    category: "TRACKING",
    wide: false
  },
  {
    title: "Deadline Alerts",
    desc: "Never miss an application deadline with intelligent notifications and reminders.",
    icon: <Bell size={32} />,
    category: "ALERTS",
    wide: false
  },
  {
    title: "Secure Documents",
    desc: "Upload once, share securely with any university. Your data stays encrypted and private.",
    icon: <ShieldCheck size={32} />,
    category: "SECURITY",
    wide: true
  }
];

export default function Features() {
  return (
    <section className="py-24 px-5 bg-[#080808]" id="features">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="text-white mb-4"
          >
            Powerful features, beautifully simple
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-[560px] mx-auto text-[17px] text-white/50"
          >
            Everything you need to navigate admissions — from discovery to acceptance.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {featureData.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.65, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className={`bg-[#111111] border border-white/5 rounded-[20px] overflow-hidden group transition-all duration-500 hover:translate-y-[-5px] hover:border-[#6c6fff]/30 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)] ${feature.wide ? "md:col-span-2" : ""}`}
            >
              {/* Visual Panel */}
              <div className="h-[200px] relative overflow-hidden bg-gradient-to-br from-[#6c6fff1a] via-[#0f0f19] to-[#4f8eff0d] border-bottom border-white/5">
                {/* Layer 1 - Dot Grid */}
                <div className="absolute inset-0 bg-dot-grid opacity-30" />
                
                {/* Layer 2 - Glow Orb */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-[radial-gradient(circle,rgba(108,111,255,0.2)_0%,transparent_65%)] rounded-full animate-pulse-glow" />

                {/* Layer 5 - Corner Tag */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#6c6fff26] border border-[#6c6fff33] text-[11px] font-bold text-[#6c6fffcc] tracking-wider z-20">
                  {feature.category}
                </div>

                {/* Layer 4 - Floating Accent Dots */}
                <div className="absolute top-4 left-4 w-2 h-2 rounded-full bg-[#6c6fff99] animate-float-accent z-10" />
                <div className="absolute bottom-4 right-5 w-1.5 h-1.5 rounded-full bg-[#4f8eff80] animate-float-accent-reverse z-10" />
                <div className="absolute top-5 right-10 w-1 h-1 rounded-full bg-white/20 z-10" />

                {/* Layer 3 - Icon Container */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[72px] h-[72px] bg-[#6c6fff1f] border border-[#6c6fff40] rounded-[18px] flex items-center justify-center z-10">
                  <div className="text-white opacity-90">
                    {feature.icon}
                  </div>
                </div>
              </div>

              {/* Text Section */}
              <div className="p-6">
                <h3 className="text-[17px] font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-[14px] text-white/50 leading-relaxed">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
