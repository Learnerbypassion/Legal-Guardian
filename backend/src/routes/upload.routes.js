const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload.middleware");
const { uploadPDF, getUserDocuments, getDocumentById } = require("../controllers/upload.controller");
const { authenticate } = require("../middlewares/auth.middleware");

// POST /api/upload - Upload and parse PDF
router.post("/", upload.single("contract"), uploadPDF);

// GET /api/upload/documents/:docId - Get single document by ID with full contract text (MORE SPECIFIC - MUST BE FIRST)
router.get("/documents/:docId", authenticate, getDocumentById);

// GET /api/upload/documents - Get user's document history (requires authentication)
router.get("/documents", authenticate, getUserDocuments);

module.exports = router;
