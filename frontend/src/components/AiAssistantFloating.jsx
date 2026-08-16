import { useEffect, useRef, useState } from "react";
import {
  Sparkles,
  Send,
  Mic,
  Volume2,
  VolumeX,
  Paperclip,
  Image as ImageIcon,
  MessageSquare,
  Minus,
  Maximize2
} from "lucide-react";
import api from "../utils/api";

export default function AiAssistantFloating({ user }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "assistant",
      text: "Hello! I am your AI Travel Assistant. I am automatically synced with your current booked hotels, itineraries, and budget limits. How can I help you today?"
    }
  ]);
  const [typing, setTyping] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [attachedImages, setAttachedImages] = useState([]);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, typing]);

  const handleSend = async (textToSend = input) => {
    if (!textToSend.trim() && attachedFiles.length === 0 && attachedImages.length === 0) return;

    // Build message content
    const filesRepresentation = attachedFiles.map((f) => `📎 ${f.name}`).join(", ");
    const imagesRepresentation = attachedImages.map((img) => `🖼️ ${img.name}`).join(", ");

    const displayMsg = [
      textToSend,
      filesRepresentation && `[File: ${filesRepresentation}]`,
      imagesRepresentation && `[Image: ${imagesRepresentation}]`
    ]
      .filter(Boolean)
      .join("\n");

    const userMessage = { sender: "user", text: displayMsg };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setAttachedFiles([]);
    setAttachedImages([]);
    setTyping(true);

    try {
      const response = await api.post("/utility/ai-assistant", {
        message: displayMsg,
        history: messages,
        userId: user?._id
      });

      setTyping(false);
      const aiResponse = { sender: "assistant", text: response.data.text };
      setMessages((prev) => [...prev, aiResponse]);

      // Read response if voice is enabled
      if (voiceEnabled) {
        speakText(response.data.text);
      }
    } catch (err) {
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        { sender: "assistant", text: "I apologize, I am having trouble connecting to my service right now. Please try again shortly." }
      ]);
    }
  };

  const handleSpeechInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported on this browser.");
      return;
    }
    const rec = new SpeechRecognition();
    rec.lang = "en-US";
    rec.start();
    rec.onresult = (e) => {
      const resultText = e.results[0][0].transcript;
      setInput(resultText);
      handleSend(resultText);
    };
  };

  const speakText = (text) => {
    // Strip markdown formatting symbols for speech synthesis
    const cleanText = text
      .replace(/###/g, "")
      .replace(/\*\*/g, "")
      .replace(/- /g, "")
      .replace(/💡/g, "")
      .replace(/🍲/g, "")
      .replace(/🌤️/g, "")
      .replace(/🚨/g, "")
      .replace(/💱/g, "");

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setAttachedFiles((prev) => [...prev, ...files]);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setAttachedImages((prev) => [...prev, ...files]);
  };

  // Parses markdown headers and lists into clean JSX
  const parseMarkdown = (txt) => {
    return txt.split("\n").map((line, index) => {
      if (line.startsWith("###")) {
        return (
          <h4 key={index} className="text-sm font-black text-slate-900 dark:text-white mt-3 mb-1">
            {line.replace("###", "").trim()}
          </h4>
        );
      }
      if (line.startsWith("-") || line.startsWith("*")) {
        return (
          <li key={index} className="ml-4 list-disc text-xs text-slate-700 dark:text-slate-300 leading-relaxed mt-0.5">
            {line.substring(1).trim()}
          </li>
        );
      }
      return (
        <p key={index} className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mt-1">
          {line}
        </p>
      );
    });
  };

  return (
    <>
      {/* Floating Action Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50 print:hidden">
        <button
          onClick={() => setOpen(!open)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 via-sky-600 to-indigo-600 text-white shadow-2xl transition hover:scale-105"
        >
          <Sparkles className="h-6 w-6 animate-pulse" />
        </button>
      </div>

      {/* Chat Panel Box Drawer */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-full max-w-sm rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95 overflow-hidden flex flex-col justify-between h-[520px] print:hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-500">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">AI Travel Assistant</h3>
                <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Synced & Context-Aware</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`p-1.5 rounded-lg border transition ${
                  voiceEnabled
                    ? "bg-sky-50 border-sky-100 text-sky-600"
                    : "border-slate-200 text-slate-400"
                }`}
                title="Toggle Voice Output"
              >
                {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-extrabold text-xs">
                ✕
              </button>
            </div>
          </div>

          {/* Message scroll area */}
          <div className="flex-1 overflow-y-auto my-4 pr-1 space-y-3">
            {messages.map((msg, i) => {
              const isMe = msg.sender === "user";
              return (
                <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-sm ${
                      isMe
                        ? "bg-sky-500 text-white rounded-br-none"
                        : "bg-slate-50 border border-slate-100 dark:bg-slate-950 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none"
                    }`}
                  >
                    {isMe ? <p className="whitespace-pre-wrap">{msg.text}</p> : parseMarkdown(msg.text)}
                  </div>
                </div>
              );
            })}
            {typing && (
              <div className="flex justify-start">
                <div className="bg-slate-50 rounded-2xl px-4 py-2.5 text-xs dark:bg-slate-950 dark:border dark:border-slate-800 text-slate-400 animate-pulse">
                  AI Assistant is processing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick recommendations / prompt widgets */}
          <div className="mb-3 flex flex-wrap gap-1.5 overflow-x-auto pb-1.5">
            {[
              ["Show weather forecast", "🌦️ Weather"],
              ["Show packing list", "🎒 Packing List"],
              ["Suggest local food", "🍲 Street Food"],
              ["Emergency services", "🚨 Emergencies"]
            ].map(([prompt, label]) => (
              <button
                key={prompt}
                onClick={() => {
                  setInput(prompt);
                  handleSend(prompt);
                }}
                className="rounded-full bg-slate-50 border border-slate-200 hover:bg-slate-100 dark:bg-slate-950 dark:border-slate-800 px-3 py-1 text-[10px] font-semibold text-slate-600 dark:text-slate-300 transition"
              >
                {label}
              </button>
            ))}
          </div>

          {/* Attached items indicators preview */}
          {(attachedFiles.length > 0 || attachedImages.length > 0) && (
            <div className="mb-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-950 flex flex-wrap gap-2 text-[10px] font-bold text-slate-500">
              {attachedFiles.map((f) => (
                <span key={f.name} className="bg-sky-50 text-sky-600 px-2 py-0.5 rounded-lg border border-sky-100">
                  📎 {f.name}
                </span>
              ))}
              {attachedImages.map((img) => (
                <span key={img.name} className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded-lg border border-amber-100">
                  🖼️ {img.name}
                </span>
              ))}
            </div>
          )}

          {/* Action Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 border-t pt-3 border-slate-100 dark:border-slate-800"
          >
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition"
              title="Upload file document"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition"
              title="Upload image"
            >
              <ImageIcon className="h-4 w-4" />
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              multiple
            />
            <input
              type="file"
              ref={imageInputRef}
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              multiple
            />

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your destination..."
              className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs focus:border-sky-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />

            <button
              type="button"
              onClick={handleSpeechInput}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 text-slate-400 hover:text-sky-500 transition"
              title="Voice Input"
            >
              <Mic className="h-4 w-4" />
            </button>

            {speaking && (
              <button
                type="button"
                onClick={stopSpeaking}
                className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-500 transition"
                title="Stop Speaking Output"
              >
                ■
              </button>
            )}

            <button
              type="submit"
              className="rounded-xl bg-sky-500 p-2 text-white hover:bg-sky-600 transition"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
