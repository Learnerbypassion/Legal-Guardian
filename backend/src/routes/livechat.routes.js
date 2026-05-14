const express = require("express");
const router = express.Router();
const {
  getChatHistory,
  getConversations,
} = require("../controllers/livechat.controller");
const { authenticate } = require("../middlewares/auth.middleware");

// GET /api/livechat/conversations - List all conversations
router.get("/conversations", authenticate, getConversations);

// GET /api/livechat/history/:recipientId - Get chat history with a specific user
router.get("/history/:recipientId", authenticate, getChatHistory);

module.exports = router;
