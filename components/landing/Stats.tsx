"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

function AnimatedCounter({ target, suffix = "+" }: { target: number; suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    if (!isInView) return;
    
    let start = 0;
    const duration = 2000;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        clearInterval(timer);
        start = target;
      }
      
      const formatted = start >= 1000000 
        ? (start / 1000000).toFixed(1) + "M" 
        : start >= 1000 
          ? Math.floor(start / 1000) + "K" 
          : Math.floor(start).toString();
          
      setDisplayValue(formatted);
    }, 16);
    
    return () => clearInterval(timer);
  }, [isInView, target]);

  return <span ref={ref}>{displayValue}{suffix}</span>;
}

const statsData = [
  { label: "Students", target: 500000 },
  { label: "Applications", target: 2000000 },
  { label: "Universities", target: 500 },
  { label: "Uptime", target: 99, suffix: "%" },
];

export default function Stats() {
  return (
    <section className="py-24 bg-[#080808]">
      <div className="max-w-[1200px] mx-auto px-5 flex justify-center flex-wrap gap-16 md:gap-24">
        {statsData.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, delay: idx * 0.1 }}
            className="text-center"
          >
            <p className="text-[clamp(36px,5vw,56px)] font-[800] tracking-[-0.03em] text-white">
              <AnimatedCounter target={stat.target} suffix={stat.suffix || "+"} />
            </p>
            <p className="label text-[var(--text-dim)] mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
