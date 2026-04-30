const { extractAndClean } = require("../services/parser.service");

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

module.exports = { uploadPDF };
