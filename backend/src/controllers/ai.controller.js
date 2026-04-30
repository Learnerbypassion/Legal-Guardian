const { analyzeContract } = require("../services/ai.service");
const { calculateRisk } = require("../services/risk.service");
const { formatAnalysis } = require("../services/summary.service");
const Document = require("../models/document.model");

/**
 * POST /api/analyze
 * Body: { contractText, filename, userType, language }
 * Analyzes contract, calculates risk, optionally saves to DB
 */
const analyze = async (req, res, next) => {
  try {
    const {
      contractText,
      filename = "contract.pdf",
      userType = "general",
      language = "English",
      charCount = 0,
    } = req.body;

    if (!contractText || contractText.trim().length < 50) {
      return res.status(400).json({ success: false, error: "Contract text is too short or missing." });
    }

    // 1. AI Analysis
    const aiResult = await analyzeContract(contractText, userType, language);

    // 2. Risk Score
    const riskData = calculateRisk(aiResult.cons || [], contractText);

    // 3. Format Response
    const formatted = formatAnalysis(aiResult, riskData, {
      filename,
      charCount,
      language,
      userType,
    });

    // 4. Save to DB (optional - won't fail request if DB is down)
    try {
      await Document.create({
        filename,
        contractType: formatted.contractType,
        parties: formatted.parties,
        keyDates: formatted.keyDates,
        summary: formatted.summary,
        pros: formatted.pros,
        cons: formatted.cons,
        highlightedClauses: formatted.highlightedClauses,
        overallAdvice: formatted.overallAdvice,
        riskScore: formatted.riskScore,
        language,
        userType,
        charCount,
      });
    } catch (dbError) {
      console.warn("⚠️  DB save skipped:", dbError.message);
    }

    res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
};

module.exports = { analyze };
