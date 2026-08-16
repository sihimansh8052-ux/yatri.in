import {
  Bell,
  Bus,
  CalendarDays,
  Compass,
  CreditCard,
  Download,
  Heart,
  Hotel,
  Languages,
  LogOut,
  MessageCircle,
  Route,
  ShieldAlert,
  Sparkles,
  Star,
  TrainFront,
  Trash2,
  UserCheck,
  UserRoundCog,
  Wallet
} from "lucide-react";
import { SparklesIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import useSeo from "../hooks/useSeo";
import ChatPanel from "../components/ChatPanel";

const roleLabels = {
  traveler: "Traveler Command Center",
  tour_guide: "Tour Guide Partner Portal",
  hotel_owner: "Hotel Owner Control Center",
  admin: "Super Admin Platform Dashboard"
};

const verticalShortcuts = [
  "Book Hotels",
  "Book Buses",
  "Book Trains",
  "Holiday Packages",
  "Book Guides",
  "AI Trip Planner",
  "Cost Calculator",
  "Wishlist",
  "Payments"
];

export default function DashboardPage({ user, onUserRefresh, darkMode, setDarkMode }) {
  useSeo("Dashboard | Yatri.in");
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [profile, setProfile] = useState(user);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activeChatGuide, setActiveChatGuide] = useState(null);
  const [nearbyFood, setNearbyFood] = useState([]);
  const [realBookings, setRealBookings] = useState([]);

  const loadDashboard = async () => {
    const { data } = await api.get("/users/dashboard");
    setDashboard(data);
    setProfile(data.user);
    
    // Load nearby food context relative to booked hotels
    const firstHotel = data.bookings?.hotels?.[0];
    if (firstHotel) {
      try {
        const foodRes = await api.get("/discover/street-food", {
          params: { hotelId: firstHotel.id }
        });
        setNearbyFood(foodRes.data.slice(0, 4));
      } catch (_) {}
    } else {
      try {
        const foodRes = await api.get("/discover/street-food", {
          params: { lat: 28.6139, lng: 77.2090 }
        });
        setNearbyFood(foodRes.data.slice(0, 4));
      } catch (_) {}
    }

    try {
      const bookingsRes = await api.get("/bookings");
      setRealBookings(bookingsRes.data);
    } catch (_) {}
  };

  useEffect(() => {
    loadDashboard().catch(() => setToast({ type: "error", message: "Unable to load dashboard" }));
  }, []);

  const updateProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api.patch("/users/profile", profile);
      await onUserRefresh?.();
      await loadDashboard();
      setToast({ type: "success", message: "Profile updated" });
    } catch (error) {
      setToast({ type: "error", message: error.response?.data?.message || "Profile update failed" });
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api.patch("/users/change-password", passwordForm);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setToast({ type: "success", message: "Password updated" });
    } catch (error) {
      setToast({ type: "error", message: error.response?.data?.message || "Password update failed" });
    } finally {
      setSaving(false);
    }
  };

  const logout = async () => {
    localStorage.removeItem("yatri_token");
    localStorage.removeItem("yatri_refresh");
    await api.post("/auth/logout").catch(() => {});
    window.dispatchEvent(new Event("yatri:logout"));
  };

  const deleteAccount = async () => {
    await api.delete("/users/account");
    await logout();
  };

  const handleShortcutClick = (shortcut) => {
    if (shortcut === "Search Destinations" || shortcut === "Book Hotels") {
      navigate("/results");
    } else if (shortcut === "Book Buses") {
      navigate("/buses");
    } else if (shortcut === "Book Trains") {
      navigate("/trains");
    } else if (shortcut === "Holiday Packages") {
      navigate("/packages");
    } else if (shortcut === "Book Guides") {
      navigate("/results?category=guide");
    } else if (shortcut === "AI Trip Planner") {
      navigate("/ai-planner");
    } else if (shortcut === "Cost Calculator") {
      navigate("/calculator");
    } else if (shortcut === "Wishlist") {
      navigate("/wishlist");
    } else if (shortcut === "Payments") {
      document.getElementById("payments-panel")?.scrollIntoView({ behavior: "smooth" });
    } else if (shortcut === "Reviews") {
      document.getElementById("settings-panel")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleChatWithGuide = () => {
    setActiveChatGuide({
      _id: "680e75b20000000000000021",
      name: "Asha Sharma",
      profilePhoto: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2"
    });
  };

  if (!dashboard) {
    return <DashboardSkeleton />;
  }

  const role = profile?.role || dashboard.role;
  const avatar =
    profile.profilePhoto ||
    `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(profile.name || "Yatri")}`;

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <div
        className="absolute inset-x-0 top-0 h-[420px] bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(115deg, rgba(15,42,74,0.94), rgba(14,165,233,0.42), rgba(16,185,129,0.50)), url(https://images.unsplash.com/photo-1500530855697-b586d89ba3ee)"
        }}
      />
      <div className="absolute left-10 top-24 h-40 w-40 rounded-full bg-luxury-gold/20 blur-3xl" />
      <div className="absolute right-12 top-36 h-48 w-48 rounded-full bg-sky-300/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {toast && (
          <div className={`mb-4 rounded-xl px-4 py-3 text-sm font-bold shadow-lg ${toast.type === "error" ? "bg-rose-50 text-rose-600 border border-rose-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
            {toast.message}
          </div>
        )}

        {/* Hero Welcome Section */}
        <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mb-6 rounded-2xl border border-white/20 bg-white/15 p-6 text-white shadow-2xl backdrop-blur-2xl">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                <SparklesIcon className="h-4 w-4 text-luxury-gold" />
                {roleLabels[role] || "Traveler Command Center"}
              </div>
              <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">{dashboard.welcome}</h1>
              <p className="mt-2 max-w-2xl text-xs sm:text-sm text-sky-100 leading-relaxed">
                Manage your multi-service bookings (Hotels, Buses, Packages), view tickets, track wallet balances, & access partner tools.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {role === "hotel_owner" && (
                  <Link to="/hotel-owner" className="inline-flex items-center gap-1.5 rounded-xl bg-sky-500 px-4 py-2 text-xs font-bold text-white shadow-lg hover:bg-sky-600 transition">
                    <Hotel className="h-4 w-4" /> Open Hotel Owner Control Portal ➔
                  </Link>
                )}
                {role === "tour_guide" && (
                  <Link to="/guide-portal" className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-lg hover:bg-emerald-600 transition">
                    <UserCheck className="h-4 w-4" /> Open Guide Partner Portal ➔
                  </Link>
                )}
                {role === "admin" && (
                  <Link to="/admin" className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white shadow-lg hover:bg-amber-600 transition">
                    <ShieldAlert className="h-4 w-4" /> Open Admin Control Center ➔
                  </Link>
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center text-sm">
              <HeroStat label="Trips" value={dashboard.stats.upcomingTrips} />
              <HeroStat label="Wishlist" value={dashboard.stats.wishlist} />
              <HeroStat label="Reward Points" value={dashboard.stats.rewardPoints} />
            </div>
          </div>
        </motion.section>

        <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="space-y-4">
            <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className="rounded-2xl border border-white/40 bg-white/90 p-5 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90">
              <img src={avatar} alt={profile.name} className="h-20 w-20 rounded-2xl object-cover shadow-gold border-2 border-white" />
              <h2 className="mt-3 text-xl font-extrabold text-slate-900 dark:text-white">{profile.name}</h2>
              <p className="mt-0.5 text-xs text-slate-500 font-semibold">{profile.city || "New Delhi"}, {profile.country || "India"}</p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <Stat icon={Wallet} label="Wallet" value={`Rs. ${dashboard.stats.walletBalance}`} />
                <Stat icon={Star} label="Rewards" value={dashboard.stats.rewardPoints} />
              </div>
              <button onClick={logout} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 dark:border-slate-700 transition hover:bg-slate-100 dark:hover:bg-slate-800">
                <LogOut className="h-4 w-4" /> Logout Account
              </button>
            </motion.div>

            <Panel title="Travel Quick Actions" icon={Sparkles}>
              <div className="grid gap-1.5">
                {verticalShortcuts.map((item) => (
                  <button
                    key={item}
                    onClick={() => handleShortcutClick(item)}
                    className="rounded-xl bg-slate-100 px-3 py-2 text-left text-xs font-bold text-slate-700 transition hover:bg-sky-500 hover:text-white dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-sky-600"
                  >
                    ⚡ {item}
                  </button>
                ))}
              </div>
            </Panel>
          </aside>
          <div className="space-y-6">
            {role === "traveler" ? (
              <div className="space-y-6">
                {/* Metrics */}
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <Metric icon={Hotel} label="Hotel Bookings" value={dashboard.stats.hotelBookings} />
                  <Metric icon={CalendarDays} label="Upcoming Trips" value={dashboard.stats.upcomingTrips} />
                  <Metric icon={Heart} label="Saved Stays" value={dashboard.stats.wishlist} />
                  <Metric icon={Bell} label="Notifications" value={dashboard.stats.notifications} />
                </div>

                {/* Traveler Analytics & Charts */}
                <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Monthly Travel Expenditure</h3>
                    <div className="h-48 w-full flex items-center justify-center">
                      <svg viewBox="0 0 500 150" className="w-full h-full">
                        <defs>
                          <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M0,130 Q80,70 160,90 T320,40 T500,60"
                          fill="none"
                          stroke="#0ea5e9"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                        />
                        <path
                          d="M0,130 Q80,70 160,90 T320,40 T500,60 L500,150 L0,150 Z"
                          fill="url(#expGrad)"
                        />
                        <circle cx="160" cy="90" r="5" fill="#0ea5e9" stroke="#fff" strokeWidth="2" />
                        <circle cx="320" cy="40" r="5" fill="#0ea5e9" stroke="#fff" strokeWidth="2" />
                        <text x="140" y="80" fill="#0ea5e9" className="text-[10px] font-black">Rs. 12,500</text>
                        <text x="300" y="30" fill="#0ea5e9" className="text-[10px] font-black">Rs. 24,000</text>
                        <line x1="0" y1="135" x2="500" y2="135" stroke="#e2e8f0" strokeDasharray="4" />
                        <text x="10" y="148" fill="#94a3b8" className="text-[8px] font-bold">May</text>
                        <text x="160" y="148" fill="#94a3b8" className="text-[8px] font-bold">Jun</text>
                        <text x="320" y="148" fill="#94a3b8" className="text-[8px] font-bold">Jul</text>
                        <text x="470" y="148" fill="#94a3b8" className="text-[8px] font-bold">Aug</text>
                      </svg>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Carbon Footprint</h3>
                      <p className="text-[10px] text-slate-400 font-semibold mt-1">AI-calculated travel carbon emissions</p>
                    </div>
                    <div className="my-3 flex items-center justify-center relative">
                      <svg className="w-24 h-24 transform -rotate-90">
                        <circle cx="48" cy="48" r="40" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                        <circle cx="48" cy="48" r="40" stroke="#10b981" strokeWidth="8" fill="transparent" strokeDasharray="251" strokeDashoffset="80" strokeLinecap="round" />
                      </svg>
                      <div className="absolute text-center">
                        <p className="text-base font-black text-slate-800 dark:text-white">124 kg</p>
                        <p className="text-[8px] text-slate-400 font-bold uppercase">CO2 Offset</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold text-center">
                      🍃 You are in the top 15% green travelers!
                    </p>
                  </div>
                </div>

                {/* Dynamic Recommended Food Near Stays */}
                {nearbyFood.length > 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-sky-500" /> Recommended Food Near Your Hotel
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-4">
                      {nearbyFood.map((food) => (
                        <div key={food._id} className="rounded-xl border border-slate-100 bg-slate-50 dark:bg-slate-950 dark:border-slate-800 p-3.5 flex flex-col justify-between">
                          <div>
                            <img src={food.images?.[0] || "https://images.unsplash.com/photo-1565557623262-b51c2513a641"} alt={food.name} className="h-28 w-full object-cover rounded-lg mb-2" />
                            <h4 className="font-extrabold text-xs text-slate-950 dark:text-white">{food.name}</h4>
                            <p className="text-[9px] text-slate-400 mt-0.5">{food.cuisine?.slice(0, 2).join(" • ")}</p>
                            <p className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold mt-1">💡 {food.aiReason?.slice(0, 55)}...</p>
                          </div>
                          <div className="mt-3 flex justify-between items-center text-[10px]">
                            <span className="text-amber-500 font-bold">★ {food.rating || 4.5}</span>
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(food.name + " " + food.address)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded bg-sky-500 text-white px-2 py-0.5 font-bold"
                            >
                              Route ➔
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI recommendations alerts */}
                <div className="grid gap-6 md:grid-cols-2">
                  <Panel title="AI Personal Advisories" icon={Sparkles}>
                    <div className="space-y-2 text-xs">
                      <div className="rounded-xl bg-amber-50/50 border border-amber-100 p-3 dark:bg-slate-950 dark:border-slate-800">
                        <p className="font-bold text-amber-700 dark:text-amber-400">🌦️ Weather Advisory</p>
                        <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                          Light showers forecasted in Jaipur starting Tuesday afternoon. We recommend carrying your travel umbrella and scheduling indoor sightseeing tours.
                        </p>
                      </div>
                      <div className="rounded-xl bg-emerald-50/50 border border-emerald-100 p-3 dark:bg-slate-950 dark:border-slate-800">
                        <p className="font-bold text-emerald-700 dark:text-emerald-400">💡 Smart Budget Savings</p>
                        <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                          Booking your local heritage tour guides via Yatri package saves you up to Rs. 1,500 compared to booking standalone services.
                        </p>
                      </div>
                    </div>
                  </Panel>

                  {/* Emergency Support Desk */}
                  <Panel title="Emergency SOS Center" icon={ShieldAlert}>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-3 bg-red-50/50 border border-red-100 dark:bg-slate-950 dark:border-slate-800 rounded-xl">
                        <p className="font-bold text-red-600 dark:text-red-400">🚑 Ambulance Desk</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white mt-1">Dial 102</p>
                      </div>
                      <div className="p-3 bg-red-50/50 border border-red-100 dark:bg-slate-950 dark:border-slate-800 rounded-xl">
                        <p className="font-bold text-red-600 dark:text-red-400">🛡️ Police Hotline</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white mt-1">Dial 100</p>
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl text-[10px] text-slate-500 font-semibold leading-relaxed">
                      🚒 Fire Station desk: **Dial 101** • Emergency Helpline: **Dial 112**
                    </div>
                  </Panel>
                </div>

                {/* Booked trips */}
                <Panel title="My Booked Trips & Tickets" icon={CalendarDays}>
                  <div className="space-y-3">
                    {realBookings.length === 0 && (
                      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-950">
                        No booked trips yet. Use quick actions to book hotels, buses, trains, packages, or guides.
                      </div>
                    )}
                    {realBookings.map((booking) => (
                      <BookingTripCard key={booking._id} booking={booking} />
                    ))}
                  </div>
                </Panel>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <Metric icon={Hotel} label="Hotel Bookings" value={dashboard.stats.hotelBookings} />
                  <Metric icon={CalendarDays} label="Upcoming Trips" value={dashboard.stats.upcomingTrips} />
                  <Metric icon={Heart} label="Saved Stays" value={dashboard.stats.wishlist} />
                  <Metric icon={Bell} label="Notifications" value={dashboard.stats.notifications} />
                </div>

                <div className="grid gap-6 xl:grid-cols-3">
                  {/* Bookings & E-Tickets */}
                  <Panel title="Recent Bookings & E-Tickets" icon={CalendarDays}>
                    <div className="space-y-3">
                      {realBookings.length === 0 && (
                        <div className="rounded-xl bg-slate-50 p-3 text-xs font-semibold text-slate-500 dark:bg-slate-950">
                          No bookings yet.
                        </div>
                      )}
                      {realBookings.map((booking) => <BookingTripCard key={booking._id} booking={booking} compact />)}
                    </div>
                  </Panel>

                  {/* AI Planner Quick Action */}
                  <Panel title="AI Trip Planner" icon={Route}>
                    <List items={["Delhi Food Walk: 3 Days", "Jaipur Heritage Tour: 4 Days", "Kashmir Honeymoon Package", "Custom Budget Expense Splitting"]} />
                    <button onClick={() => navigate("/ai-planner")} className="mt-4 w-full rounded-xl bg-gradient-to-r from-luxury-gold to-luxury-emerald px-3 py-2.5 text-xs font-extrabold text-luxury-blue shadow-gold hover:scale-[1.02] transition">
                      Open Smart AI Planner
                    </button>
                  </Panel>

                  {/* Messages & Chat */}
                  <Panel title="Direct Guide Chat" icon={MessageCircle}>
                    <List items={dashboard.messages.map((item) => `${item.from}: ${item.text}`)} />
                    <button onClick={handleChatWithGuide} className="mt-4 w-full rounded-xl bg-sky-500 px-3 py-2.5 text-xs font-bold text-white shadow hover:bg-sky-600 transition">
                      Chat with Tour Guide
                    </button>
                  </Panel>
                </div>
              </div>
            )}

            {/* Profile & Security Settings */}
            <div id="settings-panel" className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <Panel title="Profile Settings" icon={UserRoundCog}>
                <form onSubmit={updateProfile} className="grid gap-3 md:grid-cols-2">
                  {[
                    ["name", "Full Name"],
                    ["email", "Email"],
                    ["mobile", "Mobile Number"],
                    ["country", "Country"],
                    ["state", "State"],
                    ["city", "City"],
                    ["profilePhoto", "Profile Photo URL"],
                    ["language", "Language"]
                  ].map(([key, label]) => (
                    <label key={key} className="text-xs font-bold text-slate-500">
                      <span className="mb-1 block">{label}</span>
                      <input className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white" value={profile[key] || ""} onChange={(event) => setProfile({ ...profile, [key]: event.target.value })} />
                    </label>
                  ))}
                  <button className="rounded-xl bg-sky-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-sky-600 md:col-span-2 transition" disabled={saving}>
                    {saving ? "Saving Profile..." : "Save Profile Updates"}
                  </button>
                </form>
              </Panel>

              <Panel title="Security & Password" icon={ShieldAlert}>
                <form onSubmit={changePassword} className="space-y-3">
                  <input className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold dark:border-slate-700 dark:bg-slate-950" type="password" placeholder="Current Password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })} />
                  <input className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold dark:border-slate-700 dark:bg-slate-950" type="password" placeholder="New Password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })} />
                  <input className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold dark:border-slate-700 dark:bg-slate-950" type="password" placeholder="Confirm New Password" value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })} />
                  <button className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white dark:bg-white dark:text-slate-900 transition">Update Password</button>
                </form>
                <button onClick={deleteAccount} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-rose-300 px-4 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-50">
                  <Trash2 className="h-4 w-4" /> Delete Account
                </button>
              </Panel>
            </div>
          </div>
        </section>
      </div>

      {activeChatGuide && (
        <div className="fixed bottom-6 right-6 z-50">
          <ChatPanel guide={activeChatGuide} onClose={() => setActiveChatGuide(null)} />
        </div>
      )}
    </main>
  );
}

function HeroStat({ label, value }) {
  return (
    <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
      <p className="text-2xl font-extrabold">{value}</p>
      <p className="text-[10px] text-sky-100 font-semibold">{label}</p>
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-950">
      <Icon className="h-4 w-4 text-sky-500" />
      <p className="mt-1 text-[10px] font-bold text-slate-400">{label}</p>
      <p className="font-extrabold text-xs text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <motion.div whileHover={{ y: -4 }} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <Icon className="h-5 w-5 text-sky-500" />
      <p className="mt-2 text-xs text-slate-400 font-bold">{label}</p>
      <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
    </motion.div>
  );
}

function BookingTripCard({ booking, compact = false }) {
  const meta = getBookingMeta(booking);
  return (
    <Link
      to={`/booking-confirmation/${booking._id}`}
      className="block rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600 transition hover:border-sky-200 hover:bg-sky-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-sky-100 px-2 py-0.5 text-[10px] font-black uppercase text-sky-700 dark:bg-sky-950 dark:text-sky-300">
              {meta.typeLabel}
            </span>
            <span className="font-mono text-[10px] font-bold text-slate-400">#{booking._id}</span>
          </div>
          <p className="mt-1 truncate text-sm font-extrabold text-slate-900 dark:text-white">{meta.title}</p>
        </div>
        <span className="rounded-lg bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          {booking.status || "confirmed"}
        </span>
      </div>
      <div className={`mt-2 grid gap-1 text-[11px] text-slate-500 ${compact ? "" : "sm:grid-cols-3"}`}>
        <span>{meta.dateLabel}: {meta.date}</span>
        <span>{meta.route}</span>
        <span className="font-bold text-slate-700 dark:text-slate-200">Rs. {Number(booking.totalPrice || 0).toLocaleString("en-IN")}</span>
      </div>
      {!compact && (
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-sky-500 px-2.5 py-1.5 text-[11px] font-bold text-white">
          Open booking details
        </div>
      )}
    </Link>
  );
}

function getBookingMeta(booking) {
  const dateValue = booking.bookingType === "hotel" ? booking.checkIn : booking.date;
  const date = dateValue ? new Date(dateValue).toLocaleDateString("en-IN") : "N/A";
  if (booking.bookingType === "hotel") {
    return {
      typeLabel: "Hotel",
      title: booking.hotel?.name || booking.hotelName || "Hotel reservation",
      dateLabel: "Check-in",
      date,
      route: booking.roomType ? `Room: ${booking.roomType}` : `${booking.guests || 1} guest(s)`
    };
  }
  if (booking.bookingType === "bus") {
    return {
      typeLabel: "Bus",
      title: booking.bus?.operatorName || "Bus ticket",
      dateLabel: "Travel date",
      date,
      route: [booking.bus?.from, booking.bus?.to].filter(Boolean).join(" to ") || [booking.boardingPoint, booking.droppingPoint].filter(Boolean).join(" to ") || "Route selected"
    };
  }
  if (booking.bookingType === "train") {
    return {
      typeLabel: "Train",
      title: booking.train?.trainName || booking.train?.name || "Train ticket",
      dateLabel: "Travel date",
      date,
      route: [booking.train?.from, booking.train?.to].filter(Boolean).join(" to ") || [booking.boardingPoint, booking.droppingPoint].filter(Boolean).join(" to ") || "Route selected"
    };
  }
  if (booking.bookingType === "package") {
    return {
      typeLabel: "Package",
      title: booking.package?.title || "Holiday package",
      dateLabel: "Start date",
      date,
      route: booking.package?.destination || `${booking.durationDays || 1} day(s)`
    };
  }
  return {
    typeLabel: "Guide",
    title: booking.guide?.name || "Local guide booking",
    dateLabel: "Tour date",
    date,
    route: `${booking.durationDays || 1} day(s)`
  };
}

function Panel({ title, icon: Icon, children }) {
  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center gap-2 font-extrabold text-sm text-slate-900 dark:text-white">
        <Icon className="h-4 w-4 text-sky-500" />
        <h2>{title}</h2>
      </div>
      {children}
    </motion.section>
  );
}

function List({ items }) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item} className="rounded-xl bg-slate-50 p-2.5 text-xs font-semibold text-slate-600 dark:bg-slate-950 dark:text-slate-300">
          {item}
        </div>
      ))}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="h-44 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
    </div>
  );
}
