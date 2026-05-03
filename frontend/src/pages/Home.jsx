import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UploadBox } from '../components/UploadBox';
import { AnalysisLoading } from '../components/AnalysisLoading';

export const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState('reading');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
    setShowMenu(false);
  };

  return (
    <>
      {/* Full-page loading overlay */}
      {uploading && <AnalysisLoading status={analysisStatus} />}

      {/* Main page - hidden when uploading */}
      {!uploading && (
      <div className="min-h-screen bg-[#F4F5F7]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#CBD2DC] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-10 h-10 rounded-lg bg-[#1B2F4E] flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">LG</span>
              </div>
              <h1 className="text-2xl font-bold text-[#1B2F4E]">
                Legal-Guardian
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <button
                onClick={() => navigate('/')}
                className="text-[#3D4F66] hover:text-[#1B2F4E] font-medium transition"
              >
                Dashboard
              </button>
              {user && (
                <>
                  <button
                    onClick={() => navigate('/history')}
                    className="text-[#3D4F66] hover:text-[#1B2F4E] font-medium transition"
                  >
                    History
                  </button>
                  <button
                    onClick={() => navigate('/profile')}
                    className="text-[#3D4F66] hover:text-[#1B2F4E] font-medium transition"
                  >
                    Profile
                  </button>
                </>
              )}
              <a
                href="https://github.com/Learnerbypassion/Legal-Gurdian"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-[#CBD2DC] text-[#3D4F66] rounded-lg hover:bg-gray-50 transition font-medium flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </a>
              {user ? (
                <>
                  <div className="flex items-center gap-3 bg-gray-50 p-1 pr-4 rounded-full border border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-[#1B2F4E] flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1B2F4E]">{user?.name}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">{user?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-bold text-sm shadow-sm"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    className="text-[#3D4F66] hover:text-[#1B2F4E] font-medium transition"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate('/signup')}
                    className="px-4 py-2 bg-[#1B2F4E] text-white rounded-lg hover:bg-[#15253d] transition font-bold shadow-md"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition text-[#1B2F4E]"
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
                className="block w-full text-left px-4 py-2 text-[#3D4F66] hover:bg-gray-50 font-medium"
              >
                Dashboard
              </button>
              {user && (
                <>
                  <button
                    onClick={() => handleNavigation('/history')}
                    className="block w-full text-left px-4 py-2 text-[#3D4F66] hover:bg-gray-50 font-medium"
                  >
                    History
                  </button>
                  <button
                    onClick={() => handleNavigation('/profile')}
                    className="block w-full text-left px-4 py-2 text-[#3D4F66] hover:bg-gray-50 font-medium"
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
                    className="block w-full text-left px-4 py-2 text-[#3D4F66] hover:bg-gray-50 font-medium"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleNavigation('/signup')}
                    className="block w-full text-left px-4 py-2 text-[#1B2F4E] hover:bg-gray-50 font-bold"
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Welcome Section */}
        <div className="mb-16">
          <div className="text-center">
            {user ? (
              <>
                <h2 className="text-4xl md:text-5xl font-bold text-[#1B2F4E] mb-4">
                  Welcome, <span className="text-[#8A6C2A]">{user?.name}</span>
                </h2>
                <p className="text-xl text-[#3D4F66] mb-8 font-medium">
                  Review and safeguard your agreements with AI-powered legal intelligence.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-4xl md:text-5xl font-bold text-[#1B2F4E] mb-4">
                  Simplify Legal Review with <span className="text-[#8A6C2A]">AI</span>
                </h2>
                <p className="text-xl text-[#3D4F66] mb-8 font-medium">
                  Upload and analyze your documents instantly. Professional insights without the overhead.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl shadow-md p-8 border border-[#CBD2DC] hover:border-[#8A6C2A] transition-all">
            <div className="w-14 h-14 rounded-lg bg-[#FAF3E4] flex items-center justify-center mb-6 shadow-inner">
              <svg className="w-7 h-7 text-[#8A6C2A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[#1B2F4E] mb-2">Upload Documents</h3>
            <p className="text-[#3D4F66] text-sm leading-relaxed">Drag and drop or browse to upload PDF, TXT, or Word documents</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-8 border border-[#CBD2DC] hover:border-[#8A6C2A] transition-all">
            <div className="w-14 h-14 rounded-lg bg-[#FAF3E4] flex items-center justify-center mb-6 shadow-inner">
              <svg className="w-7 h-7 text-[#8A6C2A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[#1B2F4E] mb-2">AI Analysis</h3>
            <p className="text-[#3D4F66] text-sm leading-relaxed">Our AI scans for hidden risks, unfair clauses, and critical deadlines in seconds.</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-8 border border-[#CBD2DC] hover:border-[#8A6C2A] transition-all">
            <div className="w-14 h-14 rounded-lg bg-[#FAF3E4] flex items-center justify-center mb-6 shadow-inner">
              <svg className="w-7 h-7 text-[#8A6C2A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[#1B2F4E] mb-2">Results & Reports</h3>
            <p className="text-[#3D4F66] text-sm leading-relaxed">Download comprehensive analysis reports</p>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-xl p-10 border-t-8 border-[#1B2F4E]">
          <div className="mb-10 text-center md:text-left">
            <h3 className="text-2xl font-bold text-[#1B2F4E] mb-2 uppercase tracking-tight">Analyze Your Document</h3>
            <p className="text-[#3D4F66] font-medium">Select your legal document to start the AI review process.</p>
          </div>
          <UploadBox 
            uploading={uploading}
            setUploading={setUploading}
            analysisStatus={analysisStatus}
            setAnalysisStatus={setAnalysisStatus}
          />
        </div>

        {/* Info Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* How It Works */}
          <div className="bg-white rounded-xl p-10 border border-[#CBD2DC] shadow-sm">
            <h4 className="text-lg font-bold text-[#1B2F4E] mb-6 border-b pb-4">Our Process</h4>
            <ol className="space-y-4 text-[#3D4F66]">
              <li className="flex gap-4 items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#1B2F4E] text-white flex items-center justify-center text-xs font-bold">1</span>
                <span className="text-sm font-medium">Securely upload your document.</span>
              </li>
              <li className="flex gap-4 items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#1B2F4E] text-white flex items-center justify-center text-xs font-bold">2</span>
                <span className="text-sm font-medium">The AI engine extracts and cross-references clauses.</span>
              </li>
              <li className="flex gap-4 items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#1B2F4E] text-white flex items-center justify-center text-xs font-bold">3</span>
                <span className="text-sm font-medium">Identify risks, opportunities, and missing terms.</span>
              </li>
              <li className="flex gap-4 items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#1B2F4E] text-white flex items-center justify-center text-xs font-bold">4</span>
                <span className="text-sm font-medium">Download a detailed audit report for your records.</span>
              </li>
            </ol>
          </div>

          {/* Supported Formats */}
          <div className="bg-[#1B2F4E] rounded-xl p-10 text-white shadow-lg relative overflow-hidden">
             {/* Subtle decorative background element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#8A6C2A]/10 rounded-full -mr-16 -mt-16"></div>
            
            <h4 className="text-lg font-bold mb-8 text-[#8A6C2A] uppercase tracking-wider">Accepted File Formats</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#8A6C2A]"></div>
                <span className="font-semibold text-sm">PDF Documents</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#8A6C2A]"></div>
                <span className="font-semibold text-sm">Text Files (.txt)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#8A6C2A]"></div>
                <span className="font-semibold text-sm">MS Word (.docx)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#8A6C2A]"></div>
                <span className="font-semibold text-sm">Rich Text (.rtf)</span>
              </div>
            </div>
            <p className="mt-10 text-xs text-white/60 leading-relaxed italic">
              All files are processed using AES-256 encryption. We do not store your documents permanently without your explicit permission.
            </p>
          </div>
        </div>
      </main>
    </div>
      )}
    </>
  );
};