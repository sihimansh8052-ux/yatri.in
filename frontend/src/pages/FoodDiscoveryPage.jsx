import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  UtensilsCrossed,
  Flame,
  Search,
  MapPin,
  Clock,
  Navigation,
  ThumbsUp,
  Sparkles,
  DollarSign
} from "lucide-react";
import api from "../utils/api";
import useSeo from "../hooks/useSeo";

export default function FoodDiscoveryPage() {
  useSeo("Street Food & Cafe Discovery | Yatri.in");
  const [searchParams] = useSearchParams();
  const hotelId = searchParams.get("hotelId");

  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);

  // Preference filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [budget, setBudget] = useState("all");
  const [preference, setPreference] = useState("all");
  const [spicy, setSpicy] = useState("all");

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/discover/street-food", {
        params: {
          hotelId,
          budget: budget === "all" ? undefined : budget,
          preference: preference === "all" ? undefined : preference,
          spicy: spicy === "all" ? undefined : spicy
        }
      });
      // Client-side query search match helper
      const filtered = data.filter((s) => {
        if (!searchQuery) return true;
        return (
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (s.cuisine || []).some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      });
      setSpots(filtered);
    } catch (_) {
      setSpots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [hotelId, budget, preference, spicy, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      {/* Visual Premium Header Banner */}
      <section
        className="relative h-72 w-full bg-cover bg-center flex flex-col justify-end p-6 md:p-12 text-white"
        style={{
          backgroundImage:
            "linear-gradient(to top, rgba(15,23,42,0.95), rgba(15,23,42,0.30)), url(https://images.unsplash.com/photo-1565557623262-b51c2513a641)"
        }}
      >
        <div className="absolute top-6 left-6 inline-flex items-center gap-2 rounded-full bg-luxury-gold/25 border border-luxury-gold/40 px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-luxury-gold backdrop-blur-md">
          ✨ Flagship AI Culinary Engine
        </div>
        <div className="max-w-4xl">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            AI-Powered Street Food & Cafe Guide
          </h1>
          <p className="mt-2 text-xs md:text-sm text-slate-200 font-medium max-w-2xl">
            Locate high-rated local street food stalls, cafes, tea counters, and desserts nearby. Our AI classifies food choices according to your preferences.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          {/* AI Filter controls Panel */}
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sticky top-24">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-luxury-gold" /> AI Preference Tuning
            </h2>
            <div className="mt-5 space-y-4">
              {/* Search */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Search Cuisine or dish
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Chaat, Kulfi, South Indian..."
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-4 text-xs focus:border-sky-500 outline-none dark:border-slate-700 dark:bg-slate-950 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Preference */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Culinary Preference
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ["all", "Show All"],
                    ["veg", "Pure Veg"]
                  ].map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => setPreference(val)}
                      className={`rounded-xl py-2 text-xs font-bold transition border ${
                        preference === val
                          ? "bg-sky-500 border-sky-500 text-white shadow-md shadow-sky-500/20"
                          : "bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Budget Class
                </label>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 text-slate-800 dark:text-slate-200 outline-none"
                >
                  <option value="all">All Budgets</option>
                  <option value="budget">Budget Stalls (Rs. 50 - 200)</option>
                  <option value="mid">Mid Tier Cafes (Rs. 200 - 500)</option>
                  <option value="premium">Fine Dining (Rs. 500+)</option>
                </select>
              </div>

              {/* Spicy level */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Spice Tolerance
                </label>
                <select
                  value={spicy}
                  onChange={(e) => setSpicy(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 text-slate-800 dark:text-slate-200 outline-none"
                >
                  <option value="all">Any Spice Level</option>
                  <option value="low">Low Spice / Sweet</option>
                  <option value="medium">Medium Spice</option>
                  <option value="high">High Spice / Hot</option>
                </select>
              </div>
            </div>
          </aside>

          {/* List display */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5 text-sky-500" /> Nearby Gastronomy Discoveries
            </h2>

            {loading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-64 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
                ))}
              </div>
            ) : spots.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {spots.map((spot) => (
                  <div
                    key={spot._id}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Image Cover */}
                      <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-950 overflow-hidden">
                        <img
                          src={spot.images?.[0] || "https://images.unsplash.com/photo-1565557623262-b51c2513a641"}
                          alt={spot.name}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                        <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-luxury-gold to-yellow-500 px-2.5 py-1 text-[10px] font-black text-luxury-blue shadow-lg shadow-gold">
                          <Sparkles className="h-3 w-3" /> AI {spot.aiScore}% Match
                        </div>
                      </div>

                      {/* Info body */}
                      <div className="p-4 sm:p-5">
                        <div className="flex items-center justify-between">
                          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                            {spot.name}
                          </h3>
                          <span className="text-xs font-bold text-amber-500 flex items-center gap-0.5">
                            ★ {spot.rating || 4.5}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 font-semibold flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-sky-500 shrink-0" /> {spot.address}
                        </p>

                        {/* Walking & Driving time info row */}
                        <div className="mt-3 flex items-center gap-4 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-slate-400" /> Walk: {spot.walkingTime || "8 mins"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Navigation className="h-3.5 w-3.5 text-slate-400" /> Drive: {spot.drivingTime || "3 mins"}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3.5 w-3.5 text-slate-400" /> {spot.priceLevel}
                          </span>
                        </div>

                        {/* AI Match explanation banner */}
                        {spot.aiReason && (
                          <div className="mt-4 rounded-xl bg-gradient-to-r from-sky-50 to-white dark:from-sky-950/20 dark:to-slate-900 border border-sky-100 dark:border-sky-900/50 p-3 text-xs text-sky-700 dark:text-sky-300 leading-relaxed font-semibold">
                            💡 {spot.aiReason}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                      <span className="text-xs font-bold text-sky-500">
                        {(spot.cuisine || []).slice(0, 2).join(" • ")}
                      </span>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.name + " " + spot.address)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg bg-sky-500 hover:bg-sky-600 px-3 py-1.5 text-xs font-bold text-white shadow-md transition"
                      >
                        Get Directions ➔
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center text-slate-400 italic text-sm">
                No local street food recommendations found matching your preferences. Try broadening your tuning parameters!
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
