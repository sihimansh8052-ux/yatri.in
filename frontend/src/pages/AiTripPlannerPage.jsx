import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Sparkles,
  Calendar,
  Wallet,
  MapPin,
  Sun,
  Sunset,
  Moon,
  CheckCircle2,
  CloudSun,
  Briefcase,
  AlertCircle,
  Clock,
  Compass
} from "lucide-react";
import api from "../utils/api";
import useSeo from "../hooks/useSeo";

export default function AiTripPlannerPage() {
  useSeo("AI Trip Planner & Itinerary Builder | Yatri.in");
  const [params] = useSearchParams();

  const [form, setForm] = useState({
    destination: params.get("destination") || "Jaipur",
    days: params.get("days") || "3",
    budget: params.get("budget") || "15000",
    tripType: "Solo",
    hotelCategory: "3 Star",
    interests: ["culture", "food"],
    foodPreference: "Veg",
    transportationPreference: "Cab",
    accessibilityRequirements: "None"
  });

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkedItems, setCheckedItems] = useState({});

  const generatePlan = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/utility/ai-planner", form);
      setPlan(data);
      // Reset checklists state
      setCheckedItems({});
    } catch (err) {
      console.error("AI Planner error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generatePlan();
  }, []);

  const toggleInterest = (tag) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(tag)
        ? prev.interests.filter((x) => x !== tag)
        : [...prev.interests, tag]
    }));
  };

  const handleToggleCheck = (category, item) => {
    const key = `${category}-${item}`;
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleBudgetChange = (val) => {
    setForm((prev) => ({ ...prev, budget: val }));
  };

  const recommendationSections = plan?.recommendations
    ? [
        {
          key: "hotels",
          title: "Recommended Hotels",
          link: plan.bookingLinks?.hotels,
          items: plan.recommendations.hotels || [],
          detail: (item) => `${item.city || form.destination} • Rs. ${(item.pricePerNight || 0).toLocaleString("en-IN")}/night • ${item.rating || 4.5} rating`
        },
        {
          key: "buses",
          title: "Available Buses",
          link: plan.bookingLinks?.buses,
          items: plan.recommendations.buses || [],
          detail: (item) => `${item.from || "Origin"} to ${item.to || form.destination} • Rs. ${(item.price || 0).toLocaleString("en-IN")} • ${item.departureTime || "Flexible"}`
        },
        {
          key: "trains",
          title: "Available Trains",
          link: plan.bookingLinks?.trains,
          items: plan.recommendations.trains || [],
          detail: (item) => `${item.from || "Origin"} to ${item.to || form.destination} • Rs. ${(item.price || 0).toLocaleString("en-IN")} • ${item.departureTime || "Flexible"}`
        },
        {
          key: "places",
          title: "Tourist Places",
          link: plan.bookingLinks?.places,
          items: plan.recommendations.places || [],
          detail: (item) => `${item.city || form.destination} • ${item.bestTimeToVisit || "Best in morning"} • ${item.rating || 4.5} rating`
        },
        {
          key: "restaurants",
          title: "Local Food",
          link: plan.bookingLinks?.restaurants,
          items: plan.recommendations.restaurants || [],
          detail: (item) => `${item.city || form.destination} • ${(item.cuisine || []).slice(0, 2).join(", ") || form.foodPreference} • ${item.rating || 4.5} rating`
        },
        {
          key: "guides",
          title: "Local Guides",
          link: plan.bookingLinks?.guides,
          items: plan.recommendations.guides || [],
          detail: (item) => `${item.city || form.destination} • Rs. ${(item.pricePerDay || 0).toLocaleString("en-IN")}/day • ${item.experience || 2}+ yrs`
        }
      ].filter((section) => section.items.length)
    : [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      {/* Banner */}
      <section
        className="relative h-60 w-full bg-cover bg-center flex flex-col justify-end p-6 md:p-12 text-white"
        style={{
          backgroundImage:
            "linear-gradient(to top, rgba(15,23,42,0.95), rgba(15,23,42,0.30)), url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e)"
        }}
      >
        <div className="absolute top-6 left-6 inline-flex items-center gap-2 rounded-full bg-sky-500/25 border border-sky-400/40 px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-sky-300 backdrop-blur-md">
          🤖 Next Gen Travel AI v2.5
        </div>
        <div className="max-w-4xl">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            AI Trip Planner
          </h1>
          <p className="mt-2 text-xs md:text-sm text-slate-200 font-medium max-w-xl">
            Create day-by-day customized travel itineraries, weather-tuned packing lists, and structured budget models in seconds.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
          
          {/* AI Settings Form */}
          <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md dark:border-slate-800 dark:bg-slate-900 h-fit space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Compass className="h-4.5 w-4.5 text-sky-500" /> Customize Itinerary
            </h2>

            <form onSubmit={generatePlan} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Destination</label>
                <input
                  value={form.destination}
                  onChange={(e) => setForm({ ...form, destination: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 text-slate-800 dark:text-white outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Days</label>
                  <select
                    value={form.days}
                    onChange={(e) => setForm({ ...form, days: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 text-slate-800 dark:text-white outline-none focus:border-sky-500"
                  >
                    {[1, 2, 3, 4, 5, 7, 10].map((d) => (
                      <option key={d} value={d}>{d} Days</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Trip Vibe</label>
                  <select
                    value={form.tripType}
                    onChange={(e) => setForm({ ...form, tripType: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 text-slate-800 dark:text-white outline-none"
                  >
                    {["Solo", "Couple", "Family", "Friends", "Business", "Adventure", "Luxury", "Budget", "Honeymoon", "Pilgrimage", "Weekend Getaway"].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Stay Standard</label>
                  <select
                    value={form.hotelCategory}
                    onChange={(e) => setForm({ ...form, hotelCategory: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 text-slate-800 dark:text-white outline-none"
                  >
                    {["Budget Hostel", "3 Star", "4 Star", "Luxury Resort", "Boutique Homestay"].map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Diet Preference</label>
                  <select
                    value={form.foodPreference}
                    onChange={(e) => setForm({ ...form, foodPreference: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 text-slate-800 dark:text-white outline-none"
                  >
                    {["Veg", "Non-Veg", "Jain", "Vegan", "Halal"].map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Transit Preference</label>
                <select
                  value={form.transportationPreference}
                  onChange={(e) => setForm({ ...form, transportationPreference: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 text-slate-800 dark:text-white outline-none"
                >
                  {["Cab", "Public Transit", "Rental Bike", "Walking"].map((tr) => (
                    <option key={tr} value={tr}>{tr}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Accessibility Mode</label>
                <select
                  value={form.accessibilityRequirements}
                  onChange={(e) => setForm({ ...form, accessibilityRequirements: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 text-slate-800 dark:text-white outline-none"
                >
                  {["None", "Wheelchair Access", "Elevator Access", "Low Mobility"].map((ac) => (
                    <option key={ac} value={ac}>{ac}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-bold">Interests</label>
                <div className="flex flex-wrap gap-1.5">
                  {["culture", "food", "adventure", "nature", "devotional"].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleInterest(tag)}
                      className={`rounded-lg px-2.5 py-1.5 text-xs font-bold capitalize border transition ${
                        form.interests.includes(tag)
                          ? "bg-sky-500 text-white border-sky-500 shadow-md shadow-sky-500/20"
                          : "bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  <span>Max Budget</span>
                  <span className="text-sky-500 font-extrabold">Rs. {Number(form.budget).toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="150000"
                  step="5000"
                  value={form.budget}
                  onChange={(e) => handleBudgetChange(e.target.value)}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500 dark:bg-slate-800"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 py-3 text-xs font-black text-white shadow-lg hover:bg-sky-700 transition"
              >
                {loading ? "Re-generating Itinerary..." : "Regenerate AI Itinerary"}
              </button>
            </form>
          </aside>

          {/* AI Result display */}
          <section className="space-y-6">
            {loading ? (
              <div className="py-24 text-center text-slate-400 italic text-sm animate-pulse">
                AI Architect is drawing coordinates, calculating distances, and matching packing schedules...
              </div>
            ) : plan ? (
              <div className="space-y-6">
                {recommendationSections.length > 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Bookable Yatri Recommendations</h3>
                        <p className="mt-1 text-xs text-slate-500">Matched from local hotels, buses, trains, food places, tourist places, and guides in your database.</p>
                      </div>
                      <span className="rounded-lg bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                        Live Inventory
                      </span>
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {recommendationSections.map((section) => (
                        <div key={section.key} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-xs font-black text-slate-900 dark:text-white">{section.title}</p>
                            {section.link && (
                              <Link to={section.link} className="rounded-lg bg-sky-500 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-sky-600">
                                Open
                              </Link>
                            )}
                          </div>
                          <div className="mt-3 space-y-2">
                            {section.items.slice(0, 3).map((item) => (
                              <div key={item._id || item.name || item.operatorName} className="rounded-lg bg-slate-50 p-2 dark:bg-slate-950/60">
                                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{item.name || item.operatorName}</p>
                                <p className="mt-0.5 text-[11px] font-medium text-slate-500">{section.detail(item)}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Weather widget */}
                {plan.weather && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm flex items-start gap-4">
                    <CloudSun className="h-10 w-10 text-amber-500 shrink-0 mt-1" />
                    <div>
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                        Expected Destination Weather ({plan.weather.temperature || "Moderate"})
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                        {plan.weather.condition}
                      </p>
                      <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mt-2 uppercase tracking-wide">
                        💡 Dress Advisory: {plan.weather.recommendation}
                      </p>
                    </div>
                  </div>
                )}

                {/* Smart cost split breakdown */}
                {plan.breakdown && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Smart Cost Estimator</h3>
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-6 gap-3 text-center text-xs">
                      <div className="rounded-xl bg-sky-50/50 p-2.5 dark:bg-slate-950">
                        <p className="text-[10px] text-slate-400 font-bold">Hotels</p>
                        <p className="text-sm font-black text-sky-600 dark:text-sky-400 mt-0.5">Rs. {plan.breakdown.stay}</p>
                      </div>
                      <div className="rounded-xl bg-amber-50/50 p-2.5 dark:bg-slate-950">
                        <p className="text-[10px] text-slate-400 font-bold">Food</p>
                        <p className="text-sm font-black text-amber-600 dark:text-amber-400 mt-0.5">Rs. {plan.breakdown.food}</p>
                      </div>
                      <div className="rounded-xl bg-emerald-50/50 p-2.5 dark:bg-slate-950">
                        <p className="text-[10px] text-slate-400 font-bold">Transit</p>
                        <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-0.5">Rs. {plan.breakdown.transit}</p>
                      </div>
                      <div className="rounded-xl bg-purple-50/50 p-2.5 dark:bg-slate-950">
                        <p className="text-[10px] text-slate-400 font-bold">Sightseeing</p>
                        <p className="text-sm font-black text-purple-600 dark:text-purple-400 mt-0.5">Rs. {plan.breakdown.sightseeing}</p>
                      </div>
                      <div className="rounded-xl bg-pink-50/50 p-2.5 dark:bg-slate-950">
                        <p className="text-[10px] text-slate-400 font-bold">Shopping</p>
                        <p className="text-sm font-black text-pink-600 dark:text-pink-400 mt-0.5">Rs. {plan.breakdown.shopping}</p>
                      </div>
                      <div className="rounded-xl bg-red-50/50 p-2.5 dark:bg-slate-950">
                        <p className="text-[10px] text-slate-400 font-bold">Emergency</p>
                        <p className="text-sm font-black text-red-600 dark:text-red-400 mt-0.5">Rs. {plan.breakdown.emergency}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Day-by-Day itinerary */}
                <div className="space-y-4">
                  {(plan.itinerary || []).map((dayItem) => (
                    <div key={dayItem.day} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-500">
                          <Calendar className="h-3.5 w-3.5" /> Day {dayItem.day}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Visit Hours: {dayItem.visitingHours || "09 AM - 09 PM"}
                        </span>
                      </div>
                      <h4 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1.5">{dayItem.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{dayItem.summary}</p>

                      <div className="mt-4 grid gap-3 md:grid-cols-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                        <div className="rounded-xl bg-slate-50 p-3.5 dark:bg-slate-950/40">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
                            <Sun className="h-4 w-4" /> Morning
                          </div>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1.5 leading-relaxed">{dayItem.morning?.activity}</p>
                          <p className="text-[10px] text-slate-400 mt-1 font-bold">{dayItem.morning?.time}</p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-3.5 dark:bg-slate-950/40">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-orange-500">
                            <Sunset className="h-4 w-4" /> Afternoon
                          </div>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1.5 leading-relaxed">{dayItem.afternoon?.activity}</p>
                          <p className="text-[10px] text-slate-400 mt-1 font-bold">{dayItem.afternoon?.time}</p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-3.5 dark:bg-slate-950/40">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-500">
                            <Moon className="h-4 w-4" /> Evening
                          </div>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1.5 leading-relaxed">{dayItem.evening?.activity}</p>
                          <p className="text-[10px] text-slate-400 mt-1 font-bold">{dayItem.evening?.time}</p>
                        </div>
                      </div>

                      {dayItem.tips && (
                        <div className="mt-3 flex items-start gap-1.5 rounded-lg bg-emerald-50/50 p-3 dark:bg-emerald-950/10 text-[11px] text-emerald-800 dark:text-emerald-400 leading-relaxed font-semibold">
                          <AlertCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>AI Tip: {dayItem.tips}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Checklist widget */}
                {plan.packingList && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-sky-500" /> Weather-Tuned Packing Checklist
                    </h3>
                    <div className="mt-5 grid gap-6 md:grid-cols-2">
                      {Object.entries(plan.packingList).map(([category, items]) => (
                        <div key={category} className="space-y-2">
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-1 dark:border-slate-800 capitalize">
                            {category}
                          </p>
                          <div className="space-y-1.5">
                            {items.map((item) => {
                              const checkedKey = `${category}-${item}`;
                              const isChecked = !!checkedItems[checkedKey];
                              return (
                                <div
                                  key={item}
                                  onClick={() => handleToggleCheck(category, item)}
                                  className="flex items-center gap-2 cursor-pointer p-1.5 hover:bg-slate-50 dark:hover:bg-slate-950 rounded-lg text-xs"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {}}
                                    className="rounded border-slate-300 text-sky-500 focus:ring-sky-500 shrink-0"
                                  />
                                  <span className={`font-medium ${isChecked ? "line-through text-slate-400" : "text-slate-800 dark:text-slate-300"}`}>
                                    {item}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center text-slate-400 italic text-sm">
                Complete the customization form on the left to begin generating your travel plan.
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
}
