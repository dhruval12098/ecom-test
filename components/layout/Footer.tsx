// components/Footer.tsx
'use client';
import { FaFacebookF, FaTwitter, FaPinterestP, FaInstagram, FaYoutube } from 'react-icons/fa';
import { SiVisa, SiMastercard, SiAmericanexpress, SiPaypal } from 'react-icons/si';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-[#266000] text-white rounded-t-3xl">
      {/* Main Footer Content */}
      <div className="w-full px-4 md:px-8 lg:px-16 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Brand Section - Takes more space */}
          <div className="lg:col-span-4">
            <h2 className="text-3xl font-bold mb-6">Our Company</h2>
            <p className="text-gray-300 text-sm leading-relaxed mb-8">
              Your trusted source for authentic Indian foods throughout Europe. Bringing the taste of India to your kitchen.
            </p>
            
            {/* Social Media Icons */}
            <div className="flex gap-3">
              <a href="#" className="bg-white/20 hover:bg-white/30 p-3 rounded-full transition-colors duration-200">
                <FaFacebookF className="text-white text-lg" />
              </a>
              <a href="#" className="bg-white/20 hover:bg-white/30 p-3 rounded-full transition-colors duration-200">
                <FaTwitter className="text-white text-lg" />
              </a>
              <a href="#" className="bg-white/20 hover:bg-white/30 p-3 rounded-full transition-colors duration-200">
                <FaPinterestP className="text-white text-lg" />
              </a>
              <a href="#" className="bg-white/20 hover:bg-white/30 p-3 rounded-full transition-colors duration-200">
                <FaInstagram className="text-white text-lg" />
              </a>
              <a href="#" className="bg-white/20 hover:bg-white/30 p-3 rounded-full transition-colors duration-200">
                <FaYoutube className="text-white text-lg" />
              </a>
            </div>
          </div>

          {/* Right Side - All other sections */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Section */}
            <div>
              <h3 className="text-xl font-semibold mb-6">Company</h3>
              <ul className="space-y-4">
                <li>
                  <Link href="/about" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm inline-flex items-center gap-2 group">
                    <span>About Us</span>
                    <ArrowUpRight className="w-3 h-3 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm inline-flex items-center gap-2 group">
                    <span>Contact Us</span>
                    <ArrowUpRight className="w-3 h-3 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm inline-flex items-center gap-2 group">
                    <span>Career</span>
                    <ArrowUpRight className="w-3 h-3 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Customer Services Section */}
            <div>
              <h3 className="text-xl font-semibold mb-6">Customer Services</h3>
              <ul className="space-y-4">
                <li>
                  <Link href="/account" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                    My Account
                  </Link>
                </li>
                <li>
                  <Link href="/my-orders" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                    Track Your Order
                  </Link>
                </li>
                <li>
                  <Link href="/returns" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                    Return
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Our Information Section */}
            <div>
              <h3 className="text-xl font-semibold mb-6">Our Information</h3>
              <ul className="space-y-4">
                <li>
                  <Link href="/privacy-policy" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms-and-conditions" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                    User Terms & Condition
                  </Link>
                </li>
                <li>
                  <Link href="/returns" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                    Return Policy
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info Section */}
            <div>
              <h3 className="text-xl font-semibold mb-6">Contact Info</h3>
              <ul className="space-y-4 text-gray-300 text-sm">
                <li>+0123-456-789</li>
                <li>example@gmail.com</li>
                <li className="leading-relaxed">
                  8502 Preston Rd.<br />
                  Inglewood, Maine<br />
                  98380
                </li>
              </ul>
              
              {/* Secure Payment Section */}
              <div className="mt-8">
                <h4 className="text-sm font-semibold mb-4">Secure Payment</h4>
                <div className="flex gap-2 flex-wrap">
                  <div className="bg-white rounded px-2.5 py-1.5">
                    <SiVisa className="text-blue-600 text-2xl" />
                  </div>
                  <div className="bg-white rounded px-2.5 py-1.5">
                    <SiMastercard className="text-red-600 text-2xl" />
                  </div>
                  <div className="bg-white rounded px-2.5 py-1.5">
                    <SiAmericanexpress className="text-blue-500 text-2xl" />
                  </div>
                  <div className="bg-white rounded px-2.5 py-1.5">
                    <SiPaypal className="text-blue-700 text-2xl" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Bar - Black Background */}
      <div className="bg-white py-5 px-4 md:px-8 lg:px-16">
        <div className="text-center">
          <p className="text-black text-sm font-medium">
            Copyright © 2024 My Company FOOD. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;