"use client";

import { motion } from "framer-motion";

const row1 = [
  "IIT Delhi", "BITS Pilani", "NIT Trichy", "IISc Bangalore", "IIT Bombay", 
  "VIT Vellore", "SRM Chennai", "DTU Delhi", "IIIT Hyderabad", "NIT Surathkal"
];

const row2 = [
  "Anna University", "Manipal Institute", "Amity University", "Jadavpur University", 
  "Punjab University", "Cochin University", "Osmania University", "Aligarh Muslim University", 
  "Banaras Hindu University", "Delhi University"
];

const UniversityPill = ({ name }: { name: string }) => {
  const initial = name.charAt(0);
  return (
    <div className="flex items-center gap-3 bg-[#111] border border-white/5 rounded-full px-5 py-2.5 hover:border-[#6c6fff59] hover:scale-[1.03] transition-all duration-300 group shrink-0">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6c6fff] to-[#4f8eff] flex items-center justify-center text-white font-bold text-sm">
        {initial}
      </div>
      <span className="text-white font-medium whitespace-nowrap">{name}</span>
    </div>
  );
};

export default function Marquee() {
  return (
    <section className="py-24 bg-[#080808] overflow-hidden relative">
      {/* Edge Fade Masks */}
      <div className="absolute inset-0 pointer-events-none z-10" style={{
        maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)'
      }} />

      <div className="flex flex-col gap-6">
        {/* Row 1 - Left */}
        <div className="flex overflow-hidden group">
          <div className="flex gap-4 animate-scroll-left group-hover:[animation-play-state:paused]">
            {[...row1, ...row1].map((univ, i) => (
              <UniversityPill key={i} name={univ} />
            ))}
          </div>
        </div>

        {/* Row 2 - Right */}
        <div className="flex overflow-hidden group">
          <div className="flex gap-4 animate-scroll-right group-hover:[animation-play-state:paused]">
            {[...row2, ...row2].map((univ, i) => (
              <UniversityPill key={i} name={univ} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
