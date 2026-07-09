"use client";

import { OnboardingData } from "@/types/onboarding";

interface Props {
  data: OnboardingData;
  updateData: (fields: Partial<OnboardingData>) => void;
}

export default function Step2Academic({ data, updateData }: Props) {
  return (
    <div className="space-y-8">
      {/* 10th Standard */}
      <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl space-y-6">
        <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-3">10th Standard</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label htmlFor="step2-school10th" className="block text-sm font-medium text-textSecondary mb-1.5">School Name</label>
            <input 
              type="text" 
              value={data.school10th} 
              onChange={(e) => updateData({ school10th: e.target.value })}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
          <div>
            <label htmlFor="step2-board10th" className="block text-sm font-medium text-textSecondary mb-1.5">Board</label>
            <select 
              id="step2-board10th"
              value={data.board10th} 
              onChange={(e) => updateData({ board10th: e.target.value })}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none"
            >
              <option value="">Select Board</option>
              <option value="CBSE">CBSE</option>
              <option value="ICSE">ICSE</option>
              <option value="State Board">State Board</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="step2-percentage10th" className="block text-sm font-medium text-textSecondary mb-1.5">Percentage/CGPA</label>
              <input 
                id="step2-percentage10th"
                type="text" 
                value={data.percentage10th} 
                onChange={(e) => updateData({ percentage10th: e.target.value })}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label htmlFor="step2-year10th" className="block text-sm font-medium text-textSecondary mb-1.5">Passing Year</label>
              <input 
                id="step2-year10th"
                type="number" 
                value={data.year10th} 
                onChange={(e) => updateData({ year10th: e.target.value })}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                placeholder="2020"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 12th Standard */}
      <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl space-y-6">
        <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-3">12th Standard / Diploma</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label htmlFor="step2-school12th" className="block text-sm font-medium text-textSecondary mb-1.5">School/College Name</label>
            <input 
              type="text" 
              value={data.school12th} 
              onChange={(e) => updateData({ school12th: e.target.value })}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
          <div>
            <label htmlFor="step2-board12th" className="block text-sm font-medium text-textSecondary mb-1.5">Board</label>
            <select 
              id="step2-board12th"
              value={data.board12th} 
              onChange={(e) => updateData({ board12th: e.target.value })}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none"
            >
              <option value="">Select Board</option>
              <option value="CBSE">CBSE</option>
              <option value="ICSE">ICSE</option>
              <option value="State Board">State Board</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="step2-percentage12th" className="block text-sm font-medium text-textSecondary mb-1.5">Percentage/CGPA</label>
              <input 
                id="step2-percentage12th"
                type="text" 
                value={data.percentage12th} 
                onChange={(e) => updateData({ percentage12th: e.target.value })}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label htmlFor="step2-year12th" className="block text-sm font-medium text-textSecondary mb-1.5">Passing Year</label>
              <input 
                id="step2-year12th"
                type="number" 
                value={data.year12th} 
                onChange={(e) => updateData({ year12th: e.target.value })}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                placeholder="2022"
              />
            </div>
          </div>
          
          <div className="md:col-span-2 mt-2">
            <span className="block text-sm font-medium text-textSecondary mb-3">Stream</span>
            <div className="flex flex-wrap gap-4" role="group" aria-label="Stream">
              {["Science", "Commerce", "Arts", "Diploma"].map(stream => (
                <button
                  key={stream}
                  type="button"
                  onClick={() => updateData({ stream })}
                  className={`px-6 py-2.5 rounded-xl border transition-all ${
                    data.stream === stream 
                      ? "bg-primary/20 border-primary text-primary font-medium" 
                      : "bg-white/5 border-border text-textSecondary hover:bg-white/10"
                  }`}
                >
                  {stream}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
