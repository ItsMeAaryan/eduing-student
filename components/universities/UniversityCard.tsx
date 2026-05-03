"use client";

import { ExtendedUniversityProfile } from "@/types/university";
import { motion } from "framer-motion";
import { MapPin, Star, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Props {
  university: ExtendedUniversityProfile;
  index: number;
}

export default function UniversityCard({ university, index }: Props) {
  // Check if deadline is within 30 days
  const isDeadlineApproaching = () => {
    if (!university.applicationDeadline) return false;
    const deadline = new Date(university.applicationDeadline);
    const today = new Date();
    const diffTime = Math.abs(deadline.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays <= 30 && deadline > today;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="glass-card bg-card/60 border border-white/5 p-5 rounded-2xl flex flex-col h-full hover:border-primary/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 relative">
            {university.logoUrl ? (
              <Image src={university.logoUrl} alt={(university as any).name} fill sizes="64px" className="object-cover" />
            ) : (
              <span className="text-xl font-bold text-textSecondary uppercase">{((university as any).name || 'UN').substring(0, 2)}</span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors line-clamp-1" title={university.name}>
              {university.name}
            </h3>
            <div className="flex items-center text-textSecondary text-sm mt-1">
              <MapPin size={14} className="mr-1 shrink-0" />
              <span className="truncate">{university.city}, {university.state}</span>
            </div>
          </div>
        </div>

        {university.rating && (
          <div className="flex items-center bg-yellow-500/10 px-2 py-1 rounded-lg">
            <span className="text-yellow-500 font-bold text-sm mr-1">{university.rating}</span>
            <Star size={12} className="text-yellow-500 fill-yellow-500" />
          </div>
        )}
      </div>

      <div className="flex-grow">
        <div className="flex flex-wrap gap-2 mb-4">
          {(university.programs || []).slice(0, 3).map(program => (
            <span key={program} className="px-2.5 py-1 text-xs font-medium bg-primary/10 text-primary border border-primary/20 rounded-md">
              {program}
            </span>
          ))}
          {(university.programs && university.programs.length > 3) && (
            <span className="px-2.5 py-1 text-xs font-medium bg-white/5 text-textSecondary border border-white/10 rounded-md">
              +{university.programs.length - 3} more
            </span>
          )}
          {(!university.programs || university.programs.length === 0) && (
            <span className="text-xs text-textSecondary italic">Programs to be announced</span>
          )}
        </div>

        {university.applicationDeadline && (
          <div className={`flex items-center text-xs font-medium mb-4 ${isDeadlineApproaching() ? "text-orange-400 bg-orange-400/10 p-2 rounded-lg" : "text-textSecondary"}`}>
            <Clock size={14} className="mr-1.5 shrink-0" />
            Apply by: {formatDate(university.applicationDeadline)}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-white/5">
        <Link 
          href={`/student/universities/${university.uid}`}
          className="text-center py-2.5 rounded-xl text-sm font-semibold text-white border border-white/20 hover:bg-white/5 transition-colors block"
        >
          View Details
        </Link>
        <Link
          href={`/student/universities/${university.uid}?apply=true`}
          className="text-center py-2.5 rounded-xl text-sm font-semibold bg-primary hover:bg-blue-600 text-white transition-colors flex items-center justify-center"
        >
          Quick Apply
        </Link>
      </div>
    </motion.div>
  );
}
