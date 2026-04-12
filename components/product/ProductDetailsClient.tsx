"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Star, Heart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import ApiService from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { toast } from "sonner";

interface ProductVariant {
  id: number;
  name: string;
  price: number;
  originalPrice?: number | null;
  discountPercentage?: string | null;
  discountColor?: string | null;
  stockQuantity?: number;
}

export interface ProductDetails {
  id: number;
  name: string;
  slug: string;
  category: string;
  subcategory: string;
  price: number;
  originalPrice: number;
  imageUrl: string;
  discountPercentage: string;
  discountColor: string;
  description: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  stockQuantity?: number;
  weight: string;
  origin: string;
  imageGallery?: string[];
  mainVariantId?: number | null;
  variants?: ProductVariant[];
  isSpecial?: boolean;
  category_id?: number | null;
  categoryId?: number | null;
  bulk_order_limit?: number | null;
  bulkOrderLimit?: number | null;
  preorder_only?: boolean | null;
  preorderOnly?: boolean | null;
  cutoff_time?: string | null;
  cutoffTime?: string | null;
  available_days?: string[] | null;
  availableDays?: string[] | null;
}

type ReviewSummary = { count: number; avg_rating: number };

export default function ProductDetailsClient({
  product,
  initialReviewSummary,
  initialSchedule,
  disableSchedule = false
}: {
  product: ProductDetails;
  initialReviewSummary: ReviewSummary;
  initialSchedule: any | null;
  disableSchedule?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToCart } = useCart();

  const defaultVariantId = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) return null;
    const preferred = product.mainVariantId ?? (product as any).main_variant_id ?? null;
    return preferred ?? product.variants[0].id;
  }, [product]);

  const [activeSchedule, setActiveSchedule] = useState<any | null>(initialSchedule ?? null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(defaultVariantId);
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [useBulkOrder, setUseBulkOrder] = useState(false);
  const [customBulkQty, setCustomBulkQty] = useState("");
  const [availabilityNow, setAvailabilityNow] = useState(() => new Date());
  const [reviewSummary] = useState<ReviewSummary>(
    initialReviewSummary || { count: 0, avg_rating: 0 }
  );

  useEffect(() => {
    const timer = window.setInterval(() => setAvailabilityNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const variantParam = searchParams.get("variant");
    if (!variantParam || !product?.variants || product.variants.length === 0) return;
    const desiredId = Number(variantParam);
    if (!Number.isFinite(desiredId)) return;
    const exists = product.variants.find((v) => Number(v.id) === desiredId);
    if (exists) {
      setSelectedVariantId(desiredId);
    }
  }, [product?.id, searchParams]);

  useEffect(() => {
    if (disableSchedule) return;
    const refreshSchedule = async () => {
      if (!product?.id) return;
      try {
        const schedule = await ApiService.getActiveSchedule(product.id, selectedVariantId, {
          isSpecial: Boolean(product.isSpecial)
        });
        setActiveSchedule(schedule);
      } catch {
        setActiveSchedule(null);
      }
    };
    refreshSchedule();
  }, [product?.id, selectedVariantId, disableSchedule]);

  const selectedVariant = product.variants
    ? product.variants.find((v) => v.id === selectedVariantId)
    : null;
  const selectedVariantStock =
    selectedVariant?.stockQuantity === undefined || selectedVariant?.stockQuantity === null
      ? undefined
      : Number(selectedVariant.stockQuantity);
  const selectedVariantStockValue = Number(selectedVariantStock ?? NaN);
  const displayInStock = selectedVariant
    ? (Number.isFinite(selectedVariantStockValue) ? selectedVariantStockValue > 0 : true)
    : product.inStock;
  const rawStockQty = selectedVariant?.stockQuantity ?? product.stockQuantity;
  const maxQuantity = Number.isFinite(Number(rawStockQty)) ? Math.max(1, Number(rawStockQty)) : null;
  const effectiveQuantity = maxQuantity ? Math.min(quantity, maxQuantity) : quantity;
  const basePrice = selectedVariant ? Number(selectedVariant.price) : Number(product.price);
  const effectiveDiscountPercentage = selectedVariant?.discountPercentage || product.discountPercentage;
  const effectiveDiscountColor = selectedVariant?.discountColor || product.discountColor || "bg-yellow-500";
  const discountPercent = effectiveDiscountPercentage
    ? Number(String(effectiveDiscountPercentage).replace(/[^0-9.]/g, ""))
    : 0;
  const displayPrice =
    activeSchedule?.scheduled_price !== undefined && activeSchedule?.scheduled_price !== null
      ? Number(activeSchedule.scheduled_price)
      : basePrice;
  const normalPrice =
    activeSchedule?.normal_price !== undefined && activeSchedule?.normal_price !== null
      ? Number(activeSchedule.normal_price)
      : selectedVariant?.originalPrice !== undefined && selectedVariant?.originalPrice !== null
        ? Number(selectedVariant.originalPrice)
      : discountPercent > 0
        ? basePrice + (basePrice * discountPercent) / 100
        : Number(product.originalPrice ?? basePrice);
  const safeDisplayPrice = Number.isFinite(displayPrice) ? displayPrice : 0;
  const safeNormalPrice =
    Number.isFinite(normalPrice) && normalPrice > safeDisplayPrice ? normalPrice : undefined;

  const images =
    product.imageGallery && product.imageGallery.length > 0
      ? product.imageGallery
      : [product.imageUrl];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setZoomPosition({ x: e.clientX, y: e.clientY });
    setImagePosition({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100
    });
  };

  const handleMouseEnter = () => setShowZoom(true);
  const handleMouseLeave = () => setShowZoom(false);

  const limitRaw = product.bulk_order_limit ?? product.bulkOrderLimit ?? null;
  const limit =
    Number.isFinite(Number(limitRaw)) && Number(limitRaw) > 0 ? Number(limitRaw) : null;
  const bulkEligible = limit !== null;
  const parsedCustomBulkQty = customBulkQty.trim() ? Number(customBulkQty) : NaN;
  const bulkQty =
    useBulkOrder && Number.isFinite(parsedCustomBulkQty)
      ? Math.max(1, Math.floor(parsedCustomBulkQty))
      : useBulkOrder
        ? 0
        : effectiveQuantity;
  const bulkQtyInvalid =
    useBulkOrder && (bulkQty <= 0 || (limit !== null && bulkQty > limit));

  const parseCutoffTime = (value?: string | null) => {
    if (!value) return null;
    const raw = String(value).trim();
    const ampmMatch = raw.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
    if (ampmMatch) {
      let hour = Number(ampmMatch[1]);
      const minute = Number(ampmMatch[2] || 0);
      const meridiem = ampmMatch[3].toUpperCase();
      if (meridiem === "PM" && hour < 12) hour += 12;
      if (meridiem === "AM" && hour === 12) hour = 0;
      return { hour, minute };
    }
    const hmsMatch = raw.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (hmsMatch) {
      return { hour: Number(hmsMatch[1]), minute: Number(hmsMatch[2]) };
    }
    const clockMatch = raw.match(/^(\d{1,2}):(\d{2})$/);
    if (clockMatch) {
      return { hour: Number(clockMatch[1]), minute: Number(clockMatch[2]) };
    }
    return null;
  };

  const parseDateTime = (value?: string | null) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const availabilityState = useMemo(() => {
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const shortDayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const rawDays = product.available_days ?? product.availableDays ?? [];
    const availableDays = Array.isArray(rawDays)
      ? rawDays.map((day) => String(day).trim().toLowerCase())
      : [];
    const now = availabilityNow;
    const cutoff = parseCutoffTime(product.cutoff_time ?? product.cutoffTime ?? null);
    const scheduleEnd = parseDateTime(activeSchedule?.end_at ?? activeSchedule?.endAt ?? null);
    const dayIndex = now.getDay();
    const currentDayName = dayNames[dayIndex].toLowerCase();
    const currentShortDay = shortDayNames[dayIndex].toLowerCase();
    const todayAllowed =
      availableDays.length === 0 ||
      availableDays.includes(currentDayName) ||
      availableDays.includes(currentShortDay);
    const cutoffDate = cutoff
      ? new Date(now.getFullYear(), now.getMonth(), now.getDate(), cutoff.hour, cutoff.minute, 0, 0)
      : scheduleEnd;
    const isOrderOpen = todayAllowed && (!cutoffDate || now.getTime() <= cutoffDate.getTime());
    const diffMs = cutoffDate ? cutoffDate.getTime() - now.getTime() : 0;
    const safeDiffMs = Math.max(0, diffMs);
    const hoursLeft = Math.floor(safeDiffMs / (1000 * 60 * 60));
    const minutesLeft = Math.floor((safeDiffMs % (1000 * 60 * 60)) / (1000 * 60));
    const secondsLeft = Math.floor((safeDiffMs % (1000 * 60)) / 1000);
    const countdownText = cutoffDate
      ? `${hoursLeft}h ${minutesLeft}m ${secondsLeft}s`
      : null;
    let nextLabel = "soon";
    for (let offset = 0; offset < 8; offset++) {
      const candidate = new Date(now);
      candidate.setDate(now.getDate() + offset);
      const idx = candidate.getDay();
      const candidateName = dayNames[idx].toLowerCase();
      const candidateShort = shortDayNames[idx].toLowerCase();
      if (availableDays.length === 0 || availableDays.includes(candidateName) || availableDays.includes(candidateShort)) {
        nextLabel = candidate.toLocaleDateString(undefined, { weekday: "long" });
        break;
      }
    }
    return {
      isOrderOpen,
      countdownLabel: cutoffDate ? `Order within ${countdownText} for today pickup` : null,
      closedLabel: `Ordering closed for today – Next available: ${nextLabel}`
    };
  }, [availabilityNow, activeSchedule, product.availableDays, product.available_days, product.cutoffTime, product.cutoff_time]);

  const canAddToCart = displayInStock && availabilityState.isOrderOpen && !bulkQtyInvalid;

  const handleAddToCart = () => {
    if (!availabilityState.isOrderOpen) {
      toast.error("Ordering is closed", {
        description: availabilityState.closedLabel
      });
      return;
    }
    const limitRaw = product.bulk_order_limit ?? product.bulkOrderLimit ?? null;
    const limit =
      Number.isFinite(Number(limitRaw)) && Number(limitRaw) > 0 ? Number(limitRaw) : null;
    const requestedQty = useBulkOrder ? bulkQty : effectiveQuantity;
    const cappedQuantity = limit !== null ? Math.min(requestedQty, limit) : requestedQty;
    if (useBulkOrder && (bulkQty <= 0 || (limit !== null && bulkQty > limit))) {
      toast.error("Bulk quantity exceeds limit", {
        description: limit !== null
          ? `Maximum bulk limit is ${limit}.`
          : "Please enter a valid bulk quantity."
      });
      return;
    }
    if (limit !== null && requestedQty > limit) {
      toast.info("Bulk limit reached", {
        description: `You can only order up to ${limit} for this item.`
      });
    }
    const cartItem = {
      id: product.id,
      name: product.name,
      price: safeDisplayPrice,
      originalPrice:
        safeNormalPrice !== undefined && safeNormalPrice > safeDisplayPrice
          ? safeNormalPrice
          : undefined,
      imageUrl: product.imageUrl,
      weight: product.weight,
      inStock: displayInStock,
      variantId: selectedVariant?.id ?? null,
      variantName: selectedVariant?.name ?? null,
      category: product.category,
      subcategory: product.subcategory,
      slug: product.slug,
      categoryId: product.category_id ?? product.categoryId ?? null,
      isSpecial: Boolean(product.isSpecial),
      bulkOrderLimit: product.bulk_order_limit ?? product.bulkOrderLimit ?? null,
      preorderOnly: product.preorder_only ?? product.preorderOnly ?? null,
      cutoffTime: product.cutoff_time ?? product.cutoffTime ?? null,
      availableDays: product.available_days ?? product.availableDays ?? null
    };

    for (let i = 0; i < cappedQuantity; i++) {
      addToCart(cartItem, i === 0);
    }
    setQuantity(1);
    setCustomBulkQty("");
  };

  const handleBuyNow = () => {
    if (!availabilityState.isOrderOpen) {
      toast.error("Ordering is closed", {
        description: availabilityState.closedLabel
      });
      return;
    }
    const limitRaw = product.bulk_order_limit ?? product.bulkOrderLimit ?? null;
    const limit =
      Number.isFinite(Number(limitRaw)) && Number(limitRaw) > 0 ? Number(limitRaw) : null;
    const requestedQty = useBulkOrder ? bulkQty : effectiveQuantity;
    const cappedQuantity = limit !== null ? Math.min(requestedQty, limit) : requestedQty;
    if (useBulkOrder && (bulkQty <= 0 || (limit !== null && bulkQty > limit))) {
      toast.error("Bulk quantity exceeds limit", {
        description: limit !== null
          ? `Maximum bulk limit is ${limit}.`
          : "Please enter a valid bulk quantity."
      });
      return;
    }
    if (limit !== null && requestedQty > limit) {
      toast.info("Bulk limit reached", {
        description: `You can only order up to ${limit} for this item.`
      });
    }
    const cartItem = {
      id: product.id,
      name: product.name,
      price: safeDisplayPrice,
      originalPrice:
        safeNormalPrice !== undefined && safeNormalPrice > safeDisplayPrice
          ? safeNormalPrice
          : undefined,
      imageUrl: product.imageUrl,
      weight: product.weight,
      inStock: displayInStock,
      variantId: selectedVariant?.id ?? null,
      variantName: selectedVariant?.name ?? null,
      category: product.category,
      subcategory: product.subcategory,
      slug: product.slug,
      quantity: cappedQuantity,
      categoryId: product.category_id ?? product.categoryId ?? null,
      isSpecial: Boolean(product.isSpecial),
      bulkOrderLimit: product.bulk_order_limit ?? product.bulkOrderLimit ?? null,
      preorderOnly: product.preorder_only ?? product.preorderOnly ?? null,
      cutoffTime: product.cutoff_time ?? product.cutoffTime ?? null,
      availableDays: product.available_days ?? product.availableDays ?? null
    };

    if (typeof window !== "undefined") {
      sessionStorage.setItem("buyNowItem", JSON.stringify(cartItem));
    }
    router.push("/checkout?mode=buynow");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="border border-gray-200 rounded-3xl shadow-lg p-2 bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Image Gallery */}
          <div className="space-y-3 relative">
            {/* Main Image Card */}
            <div className="relative rounded-2xl overflow-hidden shadow-lg w-full md:w-[85%] mx-auto">
              {/* Stock Badge - Stuck to left */}
              <div className="absolute top-4 left-0 z-10">
                <span
                  className={`px-3 py-1 rounded-r-md text-xs font-medium ${
                    displayInStock ? "bg-green-500 text-white" : "bg-red-500 text-white"
                  }`}
                >
                  {displayInStock ? "Available in stock" : "Out of stock"}
                </span>
              </div>

              {/* Main Product Image */}
              <div
                className="aspect-square bg-white relative cursor-crosshair"
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Magnifying Glass Zoom Preview - Fixed to the right side */}
            {showZoom && (
              <div
                className="absolute top-0 left-full ml-6 w-[600px] h-80 rounded-2xl border-4 border-gray-200 shadow-2xl overflow-hidden bg-white z-50"
                style={{
                  backgroundImage: `url(${images[selectedImage]})`,
                  backgroundSize: "300% 900%",
                  backgroundPosition: `${imagePosition.x}% ${imagePosition.y}%`,
                  backgroundRepeat: "no-repeat"
                }}
              />
            )}

            {/* Thumbnail Gallery - Smaller */}
            {images.length > 1 && (
              <div className="flex gap-2 justify-center w-full md:w-[85%] mx-auto">
                {images.slice(0, 5).map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-12 h-12 rounded-lg overflow-hidden transition-all ${
                      selectedImage === index
                        ? "ring-2 ring-green-500 scale-105"
                        : "bg-gray-100 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`View ${index + 1}`}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-4">
            <div className={`rounded-xl border px-4 py-3 text-sm ${availabilityState.isOrderOpen ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-amber-200 bg-amber-50 text-amber-900'}`}>
              <div className="font-semibold">
                {availabilityState.isOrderOpen ? "Ordering open now" : availabilityState.closedLabel}
              </div>
              <div className="mt-1 font-medium">
                {availabilityState.isOrderOpen
                  ? (availabilityState.countdownLabel || "No cutoff time set")
                  : availabilityState.closedLabel}
              </div>
              {(product.available_days?.length || product.availableDays?.length) ? (
                <div className="mt-1 text-xs opacity-80">
                  Available days: {(product.available_days ?? product.availableDays ?? []).join(", ")}
                </div>
              ) : null}
            </div>

            {/* Discount Badge */}
            {(effectiveDiscountPercentage ||
              activeSchedule?.discount_percent != null ||
              activeSchedule?.schedule_type) && (
              <div className="inline-block">
                <div className="flex flex-wrap items-center gap-2">
                  {(effectiveDiscountPercentage || activeSchedule?.discount_percent != null) && (
                    <span
                      className={`${effectiveDiscountColor} text-white px-3 py-1 text-xs font-bold block rounded-tl-lg rounded-br-lg`}
                    >
                      {activeSchedule?.discount_percent
                        ? `${Number(activeSchedule.discount_percent).toFixed(0)}%`
                        : effectiveDiscountPercentage}
                    </span>
                  )}
                  {activeSchedule?.schedule_type && (
                    <span className="bg-black text-white px-3 py-1 text-xs font-semibold rounded-full capitalize">
                      {String(activeSchedule.schedule_type).replace(/_/g, " ")}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Product Name */}
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>
              <button className="p-2 rounded-full transition-all backdrop-blur-md bg-white/70 shadow-lg hover:shadow-xl border border-white/20">
                <Heart size={20} className="text-red-500 fill-red-500" />
              </button>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={
                      i < Math.floor(reviewSummary.avg_rating || 0)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-300 text-gray-300"
                    }
                  />
                ))}
              </div>
              <span className="text-gray-600 text-sm">
                {reviewSummary.avg_rating ? reviewSummary.avg_rating.toFixed(1) : "0.0"} (
                {reviewSummary.count} Reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">
                {formatCurrency(Number(safeDisplayPrice))}
              </span>
              {safeNormalPrice !== undefined && (
                <span className="text-lg text-gray-400 line-through">
                  {formatCurrency(Number(safeNormalPrice))}
                </span>
              )}
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-gray-900 mb-2 text-sm">Choose Variant</h4>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`px-3 py-2 rounded-lg border text-sm ${
                        selectedVariantId === v.id
                          ? "border-black bg-black text-white"
                          : "border-gray-300 bg-white text-gray-700"
                      }`}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing Info */}
            <p className="text-gray-500 text-xs">Prices incl. VAT plus shipping cost</p>

            {/* Description */}
            <div className="border-t border-b border-gray-200 py-3">
              <p className="text-gray-600 text-sm leading-relaxed">
                {product.description ||
                  "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s"}
              </p>
            </div>

            {/* Quantity Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900 text-sm">Quantity</h4>
                {bulkEligible && (
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      checked={useBulkOrder}
                      onChange={(e) => {
                        setUseBulkOrder(e.target.checked);
                        setCustomBulkQty("");
                      }}
                    />
                    Order in bulk
                  </label>
                )}
              </div>
              <div className="flex items-center gap-3">
                {useBulkOrder ? (
                  <div className="flex items-center gap-2 w-full">
                    <select
                      className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm"
                      value={bulkQty && bulkQty <= 0 ? "" : String(bulkQty)}
                      onChange={(e) => {
                        setCustomBulkQty(e.target.value);
                      }}
                    >
                      <option value="">Select qty</option>
                      {limit
                        ? Array.from({ length: Math.min(limit, 10) }, (_, i) => i + 1).map((qty) => (
                            <option key={qty} value={qty}>{qty}</option>
                          ))
                        : [1, 2, 3, 4, 5].map((qty) => (
                            <option key={qty} value={qty}>{qty}</option>
                          ))}
                      {limit && limit > 10 && (
                        <option value={limit}>{limit} (max)</option>
                      )}
                    </select>
                    <input
                      type="number"
                      min={1}
                      placeholder={limit ? `Custom (max ${limit})` : "Custom qty"}
                      className="h-10 w-36 rounded-lg border border-gray-300 bg-white px-3 text-sm"
                      value={customBulkQty}
                      onChange={(e) => setCustomBulkQty(e.target.value)}
                    />
                  </div>
                ) : (
                  <div className="flex items-center bg-gray-100 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center hover:bg-gray-200 rounded-l-lg transition-colors text-lg font-bold"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-semibold text-base">{quantity}</span>
                    <button
                      onClick={() => {
                        if (maxQuantity && quantity >= maxQuantity) {
                          toast.info("Maximum stock reached", {
                            description: `Only ${maxQuantity} available for this item.`
                          });
                          return;
                        }
                        const nextQty = maxQuantity ? Math.min(maxQuantity, quantity + 1) : quantity + 1;
                        setQuantity(nextQty);
                        if (maxQuantity && nextQty >= maxQuantity) {
                          toast.info("Maximum stock reached", {
                            description: `Only ${maxQuantity} available for this item.`
                          });
                        }
                      }}
                      className="w-10 h-10 flex items-center justify-center hover:bg-gray-200 rounded-r-lg transition-colors text-lg font-bold"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
              {useBulkOrder && bulkQtyInvalid && (
                <p className="mt-2 text-xs text-red-600">
                  {limit !== null
                    ? `Bulk quantity must be between 1 and ${limit}.`
                    : "Please enter a valid bulk quantity."}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-6 rounded-lg font-bold text-base transition-colors shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-yellow-500"
              >
                Add to cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!displayInStock || bulkQtyInvalid || !availabilityState.isOrderOpen}
                className="w-full bg-black hover:bg-gray-800 text-white py-3 px-6 rounded-lg font-bold text-base transition-colors disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-black"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
