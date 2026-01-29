export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms and Conditions</h1>
          <p className="text-gray-600">Last updated: January 26, 2026</p>
        </div>

        <div className="bg-white border border-black rounded-2xl p-8">
          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-600 mb-6">
              Welcome to FreshMart! These terms and conditions outline the rules and regulations for the use of FreshMart's website and services.
            </p>
            <p className="text-gray-600 mb-6">
              By accessing this website and placing an order, we assume you accept these terms and conditions. Do not continue to use FreshMart if you do not agree to take all of the terms and conditions stated on this page.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Eligibility</h2>
            <p className="text-gray-600 mb-6">
              By using our Service, you represent and warrant that you are at least 18 years of age and capable of entering into legally binding agreements. If you are using the Service on behalf of an organization, you represent and warrant that you have authority to bind that organization to these Terms.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Information</h2>
            <p className="text-gray-600 mb-4">
              We strive to provide accurate product descriptions and pricing information. However, we do not warrant that product descriptions or other content on our Service is accurate, complete, reliable, current, or error-free.
            </p>
            <p className="text-gray-600 mb-6">
              We reserve the right to correct any pricing or descriptive errors, and we may suspend or cancel orders related to such errors without liability.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Acceptance and Cancellation</h2>
            <p className="text-gray-600 mb-4">
              All orders placed through our Service are subject to acceptance by us. We may choose not to accept orders at our sole discretion or may limit quantities available for purchase.
            </p>
            <p className="text-gray-600 mb-6">
              You may cancel your order within 24 hours of placement without penalty, provided the order has not yet been processed for shipment. After that time, cancellation is subject to our return policy.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Pricing and Payment</h2>
            <p className="text-gray-600 mb-4">
              Prices for our products are subject to change without notice. We reserve the right to modify prices at any time.
            </p>
            <p className="text-gray-600 mb-6">
              We accept various forms of payment as indicated on our checkout page. You represent and warrant that you have the legal right to use any payment method utilized in connection with any transaction on our Service.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Shipping and Delivery</h2>
            <p className="text-gray-600 mb-4">
              We aim to process and ship your order within 1-2 business days of receiving it. Delivery times depend on your location and the shipping method selected.
            </p>
            <p className="text-gray-600 mb-6">
              Risk of loss and title for items purchased pass to you upon delivery to the carrier. We are not responsible for delays caused by circumstances beyond our control.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Returns and Refunds</h2>
            <p className="text-gray-600 mb-4">
              Due to the nature of perishable goods, we have a limited return policy. Non-perishable items may be returned within 30 days of delivery for a full refund, provided they are in original condition and packaging.
            </p>
            <p className="text-gray-600 mb-6">
              Perishable items are not eligible for return unless they arrive damaged or spoiled. In such cases, please contact us within 24 hours of delivery.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Intellectual Property</h2>
            <p className="text-gray-600 mb-4">
              The Service and its original content, features, and functionality are owned by FreshMart and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
            </p>
            <p className="text-gray-600 mb-6">
              You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our Service except as specifically permitted by these Terms.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Limitation of Liability</h2>
            <p className="text-gray-600 mb-4">
              In no event shall FreshMart, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses resulting from your access to or use of or inability to access or use the Service.
            </p>
            <p className="text-gray-600 mb-6">
              Our aggregate liability to you for any claims arising out of or related to these Terms or the Service shall not exceed the amount you paid to us in the six months preceding the claim.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Governing Law</h2>
            <p className="text-gray-600 mb-6">
              These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to Terms</h2>
            <p className="text-gray-600 mb-4">
              We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect.
            </p>
            <p className="text-gray-600 mb-6">
              By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use the Service.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-600">
              If you have any questions about these Terms and Conditions, please contact us:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mt-2">
              <li>By email: legal@freshmart.com</li>
              <li>By visiting this page on our website: www.freshmart.com/contact</li>
              <li>By phone number: +91 98765 43210</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}