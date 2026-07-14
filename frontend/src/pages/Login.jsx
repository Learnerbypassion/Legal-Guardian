import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { normalizePhoneForSubmit } from '../utils/phoneFormatter';

export const Login = () => {
  const [loginMethod, setLoginMethod] = useState('phone'); // 'phone' | 'email'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Load Google Identity script dynamically
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '710925414754-5sdov85elu40d1fe41cuv500ddgibe9u.apps.googleusercontent.com',
          callback: handleGoogleCredentialResponse,
        });
        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-btn'),
          { theme: 'outline', size: 'large', width: '100%', text: 'signin_with' }
        );
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleGoogleCredentialResponse = async (response) => {
    setError('');
    setLoading(true);
    try {
      const data = await loginWithGoogle(response.credential);
      if (data) {
        navigate('/');
      }
    } catch (err) {
      console.error('Google OAuth error:', err);
      setError(err.message || 'Google Sign-In failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (e) => {
    const input = e.target.value;
    const cleaned = input.replace(/[^\d+]/g, '');
    setPhoneNumber(cleaned);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let identifier = '';
      if (loginMethod === 'phone') {
        identifier = normalizePhoneForSubmit(phoneNumber);
      } else {
        identifier = emailAddress.toLowerCase().trim();
      }

      const success = await login(identifier, password);
      if (success) {
        navigate('/');
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials or backend server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#1B2F4E] flex items-center justify-center shadow-lg">
            <img src="../logo.png" className="w-full h-full object-contain rounded-lg" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-[#1B2F4E]">
          Legal Guardian
        </h2>
        <p className="mt-2 text-center text-sm text-[#3D4F66] font-medium">
          AI-Powered Document Analysis
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-4 shadow-xl border border-[#CBD2DC] sm:rounded-2xl sm:px-10">
          
          {/* Method Tabs */}
          <div className="flex border-b border-gray-200 mb-8">
            <button
              type="button"
              onClick={() => { setLoginMethod('phone'); setError(''); }}
              className={`flex-1 pb-3 text-sm font-bold border-b-2 text-center transition-all ${
                loginMethod === 'phone'
                  ? 'border-[#1B2F4E] text-[#1B2F4E]'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              Phone Sign In
            </button>
            <button
              type="button"
              onClick={() => { setLoginMethod('email'); setError(''); }}
              className={`flex-1 pb-3 text-sm font-bold border-b-2 text-center transition-all ${
                loginMethod === 'email'
                  ? 'border-[#1B2F4E] text-[#1B2F4E]'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              Email Sign In
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {loginMethod === 'phone' ? (
              <div>
                <label className="block text-sm font-bold text-[#1B2F4E] mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-500 font-medium">+91</span>
                  <input
                    type="text"
                    placeholder="98765 43210"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    maxLength="10"
                    required
                    className="appearance-none block w-full pl-12 pr-4 py-3 border border-[#CBD2DC] rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8A6C2A] focus:border-transparent transition"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Country code +91 will be added automatically</p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-bold text-[#1B2F4E] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  required
                  className="appearance-none block w-full px-4 py-3 border border-[#CBD2DC] rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8A6C2A] focus:border-transparent transition"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-[#1B2F4E] mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="appearance-none block w-full px-4 py-3 border border-[#CBD2DC] rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8A6C2A] focus:border-transparent transition"
              />
            </div>

            <div className="flex items-center justify-end">
              <div className="text-sm">
                <Link to="/forgot-password" size="sm" className="font-bold text-[#8A6C2A] hover:text-[#1B2F4E] transition">
                  Forgot password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-[#1B2F4E] hover:bg-[#8A6C2A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1B2F4E] transition-all disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </div>
          </form>

          {/* Social login divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-400 font-medium">Or continue with</span>
              </div>
            </div>

            {/* Google button container */}
            <div className="mt-4 flex justify-center">
              <div id="google-signin-btn" className="w-full"></div>
            </div>
          </div>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-400 font-medium">New to Legal-Guardian?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/signup"
                className="w-full flex justify-center py-3 px-4 border-2 border-[#1B2F4E] rounded-xl text-sm font-bold text-[#1B2F4E] hover:bg-gray-50 transition"
              >
                Create an Account
              </Link>
            </div>
          </div>
        </div>
        
        <p className="mt-8 text-center text-xs text-gray-400">
          By signing in, you agree to our <span className="underline">Terms of Service</span> and <span className="underline">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
};