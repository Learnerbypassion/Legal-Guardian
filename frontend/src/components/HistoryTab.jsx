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
    // Navigate to result page with the document data
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
      }
    });
  };

  const getRiskColor = (riskLevel) => {
    const colors = {
      'Low': 'text-green-600 bg-green-50',
      'Medium': 'text-yellow-600 bg-yellow-50',
      'High': 'text-orange-600 bg-orange-50',
      'Critical': 'text-red-600 bg-red-50',
    };
    return colors[riskLevel] || 'text-gray-600 bg-gray-50';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-600 font-medium">Sign in to view your document history</p>
          <p className="text-sm text-gray-500 mt-2">Your uploaded documents and analysis results will appear here</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700 text-sm font-medium">{error}</p>
        <button
          onClick={fetchDocuments}
          className="text-red-600 hover:text-red-700 text-sm font-medium mt-2"
        >
          Try again →
        </button>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg">
        <div className="text-center">
          <svg className="w-16 h-16 text-indigo-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-indigo-900 font-medium">No uploaded documents yet</p>
          <p className="text-sm text-indigo-700 mt-2">Upload and analyze a contract to see it in your history</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        <span className="font-semibold text-indigo-600">{documents.length}</span> document{documents.length !== 1 ? 's' : ''} uploaded
      </div>
      
      {documents.map((doc) => (
        <div
          key={doc._id}
          onClick={() => handleViewDocument(doc)}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-indigo-300 transition cursor-pointer"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h3 className="text-gray-900 font-semibold text-sm line-clamp-2 mb-1">
                {doc.filename}
              </h3>
              <p className="text-xs text-gray-500">
                {doc.contractType && `${doc.contractType} • `}
                {formatDate(doc.createdAt)}
              </p>
            </div>
            {doc.riskScore && (
              <div className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${getRiskColor(doc.riskScore.label)}`}>
                {doc.riskScore.label} Risk
              </div>
            )}
          </div>
          
          <p className="text-sm text-gray-700 line-clamp-2 mb-3 bg-gray-50 p-3 rounded">
            {doc.summary || 'No summary available'}
          </p>

          {doc.pros && doc.pros.length > 0 && (
            <div className="mb-2">
              <p className="text-xs font-medium text-green-600 mb-1">✓ Strengths:</p>
              <p className="text-xs text-gray-600 line-clamp-1">
                {Array.isArray(doc.pros) ? (doc.pros[0].clause || doc.pros[0].explanation || doc.pros[0]) : doc.pros}
              </p>
            </div>
          )}

          {doc.cons && doc.cons.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium text-red-600 mb-1">✗ Concerns:</p>
              <p className="text-xs text-gray-600 line-clamp-1">
                {Array.isArray(doc.cons) ? (doc.cons[0].clause || doc.cons[0].explanation || doc.cons[0]) : doc.cons}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-500">
              Click to view full analysis
            </span>
            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
};
