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
  const uni = university as any;

  // Check if deadline is within 30 days
  const isDeadlineApproaching = () => {
    if (!uni.applicationDeadline) return false;

    const deadline = new Date(uni.applicationDeadline);
    const today = new Date();

    const diffTime = Math.abs(deadline.getTime() - today.getTime());

    const diffDays = Math.ceil(
      diffTime / (1000 * 60 * 60 * 24)
    );

    return diffDays <= 30 && deadline > today;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
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
            {uni.logoUrl ? (
              <Image
                src={uni.logoUrl}
                alt={uni.name || "University"}
                fill
                sizes="64px"
                className="object-cover"
              />
            ) : (
              <span className="text-xl font-bold text-textSecondary uppercase">
                {(uni.name || "UN").substring(0, 2)}
              </span>
            )}
          </div>

          <div>
            <h3
              className="text-lg font-bold text-white group-hover:text-primary transition-colors line-clamp-1"
              title={uni.name || "University"}
            >
              {uni.name || "Unnamed University"}
            </h3>

            <div className="flex items-center text-textSecondary text-sm mt-1">
              <MapPin size={14} className="mr-1 shrink-0" />

              <span className="truncate">
                {uni.city || "Unknown City"},{" "}
                {uni.state || "Unknown State"}
              </span>
            </div>
          </div>
        </div>

        {uni.rating && (
          <div className="flex items-center bg-yellow-500/10 px-2 py-1 rounded-lg">
            <span className="text-yellow-500 font-bold text-sm mr-1">
              {uni.rating}
            </span>

            <Star
              size={12}
              className="text-yellow-500 fill-yellow-500"
            />
          </div>
        )}
      </div>

      <div className="flex-grow">
        <div className="flex flex-wrap gap-2 mb-4">
          {(uni.programs || []).slice(0, 3).map((program: string) => (
            <span
              key={program}
              className="px-2.5 py-1 text-xs font-medium bg-primary/10 text-primary border border-primary/20 rounded-md"
            >
              {program}
            </span>
          ))}

          {uni.programs && uni.programs.length > 3 && (
            <span className="px-2.5 py-1 text-xs font-medium bg-white/5 text-textSecondary border border-white/10 rounded-md">
              +{uni.programs.length - 3} more
            </span>
          )}

          {(!uni.programs || uni.programs.length === 0) && (
            <span className="text-xs text-textSecondary italic">
              Programs to be announced
            </span>
          )}
        </div>

        {uni.applicationDeadline && (
          <div
            className={`flex items-center text-xs font-medium mb-4 ${
              isDeadlineApproaching()
                ? "text-orange-400 bg-orange-400/10 p-2 rounded-lg"
                : "text-textSecondary"
            }`}
          >
            <Clock size={14} className="mr-1.5 shrink-0" />

            Apply by: {formatDate(uni.applicationDeadline)}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-white/5">
        <Link
          href={`/student/universities/${uni.uid}`}
          className="text-center py-2.5 rounded-xl text-sm font-semibold text-white border border-white/20 hover:bg-white/5 transition-colors block"
        >
          View Details
        </Link>

        <Link
          href={`/student/universities/${uni.uid}?apply=true`}
          className="text-center py-2.5 rounded-xl text-sm font-semibold bg-primary hover:bg-blue-600 text-white transition-colors flex items-center justify-center"
        >
          Quick Apply
        </Link>
      </div>
    </motion.div>
  );
}
