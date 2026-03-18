"use client";

import { ShoppingCart, Check } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { formatCurrency } from "@/lib/currency";

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
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
  const displayPrice = product
    ? formatCurrency(Number(resolvedProductPrice || 0))
    : (parsedPrice !== undefined ? formatCurrency(parsedPrice) : price);
  const displayOriginalPrice =
    resolvedVariantOriginalPrice !== undefined && Number.isFinite(resolvedVariantOriginalPrice)
      ? formatCurrency(resolvedVariantOriginalPrice)
      : product?.originalPrice
    ? formatCurrency(Number(product.originalPrice))
    : (parsedOriginalPrice !== undefined ? formatCurrency(parsedOriginalPrice) : originalPrice);
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
      variantName: productHasVariants ? defaultVariantName : null
    };
    
    addToCart(cartItem);
  };
  return (
    <Link
      href={productUrl}
      className={`border border-gray-300 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden relative flex flex-col hover:shadow-xl transition-shadow duration-300 bg-[#F8FFF9] ${
        layout === "carousel"
          ? "w-48 sm:w-72 shrink-0 h-[290px] sm:h-[420px]"
          : size === "compact"
            ? "w-full min-w-0 h-60 sm:h-68 md:h-72 lg:h-80"
            : "w-full min-w-0 h-48 sm:h-56 md:h-60 lg:h-72"
      }`}
    >
      
      {/* ===== LABEL ===== */}
      {hasDiscount && (
        <div className={`absolute top-0 left-0 z-10 ${displayDiscountColor} text-white text-[11px] sm:text-sm px-3 sm:px-4 py-0.5 sm:py-1 
                      rounded-tl-xl rounded-br-lg`}>
          {displayDiscountPercentage}
        </div>
      )}

      {/* ===== IMAGE AREA (70% on mobile, 75% on desktop) ===== */}
      <div className={`relative w-full ${layout === "carousel" ? "h-[60%] sm:h-[70%]" : size === "compact" ? "h-[58%]" : "h-[62%]"}`}>
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

      {/* ===== CONTENT AREA (30% on mobile, 25% on desktop) ===== */}
      <div className={`px-2 sm:px-3 pt-2 pb-3 sm:pt-2.5 sm:pb-3 flex flex-col gap-1.5 ${layout === "carousel" ? "h-[40%] sm:h-[30%]" : size === "compact" ? "h-[42%]" : "h-[38%]"}`}>
        
        {/* Title + Rating */}
        <div className="flex items-start justify-between min-h-[2.25rem] sm:min-h-[2.5rem]">
          <div className="min-w-0 w-full">
            <h3 className={`font-semibold text-black ${layout === "carousel" ? "text-[13px] sm:text-lg" : size === "compact" ? "text-[11px] sm:text-sm md:text-base" : "text-[10px] sm:text-xs md:text-sm"} leading-snug line-clamp-1 break-words min-w-0 ${titleClassName ?? ""}`}>
              {displayTitle}
            </h3>
          </div>

          <div className="shrink-0" />
        </div>
        {displayWeight ? (
          <p className={`${layout === "carousel" ? "text-[11px] sm:text-xs" : size === "compact" ? "text-[10px] sm:text-xs md:text-sm" : "text-[9px] sm:text-[10px] md:text-xs"} text-gray-600 leading-tight line-clamp-1`}>
            {displayWeight}
          </p>
        ) : null}

        {/* Divider */}
        <div className="h-px w-full bg-gray-200" />

        {/* Price + Cart */}
        <div className="flex items-center justify-between gap-2 mt-auto pt-0.5">
          <div className="flex flex-col">
            <p className={`${layout === "carousel" ? "text-sm sm:text-xl" : size === "compact" ? "text-base sm:text-lg md:text-xl" : "text-[10px] sm:text-xs md:text-sm"} font-bold text-black`}>{displayPrice}</p>
            {displayOriginalPrice && (
              <p className={`${layout === "carousel" ? "text-[11px] sm:text-sm" : size === "compact" ? "text-[10px] sm:text-xs" : "text-[9px] sm:text-[10px]"} text-gray-500 line-through`}>{displayOriginalPrice}</p>
            )}
          </div>

          <button 
            onClick={handleAddToCart}
            disabled={isInCart}
            className={`rounded-full shrink-0 ${layout === "carousel" ? "w-9 h-9 sm:w-10 sm:h-10" : size === "compact" ? "w-9 h-9 sm:w-10 sm:h-10" : "w-7 h-7 sm:w-8 sm:h-8"} transition-all duration-200 flex items-center justify-center ${
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
