// app/auth/verify-email/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Mail, CheckCircle2, AlertCircle } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { sendEmailVerification, reload } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";

const INPUT_STYLE: React.CSSProperties = {
  width: "100%",
  height: 38,
  background: "var(--bg-elevated)",
  border: "1px solid var(--border)",
  borderRadius: 6,
  padding: "7px 11px",
  fontSize: 14,
  color: "var(--text-primary)",
  outline: "none",
};

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!auth.currentUser && !emailParam) router.push("/auth/login");
  }, [router, emailParam]);

  const handleResend = async () => {
    setMessage(""); setError(""); setLoading(true);
    try {
      if (!auth.currentUser) {
        setError("You are not logged in. Please sign in to resend.");
      } else {
        await sendEmailVerification(auth.currentUser);
        setMessage("Verification email sent! Please check your inbox.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to resend. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCheck = async () => {
    setMessage(""); setError(""); setVerifying(true);
    try {
      if (!auth.currentUser) throw new Error("No user found. Please login again.");
      await reload(auth.currentUser);
      if (auth.currentUser.emailVerified) {
        await updateDoc(doc(db, "users", auth.currentUser.uid), { isVerified: true });
        setMessage("Email verified! Redirecting…");
        setTimeout(() => router.push("/student/onboarding"), 1400);
      } else {
        setError("Email not verified yet. Click the link in your inbox, then try again.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: "var(--accent-bg)",
          border: "1px solid var(--accent-border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 18,
        }}>
          <Mail size={22} style={{ color: "var(--accent)" }} strokeWidth={1.8} />
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.5px", color: "var(--text-primary)", marginBottom: 8 }}>
          Verify Your Email
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5 }}>
          We sent a verification link to{" "}
          <strong style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            {emailParam || auth.currentUser?.email || "your email address"}
          </strong>.
          Click the link to continue.
        </p>
      </div>

      {/* Feedback */}
      {message && (
        <div style={{
          display: "flex", alignItems: "flex-start", gap: 10,
          padding: "11px 14px", marginBottom: 16,
          background: "rgba(26,174,57,0.08)",
          border: "1px solid rgba(26,174,57,0.2)",
          borderRadius: 8, fontSize: 13, color: "#1AAE39", lineHeight: 1.4,
        }}>
          <CheckCircle2 size={15} style={{ flexShrink: 0, marginTop: 1 }} />
          {message}
        </div>
      )}
      {error && (
        <div style={{
          display: "flex", alignItems: "flex-start", gap: 10,
          padding: "11px 14px", marginBottom: 16,
          background: "rgba(220,38,38,0.07)",
          border: "1px solid rgba(220,38,38,0.2)",
          borderRadius: 8, fontSize: 13, color: "var(--red)", lineHeight: 1.4,
        }}>
          <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
          {error}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button
          onClick={handleVerifyCheck}
          disabled={verifying}
          style={{
            width: "100%", height: 38,
            background: "var(--accent)", color: "#fff",
            border: "none", borderRadius: 8,
            fontSize: 13, fontWeight: 600, cursor: verifying ? "wait" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            opacity: verifying ? 0.65 : 1, transition: "opacity 0.15s",
          }}
        >
          {verifying ? <Loader2 size={15} className="animate-spin" /> : "I have verified my email"}
        </button>

        <button
          onClick={handleResend}
          disabled={loading}
          style={{
            width: "100%", height: 38,
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            borderRadius: 8, fontSize: 13, fontWeight: 500,
            color: "var(--text-secondary)", cursor: loading ? "wait" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            opacity: loading ? 0.65 : 1, transition: "opacity 0.15s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-hover)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)"; }}
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : "Resend Verification Email"}
        </button>
      </div>
    </div>
  );
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
        <Loader2 size={24} className="animate-spin" style={{ color: "var(--text-muted)" }} />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}