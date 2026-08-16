import { useState, useEffect, useRef } from "react";
import { Send, Image, Smile, CheckCheck, Paperclip, MessageCircle, MoreVertical, Phone } from "lucide-react";
import useSeo from "../hooks/useSeo";

export default function CommunicationCenterPage() {
  useSeo("Communication Center | Yatri.in");

  const [activeChannel, setActiveChannel] = useState("guide"); // guide, host, support
  const [typing, setTyping] = useState(false);
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef(null);

  // Conversations logs lists
  const [conversations, setConversations] = useState({
    guide: {
      name: "Guide Amit Sharma",
      avatar: "https://api.dicebear.com/8.x/initials/svg?seed=Amit",
      status: "Online",
      messages: [
        { id: "1", text: "Hello! Ready for the Jaipur Heritage Walk tomorrow at 9 AM?", sender: "other", time: "10:15 AM", read: true },
        { id: "2", text: "Please bring light cotton wear and comfortable shoes.", sender: "other", time: "10:16 AM", read: true }
      ]
    },
    host: {
      name: "Host Grand Horizon",
      avatar: "https://api.dicebear.com/8.x/initials/svg?seed=Horizon",
      status: "Offline",
      messages: [
        { id: "1", text: "Your Deluxe Suite check-in key is ready for pickup at reception desk.", sender: "other", time: "Yesterday", read: true },
        { id: "2", text: "Let us know if you need early check-in.", sender: "other", time: "Yesterday", read: true }
      ]
    },
    support: {
      name: "Yatri Safety Helpline",
      avatar: "https://api.dicebear.com/8.x/initials/svg?seed=Support",
      status: "Online",
      messages: [
        { id: "1", text: "Welcome to Yatri Safety Support. How can we assist you today?", sender: "other", time: "11:00 AM", read: true }
      ]
    }
  });

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsgText = inputText;
    const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Append user message
    setConversations(prev => {
      const updated = { ...prev };
      updated[activeChannel].messages.push({
        id: String(Date.now()),
        text: userMsgText,
        sender: "me",
        time: timeNow,
        read: false
      });
      return updated;
    });

    setInputText("");

    // Simulate Typing Indicator & Auto-reply from guide/host
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setConversations(prev => {
        const updated = { ...prev };
        let reply = "Understood. See you tomorrow!";
        if (activeChannel === "host") {
          reply = "Perfect, we have updated your stay checklist preferences.";
        } else if (activeChannel === "support") {
          reply = "Our emergency agent has logged your coordinates update.";
        }
        updated[activeChannel].messages.push({
          id: String(Date.now() + 1),
          text: reply,
          sender: "other",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          read: true
        });
        return updated;
      });
    }, 2500);
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations[activeChannel].messages.length, typing]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Header bar */}
      <div className="rounded-2xl bg-gradient-to-r from-sky-900 via-slate-900 to-slate-900 p-6 text-white shadow-xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Yatri Chat Center</span>
          <h1 className="text-3xl font-extrabold mt-1">Real-Time Messaging Hub</h1>
          <p className="text-sm text-slate-300 mt-1">Secure communication between travelers, local guides, and emergency helpdesks.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[300px_1fr] h-[550px]">
        {/* Sidebar list */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm flex flex-col gap-2 overflow-y-auto">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Active Chats</h3>
          {Object.entries(conversations).map(([key, item]) => (
            <button
              key={key}
              onClick={() => setActiveChannel(key)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition text-left text-xs ${
                activeChannel === key ? "bg-sky-500 text-white" : "bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
              }`}
            >
              <img src={item.avatar} alt={item.name} className="w-10 h-10 rounded-full border" />
              <div className="flex-1 min-w-0">
                <p className="font-extrabold truncate">{item.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-2 h-2 rounded-full ${item.status === "Online" ? "bg-emerald-500" : "bg-slate-400"}`} />
                  <span className="opacity-70">{item.status}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Chat Window */}
        <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm flex flex-col justify-between overflow-hidden">
          {/* Header */}
          <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={conversations[activeChannel].avatar} alt={conversations[activeChannel].name} className="w-10 h-10 rounded-full border border-white/20" />
              <div>
                <h4 className="text-sm font-bold">{conversations[activeChannel].name}</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-2 h-2 rounded-full ${conversations[activeChannel].status === "Online" ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                  <span className="text-[10px] text-slate-300 font-semibold">{conversations[activeChannel].status}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-white/10 rounded-xl transition">
                <Phone className="h-4.5 w-4.5 text-slate-300 hover:text-white" />
              </button>
              <button className="p-2 hover:bg-white/10 rounded-xl transition">
                <MoreVertical className="h-4.5 w-4.5 text-slate-300 hover:text-white" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-950">
            {conversations[activeChannel].messages.map((msg) => {
              const isMe = msg.sender === "me";
              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-xs shadow-sm relative ${
                    isMe
                      ? "bg-sky-500 text-white rounded-br-none"
                      : "bg-white text-slate-800 border border-slate-200 dark:border-slate-850 dark:bg-slate-900 dark:text-slate-100 rounded-bl-none"
                  }`}>
                    <p className="font-semibold leading-relaxed">{msg.text}</p>
                    <div className="mt-1 flex items-center justify-end gap-1 text-[9px] opacity-70">
                      <span>{msg.time}</span>
                      {isMe && <CheckCheck className="h-3 w-3 text-sky-100" />}
                    </div>
                  </div>
                </div>
              );
            })}

            {typing && (
              <div className="flex justify-start">
                <div className="bg-white text-slate-400 border rounded-2xl px-4 py-2 text-xs italic dark:bg-slate-900 dark:border-slate-800">
                  {conversations[activeChannel].name} is typing...
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Form Input */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2">
            <button type="button" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl text-slate-400 transition">
              <Paperclip className="h-4.5 w-4.5" />
            </button>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Write a secure message..."
              className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-xs focus:border-sky-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
            <button type="submit" className="rounded-xl bg-sky-500 p-2.5 text-white transition hover:bg-sky-600">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
