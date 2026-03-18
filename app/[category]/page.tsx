"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import ProductCard from "@/components/common/ProductCard";
import { Star, Home, ChevronRight } from "lucide-react";
import Link from "next/link";
import ApiService from "@/lib/api";
import { readCache, writeCache } from "@/lib/storageCache";

interface Product {
  id: number;
  name: string;
  slug: string;
  category: string;
  subcategory: string;
  price: number;
  originalPrice: number;
  mainVariantId?: number | null;
  imageUrl: string;
  discountPercentage: string;
  discountColor: string;
  description: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  weight: string;
  origin: string;
  variants?: Array<{
    id?: number | string;
    name?: string | null;
    type?: string | null;
    price?: number | string;
    originalPrice?: number | string | null;
    discountPercentage?: string | null;
    discountColor?: string | null;
  }>;
}

interface Subcategory {
  id: number;
  name: string;
  slug: string;
  products: Product[];
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  subcategories: Subcategory[];
}

export default function CategoryPage() {
  const CATEGORY_CACHE_TTL = 1000 * 60 * 60 * 12; // 12 hours
  const params = useParams();
  const category = params.category as string;

  const [categoryData, setCategoryData] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeSubcategory, setActiveSubcategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    const cacheKey = `category:${category}`;
    const cached = readCache<{ categoryData: Category; products: Product[] }>(cacheKey);
    if (cached?.categoryData) {
      setCategoryData(cached.categoryData);
      setProducts(cached.products || []);
      setLoading(false);
      setMissing(false);
    }

    const fetchCategoryData = async () => {
      try {
        if (!cached) setLoading(true);
        const categories: Category[] = await ApiService.getCategories();

        const foundCategory = categories.find((cat) => cat.slug === category);
        if (!foundCategory) {
          if (!cached) setMissing(true);
          return;
        }

        setCategoryData(foundCategory);

        // Flatten all products from all subcategories
        const allProducts: any[] = [];
        foundCategory.subcategories.forEach((sub) => {
          sub.products.forEach((product: any) => {
            const normalizedSlug =
              product.slug ||
              product.product_slug ||
              (product.id !== undefined && product.id !== null ? String(product.id) : null);
            allProducts.push({
              id: product.id,
              name: product.name,
              slug: normalizedSlug || "",
              category: foundCategory.slug,
              subcategory: sub.slug,
              price: Number(product.price || 0),
              originalPrice:
                product.originalPrice ?? product.original_price ?? null,
              mainVariantId:
                product.mainVariantId ?? product.main_variant_id ?? null,
              variants: Array.isArray(product.variants) ? product.variants : [],
              imageUrl:
                product.imageUrl ||
                product.image_url ||
                product.image ||
                (Array.isArray(product.imageGallery)
                  ? product.imageGallery[0]
                  : undefined) ||
                (Array.isArray(product.image_gallery)
                  ? product.image_gallery[0]
                  : undefined) ||
                "",
              discountPercentage:
                product.discountPercentage || product.discount_percentage || "",
              discountColor:
                product.discountColor || product.discount_color || "bg-red-500",
              description: product.description || "",
              rating: product.rating || 0,
              reviews: product.reviews || 0,
              inStock: product.inStock ?? product.in_stock ?? true,
              weight: product.weight || "",
              origin: product.origin || "",
            });
          });
        });
        const schedules = await Promise.all(
          allProducts.map((product) => ApiService.getActiveSchedule(product.id))
        );
        const productsWithSchedules = allProducts.map((product, index) => {
          const schedule = schedules[index];
          if (!schedule) return product;
          const scheduledPrice = Number(
            schedule.scheduled_price ?? schedule.scheduledPrice
          );
          const normalPrice = Number(
            schedule.normal_price ?? schedule.normalPrice ?? product.originalPrice ?? product.price
          );
          const finalPrice = Number.isFinite(scheduledPrice) ? scheduledPrice : product.price;
          const finalOriginal =
            Number.isFinite(normalPrice) && normalPrice > finalPrice
              ? normalPrice
              : product.originalPrice;
          const discountPercent = schedule.discount_percent ?? schedule.discountPercent;
          const computedDiscount =
            discountPercent !== null && discountPercent !== undefined
              ? `${Number(discountPercent).toFixed(0)}%`
              : Number.isFinite(normalPrice) && normalPrice > finalPrice
                ? `${Math.round(((normalPrice - finalPrice) / normalPrice) * 100)}%`
                : product.discountPercentage;

          return {
            ...product,
            price: finalPrice,
            originalPrice: finalOriginal,
            discountPercentage: computedDiscount || product.discountPercentage
          };
        });
        setProducts(productsWithSchedules);
        setMissing(false);

        // Set 'all' as the default active subcategory
        setActiveSubcategory("all");
        writeCache(
          cacheKey,
          { categoryData: foundCategory, products: productsWithSchedules },
          CATEGORY_CACHE_TTL
        );
      } catch (error) {
        console.error("Error fetching category data:", error);
        if (!cached) setMissing(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [category]);

  const filteredProducts =
    activeSubcategory === "all"
      ? products
      : products.filter((product: Product) => product.subcategory === activeSubcategory);

  if (missing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-lg text-center bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <div className="text-2xl font-bold text-gray-900 mb-2">Category Not Found</div>
          <div className="text-gray-600 mb-6">Please choose another category.</div>
          <Link
            href="/"
            className="inline-flex items-center justify-center bg-black text-white px-4 py-2 rounded-lg font-semibold"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (loading && !categoryData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="skeleton h-8 w-1/3 mb-3" />
          <div className="skeleton h-4 w-1/2 mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-2xl p-4"
              >
                <div className="skeleton w-full aspect-square rounded-xl mb-4" />
                <div className="skeleton h-4 w-3/4 mb-2" />
                <div className="skeleton h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!categoryData) {
    return null;
  }

  const subcats = [{ name: "All", slug: "all" }, ...categoryData.subcategories];

  return (
    <div className="min-h-screen bg-gray-50 fade-in">
      {/* Breadcrumb */}
      <div className="bg-white pt-6">
        <div className="max-w-7xl mx-auto px-4 py-4 border-b border-gray-300">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-green-600">
              <Home size={16} />
            </Link>
            <ChevronRight size={16} />
            <span className="font-medium">{categoryData.name}</span>
          </div>
        </div>
      </div>

      {/* Category Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {categoryData.name}
          </h1>
          <p className="text-lg text-gray-600">{categoryData.description}</p>
          <div className="mt-4 flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              {categoryData.subcategories.length} Subcategories
            </span>
            <span className="text-sm text-gray-500">
              {products.length} Products
            </span>
          </div>
        </div>
      </div>

      {/* Subcategory Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8 overflow-x-auto py-4">
            {subcats.map((sub) => (
              <Link
                key={sub.slug}
                href={`/${category}/${sub.slug}`}
                className={`whitespace-nowrap pb-2 px-1 border-b border-gray-200 font-medium text-sm transition-colors ${
                  activeSubcategory === sub.slug
                    ? "border-green-600 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {sub.name} (
                {sub.slug !== "all"
                  ? products.filter((p) => p.subcategory === sub.slug).length
                  : products.length}
                )
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-8">
        <div className="bg-white border border-black rounded-2xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {activeSubcategory === "all"
                ? "All Products"
                : subcats.find((s) => s.slug === activeSubcategory)?.name}
            </h2>
            <div className="text-sm text-gray-600">
              {filteredProducts.length} products
            </div>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No products found</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
            {filteredProducts.map((product: Product) => (
              <ProductCard
                key={product.id}
                titleClassName="line-clamp-2"
                size="compact"
                product={{
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  originalPrice: product.originalPrice,
                  mainVariantId: product.mainVariantId,
                  variants: product.variants,
                  imageUrl: product.imageUrl,
                  discountPercentage: product.discountPercentage,
                  discountColor: product.discountColor,
                  description: product.description || "",
                  rating: product.rating,
                  reviews: product.reviews,
                  inStock: product.inStock,
                  weight: product.weight,
                  origin: product.origin,
                  category: product.category,
                  subcategory: product.subcategory,
                  slug: product.slug,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
