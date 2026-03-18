"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const redirectTo = `${origin}/reset-password`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo
      });
      if (resetError) {
        setError(resetError.message);
        return;
      }
      setInfo("If an account exists for this email, a reset link has been sent.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] max-w-6xl mx-auto gap-8 px-4">
        <div className="w-full lg:w-1/2 px-2 lg:px-6">
          <div className="h-full rounded-3xl relative overflow-hidden">
            <img
              src="/logo/loginpageimage.png"
              alt="Reset password"
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                if (e.currentTarget.src.includes("/logo/loginpageimage.png")) return;
                e.currentTarget.src = "/logo/loginpageimage.png";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black/80" />
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center px-2 lg:px-8">
          <div className="w-full max-w-md">
            <h1 className="text-3xl md:text-4xl font-bold text-black mb-2 md:mb-3">Forgot password</h1>
            <p className="text-gray-500 mb-6 md:mb-8">Enter your email to receive a password reset link.</p>

            {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
            {info && <div className="mb-4 text-sm text-green-600">{info}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-black mb-2">Email</label>
                <input
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/40 bg-white"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-black text-white font-semibold text-sm hover:bg-[#111827] transition-colors disabled:opacity-60"
              >
                {submitting ? "Sending..." : "Send reset link"}
              </button>
            </form>

            <p className="text-center text-gray-500 mt-6">
              Remembered your password?{" "}
              <Link href="/login" className="text-black font-semibold">
                Back to login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

