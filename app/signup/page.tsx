"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import ApiService from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [lastMethod, setLastMethod] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/account");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("tulsi_last_auth_method");
    setLastMethod(stored);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("tulsi_pending_auth_method", "Email & Password");
    }
    try {
      if (!phone.trim()) {
        setError("Phone number is required.");
        return;
      }
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      const authUserId = data.user?.id;
      if (authUserId) {
        await ApiService.upsertCustomer({
          auth_user_id: authUserId,
          full_name: fullName,
          email,
          phone
        });
      } else {
        setInfo("Account created. Please check your email to confirm.");
      }

      router.replace("/account");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError(null);
    setInfo(null);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("tulsi_pending_auth_method", "Google");
    }
    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/account`
        : undefined;
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: redirectTo ? { redirectTo } : undefined
    });
    if (oauthError) {
      setError(oauthError.message);
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
                <p className="text-base md:text-lg mb-3 opacity-90">Join</p>
                <h2 className="text-2xl md:text-3xl font-bold leading-tight">
                  Tulsi Grocery<br />Your Indian Pantry
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
              Create your account
            </h1>
            <p className="text-gray-500 mb-6 md:mb-8">
              Save orders, addresses, and faster checkout.
            </p>
            {lastMethod && (
              <div className="mb-4 text-xs text-gray-500">
                Last sign-in method: <span className="font-semibold text-gray-700">{lastMethod}</span>
              </div>
            )}

            {envMissing && (
              <div className="mb-4 text-sm text-red-600">
                Missing Supabase env vars. Set `NEXT_PUBLIC_SUPABASE_URL` and
                `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
              </div>
            )}

            {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
            {info && <div className="mb-4 text-sm text-green-600">{info}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/40 bg-white"
                  required
                />
              </div>
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
                  Phone
                </label>
                <input
                  type="tel"
                  placeholder="+32 4xx xxx xxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
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

              <label className="flex items-start gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 w-4 h-4 border border-gray-300 rounded"
                />
                <span>
                  I agree to the{" "}
                  <Link href="/terms-and-conditions" className="text-black font-semibold">
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy-policy" className="text-black font-semibold">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>

              <button
                type="submit"
                disabled={submitting || envMissing || !agreed || !phone.trim()}
                className="w-full py-3 rounded-xl bg-black text-white font-semibold text-sm hover:bg-[#111827] transition-colors disabled:opacity-60"
              >
                {submitting ? "Creating..." : "Create account"}
              </button>
            </form>

            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-gray-200" />
              <span className="px-4 text-xs text-gray-400">or sign up with</span>
              <div className="flex-1 border-t border-gray-200" />
            </div>
            <button
              type="button"
              onClick={handleGoogleSignUp}
              className="w-full py-3 rounded-full border border-gray-200 bg-white text-black font-semibold text-sm hover:bg-gray-50 hover:shadow-sm transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="inline-flex h-5 w-5 items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                  <path fill="#FFC107" d="M43.6 20.4H42V20H24v8h11.3C33.7 32.4 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 6 .9 8.4 2.6l5.7-5.7C34.6 6.2 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.6z"/>
                  <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.1 18.9 12 24 12c3.1 0 6 .9 8.4 2.6l5.7-5.7C34.6 6.2 29.5 4 24 4 16.2 4 9.4 8.3 6.3 14.7z"/>
                  <path fill="#4CAF50" d="M24 44c5.2 0 10.1-2 13.7-5.3l-6.3-5.2C29.3 36 26.8 37 24 37c-5.2 0-9.7-3.5-11.3-8.3l-6.6 5.1C9.2 39.7 16.1 44 24 44z"/>
                  <path fill="#1976D2" d="M43.6 20.4H42V20H24v8h11.3c-1.2 3-3.6 5.4-6.6 6.6l6.3 5.2C36 38.8 44 34 44 24c0-1.3-.1-2.6-.4-3.6z"/>
                </svg>
              </span>
              Continue with Google
            </button>

            <p className="text-center text-gray-500 mt-6">
              Already have an account?{" "}
              <Link href="/login" className="text-black font-semibold">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}




