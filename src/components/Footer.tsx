import React, { useState } from 'react';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { supabase } from '../lib/supabase'; // Ensure this is correctly configured

const Footer = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showForm, setShowForm] = useState(false); // State to toggle form visibility

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');

    try {
      const { error } = await supabase.from('contact_us').insert([
        {
          name: formData.name,
          email: formData.email,
          message: formData.message,
        },
      ]);

      if (error) throw error;

      setSuccessMessage('Thank you! Your message has been sent.');
      setFormData({ name: '', email: '', message: '' });
      setShowForm(false); // Hide form after successful submission
    } catch (error: any) {
      console.error('Error submitting form:', error.message);
      setSuccessMessage('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white">About Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Terms & Conditions</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Careers</a></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white">Salon at Home</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Home Cleaning</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Appliance Repair</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Plumbing</a></li>
            </ul>
          </div>

          {/* Contact Us (Toggle Form) */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => setShowForm(!showForm)} 
                  className="text-gray-400 hover:text-white"
                >
                  Contact Us
                </button>
              </li>
              <li><a href="#" className="text-gray-400 hover:text-white">FAQs</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Help Center</a></li>
            </ul>

            {/* Contact Form (Hidden until clicked) */}
            {showForm && (
              <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4">Send Us a Message</h3>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <input
                    type="text"
                    name="name"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded"
                    required
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded"
                    required
                  />
                  <textarea
                    name="message"
                    placeholder="Your Message"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded"
                    disabled={loading}
                  >
                    {loading ? 'Submitting...' : 'Send Message'}
                  </button>
                </form>
                {successMessage && <p className="text-green-400 mt-2">{successMessage}</p>}
              </div>
            )}
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
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
