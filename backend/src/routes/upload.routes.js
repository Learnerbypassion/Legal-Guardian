const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload.middleware");
const { uploadPDF } = require("../controllers/upload.controller");

// POST /api/upload - Upload and parse PDF
router.post("/", upload.single("contract"), uploadPDF);

module.exports = router;
