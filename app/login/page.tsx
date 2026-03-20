"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/account");
    }
  }, [loading, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (signInError) {
        setError(signInError.message);
        return;
      }
      router.replace("/account");
    } finally {
      setSubmitting(false);
    }
  };

  const envMissing =
    !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] max-w-6xl mx-auto gap-8 px-4">
        <div className="w-full lg:w-1/2 px-2 lg:px-6">
          <div className="h-full rounded-3xl relative overflow-hidden">
            <img
              src="/logo/loginpageimage.png"
              alt="Welcome"
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                if (e.currentTarget.src.includes('/logo/loginpageimage.png')) return;
                e.currentTarget.src = '/logo/loginpageimage.png';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black/80" />
            <div className="relative h-full p-8 md:p-12 flex flex-col justify-between">
              <div className="text-white text-4xl md:text-5xl">✽</div>
              <div className="text-white">
                <p className="text-base md:text-lg mb-3 opacity-90">Welcome to</p>
                <h2 className="text-2xl md:text-3xl font-bold leading-tight">
                  Tulsi Grocery<br />Taste Of India
                </h2>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center px-2 lg:px-8">
          <div className="w-full max-w-md">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="text-black text-4xl mb-4 md:mb-6">✽</div>
            <h1 className="text-3xl md:text-4xl font-bold text-black mb-2 md:mb-3">
              Login to your account
            </h1>
            <p className="text-gray-500 mb-6 md:mb-8">
              Access your orders, addresses, and preferences.
            </p>

            {envMissing && (
              <div className="mb-4 text-sm text-red-600">
                Missing Supabase env vars. Set `NEXT_PUBLIC_SUPABASE_URL` and
                `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
              </div>
            )}

            {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/40 bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/40 bg-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black text-sm"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 border border-gray-300 rounded"
                  />
                  Remember me
                </label>
                <Link href="/forgot-password" className="text-sm text-gray-500 hover:text-black">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={submitting || envMissing}
                className="w-full py-3 rounded-xl bg-black text-white font-semibold text-sm hover:bg-[#111827] transition-colors disabled:opacity-60"
              >
                {submitting ? "Logging in..." : "Login"}
              </button>
            </form>

            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-gray-200" />
              <span className="px-4 text-xs text-gray-400">or sign in with</span>
              <div className="flex-1 border-t border-gray-200" />
            </div>
            <div className="flex items-center gap-3">
              <button className="h-10 w-10 rounded-full border border-gray-200 text-gray-500 text-xs">G</button>
              <button className="h-10 w-10 rounded-full border border-gray-200 text-gray-500 text-xs"></button>
              <button className="h-10 w-10 rounded-full border border-gray-200 text-gray-500 text-xs">f</button>
            </div>

            <p className="text-center text-gray-500 mt-6">
              Don’t have an account?{" "}
              <Link href="/signup" className="text-black font-semibold">
                Create account
              </Link>
            </p>
            <p className="text-center text-gray-500 mt-3 text-sm">
              Ordered as a guest?{" "}
              <Link href="/guest-orders" className="text-black font-semibold">
                View your orders
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}




