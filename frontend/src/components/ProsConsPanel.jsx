import { severityColor } from "../utils/formatResponse";

export default function ProsConsPanel({ pros = [], cons = [] }) {
  return (
    <div style={styles.grid}>
      {/* Pros */}
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={{ ...styles.dot, background: "#22c55e" }} />
          <h3 style={styles.heading}>Benefits</h3>
          <span style={{ ...styles.count, color: "#22c55e" }}>{pros.length}</span>
        </div>
        <div style={styles.list}>
          {pros.length === 0 ? (
            <p style={styles.empty}>No significant benefits detected.</p>
          ) : (
            pros.map((pro, i) => (
              <div key={i} style={styles.item}>
                <div style={styles.itemHeader}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <p style={{ ...styles.clause, color: "#22c55e" }}>{pro.clause}</p>
                </div>
                <p style={styles.explanation}>{pro.explanation}</p>
                {pro.advice && (
                  <div style={styles.advice}>
                    <span style={styles.adviceLabel}>💡 Tip:</span> {pro.advice}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Cons */}
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={{ ...styles.dot, background: "#ef4444" }} />
          <h3 style={styles.heading}>Risks</h3>
          <span style={{ ...styles.count, color: "#ef4444" }}>{cons.length}</span>
        </div>
        <div style={styles.list}>
          {cons.length === 0 ? (
            <p style={styles.empty}>No significant risks detected.</p>
          ) : (
            cons.map((con, i) => (
              <div key={i} style={{ ...styles.item, borderColor: `${severityColor(con.severity)}22` }}>
                <div style={styles.itemHeader}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={severityColor(con.severity)} strokeWidth="2.5">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <p style={{ ...styles.clause, color: severityColor(con.severity) }}>{con.clause}</p>
                  {con.severity && (
                    <span style={{ ...styles.severityBadge, background: `${severityColor(con.severity)}18`, color: severityColor(con.severity), borderColor: `${severityColor(con.severity)}44` }}>
                      {con.severity}
                    </span>
                  )}
                </div>
                <p style={styles.explanation}>{con.explanation}</p>
                {con.advice && (
                  <div style={{ ...styles.advice, background: "rgba(239, 68, 68, 0.06)", borderColor: "rgba(239, 68, 68, 0.2)" }}>
                    <span style={{ ...styles.adviceLabel, color: "#fca5a5" }}>⚠️ Action:</span>{" "}
                    <span style={{ color: "#fca5a5" }}>{con.advice}</span>
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
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" },
  card: {
    background: "#111827", border: "1px solid #1f2937",
    borderRadius: "20px", padding: "24px", display: "flex", flexDirection: "column", gap: "16px",
  },
  header: { display: "flex", alignItems: "center", gap: "10px" },
  dot: { width: "8px", height: "8px", borderRadius: "50%" },
  heading: { color: "#e8eaf0", fontSize: "15px", fontWeight: 600, flex: 1 },
  count: { fontSize: "13px", fontFamily: "'DM Mono', monospace", fontWeight: 600 },
  list: { display: "flex", flexDirection: "column", gap: "14px" },
  empty: { color: "#4a5568", fontSize: "13px", fontStyle: "italic" },
  item: {
    padding: "14px", borderRadius: "12px",
    background: "#0d1117", border: "1px solid #1f2937",
    display: "flex", flexDirection: "column", gap: "8px",
  },
  itemHeader: { display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" },
  clause: { fontSize: "13px", fontWeight: 600, fontFamily: "'DM Mono', monospace" },
  severityBadge: {
    padding: "2px 8px", borderRadius: "100px", fontSize: "10px",
    fontFamily: "'DM Mono', monospace", border: "1px solid", textTransform: "uppercase",
  },
  explanation: { color: "#9ca3af", fontSize: "13px", lineHeight: 1.6 },
  advice: {
    padding: "8px 12px", borderRadius: "8px",
    background: "rgba(34, 197, 94, 0.06)", border: "1px solid rgba(34, 197, 94, 0.2)",
    fontSize: "12px", color: "#86efac", lineHeight: 1.5,
  },
  adviceLabel: { fontWeight: 600, color: "#22c55e" },
};
