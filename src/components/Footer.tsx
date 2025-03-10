import React from 'react';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="https://www.urbancompany.com/about" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">About Us</a></li>
              <li><a href="https://www.urbancompany.com/terms" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">Terms & Conditions</a></li>
              <li><a href="https://www.urbancompany.com/privacy" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
              <li><a href="https://www.urbancompany.com/careers" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">Careers</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li><a href="/search?q=salon" className="text-gray-400 hover:text-white">Salon at Home</a></li>
              <li><a href="/search?q=cleaning" className="text-gray-400 hover:text-white">Home Cleaning</a></li>
              <li><a href="/search?q=appliance" className="text-gray-400 hover:text-white">Appliance Repair</a></li>
              <li><a href="/search?q=plumbing" className="text-gray-400 hover:text-white">Plumbing</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><a href="https://docs.google.com/forms/d/e/1FAIpQLSeC5m5izzSN4CS5RwcQhw59xjFLmNDPSTLU1_WUyNtrcpBLnQ/viewform?usp=dialog" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">Contact Us</a></li>
              <li><a href="https://www.urbancompany.com/faq" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">FAQs</a></li>
              <li><a href="https://www.urbancompany.com/blog" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">Blog</a></li>
              <li><a href="https://www.urbancompany.com/help" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">Help Center</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/urbancompany" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="https://twitter.com/urbancompany" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="https://www.instagram.com/urbancompany" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="https://www.youtube.com/urbancompany" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                <Youtube className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Urban Company Clone. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;