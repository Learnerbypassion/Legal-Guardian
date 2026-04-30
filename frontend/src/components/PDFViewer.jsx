import { useState } from "react";

const TYPE_COLORS = {
  risk: { bg: "rgba(239, 68, 68, 0.08)", border: "rgba(239, 68, 68, 0.25)", text: "#fca5a5", dot: "#ef4444" },
  benefit: { bg: "rgba(34, 197, 94, 0.08)", border: "rgba(34, 197, 94, 0.25)", text: "#86efac", dot: "#22c55e" },
  neutral: { bg: "rgba(107, 114, 128, 0.08)", border: "rgba(107, 114, 128, 0.25)", text: "#9ca3af", dot: "#6b7280" },
};

export default function PDFViewer({ highlightedClauses = [] }) {
  const [openIndex, setOpenIndex] = useState(null);

  if (!highlightedClauses.length) return null;

  return (
    <div style={styles.card}>
      <h3 style={styles.heading}>Highlighted Clauses</h3>
      <p style={styles.sub}>Key sections identified in your contract</p>

      <div style={styles.list}>
        {highlightedClauses.map((clause, i) => {
          const colors = TYPE_COLORS[clause.type] || TYPE_COLORS.neutral;
          const isOpen = openIndex === i;

          return (
            <div
              key={i}
              style={{
                ...styles.item,
                background: colors.bg,
                borderColor: isOpen ? colors.border : "transparent",
                borderWidth: "1px",
                borderStyle: "solid",
              }}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                style={styles.toggle}
              >
                <div style={styles.toggleLeft}>
                  <div style={{ ...styles.typeDot, background: colors.dot }} />
                  <p style={{ ...styles.clauseTitle, color: colors.text }}>{clause.title}</p>
                  <span style={{ ...styles.typeBadge, color: colors.text, borderColor: `${colors.dot}44`, background: `${colors.dot}11` }}>
                    {clause.type}
                  </span>
                </div>
                <svg
                  width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke={colors.dot} strokeWidth="2"
                  style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {isOpen && (
                <div style={styles.expanded}>
                  {clause.text && (
                    <div style={{ ...styles.clauseText, borderLeftColor: colors.dot }}>
                      <p style={styles.clauseTextContent}>"{clause.text}"</p>
                    </div>
                  )}
                  <p style={styles.explanation}>{clause.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "#111827", border: "1px solid #1f2937",
    borderRadius: "20px", padding: "28px", display: "flex", flexDirection: "column", gap: "16px",
  },
  heading: { color: "#e8eaf0", fontSize: "16px", fontWeight: 600 },
  sub: { color: "#6b7280", fontSize: "13px", marginTop: "-8px" },
  list: { display: "flex", flexDirection: "column", gap: "8px" },
  item: { borderRadius: "12px", overflow: "hidden", transition: "border-color 0.2s" },
  toggle: {
    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "14px 16px", background: "transparent", border: "none", cursor: "pointer",
    gap: "10px",
  },
  toggleLeft: { display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" },
  typeDot: { width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0 },
  clauseTitle: { fontSize: "13px", fontWeight: 600, fontFamily: "'DM Mono', monospace", textAlign: "left" },
  typeBadge: {
    padding: "2px 8px", borderRadius: "100px", fontSize: "10px",
    fontFamily: "'DM Mono', monospace", border: "1px solid", textTransform: "uppercase",
  },
  expanded: { padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: "10px" },
  clauseText: {
    padding: "10px 14px", borderLeft: "3px solid", borderRadius: "0 8px 8px 0",
    background: "rgba(0,0,0,0.2)",
  },
  clauseTextContent: { color: "#9ca3af", fontSize: "13px", fontStyle: "italic", lineHeight: 1.6 },
  explanation: { color: "#d1d5db", fontSize: "13px", lineHeight: 1.6, paddingLeft: "2px" },
};
