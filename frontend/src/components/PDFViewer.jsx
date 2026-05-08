import { useState } from "react";


const TYPE_COLORS = {
  risk: { 
    bg: "rgba(220, 38, 38, 0.05)", // Softened red for critical items
    border: "rgba(220, 38, 38, 0.2)", 
    text: "#ef4444", 
    dot: "#dc2626" 
  },
  benefit: { 
    bg: "rgba(34, 197, 94, 0.05)", 
    border: "rgba(34, 197, 94, 0.2)", 
    text: "#22c55e", 
    dot: "#16a34a" 
  },
  neutral: { 
    bg: "rgba(138, 108, 42, 0.05)", // Gold-tinted neutral
    border: "rgba(138, 108, 42, 0.2)", 
    text: "#8A6C2A", 
    dot: "#8A6C2A" 
  },
};

export default function PDFViewer({ highlightedClauses = [] }) {
  const [openIndex, setOpenIndex] = useState(null);

  if (!highlightedClauses.length) return null;

  return (
    <div style={styles.card}>
      <h3 style={styles.heading}>Contract Dossier</h3>
      <p style={styles.sub}>High-priority clauses identified by Legal Guardian AI</p>

      <div style={styles.list}>
        {highlightedClauses.map((clause, i) => {
          const colors = TYPE_COLORS[clause.type] || TYPE_COLORS.neutral;
          const isOpen = openIndex === i;

          return (
            <div
              key={i}
              style={{
                ...styles.item,
                background: isOpen ? colors.bg : "transparent",
                borderColor: isOpen ? colors.border : "#E2E8F0",
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
                  <p style={{ ...styles.clauseTitle, color: isOpen ? "#1B2F4E" : "#3D4F66" }}>
                    {clause.title}
                  </p>
                  <span style={{ 
                    ...styles.typeBadge, 
                    color: colors.dot, 
                    borderColor: `${colors.dot}44`, 
                    background: `${colors.dot}11` 
                  }}>
                    {clause.type}
                  </span>
                </div>
                <svg
                  width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke={isOpen ? "#8A6C2A" : "#94A3B8"} strokeWidth="2"
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
    background: "#FFFFFF", 
    border: "1px solid #E2E8F0",
    borderRadius: "24px", 
    padding: "32px", 
    display: "flex", 
    flexDirection: "column", 
    gap: "20px",
    boxShadow: "0 4px 20px rgba(27, 47, 78, 0.05)"
  },
  heading: { 
    color: "#1B2F4E", 
    fontSize: "14px", 
    fontWeight: 800, 
    textTransform: "uppercase", 
    letterSpacing: "0.1em" 
  },
  sub: { 
    color: "#64748B", 
    fontSize: "12px", 
    marginTop: "-12px",
    fontWeight: 500
  },
  list: { display: "flex", flexDirection: "column", gap: "12px" },
  item: { borderRadius: "16px", overflow: "hidden", transition: "all 0.3s ease" },
  toggle: {
    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "16px 20px", background: "transparent", border: "none", cursor: "pointer",
    gap: "10px",
  },
  toggleLeft: { display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" },
  typeDot: { width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0 },
  clauseTitle: { 
    fontSize: "13px", 
    fontWeight: 700, 
    fontFamily: "inherit", 
    textAlign: "left",
    letterSpacing: "-0.01em"
  },
  typeBadge: {
    padding: "2px 10px", borderRadius: "6px", fontSize: "9px",
    fontWeight: 800, border: "1px solid", textTransform: "uppercase",
    letterSpacing: "0.05em"
  },
  expanded: { padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: "14px" },
  clauseText: {
    padding: "14px 18px", borderLeft: "4px solid", borderRadius: "4px 12px 12px 4px",
    background: "#F8FAFC",
  },
  clauseTextContent: { color: "#475569", fontSize: "13px", fontStyle: "italic", lineHeight: 1.7 },
  explanation: { color: "#1B2F4E", fontSize: "13px", lineHeight: 1.7, paddingLeft: "4px", fontWeight: 500 },
};