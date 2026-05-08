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
      <h3 style={styles.heading}>Risk Analysis Report</h3>

      <div style={styles.body}>
        {/* Circular gauge */}
        <div style={styles.gaugeWrap}>
          <div style={styles.svgContainer}>
            <svg width="140" height="140" viewBox="0 0 140 140">
              {/* Track - Refined Slate */}
              <circle cx="70" cy="70" r={R} fill="none" stroke="#F1F5F9" strokeWidth="12" />
              {/* Progress - Dynamic Color */}
              <circle
                cx="70" cy="70" r={R} fill="none"
                stroke={color} strokeWidth="12"
                strokeDasharray={C}
                strokeDashoffset={offset}
                strokeLinecap="round"
                transform="rotate(-90 70 70)"
                style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)" }}
              />
              {/* Score text - Swapped to Navy for clarity */}
              <text x="70" y="72" textAnchor="middle" fill="#1B2F4E"
                style={{ fontSize: "32px", fontWeight: 900, fontFamily: "inherit" }}>
                {score}
              </text>
            </svg>
          </div>

          <div style={{ ...styles.badge, background: `${color}12`, borderColor: `${color}33`, color }}>
            {label} RISK LEVEL
          </div>
        </div>

        {/* Description */}
        <div style={styles.info}>
          <div style={styles.descContainer}>
            <p style={styles.description}>{description}</p>
          </div>

          {detectedKeywords?.length > 0 && (
            <div style={styles.keywords}>
              <p style={styles.kwLabel}>High-Risk Flags Detected:</p>
              <div style={styles.kwList}>
                {detectedKeywords.map((kw) => (
                  <span key={kw} style={{ ...styles.kw, borderColor: `${color}22` }}>{kw}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scale bar - Corporate Styled */}
      <div style={styles.scale}>
        <div style={styles.scaleBar}>
          <div style={{ ...styles.scaleFill, width: `${percent}%`, background: color }} />
        </div>
        <div style={styles.scaleLabels}>
          <span style={styles.labelLow}>LOW</span>
          <span style={styles.labelMod}>MODERATE</span>
          <span style={styles.labelHigh}>HIGH</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "#FFFFFF", 
    border: "1px solid #E2E8F0",
    borderRadius: "24px", 
    padding: "32px", 
    display: "flex", 
    flexDirection: "column", 
    gap: "28px",
    boxShadow: "0 10px 25px -5px rgba(27, 47, 78, 0.05)"
  },
  heading: { 
    color: "#1B2F4E", 
    fontSize: "14px", 
    fontWeight: 800, 
    textTransform: "uppercase", 
    letterSpacing: "0.15em",
    borderBottom: "1px solid #F1F5F9",
    paddingBottom: "16px"
  },
  body: { display: "flex", gap: "32px", alignItems: "center", flexWrap: "wrap" },
  gaugeWrap: { display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" },
  svgContainer: { position: "relative" },
  badge: {
    padding: "6px 16px", 
    borderRadius: "8px", 
    fontSize: "11px",
    fontWeight: 900, 
    border: "1px solid", 
    letterSpacing: "0.05em"
  },
  info: { flex: 1, display: "flex", flexDirection: "column", gap: "18px", minWidth: "220px" },
  descContainer: { borderLeft: "3px solid #8A6C2A", paddingLeft: "16px" },
  description: { color: "#475569", fontSize: "14px", lineHeight: 1.7, fontWeight: 500 },
  keywords: { display: "flex", flexDirection: "column", gap: "10px" },
  kwLabel: { color: "#1B2F4E", fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" },
  kwList: { display: "flex", flexWrap: "wrap", gap: "8px" },
  kw: {
    padding: "4px 12px", 
    borderRadius: "6px", 
    fontSize: "11px",
    background: "#F8FAFC", 
    color: "#1B2F4E",
    border: "1px solid #E2E8F0", 
    fontWeight: 700
  },
  scale: { display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" },
  scaleBar: { height: "8px", background: "#F1F5F9", borderRadius: "4px", overflow: "hidden" },
  scaleFill: { height: "100%", borderRadius: "4px", transition: "width 1.5s cubic-bezier(0.4, 0, 0.2, 1)" },
  scaleLabels: { display: "flex", justifyContent: "space-between", fontSize: "9px", fontWeight: 800, letterSpacing: "0.05em" },
  labelLow: { color: "#16a34a" },
  labelMod: { color: "#ca8a04" },
  labelHigh: { color: "#dc2626" },
};