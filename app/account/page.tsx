"use client";

import { Suspense, useEffect, useState } from "react";
import { Package, MapPin, CreditCard, Settings } from "lucide-react";
import Link from "next/link";
import ProfileSection from "@/components/account/ProfileSection";
import MobileTabNavigation from "@/components/account/MobileTabNavigation";
import DesktopSidebar from "@/components/account/DesktopSidebar";
import MobileProfileHeader from "@/components/account/MobileProfileHeader";
import ApiService from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

interface Order {
  id: number;
  orderNumber: string;
  date: string;
  status: string;
  total: number;
  items: number;
}

interface Address {
  id: number;
  label?: string | null;
  full_name: string;
  phone: string;
  street: string;
  house?: string | null;
  apartment?: string | null;
  city: string;
  region?: string | null;
  postal_code: string;
  country: string;
  is_default: boolean;
}

function AccountPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: authUser, loading: authLoading } = useAuth();
  const { addToCart } = useCart();
  const normalizeStatus = (value: string) => {
    const raw = (value || "").toString().trim().toLowerCase();
    if (!raw) return "Pending";
    if (raw === "out_for_delivery" || raw === "out for delivery") return "Out for Delivery";
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  };
  const statusStyles: Record<string, string> = {
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
    Confirmed: "bg-blue-50 text-blue-700 border-blue-200",
    Preparing: "bg-purple-50 text-purple-700 border-purple-200",
    "Out for Delivery": "bg-indigo-50 text-indigo-700 border-indigo-200",
    Delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Cancelled: "bg-rose-50 text-rose-700 border-rose-200",
    Shipped: "bg-sky-50 text-sky-700 border-sky-200"
  };
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    avatar: "/placeholder-avatar.jpg"
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [addressesError, setAddressesError] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [deletingAddressId, setDeletingAddressId] = useState<number | null>(null);
  const [addressForm, setAddressForm] = useState({
    label: "",
    full_name: "",
    phone: "",
    street: "",
    house: "",
    apartment: "",
    city: "",
    region: "",
    postal_code: "",
    country: "Belgium",
    is_default: false
  });

  useEffect(() => {
    if (!authLoading && !authUser) {
      router.replace("/login");
    }
  }, [authLoading, authUser, router]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["profile", "orders", "addresses", "payment", "settings"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (authUser) {
      setUser((prev) => ({
        ...prev,
        email: authUser.email || "",
        phone: authUser.phone || "",
        name: prev.name || authUser.email?.split("@")[0] || ""
      }));
    }
  }, [authUser]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (!authUser) return;
        const profile = await ApiService.getCustomerProfile(authUser.id);
        if (profile) {
          setCustomerId(profile.id || null);
          setUser((prev) => ({
            ...prev,
            name: profile.full_name || prev.name,
            email: profile.email || prev.email,
            phone: profile.phone || prev.phone,
            avatar: profile.avatar_url || prev.avatar
          }));
          setAddressForm((prev) => ({
            ...prev,
            full_name: profile.full_name || prev.full_name,
            phone: profile.phone || prev.phone
          }));
        }
      } catch (e) {
        // keep UI usable if profile fetch fails
      }
    };
    loadProfile();
  }, [authUser]);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setOrdersLoading(true);
        setOrdersError(null);
        if (!authUser) return;
        const data = await ApiService.getOrdersByContact({
          email: user.email || authUser.email,
          phone: user.phone || authUser.phone
        });
          const mapped = data.map((order: any) => ({
            id: Number(order.id),
            orderNumber: String(order.order_number || order.order_code || order.id),
            date: order.created_at ? new Date(order.created_at).toLocaleDateString() : '',
            status: normalizeStatus(order.status || 'pending'),
            total: Number(order.total_amount || 0),
            items: Number(order.items_count || 0)
          }));
        setOrders(mapped);
      } catch (e: any) {
        setOrdersError(e?.message || 'Failed to load orders');
      } finally {
        setOrdersLoading(false);
      }
    };
    loadOrders();
  }, [authUser]);

  useEffect(() => {
    const loadAddresses = async () => {
      try {
        if (!customerId) return;
        setAddressesLoading(true);
        setAddressesError(null);
        const data = await ApiService.getCustomerAddresses(customerId);
        setAddresses(data || []);
      } catch (e: any) {
        setAddressesError(e?.message || "Failed to load addresses");
      } finally {
        setAddressesLoading(false);
      }
    };
    loadAddresses();
  }, [customerId]);

    const handleAddressSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!customerId) return;
      if (isSavingAddress) return;
      try {
        setIsSavingAddress(true);
        if (editingAddressId) {
          const updated = await ApiService.updateCustomerAddress(editingAddressId, {
            customerId,
            ...addressForm,
            is_default: addressForm.is_default
          });
          if (updated) {
            setAddresses((prev) =>
              prev.map((addr) => (addr.id === editingAddressId ? updated : addr))
            );
            toast.success("Address updated");
          }
        } else {
          const created = await ApiService.createCustomerAddress({
            customerId,
            ...addressForm,
            is_default: addressForm.is_default
          });
          if (created) {
            setAddresses((prev) => [created, ...prev]);
            toast.success("Address saved");
          }
        }
        setShowAddressForm(false);
        setEditingAddressId(null);
        setAddressForm((prev) => ({
          ...prev,
          label: "",
          street: "",
          house: "",
          apartment: "",
          city: "",
          region: "",
          postal_code: "",
          country: "Belgium",
          is_default: false
        }));
      } catch (e: any) {
        toast.error(e?.message || "Failed to save address");
      } finally {
        setIsSavingAddress(false);
      }
    };

  const handleDeleteAddress = async (id: number) => {
    if (!customerId) return;
    try {
      if (!window.confirm("Delete this address? This action cannot be undone.")) {
        return;
      }
      setDeletingAddressId(id);
      await ApiService.deleteCustomerAddress(id, customerId);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      toast.success("Address deleted");
    } catch (e) {
      toast.error("Failed to delete address");
    } finally {
      setDeletingAddressId(null);
    }
  };

  const handleSetDefault = async (id: number) => {
    if (!customerId) return;
    try {
      const updated = await ApiService.setDefaultCustomerAddress(id, customerId);
      if (updated) {
        setAddresses((prev) =>
          prev.map((a) => ({ ...a, is_default: a.id === id }))
        );
      }
    } catch (e) {
      // ignore
    }
  };

  const [reorderLoadingId, setReorderLoadingId] = useState<number | null>(null);
  const handleReorder = async (orderId: number) => {
    try {
      setReorderLoadingId(orderId);
      const data = await ApiService.getOrderById(orderId);
      const items = data?.items || [];
      if (!items.length) {
        toast.error("No items found for this order");
        return;
      }
      items.forEach((item: any) => {
        const baseItem = {
          id: Number(item.product_id || item.productId || item.id),
          name: item.product_name || item.name || "Product",
          price: Number(item.unit_price || item.price || 0),
          originalPrice: undefined,
          imageUrl: item.image_url || item.imageUrl || "",
          weight: item.variant_name || item.weight || "",
          inStock: true,
          variantId: item.variant_id || item.variantId || null,
          variantName: item.variant_name || item.variantName || null
        };
        const qty = Math.max(1, Number(item.quantity || 1));
        for (let i = 0; i < qty; i += 1) {
          addToCart(baseItem, false);
        }
      });
      toast.success("Items added to cart");
      router.push("/cart");
    } catch (e) {
      toast.error("Failed to reorder items");
    } finally {
      setReorderLoadingId(null);
    }
  };

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
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white border border-black rounded-2xl p-4 sm:p-6 lg:p-8">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 lg:mb-8">Order History</h3>
              
              <div className="space-y-3 sm:space-y-4">
                {ordersLoading && (
                  <div className="space-y-3 sm:space-y-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6">
                        <div className="skeleton h-4 w-1/3 mb-3" />
                        <div className="skeleton h-4 w-1/2 mb-4" />
                        <div className="skeleton h-8 w-24" />
                      </div>
                    ))}
                  </div>
                )}
                {!ordersLoading && ordersError && (
                  <div className="text-sm text-red-600">{ordersError}</div>
                )}
                {!ordersLoading && !ordersError && orders.length === 0 && (
                  <div className="text-sm text-gray-600">No orders found.</div>
                )}
                {orders.map((order) => (
                  <div key={order.id} className="bg-white border border-black rounded-2xl p-4 sm:p-6 hover:border-[#266000] transition-colors">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                      <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-base sm:text-lg font-bold text-gray-900">Order #{order.orderNumber}</h4>
                            <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold border ${statusStyles[order.status] || "bg-gray-50 text-gray-700 border-gray-200"}`}>
                              {order.status}
                            </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-xs sm:text-sm text-gray-600">
                          <span className="flex items-center">
                            <Package size={16} className="mr-1" />
                            {order.items} {order.items === 1 ? 'item' : 'items'}
                          </span>
                          <span>Placed on {order.date}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col md:items-end gap-4">
                        <div className="text-xl sm:text-2xl font-bold text-gray-900">{formatCurrency(order.total)}</div>
                          <div className="flex gap-3">
                            <Link href={`/orders/${order.id}`} className="text-[#266000] font-semibold hover:underline text-sm">
                              View Details
                            </Link>
                            <button
                              onClick={() => handleReorder(order.id)}
                              disabled={reorderLoadingId === order.id}
                              className={`bg-white border border-black text-gray-900 px-4 py-2 rounded-lg font-semibold hover:border-[#266000] hover:text-[#266000] transition-colors text-sm ${
                                reorderLoadingId === order.id ? "opacity-70 cursor-not-allowed" : ""
                              }`}
                            >
                              {reorderLoadingId === order.id ? "Reordering..." : "Reorder"}
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
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white border border-black rounded-2xl p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6 lg:mb-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Shipping Addresses</h3>
                  <button
                    onClick={() => {
                      setShowAddressForm((v) => !v);
                      setEditingAddressId(null);
                      if (!showAddressForm) {
                        setAddressForm((prev) => ({
                          ...prev,
                          label: "",
                          street: "",
                          house: "",
                          apartment: "",
                          city: "",
                          region: "",
                          postal_code: "",
                          country: "Belgium",
                          is_default: false
                        }));
                      }
                    }}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl font-bold text-sm sm:text-base transition-colors"
                  >
                    {showAddressForm ? "Close" : "Add New Address"}
                  </button>
                </div>

                {showAddressForm && (
                  <form onSubmit={handleAddressSubmit} className="mb-6 sm:mb-8 bg-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-6 space-y-3 sm:space-y-4">
                    <div className="text-xs sm:text-sm font-semibold text-gray-900">
                      {editingAddressId ? "Edit Address" : "Add New Address"}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <input
                      className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm"
                      placeholder="Label (Home/Office)"
                      value={addressForm.label}
                      onChange={(e) => setAddressForm((p) => ({ ...p, label: e.target.value }))}
                    />
                    <input
                      className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm"
                      placeholder="Full name"
                      value={addressForm.full_name}
                      onChange={(e) => setAddressForm((p) => ({ ...p, full_name: e.target.value }))}
                      required
                    />
                    <input
                      className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm"
                      placeholder="Phone"
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm((p) => ({ ...p, phone: e.target.value }))}
                      required
                    />
                    <input
                      className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm"
                      placeholder="Street"
                      value={addressForm.street}
                      onChange={(e) => setAddressForm((p) => ({ ...p, street: e.target.value }))}
                      required
                    />
                    <input
                      className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm"
                      placeholder="House"
                      value={addressForm.house}
                      onChange={(e) => setAddressForm((p) => ({ ...p, house: e.target.value }))}
                    />
                    <input
                      className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm"
                      placeholder="Apartment"
                      value={addressForm.apartment}
                      onChange={(e) => setAddressForm((p) => ({ ...p, apartment: e.target.value }))}
                    />
                    <input
                      className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm"
                      placeholder="City"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm((p) => ({ ...p, city: e.target.value }))}
                      required
                    />
                    <input
                      className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm"
                      placeholder="Region/State"
                      value={addressForm.region}
                      onChange={(e) => setAddressForm((p) => ({ ...p, region: e.target.value }))}
                    />
                    <input
                      className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm"
                      placeholder="Postal code"
                      value={addressForm.postal_code}
                      onChange={(e) => setAddressForm((p) => ({ ...p, postal_code: e.target.value }))}
                      required
                    />
                    <input
                      className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm"
                      placeholder="Country"
                      value={addressForm.country}
                      onChange={(e) => setAddressForm((p) => ({ ...p, country: e.target.value }))}
                      required
                    />
                  </div>
                  <label className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={addressForm.is_default}
                      onChange={(e) => setAddressForm((p) => ({ ...p, is_default: e.target.checked }))}
                    />
                    Set as default
                  </label>
                    <button
                      type="submit"
                      disabled={isSavingAddress}
                      className={`bg-black text-white px-5 sm:px-6 py-2 rounded-lg font-semibold text-sm sm:text-base transition-colors ${
                        isSavingAddress ? "opacity-70 cursor-not-allowed" : "hover:bg-gray-900"
                      }`}
                    >
                      {isSavingAddress
                        ? "Saving..."
                        : editingAddressId
                          ? "Update Address"
                          : "Save Address"}
                    </button>
                  </form>
                )}

              {addressesLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6">
                      <div className="skeleton h-4 w-1/3 mb-3" />
                      <div className="skeleton h-4 w-2/3 mb-2" />
                      <div className="skeleton h-4 w-1/2 mb-2" />
                    </div>
                  ))}
                </div>
              )}
              {!addressesLoading && addressesError && (
                <div className="text-sm text-red-600">{addressesError}</div>
              )}
              {!addressesLoading && !addressesError && addresses.length === 0 && (
                <div className="text-sm text-gray-600">No addresses yet.</div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {addresses.map((address) => (
                  <div key={address.id} className="bg-white border border-black rounded-2xl p-4 sm:p-6 hover:border-[#266000] transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="text-base sm:text-lg font-bold text-gray-900">{address.label || "Address"}</h4>
                      {address.is_default && (
                        <span className="inline-block px-2.5 py-1 bg-white border border-[#266000] text-[#266000] text-[10px] sm:text-xs font-bold rounded-full">
                          Default
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 mb-5 sm:mb-6 text-sm sm:text-base">
                      <p className="text-gray-700">{address.full_name} · {address.phone}</p>
                      <p className="text-gray-700">
                        {address.street}
                        {address.house ? `, ${address.house}` : ""}
                        {address.apartment ? `, ${address.apartment}` : ""}
                      </p>
                      <p className="text-gray-700">
                        {address.city}
                        {address.region ? `, ${address.region}` : ""} {address.postal_code}
                      </p>
                      <p className="text-gray-700">{address.country}</p>
                    </div>

                      <div className="flex flex-wrap gap-3 pt-3 sm:pt-4 border-t border-gray-200">
                        <button
                          onClick={() => {
                            setEditingAddressId(address.id);
                            setAddressForm({
                              label: address.label || "",
                              full_name: address.full_name || "",
                              phone: address.phone || "",
                              street: address.street || "",
                              house: address.house || "",
                              apartment: address.apartment || "",
                              city: address.city || "",
                              region: address.region || "",
                              postal_code: address.postal_code || "",
                              country: address.country || "Belgium",
                              is_default: Boolean(address.is_default)
                            });
                            setShowAddressForm(true);
                          }}
                          className="text-[#266000] text-xs sm:text-sm font-semibold hover:underline"
                        >
                          Edit
                        </button>
                        {!address.is_default && (
                          <button
                            onClick={() => handleSetDefault(address.id)}
                            className="text-gray-900 text-xs sm:text-sm font-semibold hover:underline"
                          >
                          Set as Default
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAddress(address.id)}
                        disabled={deletingAddressId === address.id}
                        className={`text-red-600 text-xs sm:text-sm font-semibold hover:underline ${
                          deletingAddressId === address.id ? "opacity-70 cursor-not-allowed" : ""
                        }`}
                      >
                        {deletingAddressId === address.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case "payment":
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white border border-black rounded-2xl p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6 lg:mb-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Payment Methods</h3>
                <button className="bg-yellow-500 hover:bg-yellow-600 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl font-bold text-sm sm:text-base transition-colors">
                  Add New Card
                </button>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                {/* Credit Card 1 */}
                <div className="bg-white border border-black rounded-2xl p-4 sm:p-6 hover:border-[#266000] transition-colors">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl border border-black flex items-center justify-center shrink-0">
                        <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-[#266000]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-bold text-gray-900 text-sm sm:text-base">Visa ending in 4242</h4>
                          <span className="inline-block px-2.5 py-1 bg-white border border-[#266000] text-[#266000] text-[10px] sm:text-xs font-bold rounded-full">
                            Default
                          </span>
                        </div>
                        <p className="text-gray-600 text-xs sm:text-sm">Expires 12/2026</p>
                        <p className="text-gray-600 text-xs sm:text-sm">John Doe</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <button className="text-[#266000] text-xs sm:text-sm font-semibold hover:underline">
                        Edit
                      </button>
                      <button className="text-red-600 text-xs sm:text-sm font-semibold hover:underline">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>

                {/* Credit Card 2 */}
                <div className="bg-white border border-black rounded-2xl p-4 sm:p-6 hover:border-[#266000] transition-colors">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl border border-black flex items-center justify-center shrink-0">
                        <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-[#266000]" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">Mastercard ending in 8888</h4>
                        <p className="text-gray-600 text-xs sm:text-sm">Expires 08/2025</p>
                        <p className="text-gray-600 text-xs sm:text-sm">John Doe</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <button className="text-gray-900 text-xs sm:text-sm font-semibold hover:underline">
                        Set as Default
                      </button>
                      <button className="text-[#266000] text-xs sm:text-sm font-semibold hover:underline">
                        Edit
                      </button>
                      <button className="text-red-600 text-xs sm:text-sm font-semibold hover:underline">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>

                {/* UPI */}
                <div className="bg-white border border-black rounded-2xl p-4 sm:p-6 hover:border-[#266000] transition-colors">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl border border-black flex items-center justify-center shrink-0">
                        <div className="text-xl sm:text-2xl font-bold text-[#266000]">€</div>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">UPI</h4>
                        <p className="text-gray-600 text-xs sm:text-sm">johndoe@paytm</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <button className="text-[#266000] text-xs sm:text-sm font-semibold hover:underline">
                        Edit
                      </button>
                      <button className="text-red-600 text-xs sm:text-sm font-semibold hover:underline">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gray-50 border border-gray-200 rounded-2xl">
                <h4 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">Payment Security</h4>
                <p className="text-xs sm:text-sm text-gray-600">
                  All payment information is encrypted and stored securely. We never share your payment details with third parties.
                </p>
              </div>
            </div>
          </div>
        );
      
      case "settings":
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white border border-black rounded-2xl p-4 sm:p-6 lg:p-8">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 lg:mb-8">Account Settings</h3>
              
              {/* Notifications */}
              <div className="mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-gray-200">
                <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Notifications</h4>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm sm:text-base">Order Updates</p>
                      <p className="text-xs sm:text-sm text-gray-600">Get notified about your order status</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#266000]"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm sm:text-base">Promotional Emails</p>
                      <p className="text-xs sm:text-sm text-gray-600">Receive updates about new products and offers</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#266000]"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm sm:text-base">SMS Notifications</p>
                      <p className="text-xs sm:text-sm text-gray-600">Get text messages for important updates</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#266000]"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Privacy */}
              <div className="mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-gray-200">
                <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Privacy</h4>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm sm:text-base">Show Profile to Public</p>
                      <p className="text-xs sm:text-sm text-gray-600">Make your profile visible to other users</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#266000]"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm sm:text-base">Share Purchase History</p>
                      <p className="text-xs sm:text-sm text-gray-600">Help us improve recommendations</p>
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
                <h4 className="text-base sm:text-lg font-bold text-red-600 mb-3 sm:mb-4">Danger Zone</h4>
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div>
                      <p className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Delete Account</p>
                      <p className="text-xs sm:text-sm text-gray-600">Permanently delete your account and all data</p>
                    </div>
                    <button className="bg-white border border-red-600 text-red-600 px-5 sm:px-6 py-2 rounded-xl font-bold text-sm sm:text-base hover:bg-red-600 hover:text-white transition-colors">
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
    <div className="min-h-screen bg-white py-8 sm:py-10 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 sm:mb-8">My Account</h1>
        
        {/* Horizontal Tabs for Mobile/Tablet, Vertical Sidebar for Desktop */}
        <div className="lg:hidden mb-6 sm:mb-8">
          {/* Mobile Profile Header */}
          <MobileProfileHeader user={user} />
          
          {/* Horizontal Tab Navigation */}
          <MobileTabNavigation 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
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

export default function AccountPage() {
  return (
    <Suspense fallback={null}>
      <AccountPageInner />
    </Suspense>
  );
}
