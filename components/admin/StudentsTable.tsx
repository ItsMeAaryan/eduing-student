"use client";

import { useState } from "react";
import { Search, Eye, Filter, CheckCircle2, XCircle } from "lucide-react";

interface Props {
  students: any[];
}

export default function StudentsTable({ students }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filtered = students.filter(s => 
    s.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden flex flex-col h-[600px] animate-in fade-in">
      
      {/* Toolbar */}
      <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-black/20">
        <div className="relative w-full sm:w-80">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textSecondary" />
          <input 
            type="text" 
            placeholder="Search students by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors"
          />
        </div>
        
        <button className="flex items-center px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-medium transition-colors border border-white/10">
          <Filter size={16} className="mr-2" /> Filters
        </button>
      </div>

      {/* Table */}
      <div className="flex-grow overflow-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-textSecondary bg-white/[0.01] sticky top-0 backdrop-blur-md z-10">
              <th className="p-4 font-semibold">Student</th>
              <th className="p-4 font-semibold">Location</th>
              <th className="p-4 font-semibold hidden md:table-cell">Profile Status</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-textSecondary">
                  No students found.
                </td>
              </tr>
            ) : (
              filtered.map((student) => (
                <tr key={student.uid} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold mr-3 border border-blue-500/30">
                        {student.fullName ? student.fullName.charAt(0) : "S"}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{student.fullName || "Unnamed"}</div>
                        <div className="text-xs text-textSecondary">{student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-300">
                    {student.onboardingData?.city ? `${student.onboardingData.city}, ${student.onboardingData.state}` : "Unknown"}
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    {student.profileComplete ? (
                      <span className="flex items-center text-xs font-medium text-green-400">
                        <CheckCircle2 size={14} className="mr-1" /> Complete
                      </span>
                    ) : (
                      <span className="flex items-center text-xs font-medium text-yellow-400">
                        <XCircle size={14} className="mr-1" /> Incomplete
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      className="inline-flex p-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors border border-white/5"
                      title="View Student Info"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
