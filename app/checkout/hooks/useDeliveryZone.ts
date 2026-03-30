import { useEffect } from "react";
import ApiService from "@/lib/api";

type UseDeliveryZoneArgs = {
  shippingStep: number;
  country: string;
  city: string;
  postalCode: string;
  effectiveSubtotalForMinOrder: number;
  setShippingZone: (zone: any | null) => void;
  setDeliveryCheckError: (value: string | null) => void;
  formatCurrency: (value: number) => string;
};

export function useDeliveryZone({
  shippingStep,
  country,
  city,
  postalCode,
  effectiveSubtotalForMinOrder,
  setShippingZone,
  setDeliveryCheckError,
  formatCurrency
}: UseDeliveryZoneArgs) {
  useEffect(() => {
    if (shippingStep !== 2) return;

    const safeCountry = country?.trim();
    const safeCity = city?.trim();
    const safePostal = postalCode?.trim();

    if (!safeCountry || !safeCity || !safePostal || safePostal.length < 3) {
      setShippingZone(null);
      setDeliveryCheckError(null);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const result = await ApiService.validateDeliveryZone({
          country: safeCountry,
          city: safeCity,
          postal_code: safePostal
        });
        if (cancelled) return;

        if (!result?.allowed) {
          setShippingZone(null);
          setDeliveryCheckError("Delivery is not available in your area.");
          return;
        }

        const zone = result?.zone || null;
        setShippingZone(zone);

        const zoneMinOrder = Number(zone?.min_order_amount ?? zone?.minOrderAmount ?? NaN);
        if (Number.isFinite(zoneMinOrder) && effectiveSubtotalForMinOrder < zoneMinOrder) {
          const remaining = Math.max(0, zoneMinOrder - effectiveSubtotalForMinOrder);
          const message = `Minimum order for your area is ${formatCurrency(zoneMinOrder)}. Add ${formatCurrency(remaining)} more.`;
          setDeliveryCheckError(message);
          return;
        }

        setDeliveryCheckError(null);
      } catch {
        if (cancelled) return;
        setShippingZone(null);
        setDeliveryCheckError(null);
      }
    }, 450);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [shippingStep, country, city, postalCode, effectiveSubtotalForMinOrder]);
}
