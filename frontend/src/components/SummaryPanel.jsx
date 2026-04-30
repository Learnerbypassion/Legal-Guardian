export default function SummaryPanel({ result }) {
  if (!result) return null;

  const { summary, contractType, parties, keyDates, overallAdvice } = result;

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.heading}>Summary</h3>
        <div style={styles.typeBadge}>{contractType}</div>
      </div>

      {/* Parties */}
      {parties?.length > 0 && (
        <div style={styles.section}>
          <p style={styles.label}>Parties Involved</p>
          <div style={styles.parties}>
            {parties.map((p, i) => (
              <span key={i} style={styles.party}>{p}</span>
            ))}
          </div>
        </div>
      )}

      {/* Key Points */}
      <div style={styles.section}>
        <p style={styles.label}>Key Points</p>
        <ul style={styles.list}>
          {summary.map((point, i) => (
            <li key={i} style={styles.listItem}>
              <span style={styles.dot} />
              <span style={styles.listText}>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Key Dates */}
      {keyDates?.length > 0 && (
        <div style={styles.section}>
          <p style={styles.label}>Key Dates</p>
          <div style={styles.dateGrid}>
            {keyDates.map((d, i) => (
              <div key={i} style={styles.dateItem}>
                <p style={styles.dateLabel}>{d.label}</p>
                <p style={styles.dateValue}>{d.date}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overall Advice */}
      {overallAdvice && (
        <div style={styles.advice}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p style={styles.adviceText}>{overallAdvice}</p>
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    background: "#111827", border: "1px solid #1f2937",
    borderRadius: "20px", padding: "28px", display: "flex", flexDirection: "column", gap: "20px",
  },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" },
  heading: { color: "#e8eaf0", fontSize: "16px", fontWeight: 600 },
  typeBadge: {
    padding: "4px 12px", borderRadius: "100px", fontSize: "12px",
    background: "rgba(96, 165, 250, 0.1)", color: "#60a5fa",
    border: "1px solid rgba(96, 165, 250, 0.2)", fontFamily: "'DM Mono', monospace",
  },
  section: { display: "flex", flexDirection: "column", gap: "10px" },
  label: {
    color: "#6b7280", fontSize: "11px", fontFamily: "'DM Mono', monospace",
    textTransform: "uppercase", letterSpacing: "0.08em",
  },
  parties: { display: "flex", flexWrap: "wrap", gap: "8px" },
  party: {
    padding: "5px 12px", borderRadius: "8px", fontSize: "13px",
    background: "#1e2635", color: "#9ca3af", border: "1px solid #2a3040",
    fontFamily: "'DM Mono', monospace",
  },
  list: { listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" },
  listItem: { display: "flex", gap: "10px", alignItems: "flex-start" },
  dot: {
    width: "6px", height: "6px", borderRadius: "50%",
    background: "#22c55e", marginTop: "7px", flexShrink: 0,
  },
  listText: { color: "#d1d5db", fontSize: "14px", lineHeight: 1.6 },
  dateGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "10px" },
  dateItem: {
    padding: "12px", borderRadius: "10px",
    background: "#0d1117", border: "1px solid #1f2937",
  },
  dateLabel: { color: "#6b7280", fontSize: "11px", fontFamily: "'DM Mono', monospace", marginBottom: "4px" },
  dateValue: { color: "#e8eaf0", fontSize: "13px", fontWeight: 500 },
  advice: {
    display: "flex", gap: "10px", alignItems: "flex-start",
    padding: "14px 16px", borderRadius: "12px",
    background: "rgba(96, 165, 250, 0.06)", border: "1px solid rgba(96, 165, 250, 0.15)",
  },
  adviceText: { color: "#93c5fd", fontSize: "13px", lineHeight: 1.6, marginTop: "1px" },
};
