import Link from "next/link";
import { CheckCircle, FileText, Package, MapPin, CreditCard, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

type ReviewStepProps = {
  isMobile: boolean;
  reviewStep: 1 | 2;
  setReviewStep: (value: 1 | 2) => void;
  isPickupOnlyOrder?: boolean;
  storeName?: string | null;
  storeAddress?: string | null;
  displayItems: any[];
  couponCode: string;
  setCouponCode: (value: string) => void;
  appliedCoupon: any | null;
  setAppliedCoupon: (value: any | null) => void;
  couponError: string;
  setCouponError: (value: string) => void;
  couponLoading: boolean;
  applyCoupon: () => void;
  subtotal: number;
  shippingCost: number;
  orderDiscount: number;
  couponDiscount: number;
  taxLabel: string;
  tax: number;
  total: number;
  shippingInfo: any;
  scheduleEnabled: boolean;
  scheduleAcceptLabel: string;
  scheduleDeliveryLabel: string;
  scheduleWindowLabel: string;
  paymentLabel: string;
  isSubmitting: boolean;
  hasStockIssues: boolean;
  onEditDelivery: () => void;
  onEditPayment: () => void;
  onBackToDelivery: () => void;
};

export default function ReviewStep({
  isMobile,
  reviewStep,
  setReviewStep,
  isPickupOnlyOrder = false,
  storeName = null,
  storeAddress = null,
  displayItems,
  couponCode,
  setCouponCode,
  appliedCoupon,
  setAppliedCoupon,
  couponError,
  setCouponError,
  couponLoading,
  applyCoupon,
  subtotal,
  shippingCost,
  orderDiscount,
  couponDiscount,
  taxLabel,
  tax,
  total,
  shippingInfo,
  scheduleEnabled,
  scheduleAcceptLabel,
  scheduleDeliveryLabel,
  scheduleWindowLabel,
  paymentLabel,
  isSubmitting,
  hasStockIssues,
  onEditDelivery,
  onEditPayment,
  onBackToDelivery
}: ReviewStepProps) {
  const pickupStreet = String(storeAddress || "").trim();
  return (
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
              disabled={isSubmitting || hasStockIssues}
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
                                {item.imageUrl ? (
                                  <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.src =
                                        'data:image/svg+xml,%3Csvg width="80" height="80" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="80" height="80" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" font-size="12" text-anchor="middle" dy=".3em" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E';
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-400">
                                    No Image
                                  </div>
                                )}
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

          <div className="mb-6 bg-gray-50 border border-gray-200 shadow-sm rounded-xl p-4 md:p-6 lg:p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#266000]" />
                {isPickupOnlyOrder ? "Pickup Location" : "Delivery Address"}
              </h3>
              <button
                type="button"
                onClick={onEditDelivery}
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
              {isPickupOnlyOrder ? (
                <p>
                  {[storeName, pickupStreet]
                    .filter((part) => String(part || "").trim().length > 0)
                    .join(", ") || "Pickup address not configured in admin settings."}
                </p>
              ) : (
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
              )}
              <p className="mt-2">
                {[shippingInfo.email, shippingInfo.phone]
                  .filter((part) => String(part || "").trim().length > 0)
                  .join(" • ")}
              </p>
            </div>
            {scheduleEnabled && !isPickupOnlyOrder && (
              <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                <p className="font-semibold mb-1">Delivery Schedule</p>
                <p>Order acceptance: {scheduleAcceptLabel}</p>
                <p>Delivery days: {scheduleDeliveryLabel}</p>
                <p>Delivery window: {scheduleWindowLabel}</p>
              </div>
            )}
          </div>

          <div className="mb-6 bg-gray-50 border border-gray-200 shadow-sm rounded-xl p-4 md:p-6 lg:p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-[#266000]" />
                Payment Method
              </h3>
              <button
                type="button"
                onClick={onEditPayment}
                className="text-[#266000] text-sm font-semibold hover:underline"
              >
                Edit
              </button>
            </div>
            <p className="text-gray-700 font-semibold capitalize text-sm">
              {paymentLabel}
            </p>
          </div>

          <div className="mb-6 bg-yellow-50 border border-yellow-300 rounded-xl p-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">Please review your order carefully</p>
              <p>
                Once placed, some details cannot be changed. Make sure your{" "}
                {isPickupOnlyOrder ? "pickup details" : "delivery address"} and contact information are correct.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <button
              type="button"
              onClick={onBackToDelivery}
              className="bg-black hover:bg-gray-900 text-white py-3 px-6 rounded-xl font-bold text-sm md:text-base transition-colors"
            >
              Back to Delivery
            </button>
            <button
              type="submit"
              className="bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-8 rounded-xl font-bold text-sm md:text-base transition-colors flex items-center justify-center gap-2 order-1 sm:order-2 disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={isSubmitting || hasStockIssues}
            >
              {isMobile ? "Continue to Summary" : "Continue to Payment"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
