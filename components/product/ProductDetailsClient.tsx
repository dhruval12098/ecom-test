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
}

type ReviewSummary = { count: number; avg_rating: number };

export default function ProductDetailsClient({
  product,
  initialReviewSummary,
  initialSchedule
}: {
  product: ProductDetails;
  initialReviewSummary: ReviewSummary;
  initialSchedule: any | null;
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
  const [reviewSummary] = useState<ReviewSummary>(
    initialReviewSummary || { count: 0, avg_rating: 0 }
  );

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
    const refreshSchedule = async () => {
      if (!product?.id) return;
      try {
        const schedule = await ApiService.getActiveSchedule(product.id, selectedVariantId);
        setActiveSchedule(schedule);
      } catch {
        setActiveSchedule(null);
      }
    };
    refreshSchedule();
  }, [product?.id, selectedVariantId]);

  const selectedVariant = product.variants
    ? product.variants.find((v) => v.id === selectedVariantId)
    : null;
  const displayInStock = selectedVariant
    ? Number(selectedVariant.stockQuantity ?? 0) > 0
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

  const handleAddToCart = () => {
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
      slug: product.slug
    };

    for (let i = 0; i < effectiveQuantity; i++) {
      addToCart(cartItem, i === 0);
    }
    setQuantity(1);
  };

  const handleBuyNow = () => {
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
      quantity: effectiveQuantity
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
              <h4 className="font-semibold text-gray-900 mb-2 text-sm">Quantity</h4>
              <div className="flex items-center gap-3">
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
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleAddToCart}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-6 rounded-lg font-bold text-base transition-colors shadow-md hover:shadow-lg"
              >
                Add to cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!displayInStock}
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
