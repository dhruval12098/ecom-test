"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";
import ApiService from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { useAuth } from "@/contexts/AuthContext";

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth();
  const orderId = String(params?.orderId || "");
  const [order, setOrder] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !authUser) {
      router.replace("/login");
    }
  }, [authLoading, authUser, router]);

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) return;
      try {
        setIsLoading(true);
        setError(null);
        const data = await ApiService.getOrderById(orderId);
        if (!data) throw new Error("Order not found");
        setOrder(data);
      } catch (e: any) {
        setError(e?.message || "Failed to load order");
      } finally {
        setIsLoading(false);
      }
    };
    loadOrder();
  }, [orderId]);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Link href="/account?tab=orders" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Order #{order?.order_number || order?.order_code || orderId}
              </h1>
              <p className="text-sm text-gray-600">
                {order?.created_at ? new Date(order.created_at).toLocaleString() : ""}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Total</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(order?.total_amount || 0)}
              </div>
            </div>
          </div>

          {isLoading && <div className="mt-6 text-sm text-gray-600">Loading...</div>}
          {!isLoading && error && <div className="mt-6 text-sm text-red-600">{error}</div>}

          {!isLoading && !error && (
            <div className="mt-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Order Items</h2>
                <div className="space-y-3">
                  {(order?.items || []).map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Package className="h-5 w-5 text-gray-500" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{item.product_name}</div>
                          {item.variant_name && <div className="text-xs text-gray-600">{item.variant_name}</div>}
                          <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                        </div>
                      </div>
                      <div className="font-semibold text-gray-900">
                        {formatCurrency(item.total_price || 0)}
                      </div>
                    </div>
                  ))}
                  {(!order?.items || order.items.length === 0) && (
                    <div className="text-sm text-gray-600">No items found for this order.</div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Delivery Address</h3>
                  <p className="text-sm text-gray-600">
                    {order?.address_street} {order?.address_house}
                    {order?.address_apartment ? `, ${order.address_apartment}` : ""}
                    <br />
                    {order?.address_postal_code} {order?.address_city}
                    <br />
                    {order?.address_country}
                  </p>
                </div>
                <div className="border border-gray-200 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Payment</h3>
                  <p className="text-sm text-gray-600">
                    Method: {order?.payment_method || order?.payments?.[0]?.method || "Not set"}
                    <br />
                    Status: {order?.payments?.[0]?.status || "Pending"}
                  </p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Order Timeline</h3>
                <div className="space-y-3 text-sm">
                  {(order?.status_history || []).map((entry: any) => (
                    <div key={entry.id}>
                      <div className="font-medium text-gray-900">{entry.status}</div>
                      <div className="text-xs text-gray-500">
                        {entry.changed_at ? new Date(entry.changed_at).toLocaleString() : ""}
                      </div>
                    </div>
                  ))}
                  {(!order?.status_history || order.status_history.length === 0) && (
                    <div className="text-sm text-gray-600">No timeline available.</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
