"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Mail } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { sendEmailVerification, reload } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // If no user is logged in, they shouldn't be here (ideally we handle this with middleware later)
    if (!auth.currentUser && !emailParam) {
      router.push("/auth/login");
    }
  }, [router, emailParam]);

  const handleResend = async () => {
    setMessage("");
    setError("");
    setLoading(true);
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        setMessage("Verification email sent! Please check your inbox.");
      } else {
        setError("You are not logged in. Please login to resend the verification email.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to resend verification email. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCheck = async () => {
    setMessage("");
    setError("");
    setVerifying(true);
    try {
      if (!auth.currentUser) {
        throw new Error("No user found. Please login again.");
      }

      await reload(auth.currentUser);
      
      if (auth.currentUser.emailVerified) {
        // Update firestore to mark as verified
        const userRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userRef, {
          isVerified: true
        });
        
        setMessage("Email verified successfully! Redirecting...");
        setTimeout(() => {
          router.push("/student/onboarding");
        }, 1500);
      } else {
        setError("Your email is not verified yet. Please check your inbox and click the verification link.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while checking verification status.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="w-full text-center">
      <p className="text-[14px] text-white/50 mb-8 leading-relaxed">
        We sent a verification link to <strong className="text-white font-[600]">{emailParam || auth.currentUser?.email || "your email address"}</strong>.<br />
        Click the link to verify your account and continue.
      </p>

      {message && (
        <div className="mb-6 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <button
          onClick={handleVerifyCheck}
          disabled={verifying}
          className="w-full font-display font-bold text-[15px] bg-gradient-to-b from-[#4F46E5] to-[#4338CA] text-white h-[56px] rounded-[14px] shadow-[0_4px_12px_rgba(79,70,229,0.3),inset_0_1px_1px_rgba(255,255,255,0.2)] hover:shadow-[0_6px_16px_rgba(79,70,229,0.4),inset_0_1px_1px_rgba(255,255,255,0.25)] hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3"
        >
          {verifying ? <Loader2 className="animate-spin text-white" size={18} /> : <span>I have verified my email</span>}
        </button>

        <button
          onClick={handleResend}
          disabled={loading}
          className="w-full font-display font-medium text-[14px] flex items-center justify-center h-[56px] bg-transparent border border-white/10 hover:bg-white/[0.03] hover:border-white/20 rounded-[14px] transition-all text-white/70 hover:text-white"
        >
          {loading ? <Loader2 className="animate-spin text-white" size={18} /> : "Resend Verification Email"}
        </button>
      </div>
    </div>
  );
}

export default function VerifyEmail() {
  return (
    <div className="w-full">
        <div className="mb-10 text-left">
          <h1 className="text-[42px] sm:text-[48px] font-display font-[800] tracking-tighter leading-[1.05] text-white mb-3 uppercase">
            Verify<br />Email.
          </h1>
          <p className="text-[15px] font-sans font-medium text-white/50 leading-relaxed">
            Just one more step to get started.
          </p>
        </div>
        <Suspense fallback={<div className="text-center text-white/50"><Loader2 className="animate-spin mx-auto" size={24} /></div>}>
          <VerifyEmailContent />
        </Suspense>
      </div>
  );
}
