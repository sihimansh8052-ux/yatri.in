import { useState } from "react";
import { Heart, MapPinned, Menu, Moon, ShieldAlert, ShieldCheck, Sun, Bell } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import EmergencyMapModal from "./EmergencyMapModal";
import AiAssistantFloating from "./AiAssistantFloating";

export default function Shell({ user, darkMode, setDarkMode, onLogout, children }) {
  const [showEmergency, setShowEmergency] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: "1", text: "Booking Confirmed: Deluxe Suite stay at Grand Horizon Palace.", read: false, time: "5m ago" },
    { id: "2", text: "AI culinary discovery: Sharma Chaat Stall is recommended nearby.", read: false, time: "20m ago" },
    { id: "3", text: "Weather Alert: Rain forecast in Jaipur tomorrow afternoon.", read: true, time: "2h ago" }
  ]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-emerald-500 text-white shadow-glow">
              <MapPinned className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-extrabold text-luxury-blue dark:text-white">Yatri.in</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Luxury Travel Hub</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 xl:flex">
            {[
              ["/", "Home"],
              ["/results", "Hotels"],
              ["/buses", "Buses"],
              ["/trains", "Trains"],
              ["/packages", "Packages"],
              ["/results?category=guide", "Guides"],
              ["/food-discovery", "Local Food"],
              ["/location-intelligence", "Maps"],
              ["/payment-center", "Payments"],
              ["/ai-planner", "AI Planner"],
              ["/calculator", "Calculator"],
              ["/dashboard", "Dashboard"]
            ].map(([href, label]) => (
              <NavLink
                key={href}
                to={href}
                className={({ isActive }) =>
                  `rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                    isActive
                      ? "bg-sky-500 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEmergency(true)}
              className="inline-flex items-center gap-1 rounded-xl bg-rose-500 px-3 py-1.5 text-xs font-extrabold text-white shadow hover:bg-rose-600 transition"
            >
              <ShieldAlert className="h-4 w-4" /> Emergency SOS
            </button>
            <button className="rounded-xl border border-slate-200 p-2 dark:border-slate-700" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotif(!showNotif)}
                className="relative rounded-xl border border-slate-200 p-2 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <Bell className="h-4 w-4 text-slate-700 dark:text-slate-350" />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>

              {showNotif && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95 z-50 text-xs text-slate-850 dark:text-slate-300">
                  <div className="flex justify-between items-center border-b pb-2 mb-3 border-slate-100 dark:border-slate-850">
                    <span className="font-extrabold text-slate-900 dark:text-white">Notifications Panel</span>
                    <button
                      onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
                      className="text-[10px] font-bold text-sky-500 hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => setNotifications(notifications.map(not => not.id === n.id ? { ...not, read: true } : not))}
                        className={`p-2.5 rounded-lg border transition cursor-pointer ${n.read ? "bg-slate-50 border-slate-100 opacity-60" : "bg-sky-50/50 border-sky-150 font-semibold"}`}
                      >
                        <p className="leading-normal">{n.text}</p>
                        <span className="block text-[8px] text-slate-400 mt-1">{n.time}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 border-t pt-2 border-slate-100 dark:border-slate-850 flex justify-between items-center text-[10px] font-bold text-slate-400">
                    <button onClick={() => setNotifications([])} className="hover:text-rose-500">Clear All</button>
                    <Link to="/communication" onClick={() => setShowNotif(false)} className="text-sky-500 hover:underline">Open Chat Hub ➔</Link>
                  </div>
                </div>
              )}
            </div>

            {user ? (
              <>
                <Link to="/wishlist" className="rounded-xl border border-slate-200 p-2 dark:border-slate-700">
                  <Heart className="h-4 w-4" />
                </Link>
                {user.role === "admin" && (
                  <Link to="/admin" className="rounded-xl border border-slate-200 p-2 dark:border-slate-700">
                    <ShieldCheck className="h-4 w-4" />
                  </Link>
                )}
                <button className="hidden rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white dark:bg-white dark:text-slate-900 sm:block" onClick={onLogout}>
                  Logout
                </button>
              </>
            ) : (
              <Link to="/auth" className="rounded-xl bg-sky-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-sky-600">
                Login / Register
              </Link>
            )}
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-emerald-500 text-white">
                <MapPinned className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold">Yatri.in</p>
                <p className="text-xs text-slate-500">Luxury Travel Platform</p>
              </div>
            </div>
            <p className="mt-4 max-w-sm text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Book Hotels, Buses, Holiday Packages, & Tour Guides with live Google maps integration and AI itinerary planning.
            </p>
          </div>
          <FooterColumn title="Travel Verticals" links={["Hotels & Resorts", "Luxury Bus Booking", "Premium Holiday Packages", "Local Tour Guides"]} />
          <FooterColumn title="Tours & AI" links={["Local Tour Guides", "AI Trip Planner", "Holiday Packages", "Travel Cost Calculator"]} />
          <FooterColumn title="Company & Support" links={["Partner Portals", "Emergency Contacts", "Privacy Policy", "Terms of Service"]} />
        </div>
        <div className="border-t border-slate-200 py-4 text-center text-xs text-slate-500 dark:border-slate-800 font-semibold">
          © 2026 Yatri.in — Production Luxury Travel Ecosystem
        </div>
      </footer>

      <EmergencyMapModal isOpen={showEmergency} onClose={() => setShowEmergency(false)} />
      <AiAssistantFloating user={user} />
    </div>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <p className="font-bold text-sm">{title}</p>
      <div className="mt-3 grid gap-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
        {links.map((link) => (
          <span key={link}>{link}</span>
        ))}
      </div>
    </div>
  );
}
