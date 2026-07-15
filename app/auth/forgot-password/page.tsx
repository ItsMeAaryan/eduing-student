"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, KeyRound } from "lucide-react";
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent! Please check your inbox and follow the instructions to reset your password.");
      setEmail(""); // clear the input
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to send password reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
        <div className="mb-10 text-left">
          <h1 className="text-[42px] sm:text-[48px] font-display font-[800] tracking-tighter leading-[1.05] text-white mb-3 uppercase">
            Reset<br />Password.
          </h1>
          <p className="text-[15px] font-sans font-medium text-white/50 leading-relaxed">
            Enter your email to receive a secure reset link.
          </p>
        </div>

        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 bg-[#4F46E5]/20 text-[#6366F1] rounded-full flex items-center justify-center">
            <KeyRound size={32} />
          </div>
        </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {message && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block font-sans text-[13px] font-medium text-white/70 mb-2">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            name="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/[0.02] border border-white/10 rounded-[12px] px-4 h-[56px] text-[14px] text-white focus:border-brand-indigo focus:bg-brand-indigo/5 focus:ring-4 focus:ring-brand-indigo/10 outline-none transition-all duration-200 placeholder:text-white/30"
            placeholder="john@example.com"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !!message}
          className="w-full font-display font-bold text-[15px] bg-gradient-to-b from-[#4F46E5] to-[#4338CA] text-white h-[56px] rounded-[14px] shadow-[0_4px_12px_rgba(79,70,229,0.3),inset_0_1px_1px_rgba(255,255,255,0.2)] hover:shadow-[0_6px_16px_rgba(79,70,229,0.4),inset_0_1px_1px_rgba(255,255,255,0.25)] hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3"
        >
          {loading ? <Loader2 className="animate-spin text-white" size={18} /> : <span>Send Reset Link</span>}
        </button>

        <p className="text-center text-white/50 text-[13px] mt-6">
          Remember your password?{" "}
          <Link href="/auth/login" className="text-white hover:text-white/80 font-medium transition-colors">
            Back to Login
          </Link>
        </p>
      </form>
      </div>
  );
}
