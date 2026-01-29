// components/FAQ.tsx
'use client';
import { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const faqs = [
  {
    id: 1,
    question: 'What is the minimum order amount for free shipping?',
    answer: 'We offer free shipping throughout Europe for orders over €69. For orders below this amount, standard shipping fees apply based on your location.',
  },
  {
    id: 2,
    question: 'How long does delivery take?',
    answer: 'Delivery times vary depending on your location. Typically, orders are delivered within 3-7 business days across Europe. You will receive a tracking number once your order is dispatched.',
  },
  {
    id: 3,
    question: 'Are all your products authentic Indian products?',
    answer: 'Yes, absolutely! We source all our products directly from trusted suppliers in India to ensure authenticity. Our selection includes over 200 genuine Indian food items, spices, and household products.',
  },
  {
    id: 4,
    question: 'Do you offer bulk discounts?',
    answer: 'Yes, we regularly offer fantastic discounts on our entire range. Subscribe to our newsletter to stay updated on special promotions and bulk order discounts.',
  },
  {
    id: 5,
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit and debit cards, PayPal, and bank transfers. All transactions are secure and encrypted for your safety.',
  },
  {
    id: 6,
    question: 'Can I return products if I\'m not satisfied?',
    answer: 'Yes, we have a 14-day return policy for unopened products in their original packaging. Please contact our customer service team to initiate a return.',
  },
  {
    id: 7,
    question: 'How do I store Indian spices to maintain freshness?',
    answer: 'Store spices in airtight containers in a cool, dry place away from direct sunlight. Whole spices can last up to 2 years, while ground spices maintain their best flavor for about 6-12 months.',
  },
  {
    id: 8,
    question: 'Do you ship to all European countries?',
    answer: 'We ship to most European countries. During checkout, you can enter your postal code to confirm delivery availability to your area.',
  },
];

const FAQ = () => {
  const [openId, setOpenId] = useState<number | null>(null);

  const toggleFAQ = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="w-full mx-auto my-16 py-8 px-4 md:px-8 lg:px-16">
      <div className="max-w-full mx-auto">
        <h2 className="text-4xl font-bold text-gray-800 mb-4 text-center">
          Frequently Asked Questions
        </h2>
        <p className="text-gray-600 text-center mb-10">
          Find answers to common questions about our products and services
        </p>
        
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          {faqs.map((faq, index) => (
            <div key={faq.id}>
              <button
                onClick={() => toggleFAQ(faq.id)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-center gap-4">
                  <span className="text-gray-400 font-mono text-sm">
                    [0{faq.id}]
                  </span>
                  <h3 className="text-lg font-normal text-gray-800">
                    {faq.question}
                  </h3>
                </div>
                <div className="shrink-0 text-gray-600">
                  {openId === faq.id ? (
                    <FaChevronUp className="text-lg" />
                  ) : (
                    <FaChevronDown className="text-lg" />
                  )}
                </div>
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openId === faq.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-6 pb-4 pl-20 text-gray-600 leading-relaxed">
                  {faq.answer}
                </div>
              </div>
              
              {index < faqs.length - 1 && (
                <div className="border-b border-gray-300" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;