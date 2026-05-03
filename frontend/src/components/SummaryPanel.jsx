export default function SummaryPanel({ result }) {
  if (!result) return null;

  const { summary, contractType, parties, keyDates, overallAdvice } = result;

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.heading}>Executive Brief</h3>
        <div style={styles.typeBadge}>{contractType}</div>
      </div>

      {/* Parties - Redesigned with cleaner chips */}
      {parties?.length > 0 && (
        <div style={styles.section}>
          <p style={styles.label}>Signatory Parties</p>
          <div style={styles.parties}>
            {parties.map((p, i) => (
              <span key={i} style={styles.party}>{p}</span>
            ))}
          </div>
        </div>
      )}

      {/* Key Points - Using Navy accents instead of green dots */}
      <div style={styles.section}>
        <p style={styles.label}>Core Summary</p>
        <ul style={styles.list}>
          {summary.map((point, i) => (
            <li key={i} style={styles.listItem}>
              <span style={styles.bullet} />
              <span style={styles.listText}>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Key Dates - Calendar-style grid items */}
      {keyDates?.length > 0 && (
        <div style={styles.section}>
          <p style={styles.label}>Critical Deadlines</p>
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

      {/* Overall Advice - Highlighted with Gold branding */}
      {overallAdvice && (
        <div style={styles.advice}>
          <div style={styles.adviceIcon}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8A6C2A" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p style={styles.adviceText}>
            <span style={{ fontWeight: 800, color: "#8A6C2A", marginRight: '4px' }}>AI RECOMMENDATION:</span>
            {overallAdvice}
          </p>
        </div>
      )}
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
    gap: "24px",
    boxShadow: "0 4px 20px rgba(27, 47, 78, 0.05)"
  },
  header: { 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "space-between", 
    flexWrap: "wrap", 
    gap: "12px",
    borderBottom: "1px solid #F1F5F9",
    paddingBottom: "16px"
  },
  heading: { 
    color: "#1B2F4E", 
    fontSize: "15px", 
    fontWeight: 800, 
    textTransform: "uppercase", 
    letterSpacing: "0.1em" 
  },
  typeBadge: {
    padding: "4px 14px", 
    borderRadius: "8px", 
    fontSize: "10px",
    background: "#1B2F4E", 
    color: "#FFFFFF",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.05em"
  },
  section: { display: "flex", flexDirection: "column", gap: "12px" },
  label: {
    color: "#8A6C2A", 
    fontSize: "10px", 
    fontWeight: 800,
    textTransform: "uppercase", 
    letterSpacing: "0.12em",
  },
  parties: { display: "flex", flexWrap: "wrap", gap: "8px" },
  party: {
    padding: "6px 14px", 
    borderRadius: "6px", 
    fontSize: "12px",
    background: "#F8FAFC", 
    color: "#1B2F4E", 
    border: "1px solid #E2E8F0",
    fontWeight: 600,
  },
  list: { listStyle: "none", display: "flex", flexDirection: "column", gap: "12px" },
  listItem: { display: "flex", gap: "12px", alignItems: "flex-start" },
  bullet: {
    width: "5px", 
    height: "5px", 
    borderRadius: "1px", // Square bullet for modern look
    background: "#1B2F4E", 
    marginTop: "8px", 
    flexShrink: 0,
  },
  listText: { color: "#475569", fontSize: "14px", lineHeight: 1.7, fontWeight: 500 },
  dateGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" },
  dateItem: {
    padding: "16px", 
    borderRadius: "12px",
    background: "#F8FAFC", 
    border: "1px solid #E2E8F0",
  },
  dateLabel: { color: "#64748B", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", marginBottom: "6px" },
  dateValue: { color: "#1B2F4E", fontSize: "14px", fontWeight: 700 },
  advice: {
    display: "flex", 
    gap: "12px", 
    alignItems: "flex-start",
    padding: "16px 20px", 
    borderRadius: "16px",
    background: "rgba(138, 108, 42, 0.04)", 
    border: "1px solid rgba(138, 108, 42, 0.15)",
  },
  adviceIcon: { marginTop: "2px" },
  adviceText: { color: "#1B2F4E", fontSize: "13px", lineHeight: 1.6, fontWeight: 500 },
};