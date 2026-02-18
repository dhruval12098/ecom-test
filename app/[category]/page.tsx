"use client";

import { useState, useEffect } from "react";
import { notFound, useParams } from "next/navigation";
import ProductCard from "@/components/common/ProductCard";
import { Star, Home, ChevronRight } from "lucide-react";
import Link from "next/link";
import ApiService from "@/lib/api";

interface Product {
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
  const params = useParams();
  const category = params.category as string;

  const [categoryData, setCategoryData] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeSubcategory, setActiveSubcategory] = useState<string>("all");

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const categories: Category[] = await ApiService.getCategories();

        const foundCategory = categories.find((cat) => cat.slug === category);
        if (!foundCategory) {
          notFound();
          return;
        }

        setCategoryData(foundCategory);

        // Flatten all products from all subcategories
        const allProducts: any[] = [];
        foundCategory.subcategories.forEach((sub) => {
          sub.products.forEach((product: any) => {
            allProducts.push({
              id: product.id,
              name: product.name,
              slug:
                product.slug ||
                product.name?.toLowerCase().replace(/\s+/g, "-"),
              category: foundCategory.slug,
              subcategory: sub.slug,
              price: Number(product.price || 0),
              originalPrice:
                product.originalPrice ?? product.original_price ?? null,
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

        // Set 'all' as the default active subcategory
        setActiveSubcategory("all");
      } catch (error) {
        console.error("Error fetching category data:", error);
        notFound();
      }
    };

    fetchCategoryData();
  }, [category]);

  const filteredProducts =
    activeSubcategory === "all"
      ? products
      : products.filter((product: Product) => product.subcategory === activeSubcategory);

  if (!categoryData) {
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

  const subcats = [{ name: "All", slug: "all" }, ...categoryData.subcategories];

  return (
    <div className="min-h-screen bg-gray-50 fade-in">
      {/* Breadcrumb */}
      <div className="bg-white pt-6">
        <div className="max-w-7xl mx-auto px-4 py-4 border-b border-gray-800">
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
                className={`whitespace-nowrap pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${
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
        <div className="bg-white border border-black rounded-t-2xl p-6 mb-6">
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
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.map((product: Product) => (
              <ProductCard
                key={product.id}
                titleClassName="line-clamp-2"
                product={{
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  originalPrice: product.originalPrice,
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
