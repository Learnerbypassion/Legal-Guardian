const express = require("express");
const router = express.Router();
const { analyze } = require("../controllers/ai.controller");

// POST /api/analyze - Run full AI analysis on contract text
router.post("/analyze", analyze);

module.exports = router;
