import { CreditCard, ShieldCheck } from "lucide-react";

type PaymentStepProps = {
  paymentMethod: string;
  setPaymentMethod: (value: string) => void;
  isMobile: boolean;
  isSubmitting: boolean;
  hasStockIssues: boolean;
  onBack: () => void;
};

export default function PaymentStep({
  paymentMethod,
  setPaymentMethod,
  isMobile,
  isSubmitting,
  hasStockIssues,
  onBack
}: PaymentStepProps) {
  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-4 md:p-6 lg:p-4">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center">
          <CreditCard className="h-5 w-5 text-[#266000]" />
        </div>
        Payment Method
      </h2>

      <div className="space-y-4 mb-6">
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
              Secure hosted checkout (Bancontact, Visa, Mastercard).
            </div>
          </div>
          <div className="w-24 h-7 bg-gray-100 border border-gray-200 rounded flex items-center justify-center text-[10px] font-bold">
            WORLDLINE
          </div>
        </label>

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
          <div className="font-bold text-gray-900 text-sm mb-1">Redirecting to Worldline</div>
          <div className="text-xs text-gray-600">
            You’ll be redirected to Worldline to complete payment securely. We never store your card details.
          </div>
        </div>
      )}

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
          onClick={onBack}
          className="bg-black hover:bg-gray-900 text-white py-3 px-6 rounded-xl font-bold text-sm md:text-base transition-colors"
        >
          {isMobile ? "Back to Summary" : "Back to Review"}
        </button>
        <button
          type="submit"
          className="bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-8 rounded-xl font-bold text-sm md:text-base transition-colors order-1 sm:order-2 disabled:opacity-70 disabled:cursor-not-allowed"
          disabled={isSubmitting || hasStockIssues}
        >
          {isSubmitting ? "Placing order..." : "Place Order"}
        </button>
      </div>
    </div>
  );
}
