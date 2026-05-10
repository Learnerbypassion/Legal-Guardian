import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ChatBox from '../components/ChatBox';
import { SaveHistoryModal } from '../components/SaveHistoryModal';
import { HistoryTab } from '../components/HistoryTab';
import RiskScoreCircle from '../components/RiskScoreCircle';
import { getRecommendedProfessionals, contactProfessional, getDocumentById, downloadAnalysisAsPDF } from '../services/api';
import { ClipboardList, CircleCheckBig, TriangleAlert, FileText, Briefcase, History, MessageSquareMore, File, ShieldAlert } from 'lucide-react';
import { ChevronDown, ChevronRight, Globe, GitBranch, Puzzle } from 'lucide-react';
import { LINKS } from '../constants/links';

export const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, loading: authLoading } = useAuth();

  let resultData = location.state;
  if (!resultData) {
    const storedData = localStorage.getItem('lastAnalysis');
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        if (parsed && typeof parsed.isUnauthenticated !== 'undefined') {
          parsed.isUnauthenticated = Boolean(parsed.isUnauthenticated);
        }
        resultData = parsed;
      } catch (e) {
        console.error('Failed to parse stored analysis', e);
      }
    }
  }

  const { result, documentId, fileName, isUnauthenticated, contractText } = resultData || {};
  const [resolvedContractText, setResolvedContractText] = useState(contractText || '');
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  const [showMenu, setShowMenu] = useState(false);
  const [showQuickLinks, setShowQuickLinks] = useState(false);
  const [showMobileQuickLinks, setShowMobileQuickLinks] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [professionals, setProfessionals] = useState([]);
  const [contactedIds, setContactedIds] = useState({});

  // Fetch document from DB if contractText is missing but documentId is available
  useEffect(() => {
    if (!resolvedContractText && documentId && user) {
      // console.log("🔄 Fetching document from DB:", { documentId, hasUser: !!user });
      setLoadingDoc(true);
      getDocumentById(documentId)
        .then((res) => {
          console.log("✅ Document fetch response:", { success: res.success, hasContractText: !!res.data?.contractText, contractLength: res.data?.contractText?.length || 0 });
          if (res.success && res.data?.contractText) {
            setResolvedContractText(res.data.contractText);
            // console.log("✅ ContractText set in state");
          } else if (res.success && !res.data?.contractText) {
            // console.warn('⚠️ Document found but contractText is missing. This document was analyzed before text storage was enabled. User will need to re-upload.');
          } else {
            // console.warn('⚠️ Document fetch failed:', res);
          }
        })
        .catch((err) => {
          // console.error('❌ Failed to fetch document:', err);
        })
        .finally(() => {
          setLoadingDoc(false);
        });
    } else {
      // console.log("ℹ️ Not fetching document:", { hasResolvedText: !!resolvedContractText, hasDocId: !!documentId, hasUser: !!user });
    }
  }, [documentId, user]);

  useEffect(() => {
    if (authLoading) return;
    if (result && (isUnauthenticated || !user)) {
      setShowSaveModal(true);
      sessionStorage.setItem('saveModalDismissed', 'true');
    }
  }, [result, isUnauthenticated, user, authLoading]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [result]);

  useEffect(() => {
    if (result) {
      const textType = (result.contractType || '').toLowerCase();
      let requiredProfession = 'Lawyer';
      if (textType.includes('financial') || textType.includes('loan') || textType.includes('tax') || textType.includes('investment')) {
        requiredProfession = 'CA';
      }

      getRecommendedProfessionals(requiredProfession)
        .then(res => {
          if (res.success) setProfessionals(res.data);
        })
        .catch(err => console.error("Failed to fetch professionals", err));
    }
  }, [result]);

  const handleContact = async (profId) => {
    if (!user) {
      setShowAuthPrompt(true);
      return;
    }
    try {
      setContactedIds(prev => ({ ...prev, [profId]: 'Sending...' }));
      await contactProfessional(profId);
      setContactedIds(prev => ({ ...prev, [profId]: 'Sent' }));
    } catch (err) {
      console.error(err);
      setContactedIds(prev => ({ ...prev, [profId]: 'Failed' }));
    }
  };

  if (!result) {
    return (
      <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No analysis data found. Please upload a document to analyze.</p>
          <button
            onClick={() => {
              localStorage.removeItem('lastAnalysis');
              navigate('/');
            }}
            className="px-6 py-2 bg-[#1B2F4E] text-white rounded-lg hover:bg-[#15253d] transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleNavigation = (path) => {
    if (path === '/') {
      localStorage.removeItem('lastAnalysis');
    }
    navigate(path);
    setShowMenu(false);
  };

  const riskScore = result.riskScore?.score || 0;
  const riskLevel = result.riskScore?.label || 'Unknown';

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


      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-[#1B2F4E] mb-2">Analysis Results</h2>
            <p className="text-[#3D4F66] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#8A6C2A]"></span>
              {fileName || 'Document'}
            </p>
          </div>
          <button
            onClick={() => handleNavigation('/')}
            className="px-6 py-3 bg-[#1B2F4E] text-white rounded-lg hover:shadow-lg transition font-medium"
          >
            New Analysis
          </button>
        </div>

        {/* Risk Score Card */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8 border border-[#CBD2DC]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <RiskScoreCircle score={riskScore} label={riskLevel} />

            <div className="flex flex-col justify-center space-y-6 border-l border-r border-gray-100 px-8">
              <div>
                <p className="text-xs font-bold text-[#3D4F66] uppercase tracking-wider mb-1">Advantages</p>
                <p className="text-4xl font-bold text-green-600">{result.pros?.length || 0}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-[#3D4F66] uppercase tracking-wider mb-1">Concerns</p>
                <p className="text-4xl font-bold text-red-600">{result.cons?.length || 0}</p>
              </div>
            </div>

            <div className="bg-[#FAF3E4] rounded-lg p-6 border border-[#E9DCC0]">
              <h4 className="font-bold text-[#8A6C2A] mb-3 flex items-center gap-2">
                <span className="text-lg">⚖️</span> Key Information
              </h4>

              <ul className="space-y-3 text-sm text-[#3D4F66]">
                <li><strong>Risk Level:</strong> {result.riskScore?.label || 'Unknown'}</li>
                <li><strong>Risk Score:</strong> {result.riskScore?.score} / 10</li>
                {result.riskScore?.detectedKeywords?.length > 0 && (
                  <li><strong>Key Flags:</strong> {result.riskScore.detectedKeywords.join(', ')}</li>
                )}
                <li><strong>Advantages:</strong> {result.pros?.length || 0} found</li>
                <li><strong>Concerns:</strong> {result.cons?.length || 0} found</li>
              </ul>

            </div>
          </div>
        </div>

        {/* Tabs */}
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md border border-[#CBD2DC] overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 flex overflow-x-auto">

            {[
              { id: 'summary', label: 'Summary', icon: ClipboardList },
              { id: 'advantages', label: 'Advantages', icon: CircleCheckBig },
              { id: 'concerns', label: 'Concerns', icon: TriangleAlert },
              { id: 'clauses', label: 'Clauses', icon: FileText },
              { id: 'professionals', label: 'Professionals', icon: Briefcase },
              { id: 'history', label: 'History', icon: History },
            ].map((tab) => {
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 font-bold text-sm transition whitespace-nowrap flex items-center gap-2 ${activeTab === tab.id
                    ? 'border-b-2 border-[#1B2F4E] text-[#1B2F4E] bg-white'
                    : 'text-[#3D4F66] hover:text-[#1B2F4E]'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-8">
            {activeTab === 'summary' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-[#1B2F4E]">Executive Summary</h3>
                <div className="prose prose-slate max-w-none text-[#3D4F66] leading-relaxed">
                  {Array.isArray(result.summary)
                    ? result.summary.map((p, i) => <p key={i} className="mb-4">{p}</p>)
                    : <p>{result.summary || 'No summary available'}</p>
                  }
                </div>
                {result.overallAdvice && (
                  <div className="mt-8 p-4 bg-[#F4F5F7] rounded-lg border-l-4 border-[#1B2F4E]">
                    <h4 className="font-bold text-[#1B2F4E] mb-2 uppercase text-xs">AI Recommendation</h4>
                    <p className="text-[#3D4F66]">{result.overallAdvice}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'advantages' && (
              <div className="space-y-4">
                {result.pros?.map((pro, idx) => (
                  <div key={idx} className="bg-green-50 rounded-lg p-5 border border-green-100 flex gap-4">
                    <span className="text-green-600 text-xl font-bold">✓</span>
                    <div>
                      {typeof pro === 'string' ? <p className="text-gray-700">{pro}</p> : (
                        <>
                          <p className="text-gray-900 font-bold mb-1">{pro.clause}</p>
                          <p className="text-gray-700">{pro.explanation}</p>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'concerns' && (
              <div className="space-y-4">
                {result.cons?.map((con, idx) => (
                  <div key={idx} className="bg-red-50 rounded-lg p-5 border border-red-100 flex gap-4">
                    <span className="text-red-600 text-xl font-bold">!</span>
                    <div>
                      {typeof con === 'string' ? <p className="text-gray-700">{con}</p> : (
                        <>
                          <p className="text-gray-900 font-bold mb-1">{con.clause}</p>
                          <p className="text-gray-700">{con.explanation}</p>
                          {con.advice && <p className="mt-2 text-xs font-medium text-red-800 bg-red-100 inline-block px-2 py-1 rounded">Action: {con.advice}</p>}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'clauses' && (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                  <p className="text-amber-800 text-sm font-medium">
                    <ShieldAlert size={16} className="inline-block align-middle mr-1 -mt-0.5" /> These clause types were automatically detected. Review each one carefully with a legal professional before signing.</p>
                </div>
                {result.riskScore?.detectedKeywords?.length > 0 ? (
                  result.riskScore.detectedKeywords.map((keyword, idx) => (
                    <div key={idx} className="bg-[#F4F5F7] rounded-lg p-5 border-l-4 border-[#1B2F4E] border border-gray-200 flex items-center gap-4">
                      <span className="text-2xl"><File /></span>
                      <div>
                        <h4 className="font-bold text-[#1B2F4E] capitalize">{keyword.toLowerCase().replace('indemnif', 'Indemnification')}</h4>
                        <p className="text-sm text-[#3D4F66] mt-1">Detected in your document — consult a lawyer about this clause type.</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No flagged clauses detected.</p>
                )}
              </div>
            )}

            {activeTab === 'professionals' && (
              <div className="space-y-6">
                <div className="bg-[#1B2F4E] text-white p-6 rounded-xl shadow-inner">
                  <h3 className="text-lg font-bold mb-1 text-[#8A6C2A]">Professional Guidance</h3>
                  <p className="text-sm opacity-90">Based on your document's risks, we recommend consulting these experts.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {professionals.map(prof => (
                    <div key={prof._id} className="bg-white border border-[#CBD2DC] rounded-xl p-5 hover:shadow-lg transition">
                      <h4 className="text-lg font-bold text-[#1B2F4E]">{prof.name}</h4>
                      <p className="text-sm font-bold text-[#8A6C2A] mb-3 uppercase tracking-tighter">{prof.professionalDetails?.profession}</p>
                      <div className="text-xs text-[#3D4F66] space-y-1 mb-4">
                        <p><strong>Exp:</strong> {prof.professionalDetails?.experience}</p>
                        <p><strong>Edu:</strong> {prof.professionalDetails?.education}</p>
                      </div>
                      <button
                        onClick={() => handleContact(prof._id)}
                        disabled={contactedIds[prof._id] === 'Sent'}
                        className={`w-full py-2.5 rounded-lg font-bold transition ${contactedIds[prof._id] === 'Sent' ? 'bg-green-100 text-green-700' : 'bg-[#1B2F4E] text-white hover:bg-[#8A6C2A]'
                          }`}
                      >
                        {contactedIds[prof._id] === 'Sent' ? '✓ Message Sent' : 'Contact Expert'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'history' && <HistoryTab />}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <button onClick={() => handleNavigation('/')} className="flex-1 px-6 py-4 bg-[#1B2F4E] text-white rounded-xl hover:shadow-xl transition font-bold text-lg">
            New Analysis
          </button>
          <button
            onClick={async () => {
              if (!user) { setShowAuthPrompt(true); return; }
              try {
                const blob = await downloadAnalysisAsPDF(result);
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `LegalGuardian_Report_${fileName.replace('.pdf', '')}.pdf`;
                link.click();
                URL.revokeObjectURL(url);
              } catch (error) {
                console.error('PDF download error:', error);
                alert('Failed to download report. Please try again.');
              }
            }}
            className="flex-1 px-6 py-4 border-2 border-[#1B2F4E] text-[#1B2F4E] rounded-xl hover:bg-white transition font-bold text-lg"
          >
            Download Report
          </button>
        </div>

        {/* ChatBox Component */}
        <div className="mt-12">
          <div className="bg-white rounded-xl shadow-lg p-8 border border-[#CBD2DC]">
            <h3 className="text-xl font-bold text-[#1B2F4E] mb-6 flex items-center gap-2">
              <span className="p-2 bg-[#FAF3E4] rounded-lg"><MessageSquareMore /></span> Ask Questions About This Document
            </h3>
            <ChatBox contractText={resolvedContractText} language="English" isLoadingDoc={loadingDoc} />

          </div>
        </div>

        {/* Auth Prompt */}
        {
          showAuthPrompt && (
            <div className="fixed inset-0 bg-[#1B2F4E]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 border-t-8 border-[#8A6C2A]">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-[#1B2F4E] mb-2">Save This Report</h3>
                  <p className="text-[#3D4F66]">Create an account to securely store your legal analyses and chat history.</p>
                </div>
                <div className="space-y-4">
                  <button onClick={() => navigate('/signup')} className="w-full py-4 bg-[#1B2F4E] text-white font-bold rounded-xl hover:bg-[#8A6C2A] transition shadow-lg">
                    Create Account
                  </button>
                  <button onClick={() => navigate('/login')} className="w-full py-4 border-2 border-[#1B2F4E] text-[#1B2F4E] font-bold rounded-xl">
                    Sign In
                  </button>
                  <button onClick={() => setShowAuthPrompt(false)} className="w-full py-2 text-gray-500 font-medium">
                    Continue as Guest
                  </button>
                </div>
              </div>
            </div>
          )
        }

        <SaveHistoryModal
          isOpen={showSaveModal}
          onClose={() => { setShowSaveModal(false); sessionStorage.setItem('saveModalDismissed', 'true'); }}
          onSave={() => sessionStorage.setItem('pendingAnalysis', JSON.stringify({ result, fileName, documentId, timestamp: new Date().toISOString() }))}
          fileName={fileName}
        />
      </main >
    </div >
  );
};
