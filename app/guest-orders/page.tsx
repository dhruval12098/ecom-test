"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Package } from "lucide-react";
import ApiService from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { toast } from "sonner";

interface Order {
  id: number;
  orderNumber: string;
  date: string;
  status: string;
  total: number;
  items: number;
}

export default function GuestOrdersPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);

  const normalizeStatus = (value: string) => {
    const raw = (value || "").toString().trim().toLowerCase();
    if (!raw) return "Pending";
    if (raw === "out_for_delivery" || raw === "out for delivery") return "Out for Delivery";
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  };

  const statusStyles: Record<string, string> = {
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
    Confirmed: "bg-blue-50 text-blue-700 border-blue-200",
    Preparing: "bg-purple-50 text-purple-700 border-purple-200",
    "Out for Delivery": "bg-indigo-50 text-indigo-700 border-indigo-200",
    Delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Cancelled: "bg-rose-50 text-rose-700 border-rose-200",
    Shipped: "bg-sky-50 text-sky-700 border-sky-200"
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem("guestOrdersState");
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored);
      if (parsed?.email) setEmail(String(parsed.email));
      if (parsed?.otpSent) setOtpSent(Boolean(parsed.otpSent));
      if (parsed?.isVerified) setIsVerified(Boolean(parsed.isVerified));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(
      "guestOrdersState",
      JSON.stringify({
        email,
        otpSent,
        isVerified
      })
    );
  }, [email, otpSent, isVerified]);

  const prevEmail = useRef<string | null>(null);
  useEffect(() => {
    if (prevEmail.current === null) {
      prevEmail.current = email;
      return;
    }
    if (prevEmail.current !== email) {
      // Reset flow if email changes
      setOrders([]);
      setError(null);
      setOtpSent(false);
      setIsVerified(false);
      setCode("");
      prevEmail.current = email;
    }
  }, [email]);

  const handleSendCode = async () => {
    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }
    try {
      setIsSendingOtp(true);
      setError(null);
      await ApiService.requestGuestOrdersOtp(email.trim());
      setOtpSent(true);
      toast.success("Verification code sent.");
    } catch (e: any) {
      const msg = e?.message || "Failed to send verification code.";
      setError(msg);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerify = async () => {
    if (!email.trim() || !code.trim()) {
      toast.error("Enter your email and verification code.");
      return;
    }
    try {
      setIsVerifyingOtp(true);
      setError(null);
      const data = await ApiService.verifyGuestOrdersOtp({ email: email.trim(), code: code.trim() });
      const mapped = (data || []).map((order: any) => ({
        id: Number(order.id),
        orderNumber: String(order.order_number || order.order_code || order.id),
        date: order.created_at ? new Date(order.created_at).toLocaleDateString() : "",
        status: normalizeStatus(order.status || "pending"),
        total: Number(order.total_amount || 0),
        items: Number(order.items_count || 0)
      }));
      setOrders(mapped);
      setIsVerified(true);
      if (typeof window !== "undefined") {
        const allowedOrderIds = mapped.map((order: Order) => String(order.id));
        sessionStorage.setItem("guestOrdersAllowedIds", JSON.stringify(allowedOrderIds));
      }
      if (!mapped.length) {
        toast.message("No orders found for this email.");
      }
    } catch (e: any) {
      const msg = e?.message || "Verification failed.";
      setError(msg);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-6">
          <Link href="/login" className="text-sm text-[#266000] font-semibold hover:underline">
            Back to login
          </Link>
        </div>

        <div className="bg-white border border-black rounded-2xl p-6 sm:p-8 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Find your guest orders</h1>
          <p className="text-sm text-gray-600 mb-6">
            Enter your email to receive a verification code. Use it to view your orders.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
            <div className="sm:col-span-2 relative">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm pr-10"
              />
              {isVerified && (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 absolute right-3 top-1/2 -translate-y-1/2" />
              )}
            </div>
            <button
              type="button"
              onClick={handleSendCode}
              disabled={isSendingOtp || isVerifyingOtp}
              className="bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-70"
            >
              {isSendingOtp ? "Sending..." : "Send Code"}
            </button>
          </div>

          {otpSent && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <input
                type="text"
                placeholder="Verification code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="sm:col-span-2 border border-gray-300 rounded-lg px-4 py-2 text-sm"
              />
              <button
                type="button"
                onClick={handleVerify}
                disabled={isSendingOtp || isVerifyingOtp}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-70"
              >
                {isVerifyingOtp ? "Verifying..." : "View Orders"}
              </button>
            </div>
          )}

          {error && <div className="text-sm text-red-600 mt-4">{error}</div>}
        </div>

        <div className="space-y-4">
          {orders.length === 0 && (
            <div className="text-sm text-gray-600">No orders to display.</div>
          )}
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-black rounded-2xl p-4 sm:p-6 hover:border-[#266000] transition-colors">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-base sm:text-lg font-bold text-gray-900">Order #{order.orderNumber}</h4>
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold border ${statusStyles[order.status] || "bg-gray-50 text-gray-700 border-gray-200"}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-xs sm:text-sm text-gray-600">
                    <span className="flex items-center">
                      <Package size={16} className="mr-1" />
                      {order.items} {order.items === 1 ? "item" : "items"}
                    </span>
                    <span>Placed on {order.date}</span>
                  </div>
                </div>

                <div className="flex flex-col md:items-end gap-4">
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">{formatCurrency(order.total)}</div>
                  <Link href={`/orders/${order.id}`} className="text-[#266000] font-semibold hover:underline text-sm">
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
