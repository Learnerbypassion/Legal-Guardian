const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const connectDB = require("./config/db");
const { PORT, FRONTEND_URL } = require("./config/env");
const { initializeWebSocket } = require("./controllers/livechat.handler");

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  // Create HTTP server from Express app
  const server = http.createServer(app);

  // Initialize Socket.IO with CORS
  const io = new Server(server, {
    cors: {
      origin: [
        FRONTEND_URL,
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "https://legal-gurdian.netlify.app",
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Initialize WebSocket handlers
  initializeWebSocket(io);

  // Start server
  server.listen(PORT, () => {
    console.log(`\n🛡️  Legal Guardian API running on port ${PORT}`);
    console.log(`📡 Health: http://localhost:${PORT}/health`);
    console.log(`📄 Upload: POST http://localhost:${PORT}/api/upload`);
    console.log(`🧠 Analyze: POST http://localhost:${PORT}/api/analyze`);
    console.log(`💬 Chat:   POST http://localhost:${PORT}/api/chat`);
    console.log(`🔌 WebSocket: ws://localhost:${PORT} (Socket.IO)\n`);
  });
};

startServer();
