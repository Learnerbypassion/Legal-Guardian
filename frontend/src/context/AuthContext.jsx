import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import Cookies from 'js-cookie';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(Cookies.get('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = Cookies.get('token');
      if (storedToken) {
        try {
          const response = await api.get('/auth/me');
          setUser(response.data.data);
          setToken(storedToken);
        } catch (err) {
          Cookies.remove('token');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const register = async (email, phone, name, role) => {
    try {
      setError(null);
      const response = await api.post('/auth/register', { email, phone, name, role });
      return response.data.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Registration failed';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const verifyOTP = async (userId, phoneOtp, emailOtp = null) => {
    try {
      setError(null);
      const response = await api.post('/auth/verify-otp', { userId, phoneOtp, emailOtp });
      return response.data.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'OTP verification failed';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const setPassword = async (userId, password) => {
    try {
      setError(null);
      const response = await api.post('/auth/set-password', { userId, password });
      const { token: newToken, user: userData } = response.data.data;
      Cookies.set('token', newToken, { expires: 7 });
      setToken(newToken);
      setUser(userData);
      return response.data.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Password setup failed';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const resendOTP = async (userId) => {
    try {
      setError(null);
      const response = await api.post('/auth/resend-otp', { userId });
      return response.data.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to resend OTP';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const sendEmailOTP = async () => {
    try {
      setError(null);
      const response = await api.post('/auth/send-email-verification', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to send email verification';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const verifyEmailOTP = async (otp) => {
    try {
      setError(null);
      const response = await api.post('/auth/verify-email', { otp }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data.data.user);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Email verification failed';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const login = async (phone, password) => {
    try {
      setError(null);
      const response = await api.post('/auth/login', { phone, password });
      const { token: newToken, user: userData } = response.data.data;
      Cookies.set('token', newToken, { expires: 7 });
      setToken(newToken);
      setUser(userData);
      return response.data.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Login failed';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post('/auth/logout', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } finally {
      Cookies.remove('token');
      setToken(null);
      setUser(null);
    }
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      error,
      isAuthenticated,
      register,
      verifyOTP,
      setPassword,
      sendEmailOTP,
      verifyEmailOTP,
      resendOTP,
      login,
      logout,
      setError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
