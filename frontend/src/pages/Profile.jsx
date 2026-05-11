import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronDown, ChevronRight, Globe, GitBranch, Puzzle, MessageCircle, Inbox, Clock, Circle } from 'lucide-react';
import { LINKS } from '../constants/links';
import { getConversations } from '../services/api';
import LiveChatPanel from '../components/LiveChatPanel';

/* ── Small UI helpers ── */
const Label = ({ children }) => (
  <p className="text-xs text-[#8A6C2A] font-bold mb-1 uppercase tracking-wide">{children}</p>
);

const Value = ({ children }) => (
  <p className="text-[#1B2F4E] font-medium">{children || 'Not set'}</p>
);

const Status = ({ verified }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full font-semibold ${verified ? 'bg-green-100 text-green-700' : 'bg-[#FAF3E4] text-[#8A6C2A]'}`}>
    <span className={`w-2 h-2 rounded-full ${verified ? 'bg-green-500' : 'bg-[#C9A84C]'}`} />
    {verified ? 'Verified' : 'Pending'}
  </span>
);

/* ── Main Component ── */
export const Profile = () => {
  const { user, logout, sendEmailOTP, verifyEmailOTP } = useAuth();
  const navigate = useNavigate();
  const quickLinksRef = useRef(null);

  const [showMenu, setShowMenu] = React.useState(false);
  const [showQuickLinks, setShowQuickLinks] = useState(false);
  const [showMobileQuickLinks, setShowMobileQuickLinks] = useState(false);
  const [editing, setEditing] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const [profDetails, setProfDetails] = React.useState({
    education: user?.professionalDetails?.education || '',
    experience: user?.professionalDetails?.experience || '',
    credentials: user?.professionalDetails?.credentials || '',
    profession: user?.professionalDetails?.profession || 'Lawyer',
  });

  const [message, setMessage] = React.useState('');
  const [emailVerifying, setEmailVerifying] = React.useState(false);
  const [emailOtp, setEmailOtp] = React.useState('');

  // Live chat state
  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [chatPartner, setChatPartner] = useState(null);
  const [showLiveChat, setShowLiveChat] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (quickLinksRef.current && !quickLinksRef.current.contains(event.target)) {
        setShowQuickLinks(false);
      }
    };

    if (showQuickLinks) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showQuickLinks]);

  // Load conversations for professionals
  useEffect(() => {
    if (user?.role === 'professional') {
      loadConversations();
    }
  }, [user]);

  const loadConversations = async () => {
    setLoadingConversations(true);
    try {
      const res = await getConversations();
      if (res.success) {
        setConversations(res.data);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoadingConversations(false);
    }
  };

  const formatTimeAgo = (dateStr) => {
    const now = new Date();
    const d = new Date(dateStr);
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
    setShowMenu(false);
  };

  const handleSendEmailOtp = async () => {
    try {
      setLoading(true);
      setMessage('');
      await sendEmailOTP();
      setEmailVerifying(true);
      setMessage('OTP sent to your email.');
    } catch (err) {
      setMessage(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    try {
      setLoading(true);
      setMessage('');
      await verifyEmailOTP(emailOtp);
      setEmailVerifying(false);
      setEmailOtp('');
      setMessage('Email verified successfully!');
    } catch (err) {
      setMessage(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleProfChange = (e) => {
    setProfDetails({ ...profDetails, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      setMessage('');
      const { updateProfile } = await import('../services/api');
      await updateProfile(profDetails);
      setMessage('Profile updated successfully! Refresh to see the changes.');
      setEditing(false);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#CBD2DC] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

          {/* Logo */}
          <div onClick={() => navigate('/')} className="flex items-center gap-2 cursor-pointer flex-shrink-0">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shadow-md">
              <img src="../logo.png" alt="Legal-Guardian Logo" className="w-full h-full object-contain rounded-lg" />
            </div>
            <h1 className="text-lg font-bold shadow-sm text-[#0F172A] hidden sm:block">Legal Guardian</h1>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <button onClick={() => navigate('/')} className="text-[#3D4F66] hover:text-[#1B2F4E] font-medium transition text-sm">Dashboard</button>
            <button onClick={() => navigate('/history')} className="text-[#3D4F66] hover:text-[#1B2F4E] font-medium transition text-sm">History</button>
            <button onClick={() => navigate('/profile')} className="text-[#1B2F4E] font-semibold text-sm">Profile</button>
            {/* Quick Links */}
            <div className="relative" ref={quickLinksRef}>
              <button
                onClick={() => setShowQuickLinks(!showQuickLinks)}
                className="px-3 py-1.5 border border-[#CBD2DC] text-[#3D4F66] rounded-lg hover:bg-gray-50 transition font-medium text-sm flex items-center gap-1"
              >
                Quick Links
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${showQuickLinks ? 'rotate-180' : ''
                    }`}
                />
              </button>

              {/* Dropdown */}
              <div
                className={`absolute right-0 top-full mt-2 w-80 bg-white border border-[#E2E8F0] rounded-2xl shadow-xl overflow-hidden transition-all duration-200 ease-out z-50 ${showQuickLinks
                  ? 'opacity-100 translate-y-0 pointer-events-auto'
                  : 'opacity-0 -translate-y-2 pointer-events-none'
                  }`}
              >
                {/* Website */}
                <a
                  href={LINKS.WEBSITE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-4 py-4 hover:bg-[#FAF3E4] transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#F8FAFC] flex items-center justify-center">
                      <Globe size={20} className="text-[#1B2F4E]" />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-[#1B2F4E]">
                        GitHub Repository
                      </p>
                      <p className="text-xs text-[#64748B]">
                        Source code of the bowser
                      </p>
                    </div>
                  </div>

                  <ChevronRight
                    size={18}
                    className="text-[#B08B3E] group-hover:translate-x-1 transition-transform"
                  />
                </a>

                {/* App Repo */}
                <a
                  href={LINKS.APP_REPO}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-4 py-4 hover:bg-[#FAF3E4] transition group border-t border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#F8FAFC] flex items-center justify-center">
                      <GitBranch size={20} className="text-[#1B2F4E]" />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-[#1B2F4E]">
                        App Link
                      </p>
                      <p className="text-xs text-[#64748B]">
                        Source code for app
                      </p>
                    </div>
                  </div>

                  <ChevronRight
                    size={18}
                    className="text-[#B08B3E] group-hover:translate-x-1 transition-transform"
                  />
                </a>

                {/* Extension Repo */}
                <a
                  href={LINKS.EXTENSION_REPO}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-4 py-4 hover:bg-[#FAF3E4] transition group border-t border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#F8FAFC] flex items-center justify-center">
                      <Puzzle size={20} className="text-[#1B2F4E]" />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-[#1B2F4E]">
                        Extension Repository
                      </p>
                      <p className="text-xs text-[#64748B]">
                        Browser extension source
                      </p>
                    </div>
                  </div>

                  <ChevronRight
                    size={18}
                    className="text-[#B08B3E] group-hover:translate-x-1 transition-transform"
                  />
                </a>
              </div>
            </div>
          </nav>

          {/* Right: user pill + logout (desktop) */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            {user ? (
              <>
                <div className="flex items-center gap-2 bg-gray-50 p-1 pr-3 rounded-full border border-gray-100 max-w-[200px]">
                  <div className="w-8 h-8 rounded-full bg-[#1B2F4E] flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xs">{user?.name?.charAt(0)?.toUpperCase()}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#1B2F4E] truncate leading-tight">{user?.name}</p>
                    <p className="text-[10px] text-gray-400 truncate leading-tight">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-bold text-sm shadow-sm whitespace-nowrap"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button onClick={() => navigate('/login')} className="text-[#3D4F66] hover:text-[#1B2F4E] font-medium transition text-sm">Sign In</button>
                <button onClick={() => navigate('/signup')} className="px-4 py-2 bg-[#1B2F4E] text-white rounded-lg hover:bg-[#15253d] transition font-bold text-sm shadow-md">Sign Up</button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition text-[#1B2F4E]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {showMenu
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {showMenu && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1">
            {user && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-3">
                <div className="w-9 h-9 rounded-full bg-[#1B2F4E] flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">{user?.name?.charAt(0)?.toUpperCase()}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#1B2F4E] truncate">{user?.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                </div>
              </div>
            )}
            <button onClick={() => handleNavigation('/')} className="block w-full text-left px-3 py-2.5 text-[#3D4F66] hover:bg-gray-50 rounded-lg font-medium text-sm transition">Dashboard</button>
            <button onClick={() => handleNavigation('/history')} className="block w-full text-left px-3 py-2.5 text-[#3D4F66] hover:bg-gray-50 rounded-lg font-medium text-sm transition">History</button>
            <button onClick={() => handleNavigation('/profile')} className="block w-full text-left px-3 py-2.5 text-[#1B2F4E] bg-[#FAF3E4] rounded-lg font-semibold text-sm">Profile</button>
            {/* Mobile Quick Links */}
            <div className="space-y-1">
              <button
                onClick={() => setShowMobileQuickLinks(!showMobileQuickLinks)}
                className="flex items-center justify-between w-full px-3 py-2.5 text-[#3D4F66] hover:bg-gray-50 rounded-lg font-medium text-sm transition"
              >
                <span>Quick Links</span>

                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${showMobileQuickLinks ? 'rotate-180' : ''
                    }`}
                />
              </button>

              {showMobileQuickLinks && (
                <div className="ml-3 space-y-1 border-l border-gray-200 pl-3">

                  <a
                    href={LINKS.WEBSITE}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-3 py-2.5 hover:bg-[#FAF3E4] rounded-lg transition"
                  >
                    <div className="flex items-center gap-2">
                      <Globe size={16} className="text-[#1B2F4E]" />
                      <span className="text-sm text-[#1B2F4E]">
                        Github Repository
                      </span>
                    </div>

                    <ChevronRight size={16} className="text-[#B08B3E]" />
                  </a>

                  <a
                    href={LINKS.APP_REPO}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-3 py-2.5 hover:bg-[#FAF3E4] rounded-lg transition"
                  >
                    <div className="flex items-center gap-2">
                      <GitBranch size={16} className="text-[#1B2F4E]" />
                      <span className="text-sm text-[#1B2F4E]">
                        App Link
                      </span>
                    </div>

                    <ChevronRight size={16} className="text-[#B08B3E]" />
                  </a>

                  <a
                    href={LINKS.EXTENSION_REPO}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-3 py-2.5 hover:bg-[#FAF3E4] rounded-lg transition"
                  >
                    <div className="flex items-center gap-2">
                      <Puzzle size={16} className="text-[#1B2F4E]" />
                      <span className="text-sm text-[#1B2F4E]">
                        Extension Repository
                      </span>
                    </div>

                    <ChevronRight size={16} className="text-[#B08B3E]" />
                  </a>

                </div>
              )}
            </div>
            <div className="pt-2 border-t border-gray-100 mt-2">
              {user ? (
                <button onClick={handleLogout} className="block w-full text-left px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg font-semibold text-sm transition">Logout</button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => handleNavigation('/login')} className="flex-1 px-3 py-2.5 border border-[#CBD2DC] text-[#1B2F4E] rounded-lg font-medium text-sm text-center">Sign In</button>
                  <button onClick={() => handleNavigation('/signup')} className="flex-1 px-3 py-2.5 bg-[#1B2F4E] text-white rounded-lg font-bold text-sm text-center">Sign Up</button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── CONTENT ── */}
      <div className="max-w-4xl mx-auto px-4 py-10">

        {message && (
          <div className={`p-3 mb-6 rounded ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-[#FAF3E4] text-[#8A6C2A]'}`}>
            {message}
          </div>
        )}

        {/* ── PROFILE HEADER CARD ── */}
        <div className="bg-white p-8 rounded-2xl shadow border border-[#CBD2DC] mb-8">
          <div className="flex gap-6 mb-8">
            <div className="w-20 h-20 bg-[#1B2F4E] rounded-xl flex items-center justify-center text-white text-3xl font-bold">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col justify-center">
              <h2 className="text-2xl font-bold text-[#1B2F4E]">{user.name}</h2>
              <p className="text-[#3D4F66]">{user.email}</p>
              <span className="mt-1 inline-flex items-center gap-1 text-xs text-[#8A6C2A] font-semibold capitalize">
                {user.role || 'User'}
              </span>
            </div>
          </div>

          {/* ── USER DETAILS GRID ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Left Column */}
            <div className="space-y-6">

              <div>
                <Label>Email</Label>
                <Value>{user.email}</Value>
              </div>

              <div>
                <Label>Email Verification</Label>
                <div className="flex items-center gap-2 flex-wrap">
                  <Status verified={user.isEmailVerified} />
                  {!user.isEmailVerified && !emailVerifying && (
                    <button
                      onClick={handleSendEmailOtp}
                      disabled={loading}
                      className="text-xs bg-[#FAF3E4] text-[#8A6C2A] border border-[#C9A84C] px-3 py-1 rounded-full hover:bg-[#C9A84C] hover:text-white transition font-semibold disabled:opacity-50"
                    >
                      Verify Now
                    </button>
                  )}
                </div>

                {emailVerifying && !user.isEmailVerified && (
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={emailOtp}
                      onChange={(e) => setEmailOtp(e.target.value)}
                      maxLength="6"
                      className="px-3 py-1.5 border border-[#CBD2DC] rounded-lg focus:ring-[#C9A84C] focus:border-[#C9A84C] text-sm w-40 text-[#1B2F4E]"
                    />
                    <button
                      onClick={handleVerifyEmail}
                      disabled={loading || emailOtp.length !== 6}
                      className="text-xs bg-[#1B2F4E] text-white px-3 py-1.5 rounded-lg hover:bg-[#2a4570] transition disabled:opacity-50"
                    >
                      Submit
                    </button>
                    <button
                      onClick={() => { setEmailVerifying(false); setEmailOtp(''); setMessage(''); }}
                      className="text-xs text-[#3D4F66] hover:text-[#1B2F4E] ml-1"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div>
                <Label>Phone Number</Label>
                <Value>{user.phone}</Value>
              </div>

              <div>
                <Label>Phone Verification</Label>
                <Status verified={user.isPhoneVerified} />
              </div>

            </div>

            {/* Right Column */}
            <div className="space-y-6">

              <div>
                <Label>User Type</Label>
                <Value>{user.userType || 'General'}</Value>
              </div>

              <div>
                <Label>Preferred Language</Label>
                <Value>{user.preferredLanguage || 'English'}</Value>
              </div>

              <div>
                <Label>Role</Label>
                <Value>{user.role || 'User'}</Value>
              </div>

              <div>
                <Label>Member ID</Label>
                <p className="text-[#1B2F4E] font-mono text-sm break-all">{user._id}</p>
              </div>

            </div>
          </div>
        </div>

        {/* ── PROFESSIONAL DETAILS SECTION ── */}
        {user.role === 'professional' && (
          <div className="bg-white rounded-2xl shadow border border-[#CBD2DC] p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#1B2F4E]">Professional Details</h3>
              <button
                onClick={() => setEditing(!editing)}
                className="px-4 py-2 text-[#8A6C2A] font-semibold border border-[#C9A84C] rounded-lg hover:bg-[#FAF3E4] transition text-sm"
              >
                {editing ? 'Cancel' : 'Edit Details'}
              </button>
            </div>

            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-[#8A6C2A] font-bold mb-1 uppercase tracking-wide">Profession Type</label>
                  <select
                    name="profession"
                    value={profDetails.profession}
                    onChange={handleProfChange}
                    className="w-full px-4 py-2 border border-[#CBD2DC] rounded-lg focus:ring-[#C9A84C] focus:border-[#C9A84C] text-[#1B2F4E]"
                  >
                    <option value="Lawyer">Lawyer</option>
                    <option value="CA">Chartered Accountant (CA)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#8A6C2A] font-bold mb-1 uppercase tracking-wide">Education</label>
                  <input
                    type="text"
                    name="education"
                    value={profDetails.education}
                    onChange={handleProfChange}
                    placeholder="e.g. LLB, LLM, CA"
                    className="w-full px-4 py-2 border border-[#CBD2DC] rounded-lg focus:ring-[#C9A84C] focus:border-[#C9A84C] text-[#1B2F4E]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#8A6C2A] font-bold mb-1 uppercase tracking-wide">Experience</label>
                  <input
                    type="text"
                    name="experience"
                    value={profDetails.experience}
                    onChange={handleProfChange}
                    placeholder="e.g. 5 years in Corporate Law"
                    className="w-full px-4 py-2 border border-[#CBD2DC] rounded-lg focus:ring-[#C9A84C] focus:border-[#C9A84C] text-[#1B2F4E]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#8A6C2A] font-bold mb-1 uppercase tracking-wide">Credentials / License</label>
                  <input
                    type="text"
                    name="credentials"
                    value={profDetails.credentials}
                    onChange={handleProfChange}
                    placeholder="e.g. Bar Council Number"
                    className="w-full px-4 py-2 border border-[#CBD2DC] rounded-lg focus:ring-[#C9A84C] focus:border-[#C9A84C] text-[#1B2F4E]"
                  />
                </div>
                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="w-full py-2 bg-[#1B2F4E] text-white rounded-lg hover:bg-[#2a4570] transition font-semibold disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Details'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Profession</Label>
                  <Value>{user.professionalDetails?.profession}</Value>
                </div>
                <div>
                  <Label>Education</Label>
                  <Value>{user.professionalDetails?.education}</Value>
                </div>
                <div>
                  <Label>Experience</Label>
                  <Value>{user.professionalDetails?.experience}</Value>
                </div>
                <div>
                  <Label>Credentials</Label>
                  <Value>{user.professionalDetails?.credentials}</Value>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── CLIENT MESSAGES SECTION (professionals only) ── */}
        {user.role === 'professional' && (
          <div className="bg-white rounded-2xl shadow border border-[#CBD2DC] p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#1B2F4E] flex items-center gap-2">
                <span className="p-2 bg-[#FAF3E4] rounded-lg">
                  <Inbox size={20} className="text-[#8A6C2A]" />
                </span>
                Client Messages
              </h3>
              <button
                onClick={loadConversations}
                disabled={loadingConversations}
                className="px-4 py-2 text-[#8A6C2A] font-semibold border border-[#C9A84C] rounded-lg hover:bg-[#FAF3E4] transition text-sm disabled:opacity-50"
              >
                {loadingConversations ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            {loadingConversations ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#FAF3E4] border border-[#8A6C2A]/20 mb-4">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#8A6C2A] border-t-transparent" />
                  </div>
                  <p className="text-sm text-[#3D4F66] font-medium">Loading conversations...</p>
                </div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] mb-4">
                  <MessageCircle size={28} className="text-[#CBD2DC]" />
                </div>
                <p className="text-[#1B2F4E] font-bold text-base mb-1">No Messages Yet</p>
                <p className="text-sm text-[#3D4F66] max-w-[300px]">
                  When clients start live chats with you, their conversations will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {conversations.map((conv) => (
                  <div
                    key={conv.roomId}
                    onClick={() => {
                      setChatPartner(conv.partner);
                      setShowLiveChat(true);
                    }}
                    className="flex items-center gap-4 p-4 rounded-xl border border-[#E2E8F0] hover:border-[#8A6C2A]/40 hover:bg-[#FEFCF6] cursor-pointer transition-all group"
                  >
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-[#1B2F4E] flex items-center justify-center flex-shrink-0 shadow-sm">
                      <span className="text-white font-bold text-base">
                        {conv.partner?.name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="text-sm font-bold text-[#1B2F4E] truncate">
                          {conv.partner?.name || 'Unknown User'}
                        </h4>
                        {conv.unreadCount > 0 && (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#8A6C2A] text-white text-[10px] font-bold flex-shrink-0">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#64748B] truncate">
                        {conv.lastMessage}
                      </p>
                    </div>

                    {/* Time + action */}
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-[10px] text-[#94A3B8] font-medium flex items-center gap-1">
                        <Clock size={10} />
                        {formatTimeAgo(conv.lastMessageAt)}
                      </span>
                      <span className="text-xs text-[#8A6C2A] font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        Reply <ChevronRight size={12} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Live Chat Panel */}
        <LiveChatPanel
          professional={chatPartner}
          isOpen={showLiveChat}
          onClose={() => { setShowLiveChat(false); setChatPartner(null); loadConversations(); }}
        />

      </div>
    </div>
  );
};