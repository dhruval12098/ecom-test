"use client";

import { ShoppingCart, Check } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

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
  imageUrl: string;
  discountPercentage?: string;
  discountColor?: string;
  productId?: string | number;
  categorySlug?: string;
  subcategorySlug?: string;
  product?: Product;
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
}: ProductCardProps) {
  const { addToCart, cartItems } = useCart();
  // Generate product URL if all required slugs are provided
  const productUrl = product && product.category && product.subcategory && product.slug
    ? `/${product.category}/${product.subcategory}/${product.slug}`
    : (productId && categorySlug && subcategorySlug 
        ? `/${categorySlug}/${subcategorySlug}/${productId}`
        : '#');
  
  // Use product data if provided, otherwise use props
  const displayTitle = product?.name || title;
  const displayWeight = product?.weight || weight;
  const displayPrice = product ? `₹${product.price}` : price;
  const displayOriginalPrice = product?.originalPrice ? `₹${product.originalPrice}` : originalPrice;
  const displayRating = product?.rating || rating;
  const displayDiscountPercentage = product?.discountPercentage || discountPercentage;
  const displayDiscountColor = product?.discountColor || discountColor;

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
      price: product?.price ? product.price : parseFloat(price.replace('₹', '$')) || 0,
      originalPrice: product?.originalPrice || (originalPrice ? parseFloat(originalPrice.replace('₹', '$')) : undefined),
      imageUrl,
      weight: displayWeight,
      inStock: product?.inStock !== undefined ? product.inStock : true,
      category: product?.category || categorySlug,
      subcategory: product?.subcategory || subcategorySlug,
      slug: product?.slug || (typeof productId === 'string' ? productId : undefined)
    };
    
    addToCart(cartItem);
  };
  return (
    <Link href={productUrl} className="w-60 sm:w-72 h-96 sm:h-[430px] border border-gray-300 rounded-2xl shadow-lg overflow-hidden relative flex flex-col hover:shadow-xl transition-shadow duration-300">
      
      {/* ===== LABEL ===== */}
      <div className={`absolute top-0 left-0 z-10 ${displayDiscountColor} text-white text-sm px-4 py-1 
                      rounded-tl-2xl rounded-br-xl`}>
        {displayDiscountPercentage}
      </div>

      {/* ===== IMAGE AREA (70% on mobile, 75% on desktop) ===== */}
      <div className="relative h-[70%] sm:h-[75%] w-full">
        <img
          src={imageUrl}
          alt={displayTitle}
          className="object-cover w-full h-full"
          onError={(e) => {
            // Fallback image on error
            e.currentTarget.src = 'https://placehold.co/600x400?text=Product+Image';
          }}
        />
      </div>

      {/* ===== CONTENT AREA (30% on mobile, 25% on desktop) ===== */}
      <div className="h-[30%] sm:h-[25%] px-4 py-3 flex flex-col justify-between">
        
        {/* Title + Rating */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-black text-base sm:text-lg leading-tight">
              {displayTitle}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">{displayWeight}</p>
          </div>

          <div className="flex items-center gap-1 text-sm text-gray-700">
            {/* SVG Star */}
            <svg
              className="w-4 h-4 fill-yellow-400"
              viewBox="0 0 24 24"
            >
              <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.516 8.287L12 18.896l-7.452 4.525 1.516-8.287L0 9.306l8.332-1.151z" />
            </svg>
            <span className="font-medium">{displayRating}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-gray-300 my-1" />

        {/* Price + Cart */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-lg sm:text-xl font-bold text-black">{displayPrice}</p>
            {displayOriginalPrice && (
              <p className="text-sm text-gray-500 line-through">{displayOriginalPrice}</p>
            )}
          </div>

          <button 
            onClick={handleAddToCart}
            disabled={isInCart}
            className={`rounded-lg p-2 transition-all duration-200 flex items-center gap-1 ${
              isInCart 
                ? "bg-green-800 border border-green-900 text-white cursor-default" 
                : "bg-white border border-gray-300 hover:bg-gray-100 hover:shadow-md cursor-pointer"
            }`}
          >
            {isInCart ? (
              <>
                <ShoppingCart size={16} />
                <span className="text-xs font-medium">Added</span>
              </>
            ) : (
              <ShoppingCart size={18} />
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}
