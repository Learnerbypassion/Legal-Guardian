import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getUserDocuments } from '../services/api';
import toast from 'react-hot-toast';

export const HistoryTab = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Logic: Authentication check and fetching 
  useEffect(() => {
    if (!user) {
      setDocuments([]);
      return;
    }
    fetchDocuments();
  }, [user]);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getUserDocuments();
      if (response.success) {
        setDocuments(response.data || []);
      } else {
        setError('Failed to load document history');
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to load document history');
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = (doc) => {
    // Navigation logic with state 
    navigate('/result', {
      state: {
        result: {
          summary: doc.summary,
          pros: doc.pros,
          cons: doc.cons,
          highlightedClauses: doc.highlightedClauses,
          overallAdvice: doc.overallAdvice,
          riskScore: doc.riskScore,
        },
        documentId: doc._id,
        fileName: doc.filename,
        contractText: doc.contractText,
      }
    });
  };

  // Color logic updated for professional palette
  const getRiskColor = (riskLevel) => {
    const colors = {
      'Low': 'text-green-700 bg-green-50 border-green-200',
      'Medium': 'text-yellow-700 bg-yellow-50 border-yellow-200',
      'High': 'text-orange-700 bg-orange-50 border-orange-200',
      'Critical': 'text-red-700 bg-red-50 border-red-200',
    };
    return colors[riskLevel] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-[#F8FAFC] border border-dashed border-[#CBD2DC] rounded-2xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#FAF3E4] rounded-full flex items-center justify-center mx-auto mb-4">
             <svg className="w-8 h-8 text-[#1B2F4E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-[#1B2F4E] font-bold uppercase tracking-widest text-xs mb-1">Archive Locked</p>
          <p className="text-xs text-[#3D4F66]">Sign in to view your document history</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-lg h-8 w-8 border-2 border-[#8A6C2A] border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-xl p-5 text-center">
        <p className="text-red-700 text-sm font-bold mb-3">{error}</p>
        <button
          onClick={fetchDocuments}
          className="text-xs font-black uppercase tracking-widest text-[#1B2F4E] hover:text-[#8A6C2A] transition-colors"
        >
          Retry Connection →
        </button>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-[#FAF3E4]/30 border border-[#FAF3E4] rounded-2xl">
        <div className="text-center">
          <svg className="w-16 h-16 text-[#8A6C2A]/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-[#1B2F4E] font-bold uppercase tracking-widest text-xs mb-1">Repository Empty</p>
          <p className="text-xs text-[#3D4F66]">Upload a contract to begin your analysis archive</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between px-1">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8A6C2A]">
          Document Ledger
        </div>
        <div className="text-xs font-bold text-[#1B2F4E]">
          {documents.length} <span className="text-gray-400 font-medium">Entries</span>
        </div>
      </div>
      
      {documents.map((doc) => (
        <div
          key={doc._id}
          onClick={() => handleViewDocument(doc)}
          className="group bg-white border border-[#E2E8F0] rounded-xl p-5 hover:shadow-xl hover:border-[#8A6C2A]/50 transition-all cursor-pointer relative overflow-hidden"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-[#1B2F4E] font-bold text-sm line-clamp-1 mb-1 group-hover:text-[#8A6C2A] transition-colors">
                {doc.filename}
              </h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {doc.contractType && `${doc.contractType} • `}
                {formatDate(doc.createdAt)}
              </p>
            </div>
            {doc.riskScore && (
              <div className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter border ${getRiskColor(doc.riskScore.label)}`}>
                {doc.riskScore.label} RISK
              </div>
            )}
          </div>
          
          <div className="bg-[#F8FAFC] border-l-2 border-[#1B2F4E] p-3 rounded-r-lg mb-4">
            <p className="text-xs text-[#3D4F66] line-clamp-2 italic leading-relaxed">
              "{doc.summary || 'No summary available'}"
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            {doc.pros && doc.pros.length > 0 && (
              <div>
                <p className="text-[9px] font-black text-green-700 uppercase tracking-widest mb-1">Positive Clauses</p>
                <p className="text-[11px] text-gray-500 line-clamp-1 font-medium">
                  {Array.isArray(doc.pros) ? (doc.pros[0].clause || doc.pros[0].explanation || doc.pros[0]) : doc.pros}
                </p>
              </div>
            )}
            {doc.cons && doc.cons.length > 0 && (
              <div>
                <p className="text-[9px] font-black text-red-700 uppercase tracking-widest mb-1">Liability Risks</p>
                <p className="text-[11px] text-gray-500 line-clamp-1 font-medium">
                  {Array.isArray(doc.cons) ? (doc.cons[0].clause || doc.cons[0].explanation || doc.cons[0]) : doc.cons}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-50">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-[#1B2F4E] transition-colors">
              Access Full Dossier
            </span>
            <svg className="w-4 h-4 text-[#8A6C2A] transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
};