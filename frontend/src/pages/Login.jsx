import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { normalizePhoneForSubmit, getPhoneDisplayValue } from '../utils/phoneFormatter';

export const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handlePhoneChange = (e) => {
    const input = e.target.value;
    // Allow only digits and + symbol
    const cleaned = input.replace(/[^\d+]/g, '');
    setPhoneNumber(cleaned);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Auto-format phone number to include country code if missing
      const normalizedPhone = normalizePhoneForSubmit(phoneNumber);
      const success = await login(normalizedPhone, password);
      if (success) {
        navigate('/');
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('Login failed. Please check your connection or backend server.');
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
          <div className="mb-8 text-center">
            <h3 className="text-xl font-bold text-[#1B2F4E]">Welcome Back</h3>
            <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
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