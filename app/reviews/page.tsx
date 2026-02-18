"use client";

import { useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";
import ApiService from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

type Review = {
  id: string;
  reviewer_name?: string | null;
  review_text?: string | null;
  rating?: number | null;
  image_url?: string | null;
  customer_id?: number | null;
  order_id?: number | null;
  order_item_id?: number | null;
};

const CATEGORY_BARS = [
  { title: "Product Quality", progress: 86 },
  { title: "Packaging", progress: 82 },
  { title: "Delivery Speed", progress: 74 },
  { title: "Value for Money", progress: 84 },
  { title: "Support Experience", progress: 78 }
];

export default function ReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<{ count: number; avg_rating: number }>({
    count: 0,
    avg_rating: 0
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const offset = (page - 1) * pageSize;
        const data = await ApiService.getPublicReviews({ limit: pageSize, offset });
        setReviews(data.reviews || []);
        setSummary(data.summary || { count: 0, avg_rating: 0 });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page]);

  const avgRating = Number(summary.avg_rating || 0);
  const reviewCount = Number(summary.count || 0);

  const totalPages = Math.max(1, Math.ceil(reviewCount / pageSize));

  return (
    <div className="w-full py-16 sm:py-20 px-4 sm:px-6 md:px-12 lg:px-20 bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-14 items-center">
        <div>
          <h2 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl leading-snug mb-4 text-[#173A00] font-bold">
            What Customers Say
          </h2>
          <p className="text-sm md:text-base max-w-md text-gray-600">
            Real reviews from verified buyers who shopped with us.
          </p>
        </div>

        <div className="w-full">
          <div className="rounded-2xl border border-gray-200 shadow-sm p-6 pt-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Overview</h3>
              <span className="text-xs px-3 py-1 rounded-full text-white bg-[#266000]">
                Reviews & Ratings
              </span>
            </div>

            <div className="flex justify-between items-center mb-6">
              <div className="text-4xl sm:text-5xl font-bold text-[#266000]">
                {avgRating ? avgRating.toFixed(1) : "0.0"}
              </div>
              <div className="flex flex-col items-center">
                <div className="flex gap-[3px]">
                  {[1, 2, 3, 4, 5].map((i) => {
                    const fill = avgRating >= i ? 1 : avgRating >= i - 0.5 ? 0.5 : 0;
                    return (
                      <div key={i} className="w-5 h-5 relative">
                        <Star className="w-5 h-5 fill-gray-300 text-gray-300 absolute" />
                        {fill > 0 && (
                          <div
                            className="absolute top-0 left-0 h-full overflow-hidden"
                            style={{ width: `${fill * 100}%` }}
                          >
                            <Star className="w-5 h-5 fill-[#FFD700] text-[#FFD700]" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                  Based on {reviewCount} ratings
                </p>
              </div>
            </div>

            <div className="w-full h-px bg-gray-200 mb-6"></div>

            <div className="space-y-6">
              {CATEGORY_BARS.map((item) => (
                <div key={item.title}>
                  <div className="flex justify-between mb-1">
                    <p className="text-sm text-gray-800">{item.title}</p>
                    <p className="text-sm text-[#266000] font-semibold">
                      {Math.round(item.progress / 20) / 1}
                    </p>
                  </div>
                  <div className="w-full bg-gray-200 h-[4px] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#266000]"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16 md:mt-20">
        <h3 className="text-2xl sm:text-3xl mb-8 md:mb-12 text-center font-bold text-gray-900">
          Customer Experiences
        </h3>

        {user && (
          <div className="max-w-3xl mx-auto mb-10">
            <div className="bg-[#f7f8f3] border border-[#e5e7eb] rounded-2xl p-5 sm:p-6 text-sm text-gray-700">
              Reviews can only be submitted from the order confirmation popup after a verified purchase.
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center text-sm text-gray-600">Loading reviews...</div>
        )}
        {!loading && reviews.length === 0 && (
          <div className="text-center text-sm text-gray-600">No reviews yet.</div>
        )}

        {!loading && reviews.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-6">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-xs rounded-full border border-gray-300 text-gray-700 disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="text-xs text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-xs rounded-full border border-gray-300 text-gray-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const initials = (review.reviewer_name || "Customer")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isVerifiedUser = Boolean(review.customer_id);
  const isVerifiedPurchase = Boolean(review.order_id && review.order_item_id);

  return (
    <div className="rounded-2xl border border-gray-200 bg-[#fbfbf7] p-5 shadow-sm">
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
