"use client";

import { useState } from "react";
import { Search, Eye, Filter } from "lucide-react";
import Link from "next/link";

interface Props {
  universities: any[];
}

export default function UniversitiesTable({ universities }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Exclude pending from main table, just approved/rejected
  const filtered = universities.filter(u => 
    u.approvalStatus !== "pending" && 
    (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     u.state.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden flex flex-col h-[600px] animate-in fade-in">
      
      {/* Toolbar */}
      <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-black/20">
        <div className="relative w-full sm:w-80">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textSecondary" />
          <input 
            type="text" 
            placeholder="Search universities by name or state..." 
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
              <th className="p-4 font-semibold">University</th>
              <th className="p-4 font-semibold">Location</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold hidden md:table-cell">Contact</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-textSecondary">
                  No universities found.
                </td>
              </tr>
            ) : (
              filtered.map((uni) => (
                <tr key={uni.uid} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-xl bg-white/5 text-textSecondary flex items-center justify-center font-bold mr-3 border border-white/10">
                        {uni.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="font-bold text-white text-sm">{uni.name}</div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-300">
                    {uni.city}, {uni.state}
                  </td>
                  <td className="p-4">
                    {uni.approvalStatus === "approved" ? (
                      <span className="px-2 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-md text-[10px] font-bold uppercase tracking-wider">
                        Approved
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-md text-[10px] font-bold uppercase tracking-wider">
                        Rejected
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-textSecondary hidden md:table-cell truncate max-w-[200px]">
                    {uni.email}
                  </td>
                  <td className="p-4 text-right">
                    <Link 
                      href={`/student/universities/${uni.uid}`}
                      target="_blank"
                      className="inline-flex p-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors border border-white/5"
                      title="View Public Profile"
                    >
                      <Eye size={16} />
                    </Link>
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
