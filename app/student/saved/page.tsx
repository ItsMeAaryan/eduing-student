"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bookmark, Sparkles, Search, SlidersHorizontal, 
  MapPin, Clock, Calendar, CheckCircle2,
  Trash2, ExternalLink, GraduationCap, IndianRupee,
  ChevronDown, LayoutGrid, List
} from "lucide-react";
import { useStudentData } from "@/components/providers/StudentDataProvider";
import { useRouter } from "next/navigation";

export default function SavedPage() {
  const router = useRouter();
  const { savedPrograms: rawSavedPrograms, loading } = useStudentData();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isHovered, setIsHovered] = useState<string | null>(null);

  const savedPrograms = Array.isArray(rawSavedPrograms) ? rawSavedPrograms : [];
  
  // Filtering
  const filteredPrograms = savedPrograms.filter(prog => 
    !searchQuery || 
    prog?.universityName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prog?.program?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Statistics
  const totalSaved = savedPrograms.length;
  const highMatchCount = savedPrograms.filter(p => (p.aiMatch || 0) >= 80).length;
  const recentCount = savedPrograms.filter(p => {
    if (!p.savedAt) return false;
    const date = p.savedAt?.toDate ? p.savedAt.toDate() : new Date(p.savedAt);
    const days = (new Date().getTime() - date.getTime()) / (1000 * 3600 * 24);
    return days <= 7;
  }).length;
  const scholarshipsCount = savedPrograms.filter(p => p.scholarshipAvailable).length;

  if (loading) {
    return (
      <div className="flex-1 w-full flex items-center justify-center p-8 min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col p-4 md:p-8 font-sans pb-24">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em]">
            <Bookmark size={14} /> Personal Wishlist
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Saved Programs</h1>
          <p className="text-[16px] text-white/50 max-w-xl font-medium">
            Universities and specific programs you&apos;ve bookmarked for future applications.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-indigo-400 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search programs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111114] border border-white/[0.06] rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-indigo-500/30 focus:bg-white/[0.03] outline-none transition-all shadow-sm"
            />
          </div>
          <button className="h-11 px-4 bg-[#111114] border border-white/[0.06] rounded-2xl flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-all">
            <SlidersHorizontal size={18} />
          </button>
          <div className="h-11 flex items-center bg-[#111114] border border-white/[0.06] rounded-2xl p-1 shrink-0 hidden md:flex">
            <button 
              onClick={() => setViewMode("grid")}
              className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60'}`}
            >
              <LayoutGrid size={16} />
            </button>
            <button 
              onClick={() => setViewMode("list")}
              className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60'}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Statistics */}
      {savedPrograms.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          <div className="bg-[#111114] border border-white/[0.04] p-5 rounded-3xl flex flex-col justify-center">
            <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Total Saved</div>
            <div className="text-2xl font-black text-white">{totalSaved}</div>
          </div>
          <div className="bg-[#111114] border border-white/[0.04] p-5 rounded-3xl flex flex-col justify-center">
            <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">High AI Match</div>
            <div className="text-2xl font-black text-white">{highMatchCount}</div>
          </div>
          <div className="bg-[#111114] border border-white/[0.04] p-5 rounded-3xl flex flex-col justify-center">
            <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Scholarships</div>
            <div className="text-2xl font-black text-white">{scholarshipsCount}</div>
          </div>
          <div className="bg-[#111114] border border-white/[0.04] p-5 rounded-3xl flex flex-col justify-center">
            <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Recently Added</div>
            <div className="text-2xl font-black text-white">{recentCount}</div>
          </div>
        </motion.div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        {filteredPrograms.length === 0 ? (
          <motion.div 
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full flex flex-col items-center justify-center py-24 bg-[#111114] border border-white/[0.04] rounded-[40px] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] pointer-events-none" />
            <div className="w-20 h-20 bg-indigo-500/10 text-indigo-400 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
              <Bookmark size={32} />
            </div>
            <h2 className="text-2xl font-black text-white mb-3">No saved universities yet.</h2>
            <p className="text-white/40 text-[15px] mb-8 max-w-sm text-center">
              Explore programs and bookmark them here to compare your options and apply later.
            </p>
            <button 
              onClick={() => router.push('/student/universities')}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all"
            >
              Explore Universities
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="list"
            className={viewMode === 'grid' ? "grid grid-cols-1 lg:grid-cols-2 gap-6" : "flex flex-col gap-4"}
          >
            {filteredPrograms.map((prog: any, i: number) => (
              <motion.div
                key={prog.id || i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onHoverStart={() => setIsHovered(prog.id || i.toString())}
                onHoverEnd={() => setIsHovered(null)}
                className={`group bg-[#111114] border border-white/[0.05] rounded-[32px] p-6 hover:border-indigo-500/30 transition-all duration-300 relative overflow-hidden flex ${viewMode === 'list' ? 'flex-col md:flex-row items-start md:items-center gap-6' : 'flex-col gap-6'} cursor-pointer`}
                style={{
                  transform: isHovered === (prog.id || i.toString()) ? 'translateY(-4px)' : 'translateY(0)',
                  boxShadow: isHovered === (prog.id || i.toString()) ? '0 20px 40px -20px rgba(99, 102, 241, 0.15)' : 'none'
                }}
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-500/10 to-transparent blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                {/* Header (Logo + Title) */}
                <div className={`flex items-start gap-4 ${viewMode === 'list' ? 'md:w-1/3' : 'w-full'}`}>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center shrink-0 shadow-inner">
                     <span className="text-xl font-black text-white/80">{prog.universityName?.charAt(0) || 'U'}</span>
                  </div>
                  <div>
                    <h3 className="text-[17px] font-black text-white group-hover:text-indigo-400 transition-colors leading-tight mb-1.5">{prog.universityName || 'University Name'}</h3>
                    <div className="flex items-center gap-3 text-[11px] font-bold text-white/40 uppercase tracking-wider">
                      <span className="flex items-center gap-1"><MapPin size={12} /> {prog.location || 'Location'}</span>
                    </div>
                  </div>
                </div>

                {/* Body (Details) */}
                <div className={`flex flex-col gap-4 ${viewMode === 'list' ? 'flex-1 md:border-l md:border-white/5 md:pl-6' : 'w-full'}`}>
                  <div className="flex items-center gap-2">
                    <GraduationCap size={16} className="text-indigo-400" />
                    <span className="text-[15px] font-bold text-white/90">{prog.program || 'Program Name'}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-x-6 gap-y-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Duration</span>
                      <span className="text-[13px] font-semibold text-white/70 flex items-center gap-1.5"><Clock size={14} /> {prog.duration || '4 Years'}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Annual Fees</span>
                      <span className="text-[13px] font-semibold text-white/70 flex items-center gap-1"><IndianRupee size={12} /> {prog.annualFees || 'N/A'}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Deadline</span>
                      <span className="text-[13px] font-semibold text-white/70 flex items-center gap-1.5"><Calendar size={14} /> {prog.deadline || 'Ongoing'}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {prog.aiMatch && (
                      <div className="px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-1.5 text-indigo-400">
                        <Sparkles size={12} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{prog.aiMatch}% Match</span>
                      </div>
                    )}
                    {prog.scholarshipAvailable && (
                      <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1.5 text-emerald-400">
                        <CheckCircle2 size={12} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Scholarship</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className={`flex items-center gap-2 ${viewMode === 'list' ? 'w-full md:w-auto md:flex-col' : 'w-full mt-2'}`}>
                  <button className="flex-1 md:flex-none px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-all">
                    Apply Now
                  </button>
                  <button className="p-3.5 bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-white/40 rounded-xl transition-all group/btn" title="Remove from saved">
                    <Trash2 size={18} />
                  </button>
                  <button className="p-3.5 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-xl transition-all" title="View details">
                    <ExternalLink size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
