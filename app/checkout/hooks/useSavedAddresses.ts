import { useEffect } from "react";
import ApiService from "@/lib/api";

type UseSavedAddressesArgs = {
  user: any;
  authLoading: boolean;
  savedAddresses: any[];
  selectedAddressId: string | null;
  isEditingSelectedAddress: boolean;
  shippingInfo: { street: string; postalCode: string; city: string };
  setSavedAddresses: (items: any[]) => void;
  setSelectedAddressId: (value: string | null) => void;
  applyProfileToForm: (profile: any) => void;
  applyAddressToForm: (addr: any) => void;
};

export function useSavedAddresses({
  user,
  authLoading,
  savedAddresses,
  selectedAddressId,
  isEditingSelectedAddress,
  shippingInfo,
  setSavedAddresses,
  setSelectedAddressId,
  applyProfileToForm,
  applyAddressToForm
}: UseSavedAddressesArgs) {
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
      } catch {
        // keep UI stable on failure
      }
    };

    loadSavedAddresses();
  }, [user?.id, user?.email, user?.phone, authLoading]);

  useEffect(() => {
    if (!savedAddresses.length) return;
    if (selectedAddressId) return;
    if (isEditingSelectedAddress) return;
    const defaultAddress = savedAddresses.find((addr: any) => addr.is_default);
    const chosen = defaultAddress || savedAddresses[0];
    if (!chosen) return;
    setSelectedAddressId(String(chosen.id));
    if (!shippingInfo.street || !shippingInfo.postalCode || !shippingInfo.city) {
      applyAddressToForm(chosen);
    }
  }, [savedAddresses, selectedAddressId, isEditingSelectedAddress, shippingInfo.street, shippingInfo.postalCode, shippingInfo.city]);
}
