"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Mail } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
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
      router.push("/auth/student/login");
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
    <div className="text-center">
      <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6">
        <Mail size={32} />
      </div>
      
      <p className="text-textSecondary mb-8">
        We sent a verification email to <br />
        <strong className="text-white">{emailParam || auth.currentUser?.email || "your email address"}</strong>.<br />
        Please click the link in that email to verify your account and continue.
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
          className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-3 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all flex justify-center items-center"
        >
          {verifying ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
          {verifying ? "Checking..." : "I have verified my email"}
        </button>

        <button
          onClick={handleResend}
          disabled={loading}
          className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold py-3 rounded-xl transition-all flex justify-center items-center"
        >
          {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
          {loading ? "Sending..." : "Resend Verification Email"}
        </button>
      </div>
    </div>
  );
}

export default function VerifyEmail() {
  return (
    <AuthLayout title="Verify your email" subtitle="Just one more step to get started.">
      <Suspense fallback={<div className="text-center text-textSecondary"><Loader2 className="animate-spin mx-auto" size={24} /></div>}>
        <VerifyEmailContent />
      </Suspense>
    </AuthLayout>
  );
}
