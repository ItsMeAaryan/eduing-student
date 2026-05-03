"use client";

import { OnboardingData } from "@/types/onboarding";
import { Check } from "lucide-react";

interface Props {
  data: OnboardingData;
  updateData: (fields: Partial<OnboardingData>) => void;
}

const EXAMS_LIST = [
  "JEE Main", "JEE Advanced", "NEET", "CAT", "MAT", "CUET", "CLAT", "Other"
];

export default function Step3Exams({ data, updateData }: Props) {
  
  const handleToggleExam = (exam: string) => {
    const newExams = { ...data.exams };
    if (newExams[exam] !== undefined) {
      delete newExams[exam];
    } else {
      newExams[exam] = ""; // initialize with empty score
    }
    updateData({ exams: newExams });
  };

  const handleUpdateScore = (exam: string, score: string) => {
    updateData({
      exams: { ...data.exams, [exam]: score }
    });
  };

  return (
    <div className="space-y-6">
      <p className="text-textSecondary mb-6">
        Select the entrance exams you have appeared for (or will appear for) to help us find the best universities for you. This step is optional.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {EXAMS_LIST.map(exam => {
          const isSelected = data.exams[exam] !== undefined;

          return (
            <div 
              key={exam}
              className={`p-4 rounded-xl border transition-all ${
                isSelected 
                  ? "bg-primary/10 border-primary/50" 
                  : "bg-white/5 border-border hover:bg-white/10"
              }`}
            >
              <div 
                className="flex items-center cursor-pointer"
                onClick={() => handleToggleExam(exam)}
              >
                <div className={`w-6 h-6 rounded border flex items-center justify-center mr-3 transition-colors ${
                  isSelected ? "bg-primary border-primary text-white" : "border-textSecondary"
                }`}>
                  {isSelected && <Check size={16} />}
                </div>
                <span className={`font-medium ${isSelected ? "text-white" : "text-textSecondary"}`}>
                  {exam}
                </span>
              </div>

              {isSelected && (
                <div className="mt-4 pl-9">
                  <input
                    type="text"
                    value={data.exams[exam]}
                    onChange={(e) => handleUpdateScore(exam, e.target.value)}
                    placeholder="Enter Score or Rank"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
