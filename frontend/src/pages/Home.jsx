import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UploadBox } from '../components/UploadBox';

export const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
    setShowMenu(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">LG</span>
              </div>
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Legal-Gurdian
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900 font-medium transition"
              >
                Dashboard
              </button>
              {user && (
                <>
                  <button
                    onClick={() => navigate('/history')}
                    className="text-gray-600 hover:text-gray-900 font-medium transition"
                  >
                    History
                  </button>
                  <button
                    onClick={() => navigate('/profile')}
                    className="text-gray-600 hover:text-gray-900 font-medium transition"
                  >
                    Profile
                  </button>
                </>
              )}
              <a
                href="https://github.com/Learnerbypassion/Legal-Gurdian"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition font-medium flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </a>
              {user ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    className="text-gray-600 hover:text-gray-900 font-medium transition"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate('/signup')}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {showMenu && (
            <div className="md:hidden pb-4 border-t border-gray-200">
              <button
                onClick={() => handleNavigation('/')}
                className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50 font-medium"
              >
                Dashboard
              </button>
              {user && (
                <>
                  <button
                    onClick={() => handleNavigation('/history')}
                    className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50 font-medium"
                  >
                    History
                  </button>
                  <button
                    onClick={() => handleNavigation('/profile')}
                    className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50 font-medium"
                  >
                    Profile
                  </button>
                </>
              )}
              {user ? (
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 font-medium"
                >
                  Logout
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleNavigation('/login')}
                    className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50 font-medium"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleNavigation('/signup')}
                    className="block w-full text-left px-4 py-2 text-indigo-600 hover:bg-indigo-50 font-medium"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <div className="text-center">
            {user ? (
              <>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{user?.name}</span>
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  Upload and analyze your documents with AI-powered insights
                </p>
              </>
            ) : (
              <>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Analyze Documents with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">AI</span>
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  Upload and analyze your documents instantly. No account needed to get started!
                </p>
              </>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Upload Documents</h3>
            <p className="text-gray-600">Drag and drop or browse to upload PDF, TXT, or Word documents</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition">
            <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">AI Analysis</h3>
            <p className="text-gray-600">Get instant insights with our advanced AI models</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Results & Reports</h3>
            <p className="text-gray-600">Download comprehensive analysis reports</p>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Analyze Your Document</h3>
          <p className="text-gray-600 mb-8">Start by uploading a document for analysis</p>
          <UploadBox />
        </div>

        {/* Info Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* How It Works */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-200">
            <h4 className="text-lg font-bold text-gray-900 mb-4">How It Works</h4>
            <ol className="space-y-3 text-gray-700">
              <li className="flex gap-3">
                <span className="font-bold text-indigo-600">1.</span>
                <span>Upload your document (PDF, TXT, or Word)</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-indigo-600">2.</span>
                <span>Our AI analyzes the content</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-indigo-600">3.</span>
                <span>Get insights, summary, and risk assessment</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-indigo-600">4.</span>
                <span>Download your analysis report</span>
              </li>
            </ol>
          </div>

          {/* Supported Formats */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 border border-purple-200">
            <h4 className="text-lg font-bold text-gray-900 mb-4">Supported Formats</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                <span className="text-gray-700">PDF Files</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                <span className="text-gray-700">Text Files (.txt)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                <span className="text-gray-700">Word Documents</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                <span className="text-gray-700">Rich Text Files</span>
              </div>
            </div>
          </div>
        </div>
      </main>


    </div>
  );
};
