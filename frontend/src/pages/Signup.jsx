import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { normalizePhoneForSubmit } from '../utils/phoneFormatter';

export const Signup = () => {
  const [signupMethod, setSignupMethod] = useState('phone'); // 'phone' | 'email'
  
  // Phone signup state steps: 1: Register, 2: OTP Verification, 3: Set Password
  const [phoneStep, setPhoneStep] = useState(1); 
  
  // Email signup state steps: 1: Register, 2: Email OTP Verification
  const [emailStep, setEmailStep] = useState(1);

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    name: '',
    password: '',
    confirmPassword: '',
    phoneOtp: '',
    emailOtp: '',
    role: 'user'
  });
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [timer, setTimer] = useState(0);

  const { 
    register, 
    verifyOTP, 
    setPassword, 
    resendOTP, 
    registerEmail, 
    verifyEmailSignup, 
    loginWithGoogle,
    error, 
    setError 
  } = useAuth();
  const navigate = useNavigate();

  // OTP Timer Logic
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Load Google Identity script dynamically for Google Sign-Up
  useEffect(() => {
    if (phoneStep !== 1 && signupMethod === 'phone') return;
    if (emailStep !== 1 && signupMethod === 'email') return;

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
          document.getElementById('google-signup-btn'),
          { theme: 'outline', size: 'large', width: '100%', text: 'signup_with' }
        );
      }
    };

    return () => {
      try {
        document.body.removeChild(script);
      } catch (e) {
        // Safe check in case script was already removed
      }
    };
  }, [phoneStep, emailStep, signupMethod]);

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
      setError(err.message || 'Google Sign-Up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const cleaned = value.replace(/[^\d+]/g, '');
      setFormData(prev => ({ ...prev, [name]: cleaned }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (error) setError(null);
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone) => {
    return /^(\+\d{1,3})?[\d\s\-()]{9,}$/.test(phone);
  };

  // ── Phone Registration Flow ───────────────────────────────────────
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

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
      const normalizedPhone = normalizePhoneForSubmit(formData.phone);
      const data = await register(formData.email, normalizedPhone, formData.name, formData.role);
      setUserId(data.userId);
      setTimer(60);
      setPhoneStep(2);
    } catch (err) {
      // Handled by context
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneOTPSubmit = async (e) => {
    e.preventDefault();

    if (!formData.phoneOtp) {
      setError('Please enter the Phone OTP');
      return;
    }

    setLoading(true);
    try {
      await verifyOTP(userId, formData.phoneOtp, formData.emailOtp || null);
      setPhoneStep(3);
    } catch (err) {
      // Handled by context
    } finally {
      setLoading(false);
    }
  };

  const handleSkipEmail = async () => {
    if (!formData.phoneOtp) {
      setError('Phone OTP is required even if skipping email');
      return;
    }

    setLoading(true);
    try {
      await verifyOTP(userId, formData.phoneOtp, null);
      setPhoneStep(3);
    } catch (err) {
      // Handled by context
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

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
      await setPassword(userId, formData.password);
      navigate('/');
    } catch (err) {
      // Handled by context
    } finally {
      setLoading(false);
    }
  };

  // ── Email Registration Flow ────────────────────────────────────────
  const handleEmailRegisterSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name) {
      setError('Name is required');
      return;
    }
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
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
      const data = await registerEmail(formData.email.toLowerCase().trim(), formData.password, formData.name, formData.role);
      setUserId(data.userId);
      setTimer(60);
      setEmailStep(2);
    } catch (err) {
      // Handled by context
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignupOTPSubmit = async (e) => {
    e.preventDefault();

    if (!formData.emailOtp) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    setLoading(true);
    try {
      await verifyEmailSignup(userId, formData.emailOtp);
      navigate('/');
    } catch (err) {
      // Handled by context
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTPHandler = async () => {
    setLoading(true);
    try {
      await resendOTP(userId);
      setTimer(60);
      setFormData(prev => ({ ...prev, phoneOtp: '', emailOtp: '' }));
    } catch (err) {
      // Handled by context
    } finally {
      setLoading(false);
    }
  };

  const isStepOne = (signupMethod === 'phone' && phoneStep === 1) || (signupMethod === 'email' && emailStep === 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B2F4E] via-[#0F172A] to-[#1B2F4E] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 mt-4 text-center">
          <div className="flex justify-center mb-2">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden">
              <img src="../logo.png" alt="Logo" className="w-14 h-14 object-contain rounded-2xl" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#8A6C2A] to-[#D4AF37] mb-2">
            Legal Guardian
          </h1>
          <p className="text-gray-400 text-sm font-medium">AI-Powered Document Analysis</p>
        </div>

        {/* Signup Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          
          {/* Method Tabs - Only visible on Step 1 */}
          {isStepOne && (
            <div className="flex border-b border-gray-200 mb-6">
              <button
                type="button"
                onClick={() => { setSignupMethod('phone'); setError(''); }}
                className={`flex-1 pb-3 text-sm font-bold border-b-2 text-center transition-all ${
                  signupMethod === 'phone'
                    ? 'border-[#1B2F4E] text-[#1B2F4E]'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                Phone Verification
              </button>
              <button
                type="button"
                onClick={() => { setSignupMethod('email'); setError(''); }}
                className={`flex-1 pb-3 text-sm font-bold border-b-2 text-center transition-all ${
                  signupMethod === 'email'
                    ? 'border-[#1B2F4E] text-[#1B2F4E]'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                Email Signup
              </button>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* ── PHONE FLOW ── */}
          {signupMethod === 'phone' && (
            <>
              {phoneStep === 1 && (
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A6C2A] focus:border-transparent transition"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A6C2A] focus:border-transparent transition"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-gray-500 font-medium">+91</span>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="98765 43210"
                        maxLength="10"
                        required
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A6C2A] focus:border-transparent transition"
                        disabled={loading}
                      />
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">We'll send you an OTP via SMS to verify</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">I am a</label>
                    <div className="flex gap-4">
                      <label className="flex items-center text-[#1B2F4E] font-medium cursor-pointer">
                        <input
                          type="radio"
                          name="role"
                          value="user"
                          checked={formData.role === 'user'}
                          onChange={handleChange}
                          className="mr-2 accent-[#1B2F4E]"
                        />
                        User
                      </label>
                      <label className="flex items-center text-[#1B2F4E] font-medium cursor-pointer">
                        <input
                          type="radio"
                          name="role"
                          value="professional"
                          checked={formData.role === 'professional'}
                          onChange={handleChange}
                          className="mr-2 accent-[#1B2F4E]"
                        />
                        Professional
                      </label>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-[#1B2F4E] text-white font-semibold rounded-lg hover:bg-[#16263f] shadow-lg transition disabled:opacity-70 mt-6"
                  >
                    {loading ? 'Registering...' : 'Continue'}
                  </button>
                </form>
              )}

              {phoneStep === 2 && (
                <form onSubmit={handlePhoneOTPSubmit} className="space-y-4">
                  <h2 className="text-xl font-bold text-[#1B2F4E] mb-1">Verify Your Identity</h2>
                  <p className="text-gray-500 text-xs mb-4">Enter the 6-digit codes sent to your phone and email.</p>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Phone OTP ({formData.phone})</label>
                    <input
                      type="text"
                      name="phoneOtp"
                      value={formData.phoneOtp}
                      onChange={handleChange}
                      placeholder="000000"
                      maxLength="6"
                      required
                      className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A6C2A] focus:border-transparent transition font-mono"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email OTP ({formData.email}) <span className="text-gray-400 font-normal">(Optional)</span></label>
                    <input
                      type="text"
                      name="emailOtp"
                      value={formData.emailOtp}
                      onChange={handleChange}
                      placeholder="000000"
                      maxLength="6"
                      className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A6C2A] focus:border-transparent transition font-mono"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-3 mt-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 px-4 bg-[#1B2F4E] text-white font-semibold rounded-lg hover:bg-[#16263f] shadow-lg transition"
                    >
                      {loading ? 'Verifying...' : 'Verify Codes'}
                    </button>
                    <button
                      type="button"
                      onClick={handleSkipEmail}
                      disabled={loading}
                      className="w-full py-3 px-4 border border-[#1B2F4E] text-[#1B2F4E] font-semibold rounded-lg hover:bg-blue-50 transition"
                    >
                      Verify Phone & Skip Email
                    </button>
                  </div>
                  <div className="text-center pt-4">
                    {timer > 0 ? (
                      <p className="text-xs text-gray-500">Resend code in <span className="font-semibold text-[#8A6C2A]">{timer}s</span></p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOTPHandler}
                        className="text-xs font-semibold text-[#8A6C2A] hover:underline"
                      >
                        Didn't receive codes? Resend
                      </button>
                    )}
                  </div>
                </form>
              )}

              {phoneStep === 3 && (
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <h2 className="text-xl font-bold text-[#1B2F4E] mb-1">Set Password</h2>
                  <p className="text-gray-500 text-xs mb-4">Secure your account with a password.</p>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Min 8 characters"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A6C2A] focus:border-transparent transition"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Confirm Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm password"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A6C2A] focus:border-transparent transition"
                      disabled={loading}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-[#1B2F4E] text-white font-semibold rounded-lg hover:bg-[#16263f] shadow-lg transition mt-6"
                  >
                    {loading ? 'Saving...' : 'Complete Signup'}
                  </button>
                </form>
              )}
            </>
          )}

          {/* ── EMAIL FLOW ── */}
          {signupMethod === 'email' && (
            <>
              {emailStep === 1 && (
                <form onSubmit={handleEmailRegisterSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A6C2A] focus:border-transparent transition"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A6C2A] focus:border-transparent transition"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Min 8 characters"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A6C2A] focus:border-transparent transition"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Confirm Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm password"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A6C2A] focus:border-transparent transition"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">I am a</label>
                    <div className="flex gap-4">
                      <label className="flex items-center text-[#1B2F4E] font-medium cursor-pointer">
                        <input
                          type="radio"
                          name="role"
                          value="user"
                          checked={formData.role === 'user'}
                          onChange={handleChange}
                          className="mr-2 accent-[#1B2F4E]"
                        />
                        User
                      </label>
                      <label className="flex items-center text-[#1B2F4E] font-medium cursor-pointer">
                        <input
                          type="radio"
                          name="role"
                          value="professional"
                          checked={formData.role === 'professional'}
                          onChange={handleChange}
                          className="mr-2 accent-[#1B2F4E]"
                        />
                        Professional
                      </label>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-[#1B2F4E] text-white font-semibold rounded-lg hover:bg-[#16263f] shadow-lg transition mt-6"
                  >
                    {loading ? 'Registering...' : 'Sign Up'}
                  </button>
                </form>
              )}

              {emailStep === 2 && (
                <form onSubmit={handleEmailSignupOTPSubmit} className="space-y-4">
                  <h2 className="text-xl font-bold text-[#1B2F4E] mb-1">Verify Email</h2>
                  <p className="text-gray-500 text-xs mb-4">Please enter the 6-digit verification code sent to <strong>{formData.email}</strong>.</p>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Verification Code</label>
                    <input
                      type="text"
                      name="emailOtp"
                      value={formData.emailOtp}
                      onChange={handleChange}
                      placeholder="000000"
                      maxLength="6"
                      required
                      className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A6C2A] focus:border-transparent transition font-mono"
                      disabled={loading}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-[#1B2F4E] text-white font-semibold rounded-lg hover:bg-[#16263f] shadow-lg transition mt-6"
                  >
                    {loading ? 'Verifying...' : 'Verify & Log In'}
                  </button>
                  <div className="text-center pt-4">
                    {timer > 0 ? (
                      <p className="text-xs text-gray-500">Resend code in <span className="font-semibold text-[#8A6C2A]">{timer}s</span></p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOTPHandler}
                        className="text-xs font-semibold text-[#8A6C2A] hover:underline"
                      >
                        Didn't receive the code? Resend
                      </button>
                    )}
                  </div>
                </form>
              )}
            </>
          )}

          {/* ── Social Signup (Google) ── */}
          {isStepOne && (
            <>
              <div className="my-6 flex items-center">
                <div className="flex-1 border-t border-gray-200"></div>
                <span className="px-3 text-gray-400 text-sm">or</span>
                <div className="flex-1 border-t border-gray-200"></div>
              </div>

              <div className="flex justify-center">
                <div id="google-signup-btn" className="w-full"></div>
              </div>
            </>
          )}

          <div className="my-6 border-t border-gray-200"></div>

          <p className="text-center text-gray-600 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#8A6C2A] hover:text-[#705822] transition">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-gray-500 text-xs mt-6">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};