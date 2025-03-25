import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, Phone, BrainCog as BrandGoogle, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle, signInWithPhone, verifyOtp, user } = useAuth();

  React.useEffect(() => {
    if (user) {
      if (user.email === 'admin@urbancompany.com') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (authMethod === 'email') {
        if (isLogin) {
          await signIn(email, password);
          if (email === 'admin@urbancompany.com') {
            toast.success('Hamara__Service, Admin!');
          } else {
            toast.success('Successfully logged in!');
          }
        } else {
          await signUp(email, password);
          toast.success('Successfully signed up! Please check your email.');
        }
      } else if (authMethod === 'phone' && !showOtpInput) {
        await signInWithPhone(phone);
        setShowOtpInput(true);
        toast.success('OTP sent to your phone number!');
        setLoading(false);
        return;
      } else if (authMethod === 'phone' && showOtpInput) {
        await verifyOtp(phone, otp);
        toast.success('Successfully logged in!');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
    } catch (error: any) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all duration-700 ease-in-out animate__animated animate__fadeIn">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-blue-600">
              {isAdmin ? 'Admin Login' : (isLogin ? 'Hamara_Service' : 'Create Account')}
            </h2>
            <button
              onClick={() => {
                setIsAdmin(!isAdmin);
                setAuthMethod('email');
                setShowOtpInput(false);
                setEmail('');
                setPassword('');
              }}
              className="text-blue-600 hover:text-blue-700 flex items-center"
            >
              <LayoutDashboard className="h-5 w-5 mr-1" />
              {isAdmin ? 'User Login' : 'Admin Login'}
            </button>
          </div>

          {!isAdmin && (
            <div className="flex justify-center space-x-4 mb-6 animate__animated animate__fadeIn animate__delay-1s">
              <button
                onClick={() => {
                  setAuthMethod('email');
                  setShowOtpInput(false);
                }}
                className={`px-4 py-2 rounded-lg ${authMethod === 'email' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                Email
              </button>
              <button
                onClick={() => {
                  setAuthMethod('phone');
                  setShowOtpInput(false);
                }}
                className={`px-4 py-2 rounded-lg ${authMethod === 'phone' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                Phone
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 animate__animated animate__fadeIn animate__delay-2s">
            {(isAdmin || authMethod === 'email') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      placeholder={isAdmin ? 'admin@urbancompany.com' : 'Enter your email'}
                    />
                    <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      minLength={6}
                    />
                    <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </>
            )}

            {!isAdmin && authMethod === 'phone' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      pattern="[0-9]{10}"
                      placeholder="Enter 10 digit number"
                    />
                    <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                {showOtpInput && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">OTP</label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      pattern="[0-9]{6}"
                      placeholder="Enter 6 digit OTP"
                    />
                  </div>
                )}
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : showOtpInput ? (
                'Verify OTP'
              ) : authMethod === 'phone' ? (
                'Send OTP'
              ) : (
                isAdmin ? 'Login as Admin' : (isLogin ? 'Login' : 'Sign Up')
              )}
            </button>

            {!isAdmin && authMethod === 'email' && (
              <p className="text-center text-sm text-gray-600">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-blue-600 hover:underline font-medium"
                >
                  {isLogin ? 'Sign Up' : 'Login'}
                </button>
              </p>
            )}
          </form>

          {!isAdmin && (
            <div className="mt-6 animate__animated animate__fadeIn animate__delay-3s">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="mt-6 w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <BrandGoogle className="h-5 w-5 text-red-500 mr-2" />
                Sign in with Google
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
