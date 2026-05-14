const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    roomId: {
      type: String,
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
chatMessageSchema.index({ roomId: 1, createdAt: 1 });
chatMessageSchema.index({ senderId: 1 });
chatMessageSchema.index({ receiverId: 1 });

/**
 * Generate a deterministic roomId from two user IDs
 * Always sorts IDs so both users get the same room
 */
chatMessageSchema.statics.generateRoomId = function (userId1, userId2) {
  return [userId1.toString(), userId2.toString()].sort().join("_");
};

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
