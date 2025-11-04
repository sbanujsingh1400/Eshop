import React from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-800 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* --- Main Footer Section (4-column grid) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          
          {/* Column 1: Brand and Social */}
          <div className="md:col-span-3 lg:col-span-1">
            <h2 className="text-2xl font-bold text-white mb-4">Eshop</h2>
            <p className="text-sm max-w-xs">
              Your one-stop shop for the latest trends and exclusive collections. Quality and customer satisfaction are our top priorities.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" aria-label="Facebook" className="text-slate-400 hover:text-white transition-colors duration-200">
                <Facebook size={24} />
              </a>
              <a href="#" aria-label="Instagram" className="text-slate-400 hover:text-white transition-colors duration-200">
                <Instagram size={24} />
              </a>
              <a href="#" aria-label="Twitter" className="text-slate-400 hover:text-white transition-colors duration-200">
                <Twitter size={24} />
              </a>
            </div>
          </div>
          
          {/* Column 2: Shop Links */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Shop</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/products" className="text-sm hover:text-white transition-colors duration-200">Products</Link></li>
              <li><Link href="/offers" className="text-sm hover:text-white transition-colors duration-200">Offers</Link></li>
              <li><Link href="/shops" className="text-sm hover:text-white transition-colors duration-200">Shops</Link></li>
              <li><Link href="/become-a-seller" className="text-sm hover:text-white transition-colors duration-200">Become a Seller</Link></li>
            </ul>
          </div>
          
          {/* Column 3: Information Links */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Information</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/about" className="text-sm hover:text-white transition-colors duration-200">About Us</Link></li>
              <li><Link href="/contact" className="text-sm hover:text-white transition-colors duration-200">Contact Us</Link></li>
              <li><Link href="/faq" className="text-sm hover:text-white transition-colors duration-200">FAQ</Link></li>
              <li><Link href="/privacy-policy" className="text-sm hover:text-white transition-colors duration-200">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Subscribe</h3>
            <p className="mt-4 text-sm">
              Get the latest deals and special offers.
            </p>
            <form className="mt-4 flex flex-col sm:flex-row gap-2">
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input 
                type="email" 
                name="email-address" 
                id="email-address" 
                autoComplete="email" 
                required 
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Enter your email" 
              />
              <button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md text-sm transition-colors duration-200 flex-shrink-0"
              >
                Subscribe
              </button>
            </form>
          </div>
          
        </div>
        
        {/* --- Bottom Bar --- */}
        <div className="mt-12 border-t border-slate-700 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-slate-400">&copy; 2025 Eshop. All rights reserved.</p>
          
          <div className="flex space-x-2 mt-4 md:mt-0">
            {/* Placeholder Payment Icons */}
            <div className="h-8 w-12 bg-slate-700 rounded-md flex items-center justify-center text-xs font-bold text-white">Visa</div>
            <div className="h-8 w-12 bg-slate-700 rounded-md flex items-center justify-center text-xs font-bold text-white">MC</div>
            <div className="h-8 w-12 bg-slate-700 rounded-md flex items-center justify-center text-xs font-bold text-white">PayPal</div>
          </div>
        </div>
        
      </div>
    </footer>
  );
};

export default Footer;