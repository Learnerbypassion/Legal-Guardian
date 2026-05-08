/**
 * Returns solid colors for risk badges/indicators.
 * Transitioned from standard green/yellow/red to 
 * Brand-compliant palette.
 */
export const getRiskColor = (score) => {
  if (score <= 3) return "#10B981"; // Professional Emerald
  if (score <= 6) return "#D4AF37"; // LegalLens Gold
  return "#B91C1C"; // Crimson Alert
};

/**
 * Returns gradients for background panels and dashboards.
 * Uses the Navy-Gold identity for low-to-high risk visualization.
 */
export const getRiskGradient = (score) => {
  if (score <= 3) return "linear-gradient(135deg, #064e3b, #065f46)"; // Deep Teal
  if (score <= 6) return "linear-gradient(135deg, #8A6C2A, #D4AF37)"; // Gold Gradient
  return "linear-gradient(135deg, #1B2F4E, #7f1d1d)"; // Navy to Deep Red
};

/**
 * Formats ISO dates to Indian Standard (e.g., 4 May 2026).
 * Logic remains identical to ensure consistency across the UI.
 */
export const formatDate = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/**
 * Returns text/icon colors based on clause severity.
 * Swapped grey for the Navy to ensure text legibility on light backgrounds.
 */
export const severityColor = (severity) => {
  if (severity === "high") return "#B91C1C"; // Crimson
  if (severity === "medium") return "#8A6C2A"; // Muted Gold
  return "#1B2F4E"; //  Navy
};