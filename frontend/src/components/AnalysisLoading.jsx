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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 text-center">
        {/* Document Icon with Animation */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-white border-4 border-indigo-200 flex items-center justify-center shadow-xl">
              <span className="text-5xl">📄</span>
            </div>
            {/* Rotating border animation */}
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-600 border-r-indigo-400 animate-spin" style={{ animationDuration: '3s' }}></div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-4xl font-bold text-gray-900 mb-2">Analyzing Document</h2>
        <p className="text-gray-500 text-lg mb-8">Securely processing your legal data...</p>

        {/* Progress Steps */}
        <div className="space-y-4 mb-12 max-w-md mx-auto">
          {steps.map((step, idx) => {
            const stepStatus = getStepStatus(step.id);
            return (
              <div key={step.id} className="flex items-center gap-4">
                {/* Status Indicator */}
                <div className="flex-shrink-0">
                  {stepStatus === 'completed' ? (
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  ) : stepStatus === 'active' ? (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin"></div>
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                  )}
                </div>

                {/* Step Label */}
                <span className={`text-lg font-medium ${
                  stepStatus === 'completed'
                    ? 'text-green-600'
                    : stepStatus === 'active'
                    ? 'text-indigo-600'
                    : 'text-gray-400'
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 text-gray-600">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 111.414 1.414L7.414 8l3.293 3.293a1 1 0 11-1.414 1.414l-4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium tracking-widest uppercase">AES-256 ENCRYPTED ENVIRONMENT</span>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 11-1.414-1.414L12.586 12l-3.293-3.293a1 1 0 111.414-1.414l4 4z" clipRule="evenodd" />
          </svg>
        </div>

        {/* Floating dots animation (bottom right) */}
        <div className="absolute bottom-8 right-8 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};
