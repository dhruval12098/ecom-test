import Link from "next/link";
import { CheckCircle, Package, Mail, Truck } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

type ConfirmationStepProps = {
  orderNumber: string;
  displayTotal: number;
  paymentLabel: string;
  shippingInfo: any;
};

export default function ConfirmationStep({
  orderNumber,
  displayTotal,
  paymentLabel,
  shippingInfo
}: ConfirmationStepProps) {
  return (
    <div className="min-h-screen bg-white fade-in">
      <section className="w-full py-12 md:py-20">
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <div className="bg-white border border-gray-200 shadow-sm rounded-3xl p-8 md:p-12 text-center">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-[#266000] border-2 border-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <CheckCircle className="h-12 w-12 md:h-14 md:w-14 text-white" />
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Order Confirmed!
            </h1>

            <p className="text-lg md:text-xl text-gray-600 mb-6">
              Thank you for your order, {shippingInfo.firstName}!
            </p>

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
                  You will receive a confirmation email once your order is confirmed from our side.
                  <br />
                  Delivery within 1–3 business days (same-day delivery available in some areas).
                </p>
              </div>
            </div>

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

            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Need help? Contact us at <a href="mailto:support@tulsi.store" className="text-[#266000] font-semibold hover:underline">support@tulsi.store</a> or call <a href="tel:+32000000000" className="text-[#266000] font-semibold hover:underline">+32 000 000 000</a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
