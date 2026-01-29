"use client";

import { useState, useEffect } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import { Star, Home, ChevronRight, ShoppingCart, Heart } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

interface ProductDetails {
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
  weight: string;
  origin: string;
  imageGallery?: string[];
}

interface Subcategory {
  id: number;
  name: string;
  slug: string;
  products: ProductDetails[];
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  subcategories: Subcategory[];
}

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const category = params.category as string;
  const subcategory = params.subcategory as string;
  const productSlug = params.product as string;

  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/data/categories.json");
        const categories: Category[] = await response.json();

        // Find the product across all categories and subcategories
        let foundProduct: ProductDetails | null = null;

        for (const cat of categories) {
          if (cat.slug === category) {
            for (const subcat of cat.subcategories) {
              if (subcat.slug === subcategory) {
                const product = subcat.products.find(
                  (p: any) =>
                    p.name.toLowerCase().replace(/\s+/g, "-") === productSlug
                );
                if (product) {
                  foundProduct = {
                    ...product,
                    slug: product.name.toLowerCase().replace(/\s+/g, "-"),
                    category: cat.slug,
                    subcategory: subcat.slug,
                  };
                  break;
                }
              }
            }
            if (foundProduct) break;
          }
        }

        if (!foundProduct) {
          notFound();
          return;
        }

        setProduct(foundProduct);
      } catch (error) {
        console.error("Error fetching product data:", error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [category, subcategory, productSlug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-bold">Loading product details...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-bold">Product not found</div>
      </div>
    );
  }

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
      y: (y / rect.height) * 100,
    });
  };

  const handleMouseEnter = () => setShowZoom(true);
  const handleMouseLeave = () => setShowZoom(false);

  const handleAddToCart = () => {
    if (!product) return;
    
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      imageUrl: product.imageUrl,
      weight: product.weight,
      inStock: product.inStock,
      category: product.category,
      subcategory: product.subcategory,
      slug: product.slug
    };
    
    // Add item 'quantity' times
    for (let i = 0; i < quantity; i++) {
      addToCart(cartItem);
    }
    
    // Reset quantity to 1 after adding
    setQuantity(1);
  };

  const handleBuyNow = () => {
    if (!product) return;
    
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      imageUrl: product.imageUrl,
      weight: product.weight,
      inStock: product.inStock,
      category: product.category,
      subcategory: product.subcategory,
      slug: product.slug
    };
    
    // Add item 'quantity' times to cart
    for (let i = 0; i < quantity; i++) {
      addToCart(cartItem);
    }
    
    // Navigate to checkout
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-white pt-6">
        <div className="max-w-7xl mx-auto px-4 py-4 border-b border-gray-800">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-green-600">
              <Home size={16} />
            </Link>
            <ChevronRight size={16} />
            <Link href={`/${category}`} className="hover:text-green-600">
              {category
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </Link>
            <ChevronRight size={16} />
            <Link
              href={`/${category}/${subcategory}`}
              className="hover:text-green-600"
            >
              {subcategory
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </Link>
            <ChevronRight size={16} />
            <span className="text-gray-900">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="border border-gray-200 rounded-3xl shadow-lg p-6 bg-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Image Gallery */}
            <div className="space-y-3 relative">
              {/* Main Image Card */}
              <div
                className="relative rounded-2xl overflow-hidden shadow-lg"
                style={{ width: "85%" }}
              >
                {/* Stock Badge - Stuck to left */}
                <div className="absolute top-4 left-0 z-10">
                  <span
                    className={`px-3 py-1 rounded-r-md text-xs font-medium ${
                      product.inStock
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {product.inStock ? "Available in stock" : "Out of stock"}
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
                    backgroundRepeat: "no-repeat",
                  }}
                />
              )}

              {/* Thumbnail Gallery - Smaller */}
              {images.length > 1 && (
                <div className="flex gap-2" style={{ width: "85%" }}>
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
              {product.discountPercentage && (
                <div className="inline-block">
                  <span className="bg-yellow-500 text-white px-3 py-1 text-xs font-bold block rounded-tl-lg rounded-br-lg">
                    {product.discountPercentage}
                  </span>
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
                        i < Math.floor(product.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-gray-300 text-gray-300"
                      }
                    />
                  ))}
                </div>
                <span className="text-gray-600 text-sm">
                  ({product.reviews} Reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">
                  ${product.price.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <span className="text-lg text-gray-400 line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Pricing Info */}
              <p className="text-gray-500 text-xs">
                Prices incl. VAT plus shipping cost
              </p>

              {/* Description */}
              <div className="border-t border-b border-gray-200 py-3">
                <p className="text-gray-600 text-sm leading-relaxed">
                  {product.description ||
                    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s"}
                </p>
              </div>

              {/* Quantity Selector */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                  Quantity
                </h4>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-gray-100 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center hover:bg-gray-200 rounded-l-lg transition-colors text-lg font-bold"
                    >
                      −
                    </button>
                    <span className="w-12 text-center font-semibold text-base">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
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
                  className="w-full bg-black hover:bg-gray-800 text-white py-3 px-6 rounded-lg font-bold text-base transition-colors"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
