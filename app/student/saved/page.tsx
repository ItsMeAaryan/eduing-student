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
import { Card, Button, Badge, Body, Small, Caption, MetricCard } from '@/components/ui/design-system';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchInput } from '@/components/ui/FormPrimitives';

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
      <div className="flex-1 w-full flex items-center justify-center p-32 min-h-[60vh] bg-background">
        <div className="w-48 h-48 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1440px] mx-auto p-24 animate-in fade-in duration-500 font-sans">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-16 mb-24">
        <div className="flex flex-col gap-8">
          <Caption className="text-primary font-bold uppercase tracking-[0.3em] flex items-center gap-8">
            <Bookmark size={14} strokeWidth={1.8} /> Personal Wishlist
          </Caption>
          <h1 className="text-[24px] font-semibold text-text-primary tracking-tight">Saved Programs</h1>
          <Body className="text-text-secondary max-w-xl font-medium">
            Universities and specific programs you&apos;ve bookmarked for future applications.
          </Body>
        </div>

        <div className="flex items-center gap-12 w-full md:w-auto">
          <SearchInput
            placeholder="Search programs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            containerClassName="w-full md:w-[280px]"
          />
          <button className="w-40 h-40 flex items-center justify-center rounded-[8px] bg-white border border-border shadow-sm text-text-secondary hover:text-text-primary hover:bg-[#F5F7FF] transition-colors">
            <SlidersHorizontal size={18} strokeWidth={1.8} />
          </button>
          <div className="h-40 flex items-center bg-white border border-border rounded-[8px] p-4 shrink-0 hidden md:flex shadow-sm">
            <button 
              onClick={() => setViewMode("grid")}
              className={`w-[32px] h-[32px] flex items-center justify-center rounded-[6px] transition-all ${viewMode === 'grid' ? 'bg-[#F5F7FF] text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
            >
              <LayoutGrid size={16} strokeWidth={1.8} />
            </button>
            <button 
              onClick={() => setViewMode("list")}
              className={`w-[32px] h-[32px] flex items-center justify-center rounded-[6px] transition-all ${viewMode === 'list' ? 'bg-[#F5F7FF] text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
            >
              <List size={16} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {savedPrograms.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-20 mb-24">
          <MetricCard label="Total Saved" value={totalSaved} icon={Bookmark} color="primary" description="+2 this week" />
          <MetricCard label="High AI Match" value={highMatchCount} icon={Sparkles} color="success" description="Top recommendations" />
          <MetricCard label="Scholarships" value={scholarshipsCount} icon={GraduationCap} color="purple" description="Financial aid available" />
          <MetricCard label="Recently Added" value={recentCount} icon={Clock} color="warning" description="Last 7 days" />
        </div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        {filteredPrograms.length === 0 ? (
          <EmptyState
            key="empty"
            icon={Bookmark}
            title={searchQuery ? `No programs matching "${searchQuery}"` : "No saved universities yet"}
            description={searchQuery ? "Try searching for another program or university." : "Explore programs and bookmark them here to compare your options and apply later."}
            primaryCtaLabel="Explore Universities"
            onPrimaryClick={() => router.push('/student/universities')}
            className="my-[20px]"
          />
        ) : (
          <div 
            key="list"
            className={viewMode === 'grid' ? "grid grid-cols-1 lg:grid-cols-2 gap-20" : "flex flex-col gap-16"}
          >
            {filteredPrograms.map((prog: any, i: number) => (
              <div
                key={prog.id || i}
                onMouseEnter={() => setIsHovered(prog.id || i.toString())}
                onMouseLeave={() => setIsHovered(null)}
                className={`group bg-white border border-border rounded-[12px] p-20 hover:border-primary/50 transition-colors relative overflow-hidden flex ${viewMode === 'list' ? 'flex-col md:flex-row items-start md:items-center gap-20' : 'flex-col gap-20'} cursor-pointer shadow-none`}
              >
                <div className="absolute top-0 right-0 w-[160px] h-[160px] bg-gradient-to-br from-primary/10 to-transparent blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                {/* Header (Logo + Title) */}
                <div className={`flex items-start gap-12 ${viewMode === 'list' ? 'md:w-1/3' : 'w-full'}`}>
                  <div className="w-40 h-40 rounded-[8px] bg-[#FAFAFC] border border-border flex items-center justify-center shrink-0 shadow-none">
                     <span className="text-[16px] font-bold text-text-primary">{prog.universityName?.charAt(0) || 'U'}</span>
                  </div>
                  <div>
                    <h4 className="text-[16px] font-semibold text-text-primary group-hover:text-primary transition-colors leading-tight mb-4">{prog.universityName || 'University Name'}</h4>
                    <div className="flex items-center gap-8 text-[12px] font-medium text-text-secondary tracking-wide">
                      <span className="flex items-center gap-4"><MapPin size={12} strokeWidth={1.8} /> {prog.location || 'Location'}</span>
                    </div>
                  </div>
                </div>

                {/* Body (Details) */}
                <div className={`flex flex-col gap-12 ${viewMode === 'list' ? 'flex-1 md:border-l md:border-border md:pl-20' : 'w-full'}`}>
                  <div className="flex items-center gap-8">
                    <GraduationCap size={16} strokeWidth={1.8} className="text-primary" />
                    <Body className="font-semibold text-text-primary">{prog.program || 'Program Name'}</Body>
                  </div>
                  
                  <div className="flex flex-wrap gap-x-20 gap-y-12">
                    <div className="flex flex-col gap-2">
                      <Caption className="font-medium text-text-secondary tracking-wide">Duration</Caption>
                      <Small className="font-semibold text-text-primary flex items-center gap-4"><Clock size={12} strokeWidth={1.8} /> {prog.duration || '4 Years'}</Small>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Caption className="font-medium text-text-secondary tracking-wide">Annual Fees</Caption>
                      <Small className="font-semibold text-text-primary flex items-center gap-4"><IndianRupee size={12} strokeWidth={1.8} /> {prog.annualFees || 'N/A'}</Small>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Caption className="font-medium text-text-secondary tracking-wide">Deadline</Caption>
                      <Small className="font-semibold text-text-primary flex items-center gap-4"><Calendar size={12} strokeWidth={1.8} /> {prog.deadline || 'Ongoing'}</Small>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-8 mt-4">
                    {prog.aiMatch && (
                      <Badge variant="purple" className="bg-primary/10 text-primary border-primary/20 flex items-center gap-4 px-8 py-4">
                        <Sparkles size={12} strokeWidth={1.8} />
                        {prog.aiMatch}% Match
                      </Badge>
                    )}
                    {prog.scholarshipAvailable && (
                      <Badge variant="success" className="bg-success/10 text-success border-success/20 flex items-center gap-4 px-8 py-4">
                        <CheckCircle2 size={12} strokeWidth={1.8} />
                        Scholarship
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className={`flex items-center gap-8 ${viewMode === 'list' ? 'w-full md:w-auto md:flex-col' : 'w-full mt-4'}`}>
                  <Button variant="secondary" className="flex-1 md:flex-none">
                    Apply Now
                  </Button>
                  <Button variant="secondary" className="!w-36 !h-36 !p-0 flex items-center justify-center hover:!bg-danger/10 hover:!text-danger hover:!border-danger/20" title="Remove from saved">
                    <Trash2 size={16} strokeWidth={1.8} />
                  </Button>
                  <Button variant="secondary" className="!w-36 !h-36 !p-0 flex items-center justify-center" title="View details">
                    <ExternalLink size={16} strokeWidth={1.8} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
