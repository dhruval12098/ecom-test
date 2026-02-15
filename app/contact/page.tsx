"use client"
import { useState, useEffect } from "react";
import { MapPin, Mail, Phone, Clock, Send, User, MessageSquare } from "lucide-react";
import ApiService from "@/lib/api";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const [formStatus, setFormStatus] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus("sending");

    try {
      await ApiService.submitContactMessage(formData);
      setFormStatus("success");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      });
      
      setTimeout(() => {
        setFormStatus("");
      }, 3000);
    } catch (error) {
      setFormStatus("error");
      setTimeout(() => {
        setFormStatus("");
      }, 3000);
    }
  };

  const [contactInfo, setContactInfo] = useState({
    visitStoreLines: ["123 Fresh Street, Andheri West", "Mumbai, Maharashtra 400001", "India"],
    emailLines: ["General: hello@freshmart.com", "Support: support@freshmart.com", "Partnership: partners@freshmart.com"],
    phoneLines: ["Customer Service: +91 1800-123-4567", "Order Support: +91 1800-123-4568", "Mon - Sat: 9:00 AM - 8:00 PM"],
    hoursLines: ["Monday - Saturday: 9:00 AM - 8:00 PM", "Sunday: 10:00 AM - 6:00 PM", "Delivery: 7 Days a Week"]
  });

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const info = await ApiService.getContactInfo();
        if (info) {
          setContactInfo({
            visitStoreLines: info.visit_store_lines || [],
            emailLines: info.email_lines || [],
            phoneLines: info.phone_lines || [],
            hoursLines: info.hours_lines || []
          });
        }
      } catch (error) {
        console.error('Error fetching contact info:', error);
      }
    };

    fetchContactInfo();
  }, []);

  const contactInfoCards = [
    {
      icon: <MapPin className="h-6 w-6 text-[#266000]" />,
      title: "Visit Our Store",
      details: contactInfo.visitStoreLines,
      link: null
    },
    {
      icon: <Mail className="h-6 w-6 text-[#266000]" />,
      title: "Email Us",
      details: contactInfo.emailLines,
      link: "mailto:hello@freshmart.com"
    },
    {
      icon: <Phone className="h-6 w-6 text-[#266000]" />,
      title: "Call Us",
      details: contactInfo.phoneLines,
      link: "tel:+911800123456"
    },
    {
      icon: <Clock className="h-6 w-6 text-[#266000]" />,
      title: "Business Hours",
      details: contactInfo.hoursLines,
      link: null
    }
  ];

  return (
      <div className="min-h-screen bg-white fade-in">
      {/* Hero Section */}
      <section className="w-full py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">Get in Touch</h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Have a question about our products or services? We're here to help! 
              Reach out to us and we'll get back to you as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information Cards */}
      <section className="w-full py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfoCards.map((info, index) => (
              <div 
                key={index} 
                className="bg-white border border-black rounded-2xl p-6 hover:border-[#266000] transition-colors duration-300"
              >
                <div className="w-14 h-14 bg-white border border-black rounded-full flex items-center justify-center mb-4">
                  {info.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{info.title}</h3>
                <div className="space-y-1">
                  {info.details.map((detail, idx) => (
                    <p key={idx} className="text-gray-600 text-sm leading-relaxed">
                      {detail}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="w-full py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Side - Form */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Send Us a Message</h2>
              <p className="text-gray-600 mb-8">
                Fill out the form below and our team will get back to you within 24 hours.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full bg-white border border-black rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-[#266000] transition-colors"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full bg-white border border-black rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-[#266000] transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full bg-white border border-black rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-[#266000] transition-colors"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-900 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full bg-white border border-black rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-[#266000] transition-colors"
                    placeholder="What is this regarding?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-900 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full bg-white border border-black rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-[#266000] transition-colors resize-none"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                {formStatus === "success" && (
                  <div className="bg-white border border-[#266000] rounded-xl p-4 text-[#266000] font-medium">
                    ✓ Thank you! Your message has been sent successfully.
                  </div>
                )}

                {formStatus === "error" && (
                  <div className="bg-white border border-red-500 rounded-xl p-4 text-red-600 font-medium">
                    Something went wrong. Please try again.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={formStatus === "sending"}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-4 rounded-xl font-bold text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {formStatus === "sending" ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right Side - Additional Info */}
            <div className="space-y-8">
              <div className="bg-white border border-black rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Choose FreshMart?</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#266000] flex items-center justify-center shrink-0 mt-1">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Fresh & Organic Products</h4>
                      <p className="text-gray-600 text-sm">Sourced directly from trusted local farmers</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#266000] flex items-center justify-center shrink-0 mt-1">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Fast Delivery</h4>
                      <p className="text-gray-600 text-sm">Same-day delivery available in select areas</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#266000] flex items-center justify-center shrink-0 mt-1">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Best Prices</h4>
                      <p className="text-gray-600 text-sm">Competitive pricing with no hidden charges</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#266000] flex items-center justify-center shrink-0 mt-1">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">24/7 Support</h4>
                      <p className="text-gray-600 text-sm">Our customer service team is always here to help</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-black rounded-2xl p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">What are your delivery areas?</h4>
                    <p className="text-gray-600 text-sm">We currently deliver across Mumbai and surrounding areas. Check your pincode at checkout.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">How can I track my order?</h4>
                    <p className="text-gray-600 text-sm">You'll receive a tracking link via SMS and email once your order is dispatched.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">What is your return policy?</h4>
                    <p className="text-gray-600 text-sm">We offer a 100% freshness guarantee. Contact us within 24 hours if you're not satisfied.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Location Map Section */}
      <section className="w-full py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Visit Our Store</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Come visit us at our flagship store in Mumbai. Our friendly staff is ready to help you find the freshest products.
            </p>
          </div>

          <div className="mx-auto" style={{width: '95%'}}>
            <div className="border border-black rounded-2xl overflow-hidden bg-white">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d241317.11609823277!2d72.74109995709658!3d19.082197840383346!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c6306644edc1%3A0x5da4ed8f8d648c69!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1234567890123!5m2!1sen!2sin"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="FreshMart Location"
              />
            </div>
            
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-white border border-black rounded-2xl p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of happy customers enjoying fresh, organic products delivered right to their doorstep.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 rounded-xl font-bold text-base transition-colors">
                Start Shopping
              </button>
              <button className="bg-white border border-black hover:border-[#266000] text-gray-900 px-8 py-3 rounded-xl font-bold text-base transition-colors">
                Browse Products
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}



