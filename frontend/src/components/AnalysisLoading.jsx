import React, { useState, useEffect } from 'react';

export const AnalysisLoading = ({ status = 'reading' }) => {
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationStep(prev => (prev + 1) % 4);
    }, 600);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    { id: 'reading', label: 'Reading document...', icon: '📄' },
    { id: 'analyzing', label: 'Analyzing clauses...', icon: '🔍' },
    { id: 'detecting', label: 'Detecting risks...', icon: '⚠️' }
  ];

  const getStepStatus = (stepId) => {
    const statusOrder = ['reading', 'analyzing', 'detecting'];
    const currentIndex = statusOrder.indexOf(status);
    const stepIndex = statusOrder.indexOf(stepId);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center relative overflow-hidden">
      {/* Refreshed background elements using Gold/Navy palette */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-80 h-80 bg-[#FAF3E4] rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-[#1B2F4E]/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 text-center">
        {/* Document Icon with Theme Update */}
        <div className="flex justify-center mb-10">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-white border-2 border-[#CBD2DC] flex items-center justify-center shadow-2xl">
              <span className="text-5xl">📄</span>
            </div>
            {/* Rotating border animation using Gold and Navy accents */}
            <div className="absolute -inset-5 rounded-full border-2 border-transparent border-t-[#8A6C2A] border-r-[#1B2F4E] animate-spin" style={{ animationDuration: '3s' }}></div>
          </div>
        </div>

        {/* Title & Tagline */}
        <h2 className="text-4xl font-extrabold text-[#1B2F4E] mb-2 uppercase tracking-tight">Legal AI Processing</h2>
        <p className="text-[#3D4F66] text-lg font-medium mb-12">Applying advanced risk assessment to your contract...</p>

        {/* Progress Steps - Logic Intact, Visuals Updated */}
        <div className="space-y-6 mb-12 max-w-sm mx-auto">
          {steps.map((step, idx) => {
            const stepStatus = getStepStatus(step.id);
            return (
              <div key={step.id} className="flex items-center gap-5 bg-white/50 p-3 rounded-xl border border-transparent transition-all">
                {/* Status Indicator */}
                <div className="flex-shrink-0">
                  {stepStatus === 'completed' ? (
                    <div className="w-6 h-6 rounded-lg bg-green-600 flex items-center justify-center shadow-sm">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  ) : stepStatus === 'active' ? (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg border-2 border-[#8A6C2A] border-t-transparent animate-spin"></div>
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-lg border-2 border-[#CBD2DC] bg-gray-50"></div>
                  )}
                </div>

                {/* Step Label with theme-aware logic */}
                <span className={`text-sm font-bold uppercase tracking-widest ${
                  stepStatus === 'completed'
                    ? 'text-green-700'
                    : stepStatus === 'active'
                    ? 'text-[#1B2F4E]'
                    : 'text-gray-400'
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Aesthetic Accents */}
        <div className="absolute bottom-10 left-10 w-2 h-2 bg-[#8A6C2A] rounded-full animate-ping"></div>
      </div>
    </div>
  );
};