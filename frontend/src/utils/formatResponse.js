export const getRiskColor = (score) => {
  if (score <= 3) return "#22c55e";
  if (score <= 6) return "#f59e0b";
  return "#ef4444";
};

export const getRiskGradient = (score) => {
  if (score <= 3) return "linear-gradient(135deg, #064e3b, #065f46)";
  if (score <= 6) return "linear-gradient(135deg, #78350f, #92400e)";
  return "linear-gradient(135deg, #7f1d1d, #991b1b)";
};

export const formatDate = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const severityColor = (severity) => {
  if (severity === "high") return "#ef4444";
  if (severity === "medium") return "#f59e0b";
  return "#6b7280";
};
