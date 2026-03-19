"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";

export type PublicReview = {
  id: string | number;
  reviewer_name?: string | null;
  review_text?: string | null;
  rating?: number | null;
  image_url?: string | null;
  customer_id?: number | null;
  order_id?: number | null;
  order_item_id?: number | null;
};

function Tag({ label, tone }: { label: string; tone: "green" | "gray" }) {
  const styles =
    tone === "green"
      ? "bg-green-50 text-green-700 border-green-200"
      : "bg-gray-100 text-gray-600 border-gray-200";
  return (
    <span className={`text-[7px] px-2 py-0.5 rounded-full border ${styles}`}>
      {label}
    </span>
  );
}

export function ReviewCard({ review }: { review: PublicReview }) {
  const initials = (review.reviewer_name || "Customer")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isVerifiedUser = Boolean(review.customer_id);
  const isVerifiedPurchase = Boolean(review.order_id && review.order_item_id);

  return (
    <div className="rounded-2xl border border-gray-200 bg-[#fbfbf7] p-5 shadow-sm h-full">
      <div className="flex items-center gap-3 mb-3">
        {review.image_url ? (
          <img
            src={review.image_url}
            alt={review.reviewer_name || "Customer"}
            className="w-12 h-12 rounded-full object-cover border border-white shadow"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-[#E7F1E7] flex items-center justify-center text-sm font-bold text-[#173A00] border border-white shadow">
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="font-semibold text-gray-900 truncate">
              {review.reviewer_name || "Customer"}
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${Number(review.rating || 0) >= i ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1 whitespace-nowrap overflow-hidden">
            <Tag label="Verified User" tone={isVerifiedUser ? "green" : "gray"} />
            <Tag label="Verified Purchase" tone={isVerifiedPurchase ? "green" : "gray"} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
        <p className="text-sm text-gray-700 leading-relaxed whitespace-nowrap overflow-hidden text-ellipsis">
          {review.review_text || "No review text."}
        </p>
      </div>
    </div>
  );
}

export default function ReviewCardsSection({
  reviews,
  mobileSlider = false
}: {
  reviews: PublicReview[];
  mobileSlider?: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const total = reviews.length;

  useEffect(() => {
    if (!mobileSlider || total <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, 3500);
    return () => clearInterval(timer);
  }, [mobileSlider, total]);

  if (mobileSlider) {

    return (
      <>
        <div className="sm:hidden">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {reviews.map((review) => (
                <div key={review.id} className="min-w-full px-1">
                  <ReviewCard review={review} />
                </div>
              ))}
            </div>
          </div>

          {total > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {reviews.map((review, index) => (
                <button
                  key={`dot-${review.id}`}
                  type="button"
                  aria-label={`Go to review ${index + 1}`}
                  onClick={() => setActiveIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    activeIndex === index ? "w-6 bg-[#266000]" : "w-2 bg-gray-300"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="hidden sm:grid grid-cols-3 gap-6">
          {reviews.map((review) => (
            <div key={review.id}>
                <ReviewCard review={review} />
              </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-6">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}
