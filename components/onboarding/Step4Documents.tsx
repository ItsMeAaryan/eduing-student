"use client";

import { useState } from "react";
import { OnboardingData } from "@/types/onboarding";
import { UploadCloud, CheckCircle, File, X, Loader2 } from "lucide-react";
import { auth, storage } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

interface Props {
  data: OnboardingData;
  updateData: (fields: Partial<OnboardingData>) => void;
}

type DocType = "marksheet10thUrl" | "marksheet12thUrl" | "idProofUrl" | "passportPhotoUrl";

const DOCUMENTS: { id: DocType; title: string; desc: string }[] = [
  { id: "marksheet10thUrl", title: "10th Marksheet", desc: "PDF or Image, max 5MB" },
  { id: "marksheet12thUrl", title: "12th Marksheet", desc: "PDF or Image, max 5MB" },
  { id: "idProofUrl", title: "ID Proof", desc: "Aadhaar or Passport (PDF/Image)" },
  { id: "passportPhotoUrl", title: "Passport Size Photo", desc: "Recent photo (Image only)" },
];

export default function Step4Documents({ data, updateData }: Props) {
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [error, setError] = useState<string>("");

  const handleFileUpload = async (file: File, docType: DocType) => {
    if (!auth.currentUser) {
      setError("You must be logged in to upload files.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(`${file.name} exceeds the 5MB limit.`);
      return;
    }

    setError("");
    setUploading((prev) => ({ ...prev, [docType]: true }));
    setProgress((prev) => ({ ...prev, [docType]: 0 }));

    try {
      const ext = file.name.split('.').pop();
      const storageRef = ref(storage, `documents/${auth.currentUser.uid}/${docType}.${ext}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress((prev) => ({ ...prev, [docType]: p }));
        },
        (err) => {
          console.error("Upload error:", err);
          setError("Failed to upload document. Please try again.");
          setUploading((prev) => ({ ...prev, [docType]: false }));
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          updateData({ [docType]: downloadURL });
          setUploading((prev) => ({ ...prev, [docType]: false }));
          
          // Also set profilePhotoUrl if this is the passport photo step
          if (docType === "passportPhotoUrl" && !data.profilePhotoUrl) {
            updateData({ profilePhotoUrl: downloadURL });
          }
        }
      );
    } catch (err) {
      console.error(err);
      setError("An error occurred during upload.");
      setUploading((prev) => ({ ...prev, [docType]: false }));
    }
  };

  const handleDrop = (e: React.DragEvent, docType: DocType) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0], docType);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeFile = (docType: DocType) => {
    updateData({ [docType]: "" });
  };

  return (
    <div className="space-y-6">
      <p className="text-textSecondary mb-6">
        Upload clear and legible copies of your documents. These will be securely shared with universities you apply to.
      </p>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {DOCUMENTS.map((doc) => {
          const fileUrl = data[doc.id as keyof OnboardingData] as string;
          const isUploading = uploading[doc.id];
          const currentProgress = progress[doc.id] || 0;

          return (
            <div key={doc.id} className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h4 className="font-medium text-white">{doc.title}</h4>
                  <p className="text-xs text-textSecondary">{doc.desc}</p>
                </div>
                {fileUrl && <CheckCircle className="text-green-500" size={20} />}
              </div>

              {fileUrl ? (
                <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10">
                  <div className="flex items-center truncate mr-2">
                    <File size={16} className="text-primary mr-2 flex-shrink-0" />
                    <a href={fileUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-400 hover:underline truncate">
                      View Uploaded Document
                    </a>
                  </div>
                  <button onClick={() => removeFile(doc.id)} className="text-textSecondary hover:text-red-400 transition-colors p-1">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div 
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                    isUploading ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/50 bg-white/5 cursor-pointer"
                  }`}
                  onDrop={(e) => handleDrop(e, doc.id)}
                  onDragOver={handleDragOver}
                  onClick={() => !isUploading && document.getElementById(`file-${doc.id}`)?.click()}
                >
                  <input 
                    type="file" 
                    id={`file-${doc.id}`} 
                    className="hidden" 
                    accept={doc.id === 'passportPhotoUrl' ? "image/*" : "image/*,.pdf"}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0], doc.id);
                      }
                    }}
                  />
                  
                  {isUploading ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="animate-spin text-primary mb-2" size={24} />
                      <div className="w-full bg-background rounded-full h-1.5 mt-2 overflow-hidden">
                        <div className="bg-primary h-1.5 rounded-full transition-all duration-300" style={{ width: `${currentProgress}%` }}></div>
                      </div>
                      <span className="text-xs text-textSecondary mt-2">{Math.round(currentProgress)}%</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center group">
                      <UploadCloud className="text-textSecondary group-hover:text-primary transition-colors mb-2" size={28} />
                      <p className="text-sm text-textSecondary font-medium group-hover:text-white transition-colors">
                        Click to upload or drag & drop
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
