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

export function ReviewCard({ review }: { review: PublicReview }) {
  const initials = (review.reviewer_name || "Customer")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="rounded-2xl border border-gray-200 bg-[#fbfbf7] p-3.5 shadow-sm h-full w-full min-h-[171px] flex flex-col">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-[#E7F1E7] flex items-center justify-center text-xs font-bold text-[#173A00] border border-white shadow">
          {initials}
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-sm text-gray-900 truncate">
            {review.reviewer_name || "Customer"}
          </div>
          <div className="flex gap-1 mt-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${Number(review.rating || 0) >= i ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm mt-auto">
        <p className="text-xs text-gray-700 leading-relaxed line-clamp-3">
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

        <div className="hidden sm:grid sm:[grid-template-columns:repeat(2,minmax(288px,324px))] lg:[grid-template-columns:repeat(3,minmax(288px,324px))] justify-center gap-2 lg:gap-2.5">
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
    <div className="grid grid-cols-1 sm:[grid-template-columns:repeat(2,minmax(288px,324px))] lg:[grid-template-columns:repeat(3,minmax(288px,324px))] justify-center gap-2 lg:gap-2.5">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}
