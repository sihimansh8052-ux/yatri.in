import {
  ArrowRight,
  BadgeIndianRupee,
  Bus,
  Compass,
  Flame,
  Hotel,
  Landmark,
  Map,
  MapPinned,
  MessageCircle,
  Navigation,
  Route,
  ShieldCheck,
  Sparkles,
  Star,
  TrainFront,
  UserCheck,
  UtensilsCrossed
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import api from "../utils/api";
import useSeo from "../hooks/useSeo";
import SearchHero from "../components/SearchHero";
import ListingCard from "../components/ListingCard";

const verticalCards = [
  { label: "Stays & Hotels", icon: Hotel, href: "/results", color: "from-sky-500 to-blue-600", text: "Resorts, heritage stays, luxury villas, & budget hotels." },
  { label: "Intercity Buses", icon: Bus, href: "/buses", color: "from-emerald-500 to-teal-600", text: "AC Sleeper 2+1, Volvo luxury buses with live seat layouts." },
  { label: "Train Tickets", icon: TrainFront, href: "/trains", color: "from-sky-600 to-cyan-600", text: "Search railway routes, choose class, seat, and stations." },
  { label: "Bhakti & Pooja Places", icon: Landmark, href: "/results?category=devotional", color: "from-amber-500 to-rose-600", text: "Temples, ghats, gurudwaras, aarti, darshan, and spiritual visits." },
  { label: "Holiday Packages", icon: Compass, href: "/packages", color: "from-purple-500 to-pink-600", text: "Family, Honeymoon, Adventure & Custom Tour Builders." },
  { label: "Local Tour Guides", icon: UserCheck, href: "/results?category=guide", color: "from-rose-500 to-red-600", text: "Verified local experts, history walks, photography tours." },
  { label: "AI Trip Planner", icon: Sparkles, href: "/ai-planner", color: "from-luxury-gold to-amber-500", text: "Smart day-wise itineraries with estimated budget splits." },
  { label: "Cost Calculator", icon: BadgeIndianRupee, href: "/calculator", color: "from-emerald-600 to-teal-700", text: "Per-person expense breakdown bars for smart planning." }
];

const stats = [
  ["25K+", "Destinations & Stays"],
  ["100%", "Verified Guides & Partners"],
  ["4.9★", "Average Traveler Rating"],
  ["24/7", "Concierge Support"]
];

const testimonials = [
  { name: "Aarav Mehta", text: "Yatri.in made our Delhi to Jaipur heritage trip effortless. Booking a local guide and hotel in one click was amazing!" },
  { name: "Nisha Rao", text: "The AI Trip Planner generated a 4-day Kashmir itinerary that fit our exact budget. Super sleek UI!" },
  { name: "Kabir Singh", text: "The flight fare comparison and train PNR status tracker saved us so much time." }
];

export default function HomePage({ user }) {
  useSeo("Yatri.in | India's Luxury Travel Booking Ecosystem");
  const [highlights, setHighlights] = useState(null);

  useEffect(() => {
    api.get("/discover/highlights").then(({ data }) => setHighlights(data)).catch(() => setHighlights(null));
  }, []);

  return (
    <div className="bg-slate-50 dark:bg-slate-950">
      <SearchHero />

      {/* Stats Counter Bar */}
      <section className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:px-6 grid-cols-2 md:grid-cols-4">
          {stats.map(([value, label]) => (
            <div key={label} className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-center dark:border-slate-800 dark:bg-slate-900 shadow-sm">
              <p className="text-3xl font-extrabold text-luxury-blue dark:text-white">{value}</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* All Travel Verticals Grid */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <SectionHeader eyebrow="Travel Hub" title="Complete Travel Ecosystem in One Place" text="Explore every travel service with instant online bookings and transparent pricing." />
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {verticalCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div key={card.label} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.04 }}>
                <Link to={card.href} className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r ${card.color} text-white shadow-md transition group-hover:scale-110`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-extrabold text-slate-900 dark:text-white flex items-center justify-between">
                    {card.label} <ArrowRight className="h-4 w-4 opacity-0 transition group-hover:opacity-100 text-sky-500" />
                  </h3>
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{card.text}</p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Live Featured Stays & Attractions */}
      <section className="bg-white py-14 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeader eyebrow="Featured Stays" title="Top Rated Places & Trending Stays" text={highlights?.message || "Sample fallback results ready out-of-the-box."} />

          {!highlights ? (
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-80 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
              ))}
            </div>
          ) : (
            <>
              <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {highlights.topPlaces.map((item) => <ListingCard key={item._id} item={{ ...item, entityType: "place" }} />)}
              </div>

              <div className="mt-10 grid gap-6 lg:grid-cols-3">
                <InfoPanel icon={Flame} color="text-amber-500" title="Trending Destinations">
                  {highlights.trendingDestinations.map((item) => (
                    <MiniLink key={item._id} item={item} />
                  ))}
                </InfoPanel>

                <InfoPanel icon={MapPinned} color="text-sky-500" title="Local Experiences">
                  {highlights.localExperiences.map((item) => (
                    <MiniLink key={item._id} item={item} subtitle={item.tags?.slice(0, 3).join(", ")} />
                  ))}
                </InfoPanel>

                <InfoPanel icon={UtensilsCrossed} color="text-rose-500" title="Food Trails Near Taj Mahal">
                  {highlights.foodNearTajMahal.map((item) => (
                    <div key={item._id} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
                      <p className="font-bold text-sm text-slate-800 dark:text-slate-100">{item.name}</p>
                      <p className="mt-1 text-xs text-slate-500">{item.suggestion}</p>
                      <a
                        href={getDirectionsUrl(item)}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-rose-200 px-2.5 py-1.5 text-[11px] font-bold text-rose-600 transition hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-300 dark:hover:bg-rose-950/40"
                      >
                        <Navigation className="h-3.5 w-3.5" /> Directions
                      </a>
                    </div>
                  ))}
                </InfoPanel>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <SectionHeader eyebrow="Traveler Reviews" title="Loved by Explorers & Frequent Travelers" text="Real feedback from travelers who booked hotels, guides, and itineraries on Yatri.in." />
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {testimonials.map((item) => (
            <div key={item.name} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex gap-1 text-amber-500">
                {Array.from({ length: 5 }).map((_, index) => <Star key={index} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="mt-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">"{item.text}"</p>
              <p className="mt-4 font-bold text-sm text-slate-900 dark:text-white">— {item.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="rounded-2xl bg-gradient-to-r from-luxury-blue via-sky-900 to-emerald-800 p-8 text-white shadow-2xl">
            <Sparkles className="h-8 w-8 text-luxury-gold" />
            <h2 className="mt-4 text-3xl font-extrabold">{user ? `Welcome back, ${user.name}` : "Start Your Next Luxury Journey"}</h2>
            <p className="mt-2 max-w-2xl text-xs text-sky-100 leading-relaxed">Access live Google Maps discovery, instant flight & train bookings, and manage all your reservations from one unified dashboard.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/results?city=New%20Delhi" className="rounded-xl bg-luxury-gold px-6 py-3 text-xs font-bold text-luxury-blue shadow-gold hover:scale-105 transition">Explore Stays & Guides</Link>
              <Link to={user ? "/dashboard" : "/auth"} className="rounded-xl border border-white/30 px-6 py-3 text-xs font-bold text-white hover:bg-white/10 transition">Open Travel Dashboard</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ eyebrow, title, text }) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs uppercase tracking-wider font-bold text-sky-500">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-extrabold text-luxury-blue dark:text-white">{title}</h2>
      <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{text}</p>
    </div>
  );
}

function InfoPanel({ icon: Icon, color, title, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className={`flex items-center gap-2 font-bold text-sm ${color}`}>
        <Icon className="h-4 w-4" />
        {title}
      </div>
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  );
}

function MiniLink({ item, subtitle }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 transition hover:bg-sky-50 dark:bg-slate-950 dark:hover:bg-slate-800">
      <Link to={`/details/place/${item._id}`} className="block">
        <p className="font-bold text-xs text-slate-800 dark:text-slate-100">{item.name}</p>
        <p className="mt-1 text-[10px] text-slate-400">{subtitle || item.city}</p>
      </Link>
      <a
        href={getDirectionsUrl(item)}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-sky-200 px-2.5 py-1.5 text-[11px] font-bold text-sky-600 transition hover:bg-sky-50 dark:border-sky-900/60 dark:text-sky-300 dark:hover:bg-sky-950/40"
      >
        <Navigation className="h-3.5 w-3.5" /> Directions
      </a>
    </div>
  );
}

function getDirectionsUrl(item) {
  if (item?.googleMapsUri) return item.googleMapsUri;
  if (item?.location?.coordinates?.length === 2) {
    const [lng, lat] = item.location.coordinates;
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${lat},${lng}`)}&travelmode=driving`;
  }
  const query = [item?.name, item?.address, item?.city].filter(Boolean).join(" ");
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query || "New Delhi")}&travelmode=driving`;
}
