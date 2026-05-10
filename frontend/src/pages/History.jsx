import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HistoryTab } from '../components/HistoryTab';
import { ChevronDown, ChevronRight, Globe, GitBranch, Puzzle } from 'lucide-react';
import { LINKS } from '../constants/links';

export const History = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showQuickLinks, setShowQuickLinks] = useState(false);
  const [showMobileQuickLinks, setShowMobileQuickLinks] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
    setShowMenu(false);
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7]">

      {/* ── Header ── */}
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
            <button
              onClick={() => navigate('/')}
              className="text-[#3D4F66] hover:text-[#1B2F4E] font-medium transition text-sm"
            >Dashboard
            </button>

            <button
              onClick={() => navigate('/history')}
              className="text-[#1B2F4E] font-semibold text-sm"
            >History
            </button>

            <button
              onClick={() => navigate('/profile')}
              className="text-[#3D4F66] hover:text-[#1B2F4E] font-medium transition text-sm"
            >Profile
            </button>

            {/* Quick Links */}
            <div className="relative">
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
                        Visit Website
                      </p>
                      <p className="text-xs text-[#64748B]">
                        Go to official site
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
                        App Repository
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
            <button onClick={() => handleNavigation('/')}
              className="block w-full text-left px-3 py-2.5 text-[#3D4F66] hover:bg-gray-50 rounded-lg font-medium text-sm transition"
            >Dashboard
            </button>

            <button onClick={() => handleNavigation('/history')}
              className="block w-full text-left px-3 py-2.5 text-[#1B2F4E] bg-[#FAF3E4] rounded-lg font-semibold text-sm"
            >History
            </button>

            <button onClick={() => handleNavigation('/profile')}
              className="block w-full text-left px-3 py-2.5 text-[#3D4F66] hover:bg-gray-50 rounded-lg font-medium text-sm transition"
            >Profile
            </button>

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
                        Visit Website
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
                        App Repository
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
                  <button onClick={() => handleNavigation('/login')}
                    className="flex-1 px-3 py-2.5 border border-[#CBD2DC] text-[#1B2F4E] rounded-lg font-medium text-sm text-center"
                  >Sign In
                  </button>

                  <button onClick={() => handleNavigation('/signup')}
                    className="flex-1 px-3 py-2.5 bg-[#1B2F4E] text-white rounded-lg font-bold text-sm text-center"
                  >Sign Up
                  </button>

                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-extrabold text-[#1B2F4E] mb-8">
          Your Document History
        </h2>

        <div className="bg-white rounded-2xl shadow-xl border border-[#CBD2DC] overflow-hidden">
          <div className="p-4 bg-[#F9FAFB] border-b border-[#E5E7EB]">
            <span className="text-xs font-bold text-[#8A6C2A] uppercase tracking-wider">
              Secure Analysis Archive
            </span>
          </div>

          <div className="p-6">
            <HistoryTab />
          </div>
        </div>
      </main>
    </div>
  );
};