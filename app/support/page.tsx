"use client";

import { useMemo, useState } from "react";
import ApiService from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const CATEGORIES = ["Order", "Shipping", "Payments", "Account", "Other"];
const PRIORITIES = ["low", "normal", "high"];

export default function SupportPage() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [priority, setPriority] = useState(PRIORITIES[1]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const canSubmit = useMemo(() => {
    if (!message.trim()) return false;
    if (user) return true;
    return name.trim().length > 1 && email.trim().length > 3;
  }, [message, user, name, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || loading) return;
    setLoading(true);
    setSuccess(false);
    try {
      await ApiService.createSupportTicket({
        user_id: user?.id || null,
        user_name: user ? (user.email ? user.email.split('@')[0] : 'User') : null,
        user_email: user?.email || null,
        guest_name: user ? null : name.trim(),
        guest_email: user ? null : email.trim(),
        subject: subject.trim() || "Support Request",
        message: message.trim(),
        category,
        priority
      });
      setSuccess(true);
      setSubject("");
      setMessage("");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-white via-white to-gray-50 py-14">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Support Center</h1>
          <p className="mt-4 text-gray-600 text-lg">
            Tell us what you need help with. Our team will get back to you quickly.
          </p>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-8 md:p-10 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-7">
            {!user && (
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Full name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-3 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-3 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
            )}

            {user && (
              <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
                You are signed in as <span className="font-medium">{user.email}</span>
              </div>
            )}

            <div className="border-t border-gray-100" />

            <div>
              <label className="text-sm font-medium text-gray-700">Subject</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-3 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm"
                placeholder="Short summary"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-700">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-3 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm"
                >
                  {CATEGORIES.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="mt-3 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm"
                >
                  {PRIORITIES.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={7}
                className="mt-3 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm"
                placeholder="Describe your issue in detail"
              />
            </div>

            {success && (
              <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-700">
                Your request has been submitted. We will reply soon.
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit || loading}
              className="w-full rounded-xl bg-[#173A00] py-3.5 text-sm font-semibold text-white hover:bg-[#1f4b00] disabled:opacity-50"
            >
              {loading ? "Sending..." : "Submit Support Request"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
