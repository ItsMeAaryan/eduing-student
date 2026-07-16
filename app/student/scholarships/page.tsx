'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useStudentData } from '@/components/providers/StudentDataProvider';
import { listenScholarships } from '@/lib/firebase/scholarships';
import { calculateScholarshipEligibility, ScholarshipResult } from '@/lib/utils/scholarshipEngine';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  Search, GraduationCap, CheckCircle2, AlertCircle, Calendar, 
  ChevronRight, X, Sparkles, Filter, IndianRupee, Wallet, 
  Award, TrendingUp, Bookmark, Building2, Globe
} from 'lucide-react';

export default function ScholarshipsPage() {
  const { profile, documents, profileScore } = useStudentData();
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('Eligible');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScholarship, setSelectedScholarship] = useState<ScholarshipResult | null>(null);

  useEffect(() => {
    const unsub = listenScholarships((data) => {
      setScholarships(data);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const results = useMemo(() => {
    if (!profile) return [];
    return calculateScholarshipEligibility({ profile, documents, profileScore }, scholarships).sort((a, b) => b.eligibilityScore - a.eligibilityScore);
  }, [profile, documents, profileScore, scholarships]);

  const stats = useMemo(() => {
    const eligibleCount = results.filter(r => r.eligibilityScore >= 75).length;
    const potentialCount = results.filter(r => r.eligibilityScore >= 40 && r.eligibilityScore < 75).length;
    return { eligible: eligibleCount, potential: potentialCount, applied: 0, saved: 2 };
  }, [results]);

  const filteredResults = useMemo(() => {
    let filtered = results;
    
    // Apply quick filters
    if (activeFilter === 'Eligible') filtered = filtered.filter(r => r.eligibilityScore >= 75);
    if (activeFilter === 'Potential') filtered = filtered.filter(r => r.eligibilityScore >= 40 && r.eligibilityScore < 75);
    if (activeFilter === 'Government') filtered = filtered.filter(r => r.scholarship.providerType === 'Government' || r.scholarship.provider?.toLowerCase().includes('govt'));
    if (activeFilter === 'Private') filtered = filtered.filter(r => r.scholarship.providerType === 'Private' || !r.scholarship.provider?.toLowerCase().includes('govt'));
    
    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(r => 
        r.scholarship.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        r.scholarship.provider?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [results, activeFilter, searchQuery]);

  if (loading) return (
    <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-[#6D5DF6]/30 border-t-[#6D5DF6] rounded-full animate-spin" />
    </div>
  );

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="min-h-screen bg-[#09090B] text-white selection:bg-[#6D5DF6]/30 font-sans pb-32">
        
        {/* HEADER */}
        <section className="pt-24 pb-12 px-8 max-w-[1600px] mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
            <div>
              <h1 className="text-[48px] font-medium tracking-tight mb-2">Scholarships</h1>
              <p className="text-[16px] text-gray-400 max-w-xl">Find financial support perfectly tailored to your academic profile.</p>
            </div>
            
            <div className="flex items-center gap-4 w-full lg:w-auto">
              <div className="relative flex-1 md:w-80 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#6D5DF6] transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Search scholarships..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#151519] border border-white/5 rounded-full pl-12 pr-4 py-3.5 text-[14px] text-white placeholder:text-gray-500 focus:border-[#6D5DF6]/50 focus:bg-[#1A1A20] outline-none transition-all shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* QUICK FILTERS */}
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-4 mb-8">
            {['All', 'Eligible', 'Potential', 'Closing Soon', 'Government', 'Private', 'Study Abroad'].map(filter => (
              <button 
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-6 py-2.5 rounded-full text-[14px] font-medium transition-all whitespace-nowrap shrink-0 border ${
                  activeFilter === filter ? 'bg-[#6D5DF6] border-[#6D5DF6] text-white' : 'bg-[#151519] border-white/5 text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* SECTION 1: OVERVIEW CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <OverviewCard label="Highly Eligible" value={stats.eligible} color="text-emerald-400" bg="bg-emerald-400/5" border="border-emerald-400/10" icon={Award} />
            <OverviewCard label="Potential Match" value={stats.potential} color="text-amber-400" bg="bg-amber-400/5" border="border-amber-400/10" icon={TrendingUp} />
            <OverviewCard label="Applied" value={stats.applied} color="text-blue-400" bg="bg-blue-400/5" border="border-blue-400/10" icon={CheckCircle2} />
            <OverviewCard label="Saved" value={stats.saved} color="text-gray-300" bg="bg-[#151519]" border="border-white/5" icon={Bookmark} />
          </div>
        </section>

        <section className="px-8 max-w-[1600px] mx-auto flex gap-12 relative">
          
          {/* SECTION 2: FILTERS SIDEBAR (STICKY) */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-8 bg-[#111113] border border-white/5 rounded-[32px] p-8 flex flex-col gap-8 shadow-2xl">
              <div className="flex justify-between items-center">
                <h3 className="text-[20px] font-medium text-white flex items-center gap-2">
                  <Filter size={20} /> Filters
                </h3>
                <button className="text-[14px] text-gray-500 hover:text-white transition-colors">Clear</button>
              </div>
              
              <FilterGroup title="Amount (₹)" options={['Any', 'Above ₹50,000', 'Above ₹1,00,000', 'Full Tuition']} />
              <FilterGroup title="Category" options={['Merit-based', 'Means-based', 'Minority', 'Sports', 'Women']} />
              <FilterGroup title="Provider" options={['Central Govt', 'State Govt', 'Private Corporate', 'NGO']} />
            </div>
          </aside>

          {/* SECTION 3: PRIORITY SCHOLARSHIPS GRID */}
          <div className="flex-1">
            {scholarships.length === 0 || results.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-24 bg-[#111113] border border-white/5 rounded-[32px]">
                  <Wallet size={48} className="text-gray-600 mb-6" />
                  <h3 className="text-[24px] font-medium mb-3">No scholarships available</h3>
                  <p className="text-[14px] text-gray-400 max-w-md text-center mb-8">We couldn&apos;t find any scholarships matching your profile currently. Improve your profile to unlock more opportunities.</p>
                  <Link href="/student/profile" className="px-8 py-4 bg-[#6D5DF6] hover:bg-[#6D5DF6]/90 text-white rounded-full text-[14px] font-medium transition-colors">
                    Improve Profile
                  </Link>
               </div>
            ) : filteredResults.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-24 bg-[#111113] border border-white/5 rounded-[32px]">
                  <Filter size={48} className="text-gray-600 mb-6" />
                  <h3 className="text-[20px] font-medium mb-2">No matches found</h3>
                  <p className="text-[14px] text-gray-400">Try adjusting your filters to see more results.</p>
               </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <AnimatePresence>
                  {filteredResults.map((res, idx) => {
                    const badge = getMatchBadge(res.eligibilityScore);
                    return (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: idx * 0.05 }}
                        key={res.scholarship.id}
                        className="bg-[#111113] border border-white/5 rounded-[32px] overflow-hidden flex flex-col hover:border-white/10 hover:shadow-2xl transition-all group"
                      >
                        {/* Header Area */}
                        <div className="p-8 bg-[#151519] border-b border-white/5">
                          <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-2">
                              <div className={`px-4 py-1.5 rounded-full border text-[12px] font-medium ${badge.color}`}>
                                {badge.label}
                              </div>
                              <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[12px] font-medium text-gray-400 flex items-center gap-1.5">
                                <Building2 size={12} /> {res.scholarship.provider || 'Private'}
                              </div>
                            </div>
                            <div className="text-[32px] font-medium text-emerald-400 flex items-center">
                              <IndianRupee size={24} className="mt-1" />
                              {res.estimatedBenefit || 'Varies'}
                            </div>
                          </div>
                          <h2 className="text-[24px] font-medium leading-tight mb-2 group-hover:text-[#6D5DF6] transition-colors">{res.scholarship.name}</h2>
                          <div className="flex items-center gap-4 text-[14px] text-gray-400">
                            <span className="flex items-center gap-1.5"><Calendar size={14} /> {res.scholarship.deadline || 'Rolling Deadline'}</span>
                          </div>
                        </div>

                        {/* AI Insights & Actions */}
                        <div className="p-8 flex flex-col flex-1">
                          <div className="mb-8">
                             <div className="text-[12px] font-medium text-[#6D5DF6] mb-3 flex items-center gap-2">
                               <Sparkles size={14} /> AI Insight: Why you qualify
                             </div>
                             <div className="space-y-2">
                               {res.matchReasons.slice(0, 2).map((reason, i) => (
                                 <div key={i} className="flex items-start gap-2 text-[14px] text-gray-300">
                                   <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                                   <span className="leading-tight">{reason}</span>
                                 </div>
                               ))}
                             </div>
                          </div>
                          
                          {res.missingRequirements.length > 0 && (
                            <div className="mb-8 bg-amber-400/5 border border-amber-400/10 rounded-[16px] p-4">
                              <div className="text-[12px] font-medium text-amber-400 mb-2 flex items-center gap-2">
                                <AlertCircle size={14} /> Missing Requirements
                              </div>
                              <div className="text-[14px] text-amber-400/80">
                                {res.missingRequirements[0]} {res.missingRequirements.length > 1 && `+ ${res.missingRequirements.length - 1} more`}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-4 mt-auto">
                            <button onClick={() => setSelectedScholarship(res)} className="flex-1 py-4 bg-white hover:bg-gray-200 text-black rounded-[20px] text-[14px] font-medium transition-colors">
                              View Details
                            </button>
                            <button className="px-6 py-4 bg-[#151519] border border-white/5 hover:bg-white/5 rounded-[20px] text-[14px] font-medium transition-colors">
                              Save
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </section>

        {/* SIDE DRAWER: DETAIL VIEW */}
        <AnimatePresence>
          {selectedScholarship && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedScholarship(null)}
            >
              <motion.div 
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-full md:w-[600px] h-full bg-[#111113] border-l border-white/5 shadow-2xl flex flex-col"
                onClick={e => e.stopPropagation()}
              >
                {/* Drawer Header */}
                <div className="flex items-start justify-between p-8 bg-[#151519] border-b border-white/5">
                  <div>
                    <div className="px-3 py-1 bg-white/5 rounded-full text-[12px] font-medium text-gray-400 mb-4 inline-block">
                      {selectedScholarship.scholarship.provider || 'Private'} Scholarship
                    </div>
                    <h3 className="text-[28px] font-medium leading-tight mb-2">{selectedScholarship.scholarship.name}</h3>
                    <div className="text-[20px] text-emerald-400 font-medium">₹{selectedScholarship.estimatedBenefit || 'Varies'}</div>
                  </div>
                  <button onClick={() => setSelectedScholarship(null)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors shrink-0">
                    <X size={18} />
                  </button>
                </div>
                
                {/* Drawer Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-12">
                  
                  {/* AI Advice */}
                  <div className="bg-[#151519] border border-[#6D5DF6]/20 rounded-[24px] p-6">
                    <h4 className="text-[16px] font-medium text-[#6D5DF6] mb-4 flex items-center gap-2"><Sparkles size={18} /> AI Advisor</h4>
                    <p className="text-[14px] text-gray-300 leading-relaxed mb-6">
                      Based on your profile score of {profileScore}%, you have a <span className="font-medium text-white">{selectedScholarship.eligibilityScore}% match probability</span> for this scholarship. 
                      {selectedScholarship.improvementSuggestions[0] ? ` ${selectedScholarship.improvementSuggestions[0]}` : ''}
                    </p>
                    
                    {selectedScholarship.missingRequirements.length > 0 && (
                      <div className="pt-4 border-t border-white/5">
                        <h5 className="text-[12px] text-amber-400 mb-2">Required Action Before Applying</h5>
                        <ul className="space-y-2">
                          {selectedScholarship.missingRequirements.map((req, i) => (
                            <li key={i} className="text-[14px] text-gray-400 flex items-start gap-2">
                              <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" /> {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Overview */}
                  <div className="space-y-4">
                    <h4 className="text-[18px] font-medium text-white">Overview</h4>
                    <p className="text-[14px] text-gray-400 leading-relaxed">
                      {selectedScholarship.scholarship.description || 'This scholarship is designed to support meritorious students who require financial assistance to pursue higher education.'}
                    </p>
                  </div>

                  {/* Documents Required */}
                  <div className="space-y-4">
                    <h4 className="text-[18px] font-medium text-white">Required Documents</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {['Income Certificate', '12th Marksheet', 'Aadhaar Card', 'Passport Photo', 'Bank Passbook'].map((doc, i) => (
                        <div key={i} className="bg-[#151519] border border-white/5 rounded-[12px] p-3 text-[12px] text-gray-300 flex items-center gap-2">
                          <CheckCircle2 size={14} className={i < 3 ? "text-emerald-400" : "text-gray-600"} /> {doc}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Application Timeline */}
                  <div className="space-y-6">
                    <h4 className="text-[18px] font-medium text-white">Application Timeline</h4>
                    <div className="relative pl-6 border-l border-white/10 ml-3 space-y-8">
                      <div className="relative">
                        <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                        <h5 className="text-[14px] font-medium text-white">Applications Open</h5>
                        <p className="text-[12px] text-gray-500">Currently accepting applications</p>
                      </div>
                      <div className="relative">
                        <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-[#151519] border-2 border-white/20" />
                        <h5 className="text-[14px] font-medium text-white">Deadline</h5>
                        <p className="text-[12px] text-gray-500">{selectedScholarship.scholarship.deadline || 'Rolling Basis'}</p>
                      </div>
                      <div className="relative">
                        <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-[#151519] border-2 border-white/20" />
                        <h5 className="text-[14px] font-medium text-white">Verification & Results</h5>
                        <p className="text-[12px] text-gray-500">Usually 4-6 weeks after deadline</p>
                      </div>
                      <div className="relative">
                        <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-[#151519] border-2 border-white/20" />
                        <h5 className="text-[14px] font-medium text-white">Disbursement</h5>
                        <p className="text-[12px] text-gray-500">Direct to bank account</p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Drawer Footer Actions */}
                <div className="p-8 border-t border-white/5 bg-[#111113]">
                  <button className="w-full py-4 bg-[#6D5DF6] hover:bg-[#6D5DF6]/90 rounded-[20px] text-[14px] font-medium text-white transition-colors shadow-[0_0_30px_rgba(109,93,246,0.3)]">
                    Begin Application Process
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </ProtectedRoute>
  );
}

function OverviewCard({ label, value, color, bg, border, icon: Icon }: { label: string, value: number, color: string, bg: string, border: string, icon: any }) {
  return (
    <div className={`${bg} border ${border} rounded-[24px] p-6 flex flex-col gap-4 relative overflow-hidden`}>
      <Icon size={24} className={`${color} opacity-20 absolute right-6 top-6`} />
      <span className="text-[14px] font-medium text-gray-400">{label}</span>
      <span className={`text-[40px] font-medium ${color}`}>{value}</span>
    </div>
  )
}

function FilterGroup({ title, options }: { title: string, options: string[] }) {
  return (
    <div className="flex flex-col gap-4">
      <h4 className="text-[14px] font-medium text-white">{title}</h4>
      <div className="flex flex-col gap-3">
        {options.map(opt => (
          <label key={opt} className="flex items-center gap-3 cursor-pointer group">
            <div className="w-5 h-5 rounded-[6px] border border-white/10 bg-[#151519] group-hover:border-[#6D5DF6]/50 flex items-center justify-center transition-colors">
              <CheckCircle2 size={12} className="text-[#6D5DF6] opacity-0 group-hover:opacity-100" />
            </div>
            <span className="text-[14px] text-gray-400 group-hover:text-white transition-colors">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

function getMatchBadge(score: number) {
  if (score >= 90) return { label: 'Excellent Match', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' }
  if (score >= 75) return { label: 'Strong Match', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' }
  if (score >= 60) return { label: 'Good Match', color: 'text-[#6D5DF6] bg-[#6D5DF6]/10 border-[#6D5DF6]/20' }
  if (score >= 40) return { label: 'Potential Match', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' }
  return { label: 'Low Match', color: 'text-gray-400 bg-white/5 border-white/10' }
}
