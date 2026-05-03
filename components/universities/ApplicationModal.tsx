"use client";

import { useState } from "react";
import { Program } from "@/types/universityDetails";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, Loader2 } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface Props {
  program: Program;
  universityId: string;
  onClose: () => void;
}

export default function ApplicationModal({ program, universityId, onClose }: Props) {
  const [message, setMessage] = useState("");
  const [documentsConfirmed, setDocumentsConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentsConfirmed) {
      setError("Please confirm your documents are uploaded.");
      return;
    }
    
    if (!auth.currentUser) {
      setError("You must be logged in to apply.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await addDoc(collection(db, "applications"), {
        studentId: auth.currentUser.uid,
        universityId,
        programId: program.id,
        programName: program.name,
        message,
        status: "submitted",
        appliedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err: any) {
      console.error("Application error:", err);
      setError("Failed to submit application. Please try again.");
    } finally {
      if (!success) setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center p-0 sm:p-6">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        ></motion.div>

        {/* Modal Content */}
        <motion.div 
          initial={{ opacity: 0, y: "100%" }} 
          animate={{ opacity: 1, y: 0 }} 
          exit={{ opacity: 0, y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="relative w-full max-w-lg bg-background border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh] sm:max-h-[85vh] mx-auto pb-safe"
        >
          {success ? (
            <div className="p-10 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6">
                <CheckCircle size={40} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Application Submitted!</h2>
              <p className="text-textSecondary">
                You have successfully applied to the <span className="text-white font-medium">{program.name}</span> program. The university will review your profile shortly.
              </p>
            </div>
          ) : (
            <div className="flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/[0.02]">
                <h2 className="text-xl font-bold text-white">Apply for Program</h2>
                <button onClick={onClose} className="text-textSecondary hover:text-white p-1 transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Form Body */}
              <div className="p-6 overflow-y-auto custom-scrollbar">
                {error && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <form id="applicationForm" onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Program Summary */}
                  <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider mb-1 block">Selected Program</span>
                    <h3 className="text-lg font-bold text-white mb-2">{program.name}</h3>
                    <div className="flex justify-between text-sm text-textSecondary">
                      <span>Fee: ₹{program.applicationFee}</span>
                      <span>{program.duration}</span>
                    </div>
                  </div>

                  {/* Document Checklist */}
                  <div>
                    <label className="flex items-start space-x-3 cursor-pointer group bg-white/[0.02] border border-white/10 p-4 rounded-xl hover:bg-white/5 transition-colors">
                      <div className="pt-0.5">
                        <input 
                          type="checkbox" 
                          checked={documentsConfirmed}
                          onChange={(e) => setDocumentsConfirmed(e.target.checked)}
                          className="w-5 h-5 rounded border-border bg-background text-primary focus:ring-primary/50 focus:ring-offset-0 transition-all cursor-pointer"
                        />
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-white mb-1 group-hover:text-primary transition-colors">
                          I confirm that my profile documents are up to date.
                        </span>
                        <span className="block text-xs text-textSecondary leading-relaxed">
                          The university will access the 10th marksheet, 12th marksheet, and ID proof uploaded during your onboarding.
                        </span>
                      </div>
                    </label>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-2">Message to University (Optional)</label>
                    <textarea 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={3}
                      placeholder="Why are you a great fit for this program?"
                      className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none text-sm"
                    ></textarea>
                  </div>
                </form>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-white/5 bg-white/[0.02] flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={onClose}
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl font-medium text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  form="applicationForm"
                  disabled={submitting}
                  className="px-8 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center min-w-[160px]"
                >
                  {submitting ? <Loader2 className="animate-spin" size={20} /> : "Submit Application"}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
