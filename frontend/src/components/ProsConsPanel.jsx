import { severityColor } from "../utils/formatResponse";

export default function ProsConsPanel({ pros = [], cons = [] }) {
  return (
    <div style={styles.grid}>
      {/* Pros - Benefits Section */}
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={{ ...styles.dot, background: "#16a34a" }} />
          <h3 style={styles.heading}>Contractual Advantages</h3>
          <span style={{ ...styles.count, color: "#16a34a" }}>{pros.length}</span>
        </div>
        <div style={styles.list}>
          {pros.length === 0 ? (
            <p style={styles.empty}>No significant benefits detected.</p>
          ) : (
            pros.map((pro, i) => (
              <div key={i} style={styles.item}>
                <div style={styles.itemHeader}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <p style={{ ...styles.clause, color: "#16a34a" }}>{pro.clause}</p>
                </div>
                <p style={styles.explanation}>{pro.explanation}</p>
                {pro.advice && (
                  <div style={styles.advice}>
                    <span style={styles.adviceLabel}>💡 Recommendation:</span> {pro.advice}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Cons - Risks Section */}
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={{ ...styles.dot, background: "#dc2626" }} />
          <h3 style={styles.heading}>Liability Risks</h3>
          <span style={{ ...styles.count, color: "#dc2626" }}>{cons.length}</span>
        </div>
        <div style={styles.list}>
          {cons.length === 0 ? (
            <p style={styles.empty}>No significant risks detected.</p>
          ) : (
            cons.map((con, i) => (
              <div key={i} style={{ ...styles.item, borderLeft: `4px solid ${severityColor(con.severity)}` }}>
                <div style={styles.itemHeader}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={severityColor(con.severity)} strokeWidth="2.5">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <p style={{ ...styles.clause, color: "#1B2F4E" }}>{con.clause}</p>
                  {con.severity && (
                    <span style={{ 
                      ...styles.severityBadge, 
                      background: `${severityColor(con.severity)}12`, 
                      color: severityColor(con.severity), 
                      borderColor: `${severityColor(con.severity)}33` 
                    }}>
                      {con.severity}
                    </span>
                  )}
                </div>
                <p style={styles.explanation}>{con.explanation}</p>
                {con.advice && (
                  <div style={{ ...styles.advice, background: "rgba(220, 38, 38, 0.04)", borderColor: "rgba(220, 38, 38, 0.1)" }}>
                    <span style={{ ...styles.adviceLabel, color: "#dc2626" }}>⚠️ Action Required:</span>{" "}
                    <span style={{ color: "#3D4F66" }}>{con.advice}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" },
  card: {
    background: "#FFFFFF", 
    border: "1px solid #E2E8F0",
    borderRadius: "24px", 
    padding: "28px", 
    display: "flex", 
    flexDirection: "column", 
    gap: "20px",
    boxShadow: "0 4px 12px rgba(27, 47, 78, 0.03)"
  },
  header: { display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid #F1F5F9", paddingBottom: "12px" },
  dot: { width: "7px", height: "7px", borderRadius: "50%" },
  heading: { 
    color: "#1B2F4E", 
    fontSize: "14px", 
    fontWeight: 800, 
    flex: 1, 
    textTransform: "uppercase", 
    letterSpacing: "0.05em" 
  },
  count: { fontSize: "12px", fontWeight: 700, opacity: 0.8 },
  list: { display: "flex", flexDirection: "column", gap: "16px" },
  empty: { color: "#94A3B8", fontSize: "13px", fontStyle: "italic", textAlign: "center", padding: "20px" },
  item: {
    padding: "16px", 
    borderRadius: "12px",
    background: "#F8FAFC", 
    border: "1px solid #E2E8F0",
    display: "flex", 
    flexDirection: "column", 
    gap: "10px",
    transition: "transform 0.2s ease"
  },
  itemHeader: { display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" },
  clause: { fontSize: "13px", fontWeight: 700, letterSpacing: "-0.01em" },
  severityBadge: {
    padding: "2px 10px", borderRadius: "6px", fontSize: "9px",
    fontWeight: 800, border: "1px solid", textTransform: "uppercase",
  },
  explanation: { color: "#475569", fontSize: "13px", lineHeight: 1.6, fontWeight: 500 },
  advice: {
    padding: "10px 14px", borderRadius: "8px",
    background: "rgba(22, 163, 74, 0.04)", border: "1px solid rgba(22, 163, 74, 0.1)",
    fontSize: "12px", color: "#166534", lineHeight: 1.5,
  },
  adviceLabel: { fontWeight: 800, textTransform: "uppercase", fontSize: "10px", letterSpacing: "0.02em" },
};