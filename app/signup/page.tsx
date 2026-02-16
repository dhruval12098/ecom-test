"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

  useEffect(() => {
    if (!loading && user) {
      router.replace("/account");
    }
  }, [loading, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);
    try {
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

  const envMissing =
    !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] max-w-6xl mx-auto gap-8 px-4">
        <div className="w-full lg:w-1/2 px-2 lg:px-6">
          <div className="h-full rounded-3xl relative overflow-hidden">
            <img
              src="/auth-left.jpg"
              alt="Welcome"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black/80" />
            <div className="relative h-full p-8 md:p-12 flex flex-col justify-between">
              <div className="text-white text-4xl md:text-5xl">✽</div>
              <div className="text-white">
                <p className="text-base md:text-lg mb-3 opacity-90">Join</p>
                <h2 className="text-2xl md:text-3xl font-bold leading-tight">
                  GRD FOOD<br />Your Indian Pantry
                </h2>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center px-2 lg:px-8">
          <div className="w-full max-w-md">
            <div className="text-black text-4xl mb-4 md:mb-6">✽</div>
            <h1 className="text-3xl md:text-4xl font-bold text-black mb-2 md:mb-3">
              Create your account
            </h1>
            <p className="text-gray-500 mb-6 md:mb-8">
              Save orders, addresses, and faster checkout.
            </p>

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
                disabled={submitting || envMissing || !agreed}
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
            <div className="flex items-center gap-3">
              <button className="h-10 w-10 rounded-full border border-gray-200 text-gray-500 text-xs">G</button>
              <button className="h-10 w-10 rounded-full border border-gray-200 text-gray-500 text-xs"></button>
              <button className="h-10 w-10 rounded-full border border-gray-200 text-gray-500 text-xs">f</button>
            </div>

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
