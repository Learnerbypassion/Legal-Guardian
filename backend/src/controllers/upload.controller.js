const { extractAndClean } = require("../services/parser.service");
const Document = require("../models/document.model");

/**
 * POST /api/upload
 * Accepts a PDF, extracts text, returns it for analysis
 */
const uploadPDF = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No PDF file uploaded." });
    }

    const { buffer, originalname } = req.file;
    const { rawText, cleanedText, charCount } = await extractAndClean(buffer);
    res.status(200).json({
      success: true,
      filename: originalname,
      charCount,
      contractText: cleanedText,
      message: "PDF parsed successfully. Ready for analysis.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/upload/documents
 * Get authenticated user's document history
 * Returns list of documents with analysis results
 */
const getUserDocuments = async (req, res, next) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }

    // Fetch all documents for this user, sorted by creation date (newest first)
    const documents = await Document.find({ userId })
      .sort({ createdAt: -1 })
      .select(
        "_id filename createdAt summary pros cons overallAdvice riskScore contractType"
      );

    res.status(200).json({
      success: true,
      data: documents,
      message: "User documents retrieved successfully",
    });
  } catch (error) {
    console.error("❌ Get documents error:", error.message);
    next(error);
  }
};

module.exports = { uploadPDF, getUserDocuments };
