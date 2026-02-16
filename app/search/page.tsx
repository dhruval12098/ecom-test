"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ApiService from "@/lib/api";
import ProductCard from "@/components/common/ProductCard";

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  discountPercentage?: string;
  discountColor?: string;
  rating?: number;
  reviews?: number;
  inStock?: boolean;
  weight?: string;
  origin?: string;
  category?: string;
  subcategory?: string;
  slug?: string;
  description?: string;
}

function SearchPageInner() {
  const searchParams = useSearchParams();
  const query = (searchParams.get("q") || "").trim();
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (!query) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const categories = await ApiService.getCategories();
        const products: Product[] = [];
        categories.forEach((category: any) => {
          category.subcategories.forEach((subcategory: any) => {
            if (subcategory.products) {
              subcategory.products.forEach((product: any) => {
                products.push({
                  ...product,
                  imageUrl: product.imageUrl || product.image_url || product.image || "",
                  category: category.slug,
                  subcategory: subcategory.slug,
                  slug: product.name?.toLowerCase().replace(/\s+/g, "-")
                });
              });
            }
          });
        });
        const filtered = products.filter((p) =>
          p.name.toLowerCase().includes(query.toLowerCase())
        );
        setResults(filtered);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [query]);

  return (
    <div className="min-h-screen bg-gray-50 fade-in">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900">
          Search results for "{query}"
        </h1>
        <p className="text-gray-600 mt-2">
          {loading ? "Searching..." : `${results.length} results`}
        </p>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-4">
                <div className="skeleton w-full aspect-square rounded-xl mb-4" />
                <div className="skeleton h-4 w-3/4 mb-2" />
                <div className="skeleton h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="mt-8 text-gray-600">No products found.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
            {results.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  originalPrice: product.originalPrice,
                  imageUrl: product.imageUrl,
                  discountPercentage: product.discountPercentage || "",
                  discountColor: product.discountColor || "bg-red-500",
                  description: product.description || "",
                  rating: product.rating || 0,
                  reviews: product.reviews || 0,
                  inStock: product.inStock ?? true,
                  weight: product.weight || "",
                  origin: product.origin || "",
                  category: product.category,
                  subcategory: product.subcategory,
                  slug: product.slug
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchPageInner />
    </Suspense>
  );
}
