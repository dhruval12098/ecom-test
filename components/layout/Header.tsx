'use client';

import { useState, useEffect } from 'react';
import { MapPin, ShoppingCart, User, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import SearchSuggestions from '@/components/SearchSuggestions';
import { useCart } from '@/contexts/CartContext';

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

export default function Header() {
  const [showAll, setShowAll] = useState(false);
  const [columnsPerRow, setColumnsPerRow] = useState(6);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  const { getTotalItems } = useCart();
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/data/categories.json');
        const data: Category[] = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const itemsPerRow = columnsPerRow;
  const totalRows = Math.ceil(categories.length / itemsPerRow);
  const displayedCategories: Category[] = showAll ? categories : categories.slice(0, itemsPerRow * 2);

  useEffect(() => {
    const updateColumns = () => {
      if (window.innerWidth < 640) setColumnsPerRow(3);
      else if (window.innerWidth < 768) setColumnsPerRow(4);
      else if (window.innerWidth < 1024) setColumnsPerRow(5);
      else setColumnsPerRow(6);
    };
    
    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  const handleMouseEnter = (slug: string) => {
    setOpenDropdown(slug);
  };

  const handleMouseLeave = () => {
    setOpenDropdown(null);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    
    // Show suggestions when typing
    setShowSuggestions(value.length > 0);
  };

  return (
    <div className="w-full font-sans">
      <div className="text-white text-sm text-center py-3" style={{ backgroundColor: '#173A00' }}>
        Free shipping on orders over €69
      </div>

      <div className="bg-white border-b">
        {/* Desktop Layout */}
        <div className="hidden sm:flex max-w-7xl mx-auto px-4 py-5 items-center gap-10 relative">
          <div className="flex items-center">
            <img 
              src="/brands/fmod.svg" 
              alt="Fmod Logo" 
              className="h-15 w-auto"
              onError={(e) => {
                // Fallback if logo.png doesn't exist
                e.currentTarget.src = 'data:image/svg+xml,%3Csvg width="32" height="32" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="32" height="32" fill="%23266000"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="12" text-anchor="middle" dy=".3em" fill="white"%3EF%3C/text%3E%3C/svg%3E';
              }}
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <MapPin size={16} />
            <div>
              <div className="text-xs text-gray-500">Delivery to</div>
              <div className="font-semibold">Gujarat, India</div>
            </div>
          </div>
          <div className="flex-1 relative z-40">
            <SearchSuggestions
              searchQuery={searchQuery}
              showSuggestions={showSuggestions}
              setShowSuggestions={setShowSuggestions}
              onInputChange={handleSearchChange}
              categories={categories}
            />
          </div>
          <div className="flex items-center gap-6 ml-auto">
            <Link href="/cart" className="cursor-pointer hover:text-gray-600 transition-colors relative">
              <ShoppingCart size={20} />
              {isClient && getTotalItems() > 0 && (
                <span className="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                  {getTotalItems()}
                </span>
              )}
            </Link>
            <Link href="/account" className="cursor-pointer hover:text-gray-600 transition-colors">
              <User size={20} />
            </Link>
          </div>
        </div>
        
        {/* Mobile Layout */}
        <div className="sm:hidden max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="shrink-0">
              <img 
                src="/brands/fmod.svg" 
                alt="Fmod Logo" 
                className="h-12 w-auto"
                onError={(e) => {
                  // Fallback if logo.png doesn't exist
                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg width="32" height="32" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="32" height="32" fill="%23266000"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="12" text-anchor="middle" dy=".3em" fill="white"%3EF%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>
            
            {/* Icons */}
            <div className="flex items-center gap-6">
              <Link href="/cart" className="cursor-pointer hover:text-gray-600 transition-colors relative">
                <ShoppingCart size={24} />
                {isClient && getTotalItems() > 0 && (
                  <span className="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                    {getTotalItems()}
                  </span>
                )}
              </Link>
              <Link href="/account" className="cursor-pointer hover:text-gray-600 transition-colors">
                <User size={24} />
              </Link>
            </div>
          </div>
          
          {/* Full Width Search Bar - Separate Row */}
          <div className="mt-3 relative z-40">
            <SearchSuggestions
              searchQuery={searchQuery}
              showSuggestions={showSuggestions}
              setShowSuggestions={setShowSuggestions}
              onInputChange={handleSearchChange}
              categories={categories}
            />
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: '#266000' }} className="relative">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-6 gap-y-2 text-white text-sm font-medium">
            {loading ? (
              <div className="col-span-full text-center py-4">Loading categories...</div>
            ) : (
              displayedCategories.map((item) => (
                <div 
                  key={item.id}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(item.slug)}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link 
                    href={`/${item.slug}`}
                    className="flex items-center gap-1 cursor-pointer hover:text-gray-300 transition-colors py-1 font-medium"
                  >
                    <span className="font-bold">{item.name}</span>
                    <ChevronDown size={12} />
                  </Link>
                  
                  {/* Dropdown Menu */}
                  {openDropdown === item.slug && item.subcategories.length > 0 && (
                    <div 
                      className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-xl z-50 border border-gray-200"
                      onMouseEnter={() => handleMouseEnter(item.slug)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="p-3">
                        <div className="text-gray-900 font-semibold mb-3 border-b pb-2">{item.name}</div>
                        <div className="grid grid-cols-1 gap-1 max-h-80 overflow-y-auto">
                          {item.subcategories.map((subcat) => (
                            <Link
                              key={subcat.id}
                              href={`/${item.slug}/${subcat.slug}`}
                              className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 transition-colors group"
                            >
                              {subcat.image && (
                                <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
                                  <img 
                                    src={subcat.image} 
                                    alt={subcat.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                    }}
                                  />
                                </div>
                              )}
                              <span className="text-gray-700 group-hover:text-green-700 transition-colors">
                                {subcat.name}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          {totalRows > 2 && (
            <div className="mt-3 text-center">
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-white text-xs hover:text-gray-300 transition-colors underline"
              >
                {showAll ? 'Show Less' : 'More Categories'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}