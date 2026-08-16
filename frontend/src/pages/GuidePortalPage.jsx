import { useState } from "react";
import { UserCheck, Star, Calendar, MessageSquare, ShieldCheck, ToggleLeft, ToggleRight, Sparkles, Plus, Trash2, CalendarDays, Bell } from "lucide-react";
import useSeo from "../hooks/useSeo";
import api from "../utils/api";

export default function GuidePortalPage({ user }) {
  useSeo("Tour Guide Portal | Yatri.in");
  const [online, setOnline] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); // overview, profile, packages, bookings, calendar, gems, ai_helper

  // Profile States
  const [rate, setRate] = useState(user?.pricePerDay || 1800);
  const [experience, setExperience] = useState(user?.experience || 5);
  const [bio, setBio] = useState(user?.bio || "Expert local tour guide specialized in culture and street food tours.");
  const [languages, setLanguages] = useState("English, Hindi");
  const [certifications, setCertifications] = useState("Jaipur Tourism Board Certified, First Aid Certified");

  // Packages States
  const [packages, setPackages] = useState([
    { id: "1", name: "Jaipur Heritage Food Walk", category: "Food Tour", price: "1800", duration: "4 hours", groupSize: "6" },
    { id: "2", name: "Amber Fort Photo Trek", category: "Photography", price: "2000", duration: "6 hours", groupSize: "4" }
  ]);
  const [packageForm, setPackageForm] = useState({ name: "", category: "Food Tour", price: "1500", duration: "3 hours", groupSize: "8" });

  // Bookings States
  const [tours, setTours] = useState([
    { id: "GB-2201", traveler: "Demo Traveler", date: "2026-08-15", status: "Confirmed", amount: 1800, package: "Jaipur Heritage Food Walk" },
    { id: "GB-2209", traveler: "Rahul Verma", date: "2026-08-20", status: "Pending", amount: 2000, package: "Amber Fort Photo Trek" }
  ]);

  // Hidden Gems recommendations
  const [hiddenGems, setHiddenGems] = useState([
    { name: "Panna Meena ka Kund", type: "Hidden Gem", desc: "16th-century stepwell perfect for photography tours." }
  ]);
  const [gemForm, setGemForm] = useState({ name: "", type: "Hidden Gem", desc: "" });

  // Reviews
  const [reviews, setReviews] = useState([
    { id: "1", author: "Aman K.", rating: 5, comment: "Fabulous knowledge of food stalls! Highly recommended.", date: "July 28, 2026" }
  ]);

  // Guide AI States
  const [guideAiQuery, setGuideAiQuery] = useState("");
  const [guideAiChat, setGuideAiChat] = useState([
    { role: "assistant", content: "Hi! I am your Guide AI helper. Ask me about itinerary tips or description tweaks!" }
  ]);
  const [loadingAi, setLoadingAi] = useState(false);

  const triggerGuideAi = async (queryText) => {
    setLoadingAi(true);
    setGuideAiChat((prev) => [...prev, { role: "user", content: queryText }]);
    try {
      const response = await api.post("/assistant/chat", {
        message: `As a verified tour guide, answer: "${queryText}". Suggest experience enhancements.`
      });
      setGuideAiChat((prev) => [...prev, { role: "assistant", content: response.data.reply }]);
    } catch (_) {
      let reply = "Here is a marketing tip: Add local street food tasting nodes inside your heritage walks; travelers are currently showing 45% higher click rates on culinary inclusions.";
      if (queryText.toLowerCase().includes("pricing")) {
        reply = "Average local walk price points peak at Rs. 1,600 - Rs. 2,200. Pricing your food walk at Rs. 1,800 with raw local ingredients demo included maximizes signups.";
      } else if (queryText.toLowerCase().includes("itinerary")) {
        reply = "We recommend adding a 15-minute sunset photo session stop at Nahargarh Fort hills node inside the evening itinerary pack.";
      }
      setGuideAiChat((prev) => [...prev, { role: "assistant", content: reply }]);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleUpdateStatus = (id, nextStatus) => {
    setTours(tours.map((t) => (t.id === id ? { ...t, status: nextStatus } : t)));
  };

  const handleAddPackage = (e) => {
    e.preventDefault();
    if (!packageForm.name) return;
    setPackages([...packages, { id: String(Date.now()), ...packageForm }]);
    setPackageForm({ name: "", category: "Food Tour", price: "1500", duration: "3 hours", groupSize: "8" });
  };

  const handleDeletePackage = (id) => {
    setPackages(packages.filter((p) => p.id !== id));
  };

  const handleAddGem = (e) => {
    e.preventDefault();
    if (!gemForm.name) return;
    setHiddenGems([...hiddenGems, { ...gemForm }]);
    setGemForm({ name: "", type: "Hidden Gem", desc: "" });
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Welcome Bar */}
      <div className="rounded-2xl bg-gradient-to-r from-sky-900 via-slate-900 to-slate-900 p-6 text-white shadow-xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Licensed Local Guide Portal</span>
          <h1 className="text-3xl font-extrabold mt-1">Tour Guide Command Center</h1>
          <p className="text-sm text-slate-300 mt-1">Set your availability, manage walk reservations, and view traveler reviews.</p>
        </div>
        <button
          onClick={() => setOnline(!online)}
          className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-xs font-bold transition shadow-lg ${
            online ? "bg-emerald-500 text-white" : "bg-slate-700 text-slate-300"
          }`}
        >
          {online ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
          {online ? "Status: Online for Bookings" : "Status: Offline"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-6 text-xs font-bold">
        {[
          ["overview", "Overview"],
          ["profile", "Guide Profile"],
          ["packages", "Tour Packages"],
          ["bookings", "Guest Bookings"],
          ["calendar", "Interactive Calendar"],
          ["gems", "Hidden Gems & Food"],
          ["ai_helper", "AI Guide Assistant"]
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`rounded-lg px-4 py-2.5 transition ${
              activeTab === key
                ? "bg-sky-500 text-white shadow"
                : "bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
              <p className="text-xs text-slate-400 font-bold">Overall Rating</p>
              <p className="text-3xl font-black text-amber-500 mt-2 flex items-center gap-1">
                ★ {user?.rating || 4.9}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
              <p className="text-xs text-slate-400 font-bold">Active Tours</p>
              <p className="text-3xl font-black text-sky-600 dark:text-sky-400 mt-2">
                {tours.filter((t) => t.status === "Confirmed").length}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
              <p className="text-xs text-slate-400 font-bold">Pending Requests</p>
              <p className="text-3xl font-black text-amber-500 mt-2">
                {tours.filter((t) => t.status === "Pending").length}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
              <p className="text-xs text-slate-400 font-bold">Monthly Revenue</p>
              <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">Rs. 38,400</p>
            </div>
          </div>

          {/* AI Guide Advisory */}
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 dark:border-slate-800 dark:bg-slate-950/30">
            <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-400 mb-3 flex items-center gap-2">
              🍃 AI Tour Guide Growth Insights
            </h3>
            <div className="space-y-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              <p>• **Itinerary Advisory:** Cultural evening tours in Jaipur are currently exhibiting **45% higher traveler click rates** compared to daytime walks due to hot afternoon weather.</p>
              <p>• **Pricing Opportunity:** Historical fort walks are trending. Consider adding a small photography packaging add-on to capture premium margins.</p>
            </div>
          </div>
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Guide Profile Settings</h2>
          <form className="grid gap-4 md:grid-cols-2 text-xs">
            <div>
              <label className="block font-bold text-slate-500 mb-1">Daily Rate (Rs / Day)</label>
              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-500 mb-1">Experience (Years)</label>
              <input
                type="number"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-500 mb-1">Languages Spoken</label>
              <input
                value={languages}
                onChange={(e) => setLanguages(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-500 mb-1">Certifications</label>
              <input
                value={certifications}
                onChange={(e) => setCertifications(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-bold text-slate-500 mb-1">Biography & Specialties</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                rows={4}
              />
            </div>
            <button
              type="button"
              onClick={() => alert("Guide credentials submitted for admin review verification")}
              className="md:col-span-2 rounded-xl bg-sky-500 py-3 text-xs font-bold text-white hover:bg-sky-600 transition"
            >
              Save Credentials Settings
            </button>
          </form>
        </div>
      )}

      {/* Packages Tab */}
      {activeTab === "packages" && (
        <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm h-fit">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Create Tour Experience</h3>
            <form onSubmit={handleAddPackage} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Package Name</label>
                <input
                  value={packageForm.name}
                  onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                  placeholder="E.g. Old Delhi Street Food Walk"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none dark:border-slate-700 dark:bg-slate-950"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Category</label>
                  <select
                    value={packageForm.category}
                    onChange={(e) => setPackageForm({ ...packageForm, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none dark:border-slate-700 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
                  >
                    {["Adventure", "Historical", "Cultural", "Food Tour", "Photography", "Trekking", "Religious", "Luxury"].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Price (Rs)</label>
                  <input
                    type="number"
                    value={packageForm.price}
                    onChange={(e) => setPackageForm({ ...packageForm, price: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none dark:border-slate-700 dark:bg-slate-950"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Duration</label>
                  <input
                    value={packageForm.duration}
                    onChange={(e) => setPackageForm({ ...packageForm, duration: e.target.value })}
                    placeholder="E.g. 3 hours"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none dark:border-slate-700 dark:bg-slate-950"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Group Limit</label>
                  <input
                    type="number"
                    value={packageForm.groupSize}
                    onChange={(e) => setPackageForm({ ...packageForm, groupSize: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none dark:border-slate-700 dark:bg-slate-950"
                    required
                  />
                </div>
              </div>
              <button className="w-full rounded-xl bg-emerald-500 py-2.5 text-white font-bold hover:bg-emerald-600 transition">
                Create Package
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Active Experiences</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {packages.map((p) => (
                <div key={p.id} className="p-3 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm">{p.name}</span>
                    <p className="text-slate-400 mt-1">{p.category} • Rs. {p.price} • {p.duration}</p>
                  </div>
                  <button onClick={() => handleDeletePackage(p.id)} className="text-rose-500 hover:text-rose-700">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === "bookings" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Tour Bookings</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 font-bold">Booking ID</th>
                  <th className="pb-3 font-bold">Traveler</th>
                  <th className="pb-3 font-bold">Experience Package</th>
                  <th className="pb-3 font-bold">Walk Date</th>
                  <th className="pb-3 font-bold">Amount</th>
                  <th className="pb-3 font-bold">Status</th>
                  <th className="pb-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {tours.map((t) => (
                  <tr key={t.id} className="text-slate-700 dark:text-slate-300">
                    <td className="py-4 font-mono font-bold text-sky-500">#{t.id}</td>
                    <td className="py-4 font-extrabold">{t.traveler}</td>
                    <td className="py-4 font-bold">{t.package}</td>
                    <td className="py-4">{t.date}</td>
                    <td className="py-4 font-bold">Rs. {t.amount}</td>
                    <td className="py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.status === "Confirmed" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-4 text-right space-x-1.5 font-bold">
                      {t.status === "Pending" && (
                        <button
                          onClick={() => handleUpdateStatus(t.id, "Confirmed")}
                          className="bg-emerald-500 text-white rounded px-2.5 py-1 hover:bg-emerald-600 transition"
                        >
                          Confirm
                        </button>
                      )}
                      <button
                        onClick={() => handleUpdateStatus(t.id, "Cancelled")}
                        className="bg-red-50 text-red-600 rounded px-2.5 py-1 hover:bg-red-100 transition"
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Calendar Tab */}
      {activeTab === "calendar" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Availability Schedule</h2>
          <div className="grid gap-6 md:grid-cols-7 text-center">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="font-bold text-slate-400 text-xs py-2">{day}</div>
            ))}
            {Array.from({ length: 31 }).map((_, idx) => {
              const dayNum = idx + 1;
              const hasTour = dayNum === 15 || dayNum === 20;
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-xs font-black transition ${
                    hasTour ? "bg-sky-500 text-white shadow-lg" : "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <p className="text-right text-[10px] opacity-70">{dayNum}</p>
                  <p className="mt-1 font-bold">{hasTour ? "Tour" : "Available"}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Gems & Food Recommendations Tab */}
      {activeTab === "gems" && (
        <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Recommend Local Spot</h3>
            <form onSubmit={handleAddGem} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Spot Name</label>
                <input
                  value={gemForm.name}
                  onChange={(e) => setGemForm({ ...gemForm, name: e.target.value })}
                  placeholder="E.g. Galta Ji Monkey Temple"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none dark:border-slate-700 dark:bg-slate-950"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Short Description</label>
                <textarea
                  value={gemForm.desc}
                  onChange={(e) => setGemForm({ ...gemForm, desc: e.target.value })}
                  placeholder="Explain why this gem is special..."
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none dark:border-slate-700 dark:bg-slate-950"
                  rows={3}
                  required
                />
              </div>
              <button className="w-full rounded-xl bg-emerald-500 py-2.5 text-white font-bold hover:bg-emerald-600 transition">
                Endorse Spot
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Your Local Recommendations</h3>
            <div className="space-y-3">
              {hiddenGems.map((g) => (
                <div key={g.name} className="p-4 rounded-xl border border-slate-100 bg-slate-50 dark:bg-slate-950 dark:border-slate-800 text-xs flex justify-between items-start gap-3">
                  <div>
                    <span className="font-extrabold text-sm text-slate-950 dark:text-white">{g.name}</span>
                    <p className="text-slate-500 mt-1 font-semibold">💡 {g.desc}</p>
                  </div>
                  <span className="bg-sky-100 text-sky-800 px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap">
                    {g.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Guide Assistant Helper */}
      {activeTab === "ai_helper" && (
        <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm h-fit">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">AI Suggestions Desk</h3>
            <div className="flex flex-col gap-2">
              {[
                "How do I optimize pricing?",
                "Suggest itinerary additions.",
                "How can I attract more luxury travelers?"
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => triggerGuideAi(q)}
                  className="w-full text-left rounded-xl bg-slate-100 p-3 hover:bg-sky-500 hover:text-white transition text-xs font-bold text-slate-700 dark:bg-slate-950 dark:text-slate-300"
                >
                  ⚡ {q}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm flex flex-col h-[400px] justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b pb-2 mb-3">Guide AI Business Partner</h3>
              <div className="space-y-3 overflow-y-auto max-h-[280px] pr-2 text-xs">
                {guideAiChat.map((m, idx) => (
                  <div key={idx} className={`p-3 rounded-xl max-w-[85%] ${m.role === "user" ? "bg-sky-100 text-sky-900 ml-auto" : "bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-300"}`}>
                    <p className="font-bold text-[10px] uppercase mb-0.5">{m.role === "user" ? "You" : "Yatri AI"}</p>
                    <p className="leading-relaxed font-semibold">{m.content}</p>
                  </div>
                ))}
                {loadingAi && (
                  <div className="p-3 rounded-xl bg-slate-50 text-slate-400 italic">
                    AI is processing itinerary nodes...
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <input
                value={guideAiQuery}
                onChange={(e) => setGuideAiQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && triggerGuideAi(guideAiQuery)}
                placeholder="Ask Guide AI assistant..."
                className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none text-xs dark:border-slate-700 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
              />
              <button
                onClick={() => {
                  triggerGuideAi(guideAiQuery);
                  setGuideAiQuery("");
                }}
                className="bg-sky-500 hover:bg-sky-600 text-white rounded-xl px-4 py-2 font-bold text-xs"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
