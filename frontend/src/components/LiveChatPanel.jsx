import { useState, useRef, useEffect, useCallback } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import { getChatHistory } from "../services/api";
import Cookies from "js-cookie";
import { X, Send, MessageCircle, Circle } from "lucide-react";

const SOCKET_URL = (import.meta.env.VITE_API_URL || "http://localhost:5001/api").replace("/api", "");

export default function LiveChatPanel({ professional, isOpen, onClose }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("");
  const [isProfOnline, setIsProfOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  // Initialize socket connection
  useEffect(() => {
    if (!isOpen || !user || !professional) return;

    const token = Cookies.get("token");
    if (!token) return;

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on("connect", () => {
      console.log("🔌 Socket connected");
      setIsConnected(true);

      // Join the room with this professional
      newSocket.emit("join-room", { recipientId: professional._id });

      // Check if professional is online
      newSocket.emit("check-online", { userIds: [professional._id] });
    });

    newSocket.on("disconnect", () => {
      console.log("🔌 Socket disconnected");
      setIsConnected(false);
    });

    newSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
      setIsConnected(false);
    });

    // Receive messages
    newSocket.on("receive-message", (msg) => {
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      scrollToBottom();

      // Mark message as read since the panel is open
      if (msg.senderId === professional._id) {
        newSocket.emit("mark-read", { senderId: professional._id });
      }
    });

    // Typing indicators
    newSocket.on("user-typing", ({ userName }) => {
      setIsTyping(true);
      setTypingUser(userName);
    });

    newSocket.on("user-stop-typing", () => {
      setIsTyping(false);
      setTypingUser("");
    });

    // Online status
    newSocket.on("online-statuses", (statuses) => {
      if (statuses[professional._id]) {
        setIsProfOnline(true);
      }
    });

    newSocket.on("user-online", ({ userId }) => {
      if (userId === professional._id) setIsProfOnline(true);
    });

    newSocket.on("user-offline", ({ userId }) => {
      if (userId === professional._id) setIsProfOnline(false);
    });

    // Messages read
    newSocket.on("messages-read", () => {
      setMessages((prev) =>
        prev.map((m) =>
          m.senderId === user._id ? { ...m, read: true } : m
        )
      );
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit("leave-room", { recipientId: professional._id });
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [isOpen, user, professional?._id]);

  // Load chat history
  useEffect(() => {
    if (!isOpen || !user || !professional) return;

    const loadHistory = async () => {
      setLoading(true);
      try {
        const res = await getChatHistory(professional._id);
        if (res.success) {
          setMessages(res.data);
          scrollToBottom();
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [isOpen, professional?._id, user]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Send message
  const sendMessage = () => {
    if (!input.trim() || !socket || !isConnected) return;

    socket.emit("send-message", {
      recipientId: professional._id,
      message: input.trim(),
    });

    // Stop typing
    socket.emit("stop-typing", { recipientId: professional._id });
    setInput("");
  };

  // Handle typing
  const handleInputChange = (e) => {
    setInput(e.target.value);

    if (socket && isConnected) {
      socket.emit("typing", { recipientId: professional._id });

      // Clear previous timeout
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      // Stop typing after 2s of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stop-typing", { recipientId: professional._id });
      }, 2000);
    }
  };

  // Format time
  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "Today";
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, msg) => {
    const dateKey = new Date(msg.createdAt).toDateString();
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(msg);
    return groups;
  }, {});

  if (!isOpen || !professional) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-50 flex flex-col"
        style={{
          animation: "slideIn 0.3s ease-out forwards",
        }}
      >
        <style>{`
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          @keyframes fadeInUp {
            from { transform: translateY(8px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes pulse-ring {
            0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
            70% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
            100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
          }
          @keyframes bounce-dots-live {
            0%, 100% { transform: translateY(0); opacity: 0.4; }
            50% { transform: translateY(-3px); opacity: 1; }
          }
          .typing-dot-1 { animation: bounce-dots-live 1s infinite; }
          .typing-dot-2 { animation: bounce-dots-live 1s infinite 0.15s; }
          .typing-dot-3 { animation: bounce-dots-live 1s infinite 0.3s; }
        `}</style>

        {/* ── Header ── */}
        <div className="bg-gradient-to-r from-[#1B2F4E] to-[#2A4470] px-5 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-11 h-11 rounded-full bg-[#8A6C2A] flex items-center justify-center shadow-lg border-2 border-[#8A6C2A]/30">
                <span className="text-white font-bold text-base">
                  {professional.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              {/* Online indicator */}
              <div
                className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#1B2F4E] ${isProfOnline ? "bg-green-400" : "bg-gray-400"
                  }`}
                style={isProfOnline ? { animation: "pulse-ring 2s infinite" } : {}}
              />
            </div>

            <div className="min-w-0">
              <h3 className="text-white font-bold text-sm truncate leading-tight">
                {professional.name}
              </h3>
              <div className="flex items-center gap-1.5">
                <span className="text-[#8A6C2A] text-[10px] font-black uppercase tracking-widest">
                  {professional.professionalDetails?.profession || "Expert"}
                </span>
                <span className="text-white/40 text-[10px]">•</span>
                <span className={`text-[10px] font-semibold ${isProfOnline ? "text-green-300" : "text-white/40"}`}>
                  {isProfOnline ? "Online" : "Offline"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Connection status */}
            <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-400" : "bg-red-400"} animate-pulse`} />
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X size={18} className="text-white" />
            </button>
          </div>
        </div>

        {/* ── Messages Area ── */}
        <div className="flex-1 overflow-y-auto px-4 py-4 bg-[#F8FAFC] space-y-1">
          {loading ? (
            <div className="flex-1 flex items-center justify-center h-full">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#FAF3E4] border border-[#8A6C2A]/20 mb-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#8A6C2A] border-t-transparent" />
                </div>
                <p className="text-sm text-[#3D4F66] font-medium">Loading chat history...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center h-full">
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#FAF3E4] border border-[#8A6C2A]/20 mb-4 shadow-sm">
                  <MessageCircle size={28} className="text-[#8A6C2A]" />
                </div>
                <p className="text-[#1B2F4E] font-bold text-base mb-1">Start a Conversation</p>
                <p className="text-sm text-[#3D4F66] max-w-[240px] mx-auto">
                  Send a message to <strong>{professional.name}</strong> about your contract.
                </p>
              </div>
            </div>
          ) : (
            Object.entries(groupedMessages).map(([dateKey, msgs]) => (
              <div key={dateKey}>
                {/* Date divider */}
                <div className="flex items-center justify-center my-4">
                  <div className="px-3 py-1 bg-[#E2E8F0] rounded-full">
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                      {formatDate(msgs[0].createdAt)}
                    </span>
                  </div>
                </div>

                {msgs.map((msg, i) => {
                  const isMine = msg.senderId === user?._id || msg.senderId === user?.id;
                  return (
                    <div
                      key={msg._id || i}
                      className={`flex ${isMine ? "justify-end" : "justify-start"} mb-2`}
                      style={{ animation: `fadeInUp 0.2s ease-out ${i * 0.03}s both` }}
                    >
                      <div className={`max-w-[80%] group relative`}>
                        <div
                          className={`px-4 py-2.5 rounded-2xl shadow-sm ${isMine
                            ? "bg-[#1B2F4E] text-white rounded-br-md"
                            : "bg-white text-[#1B2F4E] border border-[#E2E8F0] rounded-bl-md"
                            }`}
                        >
                          <p className="text-[13px] leading-relaxed whitespace-pre-wrap break-words">
                            {msg.message}
                          </p>
                        </div>
                        <div className={`flex items-center gap-1 mt-0.5 px-1 ${isMine ? "justify-end" : "justify-start"}`}>
                          <span className="text-[10px] text-[#94A3B8]">
                            {formatTime(msg.createdAt)}
                          </span>
                          {isMine && (
                            <span className="text-[10px]">
                              {msg.read ? (
                                <span className="text-blue-400">✓✓</span>
                              ) : (
                                <span className="text-[#94A3B8]">✓</span>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start mb-2">
              <div className="bg-white border border-[#E2E8F0] px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-[#8A6C2A] font-semibold mr-1">{typingUser || "Expert"}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#8A6C2A] typing-dot-1" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#8A6C2A] typing-dot-2" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#8A6C2A] typing-dot-3" />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* ── Input Area ── */}
        <div className="border-t border-[#E2E8F0] p-4 bg-white flex-shrink-0">
          {!isConnected ? (
            <div className="flex items-center justify-center gap-2 py-3 text-sm text-amber-600 bg-amber-50 rounded-xl border border-amber-200">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="font-medium">Reconnecting...</span>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 bg-[#F8FAFC] border border-[#CBD2DC] rounded-xl text-sm font-medium focus:outline-none focus:border-[#1B2F4E] focus:ring-1 focus:ring-[#1B2F4E] transition-all placeholder:text-gray-400"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="w-12 h-12 bg-[#1B2F4E] text-white rounded-xl hover:bg-[#8A6C2A] transition-all disabled:opacity-30 disabled:grayscale flex items-center justify-center shadow-md group"
              >
                <Send size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          )}

          {/* Powered by indicator */}
          <div className="flex items-center justify-center mt-2 gap-1">
            <Circle size={4} className="text-green-400 fill-green-400" />
            <span className="text-[9px] text-[#94A3B8] font-semibold uppercase tracking-widest">
              Live Chat
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
