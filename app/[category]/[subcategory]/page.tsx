"use client";

import { useState, useEffect } from "react";
import { notFound, useParams } from "next/navigation";
import ProductCard from "@/components/common/ProductCard";
import { Home, ChevronRight } from "lucide-react";
import Link from "next/link";

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

export default function SubcategoryPage() {
  const params = useParams();
  const category = params.category as string;
  const subcategory = params.subcategory as string;
  
  const [categoryData, setCategoryData] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const response = await fetch("/data/categories.json");
        const categories: Category[] = await response.json();
        
        const foundCategory = categories.find(cat => cat.slug === category);
        if (!foundCategory) {
          notFound();
          return;
        }
        
        setCategoryData(foundCategory);
        
        // Find the specific subcategory and get its products
        const subcategoryData = foundCategory.subcategories.find(sub => sub.slug === subcategory);
        if (subcategoryData) {
          const productsWithSlugs = subcategoryData.products.map((product: any) => ({
            ...product,
            slug: product.name.toLowerCase().replace(/\s+/g, '-'),
            category: foundCategory.slug,
            subcategory: subcategoryData.slug
          }));
          setProducts(productsWithSlugs);
        }
      } catch (error) {
        console.error("Error fetching category data:", error);
        notFound();
      }
    };

    fetchCategoryData();
  }, [category, subcategory]);

  if (!categoryData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-bold">Loading...</div>
      </div>
    );
  }

  const currentSubcategory = categoryData.subcategories.find(sub => sub.slug === subcategory);
  const allSubcategories = [
    { name: "All", slug: "all" },
    ...categoryData.subcategories
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white pt-6">
        <div className="max-w-7xl mx-auto px-4 py-4 border-b border-gray-800">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-green-600">
              <Home size={16} />
            </Link>
            <ChevronRight size={16} />
            <Link href={`/${category}`} className="hover:text-green-600">{categoryData.name}</Link>
            <ChevronRight size={16} />
            <span className="text-gray-900">{currentSubcategory?.name}</span>
          </div>
        </div>
      </div>

      {/* Category Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">{currentSubcategory?.name}</h1>
          <p className="text-lg text-gray-600 mt-1">{categoryData.name} - {products.length} products</p>
        </div>
      </div>

      {/* Subcategory Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8 overflow-x-auto py-4">
            {allSubcategories.map((sub) => (
              <Link
                key={sub.slug}
                href={sub.slug === 'all' ? `/${category}` : `/${category}/${sub.slug}`}
                className={`whitespace-nowrap pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  sub.slug === subcategory
                    ? "border-green-600 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {sub.name} ({sub.slug !== 'all' 
                  ? (categoryData.subcategories.find(s => s.slug === sub.slug)?.products.length || 0)
                  : categoryData.subcategories.reduce((acc, curr) => acc + curr.products.length, 0)})
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No products found in this subcategory</div>
          </div>
        ) : (
          <>
            <div className="bg-green-50 rounded-t-2xl p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentSubcategory?.name}</h2>
              <p className="text-gray-600">{categoryData.name} - {products.length} products</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                title={product.name}
                price={`₹${product.price}`}
                originalPrice={`₹${product.originalPrice}`}
                imageUrl={product.imageUrl}
                discountPercentage={product.discountPercentage}
                discountColor={product.discountColor}
                productId={product.slug}
                categorySlug={product.category}
                subcategorySlug={product.subcategory}
              />
            ))}
          </div>
          </>
        )}
      </div>
    </div>
  );
}