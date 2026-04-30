import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";

const LANGUAGES = ["English", "Hindi", "Bengali"];
const USER_TYPES = [
  { value: "general", label: "General" },
  { value: "freelancer", label: "Freelancer" },
  { value: "business", label: "Business Owner" },
  { value: "student", label: "Student" },
];

export default function UploadBox({ onUpload, step, progress }) {
  const [language, setLanguage] = useState("English");
  const [userType, setUserType] = useState("general");
  const [selectedFile, setSelectedFile] = useState(null);

  const onDrop = useCallback((accepted) => {
    if (accepted[0]) setSelectedFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    disabled: step === "uploading" || step === "analyzing",
  });

  const handleSubmit = () => {
    if (selectedFile) onUpload(selectedFile, { language, userType });
  };

  const isLoading = step === "uploading" || step === "analyzing";

  return (
    <div style={styles.wrapper}>
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        style={{
          ...styles.dropzone,
          borderColor: isDragActive ? "#4ade80" : selectedFile ? "#22c55e" : "#2a3040",
          background: isDragActive ? "rgba(74, 222, 128, 0.05)" : "rgba(20, 25, 38, 0.8)",
        }}
      >
        <input {...getInputProps()} />
        <div style={styles.dropContent}>
          <div style={styles.iconRing}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={selectedFile ? "#22c55e" : "#4a5568"} strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          </div>
          {selectedFile ? (
            <>
              <p style={styles.filename}>{selectedFile.name}</p>
              <p style={styles.filesize}>
                {(selectedFile.size / 1024).toFixed(1)} KB — Click to change
              </p>
            </>
          ) : (
            <>
              <p style={styles.dropText}>
                {isDragActive ? "Drop your contract here" : "Drag & drop your contract PDF"}
              </p>
              <p style={styles.dropSub}>or click to browse — max 10MB</p>
            </>
          )}
        </div>
      </div>

      {/* Options */}
      <div style={styles.options}>
        <div style={styles.optionGroup}>
          <label style={styles.label}>I am a</label>
          <div style={styles.pills}>
            {USER_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setUserType(t.value)}
                style={{
                  ...styles.pill,
                  ...(userType === t.value ? styles.pillActive : {}),
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.optionGroup}>
          <label style={styles.label}>Output language</label>
          <div style={styles.pills}>
            {LANGUAGES.map((l) => (
              <button
                key={l}
                onClick={() => setLanguage(l)}
                style={{
                  ...styles.pill,
                  ...(language === l ? styles.pillActive : {}),
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!selectedFile || isLoading}
        style={{
          ...styles.btn,
          opacity: !selectedFile || isLoading ? 0.5 : 1,
          cursor: !selectedFile || isLoading ? "not-allowed" : "pointer",
        }}
      >
        {isLoading ? (
          <span style={styles.btnInner}>
            <span style={styles.spinner} />
            {step === "uploading" ? `Uploading… ${progress}%` : "Analyzing contract…"}
          </span>
        ) : (
          <span style={styles.btnInner}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Analyze Contract
          </span>
        )}
      </button>

      {isLoading && (
        <div style={styles.progressBar}>
          <div
            style={{
              ...styles.progressFill,
              width: step === "analyzing" ? "100%" : `${progress}%`,
              transition: step === "analyzing" ? "width 2s ease" : "width 0.3s ease",
              background: step === "analyzing"
                ? "linear-gradient(90deg, #22c55e, #4ade80, #22c55e)"
                : "#22c55e",
              backgroundSize: step === "analyzing" ? "200% 100%" : "auto",
              animation: step === "analyzing" ? "shimmer 1.5s infinite" : "none",
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  wrapper: { display: "flex", flexDirection: "column", gap: "20px", width: "100%" },
  dropzone: {
    border: "1.5px dashed",
    borderRadius: "16px",
    padding: "48px 24px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    textAlign: "center",
  },
  dropContent: { display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" },
  iconRing: {
    width: "64px", height: "64px", borderRadius: "50%",
    background: "rgba(255,255,255,0.04)",
    display: "flex", alignItems: "center", justifyContent: "center",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  filename: { color: "#22c55e", fontFamily: "'DM Mono', monospace", fontSize: "14px", fontWeight: 500 },
  filesize: { color: "#6b7280", fontSize: "12px" },
  dropText: { color: "#9ca3af", fontSize: "16px", fontWeight: 400 },
  dropSub: { color: "#4a5568", fontSize: "13px" },
  options: { display: "flex", flexDirection: "column", gap: "16px" },
  optionGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { color: "#6b7280", fontSize: "12px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em", textTransform: "uppercase" },
  pills: { display: "flex", flexWrap: "wrap", gap: "8px" },
  pill: {
    padding: "6px 14px", borderRadius: "100px", fontSize: "13px", fontWeight: 400,
    border: "1px solid #2a3040", background: "transparent", color: "#6b7280",
    cursor: "pointer", transition: "all 0.15s",
  },
  pillActive: { borderColor: "#22c55e", background: "rgba(34, 197, 94, 0.1)", color: "#22c55e" },
  btn: {
    padding: "14px 28px", borderRadius: "12px", border: "none",
    background: "linear-gradient(135deg, #16a34a, #22c55e)",
    color: "#fff", fontSize: "15px", fontWeight: 600,
    transition: "all 0.2s", fontFamily: "'DM Sans', sans-serif",
  },
  btnInner: { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" },
  spinner: {
    width: "16px", height: "16px", borderRadius: "50%",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "#fff",
    animation: "spin 0.8s linear infinite",
    display: "inline-block",
  },
  progressBar: { height: "4px", background: "#1a2030", borderRadius: "2px", overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: "2px" },
};
