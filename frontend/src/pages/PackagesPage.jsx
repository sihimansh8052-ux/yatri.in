import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Bus, Compass, Calendar, Star, CheckCircle2, Sparkles, MapPin, TrainFront } from "lucide-react";
import api from "../utils/api";
import useSeo from "../hooks/useSeo";

export default function PackagesPage({ user }) {
  useSeo("Holiday Packages & Custom Tours | Yatri.in");
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customForm, setCustomForm] = useState({
    destination: "Jaipur",
    days: "4",
    budget: "15000",
    interests: "Culture & Cuisine"
  });
  const [building, setBuilding] = useState(false);

  const category = params.get("category") || "all";
  const destination = params.get("destination") || "";
  const type = params.get("type") || "all";

  useEffect(() => {
    setLoading(true);
    api.get("/packages", { params: { category, destination, type } })
      .then(({ data }) => setPackages(data))
      .catch(() => setPackages([]))
      .finally(() => setLoading(false));
  }, [category, destination, type]);

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    setBuilding(true);
    try {
      const { data } = await api.post("/packages/custom", customForm);
      setPackages((prev) => [data, ...prev]);
      setShowCustomModal(false);
    } catch (err) {
      alert("Failed to generate custom package.");
    } finally {
      setBuilding(false);
    }
  };

  const handleBookPackage = async (pkg) => {
    if (!localStorage.getItem("yatri_token")) {
      alert("Please login first to book your holiday package.");
      navigate("/auth");
      return;
    }
    try {
      const { data } = await api.post("/bookings", {
        bookingType: "package",
        packageId: pkg._id,
        totalPrice: pkg.pricePerPerson
      });
      navigate(`/booking-confirmation/${data._id}`);
    } catch (err) {
      alert(err.response?.data?.message || "Package booking failed.");
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="rounded-2xl bg-gradient-to-r from-purple-900 to-slate-900 p-6 text-white shadow-xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-300">Curated Tour Packages</span>
          <h1 className="text-3xl font-extrabold mt-1">Domestic & International Holiday Packages</h1>
          <p className="text-sm text-slate-300 mt-1">Honeymoon, Family Vacations, Heritage Walks, & Custom Itinerary Tours.</p>
        </div>
        <button
          onClick={() => setShowCustomModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-luxury-gold to-luxury-emerald px-5 py-3 text-xs font-extrabold text-luxury-blue shadow-gold transition hover:scale-105"
        >
          <Sparkles className="h-4 w-4" /> Build Custom Package
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-500">Loading holiday packages...</div>
      ) : packages.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
          No packages found. Click "Build Custom Package" above to generate a custom trip.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <div key={pkg._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-md flex flex-col justify-between transition hover:-translate-y-1">
              <div>
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={pkg.images?.[0] || "https://images.unsplash.com/photo-1599661046289-e31897846e41"}
                    alt={pkg.title}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute top-3 left-3 rounded-full bg-purple-600 px-3 py-1 text-xs font-bold text-white shadow">
                    {pkg.category} • {pkg.type}
                  </span>
                  <span className="absolute top-3 right-3 rounded-full bg-slate-950/80 px-2.5 py-1 text-xs font-bold text-amber-400 backdrop-blur inline-flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-current" /> {pkg.rating}
                  </span>
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white line-clamp-1">{pkg.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 font-semibold flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-purple-500" /> {pkg.destination} • {pkg.durationDays} Days / {pkg.durationNights} Nights
                  </p>
                  {pkg.overview && (
                    <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300 line-clamp-3">
                      {pkg.overview}
                    </p>
                  )}

                  {(pkg.highlights || []).length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {pkg.highlights.slice(0, 3).map((highlight) => (
                        <span key={highlight} className="rounded-lg bg-purple-50 px-2 py-1 text-[10px] font-bold text-purple-700 dark:bg-purple-950/30 dark:text-purple-300">
                          {highlight}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-3">
                    {(pkg.inclusions || []).slice(0, 4).map((inc) => (
                      <div key={inc} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>{inc}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-[10px]">
                    <div className="rounded-xl bg-slate-50 p-2 dark:bg-slate-950">
                      <p className="font-black uppercase text-slate-400">Stay</p>
                      <p className="mt-1 font-semibold text-slate-700 dark:text-slate-200">{pkg.stayCategory || "Comfort Stay"}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-2 dark:bg-slate-950">
                      <p className="font-black uppercase text-slate-400">Meals</p>
                      <p className="mt-1 font-semibold text-slate-700 dark:text-slate-200">{pkg.mealPlan || "Breakfast"}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-2 dark:bg-slate-950">
                      <p className="font-black uppercase text-slate-400">Travel</p>
                      <p className="mt-1 font-semibold text-slate-700 dark:text-slate-200">{pkg.transport || "Transfers"}</p>
                    </div>
                  </div>

                  {(pkg.itinerary || []).length > 0 && (
                    <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/60">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Day-wise Plan</p>
                      <div className="mt-2 space-y-2">
                        {pkg.itinerary.slice(0, 2).map((day) => (
                          <div key={`${pkg._id}-${day.day}`}>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Day {day.day}: {day.title}</p>
                            <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-slate-500">{day.description}</p>
                          </div>
                        ))}
                        {pkg.itinerary.length > 2 && (
                          <p className="text-[10px] font-bold text-purple-600 dark:text-purple-300">
                            + {pkg.itinerary.length - 2} more detailed days included
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {pkg.travelOptions && (
                    <div className="mt-4 rounded-xl border border-sky-100 bg-sky-50 p-3 dark:border-sky-950/60 dark:bg-sky-950/20">
                      <p className="text-[10px] font-black uppercase tracking-wider text-sky-700 dark:text-sky-300">
                        Bus & Train Reach Guide
                      </p>
                      {pkg.travelOptions.summary && (
                        <p className="mt-1 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                          {pkg.travelOptions.summary}
                        </p>
                      )}

                      {(pkg.travelOptions.trainRoutes || []).length > 0 && (
                        <div className="mt-3 space-y-2">
                          {(pkg.travelOptions.trainRoutes || []).slice(0, 2).map((route) => (
                            <div key={route._id || route.trainNumber} className="rounded-lg bg-white p-2 dark:bg-slate-950">
                              <p className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
                                <TrainFront className="h-3.5 w-3.5 text-sky-500" /> {route.trainName} #{route.trainNumber}
                              </p>
                              <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                                {route.from} to {route.to} • {route.departureTime} - {route.arrivalTime} • Rs. {route.price?.toLocaleString("en-IN")}
                              </p>
                              <p className="mt-0.5 text-[10px] text-slate-400">
                                Class: {(route.classes || []).join(", ") || "Available"} • Drop: {(route.droppingStations || []).slice(0, 2).join(", ") || route.to}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {(pkg.travelOptions.busRoutes || []).length > 0 && (
                        <div className="mt-3 space-y-2">
                          {(pkg.travelOptions.busRoutes || []).slice(0, 2).map((route) => (
                            <div key={route._id || route.operatorName} className="rounded-lg bg-white p-2 dark:bg-slate-950">
                              <p className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
                                <Bus className="h-3.5 w-3.5 text-emerald-500" /> {route.operatorName}
                              </p>
                              <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                                {route.from} to {route.to} • {route.departureTime} - {route.arrivalTime} • Rs. {route.price?.toLocaleString("en-IN")}
                              </p>
                              <p className="mt-0.5 text-[10px] text-slate-400">
                                Boarding: {(route.boardingPoints || []).slice(0, 2).join(", ") || route.from}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {(pkg.travelOptions.localTransfers || []).length > 0 && (
                        <p className="mt-3 text-[11px] font-semibold leading-relaxed text-sky-800 dark:text-sky-200">
                          {pkg.travelOptions.localTransfers[0]}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Starting from</span>
                  <span className="text-xl font-black text-purple-600 dark:text-purple-400">Rs. {pkg.pricePerPerson?.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-400 font-semibold"> /person</span>
                </div>
                <button
                  onClick={() => handleBookPackage(pkg)}
                  className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-purple-700 transition"
                >
                  Book Package
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Custom Package Builder Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Custom Package Builder</h2>
            <p className="text-xs text-slate-500 mt-1">Design a tailored holiday package based on your preferences.</p>

            <form onSubmit={handleCustomSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Destination</label>
                <input
                  value={customForm.destination}
                  onChange={(e) => setCustomForm({ ...customForm, destination: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Duration (Days)</label>
                  <input
                    type="number"
                    value={customForm.days}
                    onChange={(e) => setCustomForm({ ...customForm, days: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Budget (Rs)</label>
                  <input
                    type="number"
                    value={customForm.budget}
                    onChange={(e) => setCustomForm({ ...customForm, budget: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Special Interests</label>
                <input
                  value={customForm.interests}
                  onChange={(e) => setCustomForm({ ...customForm, interests: e.target.value })}
                  placeholder="e.g. Heritage, Food, Photography"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="w-1/2 rounded-xl border border-slate-300 py-2.5 text-xs font-bold dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={building}
                  className="w-1/2 rounded-xl bg-purple-600 py-2.5 text-xs font-bold text-white hover:bg-purple-700 transition"
                >
                  {building ? "Building..." : "Generate Package"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
