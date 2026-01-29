"use client";

import { useState } from "react";
import { Package, Heart, MapPin, CreditCard, Settings, Star, ShoppingBag } from "lucide-react";
import Link from "next/link";
import ProfileSection from "@/components/account/ProfileSection";
import MobileTabNavigation from "@/components/account/MobileTabNavigation";
import DesktopSidebar from "@/components/account/DesktopSidebar";
import MobileProfileHeader from "@/components/account/MobileProfileHeader";

interface Order {
  id: number;
  date: string;
  status: string;
  total: number;
  items: number;
}

interface Address {
  id: number;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

interface WishlistItem {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  imageUrl: string;
  rating: number;
}

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+91 9876543210",
    avatar: "/placeholder-avatar.jpg"
  });

  const [orders] = useState<Order[]>([
    { id: 1001, date: "Jan 15, 2026", status: "Delivered", total: 1299, items: 3 },
    { id: 1002, date: "Jan 10, 2026", status: "Shipped", total: 899, items: 2 },
    { id: 1003, date: "Jan 5, 2026", status: "Processing", total: 549, items: 1 },
    { id: 1004, date: "Dec 28, 2025", status: "Delivered", total: 2150, items: 5 },
  ]);

  const [addresses] = useState<Address[]>([
    { id: 1, name: "Home", street: "123 Main Street, Apartment 4B", city: "Mumbai", state: "Maharashtra", zipCode: "400001", isDefault: true },
    { id: 2, name: "Office", street: "456 Business Avenue, Floor 12", city: "Mumbai", state: "Maharashtra", zipCode: "400002", isDefault: false },
  ]);

  const [wishlist] = useState<WishlistItem[]>([
    { id: 1, name: "Organic Red Apples", price: 120, originalPrice: 150, imageUrl: "/placeholder-product.jpg", rating: 4.5 },
    { id: 2, name: "Fresh Carrots (1kg)", price: 80, originalPrice: 100, imageUrl: "/placeholder-product.jpg", rating: 4.2 },
    { id: 3, name: "Premium Almonds", price: 450, originalPrice: 550, imageUrl: "/placeholder-product.jpg", rating: 4.8 },
    { id: 4, name: "Organic Honey", price: 350, originalPrice: 400, imageUrl: "/placeholder-product.jpg", rating: 4.6 },
  ]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <ProfileSection 
            user={user} 
            onUserUpdate={setUser} 
          />
        );
      
      case "orders":
        return (
          <div className="space-y-6">
            <div className="bg-white border border-black rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Order History</h3>
              
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white border border-black rounded-2xl p-6 hover:border-[#266000] transition-colors">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                      <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-bold text-gray-900">Order #{order.id}</h4>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${
                            order.status === "Delivered" 
                              ? "bg-white border-[#266000] text-[#266000]" 
                              : order.status === "Shipped" 
                                ? "bg-white border-blue-600 text-blue-600" 
                                : "bg-white border-yellow-600 text-yellow-600"
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Package size={16} className="mr-1" />
                            {order.items} {order.items === 1 ? 'item' : 'items'}
                          </span>
                          <span>Placed on {order.date}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col md:items-end gap-4">
                        <div className="text-2xl font-bold text-gray-900">₹{order.total.toLocaleString()}</div>
                        <div className="flex gap-3">
                          <button className="text-[#266000] font-semibold hover:underline text-sm">
                            View Details
                          </button>
                          <button className="bg-white border border-black text-gray-900 px-4 py-2 rounded-lg font-semibold hover:border-[#266000] hover:text-[#266000] transition-colors text-sm">
                            Reorder
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case "addresses":
        return (
          <div className="space-y-6">
            <div className="bg-white border border-black rounded-2xl p-8">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
                <h3 className="text-2xl font-bold text-gray-900">Shipping Addresses</h3>
                <button className="bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-6 rounded-xl font-bold transition-colors">
                  Add New Address
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {addresses.map((address) => (
                  <div key={address.id} className="bg-white border border-black rounded-2xl p-6 hover:border-[#266000] transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="text-lg font-bold text-gray-900">{address.name}</h4>
                      {address.isDefault && (
                        <span className="inline-block px-3 py-1 bg-white border border-[#266000] text-[#266000] text-xs font-bold rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-1 mb-6">
                      <p className="text-gray-700">{address.street}</p>
                      <p className="text-gray-700">{address.city}, {address.state}</p>
                      <p className="text-gray-700">PIN: {address.zipCode}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                      <button className="text-[#266000] text-sm font-semibold hover:underline">
                        Edit
                      </button>
                      {!address.isDefault && (
                        <button className="text-gray-900 text-sm font-semibold hover:underline">
                          Set as Default
                        </button>
                      )}
                      <button className="text-red-600 text-sm font-semibold hover:underline">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case "wishlist":
        return (
          <div className="space-y-6">
            <div className="bg-white border border-black rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">My Wishlist</h3>
              
              {wishlist.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 rounded-full border-2 border-black flex items-center justify-center mx-auto mb-6">
                    <Heart className="h-12 w-12 text-gray-400" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Your wishlist is empty</h4>
                  <p className="text-gray-600 mb-6">Save items you love for later</p>
                  <Link 
                    href="/"
                    className="inline-flex items-center bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 rounded-xl font-bold transition-colors"
                  >
                    <ShoppingBag className="mr-2" size={18} />
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {wishlist.map((item) => (
                    <div key={item.id} className="bg-white border border-gray-300 rounded-2xl p-4 hover:border-[#266000] transition-colors shadow-sm">
                      <div className="flex gap-4">
                        <div className="w-24 h-24 rounded-xl border border-black overflow-hidden shrink-0">
                          <img 
                            src={item.imageUrl} 
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml,%3Csvg width="96" height="96" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="96" height="96" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" font-size="14" text-anchor="middle" dy=".3em" fill="%239ca3af"%3EProduct%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        </div>
                        
                        <div className="flex-grow min-w-0">
                          <h4 className="font-bold text-gray-900 mb-2 truncate">{item.name}</h4>
                          
                          <div className="flex items-center mb-3">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={i < Math.floor(item.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                              />
                            ))}
                            <span className="text-xs text-gray-600 ml-2">{item.rating}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-4">
                            <span className="text-xl font-bold text-gray-900">₹{item.price}</span>
                            {item.originalPrice && (
                              <span className="text-sm text-gray-500 line-through">₹{item.originalPrice}</span>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            <button className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg text-sm font-bold transition-colors">
                              Add to Cart
                            </button>
                            <button className="p-2 border border-black rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors">
                              <Heart size={18} className="text-red-500 fill-red-500" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      
      case "payment":
        return (
          <div className="space-y-6">
            <div className="bg-white border border-black rounded-2xl p-8">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
                <h3 className="text-2xl font-bold text-gray-900">Payment Methods</h3>
                <button className="bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-6 rounded-xl font-bold transition-colors">
                  Add New Card
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Credit Card 1 */}
                <div className="bg-white border border-black rounded-2xl p-6 hover:border-[#266000] transition-colors">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-xl border border-black flex items-center justify-center shrink-0">
                        <CreditCard className="h-8 w-8 text-[#266000]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-bold text-gray-900">Visa ending in 4242</h4>
                          <span className="inline-block px-3 py-1 bg-white border border-[#266000] text-[#266000] text-xs font-bold rounded-full">
                            Default
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm">Expires 12/2026</p>
                        <p className="text-gray-600 text-sm">John Doe</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <button className="text-[#266000] text-sm font-semibold hover:underline">
                        Edit
                      </button>
                      <button className="text-red-600 text-sm font-semibold hover:underline">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>

                {/* Credit Card 2 */}
                <div className="bg-white border border-black rounded-2xl p-6 hover:border-[#266000] transition-colors">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-xl border border-black flex items-center justify-center shrink-0">
                        <CreditCard className="h-8 w-8 text-[#266000]" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-2">Mastercard ending in 8888</h4>
                        <p className="text-gray-600 text-sm">Expires 08/2025</p>
                        <p className="text-gray-600 text-sm">John Doe</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <button className="text-gray-900 text-sm font-semibold hover:underline">
                        Set as Default
                      </button>
                      <button className="text-[#266000] text-sm font-semibold hover:underline">
                        Edit
                      </button>
                      <button className="text-red-600 text-sm font-semibold hover:underline">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>

                {/* UPI */}
                <div className="bg-white border border-black rounded-2xl p-6 hover:border-[#266000] transition-colors">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-xl border border-black flex items-center justify-center shrink-0">
                        <div className="text-2xl font-bold text-[#266000]">₹</div>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-2">UPI</h4>
                        <p className="text-gray-600 text-sm">johndoe@paytm</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <button className="text-[#266000] text-sm font-semibold hover:underline">
                        Edit
                      </button>
                      <button className="text-red-600 text-sm font-semibold hover:underline">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-2xl">
                <h4 className="font-bold text-gray-900 mb-2">Payment Security</h4>
                <p className="text-sm text-gray-600">
                  All payment information is encrypted and stored securely. We never share your payment details with third parties.
                </p>
              </div>
            </div>
          </div>
        );
      
      case "settings":
        return (
          <div className="space-y-6">
            <div className="bg-white border border-black rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Account Settings</h3>
              
              {/* Notifications */}
              <div className="mb-8 pb-8 border-b border-gray-200">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Notifications</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">Order Updates</p>
                      <p className="text-sm text-gray-600">Get notified about your order status</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#266000]"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">Promotional Emails</p>
                      <p className="text-sm text-gray-600">Receive updates about new products and offers</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#266000]"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">SMS Notifications</p>
                      <p className="text-sm text-gray-600">Get text messages for important updates</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#266000]"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Privacy */}
              <div className="mb-8 pb-8 border-b border-gray-200">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Privacy</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">Show Profile to Public</p>
                      <p className="text-sm text-gray-600">Make your profile visible to other users</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#266000]"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">Share Purchase History</p>
                      <p className="text-sm text-gray-600">Help us improve recommendations</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#266000]"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div>
                <h4 className="text-lg font-bold text-red-600 mb-4">Danger Zone</h4>
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">Delete Account</p>
                      <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
                    </div>
                    <button className="bg-white border border-red-600 text-red-600 px-6 py-2 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-colors">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">My Account</h1>
        
        {/* Horizontal Tabs for Mobile/Tablet, Vertical Sidebar for Desktop */}
        <div className="lg:hidden mb-8">
          {/* Mobile Profile Header */}
          <MobileProfileHeader user={user} />
          
          {/* Horizontal Tab Navigation */}
          <MobileTabNavigation 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Sidebar - Hidden on mobile/tablet */}
          <DesktopSidebar 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
            user={user} 
          />
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}