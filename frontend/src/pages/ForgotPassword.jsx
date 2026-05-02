import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';

export const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Enter email/phone, 2: Verify OTP, 3: Reset password
  const [contact, setContact] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [timer, setTimer] = useState(0);
  const navigate = useNavigate();

  // Normalize phone number
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

  // Check if input is email or phone
  const isEmail = (input) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError(null);

    if (!contact) {
      setError('Please enter email or phone number');
      return;
    }

    setLoading(true);
    try {
      const payload = isEmail(contact)
        ? { email: contact }
        : { phone: normalizePhone(contact) };

      const response = await api.post('/auth/forgot-password', payload);
      setUserId(response.data.data.userId);
      setTimer(60);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError(null);

    if (!otp) {
      setError('Please enter the OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/verify-reset-otp', {
        userId,
        otp
      });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(null);

    if (!newPassword) {
      setError('Please enter new password');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        userId,
        otp,
        newPassword
      });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (timer > 0) return;
    setError(null);

    try {
      await api.post('/auth/resend-reset-otp', { userId });
      setTimer(60);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend OTP');
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
            <p className="text-gray-500">Reset Your Password</p>
          </div>
        </div>

        {/* Reset Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Enter Email/Phone */}
          {step === 1 && (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Forgot Password?</h2>
              <p className="text-gray-500 text-sm mb-6">Enter your email or phone number to receive a reset code</p>

              <form onSubmit={handleRequestReset} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email or Phone Number
                  </label>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="your@email.com or 9876543210"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transition disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send Reset Code'}
                </button>
              </form>
            </>
          )}

          {/* Step 2: Verify OTP */}
          {step === 2 && (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Verify Code</h2>
              <p className="text-gray-500 text-sm mb-6">Enter the code sent to your email or phone</p>

              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                    placeholder="000000"
                    maxLength="6"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-center text-2xl tracking-widest"
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transition disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying...' : 'Verify Code'}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={timer > 0}
                    className="text-sm text-indigo-600 hover:text-indigo-700 disabled:text-gray-400"
                  >
                    {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Step 3: Reset Password */}
          {step === 3 && (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Create New Password</h2>
              <p className="text-gray-500 text-sm mb-6">Enter your new password</p>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transition disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}

          {/* Back to Login */}
          <p className="text-center text-gray-600 text-sm mt-6">
            Remember your password?{' '}
            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 transition">
              Sign In
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs mt-6">
          By resetting your password, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};
