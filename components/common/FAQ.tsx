// components/FAQ.tsx
'use client';
import { useEffect, useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import ApiService from '@/lib/api';

type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

const FAQ = () => {
  const [openId, setOpenId] = useState<number | null>(null);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    ApiService.getFaqs(true).then((data) => {
      if (active) {
        setFaqs(data || []);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

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
          {loading ? (
            <div className="px-6 py-8 text-center text-gray-500">Loading FAQs...</div>
          ) : faqs.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">No FAQs available.</div>
          ) : (
            faqs.map((faq, index) => (
              <div key={faq.id}>
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400 font-mono text-sm">
                      [{String(index + 1).padStart(2, '0')}]
                    </span>
                    <h3 className="text-lg font-normal text-gray-800">
                      {faq.question}
                    </h3>
                  </div>
                  <div className="shrink-0 text-gray-600">
                    {openId === index ? (
                      <FaChevronUp className="text-lg" />
                    ) : (
                      <FaChevronDown className="text-lg" />
                    )}
                  </div>
                </button>
                
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openId === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
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
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
