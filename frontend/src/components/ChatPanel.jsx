import { useEffect, useRef, useState } from "react";
import { Send, X, MessageSquare, Sparkles } from "lucide-react";
import api from "../utils/api";

export default function ChatPanel({ guide, onClose }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  const loadMessages = async () => {
    try {
      const { data } = await api.get("/messages");
      // filter messages between me and this guide
      const conversation = data.filter(
        (msg) =>
          (msg.sender._id === guide._id || msg.sender === guide._id) ||
          (msg.receiver._id === guide._id || msg.receiver === guide._id)
      );
      setMessages(conversation);
    } catch (_err) {
      console.error("Unable to load chat messages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000); // Poll every 3 seconds for mock real-time
    return () => clearInterval(interval);
  }, [guide._id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const currentText = text;
    setText("");

    try {
      const { data } = await api.post("/messages", {
        receiverId: guide._id,
        text: currentText
      });
      setMessages((prev) => [...prev, data]);
      // Refetch messages soon to catch the simulated setTimeout reply
      setTimeout(loadMessages, 2000);
    } catch (_err) {
      console.error("Failed to send message");
    }
  };

  const avatar =
    guide.profilePhoto ||
    `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(guide.name || "Guide")}`;

  return (
    <div className="flex flex-col h-[500px] w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between bg-slate-900 px-4 py-3 text-white">
        <div className="flex items-center gap-3">
          <img src={avatar} alt={guide.name} className="h-10 w-10 rounded-full object-cover border border-white/20" />
          <div>
            <h4 className="text-sm font-bold">{guide.name}</h4>
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active Guide
            </span>
          </div>
        </div>
        <button onClick={onClose} className="rounded-full p-1 hover:bg-white/10 transition text-slate-400 hover:text-white">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages Window */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-950">
        {loading ? (
          <div className="flex h-full items-center justify-center text-xs text-slate-400">Connecting chat...</div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col h-full items-center justify-center text-center p-6 text-slate-400">
            <MessageSquare className="h-8 w-8 text-sky-500 mb-2 opacity-55" />
            <p className="text-xs font-semibold">Start conversation with {guide.name}</p>
            <p className="text-[10px] mt-1">Discuss daily schedules, custom destinations, or special pricing.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender === guide._id || msg.sender._id === guide._id ? false : true;
            return (
              <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                  isMe
                    ? "bg-sky-500 text-white rounded-br-none"
                    : "bg-white text-slate-800 border border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 rounded-bl-none"
                }`}>
                  <p>{msg.text}</p>
                  <span className={`block text-[9px] mt-1 text-right ${isMe ? "text-sky-100" : "text-slate-400"}`}>
                    {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={scrollRef} />
      </div>

      {/* Message input form */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask a question or plan details..."
          className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm focus:border-sky-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
        />
        <button type="submit" className="rounded-xl bg-sky-500 p-2.5 text-white transition hover:bg-sky-600">
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
