/**
 * Assembles the final structured response from AI output + risk data
 * @param {object} aiResult - parsed AI JSON
 * @param {object} riskData - { score, level, detectedKeywords }
 * @param {object} meta - { filename, charCount, language, userType }
 * @returns {object} formatted response
 */
const formatAnalysis = (aiResult, riskData, meta = {}) => {
  return {
    success: true,
    meta: {
      filename: meta.filename || "contract.pdf",
      charCount: meta.charCount || 0,
      language: meta.language || "English",
      userType: meta.userType || "general",
      analyzedAt: new Date().toISOString(),
    },
    contractType: aiResult.contractType || "Unknown",
    parties: aiResult.parties || [],
    keyDates: aiResult.keyDates || [],
    summary: aiResult.summary || [],
    pros: aiResult.pros || [],
    cons: aiResult.cons || [],
    highlightedClauses: aiResult.highlightedClauses || [],
    overallAdvice: aiResult.overallAdvice || "",
    riskScore: {
      score: riskData.score,
      label: riskData.level.label,
      color: riskData.level.color,
      description: riskData.level.description,
      detectedKeywords: riskData.detectedKeywords,
    },
  };
};

module.exports = { formatAnalysis };
