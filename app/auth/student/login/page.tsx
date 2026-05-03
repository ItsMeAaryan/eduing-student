"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";

export default function StudentLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Mock login logic
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (formData.email && formData.password) {
        router.push("/student/dashboard");
      } else {
        throw new Error("Invalid email or password.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <AuthLayout 
      title="Welcome Back" 
      subtitle="Log in to your student account to track your applications."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
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
            value={formData.email}
            onChange={handleChange}
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            placeholder="john@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-textSecondary mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all pr-12"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-textSecondary hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <Link 
            href="/auth/forgot-password" 
            className="text-sm text-textSecondary hover:text-primary transition-colors"
          >
            Forgot Password?
          </Link>
        </div>

        <div className="flex justify-center mt-2">
          <button
            type="button"
            onClick={() => {
              setFormData({
                email: "demo.student@eduing.in",
                password: "Demo@1234"
              });
            }}
            style={{
              background: 'rgba(108,111,255,0.12)',
              border: '1px solid rgba(108,111,255,0.25)',
              color: '#6c6fff',
              borderRadius: '8px',
              padding: '6px 14px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(108,111,255,0.22)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(108,111,255,0.12)'}
          >
            ✦ Autofill
          </button>
        </div>

        <button
          type="submit"
          id="login-submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-3 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all flex justify-center items-center"
        >
          {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center text-textSecondary text-sm mt-6">
          Don't have an account?{" "}
          <Link href="/auth/student/register" className="text-primary hover:text-blue-400 font-medium transition-colors">
            Register
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
