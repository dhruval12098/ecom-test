import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import ApiService from "@/lib/api";
import { toast } from "sonner";

type UseWorldlineReturnArgs = {
  searchParams: { get: (key: string) => string | null };
  returnChecked: boolean;
  setReturnChecked: (value: boolean) => void;
  setIsReturnFlow: (value: boolean) => void;
  setIsSubmitting: (value: boolean) => void;
  isBuyNow: boolean;
  clearCart?: () => void;
  setOrderNumber: (value: string) => void;
  setConfirmedTotal: (value: number | null) => void;
  setCreatedOrderId: (value: number | null) => void;
  setCreatedOrderItems: (value: any[]) => void;
  setPaymentMethod: (value: string) => void;
  setStep: Dispatch<SetStateAction<any>>;
  setShippingInfo: Dispatch<SetStateAction<any>>;
  setShowBusinessInfo: (value: boolean) => void;
};

export function useWorldlineReturn({
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
}: UseWorldlineReturnArgs) {
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
        const statusResult = await ApiService.getWorldlineCheckoutStatus(orderId).catch(() => null);
        const orderData = await ApiService.getOrderById(orderId);
        const orderStatus = String(orderData?.status || "").toLowerCase();
        const paymentStatus = String((orderData?.payments || [])[0]?.status || "").toLowerCase();
        const normalizedStatus = String(statusResult?.status || '').toLowerCase();
        const rawOrder = orderData?.order_code || orderData?.order_number || "";
        setOrderNumber(String(rawOrder) || "ORD-" + Date.now().toString().slice(-8));
        setConfirmedTotal(Number(orderData?.total_amount || 0));
        setCreatedOrderId(Number(orderData?.id || 0) || null);
        setCreatedOrderItems(orderData?.items || []);
        if (orderData) {
          setShippingInfo((prev: any) => ({
            ...prev,
            firstName: orderData.customer_name?.split(" ")?.[0] || prev.firstName,
            lastName: orderData.customer_name?.split(" ")?.slice(1).join(" ") || prev.lastName,
            email: orderData.customer_email || prev.email,
            phone: orderData.customer_phone || prev.phone,
            street: orderData.address_street || prev.street,
            houseNumber: orderData.address_house || prev.houseNumber,
            apartment: orderData.address_apartment || prev.apartment,
            postalCode: orderData.address_postal_code || prev.postalCode,
            city: orderData.address_city || prev.city,
            region: orderData.address_region || prev.region,
            country: orderData.address_country || prev.country
          }));
          const hasBusiness = Boolean(orderData.company || orderData.vat_number || orderData.vatNumber);
          setShowBusinessInfo(hasBusiness);
        }
        setPaymentMethod("worldline");
        const isPaid = orderStatus === "confirmed" || normalizedStatus === "paid";
        const isCancelled =
          orderStatus === "cancelled" ||
          orderStatus === "refunded" ||
          normalizedStatus === "failed";
        if (isPaid) {
          setStep(4);
          toast.success("Payment confirmed");
          setTimeout(() => {
            if (!isBuyNow && clearCart) clearCart();
            if (isBuyNow && typeof window !== "undefined") {
              sessionStorage.removeItem("buyNowItem");
            }
          }, 500);
        } else if (isCancelled) {
          setStep(3);
          toast.error("This order was cancelled.");
          if (isBuyNow && typeof window !== "undefined") {
            sessionStorage.removeItem("buyNowItem");
          }
        } else {
          setStep(3);
          const message = normalizedStatus === "failed"
            ? "Payment not completed. You can retry or choose another method."
            : "Payment is pending. You can try again or choose another method.";
          toast.error(message);
          if (paymentStatus === "failed" && isBuyNow && typeof window !== "undefined") {
            sessionStorage.removeItem("buyNowItem");
          }
        }
      } catch {
        toast.error("Unable to confirm payment status");
      } finally {
        setIsSubmitting(false);
      }
    })();
  }, [searchParams, returnChecked]);
}
