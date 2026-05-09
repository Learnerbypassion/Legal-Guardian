const { extractAndClean } = require("../services/parser.service");
const Document = require("../models/document.model");

/**
 * POST /api/upload
 * Accepts a PDF, extracts text, returns it for analysis with PDF buffer
 */
const uploadPDF = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No PDF file uploaded." });
    }

    const { buffer, originalname } = req.file;
    const { rawText, cleanedText, charCount } = await extractAndClean(buffer);
    
    // Convert PDF buffer to base64 for sending to frontend
    const pdfBase64 = buffer.toString("base64");
    
    res.status(200).json({
      success: true,
      filename: originalname,
      charCount,
      contractText: cleanedText,
      pdfBuffer: pdfBase64,
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
        "_id filename contractText createdAt summary pros cons highlightedClauses overallAdvice riskScore contractType"
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

/**
 * GET /api/upload/documents/:docId
 * Get a single document by ID with full contract text
 * Ensures user owns the document
 */
const getDocumentById = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { docId } = req.params;

    console.log("📄 Fetching document:", { docId, userId });

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }

    if (!docId) {
      return res.status(400).json({
        success: false,
        error: "Document ID is required",
      });
    }

    // Fetch document and verify user owns it
    const document = await Document.findOne({ _id: docId, userId });

    if (!document) {
      console.warn("❌ Document not found:", { docId, userId });
      return res.status(404).json({
        success: false,
        error: "Document not found or you don't have access to it",
      });
    }

    console.log("✅ Document found:", { docId, hasContractText: !!document.contractText, contractLength: document.contractText?.length || 0 });

    res.status(200).json({
      success: true,
      data: document,
      message: "Document retrieved successfully",
    });
  } catch (error) {
    console.error("❌ Get document by ID error:", error.message);
    next(error);
  }
};

module.exports = { uploadPDF, getUserDocuments, getDocumentById };
