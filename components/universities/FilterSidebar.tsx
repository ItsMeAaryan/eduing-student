"use client";

import { UniversityFilters } from "@/types/university";
import { Search, X } from "lucide-react";

interface Props {
  filters: UniversityFilters;
  setFilters: React.Dispatch<React.SetStateAction<UniversityFilters>>;
  onCloseMobile?: () => void;
}

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir"
];

const PROGRAMS = ["UG", "PG", "MBA", "MTech", "MD", "LLB", "BBA", "PhD"];

export default function FilterSidebar({ filters, setFilters, onCloseMobile }: Props) {
  
  const handleStateToggle = (state: string) => {
    setFilters(prev => ({
      ...prev,
      states: (prev.states || []).includes(state)
  ? (prev.states || []).filter(s => s !== state)
  : [...(prev.states || []), state]
    }));
  };

  const handleProgramToggle = (program: string) => {
    setFilters(prev => ({
      ...prev,
      programs: prev.programs.includes(program)
        ? prev.programs.filter(p => p !== program)
        : [...prev.programs, program]
    }));
  };

  const clearFilters = () => {
    setFilters({
      searchQuery: "",
      states: [],
      city: "",
      programs: [],
      requiresEntranceExam: null
    });
  };

  return (
    <div className="bg-card lg:border border-border lg:rounded-2xl p-6 lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto custom-scrollbar">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Filters</h2>
        {onCloseMobile && (
          <button onClick={onCloseMobile} className="lg:hidden text-textSecondary hover:text-white">
            <X size={20} />
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-textSecondary mb-2">Search University</label>
          <div className="relative">
            <input 
              type="text" 
              value={filters.searchQuery}
              onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              placeholder="e.g. Delhi University"
              className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
            />
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" />
          </div>
        </div>

        {/* State */}
        <div>
          <label className="block text-sm font-medium text-textSecondary mb-2">State</label>
          <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {STATES.map(state => (
              <label key={state} className="flex items-center space-x-2 cursor-pointer group">
                <input 
                  type="checkbox"
                  checked={filters.states.includes(state)}
                  onChange={() => handleStateToggle(state)}
                  className="rounded border-border bg-background text-primary focus:ring-primary/50 focus:ring-offset-0 transition-all cursor-pointer"
                />
                <span className="text-sm text-textSecondary group-hover:text-white transition-colors">{state}</span>
              </label>
            ))}
          </div>
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-textSecondary mb-2">City</label>
          <input 
            type="text" 
            value={filters.city}
            onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
            placeholder="e.g. Mumbai"
            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
          />
        </div>

        {/* Program Types */}
        <div>
          <label className="block text-sm font-medium text-textSecondary mb-2">Program Type</label>
          <div className="grid grid-cols-2 gap-2">
            {PROGRAMS.map(program => (
              <label key={program} className="flex items-center space-x-2 cursor-pointer group">
                <input 
                  type="checkbox"
                  checked={filters.programs.includes(program)}
                  onChange={() => handleProgramToggle(program)}
                  className="rounded border-border bg-background text-primary focus:ring-primary/50 focus:ring-offset-0 transition-all cursor-pointer"
                />
                <span className="text-sm text-textSecondary group-hover:text-white transition-colors">{program}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Entrance Exam Toggle */}
        <div>
          <label className="block text-sm font-medium text-textSecondary mb-2">Entrance Exam Required</label>
          <div className="flex bg-background border border-border rounded-xl p-1">
            <button
              onClick={() => setFilters(prev => ({ ...prev, requiresEntranceExam: true }))}
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${filters.requiresEntranceExam === true ? "bg-primary text-white" : "text-textSecondary hover:text-white"}`}
            >
              Yes
            </button>
            <button
              onClick={() => setFilters(prev => ({ ...prev, requiresEntranceExam: false }))}
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${filters.requiresEntranceExam === false ? "bg-primary text-white" : "text-textSecondary hover:text-white"}`}
            >
              No
            </button>
            <button
              onClick={() => setFilters(prev => ({ ...prev, requiresEntranceExam: null }))}
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${filters.requiresEntranceExam === null ? "bg-white/10 text-white" : "text-textSecondary hover:text-white"}`}
            >
              Any
            </button>
          </div>
        </div>

      </div>

      <div className="mt-8 pt-6 border-t border-border">
        <button 
          onClick={clearFilters}
          className="w-full text-center text-sm text-primary hover:text-blue-400 font-medium transition-colors"
        >
          Clear All Filters
        </button>
      </div>
    </div>
  );
}
