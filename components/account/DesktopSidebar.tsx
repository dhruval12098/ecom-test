"use client";

import { User, Package, MapPin, Heart, CreditCard, Settings, LogOut } from "lucide-react";

interface User {
  name: string;
  email: string;
  avatar: string;
}

interface DesktopSidebarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  user: User;
}

const menuItems = [
  { id: "profile", label: "Profile", icon: <User size={18} /> },
  { id: "orders", label: "My Orders", icon: <Package size={18} /> },
  { id: "addresses", label: "Addresses", icon: <MapPin size={18} /> },
  { id: "wishlist", label: "Wishlist", icon: <Heart size={18} /> },
  { id: "payment", label: "Payment Methods", icon: <CreditCard size={18} /> },
  { id: "settings", label: "Settings", icon: <Settings size={18} /> }
];

export default function DesktopSidebar({ activeTab, onTabChange, user }: DesktopSidebarProps) {
  return (
    <div className="hidden lg:block lg:col-span-1">
      <div className="bg-white border border-black rounded-2xl p-6 sticky top-6">
        <div className="flex flex-col items-center mb-8 pb-6 border-b border-gray-200">
          <div className="w-20 h-20 rounded-full border-2 border-black overflow-hidden mb-4">
            <img 
              src={user.avatar} 
              alt="Profile" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml,%3Csvg width="80" height="80" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="40" cy="40" r="40" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" font-size="30" text-anchor="middle" dy=".3em" fill="%236b7280"%3E' + user.name.charAt(0) + '%3C/text%3E%3C/svg%3E';
              }}
            />
          </div>
          <h3 className="font-bold text-gray-900 text-center">{user.name}</h3>
          <p className="text-gray-600 text-sm text-center">{user.email}</p>
        </div>
        
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center px-4 py-3 rounded-xl text-left font-semibold transition-colors ${
                activeTab === item.id
                  ? "bg-white border-2 border-[#266000] text-[#266000]"
                  : "text-gray-700 hover:bg-gray-50 border-2 border-transparent"
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </button>
          ))}
          
          <button className="w-full flex items-center px-4 py-3 rounded-xl text-left text-red-600 hover:bg-red-50 font-semibold border-2 border-transparent transition-colors mt-4">
            <LogOut className="mr-3" size={18} />
            Logout
          </button>
        </nav>
      </div>
    </div>
  );
}