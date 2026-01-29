export default function ReturnRefundPolicyPage() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Return & Refund Policy</h1>
          <p className="text-gray-600">Last updated: January 26, 2026</p>
        </div>

        <div className="bg-white border border-black rounded-2xl p-8">
          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
            <p className="text-gray-600 mb-6">
              At FreshMart, we want you to be completely satisfied with your purchase. Due to the nature of our products, our return policy varies depending on the type of item you've purchased. Please read this policy carefully before making a purchase.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Perishable Products</h2>
            <p className="text-gray-600 mb-4">
              Our perishable products (fruits, vegetables, dairy, bakery items, etc.) are not eligible for returns due to health and safety reasons. However, if you receive damaged, spoiled, or incorrect items, please contact us within 24 hours of delivery.
            </p>
            <p className="text-gray-600 mb-6">
              For damaged or incorrect perishable items, we offer:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-6">
              <li>Full refund of the affected items</li>
              <li>Replacement of the items (if available)</li>
              <li>Credit toward your next purchase</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Non-Perishable Products</h2>
            <p className="text-gray-600 mb-4">
              Non-perishable items (packaged goods, household items, etc.) may be returned within 30 days of delivery, provided they meet the following conditions:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-6">
              <li>Items must be in their original condition and packaging</li>
              <li>Items must be unused and undamaged</li>
              <li>Original receipt or proof of purchase must be provided</li>
              <li>Items must not be part of a clearance or final sale promotion</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Items Not Eligible for Return</h2>
            <p className="text-gray-600 mb-6">
              The following items cannot be returned or refunded:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-6">
              <li>Perishable goods after 24 hours of delivery (unless damaged/spoiled)</li>
              <li>Items marked as "final sale" or "clearance"</li>
              <li>Personal care items for hygiene reasons</li>
              <li>Gift cards</li>
              <li>Items that have been used or damaged by the customer</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Initiate a Return</h2>
            <p className="text-gray-600 mb-4">
              To initiate a return for eligible items, please follow these steps:
            </p>
            <ol className="list-decimal pl-6 text-gray-600 mb-6 space-y-2">
              <li>Contact our customer service team within the applicable timeframe</li>
              <li>Provide your order number and reason for return</li>
              <li>If approved, you will receive a return authorization and instructions</li>
              <li>Pack the item securely in its original packaging</li>
              <li>Ship the item back to us using the provided return label</li>
              <li>Once received and inspected, we will process your refund</li>
            </ol>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Refund Process</h2>
            <p className="text-gray-600 mb-4">
              Once your return is received and inspected, we will send you an email confirming the approval or rejection of your refund.
            </p>
            <p className="text-gray-600 mb-6">
              If approved, your refund will be processed and a credit will automatically be applied to your original payment method within 7-10 business days. Please note that depending on your bank, it may take an additional 2-5 business days for the refund to appear in your account.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Damaged or Defective Items</h2>
            <p className="text-gray-600 mb-4">
              If you receive a damaged, defective, or incorrect item, please contact us immediately. We will:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-6">
              <li>Investigate the issue with our delivery partners</li>
              <li>Process a full refund or send a replacement at no additional cost</li>
              <li>Arrange for return pickup at no cost to you</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Missing Items</h2>
            <p className="text-gray-600 mb-6">
              If you believe items are missing from your order, please contact us within 24 hours of delivery. We will investigate the issue and either send the missing items or provide a refund for those items.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Return Shipping Costs</h2>
            <p className="text-gray-600 mb-4">
              Return shipping costs depend on the reason for the return:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-6">
              <li><strong>Incorrect or damaged items:</strong> We cover return shipping costs</li>
              <li><strong>Change of mind for eligible non-perishable items:</strong> Customer bears return shipping costs</li>
              <li><strong>Incorrect delivery address:</strong> Customer bears return shipping costs</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Refund Methods</h2>
            <p className="text-gray-600 mb-6">
              Refunds will be issued to the original payment method used for the purchase:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-6">
              <li>Credit/Debit cards: Refunded to the original card (may take 5-10 business days to appear)</li>
              <li>Net Banking: Refunded to the original account (may take 5-7 business days)</li>
              <li>UPI: Refunded to the original UPI ID (may take 2-3 business days)</li>
              <li>Cash on Delivery: Refunded via bank transfer or store credit</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Store Credits</h2>
            <p className="text-gray-600 mb-6">
              At our discretion, we may offer store credits instead of refunds. Store credits have no expiration date and can be used for future purchases on our platform.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
            <p className="text-gray-600">
              If you have any questions about our Return & Refund Policy, please contact us:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mt-2">
              <li>By email: returns@freshmart.com</li>
              <li>By visiting this page on our website: www.freshmart.com/contact</li>
              <li>By phone number: +91 98765 43210</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}