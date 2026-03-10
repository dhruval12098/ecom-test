"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Loader2, Star } from "lucide-react";
import ApiService from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

function CheckoutConfirmationContent() {
  const searchParams = useSearchParams();
  const orderIdParam = searchParams.get("orderId");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [totalAmount, setTotalAmount] = useState<number | null>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [reviewItemId, setReviewItemId] = useState<number | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [reviewerEmail, setReviewerEmail] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const { user } = useAuth();

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
        const items = orderData?.items || [];
        setOrderItems(items);
        if (items.length > 0) {
          setReviewItemId(Number(items[0]?.id || 0) || null);
        }
        setReviewerName(orderData?.customer_name || '');
        setReviewerEmail(orderData?.customer_email || '');
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

              {orderItems.length > 0 && (
                <div className="w-full bg-white border border-black rounded-2xl p-6 text-left">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gray-50 border border-black rounded-full flex items-center justify-center">
                      <Star className="h-5 w-5 text-[#266000]" />
                    </div>
                    <h3 className="font-bold text-gray-900">Rate Your Purchase</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Purchased items</label>
                      <div className="flex flex-wrap gap-2">
                        {orderItems.map((item: any) => {
                          const selected = Number(reviewItemId) === Number(item.id);
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setReviewItemId(Number(item.id))}
                              className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                                selected ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300'
                              }`}
                            >
                              {item.product_name || 'Item'}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className={`w-9 h-9 rounded-full flex items-center justify-center ${
                            reviewRating >= star ? 'bg-yellow-400 text-white' : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          <Star className="h-4 w-4" />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Share your experience..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#266000]"
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        disabled={reviewSubmitting || !reviewItemId}
                        onClick={async () => {
                          if (!reviewItemId || !orderIdParam) return;
                          try {
                            setReviewSubmitting(true);
                            const item = orderItems.find((i: any) => Number(i.id) === Number(reviewItemId));
                            await ApiService.submitProductReview({
                              auth_user_id: user?.id || null,
                              product_id: item?.product_id,
                              order_id: Number(orderIdParam),
                              order_item_id: reviewItemId,
                              reviewer_name: reviewerName || null,
                              reviewer_email: reviewerEmail || null,
                              rating: reviewRating,
                              review_text: reviewText
                            });
                            toast.success("Review submitted");
                            setReviewText("");
                          } catch (e: any) {
                            toast.error(e?.message || "Failed to submit review");
                          } finally {
                            setReviewSubmitting(false);
                          }
                        }}
                        className="px-5 py-2 rounded-lg bg-black text-white text-sm font-semibold disabled:opacity-60"
                      >
                        {reviewSubmitting ? "Submitting..." : "Submit Review"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
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
