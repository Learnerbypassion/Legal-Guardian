import React from 'react';
import { useNavigate } from 'react-router-dom';

export const SaveHistoryModal = ({ isOpen, onClose, onSave, fileName }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSave = () => {
    onSave();
    // Logic: Navigate to signup for saving (UNTOUCHED)
    navigate('/signup', { state: { from: 'save-history', shouldSaveAnalysis: true } });
  };

  return (
    <div className="fixed inset-0 bg-[#1B2F4E]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[24px] shadow-2xl max-w-md w-full overflow-hidden border border-[#E2E8F0]">
        {/* Decorative Top Accent */}
        <div className="h-2 bg-gradient-to-r from-[#1B2F4E] via-[#8A6C2A] to-[#1B2F4E]"></div>

        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-[10px] font-black text-[#8A6C2A] uppercase tracking-[0.2em] mb-1">Security Archive</h2>
              <h3 className="text-xl font-bold text-[#1B2F4E]">Secure This Analysis</h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F8FAFC] text-[#1B2F4E] hover:bg-[#1B2F4E] hover:text-white transition-all text-xl"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="mb-8">
            <p className="text-[#3D4F66] text-sm leading-relaxed mb-4">
              Access to the full analysis history is a secure feature. Would you like to preserve this report in your private ledger?
            </p>
            <div className="flex items-center p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
              <div className="w-8 h-8 bg-[#1B2F4E]/10 rounded flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-[#1B2F4E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-xs font-bold text-[#1B2F4E] truncate">{fileName}</span>
            </div>
          </div>

          {/* Benefits - Realigned to Gold theme */}
          <div className="bg-[#FAF3E4]/50 border border-[#FAF3E4] rounded-2xl p-5 mb-8">
            <p className="text-[10px] font-black text-[#8A6C2A] uppercase tracking-wider mb-3">Premium Privileges:</p>
            <ul className="space-y-3">
              {[
                'Permanent cloud-encrypted history',
                'Advanced AI clause interrogation',
                'Personalized risk profiling'
              ].map((benefit, i) => (
                <li key={i} className="flex items-center text-xs font-bold text-[#1B2F4E]">
                  <svg className="w-4 h-4 text-[#8A6C2A] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 order-2 sm:order-1 px-6 py-3 text-[11px] font-black uppercase tracking-widest text-[#3D4F66] hover:text-[#1B2F4E] transition"
            >
              Skip for Now
            </button>
            <button
              onClick={handleSave}
              className="flex-[1.5] order-1 sm:order-2 px-6 py-3 bg-[#1B2F4E] text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-[#8A6C2A] shadow-lg shadow-[#1B2F4E]/20 transition-all transform active:scale-95"
            >
              Sign In & Secure
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};