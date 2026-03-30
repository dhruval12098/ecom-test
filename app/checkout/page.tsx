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
import { isValidPhone, formatPhone } from "./utils/phoneValidation";
import { useWorldlineReturn } from "./hooks/useWorldlineReturn";
import { useDeliveryZone } from "./hooks/useDeliveryZone";
import { useLiveProducts } from "./hooks/useLiveProducts";
import { useSavedAddresses } from "./hooks/useSavedAddresses";
import ShippingStep from "./components/steps/ShippingStep";
import ReviewStep from "./components/steps/ReviewStep";
import PaymentStep from "./components/steps/PaymentStep";
import ConfirmationStep from "./components/steps/ConfirmationStep";

type CheckoutStep = 1 | 2 | 3 | 4; // 1: Shipping, 2: Review, 3: Payment, 4: Confirmation

type CheckoutItem = {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  quantity: number;
  weight: string;
  inStock: boolean;
  stockQuantity?: number | null;
  variantId?: number | null;
  variantName?: string | null;
  category?: string;
  subcategory?: string;
  slug?: string;
  shippingMethod?: string;
  shipping_method?: string;
  tax_percent?: number | string | null;
  taxPercent?: number | string | null;
};

function CheckoutPageContent() {
  const { cartItems, addToCart, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const isBuyNow = searchParams.get("mode") === "buynow";
  const retryOrderId = searchParams.get("orderId");
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
  const [stockValidationError, setStockValidationError] = useState<string | null>(null);
  
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
    country: "Belgium",
    
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
  const [isEditingSelectedAddress, setIsEditingSelectedAddress] = useState(false);
  const [liveMap, setLiveMap] = useState<Record<number, any>>({});
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [deliveryCheckLoading, setDeliveryCheckLoading] = useState(false);
  const [deliveryCheckError, setDeliveryCheckError] = useState<string | null>(null);
  const [retryOrder, setRetryOrder] = useState<any | null>(null);
  const [retryOrderLoading, setRetryOrderLoading] = useState(false);
  const [retryOrderError, setRetryOrderError] = useState<string | null>(null);
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
    const orderId = retryOrderId ? Number(retryOrderId) : null;
    if (!orderId || !Number.isFinite(orderId)) return;
    let isMounted = true;
    (async () => {
      try {
        setRetryOrderLoading(true);
        setRetryOrderError(null);
        const data = await ApiService.getOrderById(orderId);
        if (!isMounted) return;
        setRetryOrder(data || null);
      } catch (e: any) {
        if (!isMounted) return;
        setRetryOrderError(e?.message || "Failed to load order details");
      } finally {
        if (isMounted) setRetryOrderLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [retryOrderId]);


  useWorldlineReturn({
    searchParams,
    returnChecked,
    setReturnChecked,
    setIsReturnFlow,
    setIsSubmitting,
    isBuyNow,
    clearCart,
    setOrderNumber,
    setConfirmedTotal,
    setCreatedOrderId,
    setCreatedOrderItems,
    setPaymentMethod,
    setStep,
    setShippingInfo,
    setShowBusinessInfo
  });

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

  const retryOrderItems = useMemo<CheckoutItem[]>(() => {
    if (!retryOrder?.items || !Array.isArray(retryOrder.items)) return [];
    return retryOrder.items.map((item: any) => ({
      id: Number(item.product_id || item.productId || item.id),
      name: item.product_name || item.name || "Product",
      price: Number(item.unit_price || item.price || 0),
      originalPrice: item.original_price !== undefined ? Number(item.original_price) : undefined,
      imageUrl: item.image_url || item.imageUrl || "",
      quantity: Number(item.quantity || 1),
      weight: item.variant_name || item.weight || "",
      inStock: true,
      variantId: item.variant_id || item.variantId || null,
      variantName: item.variant_name || item.variantName || null,
      shippingMethod: item.shipping_method || item.shippingMethod || undefined
    }));
  }, [retryOrder]);

  const useRetryItems = !isBuyNow && cartItems.length === 0 && retryOrderItems.length > 0;
  const sourceItems: CheckoutItem[] = isBuyNow
    ? (buyNowItem ? [buyNowItem] : [])
    : useRetryItems
      ? retryOrderItems
      : cartItems;

  useEffect(() => {
    if (isBuyNow) return;
    if (!retryOrderId) return;
    if (!retryOrderItems.length) return;
    if (cartItems.length > 0) return;
    if (typeof window === "undefined") return;
    const key = `retryCart:${retryOrderId}`;
    if (sessionStorage.getItem(key) === "done") return;
    clearCart();
    retryOrderItems.forEach((item) => {
      const qty = Math.max(1, Number(item.quantity || 1));
      for (let i = 0; i < qty; i += 1) {
        addToCart(
          {
            id: item.id,
            name: item.name,
            price: item.price,
            originalPrice: item.originalPrice,
            imageUrl: item.imageUrl || "",
            weight: item.weight || "",
            inStock: true,
            variantId: item.variantId || null,
            variantName: item.variantName || null,
            category: item.category,
            subcategory: item.subcategory,
            slug: item.slug,
            shippingMethod: item.shippingMethod || item.shipping_method
          },
          false
        );
      }
    });
    sessionStorage.setItem(key, "done");
  }, [isBuyNow, retryOrderId, retryOrderItems, cartItems.length, addToCart, clearCart]);

  const displayItems = sourceItems.map((item: CheckoutItem) => {
    const live = liveMap[item.id];
    if (!live) {
      return {
        ...item,
        stockQuantity: null
      };
    }
    const variantPrice = item.variantId && Array.isArray(live.variants)
      ? live.variants.find((v: any) => Number(v?.id) === Number(item.variantId))?.price
      : null;
    const selectedVariant = item.variantId && Array.isArray(live.variants)
      ? live.variants.find((v: any) => Number(v?.id) === Number(item.variantId))
      : null;
    const rawStock = selectedVariant?.stockQuantity ?? selectedVariant?.stock_quantity ?? live?.stockQuantity ?? live?.stock_quantity;
    const stockQuantity = Number.isFinite(Number(rawStock)) ? Number(rawStock) : null;
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
      stockQuantity
    };
  });

  const stockIssues = useMemo(() => {
      return displayItems
        .map((item: CheckoutItem) => {
          const stockQty = item.stockQuantity ?? null;
          if (stockQty === null) return null;
          if (item.quantity <= stockQty) return null;
          return {
            id: item.id,
            name: item.name,
            requested: item.quantity,
            available: stockQty
          };
        })
      .filter(Boolean) as Array<{ id: number; name: string; requested: number; available: number }>;
  }, [displayItems]);

  const hasStockIssues = stockIssues.length > 0;

  const formatStockIssueMessage = (issues: typeof stockIssues) => {
    const preview = issues.slice(0, 2).map((issue) => `${issue.name} (${issue.available} available)`);
    const suffix = issues.length > 2 ? ` +${issues.length - 2} more` : "";
    return `Some items exceed available stock: ${preview.join(", ")}${suffix}.`;
  };

  const sourceItemIdsKey = useMemo(
    () => sourceItems.map((item: CheckoutItem) => item.id).join("|"),
    [sourceItems]
  );

  useEffect(() => {
    const ids = new Set(sourceItems.map((item: CheckoutItem) => item.id));
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
    (sum: number, item: CheckoutItem) => sum + item.price * item.quantity,
    0
  );
  const orderDiscount = 0;
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
  const effectiveSubtotalForMinOrder = Math.max(0, subtotal - discountTotal);

  useDeliveryZone({
    shippingStep,
    country: shippingInfo.country,
    city: shippingInfo.city,
    postalCode: shippingInfo.postalCode,
    effectiveSubtotalForMinOrder,
    setShippingZone,
    setDeliveryCheckError,
    formatCurrency
  });

  const excludedCategorySet = useMemo(
    () => new Set(excludedCategoryIds.map((id) => Number(id))),
    [excludedCategoryIds]
  );

  const eligibleSubtotal = displayItems.reduce((sum: number, item: CheckoutItem) => {
    const live = liveMap[item.id];
    const categoryId = Number(
      live?.category_id ?? live?.categoryId ?? (item as any)?.category_id ?? NaN
    );
    if (Number.isFinite(categoryId) && excludedCategorySet.has(categoryId)) {
      return sum;
    }
    return sum + item.price * item.quantity;
  }, 0);

  const hasFreeShippingItem = displayItems.some((item: CheckoutItem) => {
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
  const taxableAmount = Math.max(0, subtotal - discountTotal);
  const tax = (() => {
    if (subtotal <= 0) return 0;
    return displayItems.reduce((sum: number, item: CheckoutItem) => {
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
    const rates = displayItems.map((item: CheckoutItem) => {
      const live = liveMap[item.id];
      const rawRate = live?.tax_percent ?? live?.taxPercent ?? item.tax_percent ?? item.taxPercent ?? null;
      const rate = rawRate !== null && rawRate !== undefined && rawRate !== '' ? Number(rawRate) : Number(taxRate);
      return Number.isFinite(rate) ? rate : Number(taxRate);
    });
    if (rates.length === 0) return `Tax (VAT ${taxRate}%)`;
    const first = rates[0];
    const allSame = rates.every((r: number) => Math.abs(r - first) < 0.0001);
    if (allSame) return `Tax (VAT ${first}%)`;
    return 'Tax (mixed rates)';
  })();
  const total = subtotal + shippingCost - discountTotal + tax;
  const minOrderAmount = Number(
    shippingZone?.min_order_amount ?? shippingZone?.minOrderAmount ?? NaN
  );
  const hasMinOrderAmount = Number.isFinite(minOrderAmount);
  const minOrderRemaining = hasMinOrderAmount ? Math.max(0, minOrderAmount - effectiveSubtotalForMinOrder) : 0;
  const belowMinOrder = hasMinOrderAmount && effectiveSubtotalForMinOrder < minOrderAmount;
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
        [name]: name === "phone" ? formatPhone(value, prev.country) : value
      }));
      if (name === "postalCode" || name === "city" || name === "country") {
        setShippingZone(null);
        setDeliveryCheckError(null);
      }
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
    setShippingZone(null);
    setDeliveryCheckError(null);
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

  useEffect(() => {
    if (!user) return;
    setShippingInfo((prev) => ({
      ...prev,
      email: prev.email || user.email || "",
      phone: prev.phone || user.phone || ""
    }));
  }, [user?.email, user?.phone]);

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

    const phoneValue = shippingInfo.phone?.trim() || "";
    if (!isValidPhone(phoneValue, shippingInfo.country)) {
      toast.error("Invalid phone number", {
        description: "Please enter a valid phone number with 10–15 digits."
      });
      return;
    }

    if (hasStockIssues) {
      const message = formatStockIssueMessage(stockIssues);
      setStockValidationError(message);
      toast.error("Insufficient stock", { description: message });
      return;
    }
    setStockValidationError(null);
    
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
        const zoneMinOrder = Number(zone?.min_order_amount ?? zone?.minOrderAmount ?? NaN);
        if (Number.isFinite(zoneMinOrder) && effectiveSubtotalForMinOrder < zoneMinOrder) {
          const remaining = Math.max(0, zoneMinOrder - effectiveSubtotalForMinOrder);
          const message = `Minimum order for your area is ${formatCurrency(zoneMinOrder)}. Add ${formatCurrency(remaining)} more.`;
          setDeliveryCheckError(message);
          toast.error("Minimum order amount not met", { description: message });
          return;
        }
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
      const mobile = isMobile;
      if (step === 2) {
        const minOrderAmount = Number(
          effectiveZone?.min_order_amount ?? effectiveZone?.minOrderAmount ?? NaN
        );
        if (Number.isFinite(minOrderAmount) && effectiveSubtotalForMinOrder < minOrderAmount) {
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
        if (Number.isFinite(minOrderAmount) && effectiveSubtotalForMinOrder < minOrderAmount) {
          toast.error("Minimum order amount not met", {
            description: `Minimum order amount is ${formatCurrency(minOrderAmount)} for this delivery zone.`
          });
          return;
          }
          setIsSubmitting(true);
          const retryOrderIdNum = retryOrderId ? Number(retryOrderId) : null;
          if (retryOrderIdNum && Number.isFinite(retryOrderIdNum)) {
            if (!retryOrder) {
              toast.error("Order details are still loading. Please try again.");
              return;
            }
            if (paymentMethod !== "worldline") {
              toast.error("Please use Worldline to complete this payment.");
              return;
            }
            const retryTotal = Number(retryOrder?.total_amount ?? total);
            const hostedCheckout = await ApiService.createWorldlineCheckout({
              order: retryOrder,
              amount: retryTotal
            });
            const redirectUrl =
              hostedCheckout?.redirectUrl ||
              hostedCheckout?.partialRedirectUrl ||
              hostedCheckout?._links?.redirect?.href ||
              null;
            if (!redirectUrl) {
              throw new Error("Missing Worldline redirect URL");
            }
            if (typeof window !== "undefined") {
              window.location.href = redirectUrl;
            }
            return;
          }
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
            items: displayItems.map((item: CheckoutItem) => ({
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

  useSavedAddresses({
    user,
    authLoading,
    savedAddresses,
    selectedAddressId,
    isEditingSelectedAddress,
    shippingInfo: {
      street: shippingInfo.street,
      postalCode: shippingInfo.postalCode,
      city: shippingInfo.city
    },
    setSavedAddresses,
    setSelectedAddressId,
    applyProfileToForm,
    applyAddressToForm
  });

  useLiveProducts({
    sourceItems,
    setLiveMap,
    deps: [cartItems, buyNowItem, isBuyNow, useRetryItems],
    enabled: !useRetryItems
  });

  // Confirmation Screen
  if (step === 4) {
    return (
      <ConfirmationStep
        orderNumber={orderNumber}
        displayTotal={displayTotal}
        paymentLabel={paymentLabel}
        shippingInfo={shippingInfo}
      />
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
          style={{ colorScheme: "light" }}
          className="lg:[&_label]:text-xs lg:[&_label]:mb-1 lg:[&_input]:px-3 lg:[&_input]:py-2 lg:[&_input]:text-sm lg:[&_select]:px-3 lg:[&_select]:py-2 lg:[&_select]:text-sm lg:[&_textarea]:px-3 lg:[&_textarea]:py-2 lg:[&_textarea]:text-sm lg:[&_button]:px-5 lg:[&_button]:py-2 lg:[&_button]:text-sm"
        >
        <section className="w-full py-8 md:py-12 lg:py-8">
          <div className="max-w-5xl mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-5 lg:space-y-4">
                
                {/* STEP 1: Shipping Information */}
                {step === 1 && (
                  <ShippingStep
                    shippingStep={shippingStep}
                    setShippingStep={setShippingStep}
                    user={user}
                    savedAddresses={savedAddresses}
                    selectedAddressId={selectedAddressId}
                    setSelectedAddressId={setSelectedAddressId}
                    isEditingSelectedAddress={isEditingSelectedAddress}
                    setIsEditingSelectedAddress={setIsEditingSelectedAddress}
                    applyAddressToForm={applyAddressToForm}
                    shippingInfo={shippingInfo}
                    handleInputChange={handleInputChange}
                    showBusinessInfo={showBusinessInfo}
                    setShowBusinessInfo={setShowBusinessInfo}
                    saveAddress={saveAddress}
                    setSaveAddress={setSaveAddress}
                    scheduleEnabled={scheduleEnabled}
                    scheduleAcceptLabel={scheduleAcceptLabel}
                    scheduleDeliveryLabel={scheduleDeliveryLabel}
                    scheduleWindowLabel={scheduleWindowLabel}
                    deliveryCheckLoading={deliveryCheckLoading}
                    deliveryCheckError={deliveryCheckError}
                    stockValidationError={stockValidationError}
                    belowMinOrder={belowMinOrder}
                    minOrderAmount={minOrderAmount}
                    minOrderRemaining={minOrderRemaining}
                    countries={countries}
                  />
                )}

                {/* STEP 3: Payment Method */}
                {step === 3 && (
                  <PaymentStep
                    paymentMethod={paymentMethod}
                    setPaymentMethod={setPaymentMethod}
                    isMobile={isMobile}
                    isSubmitting={isSubmitting}
                    hasStockIssues={hasStockIssues}
                    onBack={() => {
                      setStep(2);
                      setReviewStep(isMobile ? 2 : 1);
                    }}
                  />
                )}

                {/* STEP 2: Review Order */}
                {step === 2 && (
                  <ReviewStep
                    isMobile={isMobile}
                    reviewStep={reviewStep}
                    setReviewStep={setReviewStep}
                    displayItems={displayItems}
                    couponCode={couponCode}
                    setCouponCode={setCouponCode}
                    appliedCoupon={appliedCoupon}
                    setAppliedCoupon={setAppliedCoupon}
                    couponError={couponError}
                    setCouponError={setCouponError}
                    couponLoading={couponLoading}
                    applyCoupon={applyCoupon}
                    subtotal={subtotal}
                    shippingCost={shippingCost}
                    orderDiscount={orderDiscount}
                    couponDiscount={couponDiscount}
                    taxLabel={taxLabel}
                    tax={tax}
                    total={total}
                    shippingInfo={shippingInfo}
                    scheduleEnabled={scheduleEnabled}
                    scheduleAcceptLabel={scheduleAcceptLabel}
                    scheduleDeliveryLabel={scheduleDeliveryLabel}
                    scheduleWindowLabel={scheduleWindowLabel}
                    paymentLabel={paymentLabel}
                    isSubmitting={isSubmitting}
                    hasStockIssues={hasStockIssues}
                    onEditDelivery={() => setStep(1)}
                    onEditPayment={() => setStep(3)}
                    onBackToDelivery={() => {
                      setStep(1);
                      setShippingStep(2);
                      setReviewStep(1);
                    }}
                  />
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
