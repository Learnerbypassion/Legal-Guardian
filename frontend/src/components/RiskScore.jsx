import { getRiskColor } from "../utils/formatResponse";

export default function RiskScore({ riskScore }) {
  if (!riskScore) return null;

  const { score, label, description, detectedKeywords } = riskScore;
  const color = getRiskColor(score);
  const percent = (score / 10) * 100;

  // SVG circle params
  const R = 54;
  const C = 2 * Math.PI * R;
  const offset = C - (percent / 100) * C;

  return (
    <div style={styles.card}>
      <h3 style={styles.heading}>Risk Assessment</h3>

      <div style={styles.body}>
        {/* Circular gauge */}
        <div style={styles.gaugeWrap}>
          <svg width="140" height="140" viewBox="0 0 140 140">
            {/* Track */}
            <circle cx="70" cy="70" r={R} fill="none" stroke="#1e2635" strokeWidth="10" />
            {/* Progress */}
            <circle
              cx="70" cy="70" r={R} fill="none"
              stroke={color} strokeWidth="10"
              strokeDasharray={C}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform="rotate(-90 70 70)"
              style={{ transition: "stroke-dashoffset 1s ease" }}
            />
            {/* Score text */}
            <text x="70" y="65" textAnchor="middle" fill={color}
              style={{ fontSize: "28px", fontWeight: 700, fontFamily: "'DM Serif Display', serif" }}>
              {score}
            </text>
            <text x="70" y="84" textAnchor="middle" fill="#6b7280"
              style={{ fontSize: "11px", fontFamily: "'DM Mono', monospace" }}>
              /10
            </text>
          </svg>

          <div style={{ ...styles.badge, background: `${color}18`, borderColor: color, color }}>
            {label} Risk
          </div>
        </div>

        {/* Description */}
        <div style={styles.info}>
          <p style={styles.description}>{description}</p>

          {detectedKeywords?.length > 0 && (
            <div style={styles.keywords}>
              <p style={styles.kwLabel}>Detected clauses:</p>
              <div style={styles.kwList}>
                {detectedKeywords.map((kw) => (
                  <span key={kw} style={styles.kw}>{kw}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scale bar */}
      <div style={styles.scale}>
        <div style={styles.scaleBar}>
          <div style={{ ...styles.scaleFill, width: `${percent}%`, background: color }} />
        </div>
        <div style={styles.scaleLabels}>
          <span style={{ color: "#22c55e" }}>Low</span>
          <span style={{ color: "#f59e0b" }}>Moderate</span>
          <span style={{ color: "#ef4444" }}>High</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "#111827", border: "1px solid #1f2937",
    borderRadius: "20px", padding: "28px", display: "flex", flexDirection: "column", gap: "20px",
  },
  heading: { color: "#e8eaf0", fontSize: "16px", fontWeight: 600 },
  body: { display: "flex", gap: "24px", alignItems: "center", flexWrap: "wrap" },
  gaugeWrap: { display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" },
  badge: {
    padding: "4px 14px", borderRadius: "100px", fontSize: "13px",
    fontWeight: 600, border: "1px solid", fontFamily: "'DM Mono', monospace",
  },
  info: { flex: 1, display: "flex", flexDirection: "column", gap: "14px", minWidth: "180px" },
  description: { color: "#9ca3af", fontSize: "14px", lineHeight: 1.6 },
  keywords: { display: "flex", flexDirection: "column", gap: "8px" },
  kwLabel: { color: "#6b7280", fontSize: "11px", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.08em" },
  kwList: { display: "flex", flexWrap: "wrap", gap: "6px" },
  kw: {
    padding: "3px 10px", borderRadius: "6px", fontSize: "12px",
    background: "rgba(239, 68, 68, 0.1)", color: "#fca5a5",
    border: "1px solid rgba(239, 68, 68, 0.2)", fontFamily: "'DM Mono', monospace",
  },
  scale: { display: "flex", flexDirection: "column", gap: "6px" },
  scaleBar: { height: "6px", background: "#1e2635", borderRadius: "3px", overflow: "hidden" },
  scaleFill: { height: "100%", borderRadius: "3px", transition: "width 1s ease" },
  scaleLabels: { display: "flex", justifyContent: "space-between", fontSize: "11px", fontFamily: "'DM Mono', monospace" },
};
