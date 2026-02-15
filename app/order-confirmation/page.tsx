"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Package, Truck, Clock, MapPin, Star, ArrowRight } from "lucide-react";
import Link from "next/link";

interface OrderItem {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  weight: string;
}

export default function OrderConfirmationPage() {
  const [countdown, setCountdown] = useState(5);
  const [orderId, setOrderId] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");

  useEffect(() => {
    // Generate a random order ID
    setOrderId(`ORD-${Math.floor(100000 + Math.random() * 900000)}`);
    setOrderDate(new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }));

    // Set estimated delivery date (3-5 business days)
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 5);
    setEstimatedDelivery(deliveryDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    }));

    // Countdown effect
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const orderItems: OrderItem[] = [
    {
      id: 1,
      name: "Organic Apple",
      price: 120,
      imageUrl: "/placeholder-product.jpg",
      quantity: 2,
      weight: "1kg"
    },
    {
      id: 2,
      name: "Fresh Carrots",
      price: 80,
      imageUrl: "/placeholder-product.jpg",
      quantity: 1,
      weight: "500g"
    },
    {
      id: 3,
      name: "Premium Tea",
      price: 250,
      imageUrl: "/placeholder-product.jpg",
      quantity: 1,
      weight: "250g"
    }
  ];

  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const shippingCost = 50;
  const tax = subtotal * 0.05; // 5% tax
  const total = subtotal + shippingCost + tax;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <div className="mx-auto flex justify-center">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h1 className="mt-6 text-3xl font-bold text-gray-900">Thank You for Your Order!</h1>
          <p className="mt-4 text-lg text-gray-600">
            Your order <span className="font-medium">#{orderId}</span> has been confirmed
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-4 text-center">
              <div className="mx-auto flex justify-center">
                <Package className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="mt-3 font-medium text-gray-900">Order Confirmed</h3>
              <p className="mt-1 text-sm text-gray-600">{orderDate}</p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 text-center">
              <div className="mx-auto flex justify-center">
                <Truck className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="mt-3 font-medium text-gray-900">Ships Within 24 Hours</h3>
              <p className="mt-1 text-sm text-gray-600">Estimated arrival</p>
              <p className="text-sm font-medium text-gray-900">{estimatedDelivery}</p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 text-center">
              <div className="mx-auto flex justify-center">
                <MapPin className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="mt-3 font-medium text-gray-900">Track Your Order</h3>
              <p className="mt-1 text-sm text-gray-600">Via SMS and email</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-6">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex items-center border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                    <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                      <img 
                        src={item.imageUrl} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="ml-4 flex-grow">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-gray-600 text-sm">{item.weight}</p>
                      <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-medium text-gray-900">€{item.price * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Shipping Information</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">John Doe</h3>
                    <p className="text-gray-600">123 Main Street, Mumbai, Maharashtra 400001</p>
                    <p className="text-gray-600 mt-1">+91 9876543210</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span>€{subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Shipping</span>
                    <span>€{shippingCost.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Tax</span>
                    <span>€{tax.toFixed(2)}</span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4 mt-4 flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>€{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Order Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Actions</h2>
              
              <div className="space-y-4">
                <Link 
                  href="/my-orders"
                  className="w-full flex items-center justify-center bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  <Package className="mr-2" size={18} />
                  Track Order
                </Link>
                
                <Link 
                  href="/"
                  className="w-full flex items-center justify-center border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Continue Shopping
                </Link>
                
                <Link 
                  href="/account"
                  className="w-full flex items-center justify-center border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  My Account
                </Link>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3">Rate Your Experience</h3>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={24}
                      className="text-gray-300 cursor-pointer hover:text-yellow-400"
                    />
                  ))}
                </div>
                <button className="mt-3 text-green-600 text-sm font-medium hover:text-green-700">
                  Write a review
                </button>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3">Need Help?</h3>
                <p className="text-sm text-gray-600">Contact our customer support for any questions about your order</p>
                <button className="mt-3 w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Redirecting to homepage in <span className="font-bold">{countdown}</span> seconds...
          </p>
          <Link 
            href="/"
            className="mt-4 inline-flex items-center text-green-600 font-medium hover:text-green-700"
          >
            Go to homepage now
            <ArrowRight className="ml-2" size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
