// app/auth/forgot-password/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, KeyRound, CheckCircle2, AlertCircle } from "lucide-react";
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setMessage(""); setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Reset link sent! Check your inbox and follow the instructions.");
      setEmail("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send reset email.";
      // Map Firebase codes to user-friendly messages
      if (msg.includes("user-not-found")) setError("No account found with this email address.");
      else if (msg.includes("invalid-email")) setError("Please enter a valid email address.");
      else setError("Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <div
          style={{
            width: 48, height: 48, borderRadius: 12,
            background: 'var(--accent-bg)',
            border: '1px solid var(--accent-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 20,
          }}
        >
          <KeyRound size={22} style={{ color: 'var(--accent)' }} strokeWidth={1.8} />
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text-primary)', marginBottom: 8 }}>
          Reset Password
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Enter your email to receive a secure password reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {message && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px',
            background: 'rgba(26,174,57,0.08)', border: '1px solid rgba(26,174,57,0.2)',
            borderRadius: 8, fontSize: 13, color: '#1AAE39', lineHeight: 1.4,
          }}>
            <CheckCircle2 size={15} style={{ flexShrink: 0, marginTop: 1 }} />
            {message}
          </div>
        )}

        {error && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px',
            background: 'rgba(220,38,38,0.07)', border: '1px solid rgba(220,38,38,0.2)',
            borderRadius: 8, fontSize: 13, color: '#DC2626', lineHeight: 1.4,
          }}>
            <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="reset-email"
            style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}
          >
            Email Address
          </label>
          <input
            id="reset-email"
            type="email"
            name="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            style={{
              width: '100%',
              height: 40,
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '0 12px',
              fontSize: 14,
              color: 'var(--text-primary)',
              outline: 'none',
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 2px var(--accent-bg)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !!message}
          style={{
            width: '100%', height: 40,
            background: 'var(--accent)', color: '#fff',
            border: 'none', borderRadius: 8,
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            opacity: (loading || !!message) ? 0.6 : 1,
            transition: 'opacity 0.15s',
          }}
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : 'Send Reset Link'}
        </button>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
          Remember your password?{' '}
          <Link href="/auth/login" style={{ color: 'var(--accent)', fontWeight: 500, textDecoration: 'none' }}>
            Back to Login
          </Link>
        </p>
      </form>
    </div>
  );
}