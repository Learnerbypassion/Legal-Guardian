import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Signup = () => {
  const [step, setStep] = useState(1); // 1: Register, 2: OTP Verification
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    name: '',
    password: '',
    confirmPassword: '',
    otp: '',
    role: 'user'
  });
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [timer, setTimer] = useState(0);
  const { register, verifyOTP, resendOTP, error, setError } = useAuth();
  const navigate = useNavigate();

  // OTP Timer
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone) => {
    // Accept phone with or without country code, with various formats
    return /^(\+\d{1,3})?[\d\s\-()]{9,}$/.test(phone);
  };

  const normalizePhone = (phone) => {
    // Remove spaces, dashes, parentheses
    let cleaned = phone.replace(/[\s\-()]/g, '');
    
    // Extract country code and number
    let countryCode = '';
    let numberPart = '';
    
    if (cleaned.startsWith('+')) {
      // Already has + prefix
      const match = cleaned.match(/^\+(\d{1,3})(.+)/);
      if (match) {
        countryCode = match[1];
        numberPart = match[2];
      }
    } else if (cleaned.match(/^(\d{1,3})(.+)/)) {
      // Might have country code without +
      const match = cleaned.match(/^(\d{1,3})(.+)/);
      const potential = match[1];
      const rest = match[2];
      
      // Check if it looks like a country code (1-3 digits, common ones: 1, 91, 44, 86, etc.)
      if ((potential.length <= 3 && potential.length >= 1) && (rest.length >= 7)) {
        countryCode = potential;
        numberPart = rest;
      } else {
        // No country code, use default
        numberPart = cleaned;
      }
    } else {
      numberPart = cleaned;
    }
    
    // If no country code detected, add India's default
    if (!countryCode) {
      countryCode = '91';
    }
    
    return '+' + countryCode + numberPart;
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name) {
      setError('Name is required');
      return;
    }
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!validatePhone(formData.phone)) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      const normalizedPhone = normalizePhone(formData.phone);
      const data = await register(formData.email, normalizedPhone, formData.name, formData.role);
      setUserId(data.userId);
      setTimer(60); // Start 60-second timer for OTP
      setStep(2);
    } catch (err) {
      // Error handled by context
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();

    if (!formData.otp) {
      setError('Please enter the OTP');
      return;
    }
    if (!formData.password) {
      setError('Please set a password');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await verifyOTP(userId, formData.otp, formData.password);
      navigate('/');
    } catch (err) {
      // Error handled by context
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      await resendOTP(userId);
      setTimer(60);
      setFormData(prev => ({ ...prev, otp: '' }));
    } catch (err) {
      // Error handled by context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8">
          <div className="text-center mb-2">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
              Legal-Tech
            </h1>
            <p className="text-gray-500">AI-Powered Document Analysis</p>
          </div>
        </div>

        {/* Signup Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {step === 1 ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Create Account</h2>
              <p className="text-gray-500 text-sm mb-6">Sign up to get started with document analysis</p>

              {/* Error Alert */}
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    disabled={loading}
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    disabled={loading}
                  />
                </div>

                {/* Phone Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">We'll send you an OTP via SMS</p>
                </div>

                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    I am a
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="role"
                        value="user"
                        checked={formData.role === 'user'}
                        onChange={handleChange}
                        className="mr-2 text-indigo-600 focus:ring-indigo-500"
                      />
                      User
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="role"
                        value="professional"
                        checked={formData.role === 'professional'}
                        onChange={handleChange}
                        className="mr-2 text-indigo-600 focus:ring-indigo-500"
                      />
                      Professional
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transition disabled:opacity-70 disabled:cursor-not-allowed mt-6"
                >
                  {loading ? 'Creating Account...' : 'Continue'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Verify Phone Number</h2>
              <p className="text-gray-500 text-sm mb-6">
                Enter the 6-digit code sent to <span className="font-semibold">{formData.phone}</span>
              </p>

              {/* Error Alert */}
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleOTPSubmit} className="space-y-4">
                {/* OTP Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    OTP Code
                  </label>
                  <input
                    type="text"
                    name="otp"
                    value={formData.otp}
                    onChange={handleChange}
                    placeholder="000000"
                    maxLength="6"
                    className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition font-mono"
                    disabled={loading}
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Min 8 characters"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    disabled={loading}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transition disabled:opacity-70 disabled:cursor-not-allowed mt-6"
                >
                  {loading ? 'Verifying...' : 'Create Account'}
                </button>

                {/* Resend OTP */}
                <div className="text-center pt-4">
                  {timer > 0 ? (
                    <p className="text-sm text-gray-500">
                      Resend code in <span className="font-semibold text-indigo-600">{timer}s</span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={loading}
                      className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition disabled:opacity-70"
                    >
                      Didn't receive the code? Resend
                    </button>
                  )}
                </div>

                {/* Back Button */}
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setError(null);
                    setFormData(prev => ({ ...prev, otp: '', password: '', confirmPassword: '' }));
                  }}
                  className="w-full mt-4 py-2 px-4 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
                >
                  Back
                </button>
              </form>
            </>
          )}

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-3 text-gray-400 text-sm">or</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Login Link */}
          <p className="text-center text-gray-600 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 transition">
              Sign in
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs mt-6">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};
