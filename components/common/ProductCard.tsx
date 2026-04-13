"use client";

import { ShoppingCart, Check } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { formatCurrency } from "@/lib/currency";

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number | null;
  imageUrl: string;
  discountPercentage: string;
  discountColor: string;
  description: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  weight: string;
  origin: string;
  category?: string;
  subcategory?: string;
  slug?: string;
  mainVariantId?: number | string | null;
  main_variant_id?: number | string | null;
  variants?: Array<{
    id?: number | string;
    name?: string | null;
    weight?: string | null;
    price?: number | string;
    originalPrice?: number | string | null;
    original_price?: number | string | null;
    discountPercentage?: string | null;
    discount_percentage?: string | null;
    discountColor?: string | null;
    discount_color?: string | null;
  }>;
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
  label_name?: string | null;
  labelName?: string | null;
  label_color?: string | null;
  labelColor?: string | null;
}

type ProductCardProps = {
  title?: string;
  weight?: string;
  price?: string;
  originalPrice?: string;
  rating?: number;
  imageUrl?: string;
  discountPercentage?: string;
  discountColor?: string;
  productId?: string | number;
  categorySlug?: string;
  subcategorySlug?: string;
  product?: Product;
  layout?: "grid" | "carousel";
  size?: "default" | "compact";
  titleClassName?: string;
};

export default function ProductCard({
  title = "Fresh Amla Powder",
  weight = "",
  price = "$1.25",
  originalPrice,
  rating = 4.5,
  imageUrl,
  discountPercentage,
  discountColor = "bg-red-500",
  productId,
  categorySlug,
  subcategorySlug,
  product,
  layout = "grid",
  size = "default",
  titleClassName,
}: ProductCardProps) {
  const { addToCart, cartItems } = useCart();
  const parsePrice = (value?: string) => {
    if (!value) return undefined;
    const normalized = value.replace(/[^\d.,-]/g, "").replace(",", ".");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : undefined;
  };
  // Generate product URL if all required slugs are provided
  const rawSlug = product?.slug !== undefined && product?.slug !== null ? String(product.slug) : null;
  const safeSlug = rawSlug && !/\s/.test(rawSlug) ? rawSlug : null;
  const productSlugValue =
    safeSlug ||
    (product?.id !== undefined && product?.id !== null ? String(product.id) : null) ||
    (productId !== undefined && productId !== null ? String(productId) : null);
  const productUrl =
    product && product.category && product.subcategory && productSlugValue
      ? `/${product.category}/${product.subcategory}/${productSlugValue}`
      : productId && categorySlug && subcategorySlug
        ? `/${categorySlug}/${subcategorySlug}/${productId}`
        : "#";
  
  // Use product data if provided, otherwise use props
  const displayTitle = product?.name || title;
  const displayWeight = (product?.weight ?? weight ?? "").trim();
  const titleWithWeight = displayWeight ? `${displayTitle} - ${displayWeight}` : displayTitle;
  const parsedPrice = product ? undefined : parsePrice(price);
  const parsedOriginalPrice = product ? undefined : parsePrice(originalPrice);
  const productVariants = product?.variants ?? [];
  const productHasVariants = productVariants.length > 0;
  const resolvedMainVariantIdRaw = product?.mainVariantId ?? product?.main_variant_id;
  const resolvedMainVariantId =
    resolvedMainVariantIdRaw !== undefined && resolvedMainVariantIdRaw !== null && resolvedMainVariantIdRaw !== ""
      ? Number(resolvedMainVariantIdRaw)
      : null;
  const defaultVariant = productHasVariants
    ? (
        productVariants.find((v) => Number(v?.id) === resolvedMainVariantId) ||
        productVariants[0]
      )
    : null;
  const defaultVariantIdRaw = defaultVariant?.id;
  const defaultVariantId =
    defaultVariantIdRaw !== undefined && defaultVariantIdRaw !== null && defaultVariantIdRaw !== ""
      ? Number(defaultVariantIdRaw)
      : null;
  const defaultVariantName = defaultVariant?.name || defaultVariant?.weight || null;
  const productPriceValueRaw = String(product?.price ?? "");
  const productPriceValue =
    productPriceValueRaw !== ''
      ? Number(productPriceValueRaw)
      : undefined;
  const matchedVariantPrice = productHasVariants
    ? (
        resolvedMainVariantId !== null
          ? Number(defaultVariant?.price)
          : productVariants
              .map((v) => Number(v?.price))
              .find((v) => Number.isFinite(v) && (productPriceValue === undefined || v === productPriceValue))
      )
    : undefined;
  const fallbackVariantPrice = productHasVariants
    ? Number(defaultVariant?.price)
    : undefined;
  const resolvedProductPrice =
    productHasVariants
      ? (matchedVariantPrice ?? fallbackVariantPrice)
      : productPriceValue;
  const defaultVariantOriginalPriceRaw = defaultVariant?.originalPrice ?? defaultVariant?.original_price;
  const resolvedVariantOriginalPrice = productHasVariants && defaultVariantOriginalPriceRaw !== undefined && defaultVariantOriginalPriceRaw !== null
    ? Number(defaultVariantOriginalPriceRaw)
    : undefined;
  const resolvedVariantDiscountPercentage = productHasVariants
    ? (defaultVariant?.discountPercentage ?? defaultVariant?.discount_percentage)
    : undefined;
  const resolvedVariantDiscountColor = productHasVariants
    ? (defaultVariant?.discountColor ?? defaultVariant?.discount_color)
    : undefined;
  const displayPriceValue = product
    ? Number(resolvedProductPrice || 0)
    : (parsedPrice !== undefined ? parsedPrice : Number(price || 0));
  const displayPrice = product
    ? formatCurrency(displayPriceValue)
    : (parsedPrice !== undefined ? formatCurrency(parsedPrice) : price);
  const originalPriceValue =
    resolvedVariantOriginalPrice !== undefined && Number.isFinite(resolvedVariantOriginalPrice)
      ? resolvedVariantOriginalPrice
      : product?.originalPrice !== undefined && product?.originalPrice !== null
        ? Number(product.originalPrice)
        : parsedOriginalPrice !== undefined
          ? parsedOriginalPrice
          : undefined;
  const showOriginalPrice =
    Number.isFinite(displayPriceValue) &&
    Number.isFinite(Number(originalPriceValue)) &&
    Number(originalPriceValue) > displayPriceValue;
  const displayOriginalPrice = showOriginalPrice && originalPriceValue !== undefined
    ? formatCurrency(Number(originalPriceValue))
    : undefined;
  const displayRating = product?.rating || rating;
  const displayDiscountPercentage = resolvedVariantDiscountPercentage || product?.discountPercentage || discountPercentage;
  const displayDiscountColor = resolvedVariantDiscountColor || product?.discountColor || discountColor;
  const displayImageUrl = product?.imageUrl || imageUrl || "";
  const discountValue = displayDiscountPercentage
    ? Number(String(displayDiscountPercentage).replace(/[^0-9.]/g, ""))
    : NaN;
  const hasDiscount =
    Boolean(displayDiscountPercentage && String(displayDiscountPercentage).trim()) &&
    (!Number.isFinite(discountValue) || discountValue > 0);

  // Generate product ID for cart lookup
  const productIdForCart =
    product?.id ||
    (typeof productId === "string" ? parseInt(productId, 10) : (productId as number));

  const normalizeVariantId = (variantId?: number | null) =>
    variantId === undefined ? null : variantId;
  const cartLineVariantId = productHasVariants ? defaultVariantId : null;
  
  // Check if item is already in cart
  const isInCart = cartItems.some(
    (item) => item.id === productIdForCart && normalizeVariantId(item.variantId) === cartLineVariantId
  );
  const cartItemQuantity =
    cartItems.find(
      (item) => item.id === productIdForCart && normalizeVariantId(item.variantId) === cartLineVariantId
    )?.quantity || 0;
  
  // Handle cart add functionality
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation when clicking cart button
    
    // If already in cart, don't add again (or you could increase quantity)
    if (isInCart) {
      return; // Item already in cart
    }
    
    const cartItem = {
      id: productIdForCart,
      name: displayTitle,
      price: product
        ? Number(resolvedProductPrice || 0)
        : parsePrice(price) ?? 0,
      originalPrice:
        resolvedVariantOriginalPrice !== undefined && Number.isFinite(resolvedVariantOriginalPrice)
          ? resolvedVariantOriginalPrice
          : product?.originalPrice ?? parsePrice(originalPrice),
      imageUrl: displayImageUrl,
      weight: displayWeight,
      inStock: product?.inStock !== undefined ? product.inStock : true,
      category: product?.category || categorySlug,
      subcategory: product?.subcategory || subcategorySlug,
      slug: product?.slug || (product?.id !== undefined ? String(product.id) : (typeof productId === "string" ? productId : undefined)),
      variantId: cartLineVariantId,
      variantName: productHasVariants ? defaultVariantName : null,
      categoryId: product?.category_id ?? product?.categoryId ?? null,
      isSpecial: Boolean(product?.isSpecial),
      bulkOrderLimit: product?.bulk_order_limit ?? product?.bulkOrderLimit ?? null,
      preorderOnly: product?.preorder_only ?? product?.preorderOnly ?? null,
      orderStartDate: product?.order_start_date ?? product?.orderStartDate ?? null,
      orderEndDate: product?.order_end_date ?? product?.orderEndDate ?? null,
      cutoffTime: product?.cutoff_time ?? product?.cutoffTime ?? null,
      pickupTime: product?.pickup_time ?? product?.pickupTime ?? null,
      availableDays: product?.available_days ?? product?.availableDays ?? null
    };
    
    addToCart(cartItem);
  };
  const labelText = product?.label_name ?? product?.labelName ?? null;
  const labelColor = product?.label_color ?? product?.labelColor ?? null;
  const getReadableLabelText = (bg?: string | null) => {
    if (!bg) return "text-white";
    const hex = bg.trim();
    const match = hex.match(/^#?([0-9a-fA-F]{6})$/);
    if (!match) return "text-white";
    const val = match[1];
    const r = parseInt(val.slice(0, 2), 16);
    const g = parseInt(val.slice(2, 4), 16);
    const b = parseInt(val.slice(4, 6), 16);
    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return luminance > 0.6 ? "text-gray-900" : "text-white";
  };
  const labelTextClass = getReadableLabelText(labelColor);

  return (
    <Link
      href={productUrl}
      className={`border border-gray-300 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden relative flex flex-col hover:shadow-xl transition-shadow duration-300 bg-[#F3FFF5] ${
        layout === "carousel"
          ? "w-36 sm:w-56 lg:w-52 shrink-0 h-[256px] sm:h-[370px] lg:h-[446px]"
          : size === "compact"
            ? "w-full min-w-0 h-[212px] sm:h-60 md:h-64 lg:h-[322px]"
            : "w-full min-w-0 h-[212px] sm:h-52 md:h-56 lg:h-[295px]"
      }`}
    >
      
      {/* ===== LABEL ===== */}
      {hasDiscount && (
        <div className={`absolute top-0 left-0 z-10 ${displayDiscountColor} text-white text-[11px] sm:text-sm px-3 sm:px-4 py-0.5 sm:py-1 
                      rounded-tl-xl rounded-br-lg`}>
          {displayDiscountPercentage}
        </div>
      )}

      {Boolean(product?.isSpecial) && (
        <div
          className={`absolute left-0 z-10 bg-black/85 text-white text-[10px] sm:text-xs font-semibold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-br-lg ${
            hasDiscount ? "top-7 sm:top-9" : "top-0"
          }`}
        >
          Meals
        </div>
      )}

      {/* ===== IMAGE AREA (fixed on mobile to prevent content clipping) ===== */}
      <div
        className={`relative w-full shrink-0 ${
          layout === "carousel"
            ? "h-40 sm:h-[70%]"
            : size === "compact"
              ? "h-[110px] sm:h-[58%]"
              : "h-[110px] sm:h-[62%]"
        }`}
      >
        <img
          src={displayImageUrl}
          alt={displayTitle}
          loading="lazy"
          decoding="async"
          className="object-cover w-full h-full"
          onError={(e) => {
            // Fallback image on error
            e.currentTarget.src = 'https://placehold.co/600x400?text=Product+Image';
          }}
        />
      </div>

      {/* ===== CONTENT AREA ===== */}
      <div
        className={`px-1.5 sm:px-3 pt-1.5 pb-2 sm:pt-2.5 sm:pb-3 flex flex-col justify-between gap-0.5 min-h-0 flex-1 ${
          layout === "carousel" ? "sm:h-[30%]" : size === "compact" ? "sm:h-[42%]" : "sm:h-[38%]"
        }`}
      >
        
        {/* Title + Rating */}
        <div className="flex items-start justify-between min-h-0 sm:min-h-[2.5rem]">
          <div className="min-w-0 w-full">
            {labelText && (
              <div className="mb-1">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] sm:text-xs font-semibold ${labelTextClass}`}
                  style={{ backgroundColor: labelColor || "#166534" }}
                >
                  {labelText}
                </span>
              </div>
            )}
            <h3 className={`font-semibold text-black ${layout === "carousel" ? "text-[13px] sm:text-lg" : size === "compact" ? "text-[11px] sm:text-sm md:text-base" : "text-[11px] sm:text-xs md:text-sm"} leading-snug line-clamp-2 break-words min-w-0 min-h-[2.25rem] ${titleClassName ?? ""}`}>
              {titleWithWeight}
            </h3>
          </div>

          <div className="shrink-0" />
        </div>
        {/* Divider */}
        <div className="h-px w-full bg-gray-200" />

        {/* Price + Cart */}
        <div className="flex items-center justify-between gap-2 mt-auto pt-0.5 px-2 pb-0.5 sm:px-0 sm:pb-0">
          <div className="flex flex-col">
            {displayOriginalPrice && (
              <p className={`${layout === "carousel" ? "text-[11px] sm:text-sm" : "text-[10px] sm:text-xs"} text-gray-500 line-through`}>{displayOriginalPrice}</p>
            )}
            <p className={`${layout === "carousel" ? "text-sm sm:text-xl" : "text-[13px] sm:text-lg md:text-xl"} font-medium text-black`}>{displayPrice}</p>
          </div>

          <button 
            onClick={handleAddToCart}
            disabled={isInCart}
            className={`${layout === "carousel" ? "rounded-full w-9 h-9 sm:w-10 sm:h-10" : "rounded-lg w-7 h-7 sm:w-8 sm:h-8"} shrink-0 transition-all duration-200 flex items-center justify-center ${
              isInCart 
                ? "bg-green-800 text-white scale-105" 
                : "bg-white border border-gray-300 hover:bg-gray-100 hover:shadow-md cursor-pointer"
            }`}
          >
            <ShoppingCart size={layout === "carousel" ? 16 : size === "compact" ? 16 : 13} />
          </button>
        </div>
      </div>
    </Link>
  );
}
