import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';

export const EmailVerification = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get userId from location state
  const userId = location.state?.userId;
  const userEmail = location.state?.email;

  // Function to send email verification OTP
  const sendEmailVerificationOTP = async () => {
    try {
      await api.post('/auth/send-email-verification', {
        userId,
      });
    } catch (err) {
      console.log('OTP already sent or error:', err.response?.data?.error);
    }
  };

  useEffect(() => {
    // Redirect if no userId provided
    if (!userId) {
      navigate('/login');
    } else {
      // Send email verification OTP when page loads
      sendEmailVerificationOTP();
    }
  }, [userId, navigate]);

  // Timer for resend button
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    if (error) setError('');
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/verify-email', {
        userId,
        otp,
      });

      if (response.data.success) {
        // Email verified successfully
        navigate('/home', {
          state: { message: 'Email verified successfully! 🎉' }
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to verify email. Please try again.');
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/resend-email-verification', {
        userId,
      });

      if (response.data.success) {
        setCanResend(false);
        setTimer(60); // 60 seconds countdown
        setOtp('');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // User can skip email verification and continue
    navigate('/home');
  };

  return (
    /* Background changed to Navy gradient */
    <div className="min-h-screen bg-gradient-to-br from-[#1B2F4E] via-[#0F172A] to-[#1B2F4E] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8">
          <div className="text-center mb-2">
            /* Text changed to Gold accent */
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#8A6C2A] to-[#D4AF37] mb-2">
              LegalLens
            </h1>
            <p className="text-gray-400">AI-Powered Document Analysis</p>
          </div>
        </div>

        {/* Email Verification Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-[#1B2F4E] mb-1">Verify Your Email</h2>
          <p className="text-gray-500 text-sm mb-2">We've sent a verification code to:</p>
          /* Highlighted with Gold */
          <p className="text-[#8A6C2A] font-semibold mb-6">{userEmail || 'your email'}</p>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleVerifyEmail} className="space-y-4">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                Enter Verification Code
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={handleOtpChange}
                placeholder="000000"
                /* Focus ring changed to Gold */
                className="w-full px-4 py-3 text-2xl text-center font-mono tracking-widest border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A6C2A] focus:border-transparent transition disabled:bg-gray-50 disabled:cursor-not-allowed"
                maxLength="6"
                disabled={loading}
                autoComplete="off"
              />
              <p className="text-xs text-gray-500 mt-2">6-digit code from your email</p>
            </div>

            <button
              type="submit"
              /* Button changed to Navy */
              className="w-full py-3 px-4 bg-[#1B2F4E] text-white font-semibold rounded-lg hover:bg-[#16263f] transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || otp.length !== 6}
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>

          {/* Resend Section */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-gray-600 text-sm mb-3">Didn't receive the code?</p>
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={!canResend || loading}
              /* Link changed to Gold */
              className="text-[#8A6C2A] font-semibold text-sm hover:text-[#705822] hover:underline disabled:text-gray-400 disabled:cursor-not-allowed transition"
            >
              {canResend ? 'Resend Code' : `Resend in ${timer}s`}
            </button>
          </div>

          {/* Skip Button */}
          <button
            type="button"
            onClick={handleSkip}
            className="w-full mt-4 py-2 px-4 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            Skip for Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;