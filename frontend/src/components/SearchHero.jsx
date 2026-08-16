import {
  Bus,
  Calendar,
  Compass,
  Hotel,
  LocateFixed,
  MapPin,
  Search,
  Sparkles,
  TrainFront,
  UserCheck,
  Users
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const tabs = [
  { id: "hotels", label: "Hotels", icon: Hotel },
  { id: "buses", label: "Buses", icon: Bus },
  { id: "trains", label: "Trains", icon: TrainFront },
  { id: "packages", label: "Packages", icon: Compass },
  { id: "guides", label: "Tour Guides", icon: UserCheck },
  { id: "ai", label: "AI Planner", icon: Sparkles }
];

export default function SearchHero() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("hotels");
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Form states
  const [city, setCity] = useState("");
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("Jaipur");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("all");
  const [days, setDays] = useState("3");
  const [budget, setBudget] = useState("15000");

  const submit = (event) => {
    event.preventDefault();

    if (activeTab === "hotels") {
      const params = new URLSearchParams();
      params.set("city", city || "New Delhi");
      if (search) params.set("search", search);
      navigate(`/results?${params.toString()}`);
    } else if (activeTab === "buses") {
      const params = new URLSearchParams({ to: to || "Jaipur", date });
      if (from.trim()) params.set("from", from.trim());
      navigate(`/buses?${params.toString()}`);
    } else if (activeTab === "trains") {
      const params = new URLSearchParams({ to: to || "Goa", date });
      if (from.trim()) params.set("from", from.trim());
      navigate(`/trains?${params.toString()}`);
    } else if (activeTab === "packages") {
      const params = new URLSearchParams({ destination: city || "Jaipur", category });
      navigate(`/packages?${params.toString()}`);
    } else if (activeTab === "guides") {
      const params = new URLSearchParams({ category: "guide", city: city || "New Delhi" });
      navigate(`/results?${params.toString()}`);
    } else if (activeTab === "ai") {
      const params = new URLSearchParams({ destination: city || "Jaipur", days, budget });
      navigate(`/ai-planner?${params.toString()}`);
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const params = new URLSearchParams({
          lat: String(position.coords.latitude),
          lng: String(position.coords.longitude),
          distance: "15000",
          sort: "nearest"
        });
        navigate(`/results?${params.toString()}`);
      },
      () => setLoadingLocation(false),
      { enableHighAccuracy: true }
    );
  };

  return (
    <section className="relative min-h-[85vh] overflow-hidden bg-luxury-blue">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(115deg, rgba(15,42,74,0.92), rgba(14,165,233,0.30), rgba(16,185,129,0.45)), url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e)"
        }}
      />
      <div className="absolute inset-0 animate-gradient bg-[length:300%_300%] bg-gradient-to-br from-sky-500/25 via-transparent to-yellow-300/20" />
      <div className="absolute left-6 top-24 h-36 w-36 rounded-full bg-luxury-gold/20 blur-3xl" />
      <div className="absolute bottom-16 right-10 h-48 w-48 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 py-20 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-luxury-gold uppercase tracking-wider backdrop-blur-md">
            ✨ Pure Luxury Awaits You
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl leading-[1.15] drop-shadow-md">
            Your Premium Companion <br />
            For <span className="bg-gradient-to-r from-luxury-gold via-yellow-200 to-emerald-400 bg-clip-text text-transparent">Luxury Travel</span> In India
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-200 font-medium">
            Book premium hotels, buses, custom holiday packages, and tour guides. Leverage our instant SOS security map and AI planner.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-4xl"
        >
          {/* Tabs header */}
          <div className="flex justify-center">
            <div className="flex flex-wrap justify-center gap-1.5 rounded-t-2xl border border-white/20 bg-slate-950/60 p-2 backdrop-blur-xl">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                      isSelected
                        ? "bg-gradient-to-r from-luxury-gold to-yellow-500 text-luxury-blue shadow-lg shadow-gold"
                        : "text-slate-200 hover:bg-white/10"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Specific Form */}
          <form onSubmit={submit} className="rounded-b-2xl border border-white/20 bg-white/15 p-4 sm:p-6 shadow-2xl backdrop-blur-2xl">
            {activeTab === "hotels" && (
              <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto_auto]">
                <label className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    placeholder="City, e.g. New Delhi, Jaipur"
                    className="w-full rounded-xl border border-white/20 bg-white px-10 py-3 text-sm text-slate-900 outline-none"
                  />
                </label>
                <label className="relative">
                  <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Resorts, heritage stays, amenities..."
                    className="w-full rounded-xl border border-white/20 bg-white px-10 py-3 text-sm text-slate-900 outline-none"
                  />
                </label>
                <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-luxury-gold px-6 py-3 text-sm font-bold text-luxury-blue transition hover:scale-105 shadow-gold">
                  <Search className="h-4 w-4" /> Search Hotels
                </button>
                <button
                  type="button"
                  onClick={detectLocation}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-slate-950/40 px-4 py-3 text-sm font-medium text-white hover:bg-slate-950/60"
                >
                  <LocateFixed className="h-4 w-4" /> {loadingLocation ? "Locating..." : "Nearby"}
                </button>
              </div>
            )}

            {activeTab === "buses" && (
              <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
                <input
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  placeholder="From area/city, e.g. Jaipur, Delhi, Pune"
                  className="w-full rounded-xl border border-white/20 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                />
                <input
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="To area/city, e.g. Udaipur, Goa, Rishikesh"
                  className="w-full rounded-xl border border-white/20 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                />
                <input
                  type="date"
                  value={date}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                />
                <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-emerald-600 transition">
                  <Bus className="h-4 w-4" /> Search Buses
                </button>
              </div>
            )}

            {activeTab === "trains" && (
              <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
                <input
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  placeholder="From station/city optional, e.g. Mumbai"
                  className="w-full rounded-xl border border-white/20 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                />
                <input
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="To station/city, e.g. Goa, Jaipur, Agra"
                  className="w-full rounded-xl border border-white/20 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                />
                <input
                  type="date"
                  value={date}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                />
                <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-sky-600 transition">
                  <TrainFront className="h-4 w-4" /> Search Trains
                </button>
              </div>
            )}

            {activeTab === "packages" && (
              <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Destination: e.g. Rajasthan, Kashmir, Bali"
                  className="w-full rounded-xl border border-white/20 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                >
                  <option value="all">All Package Categories</option>
                  <option value="Family">Family Vacation</option>
                  <option value="Honeymoon">Honeymoon Special</option>
                  <option value="Adventure">Adventure & Trekking</option>
                  <option value="Religious">Pilgrimage & Spiritual</option>
                </select>
                <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-500 px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-purple-600 transition">
                  <Compass className="h-4 w-4" /> Find Packages
                </button>
              </div>
            )}

            {activeTab === "guides" && (
              <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City to explore: e.g. New Delhi, Agra, Jaipur"
                  className="w-full rounded-xl border border-white/20 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Languages: English, Hindi, French..."
                  className="w-full rounded-xl border border-white/20 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                />
                <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-sky-600 transition">
                  <UserCheck className="h-4 w-4" /> Find Local Guides
                </button>
              </div>
            )}

            {activeTab === "ai" && (
              <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Destination: e.g. Jaipur"
                  className="w-full rounded-xl border border-white/20 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                />
                <select
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                >
                  {[2, 3, 4, 5, 7].map((d) => (
                    <option key={d} value={d}>{d} Days</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="Budget (Rs)"
                  className="w-full rounded-xl border border-white/20 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                />
                <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-luxury-gold to-luxury-emerald px-6 py-3 text-sm font-extrabold text-luxury-blue shadow-gold transition hover:scale-105">
                  <Sparkles className="h-4 w-4" /> Generate AI Plan
                </button>
              </div>
            )}
          </form>
        </motion.div>
      </div>
    </section>
  );
}
