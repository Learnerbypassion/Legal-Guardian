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

export default function ChatBox({ contractText, language = "English", isLoadingDoc = false }) {
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

  // Logic: Web Speech API initialization (UNTOUCHED)
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
    if (!user) {
      toast.error("Please sign in to use chat");
      navigate("/login");
      return;
    }
    if (!contractText || contractText.trim().length < 10) {
      toast.error("Contract text is not available. Please reload the page.");
      return;
    }

    const q = (question || input).trim();
    if (!q || loading) return;

    const userMsg = { role: "user", content: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages
        .filter((m, idx) => idx > 0)
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await askQuestion({ contractText, question: q, history, language });
      const answer = response.answer || response.data?.answer || "No response received";
      
      setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
    } catch (error) {
      const errorMsg = error?.response?.data?.error || error?.message || "Failed to get answer";
      toast.error(errorMsg);
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I couldn't answer that. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-[#CBD2DC] overflow-hidden flex flex-col h-full">
      <style>{`
        @keyframes bounce-dots {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
        .dot-1 { animation: bounce-dots 1s infinite; }
        .dot-2 { animation: bounce-dots 1s infinite 0.15s; }
        .dot-3 { animation: bounce-dots 1s infinite 0.3s; }
      `}</style>

      {/* Header - Navy & Gold Theme */}
      <div className="bg-[#1B2F4E] px-6 py-5 border-b border-[#8A6C2A]/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#8A6C2A] animate-pulse shadow-[0_0_8px_#8A6C2A]" />
            <h3 className="text-[#FAF3E4] font-bold text-sm uppercase tracking-widest">Legal Assistant</h3>
          </div>
          <span className="px-3 py-1 bg-[#8A6C2A] text-white text-[10px] font-black uppercase tracking-tighter rounded-md">
            AI POWERED
          </span>
        </div>
      </div>

      {!user ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#F8FAFC]">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#FAF3E4] border border-[#8A6C2A]/20 mb-6 shadow-sm">
              <svg className="w-8 h-8 text-[#1B2F4E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-[#1B2F4E] font-bold text-lg mb-2">Secure Chat Locked</p>
            <p className="text-sm text-[#3D4F66] mb-8 max-w-[200px] mx-auto">Please sign in to access AI contract interrogation.</p>
            <button
              onClick={() => navigate("/login")}
              className="w-full py-3 bg-[#1B2F4E] text-white rounded-xl hover:bg-[#8A6C2A] transition-all font-bold uppercase tracking-widest text-xs shadow-md"
            >
              Sign In to Interrogate
            </button>
          </div>
        </div>
      ) : isLoadingDoc ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#F8FAFC]">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#8A6C2A] border-t-transparent" />
            </div>
            <p className="text-[#1B2F4E] font-bold text-lg mb-2">Loading Document</p>
            <p className="text-sm text-[#3D4F66] mb-8">Retrieving contract details from database...</p>
          </div>
        </div>
      ) : !contractText || contractText.trim().length < 10 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#FFF9F9]">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-50 border border-orange-100 mb-6">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-[#1B2F4E] font-bold text-lg mb-2">Document Text Unavailable</p>
            <p className="text-sm text-[#3D4F66] mb-6">This document was analyzed before text storage was enabled. Please re-upload the document to chat about it.</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate('/')}
                className="px-6 py-2 bg-[#1B2F4E] text-white rounded-lg hover:bg-[#15253d] transition font-bold text-sm"
              >
                Re-upload Document
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 border-2 border-[#1B2F4E] text-[#1B2F4E] rounded-lg hover:bg-[#1B2F4E] hover:text-white transition font-bold text-sm"
              >
                Reload
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Quick Questions - Refreshed Pills */}
          {messages.length === 1 && (
            <div className="px-6 py-5 border-b border-[#F1F5F9] bg-[#F8FAFC]">
              <p className="text-[10px] text-[#8A6C2A] font-black mb-4 uppercase tracking-[0.2em]">Suggested Inquiries</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    disabled={loading}
                    className="px-4 py-2 text-[15px] bg-white text-[#1B2F4E] border border-[#CBD2DC] rounded-lg hover:border-[#8A6C2A] hover:text-[#8A6C2A] transition-all font-bold shadow-sm disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages - Professional Bubbles */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FDFDFD]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] px-5 py-4 rounded-2xl shadow-sm ${
                    msg.role === "user"
                      ? "bg-[#1B2F4E] text-[#FAF3E4] rounded-tr-none"
                      : "bg-[#F1F5F9] text-[#1B2F4E] border border-[#E2E8F0] rounded-tl-none font-medium"
                  }`}
                >
                  <p className="text-lg leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#F1F5F9] px-5 py-4 rounded-2xl rounded-tl-none border border-[#E2E8F0]">
                  <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#8A6C2A] dot-1" />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#8A6C2A] dot-2" />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#8A6C2A] dot-3" />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input Area - Clean & Corporate */}
          <div className="border-t border-[#E2E8F0] p-5 space-y-4 bg-white">
            {transcript && (
              <div className="bg-[#FAF3E4] border border-[#8A6C2A]/20 rounded-xl p-3 animate-pulse">
                <p className="text-[10px] text-[#8A6C2A] font-black mb-1 uppercase tracking-widest">Listening...</p>
                <p className="text-sm text-[#1B2F4E] italic font-medium">"{transcript}"</p>
              </div>
            )}

            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
                placeholder="Inquire about a specific clause..."
                disabled={loading}
                className="flex-1 px-5 py-3.5 bg-[#F8FAFC] border border-[#CBD2DC] rounded-xl text-sm font-medium focus:outline-none focus:border-[#1B2F4E] focus:ring-1 focus:ring-[#1B2F4E] disabled:bg-gray-100 transition-all placeholder:text-gray-400"
              />
              <button
                onClick={toggleVoiceInput}
                disabled={loading}
                className={`w-12 h-12 rounded-xl transition-all flex items-center justify-center border-2 ${
                  isRecording
                    ? "bg-red-600 border-red-600 text-white animate-pulse"
                    : "bg-white border-[#CBD2DC] text-[#3D4F66] hover:border-[#1B2F4E] hover:text-[#1B2F4E]"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4" />
                </svg>
              </button>
              <button
                onClick={() => send()}
                disabled={!input.trim() || loading}
                className="px-6 h-12 bg-[#1B2F4E] text-white rounded-xl hover:bg-[#8A6C2A] transition-all disabled:opacity-30 disabled:grayscale flex items-center justify-center shadow-md group"
              >
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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