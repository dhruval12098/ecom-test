"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "How do I place an order?",
      answer: "You can place an order by browsing our products, adding items to your cart, and proceeding to checkout. You'll need to provide shipping information and payment details to complete your purchase."
    },
    {
      question: "What are your delivery options?",
      answer: "We offer standard delivery within 3-5 business days and express delivery within 1-2 business days. Delivery options and costs will be displayed during checkout based on your location."
    },
    {
      question: "Can I modify or cancel my order?",
      answer: "You can modify or cancel your order as long as it hasn't been shipped. Contact our customer support team immediately if you need to make changes to your order."
    },
    {
      question: "What is your return policy?",
      answer: "We offer a 30-day return policy for unopened and unused products. Items must be in their original packaging. Contact our support team to initiate a return."
    },
    {
      question: "How do I track my order?",
      answer: "Once your order is shipped, you'll receive a tracking number via email. You can use this number on our website or with the carrier to track your shipment."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit and debit cards, net banking, UPI, and cash on delivery for eligible orders. Payment options will be displayed during checkout."
    },
    {
      question: "Are your products organic?",
      answer: "We source many organic products from certified farms. Look for the 'Organic Certified' badge on product listings to identify organic items."
    },
    {
      question: "How do I contact customer support?",
      answer: "You can reach our customer support team via email at support@freshmart.com, by phone at +91 98765 43210, or through our live chat feature available on our website."
    },
    {
      question: "Do you offer bulk discounts?",
      answer: "Yes, we offer special pricing for bulk orders. Please contact our sales team at sales@freshmart.com for more information and custom quotes."
    },
    {
      question: "How fresh are your products?",
      answer: "We prioritize freshness and work with local farmers and suppliers to ensure our products reach you within 24-48 hours of harvest. Most products have a shelf life of 5-7 days upon delivery."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions about shopping with us
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-12">
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search for answers..."
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <svg
              className="absolute left-4 top-4 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <button className="bg-white rounded-lg shadow-sm p-4 text-center hover:shadow-md transition-shadow">
            <div className="font-medium text-gray-900">Ordering</div>
            <div className="text-sm text-gray-600">12 Qs</div>
          </button>
          <button className="bg-white rounded-lg shadow-sm p-4 text-center hover:shadow-md transition-shadow">
            <div className="font-medium text-gray-900">Shipping</div>
            <div className="text-sm text-gray-600">8 Qs</div>
          </button>
          <button className="bg-white rounded-lg shadow-sm p-4 text-center hover:shadow-md transition-shadow">
            <div className="font-medium text-gray-900">Returns</div>
            <div className="text-sm text-gray-600">6 Qs</div>
          </button>
          <button className="bg-white rounded-lg shadow-sm p-4 text-center hover:shadow-md transition-shadow">
            <div className="font-medium text-gray-900">Products</div>
            <div className="text-sm text-gray-600">10 Qs</div>
          </button>
        </div>

        {/* Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <button
                className="w-full flex justify-between items-center p-6 text-left"
                onClick={() => toggleAccordion(index)}
              >
                <span className="text-lg font-medium text-gray-900">{faq.question}</span>
                <ChevronDown
                  className={`h-5 w-5 text-gray-500 transform transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6 pt-0">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-16 bg-white rounded-xl shadow-sm p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Still have questions?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Can't find the answer you're looking for? Reach out to our customer support team for personalized assistance.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors">
              Contact Support
            </button>
            <button className="border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Live Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}