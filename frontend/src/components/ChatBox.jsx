import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { askQuestion } from "../services/api";
import toast from "react-hot-toast";

const QUICK_QUESTIONS = [
  "Can I cancel this contract?",
  "What happens if I miss a payment?",
  "Is there an auto-renewal clause?",
  "What are my main obligations?",
];

export default function ChatBox({ contractText, language = "English" }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I've analyzed your contract. Ask me anything about it — in plain language.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const bottomRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize Web Speech API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition && !recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language === "Hindi" ? "hi-IN" : language === "Bengali" ? "bn-IN" : "en-US";

      recognitionRef.current.onstart = () => {
        setIsRecording(true);
        setTranscript("");
      };

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setTranscript((prev) => prev + transcript + " ");
            setInput((prev) => prev + transcript + " ");
          } else {
            interimTranscript += transcript;
          }
        }
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        toast.error("Microphone error. Please try again.");
        setIsRecording(false);
      };
    }
  }, [language]);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast.error("Voice input not supported in your browser");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const send = async (question) => {
    // Check if user is authenticated
    if (!user) {
      toast.error("Please sign in to use chat");
      navigate("/login");
      return;
    }

    // Check if contractText is available
    if (!contractText || contractText.trim().length < 10) {
      toast.error("Contract text is not available. Please reload the page.");
      console.error("Invalid contractText:", contractText);
      return;
    }

    const q = (question || input).trim();
    if (!q || loading) return;

    const userMsg = { role: "user", content: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Build chat history excluding the initial assistant message
      const history = messages
        .filter((m, idx) => idx > 0) // Skip the initial greeting
        .map((m) => ({ role: m.role, content: m.content }));

      console.log("Sending to API:", {
        contractText: contractText.substring(0, 100) + "...",
        question: q,
        historyLength: history.length,
        language,
      });

      const response = await askQuestion({ contractText, question: q, history, language });
      const answer = response.answer || response.data?.answer || "No response received";
      
      setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
      toast.success("Got response!");
    } catch (error) {
      console.error("Chat error:", error);
      const errorMsg = error?.response?.data?.error || error?.message || "Failed to get answer";
      toast.error(errorMsg);
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I couldn't answer that. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden flex flex-col h-full">
      <style>{`
        @keyframes bounce-dots {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
        .dot-1 { animation: bounce-dots 1s infinite; }
        .dot-2 { animation: bounce-dots 1s infinite 0.15s; }
        .dot-3 { animation: bounce-dots 1s infinite 0.3s; }
      `}</style>

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
            <h3 className="text-white font-semibold text-lg">Ask Legal Guardian</h3>
          </div>
          <span className="px-3 py-1 bg-white bg-opacity-20 text-white text-xs font-semibold rounded-full">
            AI Assistant
          </span>
        </div>
      </div>

      {!user ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-gray-700 font-semibold mb-2">Sign in to chat</p>
            <p className="text-sm text-gray-600 mb-6">Ask questions about your contract with AI assistance</p>
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition font-medium"
            >
              Sign In Now
            </button>
          </div>
        </div>
      ) : !contractText || contractText.trim().length < 10 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-red-50 to-orange-50">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-700 font-semibold mb-2">Contract not loaded</p>
            <p className="text-sm text-gray-600 mb-6">Please reload the page or upload a new document</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition font-medium"
            >
              Reload Page
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Quick Questions */}
          {messages.length === 1 && (
            <div className="px-6 py-4 border-b border-gray-200">
              <p className="text-xs text-gray-600 font-semibold mb-3 uppercase">Quick Questions</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    disabled={loading}
                    className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-indigo-100 hover:text-indigo-700 transition font-medium disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-br-none"
                      : "bg-gray-100 text-gray-900 rounded-bl-none"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 px-4 py-3 rounded-lg rounded-bl-none">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400 dot-1" />
                    <div className="w-2 h-2 rounded-full bg-gray-400 dot-2" />
                    <div className="w-2 h-2 rounded-full bg-gray-400 dot-3" />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4 space-y-3">
            {/* Voice Input Transcript Display */}
            {transcript && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-600 font-semibold mb-1">Voice Input:</p>
                <p className="text-sm text-blue-900">{transcript}</p>
              </div>
            )}

            {/* Input Controls */}
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
                placeholder="Ask about the contract…"
                disabled={loading}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50"
              />
              <button
                onClick={toggleVoiceInput}
                disabled={loading}
                className={`px-3 py-2.5 rounded-lg transition flex items-center justify-center ${
                  isRecording
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "border border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
                title="Voice input"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4"
                  />
                </svg>
              </button>
              <button
                onClick={() => send()}
                disabled={!input.trim() || loading}
                className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9-9m0 0l-9-9m9 9H3" />
                </svg>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

