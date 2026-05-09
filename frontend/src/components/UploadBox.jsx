import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../context/AuthContext';
import Cookies from 'js-cookie';

const LANGUAGES = ['English', 'Hindi', 'Bengali'];
const USER_TYPES = [
  { value: 'general', label: 'General' },
  { value: 'freelancer', label: 'Freelancer' },
  { value: 'business', label: 'Business Owner' },
  { value: 'student', label: 'Student' },
];

export const UploadBox = ({ uploading, setUploading, analysisStatus, setAnalysisStatus }) => {
  const { user } = useAuth();
  const [language, setLanguage] = useState('English');
  const [userType, setUserType] = useState('general');
  const [selectedFile, setSelectedFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const onDrop = useCallback((accepted) => {
    if (accepted[0]) {
      setSelectedFile(accepted[0]);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    disabled: uploading,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setProgress(0);
    setAnalysisStatus('reading');

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 45) {
            clearInterval(progressInterval);
            return 45;
          }
          return prev + Math.random() * 20;
        });
      }, 200);

      const formData = new FormData();
      formData.append('contract', selectedFile);
      formData.append('language', language);
      formData.append('userType', userType);

      const token = Cookies.get('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      const uploadResponse = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
        method: 'POST',
        headers: headers,
        body: formData,
      });

      if (!uploadResponse.ok) throw new Error('Upload failed');

      const uploadData = await uploadResponse.json();
      setProgress(50);
      setAnalysisStatus('analyzing');

      const analyzeResponse = await fetch(`${import.meta.env.VITE_API_URL}/ai/analyze`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contractText: uploadData.contractText,
          filename: uploadData.filename,
          charCount: uploadData.charCount,
          language: language,
          userType: userType,
          pdfBuffer: uploadData.pdfBuffer
        })
      });

      clearInterval(progressInterval);
      setAnalysisStatus('detecting');

      if (!analyzeResponse.ok) throw new Error('Analysis failed');

      const analysisData = await analyzeResponse.json();
      setProgress(100);

      setTimeout(() => {
        const resultData = {
          result: analysisData,
          fileName: uploadData.filename,
          documentId: uploadData.documentId,
          isUnauthenticated: !user,
          contractText: uploadData.contractText
        };
        localStorage.setItem('lastAnalysis', JSON.stringify(resultData));
        setUploading(false);
        navigate('/result', { state: resultData });
      }, 500);
    } catch (err) {
      setError(err.message || 'Upload or analysis failed. Please try again.');
      setUploading(false);
      setProgress(0);
      setAnalysisStatus('reading');
    }
  };

  return (
    <div className="space-y-8">
      {/* Drop Zone - Refreshed with Navy/Gold logic */}
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
          isDragActive
            ? 'border-[#8A6C2A] bg-[#FAF3E4]'
            : selectedFile
            ? 'border-[#1B2F4E] bg-white shadow-md'
            : 'border-[#CBD2DC] bg-[#F8FAFC] hover:border-[#1B2F4E] hover:bg-white'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white border border-[#CBD2DC] flex items-center justify-center shadow-sm">
            <svg
              className={`w-8 h-8 ${
                selectedFile ? 'text-[#8A6C2A]' : 'text-[#1B2F4E]'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>

          {selectedFile ? (
            <div>
              <p className="font-bold text-[#1B2F4E]">{selectedFile.name}</p>
              <p className="text-xs text-[#8A6C2A] font-bold uppercase tracking-widest mt-1">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB — Click to Change
              </p>
            </div>
          ) : (
            <div>
              <p className="text-xl font-extrabold text-[#1B2F4E]">
                {isDragActive ? 'Release to Upload' : 'Drag & drop your file'}
              </p>
              <p className="text-sm text-[#3D4F66] mt-1">PDF, TXT, DOC, DOCX up to 10MB</p>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Options - Refreshed Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* User Type */}
        <div>
          <label className="block text-xs font-bold text-[#8A6C2A] uppercase tracking-widest mb-4">
            User Type
          </label>
          <div className="flex flex-wrap gap-2">
            {USER_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => setUserType(type.value)}
                disabled={uploading}
                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all border-2 ${
                  userType === type.value
                    ? 'bg-[#1B2F4E] text-white border-[#1B2F4E] shadow-md'
                    : 'bg-white text-[#1B2F4E] border-[#CBD2DC] hover:border-[#1B2F4E]'
                } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Language */}
        <div>
          <label className="block text-xs font-bold text-[#8A6C2A] uppercase tracking-widest mb-4">
            Output Language
          </label>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                disabled={uploading}
                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all border-2 ${
                  language === lang
                    ? 'bg-[#1B2F4E] text-white border-[#1B2F4E] shadow-md'
                    : 'bg-white text-[#1B2F4E] border-[#CBD2DC] hover:border-[#1B2F4E]'
                } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      </div>

      
      <button
        onClick={handleSubmit}
        disabled={!selectedFile || uploading}
        className={`w-full py-4 px-6 rounded-xl font-bold transition-all flex items-center justify-center gap-3 shadow-lg ${
          !selectedFile || uploading
            ? 'bg-[#CBD2DC] text-gray-500 cursor-not-allowed shadow-none'
            : 'bg-[#1B2F4E] text-white hover:bg-[#8A6C2A] transform hover:-translate-y-0.5'
        }`}
      >
        {uploading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="uppercase tracking-widest">Processing Analysis...</span>
          </>
        ) : (
          <>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="uppercase tracking-widest">Analyze Document</span>
          </>
        )}
      </button>

      {/* Info Panel */}
      <div className="bg-[#FAF3E4] border border-[#8A6C2A]/20 rounded-2xl p-6">
        <h4 className="text-[#1B2F4E] font-bold mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
           <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"/></svg>
           How it works
        </h4>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-xs font-bold text-[#3D4F66]">
          <li className="flex items-center gap-2">✓ Upload your document</li>
          <li className="flex items-center gap-2">✓ Get summary, insights, and risk assessment</li>
          <li className="flex items-center gap-2">✓ AI analyzes the content</li>
          <li className="flex items-center gap-2">✓ Download your analysis report</li>
        </ul>
      </div>
    </div>
  );
};