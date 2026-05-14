const { verifyToken } = require("../services/auth.service");
const ChatMessage = require("../models/chat-message.model");
const User = require("../models/user.model");

// Track online users: Map<userId, Set<socketId>>
const onlineUsers = new Map();

/**
 * Initialize Socket.IO event handlers
 * @param {import("socket.io").Server} io
 */
const initializeWebSocket = (io) => {
  // Authenticate on connection using JWT
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = verifyToken(token);
      const user = await User.findById(decoded.userId).select(
        "name email role professionalDetails"
      );

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.userId = decoded.userId;
      socket.userName = user.name;
      socket.userRole = user.role;
      next();
    } catch (error) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.userId;
    console.log(
      `🔌 User connected: ${socket.userName} (${userId}) [${socket.userRole}]`
    );

    // Track online status
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Broadcast online status
    io.emit("user-online", { userId });

    // ── Join a chat room ──
    socket.on("join-room", async ({ recipientId }) => {
      try {
        const roomId = ChatMessage.generateRoomId(userId, recipientId);
        socket.join(roomId);
        console.log(
          `📨 ${socket.userName} joined room: ${roomId}`
        );

        // Mark unread messages as read
        await ChatMessage.updateMany(
          { roomId, receiverId: userId, read: false },
          { $set: { read: true } }
        );

        // Notify sender their messages were read
        socket.to(roomId).emit("messages-read", { readBy: userId, roomId });
      } catch (error) {
        console.error("❌ Join room error:", error.message);
        socket.emit("error", { message: "Failed to join room" });
      }
    });

    // ── Leave a chat room ──
    socket.on("leave-room", ({ recipientId }) => {
      const roomId = ChatMessage.generateRoomId(userId, recipientId);
      socket.leave(roomId);
      console.log(`👋 ${socket.userName} left room: ${roomId}`);
    });

    // ── Send a message ──
    socket.on("send-message", async ({ recipientId, message }) => {
      try {
        if (!message || !message.trim()) return;

        const roomId = ChatMessage.generateRoomId(userId, recipientId);

        // Save to database
        const chatMessage = await ChatMessage.create({
          senderId: userId,
          receiverId: recipientId,
          roomId,
          message: message.trim(),
        });

        const populatedMessage = {
          _id: chatMessage._id,
          senderId: userId,
          senderName: socket.userName,
          receiverId: recipientId,
          message: chatMessage.message,
          roomId,
          read: false,
          createdAt: chatMessage.createdAt,
        };

        // Emit to room (both sender and receiver)
        io.to(roomId).emit("receive-message", populatedMessage);

        // Also emit a notification to the recipient even if not in the room
        const recipientSockets = onlineUsers.get(recipientId);
        if (recipientSockets) {
          recipientSockets.forEach((socketId) => {
            io.to(socketId).emit("new-message-notification", {
              from: userId,
              fromName: socket.userName,
              message: chatMessage.message,
              roomId,
            });
          });
        }

        console.log(
          `💬 Message from ${socket.userName} in room ${roomId}`
        );
      } catch (error) {
        console.error("❌ Send message error:", error.message);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // ── Typing indicators ──
    socket.on("typing", ({ recipientId }) => {
      const roomId = ChatMessage.generateRoomId(userId, recipientId);
      socket.to(roomId).emit("user-typing", {
        userId,
        userName: socket.userName,
      });
    });

    socket.on("stop-typing", ({ recipientId }) => {
      const roomId = ChatMessage.generateRoomId(userId, recipientId);
      socket.to(roomId).emit("user-stop-typing", { userId });
    });

    // ── Mark messages as read (when user receives while panel is open) ──
    socket.on("mark-read", async ({ senderId }) => {
      try {
        const roomId = ChatMessage.generateRoomId(userId, senderId);

        // Mark all messages from sender to this user as read
        const result = await ChatMessage.updateMany(
          { roomId, senderId, receiverId: userId, read: false },
          { $set: { read: true } }
        );

        if (result.modifiedCount > 0) {
          // Notify the sender that their messages were read
          socket.to(roomId).emit("messages-read", { readBy: userId, roomId });
        }
      } catch (error) {
        console.error("❌ Mark read error:", error.message);
      }
    });

    // ── Check if a user is online ──
    socket.on("check-online", ({ userIds }) => {
      const statuses = {};
      userIds.forEach((id) => {
        statuses[id] = onlineUsers.has(id) && onlineUsers.get(id).size > 0;
      });
      socket.emit("online-statuses", statuses);
    });

    // ── Disconnect ──
    socket.on("disconnect", () => {
      console.log(`🔌 User disconnected: ${socket.userName} (${userId})`);

      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          io.emit("user-offline", { userId });
        }
      }
    });
  });
};

module.exports = { initializeWebSocket };
