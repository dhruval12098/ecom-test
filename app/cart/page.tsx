"use client";

import { Trash2, Plus, Minus, ArrowLeft, ShoppingCart, Package, Truck, Shield, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { formatCurrency } from "@/lib/currency";
import ApiService from "@/lib/api";
import { useEffect, useMemo, useState } from "react";

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const [liveMap, setLiveMap] = useState<Record<number, any>>({});
  const [shippingRates, setShippingRates] = useState<any[]>([]);
  const [shippingZone, setShippingZone] = useState<any | null>(null);
  const [postalCode, setPostalCode] = useState("");
  const [deliveryCountry, setDeliveryCountry] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");
  const [postalLoading, setPostalLoading] = useState(false);
  const [postalError, setPostalError] = useState<string | null>(null);
  const [postalChecked, setPostalChecked] = useState(false);
  const [taxRate, setTaxRate] = useState(5);
  const [excludedCategoryIds, setExcludedCategoryIds] = useState<number[]>([]);
  const [showTaxDetails, setShowTaxDetails] = useState(false);

  const displayItems = useMemo(() => {
    return cartItems.map((item) => {
      const live = liveMap[item.id];
      if (!live) return item;
      const variantPrice = item.variantId && Array.isArray(live.variants)
        ? live.variants.find((v: any) => Number(v?.id) === Number(item.variantId))?.price
        : null;
      const selectedVariant = item.variantId && Array.isArray(live.variants)
        ? live.variants.find((v: any) => Number(v?.id) === Number(item.variantId))
        : null;
      const inStock =
        live.inStock !== undefined
          ? Boolean(live.inStock)
          : live.in_stock !== undefined
            ? Boolean(live.in_stock) && Number(live.stock_quantity || 0) > 0
            : item.inStock ?? true;
      return {
        ...item,
        name: live.name || item.name,
        price: variantPrice !== null && variantPrice !== undefined
          ? Number(variantPrice)
          : Number(live.sale_price || live.price || item.price),
        originalPrice: variantPrice !== null && variantPrice !== undefined
          ? (
              selectedVariant?.originalPrice !== undefined && selectedVariant?.originalPrice !== null
                ? Number(selectedVariant.originalPrice)
                : selectedVariant?.original_price !== undefined && selectedVariant?.original_price !== null
                  ? Number(selectedVariant.original_price)
                  : item.originalPrice
            )
          : live.originalPrice
            ? Number(live.originalPrice)
            : live.original_price
              ? Number(live.original_price)
              : item.originalPrice,
        imageUrl: live.imageUrl || live.image_url || item.imageUrl || "",
        inStock,
      };
    });
  }, [cartItems, liveMap]);

  const purchasableItems = useMemo(
    () => displayItems.filter((item) => item.inStock),
    [displayItems]
  );
  const purchasableCount = purchasableItems.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = purchasableItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const excludedCategorySet = useMemo(
    () => new Set(excludedCategoryIds.map((id) => Number(id))),
    [excludedCategoryIds]
  );

  const eligibleSubtotal = purchasableItems.reduce((sum, item) => {
    const live = liveMap[item.id];
    const categoryId = Number(
      live?.category_id ?? live?.categoryId ?? (item as any)?.category_id ?? NaN
    );
    if (Number.isFinite(categoryId) && excludedCategorySet.has(categoryId)) {
      return sum;
    }
    return sum + item.price * item.quantity;
  }, 0);
  const hasExcludedFreeShippingItems = purchasableItems.some((item) => {
    const live = liveMap[item.id];
    const categoryId = Number(
      live?.category_id ?? live?.categoryId ?? (item as any)?.category_id ?? NaN
    );
    return Number.isFinite(categoryId) && excludedCategorySet.has(categoryId);
  });

  const hasFreeShippingItem = purchasableItems.some((item) => {
    const live = liveMap[item.id];
    const method = (live?.shipping_method || item.shippingMethod || item.shipping_method || '').toString().toLowerCase();
    return method === 'free';
  });
  const activeRates = shippingRates.filter((r) => r.active);
  const freeRate = activeRates.find((r) => r.type === 'free');
  const basicRate = activeRates.find((r) => r.type === 'basic');
  const zoneThreshold =
    shippingZone?.conditional !== undefined && shippingZone?.conditional !== null
      ? Number(shippingZone.conditional)
      : null;
  const freeThreshold = zoneThreshold !== null && Number.isFinite(zoneThreshold)
    ? zoneThreshold
    : (freeRate?.min_order ? Number(freeRate.min_order) : null);
  const shippingCost = (() => {
    if (hasFreeShippingItem) return 0;
    if (shippingZone) {
      const zoneFee = Number(shippingZone.delivery_fee ?? 0);
      if (freeThreshold !== null && eligibleSubtotal >= freeThreshold) return 0;
      return Number.isFinite(zoneFee) ? zoneFee : 0;
    }
    if (freeRate) {
      if (freeThreshold === null) return 0;
      if (eligibleSubtotal >= freeThreshold) return 0;
    }
    if (basicRate) return Number(basicRate.price || 0);
    return subtotal > 500 ? 0 : 50;
  })();
  const discount = subtotal > 1000 ? subtotal * 0.1 : 0; // 10% discount for orders above 1000
  const tax = (() => {
    if (subtotal <= 0) return 0;
    return purchasableItems.reduce((sum, item) => {
      const live = liveMap[item.id];
      const rawRate = live?.tax_percent ?? live?.taxPercent ?? (item as any)?.tax_percent ?? (item as any)?.taxPercent ?? null;
      const rate = rawRate !== null && rawRate !== undefined && rawRate !== '' ? Number(rawRate) : Number(taxRate);
      const itemSubtotal = item.price * item.quantity;
      const discountShare = subtotal > 0 ? (discount * (itemSubtotal / subtotal)) : 0;
      const itemTaxable = Math.max(0, itemSubtotal - discountShare);
      return sum + itemTaxable * (rate / 100);
    }, 0);
  })();
  const taxLabel = (() => {
    const rates = purchasableItems.map((item) => {
      const live = liveMap[item.id];
      const rawRate = live?.tax_percent ?? live?.taxPercent ?? (item as any)?.tax_percent ?? (item as any)?.taxPercent ?? null;
      const rate = rawRate !== null && rawRate !== undefined && rawRate !== '' ? Number(rawRate) : Number(taxRate);
      return Number.isFinite(rate) ? rate : Number(taxRate);
    });
    if (rates.length === 0) return `Tax (VAT ${taxRate}%)`;
    const first = rates[0];
    const allSame = rates.every((r) => Math.abs(r - first) < 0.0001);
    if (allSame) return `Tax (VAT ${first}%)`;
    return 'Tax (mixed rates)';
  })();
  const vatSummary = (() => {
    const buckets: Record<string, { rate: number; net: number; vat: number; gross: number }> = {};
    purchasableItems.forEach((item) => {
      const live = liveMap[item.id];
      const rawRate = live?.tax_percent ?? live?.taxPercent ?? (item as any)?.tax_percent ?? (item as any)?.taxPercent ?? null;
      const rate = rawRate !== null && rawRate !== undefined && rawRate !== '' ? Number(rawRate) : Number(taxRate);
      const itemSubtotal = item.price * item.quantity;
      const discountShare = subtotal > 0 ? (discount * (itemSubtotal / subtotal)) : 0;
      const net = Math.max(0, itemSubtotal - discountShare);
      const safeRate = Number.isFinite(rate) ? rate : Number(taxRate);
      const vat = net * (safeRate / 100);
      const key = String(safeRate);
      if (!buckets[key]) {
        buckets[key] = { rate: safeRate, net: 0, vat: 0, gross: 0 };
      }
      buckets[key].net += net;
      buckets[key].vat += vat;
      buckets[key].gross += net + vat;
    });
    return Object.values(buckets).sort((a, b) => a.rate - b.rate);
  })();
  const total = subtotal + shippingCost - discount + tax;
  const minOrderAmount = Number(
    shippingZone?.min_order_amount ?? shippingZone?.minOrderAmount ?? NaN
  );
  const hasMinOrderAmount = Number.isFinite(minOrderAmount);
  const minOrderRemaining = hasMinOrderAmount ? Math.max(0, minOrderAmount - subtotal) : 0;
  const belowMinOrder = hasMinOrderAmount && subtotal < minOrderAmount;
  const deliveryValidated = postalChecked && !postalError && Boolean(shippingZone);
  const hasPurchasableItems = purchasableItems.length > 0;
  const canProceedCheckout = hasPurchasableItems && deliveryValidated && !belowMinOrder;

  useEffect(() => {
    const loadLiveProducts = async () => {
      if (cartItems.length === 0) return;
      try {
        const ids = cartItems
          .map((item) => Number(item.id))
          .filter((id) => Number.isFinite(id) && id > 0);
        if (ids.length === 0) return;
        const results = await Promise.all(ids.map((id) => ApiService.getProductById(id)));
        const map: Record<number, any> = {};
        results.forEach((p) => {
          if (p && typeof p.id === "number") {
            map[p.id] = p;
          }
        });
        setLiveMap(map);
      } catch (e) {
        // keep UI stable on failure
      }
    };
    loadLiveProducts();
  }, [cartItems]);

  useEffect(() => {
    const ids = new Set(cartItems.map((item) => item.id));
    setLiveMap((prev) => {
      const next: Record<number, any> = {};
      Object.keys(prev).forEach((key) => {
        const id = Number(key);
        if (ids.has(id)) next[id] = prev[id];
      });
      return next;
    });
  }, [cartItems]);

  useEffect(() => {
    const loadRates = async () => {
      try {
        const data = await ApiService.getShippingRates(true);
        setShippingRates(Array.isArray(data) ? data : []);
      } catch (e) {
        // keep UI stable on failure
      }
    };
    loadRates();
  }, []);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await ApiService.getSettings();
        const rate = settings?.tax_rate;
        const normalized = Number(rate);
        setTaxRate(Number.isFinite(normalized) ? normalized : 5);
        const raw = settings?.excluded_free_shipping_category_ids || [];
        const parsed = Array.isArray(raw) ? raw : [];
        setExcludedCategoryIds(parsed.map((id: any) => Number(id)).filter((id: number) => Number.isFinite(id)));
      } catch (e) {
        setTaxRate(5);
      }
    };
    loadSettings();
  }, []);

  const validatePostalCode = async () => {
    if (!postalCode || postalCode.trim().length < 3) {
      setShippingZone(null);
      setPostalError("Please enter a valid postal code.");
      setPostalChecked(true);
      return;
    }
    setPostalLoading(true);
    setPostalError(null);
    try {
      const result = await ApiService.validateDeliveryZone({
        country: deliveryCountry || undefined,
        city: deliveryCity || undefined,
        postal_code: postalCode.trim()
      });
      if (result?.allowed) {
        setShippingZone(result.zone || null);
      } else {
        setShippingZone(null);
        setPostalError("Delivery not available for this postal code.");
      }
    } catch (e) {
      setShippingZone(null);
      setPostalError("Unable to validate postal code.");
    } finally {
      setPostalLoading(false);
      setPostalChecked(true);
    }
  };


  return (
    <div className="min-h-screen bg-white fade-in">
      {/* Header Section */}
      <section className="w-full py-8 md:py-12 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <ShoppingCart className="h-8 w-8 md:h-10 md:w-10 text-[#266000]" />
                Shopping Cart
              </h1>
              <p className="text-gray-600 text-sm md:text-base">
                {displayItems.length} {displayItems.length === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
            
            <Link 
              href="/"
              className="hidden md:flex items-center gap-2 text-[#266000] hover:text-[#1a4500] font-semibold transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </section>

      {displayItems.length === 0 ? (
        /* Empty Cart State */
        <section className="w-full py-12 md:py-20">
          <div className="max-w-2xl mx-auto px-4 md:px-6">
            <div className="bg-white border border-black rounded-2xl md:rounded-3xl p-8 md:p-16 text-center">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-50 border border-black rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="h-10 w-10 md:h-12 md:w-12 text-gray-400" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
              <p className="text-gray-600 mb-6 md:mb-8 text-base md:text-lg">
                Looks like you haven't added anything to your cart yet. Start shopping to fill it up!
              </p>
              <Link 
                href="/"
                className="inline-block bg-yellow-500 hover:bg-yellow-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-sm md:text-base transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <section className="w-full py-8 md:py-12">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              {/* Cart Items Column */}
              <div className="lg:col-span-2 space-y-4 md:space-y-6">
                {/* Benefits Banner */}
                <div className="bg-gray-50 border border-black rounded-2xl p-4 md:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white border border-black rounded-full flex items-center justify-center shrink-0">
                        <Truck className="h-5 w-5 text-[#266000]" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-gray-900 text-xs md:text-sm">Free Shipping</div>
                        <div className="text-gray-600 text-xs">
                          {freeThreshold !== null
                            ? `On orders above ${formatCurrency(freeThreshold)}`
                            : "On all orders"}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white border border-black rounded-full flex items-center justify-center shrink-0">
                        <Package className="h-5 w-5 text-[#266000]" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-gray-900 text-xs md:text-sm">Fresh Products</div>
                        <div className="text-gray-600 text-xs">100% Quality guarantee</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white border border-black rounded-full flex items-center justify-center shrink-0">
                        <Shield className="h-5 w-5 text-[#266000]" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-gray-900 text-xs md:text-sm">Secure Payment</div>
                        <div className="text-gray-600 text-xs">Safe & encrypted</div>
                      </div>
                    </div>
                  </div>
                </div>


                {/* Cart Items */}
                <div className="bg-white border border-black rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50 text-gray-700">
                        <tr>
                          <th className="px-3 md:px-4 py-3 text-left font-semibold">Item</th>
                          <th className="px-3 md:px-4 py-3 text-center font-semibold whitespace-nowrap w-20">
                            Qty
                          </th>
                          <th className="px-3 md:px-4 py-3 text-right font-semibold whitespace-nowrap hidden md:table-cell w-24">
                            Unit
                          </th>
                          <th className="px-3 md:px-4 py-3 text-right font-semibold whitespace-nowrap hidden md:table-cell w-20">
                            VAT
                          </th>
                          <th className="px-3 md:px-4 py-3 text-right font-semibold whitespace-nowrap w-32">
                            Total
                          </th>
                          <th className="px-2 md:px-3 py-3 text-right font-semibold whitespace-nowrap w-12">
                            <span className="sr-only">Remove</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {displayItems.map((item) => (
                          <tr
                            key={`${item.id}-${item.variantId ?? "base"}`}
                            className={!item.inStock ? "opacity-50" : undefined}
                          >
                            <td className="px-3 md:px-4 py-3 align-top">
                              <div className="flex items-start gap-3">
                                <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden border border-black bg-gray-50 shrink-0">
                                  {item.imageUrl ? (
                                    <img
                                      src={item.imageUrl}
                                      alt={item.name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.currentTarget.src =
                                          'data:image/svg+xml,%3Csvg width="112" height="112" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="112" height="112" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" font-size="14" text-anchor="middle" dy=".3em" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E';
                                      }}
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                                      No Image
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-bold text-gray-900 break-words">{item.name}</div>
                                  {(item.variantName || item.weight) && (
                                    <div className="text-xs text-gray-600 mt-0.5">
                                      {item.variantName || item.weight}
                                    </div>
                                  )}
                                  {!item.inStock && (
                                    <div className="mt-2 inline-block bg-red-50 border border-red-200 text-red-600 px-2 py-1 rounded-lg text-xs font-semibold">
                                      Out of Stock
                                    </div>
                                  )}
                                  <div className="md:hidden text-xs text-gray-600 mt-2">
                                    Unit: <span className="font-semibold text-gray-900">{formatCurrency(item.price)}</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 md:px-4 py-3 align-top">
                              <div className="flex items-center justify-center">
                                <div className="flex items-center border border-black rounded-xl overflow-hidden">
                                  <button
                                    onClick={() => updateQuantity(item.id, item.quantity - 1, item.variantId)}
                                    disabled={!item.inStock || item.quantity <= 1}
                                    className="px-2.5 md:px-3 py-1.5 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    aria-label="Decrease quantity"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <span className="px-3 md:px-4 py-1.5 text-gray-900 font-semibold min-w-[44px] text-center border-x border-black">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(item.id, item.quantity + 1, item.variantId)}
                                    disabled={!item.inStock}
                                    className="px-2.5 md:px-3 py-1.5 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    aria-label="Increase quantity"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 md:px-4 py-3 text-right align-top hidden md:table-cell">
                              <span className="font-semibold text-gray-900">{formatCurrency(item.price)}</span>
                            </td>
                            <td className="px-3 md:px-4 py-3 text-right align-top hidden md:table-cell whitespace-nowrap">
                              {(() => {
                                const live = liveMap[item.id];
                                const rawRate = live?.tax_percent ?? live?.taxPercent ?? (item as any)?.tax_percent ?? (item as any)?.taxPercent ?? null;
                                const rate = rawRate !== null && rawRate !== undefined && rawRate !== '' ? Number(rawRate) : Number(taxRate);
                                const safeRate = Number.isFinite(rate) ? rate : Number(taxRate);
                                return `${safeRate.toFixed(2)}%`;
                              })()}
                            </td>
                            <td className="px-3 md:px-4 py-3 text-right align-top whitespace-nowrap">
                              {item.originalPrice && (
                                <div className="text-gray-500 line-through text-xs">
                                  {formatCurrency(item.originalPrice * item.quantity)}
                                </div>
                              )}
                              <div className="text-base md:text-lg font-bold text-gray-900">
                                {formatCurrency(item.price * item.quantity)}
                              </div>
                              {item.originalPrice && (
                                <div className="text-[#266000] text-xs font-semibold mt-0.5">
                                  Save {formatCurrency((item.originalPrice - item.price) * item.quantity)}
                                </div>
                              )}
                            </td>
                            <td className="px-2 md:px-3 py-3 text-right align-top">
                              <button
                                onClick={() => removeFromCart(item.id, item.variantId)}
                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                                title="Remove item"
                                aria-label="Remove item"
                              >
                                <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {/* Continue Shopping Link - Mobile */}
                <Link 
                  href="/"
                  className="flex md:hidden items-center gap-2 text-[#266000] hover:text-[#1a4500] font-semibold transition-colors justify-center py-4"
                >
                  <ArrowLeft className="h-5 w-5" />
                  Continue Shopping
                </Link>
              </div>
              
              {/* Order Summary Column */}
              <div className="lg:col-span-1">
                <div className="bg-white border border-black rounded-2xl p-4 md:p-6 lg:sticky lg:top-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Order Summary</h2>

                  <div className="bg-gray-50 border border-black rounded-xl p-3 md:p-4 mb-4 md:mb-5">
                    <div className="text-xs md:text-sm font-semibold text-gray-900 mb-2">
                      Check delivery & free shipping
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        value={postalCode}
                        onChange={(e) => {
                          setPostalCode(e.target.value);
                          setPostalChecked(false);
                        }}
                        placeholder="Enter postal code"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-400 focus:ring-0"
                      />
                      <button
                        type="button"
                        onClick={validatePostalCode}
                        disabled={postalLoading}
                        className="whitespace-nowrap rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-800 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-60"
                      >
                        {postalLoading ? "Checking..." : "Check"}
                      </button>
                    </div>
                    {postalChecked && postalError && (
                      <div className="mt-2 text-xs text-red-600">{postalError}</div>
                    )}
                    {postalChecked && !postalError && shippingZone && freeThreshold !== null && (
                      <div className="mt-2 text-xs text-gray-600">
                        Free shipping above {formatCurrency(freeThreshold)} for your area.
                      </div>
                    )}
                    {postalChecked && !postalError && !shippingZone && (
                      <div className="mt-2 text-xs text-gray-600">
                        Delivery availability confirmed.
                      </div>
                    )}
                    {hasExcludedFreeShippingItems && (
                      <div className="mt-2 text-xs text-amber-800">
                        Some items in your cart are excluded from the free shipping threshold.
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
                    <div className="flex justify-between text-sm md:text-base text-gray-600">
                      <span>Subtotal ({purchasableCount} purchasable items)</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(subtotal)}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm md:text-base text-gray-600">
                      <span>Shipping</span>
                      <span className="font-semibold text-gray-900">
                        {shippingCost === 0 ? (
                          <span className="text-[#266000]">FREE</span>
                        ) : (
                          `${formatCurrency(shippingCost)}`
                        )}
                      </span>
                    </div>
                    
                    {discount > 0 && (
                      <div className="flex justify-between text-sm md:text-base text-[#266000]">
                        <span>Discount (10%)</span>
                        <span className="font-semibold">-{formatCurrency(discount)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-sm md:text-base text-gray-600">
                      <span>{taxLabel}</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(tax)}</span>
                    </div>
                    {vatSummary.length > 1 && (
                      <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700">
                        <button
                          type="button"
                          onClick={() => setShowTaxDetails((prev) => !prev)}
                          className="w-full flex items-center justify-between font-semibold text-gray-800"
                          aria-expanded={showTaxDetails}
                        >
                          <span>VAT summary</span>
                          {showTaxDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                        {showTaxDetails && (
                          <div className="mt-2 space-y-2">
                            {vatSummary.length > 0 && (
                              <div className="space-y-1">
                                {vatSummary.map((row) => (
                                  <div key={row.rate} className="flex justify-between">
                                    <span>VAT {row.rate.toFixed(2)}%</span>
                                    <span className="font-semibold text-gray-900">{formatCurrency(row.vat)}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Free shipping progress bar */}
                    {shippingCost > 0 && freeThreshold !== null && (
                      <div className="bg-gray-50 border border-black rounded-xl p-3 md:p-4 mt-3 md:mt-4">
                        <div className="flex justify-between text-xs md:text-sm mb-2">
                          <span className="text-gray-600">
                            Add {formatCurrency(Math.max(0, freeThreshold - eligibleSubtotal))} more for free shipping
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 border border-gray-300">
                          <div 
                            className="bg-[#266000] h-full rounded-full transition-all duration-300"
                            style={{ width: `${Math.min((eligibleSubtotal / freeThreshold) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t border-gray-300 pt-3 md:pt-4 mb-4 md:mb-6">
                    <div className="flex justify-between text-lg md:text-xl">
                      <span className="font-bold text-gray-900">Total</span>
                      <span className="font-bold text-gray-900">{formatCurrency(total)}</span>
                    </div>
                    {discount > 0 && (
                      <p className="text-[#266000] text-xs md:text-sm font-semibold mt-2 text-right">
                        You saved {formatCurrency(discount)}!
                      </p>
                    )}
                  </div>

                  {!hasPurchasableItems && (
                    <div className="mb-4 md:mb-6 rounded-xl border border-amber-200 bg-amber-50 p-3 md:p-4">
                      <p className="text-sm font-semibold text-amber-900">No in-stock items to checkout</p>
                      <p className="mt-1 text-sm text-amber-800">
                        Remove out-of-stock products or add available products to continue.
                      </p>
                      <Link
                        href="/"
                        className="mt-3 inline-flex items-center justify-center rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-900"
                      >
                        Add more products
                      </Link>
                    </div>
                  )}

                  {hasPurchasableItems && !deliveryValidated && (
                    <div className="mb-4 md:mb-6 rounded-xl border border-amber-200 bg-amber-50 p-3 md:p-4">
                      <p className="text-sm font-semibold text-amber-900">Delivery check required</p>
                      <p className="mt-1 text-sm text-amber-800">
                        Enter your postal code and click Check to validate delivery area before checkout.
                      </p>
                    </div>
                  )}

                  {deliveryValidated && belowMinOrder && (
                    <div className="mb-4 md:mb-6 rounded-xl border border-amber-200 bg-amber-50 p-3 md:p-4">
                      <p className="text-sm font-semibold text-amber-900">Minimum order amount not met</p>
                      <p className="mt-1 text-sm text-amber-800">
                        Minimum order for your area is {formatCurrency(minOrderAmount)}.
                        Add {formatCurrency(minOrderRemaining)} more to continue.
                      </p>
                      <Link
                        href="/"
                        className="mt-3 inline-flex items-center justify-center rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-900"
                      >
                        Add more products
                      </Link>
                    </div>
                  )}
                  
                  {canProceedCheckout ? (
                    <Link
                      href="/checkout"
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 md:py-4 px-4 md:px-6 rounded-xl font-bold text-sm md:text-base transition-colors flex items-center justify-center gap-2 mb-3 md:mb-4"
                    >
                      Proceed to Checkout
                    </Link>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="w-full bg-gray-200 text-gray-500 py-3 md:py-4 px-4 md:px-6 rounded-xl font-bold text-sm md:text-base cursor-not-allowed mb-3 md:mb-4"
                    >
                      {!hasPurchasableItems
                        ? "No in-stock items to checkout"
                        : deliveryValidated
                          ? "Minimum order not met"
                          : "Validate delivery to continue"}
                    </button>
                  )}
                  
                  <Link
                    href="/"
                    className="w-full bg-white border border-black hover:border-[#266000] text-gray-900 py-3 md:py-4 px-4 md:px-6 rounded-xl font-bold text-sm md:text-base transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                    Continue Shopping
                  </Link>
                  
                  {/* Payment Methods */}
                  <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-300">
                    <h3 className="font-bold text-gray-900 mb-3 text-xs md:text-sm">We Accept</h3>
                    <div className="flex gap-2 md:gap-3">
                      <div className="w-10 h-7 md:w-12 md:h-8 bg-gray-100 border border-black rounded-lg flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-600">VISA</span>
                      </div>
                      <div className="w-10 h-7 md:w-12 md:h-8 bg-gray-100 border border-black rounded-lg flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-600">MC</span>
                      </div>
                      <div className="w-10 h-7 md:w-12 md:h-8 bg-gray-100 border border-black rounded-lg flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-600">UPI</span>
                      </div>
                      <div className="w-10 h-7 md:w-12 md:h-8 bg-gray-100 border border-black rounded-lg flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-600">COD</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Security Badge */}
                  <div className="mt-3 md:mt-4 flex items-center gap-2 text-gray-600 text-xs md:text-sm">
                    <Shield className="h-3 w-3 md:h-4 md:w-4 text-[#266000]" />
                    <span>Secure checkout powered by SSL encryption</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
      
      {/* Trust Indicators Section */}
      {cartItems.length > 0 && (
        <section className="w-full py-12 md:py-16 bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div className="bg-white border border-black rounded-2xl p-4 md:p-6 text-center">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-white border border-black rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <Package className="h-6 w-6 md:h-7 md:w-7 text-[#266000]" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-sm md:text-base">Fresh Guarantee</h3>
                <p className="text-gray-600 text-xs md:text-sm">
                  100% freshness guaranteed or your money back
                </p>
              </div>
              
              <div className="bg-white border border-black rounded-2xl p-4 md:p-6 text-center">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-white border border-black rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <Truck className="h-6 w-6 md:h-7 md:w-7 text-[#266000]" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-sm md:text-base">Fast Delivery</h3>
                <p className="text-gray-600 text-xs md:text-sm">
                  Same-day delivery available in select areas
                </p>
              </div>
              
              <div className="bg-white border border-black rounded-2xl p-4 md:p-6 text-center">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-white border border-black rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <Shield className="h-6 w-6 md:h-7 md:w-7 text-[#266000]" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-sm md:text-base">Secure Payment</h3>
                <p className="text-gray-600 text-xs md:text-sm">
                  Your payment information is safe and encrypted
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
