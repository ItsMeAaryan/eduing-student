"use client";

import { OnboardingData } from "@/types/onboarding";
import { Edit2, CheckCircle2 } from "lucide-react";

interface Props {
  data: OnboardingData;
  goToStep: (step: number) => void;
}

export default function Step5Review({ data, goToStep }: Props) {
  const examsList = Object.entries(data.exams).filter(([_, score]) => score.trim() !== "");

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="text-2xl font-bold text-white">Review Your Profile</h3>
        <p className="text-textSecondary mt-2">
          Please review the information below before finalizing your profile.
        </p>
      </div>

      {/* Personal Info Summary */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
        <div className="bg-white/5 px-6 py-4 border-b border-white/5 flex justify-between items-center">
          <h4 className="font-semibold text-white">Personal Information</h4>
          <button onClick={() => goToStep(1)} className="text-sm text-primary hover:text-blue-400 flex items-center">
            <Edit2 size={14} className="mr-1" /> Edit
          </button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-textSecondary block mb-1">Date of Birth</span>
            <span className="text-white font-medium">{data.dob || "Not provided"}</span>
          </div>
          <div>
            <span className="text-textSecondary block mb-1">Gender</span>
            <span className="text-white font-medium">{data.gender || "Not provided"}</span>
          </div>
          <div>
            <span className="text-textSecondary block mb-1">Phone Number</span>
            <span className="text-white font-medium">{data.phone || "Not provided"}</span>
          </div>
          <div>
            <span className="text-textSecondary block mb-1">Location</span>
            <span className="text-white font-medium">{data.city}{data.city && data.state ? ", " : ""}{data.state}</span>
          </div>
          <div className="md:col-span-2">
            <span className="text-textSecondary block mb-1">Address</span>
            <span className="text-white font-medium">{data.address || "Not provided"}</span>
          </div>
        </div>
      </div>

      {/* Academic Background Summary */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
        <div className="bg-white/5 px-6 py-4 border-b border-white/5 flex justify-between items-center">
          <h4 className="font-semibold text-white">Academic Background</h4>
          <button onClick={() => goToStep(2)} className="text-sm text-primary hover:text-blue-400 flex items-center">
            <Edit2 size={14} className="mr-1" /> Edit
          </button>
        </div>
        <div className="p-6 space-y-6 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-4 text-white font-medium pb-2 border-b border-white/5">10th Standard</div>
            <div className="md:col-span-2">
              <span className="text-textSecondary block mb-1">School</span>
              <span className="text-white">{data.school10th || "Not provided"}</span>
            </div>
            <div>
              <span className="text-textSecondary block mb-1">Board</span>
              <span className="text-white">{data.board10th || "Not provided"}</span>
            </div>
            <div>
              <span className="text-textSecondary block mb-1">Percentage / Year</span>
              <span className="text-white">{data.percentage10th} / {data.year10th}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-4 text-white font-medium pb-2 border-b border-white/5 flex justify-between">
              <span>12th Standard</span>
              <span className="text-primary">{data.stream}</span>
            </div>
            <div className="md:col-span-2">
              <span className="text-textSecondary block mb-1">School</span>
              <span className="text-white">{data.school12th || "Not provided"}</span>
            </div>
            <div>
              <span className="text-textSecondary block mb-1">Board</span>
              <span className="text-white">{data.board12th || "Not provided"}</span>
            </div>
            <div>
              <span className="text-textSecondary block mb-1">Percentage / Year</span>
              <span className="text-white">{data.percentage12th} / {data.year12th}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Exams Summary */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
        <div className="bg-white/5 px-6 py-4 border-b border-white/5 flex justify-between items-center">
          <h4 className="font-semibold text-white">Entrance Exams</h4>
          <button onClick={() => goToStep(3)} className="text-sm text-primary hover:text-blue-400 flex items-center">
            <Edit2 size={14} className="mr-1" /> Edit
          </button>
        </div>
        <div className="p-6">
          {examsList.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {examsList.map(([exam, score]) => (
                <div key={exam} className="bg-background p-3 rounded-lg border border-border">
                  <span className="text-textSecondary text-xs block mb-1">{exam}</span>
                  <span className="text-white font-medium">{score}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-textSecondary text-sm">No entrance exams provided.</p>
          )}
        </div>
      </div>

      {/* Documents Summary */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
        <div className="bg-white/5 px-6 py-4 border-b border-white/5 flex justify-between items-center">
          <h4 className="font-semibold text-white">Documents</h4>
          <button onClick={() => goToStep(4)} className="text-sm text-primary hover:text-blue-400 flex items-center">
            <Edit2 size={14} className="mr-1" /> Edit
          </button>
        </div>
        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-center">
          <div>
            <span className="text-textSecondary block mb-2">10th Marksheet</span>
            {data.marksheet10thUrl ? <CheckCircle2 className="mx-auto text-green-500" size={20} /> : <span className="text-red-400">Missing</span>}
          </div>
          <div>
            <span className="text-textSecondary block mb-2">12th Marksheet</span>
            {data.marksheet12thUrl ? <CheckCircle2 className="mx-auto text-green-500" size={20} /> : <span className="text-red-400">Missing</span>}
          </div>
          <div>
            <span className="text-textSecondary block mb-2">ID Proof</span>
            {data.idProofUrl ? <CheckCircle2 className="mx-auto text-green-500" size={20} /> : <span className="text-red-400">Missing</span>}
          </div>
          <div>
            <span className="text-textSecondary block mb-2">Photo</span>
            {data.passportPhotoUrl ? <CheckCircle2 className="mx-auto text-green-500" size={20} /> : <span className="text-red-400">Missing</span>}
          </div>
        </div>
      </div>

    </div>
  );
}
