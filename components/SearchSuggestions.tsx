'use client';

import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ApiService from '@/lib/api';
import { formatCurrency } from '@/lib/currency';

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  discountPercentage?: string;
  description: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  weight: string;
  origin: string;
  slug?: string;
  category?: string;
  subcategory?: string;
}

interface Subcategory {
  id: number;
  name: string;
  slug: string;
  image?: string;
  products: Product[];
}

interface Category {
  id: number;
  name: string;
  slug: string;
  image?: string;
  subcategories: Subcategory[];
}

interface SearchSuggestionsProps {
  searchQuery: string;
  showSuggestions: boolean;
  setShowSuggestions: (show: boolean) => void;
  onInputChange: (value: string) => void;
  categories?: Category[];
}

const SearchSuggestions = ({
  searchQuery,
  showSuggestions,
  setShowSuggestions,
  onInputChange,
  categories: propCategories
}: SearchSuggestionsProps) => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Extract products from passed categories or fetch if not provided
  useEffect(() => {
    setIsLoading(true);

    if (propCategories && propCategories.length > 0) {
      const products: Product[] = [];
      propCategories.forEach(category => {
        category.subcategories.forEach(subcategory => {
          if (subcategory.products) {
            products.push(
              ...subcategory.products.map((p) => ({
                ...p,
                slug: p.name?.toLowerCase().replace(/\s+/g, "-"),
                category: category.slug,
                subcategory: subcategory.slug
              }))
            );
          }
        });
      });
      setAllProducts(products);
      setIsLoading(false);
    } else {
      const fetchCategories = async () => {
        try {
          const data: Category[] = await ApiService.getCategories();
          const products: Product[] = [];
          data.forEach(category => {
            category.subcategories.forEach(subcategory => {
              if (subcategory.products) {
                products.push(
                  ...subcategory.products.map((p) => ({
                    ...p,
                    slug: p.name?.toLowerCase().replace(/\s+/g, "-"),
                    category: category.slug,
                    subcategory: subcategory.slug
                  }))
                );
              }
            });
          });
          setAllProducts(products);
          setIsLoading(false);
        } catch (error) {
          console.error('Error fetching categories:', error);
          setIsLoading(false);
        }
      };

      fetchCategories();
    }
  }, [propCategories]);

  // Filter products based on search query
  const filteredProducts = allProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle clicking outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [setShowSuggestions]);

  // Handle input focus
  const handleInputFocus = () => {
    if (searchQuery.length > 0) {
      setShowSuggestions(true);
    }
  };


  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    if (searchQuery.trim()) {
      // Update the URL to trigger search
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
    e.preventDefault();
  };

  return (
    <div className="relative" ref={suggestionsRef}>
      <form action="/search" method="get" onSubmit={(e) => handleSubmit(e)}>
        <div className="relative">
          <input
            type="text"
            name="q"
            value={searchQuery}
            onChange={(e) => onInputChange(e.target.value)}
            onFocus={handleInputFocus}
            placeholder="Search for products, categories"
            className="w-full bg-gray-200 rounded-full px-6 py-3 text-sm outline-none focus:ring-2 focus:ring-green-700 focus:ring-green-600 pl-12"
            autoComplete="off"
          />
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-600" />
        </div>
      </form>

      {/* Search Suggestions Dropdown */}
      {showSuggestions && searchQuery.length > 0 && (
        <div className="absolute z-50 mt-2 w-full bg-white shadow-xl rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Loading suggestions...</div>
          ) : filteredProducts.length > 0 ? (
            <>
              {filteredProducts.slice(0, 8).map((product) => {
                const href = `/${product.category || 'products'}/${product.subcategory || 'all'}/${product.slug || product.id}`;
                return (
                <button
                  key={product.id}
                  type="button"
                  className="w-full text-left flex items-center p-4 hover:bg-green-50 border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => {
                    setShowSuggestions(false);
                    router.push(href);
                  }}
                >
                  <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://placehold.co/80x80?text=Img';
                      }}
                    />
                  </div>
                  <div className="ml-4 flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {product.name}
                    </div>
                    <div className="text-sm text-green-600 font-semibold mt-1">
                      {formatCurrency(Number(product.price))}
                    </div>
                    {product.weight && (
                      <div className="text-xs text-gray-500 mt-1">{product.weight}</div>
                    )}
                  </div>
                  {product.discountPercentage && (
                    <div className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded whitespace-nowrap">
                      {product.discountPercentage}
                    </div>
                  )}
                </button>
              )})}
            </>
          ) : (
            <div className="p-4 text-gray-500 text-center">
              No products found for "{searchQuery}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchSuggestions;
