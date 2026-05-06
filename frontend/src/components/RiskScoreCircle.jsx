export default function RiskScoreCircle({ score = 0, label = 'Unknown' }) {
  const percentage = (score / 10) * 100;

  
  let color = '#16a34a'; // Refined green
  if (score >= 5) {
    color = '#dc2626'; // Refined red
  } else if (score >= 3) {
    color = '#ca8a04'; // Refined gold-amber
  }

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  // Tailored text colors for the new theme
  const textColor = score >= 5 ? 'text-red-700' : score >= 3 ? 'text-yellow-700' : 'text-green-700';

  return (
    <div className="flex flex-col items-center p-8 bg-white rounded-[32px] border border-[#E2E8F0] shadow-sm">
      <div className="relative w-56 h-56 flex items-center justify-center">
        {/* Progress Background */}
        <svg width="224" height="224" className="absolute">
          <circle
            cx="112"
            cy="112"
            r={radius}
            fill="none"
            stroke="#F1F5F9"
            strokeWidth="12"
          />
          {/* Progress Circle */}
          <circle
            cx="112"
            cy="112"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
            style={{
              transform: 'rotate(-90deg)',
              transformOrigin: '112px 112px',
            }}
          />
        </svg>

        {/* Central Score Display */}
        <div className="text-center z-10">
          <p className={`text-6xl font-black tracking-tighter ${textColor}`}>{score.toFixed(1)}</p>
          <div className="h-1 w-8 bg-[#8A6C2A] mx-auto my-1 rounded-full opacity-30"></div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#1B2F4E]">Scale 10.0</p>
        </div>
      </div>

      {/* Narrative Section */}
      <div className="text-center mt-6">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8A6C2A] mb-1">Risk Assessment</h3>
        <p className={`text-2xl font-bold uppercase tracking-tight text-[#1B2F4E]`}>{label}</p>
        
        {/* Percentage Badge */}
        <div className="mt-4 inline-flex items-center px-4 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-full">
          <span className="flex h-2 w-2 rounded-full mr-2" style={{ backgroundColor: color }}></span>
          <p className="text-[11px] font-bold text-[#3D4F66] uppercase tracking-wider">{percentage.toFixed(0)}% Intensity</p>
        </div>
      </div>
    </div>
  );
}