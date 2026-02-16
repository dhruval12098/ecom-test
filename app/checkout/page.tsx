"use client";

import { Suspense, useEffect, useState } from "react";
import { CreditCard, MapPin, Package, Truck, ShieldCheck, CheckCircle, ArrowLeft, User, Mail, Phone, Building, FileText, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import ApiService from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { toast } from "sonner";

type CheckoutStep = 1 | 2 | 3 | 4; // 1: Shipping, 2: Payment, 3: Review, 4: Confirmation

function CheckoutPageContent() {
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const isBuyNow = searchParams.get("mode") === "buynow";
  const [step, setStep] = useState<CheckoutStep>(1);
  const [orderNumber, setOrderNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [buyNowItem, setBuyNowItem] = useState<any | null>(null);
  
  const [shippingInfo, setShippingInfo] = useState({
    // Personal Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    
    // Shipping Address
    street: "",
    houseNumber: "",
    apartment: "",
    postalCode: "",
    city: "",
    region: "",
    country: "India",
    
    // Additional Info
    company: "",
    vatNumber: "",
    deliveryNotes: "",
    
    // GDPR Consent
    marketingConsent: false,
    termsAccepted: false
  });

  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [saveAddress, setSaveAddress] = useState(false);
  const [shippingRates, setShippingRates] = useState<any[]>([]);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [liveMap, setLiveMap] = useState<Record<number, any>>({});

  useEffect(() => {
    if (!isBuyNow) {
      setBuyNowItem(null);
      return;
    }
    if (typeof window === "undefined") return;
    const raw = sessionStorage.getItem("buyNowItem");
    if (!raw) {
      setBuyNowItem(null);
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      setBuyNowItem(parsed);
    } catch {
      setBuyNowItem(null);
    }
  }, [isBuyNow]);

  const sourceItems = isBuyNow ? (buyNowItem ? [buyNowItem] : []) : cartItems;

  const displayItems = sourceItems.map((item) => {
    const live = liveMap[item.id];
    if (!live) return item;
    const inStock =
      live.inStock !== undefined
        ? Boolean(live.inStock)
        : live.in_stock !== undefined
          ? Boolean(live.in_stock) && Number(live.stock_quantity || 0) > 0
          : item.inStock ?? true;
    return {
      ...item,
      name: live.name || item.name,
      price: Number(live.sale_price || live.price || item.price),
      originalPrice: live.originalPrice
        ? Number(live.originalPrice)
        : live.original_price
          ? Number(live.original_price)
          : item.originalPrice,
      imageUrl: live.imageUrl || live.image_url || item.imageUrl || "",
      inStock
    };
  });

  useEffect(() => {
    const ids = new Set(sourceItems.map((item) => item.id));
    setLiveMap((prev) => {
      const next: Record<number, any> = {};
      Object.keys(prev).forEach((key) => {
        const id = Number(key);
        if (ids.has(id)) next[id] = prev[id];
      });
      return next;
    });
  }, [sourceItems]);

  const subtotal = displayItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const hasFreeShippingItem = displayItems.some((item) => {
    const live = liveMap[item.id];
    const method = (live?.shipping_method || item.shippingMethod || item.shipping_method || '').toString().toLowerCase();
    return method === 'free';
  });

  const activeRates = shippingRates.filter((r) => r.active);
  const freeRate = activeRates.find((r) => r.type === 'free');
  const basicRate = activeRates.find((r) => r.type === 'basic');
  const freeThreshold = freeRate?.min_order ? Number(freeRate.min_order) : null;
  const shippingCost = (() => {
    if (hasFreeShippingItem) return 0;
    if (freeRate) {
      if (freeThreshold === null) return 0;
      if (subtotal >= freeThreshold) return 0;
    }
    if (basicRate) return Number(basicRate.price || 0);
    return subtotal > 500 ? 0 : 50;
  })();
  const discount = subtotal > 1000 ? subtotal * 0.1 : 0;
  const tax = (subtotal - discount) * 0.05; // 5% VAT
  const total = subtotal + shippingCost - discount + tax;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setShippingInfo(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setShippingInfo(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const applyAddressToForm = (addr: any) => {
    const fullName = addr.full_name || "";
    const parts = fullName.trim().split(" ");
    const firstName = parts.shift() || "";
    const lastName = parts.join(" ");

    setShippingInfo((prev) => ({
      ...prev,
      firstName: firstName || prev.firstName,
      lastName: lastName || prev.lastName,
      phone: addr.phone || prev.phone,
      street: addr.street || "",
      houseNumber: addr.house || "",
      apartment: addr.apartment || "",
      postalCode: addr.postal_code || "",
      city: addr.city || "",
      region: addr.region || "",
      country: addr.country || "",
    }));
  };

  const applyProfileToForm = (profile: any) => {
    if (!profile) return;
    const fullName = profile.full_name || "";
    const parts = fullName.trim().split(" ");
    const firstName = parts.shift() || "";
    const lastName = parts.join(" ");
    setShippingInfo((prev) => ({
      ...prev,
      firstName: prev.firstName || firstName,
      lastName: prev.lastName || lastName,
      email: prev.email || profile.email || "",
      phone: prev.phone || profile.phone || ""
    }));
  };

  const validateStep = (currentStep: number) => {
    if (currentStep === 1) {
      const required = ['firstName', 'lastName', 'email', 'phone', 'street', 'postalCode', 'city', 'country'];
      const missing = required.filter((field) => !shippingInfo[field as keyof typeof shippingInfo]);
      if (!shippingInfo.termsAccepted) {
        missing.push('termsAccepted');
      }
      return { valid: missing.length === 0, missing };
    }
    return { valid: true, missing: [] as string[] };
  };

  const fieldLabels: Record<string, string> = {
    firstName: "First name",
    lastName: "Last name",
    email: "Email",
    phone: "Phone",
    street: "Street",
    postalCode: "Postal code",
    city: "City",
    country: "Country",
    termsAccepted: "Terms acceptance",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateStep(step);
    if (!validation.valid) {
      const missingList = validation.missing.map((f) => fieldLabels[f] || f).join(", ");
      toast.warning("Missing required fields", {
        description: `Please fill: ${missingList}`,
      });
      return;
    }
    
    if (step < 3) {
      setStep((step + 1) as CheckoutStep);
    } else {
      try {
        setIsSubmitting(true);
        const payload = {
          customer_name: `${shippingInfo.firstName} ${shippingInfo.lastName}`.trim(),
          customer_email: shippingInfo.email,
          customer_phone: shippingInfo.phone,
          address_street: shippingInfo.street,
          address_house: shippingInfo.houseNumber,
          address_apartment: shippingInfo.apartment,
          address_city: shippingInfo.city,
          address_region: shippingInfo.region,
          address_postal_code: shippingInfo.postalCode,
          address_country: shippingInfo.country,
          subtotal,
          shipping_fee: shippingCost,
          tax_amount: tax,
          discount_amount: discount,
          total_amount: total,
          status: 'Pending',
          items: displayItems.map((item) => ({
            product_id: item.id,
            variant_id: item.variantId || null,
            product_name: item.name,
            variant_name: item.variantName || item.weight || null,
            unit_price: item.price,
            quantity: item.quantity,
            total_price: item.price * item.quantity
          })),
          payment: {
            method: paymentMethod,
            status: paymentMethod === 'cod' ? 'Pending' : 'Paid',
            amount: total
          }
        };

        const result = await ApiService.createOrder(payload);
        const rawOrder = result?.order?.order_code || result?.order?.order_number || "";
        setOrderNumber(String(rawOrder) || "ORD-" + Date.now().toString().slice(-8));
        setStep(4);

        if (typeof window !== 'undefined') {
          localStorage.setItem('orderContact', JSON.stringify({
            email: shippingInfo.email,
            phone: shippingInfo.phone
          }));
        }

        setTimeout(() => {
          if (!isBuyNow && clearCart) clearCart();
          if (isBuyNow && typeof window !== "undefined") {
            sessionStorage.removeItem("buyNowItem");
          }
        }, 1000);
      } catch (error) {
        alert("Failed to place order. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const countries = [
    "India", "Germany", "France", "Spain", "Italy", "Netherlands", 
    "Belgium", "Austria", "Switzerland", "United Kingdom", "Ireland",
    "Portugal", "Sweden", "Norway", "Denmark", "Finland"
  ];


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
      const loadSavedAddresses = async () => {
        if (!user?.id) return;
        try {
          const profile = await ApiService.getCustomerProfile(user.id);
          if (!profile?.id) return;
          applyProfileToForm(profile);
          const addresses = await ApiService.getCustomerAddresses(profile.id);
          setSavedAddresses(addresses || []);
          const defaultAddress = (addresses || []).find((addr: any) => addr.is_default);
          const chosen = defaultAddress || (addresses || [])[0];
          if (chosen) {
            setSelectedAddressId(String(chosen.id));
            applyAddressToForm(chosen);
          }
        } catch (error) {
          // keep UI stable on failure
        }
      };

      loadSavedAddresses();
    }, [user?.id]);

    useEffect(() => {
      const loadLiveProducts = async () => {
        if (sourceItems.length === 0) return;
        try {
          const ids = sourceItems
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
    }, [cartItems, buyNowItem, isBuyNow]);

  // Confirmation Screen
  if (step === 4) {
    return (
      <div className="min-h-screen bg-white fade-in">
        <section className="w-full py-12 md:py-20">
          <div className="max-w-3xl mx-auto px-4 md:px-6">
            <div className="bg-white border border-black rounded-3xl p-8 md:p-12 text-center">
              {/* Success Icon */}
              <div className="w-20 h-20 md:w-24 md:h-24 bg-[#266000] border-2 border-black rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <CheckCircle className="h-12 w-12 md:h-14 md:w-14 text-white" />
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Order Confirmed!
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 mb-6">
                Thank you for your order, {shippingInfo.firstName}!
              </p>
              
              {/* Order Details */}
              <div className="bg-gray-50 border border-black rounded-2xl p-6 md:p-8 mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Package className="h-6 w-6 text-[#266000]" />
                  <span className="text-sm text-gray-600">Order Number</span>
                </div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                  {orderNumber}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Total Amount</div>
                    <div className="text-xl font-bold text-gray-900">{formatCurrency(total)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Payment Method</div>
                    <div className="text-lg font-semibold text-gray-900 capitalize">
                      {paymentMethod.replace("-", " ")}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="text-sm text-gray-600 mb-1">Delivery Address</div>
                    <div className="text-sm text-gray-900">
                      {shippingInfo.street} {shippingInfo.houseNumber}
                      {shippingInfo.apartment && `, ${shippingInfo.apartment}`}
                      <br />
                      {shippingInfo.postalCode} {shippingInfo.city}
                      <br />
                      {shippingInfo.country}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Information Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-white border border-black rounded-2xl p-6 text-left">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gray-50 border border-black rounded-full flex items-center justify-center">
                      <Mail className="h-5 w-5 text-[#266000]" />
                    </div>
                    <h3 className="font-bold text-gray-900">Confirmation Email</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    We've sent a confirmation email to <strong>{shippingInfo.email}</strong> with your order details and tracking information.
                  </p>
                </div>
                
                <div className="bg-white border border-black rounded-2xl p-6 text-left">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gray-50 border border-black rounded-full flex items-center justify-center">
                      <Truck className="h-5 w-5 text-[#266000]" />
                    </div>
                    <h3 className="font-bold text-gray-900">Estimated Delivery</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Your order will be delivered within <strong>3-5 business days</strong>. You'll receive tracking updates via email and SMS.
                  </p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/"
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-4 rounded-xl font-bold text-base transition-colors inline-block"
                >
                  Continue Shopping
                </Link>
                <Link
                  href="/orders"
                  className="bg-white border border-black hover:border-[#266000] text-gray-900 px-8 py-4 rounded-xl font-bold text-base transition-colors inline-block"
                >
                  View Order Status
                </Link>
              </div>
              
              {/* Help Text */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Need help? Contact us at <a href="mailto:support@freshmart.com" className="text-[#266000] font-semibold hover:underline">support@freshmart.com</a> or call <a href="tel:+911800123456" className="text-[#266000] font-semibold hover:underline">+91 1800-123-456</a>
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white fade-in">
      {/* Header */}
      <section className="w-full py-8 md:py-12 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Secure Checkout</h1>
              <p className="text-gray-600 text-sm md:text-base">Complete your order in a few simple steps</p>
            </div>
            <Link 
              href="/cart"
              className="hidden md:flex items-center gap-2 text-[#266000] hover:text-[#1a4500] font-semibold transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Cart
            </Link>
          </div>
        </div>
      </section>

      {/* Progress Steps */}
        <section className="w-full py-8 bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex justify-between items-center relative max-w-3xl mx-auto">
              {/* Progress Bar Background */}
              <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-10 rounded-full"></div>
              <div 
                className="absolute top-5 left-0 h-1 bg-gradient-to-r from-[#266000] to-[#5aa400] z-0 transition-all duration-500 rounded-full" 
                style={{ width: `${((step - 1) / 2) * 100}%` }}
              ></div>
              
              {/* Step 1: Shipping */}
              <div className={`flex flex-col items-center relative z-10 ${step >= 1 ? 'text-[#266000]' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300 shadow-sm ${
                  step > 1 ? 'bg-[#266000] text-white' : step === 1 ? 'bg-white text-[#266000] ring-2 ring-[#266000]' : 'bg-white text-gray-400'
                }`}>
                  <MapPin className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <span className="text-xs md:text-sm font-semibold">Shipping</span>
                <span className="text-[10px] md:text-[11px] font-medium uppercase tracking-wide text-gray-400">
                  {step === 1 ? 'In Progress' : step > 1 ? 'Completed' : 'Upcoming'}
                </span>
              </div>
              
              {/* Step 2: Payment */}
              <div className={`flex flex-col items-center relative z-10 ${step >= 2 ? 'text-[#266000]' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300 shadow-sm ${
                  step > 2 ? 'bg-[#266000] text-white' : step === 2 ? 'bg-white text-[#266000] ring-2 ring-[#266000]' : 'bg-white text-gray-400'
                }`}>
                  <CreditCard className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <span className="text-xs md:text-sm font-semibold">Payment</span>
                <span className="text-[10px] md:text-[11px] font-medium uppercase tracking-wide text-gray-400">
                  {step === 2 ? 'In Progress' : step > 2 ? 'Completed' : 'Upcoming'}
                </span>
              </div>
              
              {/* Step 3: Review */}
              <div className={`flex flex-col items-center relative z-10 ${step >= 3 ? 'text-[#266000]' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300 shadow-sm ${
                  step > 3 ? 'bg-[#266000] text-white' : step === 3 ? 'bg-white text-[#266000] ring-2 ring-[#266000]' : 'bg-white text-gray-400'
                }`}>
                  <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <span className="text-xs md:text-sm font-semibold">Review</span>
                <span className="text-[10px] md:text-[11px] font-medium uppercase tracking-wide text-gray-400">
                  {step === 3 ? 'In Progress' : step > 3 ? 'Completed' : 'Upcoming'}
                </span>
              </div>
            </div>
          </div>
        </section>

      <form onSubmit={handleSubmit}>
        <section className="w-full py-8 md:py-12">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* STEP 1: Shipping Information */}
                {step === 1 && (
                  <div className="bg-white border border-black rounded-2xl p-4 md:p-6">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-50 border border-black rounded-full flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-[#266000]" />
                      </div>
                      Shipping Information
                    </h2>
                    
                    {/* Personal Information */}
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <User className="h-4 w-4 text-[#266000]" />
                        Personal Details
                      </h3>
                      {(!user || savedAddresses.length === 0 || selectedAddressId === null) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="firstName" className="block text-sm font-semibold text-gray-900 mb-2">
                              First Name *
                            </label>
                            <input
                              type="text"
                              id="firstName"
                              name="firstName"
                              value={shippingInfo.firstName}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-black rounded-xl focus:outline-none focus:border-[#266000] transition-colors text-sm md:text-base"
                              required
                            />
                          </div>
                        
                        <div>
                          <label htmlFor="lastName" className="block text-sm font-semibold text-gray-900 mb-2">
                            Last Name *
                          </label>
                          <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={shippingInfo.lastName}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-black rounded-xl focus:outline-none focus:border-[#266000] transition-colors text-sm md:text-base"
                            required
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={shippingInfo.email}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-black rounded-xl focus:outline-none focus:border-[#266000] transition-colors text-sm md:text-base"
                            placeholder="you@example.com"
                            required
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-2">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={shippingInfo.phone}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-black rounded-xl focus:outline-none focus:border-[#266000] transition-colors text-sm md:text-base"
                            placeholder="+91 XXXXX XXXXX"
                            required
                          />
                        </div>
                      </div>
                      )}
                    </div>
                    
                    {/* Shipping Address */}
                      <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <Building className="h-4 w-4 text-[#266000]" />
                          Delivery Address
                        </h3>
                        {user && savedAddresses.length > 0 && (
                          <div className="mb-6 space-y-3">
                            <div className="flex items-center justify-between">
                              <label className="block text-sm font-semibold text-gray-900">
                                Select Delivery Address
                              </label>
                              <button
                                type="button"
                                onClick={() => setSelectedAddressId(null)}
                                className="text-[#266000] text-sm font-semibold hover:underline"
                              >
                                Add New Address
                              </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {savedAddresses.map((addr: any) => {
                                const isSelected = String(addr.id) === String(selectedAddressId);
                                return (
                                  <button
                                    key={addr.id}
                                    type="button"
                                    onClick={() => {
                                      setSelectedAddressId(String(addr.id));
                                      applyAddressToForm(addr);
                                    }}
                                    className={`text-left border rounded-2xl p-4 transition-colors ${
                                      isSelected
                                        ? "border-[#266000] bg-green-50"
                                        : "border-black bg-white hover:border-[#266000]"
                                    }`}
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="font-bold text-gray-900 text-sm">
                                        {addr.label || "Address"}
                                      </div>
                                      {addr.is_default && (
                                        <span className="inline-block px-2 py-0.5 text-[10px] font-bold border border-[#266000] text-[#266000] rounded-full">
                                          Default
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-xs text-gray-700 space-y-1">
                                      <div className="font-semibold">{addr.full_name} · {addr.phone}</div>
                                      <div>
                                        {addr.street}
                                        {addr.house ? `, ${addr.house}` : ""}
                                        {addr.apartment ? `, ${addr.apartment}` : ""}
                                      </div>
                                      <div>
                                        {addr.city}
                                        {addr.region ? `, ${addr.region}` : ""} {addr.postal_code}
                                      </div>
                                      <div>{addr.country}</div>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        {(!user || savedAddresses.length === 0 || selectedAddressId === null) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label htmlFor="street" className="block text-sm font-semibold text-gray-900 mb-2">
                              Street Name *
                            </label>
                            <input
                            type="text"
                            id="street"
                            name="street"
                            value={shippingInfo.street}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-black rounded-xl focus:outline-none focus:border-[#266000] transition-colors text-sm md:text-base"
                            placeholder="Street name"
                            required
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="houseNumber" className="block text-sm font-semibold text-gray-900 mb-2">
                            House/Building Number
                          </label>
                          <input
                            type="text"
                            id="houseNumber"
                            name="houseNumber"
                            value={shippingInfo.houseNumber}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-black rounded-xl focus:outline-none focus:border-[#266000] transition-colors text-sm md:text-base"
                            placeholder="123"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="apartment" className="block text-sm font-semibold text-gray-900 mb-2">
                            Apartment/Floor (Optional)
                          </label>
                          <input
                            type="text"
                            id="apartment"
                            name="apartment"
                            value={shippingInfo.apartment}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-black rounded-xl focus:outline-none focus:border-[#266000] transition-colors text-sm md:text-base"
                            placeholder="Apt 4B"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="postalCode" className="block text-sm font-semibold text-gray-900 mb-2">
                            Postal/ZIP Code *
                          </label>
                          <input
                            type="text"
                            id="postalCode"
                            name="postalCode"
                            value={shippingInfo.postalCode}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-black rounded-xl focus:outline-none focus:border-[#266000] transition-colors text-sm md:text-base"
                            placeholder="400001"
                            required
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="city" className="block text-sm font-semibold text-gray-900 mb-2">
                            City *
                          </label>
                          <input
                            type="text"
                            id="city"
                            name="city"
                            value={shippingInfo.city}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-black rounded-xl focus:outline-none focus:border-[#266000] transition-colors text-sm md:text-base"
                            placeholder="Mumbai"
                            required
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="region" className="block text-sm font-semibold text-gray-900 mb-2">
                            State/Region
                          </label>
                          <input
                            type="text"
                            id="region"
                            name="region"
                            value={shippingInfo.region}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-black rounded-xl focus:outline-none focus:border-[#266000] transition-colors text-sm md:text-base"
                            placeholder="Maharashtra"
                          />
                        </div>
                        
                          <div>
                          <label htmlFor="country" className="block text-sm font-semibold text-gray-900 mb-2">
                            Country *
                          </label>
                          <select
                            id="country"
                            name="country"
                            value={shippingInfo.country}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-black rounded-xl focus:outline-none focus:border-[#266000] transition-colors text-sm md:text-base"
                            required
                          >
                            {countries.map((country) => (
                              <option key={country} value={country}>{country}</option>
                            ))}
                          </select>
                          </div>
                        </div>
                        )}
                    </div>
                    
                    {/* Business/Company (Optional) */}
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-[#266000]" />
                        Business Information (Optional)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="company" className="block text-sm font-semibold text-gray-900 mb-2">
                            Company Name
                          </label>
                          <input
                            type="text"
                            id="company"
                            name="company"
                            value={shippingInfo.company}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-black rounded-xl focus:outline-none focus:border-[#266000] transition-colors text-sm md:text-base"
                            placeholder="Your company"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="vatNumber" className="block text-sm font-semibold text-gray-900 mb-2">
                            VAT/Tax ID Number
                          </label>
                          <input
                            type="text"
                            id="vatNumber"
                            name="vatNumber"
                            value={shippingInfo.vatNumber}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-black rounded-xl focus:outline-none focus:border-[#266000] transition-colors text-sm md:text-base"
                            placeholder="DE123456789"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Delivery Notes */}
                    <div className="mb-6">
                      <label htmlFor="deliveryNotes" className="block text-sm font-semibold text-gray-900 mb-2">
                        Delivery Instructions (Optional)
                      </label>
                      <textarea
                        id="deliveryNotes"
                        name="deliveryNotes"
                        value={shippingInfo.deliveryNotes}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-3 border border-black rounded-xl focus:outline-none focus:border-[#266000] transition-colors resize-none text-sm md:text-base"
                        placeholder="e.g., Leave at door, Call before delivery"
                      />
                    </div>
                    
                    {/* GDPR Consent */}
                    <div className="mb-6 space-y-3 bg-gray-50 border border-black rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="termsAccepted"
                          name="termsAccepted"
                          checked={shippingInfo.termsAccepted}
                          onChange={handleInputChange}
                          className="mt-1 h-4 w-4 text-[#266000] border-black rounded focus:ring-[#266000]"
                          required
                        />
                        <label htmlFor="termsAccepted" className="text-sm text-gray-700">
                          I accept the <a href="/terms" className="text-[#266000] font-semibold hover:underline">Terms & Conditions</a> and <a href="/privacy" className="text-[#266000] font-semibold hover:underline">Privacy Policy</a> *
                        </label>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="marketingConsent"
                          name="marketingConsent"
                          checked={shippingInfo.marketingConsent}
                          onChange={handleInputChange}
                          className="mt-1 h-4 w-4 text-[#266000] border-black rounded focus:ring-[#266000]"
                        />
                        <label htmlFor="marketingConsent" className="text-sm text-gray-700">
                          I agree to receive marketing communications and special offers (you can unsubscribe anytime)
                        </label>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="saveAddress"
                          checked={saveAddress}
                          onChange={(e) => setSaveAddress(e.target.checked)}
                          className="mt-1 h-4 w-4 text-[#266000] border-black rounded focus:ring-[#266000]"
                        />
                        <label htmlFor="saveAddress" className="text-sm text-gray-700">
                          Save this address for future orders
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-8 rounded-xl font-bold text-sm md:text-base transition-colors"
                      >
                        Continue to Payment
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: Payment Method */}
                {step === 2 && (
                  <div className="bg-white border border-black rounded-2xl p-4 md:p-6">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-50 border border-black rounded-full flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-[#266000]" />
                      </div>
                      Payment Method
                    </h2>
                    
                    <div className="space-y-4 mb-6">
                      {/* Credit/Debit Card */}
                      <label className="flex items-start gap-4 p-4 border border-black rounded-xl cursor-pointer hover:border-[#266000] transition-colors">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="credit-card"
                          checked={paymentMethod === "credit-card"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="mt-1 h-5 w-5 text-[#266000] border-black focus:ring-[#266000]"
                        />
                        <div className="flex-grow">
                          <div className="font-bold text-gray-900 mb-1">Credit/Debit Card</div>
                          <div className="text-sm text-gray-600">Visa, Mastercard, American Express</div>
                        </div>
                        <div className="flex gap-2">
                          <div className="w-10 h-7 bg-gray-100 border border-black rounded flex items-center justify-center text-xs font-bold">VISA</div>
                          <div className="w-10 h-7 bg-gray-100 border border-black rounded flex items-center justify-center text-xs font-bold">MC</div>
                        </div>
                      </label>
                      
                      {/* UPI */}
                      <label className="flex items-start gap-4 p-4 border border-black rounded-xl cursor-pointer hover:border-[#266000] transition-colors">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="upi"
                          checked={paymentMethod === "upi"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="mt-1 h-5 w-5 text-[#266000] border-black focus:ring-[#266000]"
                        />
                        <div className="flex-grow">
                          <div className="font-bold text-gray-900 mb-1">UPI Payment</div>
                          <div className="text-sm text-gray-600">Pay using Google Pay, PhonePe, Paytm</div>
                        </div>
                        <div className="w-10 h-7 bg-gray-100 border border-black rounded flex items-center justify-center text-xs font-bold">UPI</div>
                      </label>
                      
                      {/* Net Banking */}
                      <label className="flex items-start gap-4 p-4 border border-black rounded-xl cursor-pointer hover:border-[#266000] transition-colors">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="netbanking"
                          checked={paymentMethod === "netbanking"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="mt-1 h-5 w-5 text-[#266000] border-black focus:ring-[#266000]"
                        />
                        <div className="flex-grow">
                          <div className="font-bold text-gray-900 mb-1">Net Banking</div>
                          <div className="text-sm text-gray-600">All major banks supported</div>
                        </div>
                      </label>
                      
                      {/* Cash on Delivery */}
                      <label className="flex items-start gap-4 p-4 border border-black rounded-xl cursor-pointer hover:border-[#266000] transition-colors">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cod"
                          checked={paymentMethod === "cod"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="mt-1 h-5 w-5 text-[#266000] border-black focus:ring-[#266000]"
                        />
                        <div className="flex-grow">
                          <div className="font-bold text-gray-900 mb-1">Cash on Delivery</div>
                          <div className="text-sm text-gray-600">Pay when you receive your order</div>
                        </div>
                        <div className="w-10 h-7 bg-gray-100 border border-black rounded flex items-center justify-center text-xs font-bold">COD</div>
                      </label>
                    </div>
                    
                    {/* Card Details (if credit card selected) */}
                    {paymentMethod === "credit-card" && (
                      <div className="bg-gray-50 border border-black rounded-xl p-4 md:p-6 mb-6">
                        <h3 className="font-bold text-gray-900 mb-4">Card Details</h3>
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="cardNumber" className="block text-sm font-semibold text-gray-900 mb-2">
                              Card Number *
                            </label>
                            <input
                              type="text"
                              id="cardNumber"
                              placeholder="1234 5678 9012 3456"
                              className="w-full px-4 py-3 border border-black rounded-xl focus:outline-none focus:border-[#266000] transition-colors text-sm md:text-base"
                              maxLength={19}
                              required
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="expiryDate" className="block text-sm font-semibold text-gray-900 mb-2">
                                Expiry Date *
                              </label>
                              <input
                                type="text"
                                id="expiryDate"
                                placeholder="MM/YY"
                                className="w-full px-4 py-3 border border-black rounded-xl focus:outline-none focus:border-[#266000] transition-colors text-sm md:text-base"
                                maxLength={5}
                                required
                              />
                            </div>
                            
                            <div>
                              <label htmlFor="cvv" className="block text-sm font-semibold text-gray-900 mb-2">
                                CVV *
                              </label>
                              <input
                                type="text"
                                id="cvv"
                                placeholder="123"
                                className="w-full px-4 py-3 border border-black rounded-xl focus:outline-none focus:border-[#266000] transition-colors text-sm md:text-base"
                                maxLength={4}
                                required
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label htmlFor="cardName" className="block text-sm font-semibold text-gray-900 mb-2">
                              Cardholder Name *
                            </label>
                            <input
                              type="text"
                              id="cardName"
                              placeholder="Name as it appears on card"
                              className="w-full px-4 py-3 border border-black rounded-xl focus:outline-none focus:border-[#266000] transition-colors text-sm md:text-base"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Security Notice */}
                    <div className="bg-gray-50 border border-black rounded-xl p-4 mb-6 flex items-start gap-3">
                      <ShieldCheck className="h-5 w-5 text-[#266000] shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-gray-900 text-sm mb-1">Secure Payment</div>
                        <div className="text-xs text-gray-600">Your payment information is encrypted and processed securely. We never store your card details.</div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="bg-white border border-black hover:border-[#266000] text-gray-900 py-3 px-6 rounded-xl font-bold text-sm md:text-base transition-colors order-2 sm:order-1"
                      >
                        Back to Shipping
                      </button>
                      <button
                        type="submit"
                        className="bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-8 rounded-xl font-bold text-sm md:text-base transition-colors order-1 sm:order-2"
                      >
                        Review Order
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: Review Order */}
                {step === 3 && (
                  <div className="bg-white border border-black rounded-2xl p-4 md:p-6">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-50 border border-black rounded-full flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-[#266000]" />
                      </div>
                      Review Your Order
                    </h2>
                    
                    {/* Shipping Information Summary */}
                    <div className="mb-6 bg-gray-50 border border-black rounded-xl p-4 md:p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-[#266000]" />
                          Delivery Address
                        </h3>
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="text-[#266000] text-sm font-semibold hover:underline"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="text-gray-700 text-sm space-y-1">
                        <p className="font-semibold">{shippingInfo.firstName} {shippingInfo.lastName}</p>
                        {shippingInfo.company && <p>{shippingInfo.company}</p>}
                        <p>{shippingInfo.street} {shippingInfo.houseNumber}</p>
                        {shippingInfo.apartment && <p>{shippingInfo.apartment}</p>}
                        <p>{shippingInfo.postalCode} {shippingInfo.city}</p>
                        {shippingInfo.region && <p>{shippingInfo.region}</p>}
                        <p>{shippingInfo.country}</p>
                        <p className="pt-2">{shippingInfo.email}</p>
                        <p>{shippingInfo.phone}</p>
                      </div>
                    </div>
                    
                    {/* Payment Method Summary */}
                    <div className="mb-6 bg-gray-50 border border-black rounded-xl p-4 md:p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-[#266000]" />
                          Payment Method
                        </h3>
                        <button
                          type="button"
                          onClick={() => setStep(2)}
                          className="text-[#266000] text-sm font-semibold hover:underline"
                        >
                          Edit
                        </button>
                      </div>
                      <p className="text-gray-700 font-semibold capitalize text-sm">
                        {paymentMethod.replace("-", " ").replace("netbanking", "Net Banking")}
                      </p>
                    </div>
                    
                    {/* Order Items */}
                    <div className="mb-6">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Package className="h-4 w-4 text-[#266000]" />
                        Order Items ({displayItems.length})
                      </h3>
                      <div className="space-y-3">
                        {displayItems.map((item) => (
                          <div key={item.id} className="flex gap-4 p-3 bg-gray-50 border border-black rounded-xl">
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border border-black bg-white shrink-0">
                              <img 
                                src={item.imageUrl} 
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg width="80" height="80" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="80" height="80" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" font-size="12" text-anchor="middle" dy=".3em" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E';
                                }}
                              />
                            </div>
                            <div className="flex-grow min-w-0">
                              <h4 className="font-bold text-gray-900 text-sm md:text-base line-clamp-1">{item.name}</h4>
                              <p className="text-gray-600 text-xs md:text-sm">{item.weight}</p>
                              <p className="text-gray-900 text-xs md:text-sm mt-1">Quantity: {item.quantity}</p>
                            </div>
                            <div className="text-right shrink-0">
                              {item.originalPrice && (
                              <p className="text-gray-500 line-through text-xs">{formatCurrency(item.originalPrice * item.quantity)}</p>
                            )}
                              <p className="font-bold text-gray-900 text-sm md:text-base">{formatCurrency(item.price * item.quantity)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Important Notice */}
                    <div className="mb-6 bg-yellow-50 border border-yellow-300 rounded-xl p-4 flex gap-3">
                      <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                      <div className="text-sm text-yellow-800">
                        <p className="font-semibold mb-1">Please review your order carefully</p>
                        <p>Once placed, some details cannot be changed. Make sure your delivery address and contact information are correct.</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="bg-white border border-black hover:border-[#266000] text-gray-900 py-3 px-6 rounded-xl font-bold text-sm md:text-base transition-colors order-2 sm:order-1"
                      >
                        Back to Payment
                      </button>
                      <button
                        type="submit"
                        className="bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-8 rounded-xl font-bold text-sm md:text-base transition-colors flex items-center justify-center gap-2 order-1 sm:order-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        disabled={isSubmitting}
                      >
                        <ShieldCheck className="h-5 w-5" />
                        {isSubmitting ? "Placing..." : "Place Order"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Order Summary Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white border border-black rounded-2xl p-4 md:p-6 lg:sticky lg:top-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
                    <Package className="h-5 w-5 text-[#266000]" />
                    Order Summary
                  </h2>
                  
                  <div className="space-y-3 mb-4 md:mb-6">
                    {displayItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <div className="flex-grow pr-2">
                          <span className="text-gray-600 line-clamp-1">{item.name} ×{item.quantity}</span>
                        </div>
                        <div className="shrink-0">
                          <span className="font-semibold text-gray-900">{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                      </div>
                    ))}
                    
                    <div className="border-t border-gray-300 pt-3 mt-3 space-y-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Subtotal</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(subtotal)}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm text-gray-600">
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
                        <div className="flex justify-between text-sm text-[#266000]">
                          <span>Discount</span>
                          <span className="font-semibold">-{formatCurrency(discount)}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Tax (VAT 5%)</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(tax)}</span>
                      </div>
                      
                      <div className="border-t border-gray-300 pt-3 mt-3 flex justify-between text-lg md:text-xl">
                        <span className="font-bold text-gray-900">Total</span>
                        <span className="font-bold text-gray-900">{formatCurrency(total)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Trust Badges */}
                  <div className="space-y-3 pt-4 md:pt-6 border-t border-gray-300">
                    <div className="flex items-center gap-3 text-xs md:text-sm">
                      <ShieldCheck className="h-4 w-4 md:h-5 md:w-5 text-[#266000]" />
                      <span className="text-gray-700">Secure SSL encrypted checkout</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs md:text-sm">
                      <Truck className="h-4 w-4 md:h-5 md:w-5 text-[#266000]" />
                      <span className="text-gray-700">
                        {freeThreshold !== null
                          ? `Free shipping on orders ${formatCurrency(freeThreshold)}+`
                          : 'Free shipping available'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs md:text-sm">
                      <Package className="h-4 w-4 md:h-5 md:w-5 text-[#266000]" />
                      <span className="text-gray-700">100% freshness guarantee</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </form>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutPageContent />
    </Suspense>
  );
}






