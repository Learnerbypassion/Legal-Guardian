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

  // Normalize phone number (Original Logic Preserved)
  const normalizePhone = (phone) => {
    let cleaned = phone.replace(/[\s\-()]/g, '');
    let countryCode = '';
    let numberPart = '';
    
    if (cleaned.startsWith('+')) {
      const match = cleaned.match(/^\+(\d{1,3})(.+)/);
      if (match) {
        countryCode = match[1];
        numberPart = match[2];
      }
    } else if (cleaned.match(/^(\d{1,3})(.+)/)) {
      const match = cleaned.match(/^(\d{1,3})(.+)/);
      const potential = match[1];
      const rest = match[2];
      
      if ((potential.length <= 3 && potential.length >= 1) && (rest.length >= 7)) {
        countryCode = potential;
        numberPart = rest;
      } else {
        numberPart = cleaned;
      }
    } else {
      numberPart = cleaned;
    }
    
    if (!countryCode) {
      countryCode = '91';
    }
    
    return '+' + countryCode + numberPart;
  };

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
      await api.post('/auth/verify-reset-otp', {
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
    <div className="min-h-screen bg-gradient-to-br from-[#1B2F4E] via-[#0F172A] to-[#1B2F4E] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#8A6C2A] to-[#D4AF37] mb-2">
            LegalLens
          </h1>
          <p className="text-gray-400">Reset Your Security Credentials</p>
        </div>

        {/* Reset Card */}
        <div className="bg-white rounded-[24px] shadow-2xl p-8 border border-gray-100">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {step === 1 && (
            <>
              <h2 className="text-2xl font-bold text-[#1B2F4E] mb-1">Forgot Password?</h2>
              <p className="text-gray-500 text-sm mb-6">Request a secure reset code via your registered contact.</p>

              <form onSubmit={handleRequestReset} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-[#1B2F4E] mb-2">
                    Email or Phone Number
                  </label>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="your@email.com or 9876543210"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8A6C2A] focus:border-transparent transition"
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-[#1B2F4E] text-white font-black uppercase tracking-widest text-[11px] rounded-xl hover:bg-[#8A6C2A] shadow-lg transition-all disabled:opacity-70"
                >
                  {loading ? 'Processing...' : 'Send Reset Code'}
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-2xl font-bold text-[#1B2F4E] mb-1">Verify Identity</h2>
              <p className="text-gray-500 text-sm mb-6">Enter the verification code to proceed.</p>

              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-[#1B2F4E] mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                    placeholder="000000"
                    maxLength="6"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8A6C2A] focus:border-transparent transition text-center text-2xl tracking-[0.5em] font-mono"
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-[#1B2F4E] text-white font-black uppercase tracking-widest text-[11px] rounded-xl hover:bg-[#8A6C2A] transition-all disabled:opacity-70"
                >
                  {loading ? 'Verifying...' : 'Verify Code'}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={timer > 0}
                    className="text-xs font-bold text-[#8A6C2A] hover:text-[#1B2F4E] disabled:text-gray-400"
                  >
                    {timer > 0 ? `RESEND IN ${timer}S` : 'RESEND CODE'}
                  </button>
                </div>
              </form>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-2xl font-bold text-[#1B2F4E] mb-1">New Password</h2>
              <p className="text-gray-500 text-sm mb-6">Establish a new secure password for your account.</p>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-[#1B2F4E] mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8A6C2A] focus:border-transparent transition"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1B2F4E]"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-[#1B2F4E] mb-2">
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8A6C2A] focus:border-transparent transition"
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-[#1B2F4E] text-white font-black uppercase tracking-widest text-[11px] rounded-xl hover:bg-[#8A6C2A] transition-all disabled:opacity-70"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </>
          )}

          <p className="text-center text-gray-500 text-xs mt-8">
            Remembered your credentials?{' '}
            <Link to="/login" className="font-bold text-[#8A6C2A] hover:text-[#1B2F4E] transition uppercase tracking-tighter">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};