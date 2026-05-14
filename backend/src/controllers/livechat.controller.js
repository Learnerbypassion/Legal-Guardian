const ChatMessage = require("../models/chat-message.model");
const User = require("../models/user.model");

/**
 * GET /api/livechat/history/:recipientId
 * Fetch chat history between the current user and a recipient
 */
const getChatHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const { recipientId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const roomId = ChatMessage.generateRoomId(userId, recipientId);

    const messages = await ChatMessage.find({ roomId })
      .sort({ createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    // Mark unread messages as read
    await ChatMessage.updateMany(
      { roomId, receiverId: userId, read: false },
      { $set: { read: true } }
    );

    const total = await ChatMessage.countDocuments({ roomId });

    res.status(200).json({
      success: true,
      data: messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("❌ Get chat history error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch chat history",
    });
  }
};

/**
 * GET /api/livechat/conversations
 * List all conversations for the current user
 * Returns the latest message from each conversation partner
 */
const getConversations = async (req, res) => {
  try {
    const userId = req.userId;

    // Find all unique rooms this user is part of
    const messages = await ChatMessage.aggregate([
      {
        $match: {
          $or: [
            { senderId: require("mongoose").Types.ObjectId.createFromHexString(userId) },
            { receiverId: require("mongoose").Types.ObjectId.createFromHexString(userId) },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$roomId",
          lastMessage: { $first: "$message" },
          lastMessageAt: { $first: "$createdAt" },
          lastSenderId: { $first: "$senderId" },
          participants: {
            $addToSet: {
              $cond: [
                { $eq: ["$senderId", require("mongoose").Types.ObjectId.createFromHexString(userId)] },
                "$receiverId",
                "$senderId",
              ],
            },
          },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$receiverId", require("mongoose").Types.ObjectId.createFromHexString(userId)] },
                    { $eq: ["$read", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { lastMessageAt: -1 } },
    ]);

    // Get partner user details
    const partnerIds = messages.flatMap((m) =>
      m.participants.flat().map((id) => id.toString())
    );
    const uniquePartnerIds = [...new Set(partnerIds)];

    const partners = await User.find({
      _id: { $in: uniquePartnerIds },
    }).select("name email role professionalDetails");

    const partnerMap = {};
    partners.forEach((p) => {
      partnerMap[p._id.toString()] = p;
    });

    const conversations = messages.map((m) => {
      const partnerId = m.participants.flat()[0]?.toString();
      return {
        roomId: m._id,
        partner: partnerMap[partnerId] || null,
        lastMessage: m.lastMessage,
        lastMessageAt: m.lastMessageAt,
        unreadCount: m.unreadCount,
      };
    });

    res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error("❌ Get conversations error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch conversations",
    });
  }
};

module.exports = { getChatHistory, getConversations };
