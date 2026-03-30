import Link from "next/link";
import { MapPin, User, Building, FileText, Truck, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

type ShippingStepProps = {
  shippingStep: 1 | 2;
  setShippingStep: (value: 1 | 2) => void;
  user: any;
  savedAddresses: any[];
  selectedAddressId: string | null;
  setSelectedAddressId: (value: string | null) => void;
  isEditingSelectedAddress: boolean;
  setIsEditingSelectedAddress: (value: boolean) => void;
  applyAddressToForm: (addr: any) => void;
  shippingInfo: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  showBusinessInfo: boolean;
  setShowBusinessInfo: (value: boolean) => void;
  saveAddress: boolean;
  setSaveAddress: (value: boolean) => void;
  scheduleEnabled: boolean;
  scheduleAcceptLabel: string;
  scheduleDeliveryLabel: string;
  scheduleWindowLabel: string;
  deliveryCheckLoading: boolean;
  deliveryCheckError: string | null;
  stockValidationError: string | null;
  belowMinOrder: boolean;
  minOrderAmount: number;
  minOrderRemaining: number;
  countries: string[];
};

export default function ShippingStep({
  shippingStep,
  setShippingStep,
  user,
  savedAddresses,
  selectedAddressId,
  setSelectedAddressId,
  isEditingSelectedAddress,
  setIsEditingSelectedAddress,
  applyAddressToForm,
  shippingInfo,
  handleInputChange,
  showBusinessInfo,
  setShowBusinessInfo,
  saveAddress,
  setSaveAddress,
  scheduleEnabled,
  scheduleAcceptLabel,
  scheduleDeliveryLabel,
  scheduleWindowLabel,
  deliveryCheckLoading,
  deliveryCheckError,
  stockValidationError,
  belowMinOrder,
  minOrderAmount,
  minOrderRemaining,
  countries
}: ShippingStepProps) {
  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-4 md:p-6 lg:p-4">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center">
          <MapPin className="h-5 w-5 text-[#266000]" />
        </div>
        {shippingStep === 1 ? "Personal Details" : "Delivery Details"}
      </h2>

      {shippingStep === 1 && (
        <>
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
                  maxLength={18}
                  inputMode="tel"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#266000] transition-colors text-sm md:text-base"
                  placeholder="+32 4X XX XX XX XX"
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
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedAddressId(null)}
                      className="text-[#266000] text-sm font-semibold hover:underline"
                    >
                      Add New Address
                    </button>
                    {selectedAddressId && (
                      <button
                        type="button"
                        onClick={() => {
                          const selected = savedAddresses.find(
                            (addr: any) => String(addr.id) === String(selectedAddressId)
                          );
                          if (selected) {
                            applyAddressToForm(selected);
                          }
                          setIsEditingSelectedAddress(true);
                          setSelectedAddressId(null);
                        }}
                        className="text-gray-700 text-sm font-semibold hover:underline"
                      >
                        Edit Selected
                      </button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {savedAddresses.map((addr: any) => {
                    const isSelected = String(addr.id) === String(selectedAddressId);
                    return (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => {
                          setIsEditingSelectedAddress(false);
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
                {selectedAddressId && (
                  <button
                    type="button"
                    onClick={() => {
                      const selected = savedAddresses.find(
                        (addr: any) => String(addr.id) === String(selectedAddressId)
                      );
                      if (selected) {
                        applyAddressToForm(selected);
                      }
                      setSelectedAddressId(null);
                    }}
                    className="text-[#266000] text-sm font-semibold hover:underline"
                  >
                    Edit selected address
                  </button>
                )}
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
                    placeholder="9000"
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
                    placeholder="Gent"
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
          {stockValidationError && (
            <div className="mt-4 w-full max-w-xl ml-auto rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <div className="flex items-start gap-3 text-red-800">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold">Insufficient stock</p>
                  <p>{stockValidationError}</p>
                </div>
              </div>
            </div>
          )}
          {shippingStep === 2 && shippingInfo.postalCode && belowMinOrder && (
            <div className="mt-4 w-full max-w-xl ml-auto rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <div className="text-sm text-amber-900">
                <p className="font-semibold">Minimum order amount not met</p>
                <p className="mt-1">
                  Minimum order for your area is {formatCurrency(minOrderAmount)}.
                  Add {formatCurrency(minOrderRemaining)} more to continue.
                </p>
                <Link
                  href="/"
                  className="mt-3 inline-flex items-center rounded-lg bg-black px-4 py-2 font-semibold text-white hover:bg-gray-900"
                >
                  Add more products
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
