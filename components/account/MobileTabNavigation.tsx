"use client";

import { User, Package, MapPin, CreditCard, Settings } from "lucide-react";

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface MobileTabNavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const tabs: Tab[] = [
  { id: "profile", label: "Profile", icon: <User size={18} /> },
  { id: "orders", label: "Orders", icon: <Package size={18} /> },
  { id: "addresses", label: "Addresses", icon: <MapPin size={18} /> },
  { id: "payment", label: "Payment", icon: <CreditCard size={18} /> },
  { id: "settings", label: "Settings", icon: <Settings size={18} /> }
];

export default function MobileTabNavigation({ activeTab, onTabChange }: MobileTabNavigationProps) {
  return (
    <div className="bg-white border border-black rounded-2xl p-1.5 sm:p-2">
      <div className="flex overflow-x-auto gap-1.5 sm:gap-2 pb-1.5 sm:pb-2 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center px-3 py-2 sm:px-4 sm:py-3 rounded-full font-semibold text-[11px] sm:text-sm transition-all duration-200 whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-[#266000] text-white shadow-md"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span className="mr-1.5 sm:mr-2">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
