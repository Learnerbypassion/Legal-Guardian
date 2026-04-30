import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import RiskScore from "../components/RiskScore";
import SummaryPanel from "../components/SummaryPanel";
import ProsConsPanel from "../components/ProsConsPanel";
import PDFViewer from "../components/PDFViewer";
import ChatBox from "../components/ChatBox";
import { Toaster } from "react-hot-toast";

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const { result, contractText } = location.state || {};

  useEffect(() => {
    if (!result) navigate("/");
  }, [result, navigate]);

  if (!result) return null;

  const { meta } = result;

  return (
    <div style={styles.page}>
      <Toaster position="top-right" toastOptions={{ style: { background: "#1e2635", color: "#e8eaf0", border: "1px solid #2a3040" } }} />

      {/* Background */}
      <div style={styles.grid} />

      {/* Nav */}
      <nav style={styles.nav}>
        <div style={styles.logo}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" stroke="#22c55e" strokeWidth="1.5" fill="rgba(34,197,94,0.1)" />
            <path d="M9 12l2 2 4-4" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span style={styles.logoText}>Legal Guardian</span>
        </div>

        <div style={styles.navRight}>
          <div style={styles.metaBadge}>
            <span style={{ color: "#6b7280" }}>{meta?.filename}</span>
            <span style={{ ...styles.dot, background: "#2a3040" }} />
            <span style={{ color: "#6b7280" }}>{meta?.charCount?.toLocaleString()} chars</span>
          </div>
          <button onClick={() => navigate("/")} style={styles.newBtn}>
            + New Analysis
          </button>
        </div>
      </nav>

      {/* Content */}
      <main style={styles.main}>
        <div style={styles.titleRow}>
          <h1 style={styles.title}>Analysis Complete</h1>
          <span style={styles.time}>
            {new Date(meta?.analyzedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

        {/* Top row: Risk + Summary */}
        <div style={styles.topGrid}>
          <RiskScore riskScore={result.riskScore} />
          <SummaryPanel result={result} />
        </div>

        {/* Pros & Cons */}
        <ProsConsPanel pros={result.pros} cons={result.cons} />

        {/* Highlighted Clauses */}
        <PDFViewer highlightedClauses={result.highlightedClauses} />

        {/* AI Chat */}
        <ChatBox contractText={contractText} language={meta?.language} />
      </main>

      <footer style={styles.footer}>
        <p style={styles.footerText}>
          ⚠️ Legal Guardian is an AI tool and does not provide legal advice. Always consult a licensed attorney for legal decisions.
        </p>
      </footer>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", position: "relative" },
  grid: {
    position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
    backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
    backgroundSize: "48px 48px",
  },
  nav: {
    width: "100%", maxWidth: "1100px", padding: "20px 32px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    position: "relative", zIndex: 10, flexWrap: "wrap", gap: "12px",
  },
  logo: { display: "flex", alignItems: "center", gap: "10px" },
  logoText: { fontFamily: "'DM Serif Display', serif", fontSize: "18px", color: "#e8eaf0" },
  navRight: { display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" },
  metaBadge: {
    display: "flex", alignItems: "center", gap: "8px",
    padding: "6px 14px", borderRadius: "8px",
    background: "#111827", border: "1px solid #1f2937", fontSize: "12px",
    fontFamily: "'DM Mono', monospace",
  },
  dot: { width: "4px", height: "4px", borderRadius: "50%" },
  newBtn: {
    padding: "8px 18px", borderRadius: "10px",
    background: "rgba(34, 197, 94, 0.1)", color: "#22c55e",
    border: "1px solid rgba(34, 197, 94, 0.3)", cursor: "pointer",
    fontSize: "13px", fontWeight: 500, fontFamily: "'DM Sans', sans-serif",
  },
  main: {
    flex: 1, width: "100%", maxWidth: "1100px", padding: "24px 32px 48px",
    display: "flex", flexDirection: "column", gap: "20px",
    position: "relative", zIndex: 10,
  },
  titleRow: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  title: { fontFamily: "'DM Serif Display', serif", fontSize: "28px", color: "#e8eaf0", fontWeight: 400 },
  time: { color: "#4a5568", fontSize: "13px", fontFamily: "'DM Mono', monospace" },
  topGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" },
  footer: {
    width: "100%", padding: "20px 32px", textAlign: "center",
    borderTop: "1px solid #111827", position: "relative", zIndex: 10,
  },
  footerText: { color: "#374151", fontSize: "12px" },
};
