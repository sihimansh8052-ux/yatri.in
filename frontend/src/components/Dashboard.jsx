import { Bell, Compass, Moon, Sun, MapPinned, CalendarDays, LogOut, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import api from "../utils/api";
import PlaceCard from "./PlaceCard";
import MapView from "./MapView";
import ItineraryPlanner from "./ItineraryPlanner";

const defaultCoords = { lat: 28.6139, lng: 77.209 };

export default function Dashboard({ user, onLogout, darkMode, setDarkMode, onUserRefresh }) {
  const [coords, setCoords] = useState(defaultCoords);
  const [filters, setFilters] = useState({
    category: "all",
    price: "all",
    rating: "0",
    radius: "15000",
    sort: "nearest"
  });
  const [results, setResults] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [notifications, setNotifications] = useState(user.notifications || []);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("discover");
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchNearby = async (nextCoords = coords) => {
    const { data } = await api.get("/discover/nearby", {
      params: {
        lat: nextCoords.lat,
        lng: nextCoords.lng,
        ...filters
      }
    });
    setResults(data);
  };

  const fetchRecommendations = async () => {
    const { data } = await api.get("/discover/recommendations", {
      params: {
        interest: (user.interests || []).join(","),
        lat: coords.lat,
        lng: coords.lng
      }
    });
    setRecommendations(data);
  };

  const fetchNotifications = async () => {
    const { data } = await api.get("/users/notifications");
    setNotifications(data);
  };

  const fetchBookings = async () => {
    const { data } = await api.get("/bookings");
    setBookings(data);
  };

  useEffect(() => {
    fetchNearby();
    fetchRecommendations();
    fetchNotifications();
    fetchBookings();
    const pollId = setInterval(fetchNotifications, 15000);
    return () => clearInterval(pollId);
  }, []);

  useEffect(() => {
    fetchNearby();
  }, [filters]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setCoords(next);
        fetchNearby(next);
      },
      () => {}
    );
  }, []);

  const savePlace = async (item) => {
    await api.post("/users/saved", {
      placeId: item._id,
      placeType: item.entityType
    });
    onUserRefresh();
    fetchNotifications();
  };

  const createBooking = async (hotel) => {
    await api.post("/bookings", {
      hotelId: hotel._id,
      checkIn: new Date().toISOString().slice(0, 10),
      checkOut: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      guests: 2
    });
    fetchBookings();
    fetchNotifications();
  };

  const createItinerary = async (payload) => {
    await api.post("/users/itinerary", payload);
    onUserRefresh();
  };

  const savedCount = useMemo(() => user.savedPlaces?.length || 0, [user.savedPlaces]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-sky-500">Welcome back</p>
            <h1 className="text-2xl font-semibold">Hello, {user.name}</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Find nearby stays, food, and attractions around {coords.lat.toFixed(2)}, {coords.lng.toFixed(2)}.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button className="rounded-md border border-slate-200 p-2 dark:border-slate-700" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button className="rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-slate-700">
              Saved {savedCount}
            </button>
            <button className="rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-slate-700" onClick={onLogout}>
              <LogOut className="mr-2 inline h-4 w-4" /> Logout
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[280px_1fr]">
          <aside className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2 text-sm font-medium"><Compass className="h-4 w-4 text-sky-500" /> Explore</div>
              <div className="mt-4 grid gap-2">
                {[
                  ["discover", "Discover", MapPinned],
                  ["planner", "Planner", CalendarDays],
                  ["recs", "Recommendations", Sparkles],
                  ["alerts", "Notifications", Bell]
                ].map(([key, label, Icon]) => (
                  <button
                    key={key}
                    className={`flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm ${activeTab === key ? "bg-sky-500 text-white" : "text-slate-700 dark:text-slate-200"}`}
                    onClick={() => setActiveTab(key)}
                  >
                    <Icon className="h-4 w-4" /> {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-sm font-semibold">Search filters</h2>
              <div className="mt-4 space-y-3 text-sm">
                <select className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
                  <option value="all">All categories</option>
                  <option value="hotel">Hotels</option>
                  <option value="restaurant">Restaurants</option>
                  <option value="attraction">Attractions</option>
                  <option value="hidden-gem">Hidden gems</option>
                </select>
                <select className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950" value={filters.price} onChange={(e) => setFilters({ ...filters, price: e.target.value })}>
                  <option value="all">All prices</option>
                  <option value="budget">Budget</option>
                  <option value="mid">Mid</option>
                  <option value="premium">Premium</option>
                </select>
                <select className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950" value={filters.rating} onChange={(e) => setFilters({ ...filters, rating: e.target.value })}>
                  <option value="0">Any rating</option>
                  <option value="4">4.0+</option>
                  <option value="4.5">4.5+</option>
                </select>
                <select className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950" value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })}>
                  <option value="nearest">Nearest</option>
                  <option value="popularity">Popularity</option>
                  <option value="rating">Top rated</option>
                </select>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-sm font-semibold">Recent bookings</h2>
              <div className="mt-3 space-y-3">
                {bookings.slice(0, 3).map((booking) => {
                  const title = booking.hotel?.name || booking.guide?.name || booking.bus?.operatorName || booking.package?.title || `${(booking.bookingType || "travel").toUpperCase()} Booking`;
                  const getBookingDates = () => {
                    if (booking.bookingType === "hotel") {
                      const start = booking.checkIn ? new Date(booking.checkIn).toLocaleDateString() : "N/A";
                      const end = booking.checkOut ? new Date(booking.checkOut).toLocaleDateString() : "N/A";
                      return `${start} - ${end}`;
                    } else {
                      const day = booking.date ? new Date(booking.date).toLocaleDateString() : "N/A";
                      const duration = booking.durationDays ? ` (${booking.durationDays} days)` : "";
                      return `${day}${duration}`;
                    }
                  };
                  return (
                    <div key={booking._id} className="rounded-md bg-slate-50 p-3 text-sm dark:bg-slate-950">
                      <p className="font-medium">{title}</p>
                      <p className="text-slate-500">{getBookingDates()}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>

          <main className="space-y-6">
            {activeTab === "discover" && (
              <>
                <MapView center={coords} places={results} />
                {selectedItem && (
                  <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
                      <img src={selectedItem.images?.[0]} alt={selectedItem.name} className="h-60 w-full rounded-md object-cover" />
                      <div>
                        <h2 className="text-2xl font-semibold">{selectedItem.name}</h2>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{selectedItem.description}</p>
                        <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                          {(selectedItem.amenities || selectedItem.menuHighlights || selectedItem.tags || []).map((label) => (
                            <span key={label} className="rounded bg-slate-100 px-2 py-1 dark:bg-slate-800">{label}</span>
                          ))}
                        </div>
                        {selectedItem.bestTimeToVisit && <p className="mt-4 text-sm">Best time: {selectedItem.bestTimeToVisit}</p>}
                        {selectedItem.pricePerNight && <p className="mt-2 text-sm">Price per night: Rs. {selectedItem.pricePerNight}</p>}
                      </div>
                    </div>
                  </div>
                )}
                <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                  {results.map((item) => (
                    <PlaceCard key={item._id} item={item} onSave={savePlace} onBook={createBooking} onSelect={setSelectedItem} />
                  ))}
                </div>
              </>
            )}

            {activeTab === "planner" && (
              <ItineraryPlanner itineraries={user.itineraryPlans || []} onCreate={createItinerary} />
            )}

            {activeTab === "recs" && (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {recommendations.map((item) => (
                  <PlaceCard key={`${item.entityType}-${item._id}`} item={item} onSave={savePlace} onBook={createBooking} onSelect={setSelectedItem} />
                ))}
              </div>
            )}

            {activeTab === "alerts" && (
              <div className="space-y-3">
                {notifications.map((note) => (
                  <div key={note._id || note.createdAt} className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{note.title}</h3>
                      <span className="text-xs text-slate-500">{new Date(note.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{note.message}</p>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
