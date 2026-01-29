"use client"
import { Suspense } from "react";

import { useState, useEffect } from "react";
import { Search, Filter, Grid, List, Star, ShoppingCart, Heart } from "lucide-react";
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  weight: string;
  origin: string;
  category: string;
  subcategory: string;
  slug: string;
}




function SearchContent() {
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    
    // Show suggestions when typing
    setShowSuggestions(value.length > 0);
    
    // Update URL with search query
    if (value) {
      router.push(`/search?q=${encodeURIComponent(value)}`);
    } else {
      router.push('/search');
    }
  };
  
  const handleInputFocus = () => {
    if (searchQuery.length > 0) {
      setShowSuggestions(true);
    }
  };
  
  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('relevance');
  const [filters, setFilters] = useState({
    category: '',
    minPrice: 0,
    maxPrice: 1000,
    inStock: false
  });

  // Mock data - in a real app, this would come from an API
  useEffect(() => {
    const mockProducts: Product[] = [
      {
        id: 1,
        name: "Organic Apple",
        price: 120,
        originalPrice: 150,
        imageUrl: "/placeholder-product.jpg",
        rating: 4.5,
        reviews: 128,
        inStock: true,
        weight: "1kg",
        origin: "Himachal Pradesh",
        category: "fruits",
        subcategory: "organic-fruits",
        slug: "organic-apple"
      },
      {
        id: 2,
        name: "Fresh Carrots",
        price: 80,
        originalPrice: 100,
        imageUrl: "/placeholder-product.jpg",
        rating: 4.2,
        reviews: 89,
        inStock: true,
        weight: "500g",
        origin: "Punjab",
        category: "vegetables",
        subcategory: "root-vegetables",
        slug: "fresh-carrots"
      },
      {
        id: 3,
        name: "Premium Tea",
        price: 250,
        originalPrice: 300,
        imageUrl: "/placeholder-product.jpg",
        rating: 4.7,
        reviews: 245,
        inStock: false,
        weight: "250g",
        origin: "Assam",
        category: "beverages",
        subcategory: "herbal-teas",
        slug: "premium-tea"
      },
      {
        id: 4,
        name: "Whole Wheat Bread",
        price: 549,
        originalPrice: 600,
        imageUrl: "/placeholder-product.jpg",
        rating: 4.0,
        reviews: 67,
        inStock: true,
        weight: "400g",
        origin: "Local Bakery",
        category: "bakery",
        subcategory: "bread",
        slug: "whole-wheat-bread"
      },
      {
        id: 5,
        name: "Fresh Bananas",
        price: 60,
        originalPrice: 70,
        imageUrl: "/placeholder-product.jpg",
        rating: 4.3,
        reviews: 156,
        inStock: true,
        weight: "1kg",
        origin: "Tamil Nadu",
        category: "fruits",
        subcategory: "tropical-fruits",
        slug: "fresh-bananas"
      },
      {
        id: 6,
        name: "Almond Milk",
        price: 299,
        originalPrice: 350,
        imageUrl: "/placeholder-product.jpg",
        rating: 4.1,
        reviews: 92,
        inStock: true,
        weight: "1L",
        origin: "Imported",
        category: "beverages",
        subcategory: "plant-milk",
        slug: "almond-milk"
      }
    ];
    
    setProducts(mockProducts);
    setFilteredProducts(mockProducts);
    setLoading(false);
  }, []);

  // Apply filters and sorting when dependencies change
  useEffect(() => {
    let result = [...products];
    
    // Apply search filter
    if (searchQuery) {
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply category filter
    if (filters.category) {
      result = result.filter(product => 
        product.category === filters.category || product.subcategory === filters.category
      );
    }
    
    // Apply price filter
    result = result.filter(product => 
      product.price >= filters.minPrice && product.price <= filters.maxPrice
    );
    
    // Apply in-stock filter
    if (filters.inStock) {
      result = result.filter(product => product.inStock);
    }
    
    // Apply sorting
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    setFilteredProducts(result);
  }, [searchQuery, products, filters, sortBy]);

  const toggleWishlist = (productId: number) => {
    // In a real app, this would toggle the wishlist status
    console.log(`Toggle wishlist for product ${productId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Search Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1 max-w-2xl">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  placeholder="Search for products..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                
                {/* Search Suggestions Dropdown */}
                {showSuggestions && searchQuery.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
                    {filteredProducts
                      .filter(product => 
                        product.name.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .slice(0, 8) // Show only first 8 suggestions
                      .map((product) => (
                        <a
                          key={product.id}
                          href={`/${product.category}/${product.subcategory}/${product.slug}`}
                          className="flex items-center p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                            <img 
                              src={product.imageUrl} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://placehold.co/60x60?text=Img';
                              }}
                            />
                          </div>
                          <div className="ml-3">
                            <div className="font-medium text-gray-900 truncate max-w-xs">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500">₹{product.price}</div>
                          </div>
                        </a>
                      ))
                    }
                    {filteredProducts.filter(product => 
                      product.name.toLowerCase().includes(searchQuery.toLowerCase())
                    ).length === 0 && (
                      <div className="p-3 text-gray-500 text-center">
                        No products found for "{searchQuery}"
                      </div>
                    )}
                  </div>
                )}
              </div>
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
          
          <div className="mt-4 text-gray-600">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'result' : 'results'} for "{searchQuery}"
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                <button 
                  onClick={() => setFilters({
                    category: '',
                    minPrice: 0,
                    maxPrice: 1000,
                    inStock: false
                  })}
                  className="text-sm text-green-600 hover:text-green-700"
                >
                  Clear All
                </button>
              </div>
              
              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Category</h3>
                <div className="space-y-2">
                  {['fruits', 'vegetables', 'beverages', 'bakery'].map(category => (
                    <div key={category} className="flex items-center">
                      <input
                        type="radio"
                        id={`cat-${category}`}
                        name="category"
                        checked={filters.category === category}
                        onChange={() => setFilters({...filters, category})}
                        className="h-4 w-4 text-green-600 focus:ring-green-500"
                      />
                      <label htmlFor={`cat-${category}`} className="ml-2 text-gray-700 capitalize">
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Price Range */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Price Range</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">₹{filters.minPrice}</span>
                    <span className="text-sm text-gray-600">₹{filters.maxPrice}</span>
                  </div>
                  <div className="relative pt-1">
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({...filters, maxPrice: parseInt(e.target.value)})}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>
              
              {/* Availability */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Availability</h3>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="in-stock"
                    checked={filters.inStock}
                    onChange={(e) => setFilters({...filters, inStock: e.target.checked})}
                    className="h-4 w-4 text-green-600 focus:ring-green-500"
                  />
                  <label htmlFor="in-stock" className="ml-2 text-gray-700">
                    In Stock Only
                  </label>
                </div>
              </div>
              
              {/* Sort By */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Sort By</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Products Grid/List */}
          <div className="lg:w-3/4">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-xl font-semibold">Loading...</div>
              </div>
            ) : (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                      <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                        <div className="relative">
                          <img 
                            src={product.imageUrl} 
                            alt={product.name}
                            className="w-full h-48 object-cover"
                          />
                          
                          <button
                            onClick={() => toggleWishlist(product.id)}
                            className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
                          >
                            <Heart size={16} className="text-gray-600" />
                          </button>
                          
                          {product.originalPrice && (
                            <div className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                              {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                            </div>
                          )}
                        </div>
                        
                        <div className="p-4">
                          <h3 className="font-bold text-gray-900 truncate">{product.name}</h3>
                          <p className="text-gray-600 text-sm">{product.weight}</p>
                          
                          <div className="flex items-center mt-1">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={14}
                                  className={i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-600 ml-1">({product.reviews})</span>
                          </div>
                          
                          <div className="mt-3 flex items-center justify-between">
                            <div>
                              <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
                              {product.originalPrice && (
                                <span className="ml-2 text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
                              )}
                            </div>
                            
                            {!product.inStock ? (
                              <span className="text-red-600 text-sm font-medium">Out of Stock</span>
                            ) : (
                              <button className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                                Add to Cart
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredProducts.map((product) => (
                      <div key={product.id} className="bg-white rounded-xl shadow-sm p-4 flex">
                        <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <img 
                            src={product.imageUrl} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="ml-4 flex-grow">
                          <h3 className="font-bold text-gray-900">{product.name}</h3>
                          <p className="text-gray-600 text-sm">{product.weight}</p>
                          
                          <div className="flex items-center mt-1">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={14}
                                  className={i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-600 ml-1">({product.reviews})</span>
                          </div>
                          
                          <div className="mt-2 flex items-center">
                            <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
                            {product.originalPrice && (
                              <span className="ml-2 text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
                            )}
                          </div>
                          
                          <p className="text-gray-600 text-sm mt-1">{product.origin}</p>
                        </div>
                        
                        <div className="flex flex-col items-end justify-between">
                          {!product.inStock ? (
                            <span className="text-red-600 text-sm font-medium">Out of Stock</span>
                          ) : (
                            <button className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                              Add to Cart
                            </button>
                          )}
                          
                          <button
                            onClick={() => toggleWishlist(product.id)}
                            className="mt-2 p-2 text-gray-600 hover:text-red-500"
                          >
                            <Heart size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {filteredProducts.length === 0 && !loading && (
                  <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <Search className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">No products found</h2>
                    <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
                    <button 
                      onClick={() => {
                        setSearchQuery('');
                        setFilters({
                          category: '',
                          minPrice: 0,
                          maxPrice: 1000,
                          inStock: false
                        });
                      }}
                      className="inline-flex items-center bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 py-12 flex justify-center items-center">
      <div className="text-xl font-semibold">Loading search...</div>
    </div>}>
      <SearchContent />
    </Suspense>
  );
}