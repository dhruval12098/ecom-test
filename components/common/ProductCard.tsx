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
};

export default function ProductCard({
  title = "Fresh Amla Powder",
  weight = "100 Gm",
  price = "$1.25",
  originalPrice,
  rating = 4.5,
  imageUrl,
  discountPercentage = "10% Off",
  discountColor = "bg-red-500",
  productId,
  categorySlug,
  subcategorySlug,
  product,
  layout = "grid",
}: ProductCardProps) {
  const { addToCart, cartItems } = useCart();
  const parsePrice = (value?: string) => {
    if (!value) return undefined;
    const normalized = value.replace(/[^\d.,-]/g, "").replace(",", ".");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : undefined;
  };
  // Generate product URL if all required slugs are provided
  const productUrl = product && product.category && product.subcategory && product.slug
    ? `/${product.category}/${product.subcategory}/${product.slug}`
    : (productId && categorySlug && subcategorySlug 
        ? `/${categorySlug}/${subcategorySlug}/${productId}`
        : '#');
  
  // Use product data if provided, otherwise use props
  const displayTitle = product?.name || title;
  const displayWeight = product?.weight || weight;
  const displayPrice = product ? formatCurrency(Number(product.price)) : price;
  const displayOriginalPrice = product?.originalPrice ? formatCurrency(Number(product.originalPrice)) : originalPrice;
  const displayRating = product?.rating || rating;
  const displayDiscountPercentage = product?.discountPercentage || discountPercentage;
  const displayDiscountColor = product?.discountColor || discountColor;
  const displayImageUrl = product?.imageUrl || imageUrl || "";

  // Generate product ID for cart lookup
  const productIdForCart = product?.id || (typeof productId === 'string' ? parseInt(productId) : productId as number) || Date.now();
  
  // Check if item is already in cart
  const isInCart = cartItems.some(item => item.id === productIdForCart);
  const cartItemQuantity = cartItems.find(item => item.id === productIdForCart)?.quantity || 0;
  
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
      price: product?.price ?? parsePrice(price) ?? 0,
      originalPrice: product?.originalPrice ?? parsePrice(originalPrice),
      imageUrl: displayImageUrl,
      weight: displayWeight,
      inStock: product?.inStock !== undefined ? product.inStock : true,
      category: product?.category || categorySlug,
      subcategory: product?.subcategory || subcategorySlug,
      slug: product?.slug || (typeof productId === 'string' ? productId : undefined)
    };
    
    addToCart(cartItem);
  };
  return (
    <Link
      href={productUrl}
      className={`border border-gray-300 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden relative flex flex-col hover:shadow-xl transition-shadow duration-300 bg-white ${
        layout === "carousel" ? "w-48 sm:w-72 shrink-0" : "w-full min-w-0"
      } h-[290px] sm:h-[420px]`}
    >
      
      {/* ===== LABEL ===== */}
      <div className={`absolute top-0 left-0 z-10 ${displayDiscountColor} text-white text-[11px] sm:text-sm px-3 sm:px-4 py-0.5 sm:py-1 
                      rounded-tl-xl rounded-br-lg`}>
        {displayDiscountPercentage}
      </div>

      {/* ===== IMAGE AREA (70% on mobile, 75% on desktop) ===== */}
      <div className="relative w-full h-[60%] sm:h-[70%]">
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
      <div className="px-3 sm:px-4 py-3 sm:py-4 flex flex-col gap-2 h-[40%] sm:h-[30%]">
        
        {/* Title + Rating */}
        <div className="flex items-start justify-between">
          <div className="flex items-baseline gap-2 min-w-0">
            <h3 className="font-semibold text-black text-[13px] sm:text-lg leading-snug line-clamp-1 min-w-0">
              {displayTitle}
            </h3>
            <p className="text-[10px] sm:text-sm text-gray-600 whitespace-nowrap">
              {displayWeight}
            </p>
          </div>

          <div className="shrink-0" />
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-gray-200" />

        {/* Price + Cart */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <p className="text-sm sm:text-xl font-bold text-black">{displayPrice}</p>
            {displayOriginalPrice && (
              <p className="text-[11px] sm:text-sm text-gray-500 line-through">{displayOriginalPrice}</p>
            )}
          </div>

          <button 
            onClick={handleAddToCart}
            disabled={isInCart}
            className={`rounded-full w-9 h-9 sm:w-10 sm:h-10 transition-all duration-200 flex items-center justify-center ${
              isInCart 
                ? "bg-green-800 text-white scale-105" 
                : "bg-white border border-gray-300 hover:bg-gray-100 hover:shadow-md cursor-pointer"
            }`}
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </Link>
  );
}
