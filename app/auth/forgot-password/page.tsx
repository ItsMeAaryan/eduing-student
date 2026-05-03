"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, KeyRound } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
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
    <AuthLayout 
      title="Reset Password" 
      subtitle="Enter your email to receive a password reset link."
    >
      <div className="mb-6 flex justify-center">
        <div className="w-16 h-16 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center">
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
          <label className="block text-sm font-medium text-textSecondary mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            placeholder="john@example.com"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !!message}
          className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-3 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        <p className="text-center text-textSecondary text-sm mt-6">
          Remember your password?{" "}
          <Link href="/auth/student/login" className="text-primary hover:text-blue-400 font-medium transition-colors">
            Back to Login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
