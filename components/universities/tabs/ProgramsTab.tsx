"use client";

import { useState } from "react";
import { UniversityDetails, Program } from "@/types/universityDetails";
import { Clock, Users, IndianRupee, FileText, CalendarCheck } from "lucide-react";
import ApplicationModal from "@/components/universities/ApplicationModal";

interface Props {
  university: UniversityDetails;
}

const LEVELS = ["All", "UG", "PG", "MBA", "PhD"];

export default function ProgramsTab({ university }: Props) {
  const { programsList } = university;
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  if (!programsList || programsList.length === 0) {
    return (
      <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl animate-in fade-in slide-in-from-bottom-4">
        <h3 className="text-xl font-bold text-white mb-2">Programs not announced</h3>
        <p className="text-textSecondary">This university has not listed their programs yet.</p>
      </div>
    );
  }

  const filteredPrograms = activeFilter === "All" 
    ? programsList 
    : programsList.filter(p => p.level === activeFilter);

  const isDeadlineApproaching = (dateString: string) => {
    const deadline = new Date(dateString);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays <= 7 && diffDays > 0;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {LEVELS.map(level => (
          <button
            key={level}
            onClick={() => setActiveFilter(level)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeFilter === level 
                ? "bg-primary text-white" 
                : "bg-white/5 text-textSecondary hover:bg-white/10 hover:text-white"
            }`}
          >
            {level}
          </button>
        ))}
      </div>

      {/* Program List */}
      <div className="space-y-4">
        {filteredPrograms.map((program) => (
          <div key={program.id} className="bg-white/[0.02] border border-white/5 hover:border-primary/30 rounded-2xl p-6 transition-all group flex flex-col md:flex-row gap-6 md:items-center">
            
            <div className="flex-grow space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white rounded">
                    {program.level}
                  </span>
                  {program.entranceExamRequired && (
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-400 rounded border border-purple-500/30">
                      Entrance Exam Req.
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{program.name}</h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-textSecondary flex items-center mb-1"><Clock size={14} className="mr-1" /> Duration</div>
                  <div className="text-white font-medium">{program.duration}</div>
                </div>
                <div>
                  <div className="text-textSecondary flex items-center mb-1"><Users size={14} className="mr-1" /> Seats</div>
                  <div className="text-white font-medium">{program.totalSeats}</div>
                </div>
                <div>
                  <div className="text-textSecondary flex items-center mb-1"><IndianRupee size={14} className="mr-1" /> App Fee</div>
                  <div className="text-white font-medium">₹{program.applicationFee}</div>
                </div>
                <div>
                  <div className="text-textSecondary flex items-center mb-1"><CalendarCheck size={14} className="mr-1" /> Deadline</div>
                  <div className={`font-medium ${isDeadlineApproaching(program.applicationDeadline) ? "text-red-400" : "text-white"}`}>
                    {formatDate(program.applicationDeadline)}
                  </div>
                </div>
              </div>

              <div className="text-sm bg-white/5 p-3 rounded-xl border border-white/10 flex items-start">
                <FileText size={16} className="text-primary shrink-0 mr-2 mt-0.5" />
                <div>
                  <span className="font-semibold text-white mr-1">Eligibility:</span>
                  <span className="text-textSecondary">{program.eligibility}</span>
                </div>
              </div>
            </div>

            <div className="shrink-0 flex md:flex-col justify-end gap-3 mt-4 md:mt-0">
              <button 
                onClick={() => setSelectedProgram(program)}
                className="w-full md:w-40 py-3 rounded-xl font-semibold bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white shadow-lg shadow-primary/20 transition-all active:scale-95"
              >
                Apply Now
              </button>
            </div>
          </div>
        ))}

        {filteredPrograms.length === 0 && (
          <div className="text-center py-12 text-textSecondary bg-white/5 rounded-2xl border border-white/5">
            No programs found for "{activeFilter}".
          </div>
        )}
      </div>

      {selectedProgram && (
        <ApplicationModal 
          program={selectedProgram} 
          universityId={university.uid} 
          onClose={() => setSelectedProgram(null)} 
        />
      )}
    </div>
  );
}
