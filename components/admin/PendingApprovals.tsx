"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { Check, X, MapPin, Globe, Mail, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface Props {
  universities: any[];
}

export default function PendingApprovals({ universities }: Props) {
  const pendingUnis = universities.filter(u => u.approvalStatus === "pending");
  
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<{title: string, msg: string, type: "success"|"error"} | null>(null);

  const showToast = (title: string, msg: string, type: "success"|"error") => {
    setToastMsg({ title, msg, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleApprove = async (uni: any) => {
    setProcessingId(uni.uid);
    try {
      await updateDoc(doc(db, "universities", uni.uid), {
        approvalStatus: "approved"
      });
      // Simulate sending email
      console.log(`[SIMULATED EMAIL] Sending approval email to ${uni.email}...`);
      showToast("University Approved", `An approval email has been sent to ${uni.name}.`, "success");
    } catch (error) {
      console.error(error);
      showToast("Error", "Failed to approve university.", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (uni: any) => {
    if (!rejectReason.trim()) {
      alert("Please provide a rejection reason.");
      return;
    }
    setProcessingId(uni.uid);
    try {
      await updateDoc(doc(db, "universities", uni.uid), {
        approvalStatus: "rejected",
        rejectionReason: rejectReason
      });
      console.log(`[SIMULATED EMAIL] Sending rejection email to ${uni.email} with reason: ${rejectReason}`);
      showToast("University Rejected", `Rejection logged and email sent to ${uni.name}.`, "success");
      setRejectingId(null);
      setRejectReason("");
    } catch (error) {
      console.error(error);
      showToast("Error", "Failed to reject university.", "error");
    } finally {
      setProcessingId(null);
    }
  };

  if (pendingUnis.length === 0) {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 text-center">
        <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check size={32} />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">All Caught Up!</h3>
        <p className="text-textSecondary">There are no pending university approvals at this time.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 p-4 rounded-xl border shadow-xl ${
              toastMsg.type === "success" ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}
          >
            <h4 className="font-bold">{toastMsg.title}</h4>
            <p className="text-sm">{toastMsg.msg}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Pending Approvals ({pendingUnis.length})</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pendingUnis.map((uni) => (
          <div key={uni.uid} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 relative overflow-hidden">
            
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-bold text-white text-lg leading-tight">{uni.name}</h4>
                <div className="flex items-center text-sm text-textSecondary mt-1">
                  <MapPin size={14} className="mr-1" /> {uni.city}, {uni.state}
                </div>
              </div>
              <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-md text-[10px] font-bold uppercase tracking-wider">
                Action Required
              </span>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 gap-3 mb-6 bg-black/20 rounded-xl p-4 border border-white/5 text-sm">
              <div className="flex items-center text-gray-300">
                <Mail size={14} className="text-primary mr-3 shrink-0" />
                <span className="truncate">{uni.email}</span>
              </div>
              {uni.website && (
                <div className="flex items-center text-gray-300">
                  <Globe size={14} className="text-primary mr-3 shrink-0" />
                  <a href={uni.website} target="_blank" rel="noreferrer" className="hover:underline truncate">{uni.website}</a>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => handleApprove(uni)}
                disabled={processingId === uni.uid}
                className="flex-1 py-2.5 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white border border-green-500/20 hover:border-transparent rounded-xl font-semibold transition-all flex items-center justify-center text-sm"
              >
                {processingId === uni.uid && !rejectingId ? <Loader2 size={16} className="animate-spin mr-2" /> : <Check size={16} className="mr-2" />}
                Approve
              </button>
              
              <button 
                onClick={() => setRejectingId(uni.uid)}
                disabled={processingId === uni.uid}
                className="flex-1 py-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 hover:border-transparent rounded-xl font-semibold transition-all flex items-center justify-center text-sm"
              >
                <X size={16} className="mr-2" />
                Reject
              </button>
            </div>

            {/* Rejection Modal Overlay (Local to card) */}
            <AnimatePresence>
              {rejectingId === uni.uid && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-background/95 backdrop-blur-md p-6 flex flex-col z-10"
                >
                  <h4 className="font-bold text-white mb-2 text-sm text-red-400">Reason for Rejection</h4>
                  <p className="text-xs text-textSecondary mb-3">This will be sent in an email to {uni.email}</p>
                  
                  <textarea 
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="E.g., Missing valid accreditation documentation..."
                    className="flex-grow bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white resize-none focus:border-red-500/50 outline-none mb-3"
                  ></textarea>
                  
                  <div className="flex gap-2 shrink-0">
                    <button 
                      onClick={() => setRejectingId(null)}
                      className="flex-1 py-2 text-xs font-medium text-textSecondary bg-white/5 rounded-lg hover:bg-white/10"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => handleReject(uni)}
                      disabled={processingId === uni.uid}
                      className="flex-1 py-2 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg flex items-center justify-center"
                    >
                      {processingId === uni.uid ? <Loader2 size={14} className="animate-spin" /> : "Confirm Reject"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        ))}
      </div>
    </div>
  );
}
