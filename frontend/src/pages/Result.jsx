import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ChatBox from '../components/ChatBox';
import { SaveHistoryModal } from '../components/SaveHistoryModal';
import { HistoryTab } from '../components/HistoryTab';
import RiskScoreCircle from '../components/RiskScoreCircle';
import { AnalysisLoading } from '../components/AnalysisLoading';
import { getRecommendedProfessionals, contactProfessional } from '../services/api';

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
  const [activeTab, setActiveTab] = useState('summary');
  const [showMenu, setShowMenu] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [professionals, setProfessionals] = useState([]);
  const [contactedIds, setContactedIds] = useState({});

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
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#CBD2DC] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavigation('/')}>
              <div className="w-10 h-10 rounded-lg bg-[#1B2F4E] flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">LG</span>
              </div>
              <h1 className="text-2xl font-bold text-[#1B2F4E]">
                Legal-Guardian
              </h1>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              <button onClick={() => handleNavigation('/')} className="text-[#3D4F66] hover:text-[#1B2F4E] font-medium transition">
                Dashboard
              </button>
              {user && (
                <>
                  <button onClick={() => navigate('/history')} className="text-[#3D4F66] hover:text-[#1B2F4E] font-medium transition">
                    History
                  </button>
                  <button onClick={() => navigate('/profile')} className="text-[#3D4F66] hover:text-[#1B2F4E] font-medium transition">
                    Profile
                  </button>
                </>
              )}
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 bg-gray-50 p-1 pr-3 rounded-full border border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-[#1B2F4E] flex items-center justify-center">
                      <span className="text-white font-bold text-xs">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-[#1B2F4E]">{user?.name}</span>
                  </div>
                  <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm">
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <button onClick={() => navigate('/login')} className="text-[#3D4F66] font-medium">Sign In</button>
                  <button onClick={() => navigate('/signup')} className="px-4 py-2 bg-[#1B2F4E] text-white rounded-lg hover:bg-[#15253d] transition font-medium">
                    Sign Up
                  </button>
                </div>
              )}
            </nav>
          </div>
        </div>
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
                {result.parties?.length > 0 && (
                  <li><strong>Parties:</strong> {result.parties.join(', ')}</li>
                )}
                {result.contractType && (
                  <li><strong>Document Type:</strong> {result.contractType}</li>
                )}
                {result.keyDates?.length > 0 && (
                  <li><strong>Critical Dates:</strong> {result.keyDates.length} found</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md border border-[#CBD2DC] overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 flex overflow-x-auto">
            {[
              { id: 'summary', label: 'Summary', icon: '📋' },
              { id: 'advantages', label: 'Advantages', icon: '✅' },
              { id: 'concerns', label: 'Concerns', icon: '⚠️' },
              { id: 'clauses', label: 'Clauses', icon: '📄' },
              { id: 'professionals', label: 'Professionals', icon: '👔' },
              { id: 'history', label: 'History', icon: '⏱️' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-bold text-sm transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-b-2 border-[#1B2F4E] text-[#1B2F4E] bg-white'
                    : 'text-[#3D4F66] hover:text-[#1B2F4E]'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
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
              <div className="grid grid-cols-1 gap-4">
                {result.highlightedClauses?.map((clause, idx) => (
                  <div key={idx} className="bg-[#F4F5F7] rounded-lg p-5 border border-gray-200">
                    <h4 className="font-bold text-[#1B2F4E] mb-2">{clause.title || `Highlighted Clause ${idx + 1}`}</h4>
                    <p className="text-gray-700 text-sm font-mono bg-white p-3 rounded border border-gray-100 mb-3 italic">"{clause.text || clause}"</p>
                    {clause.explanation && <p className="text-sm text-[#3D4F66]"><strong>Analysis:</strong> {clause.explanation}</p>}
                  </div>
                ))}
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
                        className={`w-full py-2.5 rounded-lg font-bold transition ${
                          contactedIds[prof._id] === 'Sent' ? 'bg-green-100 text-green-700' : 'bg-[#1B2F4E] text-white hover:bg-[#8A6C2A]'
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
            onClick={() => {
              if (!user) { setShowAuthPrompt(true); return; }
              const dataStr = JSON.stringify(result, null, 2);
              const dataBlob = new Blob([dataStr], { type: 'application/json' });
              const url = URL.createObjectURL(dataBlob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `LegalGuardian_Report_${fileName.replace('.pdf', '')}.json`;
              link.click();
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
              <span className="p-2 bg-[#FAF3E4] rounded-lg">💬</span> Ask Questions About This Document
            </h3>
            <ChatBox contractText={contractText || ''} language="English" />
          </div>
        </div>

        {/* Auth Prompt */}
        {showAuthPrompt && (
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
        )}

        <SaveHistoryModal
          isOpen={showSaveModal}
          onClose={() => { setShowSaveModal(false); sessionStorage.setItem('saveModalDismissed', 'true'); }}
          onSave={() => sessionStorage.setItem('pendingAnalysis', JSON.stringify({ result, fileName, documentId, timestamp: new Date().toISOString() }))}
          fileName={fileName}
        />
      </main>
    </div>
  );
};