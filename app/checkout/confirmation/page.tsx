"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Loader2 } from "lucide-react";
import ApiService from "@/lib/api";
import { formatCurrency } from "@/lib/currency";

function CheckoutConfirmationContent() {
  const searchParams = useSearchParams();
  const orderIdParam = searchParams.get("orderId");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [totalAmount, setTotalAmount] = useState<number | null>(null);

  useEffect(() => {
    const orderId = Number(orderIdParam);
    if (!Number.isFinite(orderId)) {
      setError("Invalid order reference.");
      setIsLoading(false);
      return;
    }
    (async () => {
      try {
        setIsLoading(true);
        await ApiService.getWorldlineCheckoutStatus(orderId);
        const orderData = await ApiService.getOrderById(orderId);
        const rawOrder = orderData?.order_code || orderData?.order_number || "";
        setOrderNumber(String(rawOrder || orderId));
        setTotalAmount(Number(orderData?.total_amount || 0));
      } catch {
        setError("Unable to confirm payment. Please refresh or contact support.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [orderIdParam]);

  return (
    <div className="min-h-[70vh] bg-white">
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-10 md:py-14">
        <div className="bg-white border border-black rounded-3xl p-6 md:p-10 text-center">
          {isLoading && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-gray-50 border border-black rounded-full flex items-center justify-center">
                <Loader2 className="h-7 w-7 text-[#266000] animate-spin" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Confirming payment</h1>
                <p className="text-sm text-gray-600 mt-2">Please wait while we finalize your order.</p>
              </div>
            </div>
          )}

          {!isLoading && error && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-red-50 border border-black rounded-full flex items-center justify-center">
                <span className="text-red-600 text-xl font-bold">!</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">We hit a problem</h1>
                <p className="text-sm text-gray-600 mt-2">{error}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-2">
                <button
                  onClick={() => window.location.reload()}
                  className="bg-black text-white px-5 py-2 rounded-xl text-sm font-semibold"
                >
                  Retry
                </button>
                <Link
                  href="/"
                  className="bg-white border border-black text-gray-900 px-5 py-2 rounded-xl text-sm font-semibold"
                >
                  Go to Home
                </Link>
              </div>
            </div>
          )}

          {!isLoading && !error && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-[#266000] border-2 border-black rounded-full flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Order Confirmed</h1>
                <p className="text-sm text-gray-600 mt-2">Thank you for your purchase.</p>
              </div>
              <div className="text-sm text-gray-700 bg-gray-50 border border-black rounded-2xl px-4 py-3">
                <div>Order: <span className="font-semibold">{orderNumber || "-"}</span></div>
                <div>Total: <span className="font-semibold">{formatCurrency(totalAmount || 0)}</span></div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-2">
                <Link
                  href="/account?tab=orders"
                  className="bg-black text-white px-5 py-2 rounded-xl text-sm font-semibold"
                >
                  View Orders
                </Link>
                <Link
                  href="/"
                  className="bg-white border border-black text-gray-900 px-5 py-2 rounded-xl text-sm font-semibold"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CheckoutConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] bg-white">
          <div className="max-w-3xl mx-auto px-4 md:px-6 py-10 md:py-14">
            <div className="bg-white border border-black rounded-3xl p-6 md:p-10 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-gray-50 border border-black rounded-full flex items-center justify-center">
                  <Loader2 className="h-7 w-7 text-[#266000] animate-spin" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Preparing confirmation</h1>
                  <p className="text-sm text-gray-600 mt-2">Please wait while we load your order.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <CheckoutConfirmationContent />
    </Suspense>
  );
}
