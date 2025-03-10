import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Truck, CreditCard, QrCode } from 'lucide-react';

const Checkout = () => {
  const { state, dispatch } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'qr' | 'cod'>('card');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('');

  // Generate a unique payment ID for QR code
  const paymentId = React.useMemo(() => Math.random().toString(36).substr(2, 9), []);
  const qrValue = `upi://pay?pa=merchant@upi&pn=UrbanCompany&am=${state.total}&tr=${paymentId}&cu=INR`;

  const handlePayment = async () => {
    if (paymentMethod === 'cod' && (!address || !pincode)) {
      toast.error('Please provide your complete address for Pay on Delivery');
      return;
    }

    setLoading(true);
    try {
      // Create bookings in the database
      for (const item of state.items) {
        const { error } = await supabase.from('bookings').insert({
          user_id: user?.id,
          service_title: item.title,
          service_price: item.price,
          booking_date: item.date,
          booking_time: item.time,
          status: paymentMethod === 'cod' ? 'pending' : 'confirmed',
          provider_name: item.provider.name,
          provider_phone: item.provider.phone,
          provider_location: item.provider.location || 'Not specified',
          payment_method: paymentMethod,
          delivery_address: paymentMethod === 'cod' ? `${address}, ${landmark || ''}, ${pincode}` : null
        });

        if (error) throw error;
      }
      
      dispatch({ type: 'CLEAR_CART' });
      
      if (paymentMethod === 'cod') {
        toast.success('Your order has been placed successfully! Pay on delivery.');
      } else {
        toast.success('Payment successful! Your services have been booked.');
      }
      
      navigate('/my-bookings');
    } catch (error: any) {
      toast.error('Payment failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (state.items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            {state.items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-gray-500">
                    {item.date} at {item.time}
                  </p>
                </div>
                <p className="font-semibold">{item.price}</p>
              </div>
            ))}
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-blue-600">₹{state.total}</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-6">Payment Method</h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setPaymentMethod('card')}
                className={`flex items-center px-4 py-3 rounded-lg border ${
                  paymentMethod === 'card'
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-gray-300'
                }`}
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Card Payment
              </button>
              <button
                onClick={() => setPaymentMethod('qr')}
                className={`flex items-center px-4 py-3 rounded-lg border ${
                  paymentMethod === 'qr'
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-gray-300'
                }`}
              >
                <QrCode className="h-5 w-5 mr-2" />
                UPI / QR Code
              </button>
              <button
                onClick={() => setPaymentMethod('cod')}
                className={`flex items-center px-4 py-3 rounded-lg border ${
                  paymentMethod === 'cod'
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-gray-300'
                }`}
              >
                <Truck className="h-5 w-5 mr-2" />
                Pay on Delivery
              </button>
            </div>

            {paymentMethod === 'card' ? (
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CVV
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </form>
            ) : paymentMethod === 'qr' ? (
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="p-4 bg-white rounded-lg shadow-lg">
                    <QRCodeSVG value={qrValue} size={200} />
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Scan this QR code with any UPI app to pay
                </p>
                <p className="font-medium">Amount: ₹{state.total}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  Please provide your address details for Pay on Delivery
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Complete Address
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    pattern="[0-9]{6}"
                    maxLength={6}
                  />
                </div>
              </div>
            )}

            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : paymentMethod === 'cod' 
                ? `Place Order - Pay ₹${state.total} on Delivery` 
                : `Pay ₹${state.total}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;