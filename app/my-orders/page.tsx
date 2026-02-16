"use client";

import { useEffect, useState } from "react";
import { Package, Search, Calendar, Download, Repeat, MessageSquare, ShoppingBag, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/currency";

interface Order {
  id: string;
  date: string;
  status: string;
  total: number;
  items: number;
  itemsList: {
    id: number;
    name: string;
    price: number;
    imageUrl: string;
    quantity: number;
  }[];
}

export default function MyOrdersPage() {
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth();

  const [orders] = useState<Order[]>([
    {
      id: "ORD-123456",
      date: "Jan 15, 2026",
      status: "Delivered",
      total: 1299,
      items: 3,
      itemsList: [
        { id: 1, name: "Organic Red Apples", price: 120, imageUrl: "/placeholder-product.jpg", quantity: 2 },
        { id: 2, name: "Fresh Carrots (1kg)", price: 80, imageUrl: "/placeholder-product.jpg", quantity: 1 },
        { id: 3, name: "Premium Green Tea", price: 250, imageUrl: "/placeholder-product.jpg", quantity: 1 },
      ]
    },
    {
      id: "ORD-123457",
      date: "Jan 10, 2026",
      status: "Shipped",
      total: 899,
      items: 2,
      itemsList: [
        { id: 4, name: "Fresh Bananas", price: 60, imageUrl: "/placeholder-product.jpg", quantity: 3 },
        { id: 5, name: "Fresh Orange Juice", price: 120, imageUrl: "/placeholder-product.jpg", quantity: 1 },
      ]
    },
    {
      id: "ORD-123458",
      date: "Jan 5, 2026",
      status: "Processing",
      total: 549,
      items: 1,
      itemsList: [
        { id: 6, name: "Whole Wheat Bread", price: 549, imageUrl: "/placeholder-product.jpg", quantity: 1 },
      ]
    },
    {
      id: "ORD-123459",
      date: "Dec 28, 2025",
      status: "Cancelled",
      total: 299,
      items: 1,
      itemsList: [
        { id: 7, name: "Organic Almond Milk", price: 299, imageUrl: "/placeholder-product.jpg", quantity: 1 },
      ]
    },
    {
      id: "ORD-123460",
      date: "Dec 20, 2025",
      status: "Delivered",
      total: 1850,
      items: 4,
      itemsList: [
        { id: 8, name: "Premium Honey", price: 450, imageUrl: "/placeholder-product.jpg", quantity: 1 },
        { id: 9, name: "Fresh Strawberries", price: 200, imageUrl: "/placeholder-product.jpg", quantity: 2 },
        { id: 10, name: "Greek Yogurt", price: 180, imageUrl: "/placeholder-product.jpg", quantity: 2 },
        { id: 11, name: "Organic Quinoa", price: 320, imageUrl: "/placeholder-product.jpg", quantity: 1 },
      ]
    }
  ]);

  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!authLoading && !authUser) {
      router.replace("/login");
    }
  }, [authLoading, authUser, router]);

  if (authLoading) {
    return null;
  }

  if (!authUser) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="bg-white border border-black rounded-2xl p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Please sign in</h1>
            <p className="text-gray-600 mb-6">Log in to view your orders.</p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-xl font-bold text-sm sm:text-base transition-colors"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === "all" || order.status.toLowerCase() === filterStatus;
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         order.itemsList.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-white border-[#266000] text-[#266000]";
      case "Shipped":
        return "bg-white border-blue-600 text-blue-600";
      case "Processing":
        return "bg-white border-yellow-600 text-yellow-600";
      case "Cancelled":
        return "bg-white border-red-600 text-red-600";
      default:
        return "bg-white border-gray-600 text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">View and manage all your orders in one place</p>
        </div>

        {/* Quick Stats */}
        <div className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-black rounded-2xl p-4 sm:p-6 text-center">
            <div className="text-2xl sm:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
              {orders.filter(o => o.status === "Delivered").length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 font-semibold">Delivered Orders</div>
          </div>
          
          <div className="bg-white border border-black rounded-2xl p-4 sm:p-6 text-center">
            <div className="text-2xl sm:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
              {orders.filter(o => o.status === "Shipped" || o.status === "Processing").length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 font-semibold">In Progress</div>
          </div>
          
          <div className="bg-white border border-black rounded-2xl p-4 sm:p-6 text-center">
            <div className="text-2xl sm:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
              {formatCurrency(orders.reduce((sum, o) => sum + o.total, 0))}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 font-semibold">Total Spent</div>
          </div>
          
          <div className="bg-white border border-black rounded-2xl p-4 sm:p-6 text-center">
            <div className="text-2xl sm:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
              {orders.reduce((sum, o) => sum + o.items, 0)}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 font-semibold">Total Items</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="flex-grow relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID or product name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:bg-gray-100 transition-colors"
            />
          </div>
          
          {/* Status Filter */}
          <div className="relative sm:w-64">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full appearance-none bg-gray-50 px-4 py-3 rounded-xl focus:outline-none focus:bg-gray-100 transition-colors font-semibold cursor-pointer"
            >
              <option value="all">All Orders</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <ChevronRight className="absolute right-4 top-1/2 transform -translate-y-1/2 rotate-90 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white border border-black rounded-2xl p-16 text-center">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
              <Package className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders found</h2>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterStatus !== "all" 
                ? "Try adjusting your search or filters" 
                : "You haven't placed any orders yet"}
            </p>
            <Link 
              href="/"
              className="inline-flex items-center bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 rounded-xl font-bold transition-colors"
            >
              <ShoppingBag className="mr-2" size={18} />
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white border border-black rounded-2xl overflow-hidden hover:border-[#266000] transition-colors">
                {/* Order Header */}
                <div className="p-4 sm:p-6 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div className="flex-grow">
                      <div className="flex flex-col xs:flex-row xs:items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">Order #{order.id}</h3>
                        <span className={`inline-block px-4 py-1 rounded-full text-sm font-bold border ${getStatusColor(order.status)} w-fit`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Placed on {order.date}
                        </span>
                        <span className="flex items-center">
                          <Package className="h-4 w-4 mr-1" />
                          {order.items} {order.items === 1 ? 'item' : 'items'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-start sm:items-end gap-2">
                      <div className="text-sm text-gray-600">Total Amount</div>
                      <div className="text-3xl font-bold text-gray-900">{formatCurrency(order.total)}</div>
                    </div>
                  </div>
                </div>
                
                {/* Order Items */}
                <div className="p-4 sm:p-6 bg-gray-50">
                  <h4 className="font-bold text-gray-900 mb-4">Items in this order</h4>
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-4">
                    {order.itemsList.map((item) => (
                      <div key={item.id} className="bg-white rounded-xl p-4">
                        <div className="flex gap-3">
                          <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                            <img 
                              src={item.imageUrl} 
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'data:image/svg+xml,%3Csvg width="64" height="64" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="64" height="64" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" font-size="10" text-anchor="middle" dy=".3em" fill="%239ca3af"%3EProduct%3C/text%3E%3C/svg%3E';
                              }}
                            />
                          </div>
                          <div className="flex-grow min-w-0">
                            <h5 className="font-semibold text-gray-900 text-sm mb-1 truncate">{item.name}</h5>
                            <p className="text-xs text-gray-600 mb-2">Qty: {item.quantity}</p>
                            <p className="font-bold text-gray-900">{formatCurrency(item.price)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Order Actions */}
                <div className="p-4 sm:p-6 border-t border-gray-200 flex flex-wrap gap-2 sm:gap-3">
                  <Link 
                    href={`/order-details/${order.id}`}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 sm:px-6 sm:py-2 rounded-xl font-bold transition-colors"
                  >
                    View Details
                  </Link>
                  
                  <button className="bg-white border border-black text-gray-900 px-4 py-2 sm:px-6 sm:py-2 rounded-xl font-semibold hover:border-[#266000] hover:text-[#266000] transition-colors flex items-center gap-2">
                    <Download size={16} />
                    Invoice
                  </button>
                  
                  {order.status === "Delivered" && (
                    <button className="bg-white border border-black text-gray-900 px-4 py-2 sm:px-6 sm:py-2 rounded-xl font-semibold hover:border-[#266000] hover:text-[#266000] transition-colors flex items-center gap-2">
                      <Repeat size={16} />
                      Reorder
                    </button>
                  )}
                  
                  <button className="bg-white border border-black text-gray-900 px-4 py-2 sm:px-6 sm:py-2 rounded-xl font-semibold hover:border-[#266000] hover:text-[#266000] transition-colors flex items-center gap-2">
                    <MessageSquare size={16} />
                    Support
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {filteredOrders.length > 0 && (
          <div className="mt-8 sm:mt-10 flex justify-center">
            <nav className="flex items-center gap-2">
              <button className="px-3 py-2 sm:px-5 sm:py-2 text-xs sm:text-sm font-bold text-gray-900 bg-white border border-black rounded-xl hover:border-[#266000] hover:text-[#266000] transition-colors">
                Previous
              </button>
              <button className="px-3 py-2 sm:px-5 sm:py-2 text-xs sm:text-sm font-bold text-white bg-[#266000] border border-[#266000] rounded-xl">
                1
              </button>
              <button className="px-3 py-2 sm:px-5 sm:py-2 text-xs sm:text-sm font-bold text-gray-900 bg-white border border-black rounded-xl hover:border-[#266000] hover:text-[#266000] transition-colors">
                2
              </button>
              <button className="px-3 py-2 sm:px-5 sm:py-2 text-xs sm:text-sm font-bold text-gray-900 bg-white border border-black rounded-xl hover:border-[#266000] hover:text-[#266000] transition-colors">
                3
              </button>
              <button className="px-3 py-2 sm:px-5 sm:py-2 text-xs sm:text-sm font-bold text-gray-900 bg-white border border-black rounded-xl hover:border-[#266000] hover:text-[#266000] transition-colors">
                Next
              </button>
            </nav>
          </div>
        )}


      </div>
    </div>
  );
}
