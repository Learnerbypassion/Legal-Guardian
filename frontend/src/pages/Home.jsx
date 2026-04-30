import { useNavigate } from "react-router-dom";
import { useUpload } from "../hooks/useUpload";
import UploadBox from "../components/UploadBox";
import { Toaster } from "react-hot-toast";

export default function Home() {
  const navigate = useNavigate();
  const { step, progress, process, error } = useUpload();

  const handleUpload = async (file, opts) => {
    const data = await process(file, opts);
    if (data) {
      navigate("/result", { state: { result: data.analysis, contractText: data.contractText } });
    }
  };

  return (
    <div style={styles.page}>
      <Toaster position="top-right" toastOptions={{ style: { background: "#1e2635", color: "#e8eaf0", border: "1px solid #2a3040" } }} />

      {/* Background */}
      <div style={styles.bg}>
        <div style={styles.glow1} />
        <div style={styles.glow2} />
        <div style={styles.grid} />
      </div>

      {/* Nav */}
      <nav style={styles.nav}>
        <div style={styles.logo}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" stroke="#22c55e" strokeWidth="1.5" fill="rgba(34,197,94,0.1)" />
            <path d="M9 12l2 2 4-4" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span style={styles.logoText}>Legal Guardian</span>
        </div>
        <a href="https://github.com" style={styles.navLink} target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
      </nav>

      {/* Hero */}
      <main style={styles.main}>
        <div style={styles.hero}>
          <div style={styles.pill}>AI-Powered Contract Analysis</div>

          <h1 style={styles.h1}>
            Understand any contract
            <br />
            <span style={styles.accent}>before you sign.</span>
          </h1>

          <p style={styles.subtitle}>
            Upload your PDF. Get a plain-language summary, risk score,
            <br /> highlighted clauses, and follow-up Q&A — in seconds.
          </p>

          <div style={styles.features}>
            {["📄 PDF Upload", "🧠 AI Analysis", "📊 Risk Score", "💬 AI Chat", "🌍 Multi-language"].map((f) => (
              <span key={f} style={styles.feature}>{f}</span>
            ))}
          </div>
        </div>

        {/* Upload Card */}
        <div style={styles.uploadCard}>
          <div style={styles.uploadHeader}>
            <h2 style={styles.uploadTitle}>Analyze your contract</h2>
            <p style={styles.uploadSub}>No login required. Your document is never stored.</p>
          </div>
          <UploadBox onUpload={handleUpload} step={step} progress={progress} />
          {error && <p style={styles.error}>{error}</p>}
        </div>
      </main>

      {/* Footer stats */}
      <div style={styles.stats}>
        {[["10MB", "Max file size"], ["3 languages", "English, Hindi, Bengali"], ["0–10", "Risk scale"], ["Free", "No account needed"]].map(([val, label]) => (
          <div key={label} style={styles.stat}>
            <p style={styles.statVal}>{val}</p>
            <p style={styles.statLabel}>{label}</p>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, -20px); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-20px, 30px); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh", display: "flex", flexDirection: "column",
    alignItems: "center", position: "relative", overflow: "hidden",
  },
  bg: { position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" },
  glow1: {
    position: "absolute", width: "500px", height: "500px",
    borderRadius: "50%", background: "radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)",
    top: "-100px", left: "-100px", animation: "float1 10s ease-in-out infinite",
  },
  glow2: {
    position: "absolute", width: "400px", height: "400px",
    borderRadius: "50%", background: "radial-gradient(circle, rgba(96,165,250,0.06) 0%, transparent 70%)",
    bottom: "-100px", right: "-50px", animation: "float2 12s ease-in-out infinite",
  },
  grid: {
    position: "absolute", inset: 0,
    backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
    backgroundSize: "48px 48px",
  },
  nav: {
    width: "100%", maxWidth: "1100px", padding: "24px 32px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    position: "relative", zIndex: 10,
  },
  logo: { display: "flex", alignItems: "center", gap: "10px" },
  logoText: { fontFamily: "'DM Serif Display', serif", fontSize: "20px", color: "#e8eaf0" },
  navLink: {
    color: "#6b7280", fontSize: "14px", textDecoration: "none",
    padding: "6px 16px", borderRadius: "8px", border: "1px solid #2a3040",
    transition: "all 0.15s",
  },
  main: {
    flex: 1, width: "100%", maxWidth: "1100px", padding: "40px 32px",
    display: "flex", flexDirection: "column", alignItems: "center", gap: "48px",
    position: "relative", zIndex: 10,
  },
  hero: { textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" },
  pill: {
    padding: "6px 16px", borderRadius: "100px", fontSize: "12px",
    fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em",
    background: "rgba(34, 197, 94, 0.1)", color: "#22c55e",
    border: "1px solid rgba(34, 197, 94, 0.25)",
  },
  h1: {
    fontFamily: "'DM Serif Display', serif", fontSize: "clamp(36px, 5vw, 64px)",
    lineHeight: 1.15, color: "#e8eaf0", fontWeight: 400,
  },
  accent: { color: "#22c55e" },
  subtitle: { color: "#6b7280", fontSize: "16px", lineHeight: 1.7, maxWidth: "520px" },
  features: { display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" },
  feature: {
    padding: "5px 12px", borderRadius: "8px", fontSize: "13px",
    background: "rgba(255,255,255,0.04)", color: "#9ca3af",
    border: "1px solid #2a3040",
  },
  uploadCard: {
    width: "100%", maxWidth: "540px",
    background: "rgba(17, 24, 39, 0.9)", backdropFilter: "blur(20px)",
    border: "1px solid #1f2937", borderRadius: "24px", padding: "32px",
    display: "flex", flexDirection: "column", gap: "24px",
    boxShadow: "0 40px 80px rgba(0,0,0,0.4)",
  },
  uploadHeader: { display: "flex", flexDirection: "column", gap: "6px" },
  uploadTitle: { fontFamily: "'DM Serif Display', serif", fontSize: "22px", color: "#e8eaf0", fontWeight: 400 },
  uploadSub: { color: "#6b7280", fontSize: "13px" },
  error: { color: "#f87171", fontSize: "13px", textAlign: "center" },
  stats: {
    width: "100%", maxWidth: "1100px", padding: "24px 32px 48px",
    display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "32px",
    position: "relative", zIndex: 10,
  },
  stat: { textAlign: "center" },
  statVal: { fontFamily: "'DM Serif Display', serif", fontSize: "24px", color: "#22c55e" },
  statLabel: { color: "#4a5568", fontSize: "12px", fontFamily: "'DM Mono', monospace", marginTop: "4px" },
};
