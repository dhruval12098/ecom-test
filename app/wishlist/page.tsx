"use client";

import { useState } from "react";
import { Heart, ShoppingCart, Star, Search, Filter, X } from "lucide-react";
import Link from "next/link";

interface WishlistItem {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  category: string;
  subcategory: string;
}

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([
    {
      id: 1,
      name: "Organic Apple",
      price: 120,
      originalPrice: 150,
      imageUrl: "/placeholder-product.jpg",
      rating: 4.5,
      reviews: 128,
      inStock: true,
      category: "fruits",
      subcategory: "organic-fruits"
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
      category: "vegetables",
      subcategory: "root-vegetables"
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
      category: "beverages",
      subcategory: "herbal-teas"
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
      category: "bakery",
      subcategory: "bread"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");

  const removeFromWishlist = (id: number) => {
    setWishlistItems(items => items.filter(item => item.id !== id));
  };

  const addToCart = (id: number) => {
    // In a real app, this would add the item to cart
    alert(`Added to cart: ${wishlistItems.find(item => item.id === id)?.name}`);
  };

  const filteredItems = wishlistItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    if (sortBy === "rating") return b.rating - a.rating;
    return b.id - a.id; // Recent first
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">Wishlist</h1>
          
          <div className="flex flex-wrap gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search wishlist..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            
            <div className="flex items-center border border-gray-300 rounded-lg">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-lg focus:outline-none"
              >
                <option value="recent">Most Recent</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
              <Filter className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        {sortedItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Heart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">Add items you love to your wishlist</p>
            <Link 
              href="/"
              className="inline-flex items-center bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedItems.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative">
                  <img 
                    src={item.imageUrl} 
                    alt={item.name}
                    className="w-full h-48 object-cover"
                  />
                  
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
                  >
                    <X size={16} className="text-gray-600" />
                  </button>
                  
                  {item.originalPrice && (
                    <div className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                      {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 truncate">{item.name}</h3>
                  
                  <div className="flex items-center mt-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < Math.floor(item.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-600 ml-1">({item.reviews})</span>
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-gray-900">₹{item.price}</span>
                      {item.originalPrice && (
                        <span className="ml-2 text-sm text-gray-500 line-through">₹{item.originalPrice}</span>
                      )}
                    </div>
                    
                    {!item.inStock ? (
                      <span className="text-red-600 text-sm font-medium">Out of Stock</span>
                    ) : (
                      <button
                        onClick={() => addToCart(item.id)}
                        className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                      >
                        Add to Cart
                      </button>
                    )}
                  </div>
                  
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="flex-1 flex items-center justify-center py-2 px-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      <Heart size={16} className="mr-2 fill-current" />
                      Remove
                    </button>
                    
                    <Link 
                      href={`/${item.category}/${item.subcategory}/${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                      className="flex-1 flex items-center justify-center py-2 px-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {sortedItems.length > 0 && (
          <div className="mt-10 flex justify-center">
            <Link 
              href="/"
              className="inline-flex items-center bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              <ShoppingCart className="mr-2" size={18} />
              Continue Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}