import { useState, useRef, useEffect } from "react";
import { askQuestion } from "../services/api";
import toast from "react-hot-toast";

const QUICK_QUESTIONS = [
  "Can I cancel this contract?",
  "What happens if I miss a payment?",
  "Is there an auto-renewal clause?",
  "What are my main obligations?",
];

export default function ChatBox({ contractText, language = "English" }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I've analyzed your contract. Ask me anything about it — in plain language.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (question) => {
    const q = (question || input).trim();
    if (!q || loading) return;

    const userMsg = { role: "user", content: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.filter((m) => m.role !== "assistant" || messages.indexOf(m) > 0);
      const { answer } = await askQuestion({ contractText, question: q, history, language });
      setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
    } catch {
      toast.error("Failed to get answer. Please try again.");
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I couldn't answer that. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.avatarDot} />
          <h3 style={styles.heading}>Ask Legal Guardian</h3>
        </div>
        <span style={styles.badge}>AI</span>
      </div>

      {/* Quick questions */}
      <div style={styles.quickWrap}>
        {QUICK_QUESTIONS.map((q) => (
          <button key={q} onClick={() => send(q)} style={styles.quickBtn} disabled={loading}>
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={styles.messages}>
        {messages.map((msg, i) => (
          <div key={i} style={{ ...styles.msgWrap, justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
            <div
              style={{
                ...styles.bubble,
                ...(msg.role === "user" ? styles.userBubble : styles.aiBubble),
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={styles.msgWrap}>
            <div style={styles.aiBubble}>
              <div style={styles.dots}>
                <span style={{ ...styles.dot, animationDelay: "0s" }} />
                <span style={{ ...styles.dot, animationDelay: "0.2s" }} />
                <span style={{ ...styles.dot, animationDelay: "0.4s" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={styles.inputRow}>
        <input
          style={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="Ask about the contract…"
          disabled={loading}
        />
        <button onClick={() => send()} disabled={!input.trim() || loading} style={styles.sendBtn}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const styles = {
  card: {
    background: "#111827", border: "1px solid #1f2937",
    borderRadius: "20px", padding: "24px", display: "flex", flexDirection: "column", gap: "16px",
  },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  headerLeft: { display: "flex", alignItems: "center", gap: "10px" },
  avatarDot: { width: "10px", height: "10px", borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e" },
  heading: { color: "#e8eaf0", fontSize: "16px", fontWeight: 600 },
  badge: {
    padding: "3px 10px", borderRadius: "100px", fontSize: "11px",
    background: "rgba(34, 197, 94, 0.1)", color: "#22c55e",
    border: "1px solid rgba(34, 197, 94, 0.3)", fontFamily: "'DM Mono', monospace",
  },
  quickWrap: { display: "flex", flexWrap: "wrap", gap: "6px" },
  quickBtn: {
    padding: "6px 12px", borderRadius: "100px", fontSize: "12px",
    background: "rgba(255,255,255,0.04)", color: "#9ca3af",
    border: "1px solid #2a3040", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
    transition: "all 0.15s",
  },
  messages: {
    display: "flex", flexDirection: "column", gap: "10px",
    maxHeight: "320px", overflowY: "auto",
    padding: "4px 0",
  },
  msgWrap: { display: "flex" },
  bubble: { maxWidth: "85%", padding: "10px 14px", borderRadius: "14px", fontSize: "14px", lineHeight: 1.6 },
  userBubble: { background: "rgba(34, 197, 94, 0.15)", color: "#86efac", borderBottomRightRadius: "4px" },
  aiBubble: { background: "#1e2635", color: "#d1d5db", borderBottomLeftRadius: "4px" },
  dots: { display: "flex", gap: "4px", alignItems: "center", padding: "2px 0" },
  dot: {
    width: "6px", height: "6px", borderRadius: "50%", background: "#6b7280",
    animation: "bounce 1s infinite", display: "inline-block",
  },
  inputRow: { display: "flex", gap: "8px" },
  input: {
    flex: 1, padding: "12px 16px", borderRadius: "12px",
    background: "#0d1117", border: "1px solid #2a3040",
    color: "#e8eaf0", fontSize: "14px", outline: "none",
    fontFamily: "'DM Sans', sans-serif",
  },
  sendBtn: {
    width: "44px", height: "44px", borderRadius: "12px", border: "none",
    background: "linear-gradient(135deg, #16a34a, #22c55e)",
    color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
};
