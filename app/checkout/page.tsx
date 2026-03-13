"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { CreditCard, MapPin, Package, Truck, ShieldCheck, CheckCircle, ArrowLeft, User, Mail, Phone, Building, FileText, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import ApiService from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { toast } from "sonner";

type CheckoutStep = 1 | 2 | 3 | 4; // 1: Shipping, 2: Review, 3: Payment, 4: Confirmation

function CheckoutPageContent() {
  const { cartItems, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const isBuyNow = searchParams.get("mode") === "buynow";
  const [step, setStep] = useState<CheckoutStep>(1);
  const [shippingStep, setShippingStep] = useState<1 | 2>(1);
  const [reviewStep, setReviewStep] = useState<1 | 2>(1); // mobile-only: 1=review, 2=order summary
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 1023px)").matches;
  });
  const [showBusinessInfo, setShowBusinessInfo] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [buyNowItem, setBuyNowItem] = useState<any | null>(null);
  const [confirmedTotal, setConfirmedTotal] = useState<number | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);
  const [createdOrderItems, setCreatedOrderItems] = useState<any[]>([]);
  const [isReturnFlow, setIsReturnFlow] = useState(false);
  const [returnChecked, setReturnChecked] = useState(false);
  const [taxRate, setTaxRate] = useState(5);
  const [excludedCategoryIds, setExcludedCategoryIds] = useState<number[]>([]);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [orderAcceptDays, setOrderAcceptDays] = useState<string[]>([]);
  const [deliveryDays, setDeliveryDays] = useState<string[]>([]);
  const [deliveryTimeRange, setDeliveryTimeRange] = useState<any | null>(null);
  
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

  const [paymentMethod, setPaymentMethod] = useState("worldline");
  const [saveAddress, setSaveAddress] = useState(false);
  const [shippingZone, setShippingZone] = useState<any | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [liveMap, setLiveMap] = useState<Record<number, any>>({});
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [deliveryCheckLoading, setDeliveryCheckLoading] = useState(false);
  const [deliveryCheckError, setDeliveryCheckError] = useState<string | null>(null);
  const paymentLabel =
    paymentMethod === "worldline"
      ? "Worldline"
      : paymentMethod === "cod"
        ? "Cash on Delivery"
        : paymentMethod.replace("-", " ").replace("netbanking", "Net Banking");

  const effectiveStep = (() => {
    if (step === 1) return shippingStep === 1 ? 1 : 2;
    if (step === 2) {
      if (isMobile) return reviewStep === 1 ? 3 : 4;
      return 3;
    }
    if (step === 3) return isMobile ? 5 : 4;
    return isMobile ? 5 : 4;
  })();

  const isMobileViewport = () => {
    if (typeof window === "undefined") return isMobile;
    return window.innerWidth < 1024;
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(max-width: 1023px)");
    const apply = () => setIsMobile(media.matches);
    apply();
    try {
      media.addEventListener("change", apply);
      return () => media.removeEventListener("change", apply);
    } catch {
      // Safari fallback
      media.addListener(apply);
      return () => media.removeListener(apply);
    }
  }, []);

  useEffect(() => {
    if (!isMobile && reviewStep !== 1) setReviewStep(1);
  }, [isMobile, reviewStep]);

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

  useEffect(() => {
    const hasSha = Boolean(searchParams.get("SHASIGN"));
    if (hasSha) return;
    const orderIdParam = searchParams.get("orderId");
    if (!orderIdParam || returnChecked) return;
    const orderId = Number(orderIdParam);
    if (!Number.isFinite(orderId)) return;
    setReturnChecked(true);
    setIsReturnFlow(true);
    setIsSubmitting(true);
    (async () => {
      try {
        await ApiService.getWorldlineCheckoutStatus(orderId);
        const orderData = await ApiService.getOrderById(orderId);
        const rawOrder = orderData?.order_code || orderData?.order_number || "";
        setOrderNumber(String(rawOrder) || "ORD-" + Date.now().toString().slice(-8));
        setConfirmedTotal(Number(orderData?.total_amount || 0));
        setCreatedOrderId(Number(orderData?.id || 0) || null);
        setCreatedOrderItems(orderData?.items || []);
        setPaymentMethod("worldline");
        setStep(4);
        toast.success("Payment status updated");
        setTimeout(() => {
          if (!isBuyNow && clearCart) clearCart();
          if (isBuyNow && typeof window !== "undefined") {
            sessionStorage.removeItem("buyNowItem");
          }
        }, 500);
      } catch (error) {
        toast.error("Unable to confirm payment status");
      } finally {
        setIsSubmitting(false);
      }
    })();
  }, [searchParams, returnChecked]);

  // WOP (Ogone) return flow removed: we are using Direct API Hosted Checkout.

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
        setScheduleEnabled(Boolean(settings?.delivery_schedule_enabled));
        const acceptRaw = Array.isArray(settings?.order_accept_days) ? settings.order_accept_days : [];
        const deliveryRaw = Array.isArray(settings?.delivery_days) ? settings.delivery_days : [];
        setOrderAcceptDays(acceptRaw.map((d: any) => String(d)));
        setDeliveryDays(deliveryRaw.map((d: any) => String(d)));
        const range = settings?.delivery_time_blocks || null;
        setDeliveryTimeRange(range);
      } catch {
        setTaxRate(5);
      }
    };
    loadSettings();
  }, []);

  const sourceItems = isBuyNow ? (buyNowItem ? [buyNowItem] : []) : cartItems;

  const displayItems = sourceItems.map((item) => {
    const live = liveMap[item.id];
    if (!live) return item;
    const variantPrice = item.variantId && Array.isArray(live.variants)
      ? live.variants.find((v: any) => Number(v?.id) === Number(item.variantId))?.price
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
        ? item.originalPrice
        : live.originalPrice
          ? Number(live.originalPrice)
          : live.original_price
            ? Number(live.original_price)
            : item.originalPrice,
      imageUrl: live.imageUrl || live.image_url || item.imageUrl || "",
      inStock
    };
  });

  const sourceItemIdsKey = useMemo(
    () => sourceItems.map((item) => item.id).join("|"),
    [sourceItems]
  );

  useEffect(() => {
    const ids = new Set(sourceItems.map((item) => item.id));
    setLiveMap((prev) => {
      const next: Record<number, any> = {};
      Object.keys(prev).forEach((key) => {
        const id = Number(key);
        if (ids.has(id)) next[id] = prev[id];
      });
      if (Object.keys(next).length === Object.keys(prev).length) {
        return prev;
      }
      return next;
    });
  }, [sourceItemIdsKey]);

  const subtotal = displayItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const excludedCategorySet = useMemo(
    () => new Set(excludedCategoryIds.map((id) => Number(id))),
    [excludedCategoryIds]
  );

  const eligibleSubtotal = displayItems.reduce((sum, item) => {
    const live = liveMap[item.id];
    const categoryId = Number(
      live?.category_id ?? live?.categoryId ?? (item as any)?.category_id ?? NaN
    );
    if (Number.isFinite(categoryId) && excludedCategorySet.has(categoryId)) {
      return sum;
    }
    return sum + item.price * item.quantity;
  }, 0);

  const hasFreeShippingItem = displayItems.some((item) => {
    const live = liveMap[item.id];
    const method = (live?.shipping_method || item.shippingMethod || item.shipping_method || '').toString().toLowerCase();
    return method === 'free';
  });

  const shippingCost = (() => {
    if (hasFreeShippingItem) return 0;
    if (shippingZone) {
      const fee = Number(shippingZone.delivery_fee ?? 0);
      const threshold =
        shippingZone.conditional !== undefined && shippingZone.conditional !== null
          ? Number(shippingZone.conditional)
          : null;
      if (threshold !== null && Number.isFinite(threshold) && eligibleSubtotal >= threshold) {
        return 0;
      }
      return Number.isFinite(fee) ? fee : 0;
    }
    return 0;
  })();
  const freeThreshold = (() => {
    if (hasFreeShippingItem) return null;
    if (!shippingZone) return null;
    const threshold =
      shippingZone.conditional !== undefined && shippingZone.conditional !== null
        ? Number(shippingZone.conditional)
        : null;
    return threshold !== null && Number.isFinite(threshold) ? threshold : null;
  })();
  const orderDiscount = subtotal > 1000 ? subtotal * 0.1 : 0;
  const couponDiscount = (() => {
    if (!appliedCoupon) return 0;
    const value = Number(appliedCoupon.discount_value || 0);
    if (!Number.isFinite(value) || value <= 0) return 0;
    if (String(appliedCoupon.discount_type).toLowerCase() === "fixed") {
      return Math.min(subtotal, value);
    }
    return Math.min(subtotal, (subtotal * value) / 100);
  })();
  const discountTotal = orderDiscount + couponDiscount;
  const taxableAmount = Math.max(0, subtotal - discountTotal);
  const tax = (() => {
    if (subtotal <= 0) return 0;
    return displayItems.reduce((sum, item) => {
      const live = liveMap[item.id];
      const rawRate = live?.tax_percent ?? live?.taxPercent ?? item.tax_percent ?? item.taxPercent ?? null;
      const rate = rawRate !== null && rawRate !== undefined && rawRate !== '' ? Number(rawRate) : Number(taxRate);
      const itemSubtotal = item.price * item.quantity;
      const discountShare = subtotal > 0 ? (discountTotal * (itemSubtotal / subtotal)) : 0;
      const itemTaxable = Math.max(0, itemSubtotal - discountShare);
      return sum + itemTaxable * (rate / 100);
    }, 0);
  })();
  const taxLabel = (() => {
    const rates = displayItems.map((item) => {
      const live = liveMap[item.id];
      const rawRate = live?.tax_percent ?? live?.taxPercent ?? item.tax_percent ?? item.taxPercent ?? null;
      const rate = rawRate !== null && rawRate !== undefined && rawRate !== '' ? Number(rawRate) : Number(taxRate);
      return Number.isFinite(rate) ? rate : Number(taxRate);
    });
    if (rates.length === 0) return `Tax (VAT ${taxRate}%)`;
    const first = rates[0];
    const allSame = rates.every((r) => Math.abs(r - first) < 0.0001);
    if (allSame) return `Tax (VAT ${first}%)`;
    return 'Tax (mixed rates)';
  })();
  const total = subtotal + shippingCost - discountTotal + tax;
  const displayTotal = confirmedTotal ?? total;
  const scheduleDeliveryDays = deliveryDays.length > 0 ? deliveryDays : orderAcceptDays;
  const scheduleAcceptLabel = orderAcceptDays.length ? orderAcceptDays.join(", ") : "Daily";
  const scheduleDeliveryLabel = scheduleDeliveryDays.length ? scheduleDeliveryDays.join(", ") : "Daily";
  const scheduleWindowLabel = deliveryTimeRange?.from && deliveryTimeRange?.to
    ? `${String(deliveryTimeRange.from.hour).padStart(2, '0')}:${String(deliveryTimeRange.from.minute).padStart(2, '0')} ${deliveryTimeRange.from.meridiem} - ${String(deliveryTimeRange.to.hour).padStart(2, '0')}:${String(deliveryTimeRange.to.minute).padStart(2, '0')} ${deliveryTimeRange.to.meridiem}`
    : "Time slots announced at checkout";

  const applyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      setCouponError("Enter a coupon code.");
      return;
    }
    setCouponLoading(true);
    setCouponError("");
    try {
      const coupons = await ApiService.getCoupons();
      const match = coupons.find(
        (c: any) => String(c.code || "").trim().toUpperCase() === code
      );
      if (!match) {
        setCouponError("Coupon not found.");
        setAppliedCoupon(null);
        return;
      }
      const status = String(match.status || "").toLowerCase();
      if (status && status !== "active") {
        setCouponError("Coupon is not active.");
        setAppliedCoupon(null);
        return;
      }
      if (match.expiry_date) {
        const exp = new Date(match.expiry_date);
        if (!Number.isNaN(exp.getTime()) && exp < new Date()) {
          setCouponError("Coupon expired.");
          setAppliedCoupon(null);
          return;
        }
      }
      if (
        match.usage_limit !== null &&
        match.usage_limit !== undefined &&
        Number(match.used_count || 0) >= Number(match.usage_limit)
      ) {
        setCouponError("Coupon usage limit reached.");
        setAppliedCoupon(null);
        return;
      }
      setAppliedCoupon(match);
      setCouponError("");
      setCouponCode(code);
    } catch (e) {
      setCouponError("Failed to apply coupon.");
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

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
      const required =
        shippingStep === 1
          ? ['firstName', 'lastName', 'email', 'phone']
          : ['street', 'postalCode', 'city', 'country'];
      const missing = required.filter((field) => !shippingInfo[field as keyof typeof shippingInfo]);
      if (shippingStep === 2 && !shippingInfo.termsAccepted) {
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
    
    if (step === 1) {
      if (shippingStep === 1) {
        setShippingStep(2);
        return;
      }
      try {
        setDeliveryCheckLoading(true);
        setDeliveryCheckError(null);
        const result = await ApiService.validateDeliveryZone({
          country: shippingInfo.country,
          city: shippingInfo.city,
          postal_code: shippingInfo.postalCode
        });
        if (!result?.allowed) {
          setDeliveryCheckError('Delivery is not available in your area.');
          toast.error('Delivery is not available in your area.');
          return;
        }
        const zone = result?.zone || null;
        setShippingZone(zone);
      } catch (err: any) {
        const msg = err?.message || 'Unable to validate delivery area.';
        setDeliveryCheckError(msg);
        toast.error(msg);
        return;
      } finally {
        setDeliveryCheckLoading(false);
      }
      setStep(2);
      setReviewStep(1);
      return;
    }

    let effectiveZone = shippingZone;
    if (!effectiveZone) {
      try {
        const refreshed = await ApiService.validateDeliveryZone({
          country: shippingInfo.country,
          city: shippingInfo.city,
          postal_code: shippingInfo.postalCode
        });
        effectiveZone = refreshed?.zone || null;
        if (effectiveZone) setShippingZone(effectiveZone);
      } catch {
        // ignore and keep null
      }
    }
    if (step < 3) {
      const mobile = isMobileViewport();
      if (step === 2) {
        const minOrderAmount = Number(
          effectiveZone?.min_order_amount ?? effectiveZone?.minOrderAmount ?? NaN
        );
        if (Number.isFinite(minOrderAmount) && subtotal < minOrderAmount) {
          toast.error("Minimum order amount not met", {
            description: `Minimum order amount is ${formatCurrency(minOrderAmount)} for this delivery zone.`
          });
          return;
        }
      }
      if (step === 2 && mobile && reviewStep === 1) {
        setReviewStep(2);
        return;
      }
      setStep((step + 1) as CheckoutStep);
    } else {
      try {
        const minOrderAmount = Number(
          effectiveZone?.min_order_amount ?? effectiveZone?.minOrderAmount ?? NaN
        );
        if (Number.isFinite(minOrderAmount) && subtotal < minOrderAmount) {
          toast.error("Minimum order amount not met", {
            description: `Minimum order amount is ${formatCurrency(minOrderAmount)} for this delivery zone.`
          });
          return;
        }
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
          discount_amount: discountTotal,
          coupon_code: appliedCoupon?.code ? String(appliedCoupon.code).trim() : null,
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
            status: paymentMethod === 'cod' || paymentMethod === 'worldline' ? 'Pending' : 'Paid',
            amount: total
          }
        };

        const result = await ApiService.createOrder(payload);
        const rawOrder = result?.order?.order_code || result?.order?.order_number || "";
        const createdId = Number(result?.order?.id || 0);
        setOrderNumber(String(rawOrder) || "ORD-" + Date.now().toString().slice(-8));
        setConfirmedTotal(total);
        setCreatedOrderId(createdId || null);
        setCreatedOrderItems(result?.items || []);

        if (typeof window !== 'undefined') {
          localStorage.setItem('orderContact', JSON.stringify({
            email: shippingInfo.email,
            phone: shippingInfo.phone
          }));
        }

        if (paymentMethod === 'worldline') {
          const hostedCheckout = await ApiService.createWorldlineCheckout({
            order: result?.order,
            amount: total
          });
          const redirectUrl =
            hostedCheckout?.redirectUrl ||
            hostedCheckout?.partialRedirectUrl ||
            hostedCheckout?._links?.redirect?.href ||
            null;
          if (!redirectUrl) {
            throw new Error('Missing Worldline redirect URL');
          }
          if (typeof window !== 'undefined') {
            window.location.href = redirectUrl;
          }
          return;
        }

        setStep(4);
        toast.success("Order placed");


        setTimeout(() => {
          if (!isBuyNow && clearCart) clearCart();
          if (isBuyNow && typeof window !== "undefined") {
            sessionStorage.removeItem("buyNowItem");
          }
        }, 1000);
      } catch (error) {
        const message =
          error instanceof Error && error.message
            ? error.message.replace(/^HTTP error! status: \d+\s*-?\s*/i, "")
            : "Please try again.";
        if (message.toLowerCase().includes("coupon")) {
          setCouponError(message);
          setAppliedCoupon(null);
        }
        toast.error("Failed to place order", {
          description: message || "Please try again.",
        });
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


  // Shipping rates removed in favor of per-phase delivery zones

  useEffect(() => {
      const loadSavedAddresses = async () => {
        if (authLoading || !user?.id) return;
        try {
          let profile = await ApiService.getCustomerProfile(user.id);
          if (!profile?.id) {
            const fallbackName =
              user.email?.split("@")[0] ||
              user.phone ||
              "Customer";
            profile = await ApiService.upsertCustomer({
              auth_user_id: user.id,
              full_name: fallbackName,
              email: user.email,
              phone: user.phone
            });
          }
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
    }, [user?.id, authLoading]);

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
            <div className="bg-white border border-gray-200 shadow-sm rounded-3xl p-8 md:p-12 text-center">
              {/* Success Icon */}
              <div className="w-20 h-20 md:w-24 md:h-24 bg-[#266000] border-2 border-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <CheckCircle className="h-12 w-12 md:h-14 md:w-14 text-white" />
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Order Confirmed!
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 mb-6">
                Thank you for your order, {shippingInfo.firstName}!
              </p>
              
              {/* Order Details */}
              <div className="bg-gray-50 border border-gray-200 shadow-sm rounded-2xl p-6 md:p-8 mb-8">
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
                    <div className="text-xl font-bold text-gray-900">{formatCurrency(displayTotal)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Payment Method</div>
                    <div className="text-lg font-semibold text-gray-900 capitalize">
                      {paymentLabel}
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
                <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 text-left">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center">
                      <Mail className="h-5 w-5 text-[#266000]" />
                    </div>
                    <h3 className="font-bold text-gray-900">Confirmation Email</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    We've sent a confirmation email to <strong>{shippingInfo.email}</strong> with your order details and tracking information.
                  </p>
                </div>
                
                <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 text-left">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center">
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
                  className="bg-white border border-gray-300 hover:border-[#266000] text-gray-900 px-8 py-4 rounded-xl font-bold text-base transition-colors inline-block"
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
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-3xl font-bold text-gray-900 mb-2">Secure Checkout</h1>
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
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          {(() => {
            const steps = isMobile
              ? [
                  { label: "Personal", icon: User },
                  { label: "Delivery", icon: MapPin },
                  { label: "Review", icon: CheckCircle },
                  { label: "Summary", icon: FileText },
                  { label: "Payment", icon: CreditCard },
                ]
              : [
                  { label: "Personal", icon: User },
                  { label: "Delivery", icon: MapPin },
                  { label: "Review", icon: CheckCircle },
                  { label: "Payment", icon: CreditCard },
                ];
            const totalSteps = steps.length;
            const progressPct =
              totalSteps <= 1 ? 0 : ((effectiveStep - 1) / (totalSteps - 1)) * 100;

            return (
          <div className="flex justify-between items-center relative max-w-4xl mx-auto">
            {/* Progress Bar Background */}
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-10 rounded-full"></div>
            <div
              className="absolute top-5 left-0 h-1 bg-gradient-to-r from-[#266000] to-[#5aa400] z-0 transition-all duration-500 rounded-full"
              style={{ width: `${progressPct}%` }}
            ></div>

            {steps.map((s, idx) => {
              const stepNum = idx + 1;
              const Icon = s.icon;
              const active = effectiveStep === stepNum;
              const completed = effectiveStep > stepNum;
              return (
                <div
                  key={s.label}
                  className={`flex flex-col items-center relative z-10 ${
                    effectiveStep >= stepNum ? "text-[#266000]" : "text-gray-400"
                  }`}
                >
                  <div
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300 shadow-sm ${
                      completed
                        ? "bg-[#266000] text-white"
                        : active
                          ? "bg-white text-[#266000] ring-2 ring-[#266000]"
                          : "bg-white text-gray-400"
                    }`}
                  >
                    <Icon className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <span className="text-xs md:text-sm font-semibold">{s.label}</span>
                  <span className="text-[10px] md:text-[11px] font-medium uppercase tracking-wide text-gray-400">
                    {active ? "In Progress" : completed ? "Completed" : "Upcoming"}
                  </span>
                </div>
              );
            })}
          </div>
            );
          })()}
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="lg:[&_label]:text-xs lg:[&_label]:mb-1 lg:[&_input]:px-3 lg:[&_input]:py-2 lg:[&_input]:text-sm lg:[&_select]:px-3 lg:[&_select]:py-2 lg:[&_select]:text-sm lg:[&_textarea]:px-3 lg:[&_textarea]:py-2 lg:[&_textarea]:text-sm lg:[&_button]:px-5 lg:[&_button]:py-2 lg:[&_button]:text-sm"
      >
        <section className="w-full py-8 md:py-12 lg:py-8">
          <div className="max-w-5xl mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-5 lg:space-y-4">
                
                {/* STEP 1: Shipping Information */}
                {step === 1 && (
                  <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-4 md:p-6 lg:p-4">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-[#266000]" />
                      </div>
                        {shippingStep === 1 ? "Personal Details" : "Delivery Details"}
                    </h2>
                    
                      {shippingStep === 1 && (
                        <>
                        {/* Personal Information */}
                        <div className="mb-6">
                          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <User className="h-4 w-4 text-[#266000]" />
                            Personal Details
                          </h3>
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
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#266000] transition-colors text-sm md:text-base"
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
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#266000] transition-colors text-sm md:text-base"
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
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#266000] transition-colors text-sm md:text-base"
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
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#266000] transition-colors text-sm md:text-base"
                            placeholder="+91 XXXXX XXXXX"
                            required
                          />
                        </div>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => setShippingStep(2)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-8 rounded-xl font-bold text-sm md:text-base transition-colors"
                          >
                            Continue to Delivery
                          </button>
                        </div>
                        </>
                      )}
                    
                      {shippingStep === 2 && (
                      <>
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
                                    className={`text-left border rounded-2xl p-4 shadow-sm transition-colors ${
                                      isSelected
                                        ? "border-[#266000] bg-green-50"
                                        : "border-gray-200 bg-white hover:border-[#266000]"
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
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#266000] transition-colors text-sm md:text-base"
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
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#266000] transition-colors text-sm md:text-base"
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
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#266000] transition-colors text-sm md:text-base"
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
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#266000] transition-colors text-sm md:text-base"
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
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#266000] transition-colors text-sm md:text-base"
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
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#266000] transition-colors text-sm md:text-base"
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
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#266000] transition-colors text-sm md:text-base"
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
                      <div className="flex items-center gap-3 mb-3">
                        <input
                          type="checkbox"
                          id="showBusinessInfo"
                          checked={showBusinessInfo}
                          onChange={(e) => setShowBusinessInfo(e.target.checked)}
                          className="h-4 w-4 text-[#266000] border-gray-300 rounded focus:ring-[#266000]"
                        />
                        <label htmlFor="showBusinessInfo" className="text-sm font-semibold text-gray-900">
                          Add business details (optional)
                        </label>
                      </div>
                      {showBusinessInfo && (
                        <>
                          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <FileText className="h-4 w-4 text-[#266000]" />
                            Business Information
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
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#266000] transition-colors text-sm md:text-base"
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
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#266000] transition-colors text-sm md:text-base"
                                placeholder="DE123456789"
                              />
                            </div>
                          </div>
                        </>
                      )}
                      </div>
                      
                      {scheduleEnabled && (
                        <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                          <div className="flex items-start gap-3">
                            <Truck className="h-5 w-5 text-emerald-700 mt-0.5" />
                            <div className="text-sm text-emerald-900">
                              <p className="font-semibold mb-1">Delivery Schedule</p>
                              <p>Order acceptance: {scheduleAcceptLabel}</p>
                              <p>Delivery days: {scheduleDeliveryLabel}</p>
                              <p>Delivery window: {scheduleWindowLabel}</p>
                            </div>
                          </div>
                        </div>
                      )}

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
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#266000] transition-colors resize-none text-sm md:text-base"
                        placeholder="e.g., Leave at door, Call before delivery"
                      />
                    </div>
                    
                    {/* GDPR Consent */}
                    <div className="mb-6 space-y-3 bg-gray-50 border border-gray-200 shadow-sm rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="termsAccepted"
                          name="termsAccepted"
                          checked={shippingInfo.termsAccepted}
                          onChange={handleInputChange}
                          className="mt-1 h-4 w-4 text-[#266000] border-gray-300 rounded focus:ring-[#266000]"
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
                          className="mt-1 h-4 w-4 text-[#266000] border-gray-300 rounded focus:ring-[#266000]"
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
                          className="mt-1 h-4 w-4 text-[#266000] border-gray-300 rounded focus:ring-[#266000]"
                        />
                        <label htmlFor="saveAddress" className="text-sm text-gray-700">
                          Save this address for future orders
                        </label>
                      </div>
                    </div>
                    
                      <div className="flex flex-col sm:flex-row justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => setShippingStep(1)}
                          className="bg-black hover:bg-gray-900 text-white py-3 px-6 rounded-xl font-bold text-sm md:text-base transition-colors"
                        >
                          Back to Personal
                        </button>
                        <button
                          type="submit"
                          className="bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-8 rounded-xl font-bold text-sm md:text-base transition-colors disabled:opacity-70"
                          disabled={deliveryCheckLoading}
                        >
                          {deliveryCheckLoading ? "Checking delivery..." : "Continue to Review"}
                        </button>
                      </div>
                      {deliveryCheckError && (
                        <div className="mt-4 w-full max-w-xl ml-auto rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                          <div className="flex items-start gap-3 text-red-800">
                            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                            <div className="text-sm">
                              <p className="font-semibold">Delivery Unavailable</p>
                              <p>{deliveryCheckError}</p>
                            </div>
                          </div>
                        </div>
                      )}
                  </>
                  )}
                  </div>
                )}

                {/* STEP 3: Payment Method */}
                {step === 3 && (
                  <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-4 md:p-6 lg:p-4">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-[#266000]" />
                      </div>
                      Payment Method
                    </h2>
                    
                      <div className="space-y-4 mb-6">
                        {/* Worldline Hosted Checkout */}
                      <label className="flex items-start gap-4 p-4 border border-gray-200 shadow-sm rounded-xl cursor-pointer hover:border-[#266000] transition-colors">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="worldline"
                          checked={paymentMethod === "worldline"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="mt-1 h-5 w-5 text-[#266000] border-gray-300 focus:ring-[#266000]"
                        />
                        <div className="flex-grow">
                          <div className="font-bold text-gray-900 mb-1">Pay Online (Worldline)</div>
                          <div className="text-sm text-gray-600">
                            Secure hosted checkout (cards, UPI, netbanking).
                          </div>
                        </div>
                        <div className="w-24 h-7 bg-gray-100 border border-gray-200 rounded flex items-center justify-center text-[10px] font-bold">
                          WORLDLINE
                        </div>
                      </label>

                      {/* Cash on Delivery */}
                      <label className="flex items-start gap-4 p-4 border border-gray-200 shadow-sm rounded-xl cursor-pointer hover:border-[#266000] transition-colors">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cod"
                          checked={paymentMethod === "cod"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="mt-1 h-5 w-5 text-[#266000] border-gray-300 focus:ring-[#266000]"
                        />
                        <div className="flex-grow">
                          <div className="font-bold text-gray-900 mb-1">Cash on Delivery</div>
                          <div className="text-sm text-gray-600">Pay when you receive your order</div>
                        </div>
                        <div className="w-10 h-7 bg-gray-100 border border-gray-200 rounded flex items-center justify-center text-xs font-bold">COD</div>
                      </label>
                    </div>

                    {paymentMethod === "worldline" && (
                      <div className="bg-gray-50 border border-gray-200 shadow-sm rounded-xl p-4 mb-6">
                        <div className="font-bold text-gray-900 text-sm mb-1">Redirect to Worldline</div>
                        <div className="text-xs text-gray-600">
                          You will be redirected to Worldline to complete payment securely. Card details are never stored on our site.
                        </div>
                      </div>
                    )}
                    
                    {/* Security Notice */}
                    <div className="bg-gray-50 border border-gray-200 shadow-sm rounded-xl p-4 mb-6 flex items-start gap-3">
                      <ShieldCheck className="h-5 w-5 text-[#266000] shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-gray-900 text-sm mb-1">Secure Payment</div>
                        <div className="text-xs text-gray-600">Your payment information is encrypted and processed securely. We never store your card details.</div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setStep(2);
                          setReviewStep(isMobileViewport() ? 2 : 1);
                        }}
                        className="bg-black hover:bg-gray-900 text-white py-3 px-6 rounded-xl font-bold text-sm md:text-base transition-colors"
                      >
                        {isMobile ? "Back to Summary" : "Back to Review"}
                      </button>
                      <button
                        type="submit"
                        className="bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-8 rounded-xl font-bold text-sm md:text-base transition-colors order-1 sm:order-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Placing order..." : "Place Order"}
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: Review Order */}
                {step === 2 && (
                  <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-4 md:p-6 lg:p-4">
                    {isMobile && reviewStep === 2 ? (
                      <>
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center">
                            <FileText className="h-5 w-5 text-[#266000]" />
                          </div>
                          Order Summary
                        </h2>

                        <div className="mb-6 bg-white border border-gray-200 shadow-sm rounded-xl p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="text-sm text-gray-700">
                              Items:{" "}
                              <span className="font-semibold text-gray-900">{displayItems.length}</span>
                              <button
                                type="button"
                                onClick={() => setReviewStep(1)}
                                className="ml-3 text-[#266000] font-semibold hover:underline"
                              >
                                Edit Order
                              </button>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-600">Total</div>
                              <div className="text-2xl font-bold text-gray-900 leading-tight">
                                {formatCurrency(total)}
                              </div>
                            </div>
                          </div>

                          <details className="mt-4 border-t border-gray-200 pt-3">
                            <summary className="cursor-pointer select-none text-sm font-semibold text-gray-900">
                              Show charges & coupon
                            </summary>
                            <div className="mt-3">
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={couponCode}
                                  onChange={(e) => setCouponCode(e.target.value)}
                                  placeholder="Coupon code"
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#266000]"
                                />
                                {appliedCoupon ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setAppliedCoupon(null);
                                      setCouponError("");
                                    }}
                                    className="px-3 py-2 text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                                  >
                                    Remove
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={applyCoupon}
                                    disabled={couponLoading}
                                    className="px-3 py-2 text-sm font-semibold text-white bg-black rounded-lg disabled:opacity-60"
                                  >
                                    {couponLoading ? "Applying..." : "Apply"}
                                  </button>
                                )}
                              </div>
                              {couponError && (
                                <div className="text-xs text-red-600 mt-2">{couponError}</div>
                              )}
                              {appliedCoupon && (
                                <div className="text-xs text-green-700 mt-2">
                                  Applied: {String(appliedCoupon.code || "").toUpperCase()}
                                </div>
                              )}

                              <div className="mt-4 space-y-2">
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

                                {orderDiscount > 0 && (
                                  <div className="flex justify-between text-sm text-[#266000]">
                                    <span>Order Discount</span>
                                    <span className="font-semibold">-{formatCurrency(orderDiscount)}</span>
                                  </div>
                                )}

                                {couponDiscount > 0 && (
                                  <div className="flex justify-between text-sm text-[#266000]">
                                    <span>Coupon</span>
                                    <span className="font-semibold">-{formatCurrency(couponDiscount)}</span>
                                  </div>
                                )}

                                <div className="flex justify-between text-sm text-gray-600">
                                  <span>{taxLabel}</span>
                                  <span className="font-semibold text-gray-900">{formatCurrency(tax)}</span>
                                </div>
                              </div>
                            </div>
                          </details>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => setReviewStep(1)}
                            className="bg-black hover:bg-gray-900 text-white py-3 px-6 rounded-xl font-bold text-sm md:text-base transition-colors"
                          >
                            Back to Review
                          </button>
                          <button
                            type="submit"
                            className="bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-8 rounded-xl font-bold text-sm md:text-base transition-colors flex items-center justify-center gap-2 order-1 sm:order-2 disabled:opacity-70 disabled:cursor-not-allowed"
                          >
                            Continue to Payment
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-[#266000]" />
                      </div>
                      Review Your Order
                    </h2>

                    {/* Order Items */}
                    <div className="mb-6">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Package className="h-4 w-4 text-[#266000]" />
                        Order Items ({displayItems.length})
                      </h3>
                      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 text-gray-700">
                              <tr>
                                <th className="px-3 py-3 text-left font-semibold">Item</th>
                                <th className="px-3 py-3 text-center font-semibold whitespace-nowrap w-16">Qty</th>
                                <th className="px-3 py-3 text-right font-semibold whitespace-nowrap hidden md:table-cell w-24">
                                  Unit
                                </th>
                                <th className="px-3 py-3 text-right font-semibold whitespace-nowrap w-28">Total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {displayItems.map((item) => (
                                <tr key={`${item.id}:${item.variantId ?? "no-variant"}`}>
                                  <td className="px-3 py-3 align-top">
                                    <div className="flex items-start gap-3">
                                      <div className="hidden sm:block w-12 h-12 rounded-lg overflow-hidden border border-gray-200 bg-white shrink-0">
                                        <img
                                          src={item.imageUrl}
                                          alt={item.name}
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            e.currentTarget.src =
                                              'data:image/svg+xml,%3Csvg width="80" height="80" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="80" height="80" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" font-size="12" text-anchor="middle" dy=".3em" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E';
                                          }}
                                        />
                                      </div>
                                      <div className="min-w-0">
                                        <div className="font-semibold text-gray-900 break-words">
                                          {item.name}
                                        </div>
                                        {(item.variantName || item.weight) && (
                                          <div className="text-xs text-gray-600 mt-0.5">
                                            {item.variantName || item.weight}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-3 py-3 text-center font-semibold text-gray-900 align-top">
                                    {item.quantity}
                                  </td>
                                  <td className="px-3 py-3 text-right text-gray-900 align-top hidden md:table-cell">
                                    {formatCurrency(item.price)}
                                  </td>
                                  <td className="px-3 py-3 text-right font-semibold text-gray-900 align-top whitespace-nowrap">
                                    {item.originalPrice && (
                                      <div className="text-gray-500 line-through text-xs">
                                        {formatCurrency(item.originalPrice * item.quantity)}
                                      </div>
                                    )}
                                    <div>{formatCurrency(item.price * item.quantity)}</div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                    
                    {/* Shipping Information Summary */}
                    <div className="mb-6 bg-gray-50 border border-gray-200 shadow-sm rounded-xl p-4 md:p-6 lg:p-4">
                      <div className="flex items-center justify-between mb-3">
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
                      <div className="text-gray-700 text-sm leading-relaxed">
                        <p className="font-semibold text-gray-900">
                          {shippingInfo.firstName} {shippingInfo.lastName}
                          {shippingInfo.company ? `, ${shippingInfo.company}` : ""}
                        </p>
                        <p>
                          {[
                            `${shippingInfo.street} ${shippingInfo.houseNumber}`.trim(),
                            shippingInfo.apartment,
                            `${shippingInfo.postalCode} ${shippingInfo.city}`.trim(),
                            shippingInfo.region,
                            shippingInfo.country,
                          ]
                            .filter((part) => String(part || "").trim().length > 0)
                            .join(", ")}
                        </p>
                        <p className="mt-2">
                          {[shippingInfo.email, shippingInfo.phone]
                            .filter((part) => String(part || "").trim().length > 0)
                            .join(" • ")}
                        </p>
                      </div>
                      {scheduleEnabled && (
                        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                          <p className="font-semibold mb-1">Delivery Schedule</p>
                          <p>Order acceptance: {scheduleAcceptLabel}</p>
                          <p>Delivery days: {scheduleDeliveryLabel}</p>
                          <p>Delivery window: {scheduleWindowLabel}</p>
                        </div>
                      )}
                      </div>
                    
                      {/* Payment Method Summary */}
                      <div className="mb-6 bg-gray-50 border border-gray-200 shadow-sm rounded-xl p-4 md:p-6 lg:p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-[#266000]" />
                            Payment Method
                          </h3>
                          <button
                            type="button"
                            onClick={() => setStep(3)}
                            className="text-[#266000] text-sm font-semibold hover:underline"
                          >
                            Edit
                          </button>
                        </div>
                        <p className="text-gray-700 font-semibold capitalize text-sm">
                        {paymentLabel}
                      </p>
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
                        onClick={() => {
                          setStep(1);
                          setShippingStep(2);
                          setReviewStep(1);
                        }}
                        className="bg-black hover:bg-gray-900 text-white py-3 px-6 rounded-xl font-bold text-sm md:text-base transition-colors"
                      >
                        Back to Delivery
                      </button>
                      <button
                        type="submit"
                        className="bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-8 rounded-xl font-bold text-sm md:text-base transition-colors flex items-center justify-center gap-2 order-1 sm:order-2 disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isMobile ? "Continue to Summary" : "Continue to Payment"}
                      </button>
                    </div>
                      </>
                    )}
                  </div>
                )}
              </div>
              
              {/* Order Summary Sidebar */}
              {step === 2 && (
              <div className="lg:col-span-1 hidden lg:block">
                <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-4 md:p-6 lg:p-4 lg:sticky lg:top-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
                    <Package className="h-5 w-5 text-[#266000]" />
                    Order Summary
                  </h2>
                  
                  <div className="max-h-[calc(100vh-170px)] overflow-y-auto pr-1">
                  <div className="space-y-3 mb-4 md:mb-6">
                    <div className="text-xs text-gray-600">
                      Items: <span className="font-semibold text-gray-900">{displayItems.length}</span>
                    </div>

                    <div className="border-t border-gray-200 pt-3 mt-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="Coupon code"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#266000]"
                        />
                        {appliedCoupon ? (
                          <button
                            type="button"
                            onClick={() => {
                              setAppliedCoupon(null);
                              setCouponError("");
                            }}
                            className="px-3 py-2 text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                          >
                            Remove
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={applyCoupon}
                            disabled={couponLoading}
                            className="px-3 py-2 text-sm font-semibold text-white bg-black rounded-lg disabled:opacity-60"
                          >
                            {couponLoading ? "Applying..." : "Apply"}
                          </button>
                        )}
                      </div>
                      {couponError && (
                        <div className="text-xs text-red-600 mt-2">{couponError}</div>
                      )}
                      {appliedCoupon && (
                        <div className="text-xs text-green-700 mt-2">
                          Applied: {String(appliedCoupon.code || "").toUpperCase()}
                        </div>
                      )}
                    </div>
                    
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
                      
                      {orderDiscount > 0 && (
                        <div className="flex justify-between text-sm text-[#266000]">
                          <span>Order Discount</span>
                          <span className="font-semibold">-{formatCurrency(orderDiscount)}</span>
                        </div>
                      )}

                      {couponDiscount > 0 && (
                        <div className="flex justify-between text-sm text-[#266000]">
                          <span>Coupon</span>
                          <span className="font-semibold">-{formatCurrency(couponDiscount)}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between text-sm text-gray-600">
                      <span>{taxLabel}</span>
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
              )}
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
